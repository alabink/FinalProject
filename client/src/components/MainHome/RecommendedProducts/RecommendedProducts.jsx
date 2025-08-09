import React, { useEffect, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './RecommendedProducts.module.scss';
import CardBody from '../../CardBody/CardBody';
import { Link } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { requestGetRecommendations, requestGetPopularProducts, requestTrackInteraction, requestGetProducts } from '../../../Config/request';
import { Spin, Empty, message } from 'antd';
import { FireOutlined, UserOutlined, RobotOutlined, HeartOutlined, StarOutlined } from '@ant-design/icons';
// Import Swiper for slider when many products
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import cookies from 'js-cookie';

const cx = classNames.bind(styles);

const GRID_LIMIT = 4; // Max products before switching to slider

function RecommendedProducts() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [isFallback, setIsFallback] = useState(false);
    // Track whether the current list is really personalised or just a generic fallback
    const [isPersonalized, setIsPersonalized] = useState(false);
    // Always use hybrid method - no need to let users choose
    const recommendationMethod = 'hybrid';
    const { dataUser } = useStore();
    
    // NEW: detect if authentication token exists
    const hasToken = Boolean(cookies.get('logged'));
    // Determine if user is logged in immediately
    const isLoggedIn = Boolean(dataUser && dataUser._id);
    // NEW: track whether we have definitively determined auth status yet
    const isAuthLoading = hasToken && !isLoggedIn;
    
    // Function to get random products for non-logged in users (default 8)
    const getRandomProducts = useCallback(async (limit = 8) => {
        try {
            // Get all products
            const response = await requestGetProducts(40); // Larger pool for randomness
            if (response && response.metadata && Array.isArray(response.metadata) && response.metadata.length > 0) {
                // Filter out duplicate products by ID
                const uniqueProducts = [];
                const productIds = new Set();
                
                response.metadata.forEach(product => {
                    if (product._id && !productIds.has(product._id)) {
                        productIds.add(product._id);
                        uniqueProducts.push(product);
                    }
                });
                
                // Shuffle the unique products array
                const shuffled = [...uniqueProducts].sort(() => 0.5 - Math.random());
                // Get first 'limit' elements
                return shuffled.slice(0, limit);
            }
            return [];
        } catch (err) {
            console.error('Failed to get random products:', err);
            return [];
        }
    }, []);
    
    // Fallback function to get any products when all else fails
    const getFallbackProducts = useCallback(async () => {
        try {
            // Try to get regular products as last resort
            const response = await requestGetProducts(8);
            if (response && response.metadata && Array.isArray(response.metadata)) {
                // Filter out duplicate products
                const uniqueProducts = [];
                const productIds = new Set();
                
                response.metadata.forEach(product => {
                    if (product._id && !productIds.has(product._id)) {
                        productIds.add(product._id);
                        uniqueProducts.push(product);
                    }
                });
                
                setProducts(uniqueProducts);
            } else {
                setProducts([]);
            }
            setIsFallback(true);
            setIsPersonalized(false); // Fallback is generic
        } catch (err) {
            console.error('Even fallback products failed:', err);
            setProducts([]);
            setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Function to fetch recommendations with the hybrid method
    const fetchRecommendations = useCallback(async () => {
            // NEW: Wait until auth status resolved
            if (isAuthLoading) {
                // Do not fetch until we know whether user is logged in or not
                return;
            }
            try {
                setLoading(true);
                setError(null);
                setIsFallback(false);
                
                if (isLoggedIn) {
                    // LOGGED IN USER: Get personalized recommendations
                    try {
                    // Try to get personalized recommendations for logged in users with hybrid method
                    const response = await requestGetRecommendations(dataUser._id, 8, 'hybrid');
                    
                    if (response && response.metadata && response.metadata.products && 
                        Array.isArray(response.metadata.products) && response.metadata.products.length > 0) {
                        
                            // Filter out duplicate products
                            const uniqueProducts = [];
                            const productIds = new Set();
                            
                        response.metadata.products.forEach(product => {
                                if (product._id && !productIds.has(product._id)) {
                                    productIds.add(product._id);
                                    uniqueProducts.push(product);
                                }
                            });
                            
                            setProducts(uniqueProducts);
                        
                        // Check if the response contains method information
                        const responseMethod = response.metadata.method || 'unknown';
                        
                        // Only mark as personalized if not using popular or random method
                        const isPersonalMethod = !['popular', 'random'].includes(responseMethod);
                        
                        // Force personalization to true if user is logged in and has enough interactions
                        setIsPersonalized(isPersonalMethod || (isLoggedIn && uniqueProducts.length > 0));
                        
                            setLoading(false);
                            return;
                        } else {
                            // Empty response, try fallback
                            throw new Error('Empty personalized recommendations');
                        }
                    } catch (err) {
                        console.error('Failed to fetch personalized recommendations:', err);
                        // Check if it's an authentication error
                        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                            console.log('Authentication error, falling back to popular products');
                        }
                        
                        // Fallback to popular products but still show as personalized for logged in users
                        try {
                            const response = await requestGetPopularProducts(8);
                        
                        if (response && response.metadata && response.metadata.products && 
                            Array.isArray(response.metadata.products) && response.metadata.products.length > 0) {
                            
                                // Filter out duplicate products
                                const uniqueProducts = [];
                                const productIds = new Set();
                                
                            response.metadata.products.forEach(product => {
                                    if (product._id && !productIds.has(product._id)) {
                                        productIds.add(product._id);
                                        uniqueProducts.push(product);
                                    }
                                });
                                
                                setProducts(uniqueProducts);
                            // Show personalized UI for logged in users even with fallback products
                            setIsPersonalized(isLoggedIn); 
                                setLoading(false);
                                return;
                            } else {
                                // Empty response, try final fallback
                                throw new Error('Empty popular products');
                            }
                        } catch (popularErr) {
                            console.error('Failed to fetch popular products:', popularErr);
                            // Final fallback
                            setIsPersonalized(false);
                            return getFallbackProducts();
                        }
                    }
                } else {
                    // NOT LOGGED IN: Get random products
                    try {
                        const randomProducts = await getRandomProducts(8);
                        if (randomProducts.length > 0) {
                            setProducts(randomProducts);
                            setIsPersonalized(false);
                            setLoading(false);
                            return;
                        } else {
                            // Empty response, try fallback
                            throw new Error('Empty random products');
                        }
                    } catch (randomErr) {
                        console.error('Failed to fetch random products:', randomErr);
                        // Final fallback
                        setIsPersonalized(false);
                        return getFallbackProducts();
                    }
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
                // Final fallback
                setIsPersonalized(false);
                return getFallbackProducts();
            }
    }, [dataUser, getFallbackProducts, isLoggedIn, getRandomProducts, isAuthLoading]);
    
    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);
    
    const handleProductClick = async (productId) => {
        // Track click interaction if user is logged in
        if (isLoggedIn) {
            try {
                await requestTrackInteraction({
                    userId: dataUser._id,
                    productId,
                    type: 'click'
                });
                
                // No need to refetch recommendations here - they'll update naturally on next page load
                // This allows the recommendation system to learn from clicks without immediate refresh
            } catch (error) {
                // Check if it's an authentication error
                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.log('Authentication error when tracking interaction');
                    // Don't show error to user for auth failures
                } else {
                    console.error('Failed to track interaction:', error);
                }
            }
        }
    };

    // If there's an error and no products, don't render the component
    if (error && products.length === 0) {
        return null;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('header')}>
                    <div className={cx('title')}>
                        {isPersonalized ? (
                            <>
                                <RobotOutlined className={cx('icon', 'personalized')} />
                                <h2>Gợi ý dành cho bạn</h2>
                            </>
                        ) : (
                            <>
                                <FireOutlined className={cx('icon', 'popular')} />
                                <h2>Sản phẩm nổi bật</h2>
                            </>
                        )}
                    </div>
                </div>

                {loading || isAuthLoading ? (
                    <div className={cx('loading')}>
                        <Spin size="large" tip={isPersonalized ? "Đang tải gợi ý dành cho bạn..." : "Đang tải sản phẩm nổi bật..."} />
                    </div>
                ) : products.length > 0 ? (
                    products.length > GRID_LIMIT ? (
                        <div className={cx('products-slider')}>
                            <Swiper
                                slidesPerView={4}
                                spaceBetween={20}
                                loop={false}
                                breakpoints={{
                                    0: { slidesPerView: 1.3, spaceBetween: 12 },
                                    480: { slidesPerView: 2.2, spaceBetween: 16 },
                                    768: { slidesPerView: 3, spaceBetween: 18 },
                                    1024: { slidesPerView: 4, spaceBetween: 20 },
                                }}
                            >
                                {products.map((product) => (
                                    <SwiperSlide key={product._id}>
                                        <div
                                            className={cx('product-item')}
                                            onClick={() => handleProductClick(product._id)}
                                        >
                                            <CardBody item={product} />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    ) : (
                        <div className={cx('products-grid')}>
                            {products.map((product) => (
                                <div
                                    key={product._id}
                                    className={cx('product-item')}
                                    onClick={() => handleProductClick(product._id)}
                                >
                                    <CardBody item={product} />
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <div className={cx('empty')}>
                        <Empty description={error || (isLoggedIn ? "Không tìm thấy gợi ý phù hợp" : "Không tìm thấy sản phẩm nổi bật")} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecommendedProducts; 