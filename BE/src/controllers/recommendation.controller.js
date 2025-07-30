const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const UserInteraction = require('../models/userInteraction.model');
const Product = require('../models/products.model');
const Payment = require('../models/payments.model');
const mongoose = require('mongoose');

class RecommendationController {
    // Track a user interaction with a product
    async trackInteraction(req, res) {
        try {
            const { userId, productId, type } = req.body;
            
            // Validate inputs
            if (!userId || !productId || !type) {
                throw new BadRequestError('Missing required fields');
            }
            
            // Check if productId is valid
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                throw new BadRequestError('Invalid product ID');
            }
            
            // Validate interaction type
            const validTypes = ['click', 'view', 'favorite', 'purchase'];
            if (!validTypes.includes(type)) {
                throw new BadRequestError('Invalid interaction type');
            }
            
            // Find or create interaction document
            let interaction = await UserInteraction.findOne({ userId, productId });
            
            if (!interaction) {
                interaction = new UserInteraction({ userId, productId });
            }
            
            // Increment the appropriate counter
            interaction[type] += 1;
            interaction.timestamp = new Date();
            
            // Save the interaction
            await interaction.save();
            
            return new OK({
                message: 'Interaction tracked successfully',
                metadata: { interaction }
            }).send(res);
        } catch (error) {
            console.error(`Error tracking interaction: ${error.message}`);
            // Return a success response anyway to avoid disrupting the user experience
            return new OK({
                message: 'Interaction processed',
                metadata: { success: false, error: error.message }
            }).send(res);
        }
    }
    
    // Get personalized recommendations for a user
    async getRecommendations(req, res) {
        console.time(`getRecommendations-${req.params.userId}`);
        console.log(`--> [GET /recommendations] userId=${req.params.userId} | authUser=${req.user ? req.user.id : 'none'}`);
        try {
            const { userId } = req.params;
            const { limit = 8 } = req.query;
            // Always use hybrid method
            const method = 'hybrid';
            
            // Validate inputs
            if (!userId) {
                throw new BadRequestError('User ID is required');
            }
            
            // Check if the requested user ID matches the authenticated user
            // If not, fall back to popular products unless the user is an admin
            if (req.user) {
                const requestedUserId = userId;
                const authenticatedUserId = req.user.id;
                const isAdmin = req.user.isAdmin;
                
                if (requestedUserId !== authenticatedUserId && !isAdmin) {
                    console.warn(`User ${authenticatedUserId} attempted to access recommendations for ${requestedUserId}`);
                    return await this.getPopularProducts(req, res);
                }
            } else {
                // No authenticated user, fall back to popular products
                console.log('No authenticated user, falling back to popular products');
                return await this.getPopularProducts(req, res);
            }
            
            // Convert limit to number
            const numLimit = parseInt(limit, 10);
            if (isNaN(numLimit) || numLimit <= 0) {
                throw new BadRequestError('Limit must be a positive number');
            }
            
            // Check if user has interactions
            const userInteractions = await UserInteraction.find({ userId });
            
            // If user has no interactions but is logged in, return a mix of popular and random products
            // This ensures they still get a personalized-looking recommendation section
            if (!userInteractions || userInteractions.length === 0) {
                console.log(`User ${userId} has no interactions yet, providing starter recommendations`);
                
                try {
                    // Get user's purchased products to exclude
                    const purchasedProducts = await this.getUserPurchasedProducts(userId);
                    const purchasedSet = new Set(purchasedProducts);
                    
                    // Get popular products, excluding purchased ones
                    let popularProducts = await this.getPopularProductsData(numLimit, purchasedProducts);
                    
                    // Get some random products to mix in
                    let allProducts = await Product.find({}).limit(100);
                    allProducts = allProducts.filter(product => 
                        !purchasedSet.has(product._id.toString())
                    );
                    const shuffledProducts = allProducts.sort(() => 0.5 - Math.random());
                    const randomProducts = shuffledProducts.slice(0, Math.ceil(numLimit / 2));
                    
                    // Combine and shuffle again to create a mixed set
                    const mixedProducts = [...popularProducts, ...randomProducts]
                        .sort(() => 0.5 - Math.random())
                        .slice(0, numLimit);
                    
                    // Return these as "personalized recommendations" for new users
                    return new OK({
                        message: 'Recommendations retrieved for new user',
                        metadata: {
                            products: mixedProducts,
                            method: 'hybrid',
                            isPersonalized: true  // Mark as personalized for UI purposes
                        }
                    }).send(res);
                } catch (err) {
                    console.error(`Error creating starter recommendations: ${err.message}`);
                    return await this.getPopularProducts(req, res);
                }
            }
            
            try {
                // Create temporary files for Python script
                const tempDir = path.join(__dirname, '../..', 'temp');
                
                // Ensure temp directory exists
                try {
                    await fs.mkdir(tempDir, { recursive: true });
                } catch (err) {
                    if (err.code !== 'EEXIST') {
                        console.error(`Error creating temp directory: ${err.message}`);
                        // Fall back to popular products
                        return await this.getPopularProducts(req, res);
                    }
                }
                
                const interactionsFile = path.join(tempDir, `interactions_${userId}_${Date.now()}.json`);
                
                // Get all user interactions
                // Limit the number of interactions loaded to improve performance (configurable via env)
                const interactionLimit = parseInt(process.env.RECOMMENDATION_INTERACTION_LIMIT || '20000', 10);
                const allInteractions = await UserInteraction.find({}).limit(interactionLimit);
                
                // Convert MongoDB documents to plain objects
                const interactionsData = allInteractions.map(interaction => ({
                    userId: interaction.userId.toString(),
                    productId: interaction.productId.toString(),
                    click: interaction.click || 0,
                    view: interaction.view || 0,
                    favorite: interaction.favorite || 0,
                    purchase: interaction.purchase || 0,
                    timestamp: interaction.timestamp || new Date()
                }));
                
                // Write interactions to file
                await fs.writeFile(interactionsFile, JSON.stringify(interactionsData));
                
                // Get user's purchased products to exclude from recommendations
                const purchasedProducts = await this.getUserPurchasedProducts(userId);
                let purchasedProductsFile = null;
                
                if (purchasedProducts.length > 0) {
                    purchasedProductsFile = path.join(tempDir, `purchased_${userId}_${Date.now()}.json`);
                    await fs.writeFile(purchasedProductsFile, JSON.stringify(purchasedProducts));
                    console.log(`Excluding ${purchasedProducts.length} purchased products from recommendations`);
                }
                
                // Check if Python script exists
                const pythonScriptPath = path.join(__dirname, '../utils/recommendation_engine.py');
                try {
                    await fs.access(pythonScriptPath);
                } catch (err) {
                    console.error(`Python script not found: ${err.message}`);
                    // Fall back to popular products
                    return await this.getPopularProducts(req, res);
                }
                
                // Prepare Python process arguments
                const pythonArgs = [
                    pythonScriptPath,
                    interactionsFile,
                    userId,
                    numLimit.toString(),
                    method
                ];
                
                // Add purchased products file if available
                if (purchasedProductsFile) {
                    pythonArgs.push(purchasedProductsFile);
                }
                
                // Spawn Python process
                const pythonProcess = spawn('python', pythonArgs);
                
                let recommendationData = '';
                let errorData = '';
                
                // Collect data from Python script
                pythonProcess.stdout.on('data', (data) => {
                    recommendationData += data.toString();
                });
                
                pythonProcess.stderr.on('data', (data) => {
                    errorData += data.toString();
                });
                
                // Handle Python process completion
                const recommendedProductIds = await new Promise((resolve, reject) => {
                    // Set a timeout to prevent hanging
                    const pythonTimeout = parseInt(process.env.PYTHON_RECOMMENDATION_TIMEOUT_MS || '30000', 10);
                    const timeout = setTimeout(() => {
                        console.error('Python process timed out');
                        pythonProcess.kill();
                        resolve([]);
                    }, pythonTimeout); // configurable timeout (default 30s)
                    
                    pythonProcess.on('close', (code) => {
                        clearTimeout(timeout);
                        
                        // Clean up temporary files
                        const cleanupPromises = [fs.unlink(interactionsFile).catch(err => console.error(`Failed to delete interactions file: ${err.message}`))];
                        if (purchasedProductsFile) {
                            cleanupPromises.push(fs.unlink(purchasedProductsFile).catch(err => console.error(`Failed to delete purchased products file: ${err.message}`)));
                        }
                        Promise.all(cleanupPromises);
                        
                        if (code !== 0) {
                            console.error(`Python process exited with code ${code}`);
                            console.error(`Error: ${errorData}`);
                            // Fall back to popular products
                            resolve([]);
                        } else {
                            try {
                                // Python script may output log lines before the JSON array.
                                // Find the first '[' or '{' and parse from there.
                                const trimmed = recommendationData.trim();
                                const startIdx = Math.min(
                                    ...['[', '{']
                                        .map(ch => {
                                            const idx = trimmed.indexOf(ch);
                                            return idx === -1 ? Infinity : idx;
                                        })
                                );
                                if (startIdx === Infinity) {
                                    throw new Error('No JSON start character found');
                                }
                                const jsonString = trimmed.substring(startIdx);
                                const recommendations = JSON.parse(jsonString);
                                resolve(recommendations);
                            } catch (err) {
                                console.error(`Failed to parse Python output: ${err.message}`);
                                resolve([]);
                            }
                        }
                    });
                    
                    pythonProcess.on('error', (err) => {
                        clearTimeout(timeout);
                        console.error(`Failed to start Python process: ${err.message}`);
                        resolve([]);
                    });
                });
                
                // If no recommendations from Python, get popular products
                if (!recommendedProductIds || recommendedProductIds.length === 0) {
                    return await this.getPopularProducts(req, res);
                }
                
                // Get product details for recommended products
                const recommendedProducts = await Product.find({
                    _id: { $in: recommendedProductIds }
                }).populate('category').lean();
                
                // Sort products in the same order as the recommendations
                const sortedProducts = recommendedProductIds
                    .map(id => {
                        try {
                            return recommendedProducts.find(product => 
                                product._id.toString() === id
                            );
                        } catch (err) {
                            return null;
                        }
                    })
                    .filter(Boolean);
                
                // If we couldn't find any products, fall back to popular products
                if (sortedProducts.length === 0) {
                    return await this.getPopularProducts(req, res);
                }
                
                // Sanitize products to plain JSON-safe objects
                const safeProducts = JSON.parse(JSON.stringify(sortedProducts));

                // Return recommendations
                const result = new OK({
                    message: `Personalized recommendations retrieved successfully`,
                    metadata: {
                        products: safeProducts,
                        method: method,
                        isPersonalized: true  // Always mark as personalized if we have recommendations
                    }
                });
                console.log(`<-- [GET /recommendations] success, returning ${sortedProducts.length} personalized products using hybrid method`);
                console.timeEnd(`getRecommendations-${req.params.userId}`);
                return result.send(res);
            } catch (error) {
                console.error(`Error in Python recommendation process: ${error.message}`);
                // Fall back to popular products
                return await this.getPopularProducts(req, res);
            }
            
        } catch (error) {
            console.error(`Error getting recommendations: ${error.message}`);
            console.timeEnd(`getRecommendations-${req.params.userId}`);
            // Fall back to popular products
            return await this.getPopularProducts(req, res);
        }
    }
    
    // Helper method to get user's purchased products
    async getUserPurchasedProducts(userId) {
        try {
            // Get all completed orders for the user
            const completedOrders = await Payment.find({
                userId: userId,
                statusOrder: { $in: ['completed', 'delivered'] }
            });
            
            // Extract unique product IDs from completed orders
            const purchasedProductIds = new Set();
            
            completedOrders.forEach(order => {
                order.products.forEach(product => {
                    if (product.productId && !product.productDeleted) {
                        purchasedProductIds.add(product.productId);
                    }
                });
            });
            
            return Array.from(purchasedProductIds);
        } catch (error) {
            console.error(`Error getting user purchased products: ${error.message}`);
            return [];
        }
    }
    
    // Helper method to get popular products data without sending response
    async getPopularProductsData(limit = 8, excludeProductIds = []) {
        try {
            // Build aggregation pipeline
            const pipeline = [
                { $group: { _id: '$productId', totalInteractions: { $sum: { $add: ['$click', '$view', '$favorite', '$purchase'] } } } },
                { $sort: { totalInteractions: -1 } }
            ];
            
            // Add limit after potential filtering
            pipeline.push({ $limit: parseInt(limit, 10) });
            
            // Get products with most interactions
            const popularProductIds = await UserInteraction.aggregate(pipeline);
            
            // Extract product IDs
            const productIds = popularProductIds.map(item => item._id);
            
            // Build query to get product details
            const productQuery = { _id: { $in: productIds } };
            
            // Exclude specific product IDs if provided
            if (excludeProductIds && excludeProductIds.length > 0) {
                productQuery._id = { 
                    $in: productIds,
                    $nin: excludeProductIds.map(id => new mongoose.Types.ObjectId(id))
                };
            }
            
            // Get product details
            const products = await Product.find(productQuery).populate('category').lean();
            
            // Sort products by interaction count
            const sortedProducts = productIds
                .map(id => products.find(product => product._id.equals(id)))
                .filter(Boolean);
            
            return sortedProducts;
        } catch (error) {
            console.error(`Error getting popular products data: ${error.message}`);
            return [];
        }
    }

    // Get popular products (fallback if personalized recommendations aren't available)
    async getPopularProducts(req, res) {
        try {
            const { limit = 8 } = req.query;
            const numLimit = parseInt(limit, 10);
            
            // Get user ID if available
            const userId = req.params.userId || req.user?.id;
            
            // Get user's purchased products to exclude
            let purchasedProducts = [];
            if (userId) {
                try {
                    purchasedProducts = await this.getUserPurchasedProducts(userId);
                } catch (error) {
                    console.error(`Error getting purchased products: ${error.message}`);
                }
            }
            
            // Get popular products, excluding purchased ones
            let popularProducts = await this.getPopularProductsData(numLimit * 2, purchasedProducts); // Get more to account for filtering
            
            if (purchasedProducts.length > 0) {
                console.log(`Excluded ${purchasedProducts.length} purchased products from popular recommendations`);
            }
            
            // Limit to requested number
            popularProducts = popularProducts.slice(0, numLimit);
            
            // If no popular products found, get random products
            if (!popularProducts || popularProducts.length === 0) {
                return await this.getRandomProducts(req, res, numLimit);
            }
            
            const safePopular = JSON.parse(JSON.stringify(popularProducts));
            return new OK({
                message: 'Popular products retrieved successfully',
                metadata: {
                    products: safePopular,
                    method: 'popular'
                }
            }).send(res);
        } catch (error) {
            console.error(`Error getting popular products: ${error.message}`);
            return await this.getRandomProducts(req, res);
        }
    }
    
    // Get random products as a last resort fallback
    async getRandomProducts(req, res, limit = 8) {
        try {
            // Get user ID if available
            const userId = req.params.userId || req.user?.id;
            
            // Get more products to account for filtering
            let randomProducts = await Product.find()
                .populate('category')
                .lean()
                .limit(limit * 2)
                .sort({ createdAt: -1 });
            
            // If user is logged in, filter out purchased products
            if (userId) {
                try {
                    const purchasedProducts = await this.getUserPurchasedProducts(userId);
                    if (purchasedProducts.length > 0) {
                        const purchasedSet = new Set(purchasedProducts);
                        randomProducts = randomProducts.filter(product => 
                            !purchasedSet.has(product._id.toString())
                        );
                        console.log(`Filtered out ${purchasedProducts.length} purchased products from random recommendations`);
                    }
                } catch (error) {
                    console.error(`Error filtering purchased products from random: ${error.message}`);
                }
            }
            
            // Limit to requested number
            randomProducts = randomProducts.slice(0, limit);
            
            const safeRandom = JSON.parse(JSON.stringify(randomProducts));
            return new OK({
                message: 'Random products retrieved successfully',
                metadata: {
                    products: safeRandom,
                    method: 'random'
                }
            }).send(res);
        } catch (error) {
            console.error(`Error getting random products: ${error.message}`);
            // Return empty array as absolute last resort
            return new OK({
                message: 'No products available',
                metadata: {
                    products: [],
                    method: 'none'
                }
            }).send(res);
        }
    }
}

module.exports = new RecommendationController(); 