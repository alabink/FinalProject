const { BadUserRequestError, BadUser2RequestError } = require('../core/error.response');
const { verifyToken } = require('../services/tokenSevices');
const modelUser = require('../models/users.model');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const extractToken = (req) => {
    // Check for token in cookies
    const cookieToken = req.cookies?.token;
    
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) // Remove 'Bearer ' prefix
        : null;
    
    // Return the first available token
    return cookieToken || headerToken;
};

const authUser = async (req, res, next) => {
    try {
        // Extract token from cookies or headers
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Vui lòng đăng nhập',
                error: 'UNAUTHORIZED',
                code: 'AUTH_REQUIRED'
            });
        }
        
        // Verify the token
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth user error:', error);
        return res.status(401).json({ 
            message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
            error: 'UNAUTHORIZED',
            code: 'SESSION_EXPIRED'
        });
    }
};

const authAdmin = async (req, res, next) => {
    try {
        // Extract token from cookies or headers
        const token = extractToken(req);
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Vui lòng đăng nhập để tiếp tục',
                error: 'UNAUTHORIZED',
                code: 'AUTH_REQUIRED'
            });
        }
        
        const decoded = await verifyToken(token);
        const { id } = decoded;
        const findUser = await modelUser.findById(id);
        
        if (!findUser) {
            return res.status(401).json({ 
                message: 'Tài khoản không tồn tại',
                error: 'UNAUTHORIZED',
                code: 'USER_NOT_FOUND'
            });
        }
        
        if (findUser.isAdmin === false) {
            return res.status(403).json({ 
                message: 'Bạn không có quyền thực hiện thao tác này',
                error: 'FORBIDDEN',
                code: 'ADMIN_REQUIRED'
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth admin error:', error);
        return res.status(401).json({ 
            message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại',
            error: 'UNAUTHORIZED',
            code: 'SESSION_EXPIRED'
        });
    }
};

// Optional authentication middleware - will proceed even if no token is present
const optionalAuth = async (req, res, next) => {
    try {
        // Extract token from cookies or headers
        const token = extractToken(req);
        
        // If no token, continue without setting user
        if (!token) {
            return next();
        }
        
        // Try to verify the token
        try {
            const decoded = await verifyToken(token);
            req.user = decoded;
        } catch (error) {
            // If token verification fails, just continue without user
            console.warn('Invalid token in optionalAuth:', error.message);
        }
        
        next();
    } catch (error) {
        // Continue without user in case of any error
        console.error('Optional auth error:', error);
        next();
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
    optionalAuth,
    extractToken
};
