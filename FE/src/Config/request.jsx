import axios from 'axios';

import cookies from 'js-cookie';

// Use the environment variable if present, otherwise default to local backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://techify.asia:3000';

const request = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Flag to track if token refresh is in progress
let isRefreshing = false;
// Store pending requests to retry after token refresh
let pendingRequests = [];

// Interceptor to add token to every request
request.interceptors.request.use(
    (config) => {
        // Check for token
        const token = cookies.get('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle response errors
request.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If error is 401 Unauthorized and not a retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            // If not already refreshing token
            if (!isRefreshing) {
                isRefreshing = true;
                originalRequest._retry = true;
                
                try {
                    // Try to refresh token
                    const response = await axios.get(`${API_URL}/api/refresh-token`, {
                        withCredentials: true
                    });
                    
                    if (response.status === 200) {
                        // Token refreshed successfully
                        const newToken = cookies.get('token');
                        
                        // Resolve all pending requests
                        pendingRequests.forEach(cb => cb(newToken));
                        pendingRequests = [];
                        
                        // Retry original request
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    // Failed to refresh token
                    console.error('Failed to refresh token:', refreshError);
                    
                    // Reject all pending requests
                    pendingRequests.forEach(cb => cb(null));
                    pendingRequests = [];
                    
                    // For recommendation-related endpoints, don't redirect
                    if (originalRequest.url.includes('/recommendations/') || 
                        originalRequest.url.includes('/track-interaction') ||
                        originalRequest.url.includes('/popular-products')) {
                        return Promise.reject(error);
                    }
                    
                    // Redirect to login for other endpoints
                    window.location.href = '/login';
                    return Promise.reject(error);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // If already refreshing, wait for it to complete
                return new Promise((resolve, reject) => {
                    pendingRequests.push((token) => {
                        if (token) {
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            resolve(axios(originalRequest));
                        } else {
                            reject(error);
                        }
                    });
                });
            }
        }
        
        return Promise.reject(error);
    }
);

export const requestForgotPassword = async (data) => {
    try {
        const res = await request.post('/api/forgot-password', data);
        return res.data;
    } catch (error) {
        console.error('Error in forgot password request:', error);
        
        // Customize error message based on status code
        if (error.response) {
            if (error.response.status === 500) {
                throw new Error('Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.');
            } else {
                // Use server error message if available
                throw new Error(error.response.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
            }
        } else if (error.request) {
            // Network error
            throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    }
};

export const requestResetPassword = async (data) => {
    try {
        const res = await request.post('/api/reset-password', data);
        return res.data;
    } catch (error) {
        console.error('Error in reset password request:', error);
        
        // Customize error message based on status code
        if (error.response) {
            if (error.response.status === 500) {
                throw new Error('Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.');
            } else {
                // Use server error message if available
                throw new Error(error.response.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
            }
        } else if (error.request) {
            // Network error
            throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
            throw new Error('Có lỗi xảy ra. Vui lòng thử lại!');
        }
    }
};
export const requestCreateComment = async (data) => {
    const res = await request.post('/api/create-comment', data);
    return res.data;
};

export const requestUpdateUser = async (data) => {
    const res = await request.post('/api/update-user', data);
    return res.data;
};

export const requestApplyCoupon = async (data) => {
    try {
    const res = await request.post('/api/apply-coupon', data);
    return res.data;
    } catch (error) {
        console.error('Error applying coupon:', error);
        throw error;
    }
};

export const requestAdmin = async () => {
    const res = await request.get('/admin');
    return res.data;
};

export const requestAskQuestion = async (data) => {
    const res = await request.post('/api/chat', data);
    return res.data;
};

export const requestRegister = async (data) => {
    const res = await request.post('/api/register', data);
    return res.data;
};

export const requestLogin = async (data) => {
    const res = await request.post('/api/login', data);
    return res.data;
};

export const requestAuth = async () => {
    const res = await request.get('/api/auth');
    return res.data;
};

export const requestLogout = async () => {
    const res = await request.get('/api/logout');
    return res.data;
};

export const requestRefreshToken = async () => {
    const res = await request.get('/api/refresh-token');
    return res.data;
};

export const requestUploadImage = async (data) => {
    const res = await request.post('/api/upload-image', data);
    return res.data;
};

export const requestGetAdminStats = async (period = 'week') => {
    const res = await request.get('/api/get-admin-stats', { params: { period } });
    return res.data;
};

export const requestGetAllUser = async () => {
    const res = await request.get('/api/get-all-users');
    return res.data;
};

export const requestToggleBlockUser = async (data) => {
    const res = await request.post('/api/toggle-block-user', data);
    return res.data;
};

export const requestDeleteUser = async (data) => {
    const res = await request.post('/api/delete-user', data);
    return res.data;
};

export const requestUpdateInfoUser = async (data) => {
    const res = await request.post('/api/update-info-user', data);
    return res.data;
};

export const requestLoginGoogle = async (data) => {
    const res = await request.post('/api/login-google', { credential: data });
    return res.data;
};

export const requestUpdatePassword = async (data) => {
    const res = await request.post('/api/update-password', data);
    return res.data;
};

export const requestAddProduct = async (data) => {
    const res = await request.post('/api/add-product', data);
    return res.data;
};

export const requestUpdateStatusOrder = async (data) => {
    const res = await request.post('/api/update-status-order', data);
    return res.data;
};

export const requestGetAllProduct = async () => {
    const res = await request.get('/api/all-product');
    return res.data;
};

export const requestEditProduct = async (data) => {
    const res = await request.post('/api/edit-product', data);
    return res.data;
};

export const requestDeleteProduct = async (id) => {
    const res = await request.delete('/api/delete-product', { params: { id } });
    return res.data;
};

export const requestSearchProduct = async (keyword) => {
    const res = await request.get('/api/search-product', { params: { keyword } });
    return res.data;
};

export const requestGetProducts = async (limit = 8) => {
    const res = await request.get('/api/products', { params: { limit } });
    return res.data;
};

export const requestGetProductById = async (id) => {
    const res = await request.get(`/api/product`, { params: { id } });
    return res.data;
};

export const requestFilterProduct = async (params = {}) => {
    const res = await request.get('/api/filter-product', { params });
    return res.data;
};

export const requestAddToCart = async (data) => {
    const res = await request.post('/api/add-to-cart', data);
    return res.data;
};

export const requestGetCart = async () => {
    const res = await request.get('/api/get-cart');
    return res.data;
};

export const requestDeleteCart = async (productId) => {
    const res = await request.delete('/api/delete-cart', { params: { productId } });
    return res.data;
};

export const requestUpdateCartQuantity = async (data) => {
    const res = await request.post('/api/update-cart-quantity', data);
    return res.data;
};

export const requestUpdateInfoUserCart = async (data) => {
    const res = await request.post('/api/update-info-user-cart', data);
    return res.data;
};

export const requestPayment = async (typePayment) => {
    const res = await request.post('/api/payment', { typePayment });
    return res.data;
};

export const requestGetHistoryOrder = async () => {
    const res = await request.get('/api/get-history-order');
    return res.data;
};

export const requestGetOnePayment = async (id) => {
    try {
        if (!id) {
            console.error('Missing payment ID');
            return { metadata: null };
        }
        
        const res = await request.get('/api/get-one-payment', { 
            params: { id },
            timeout: 10000 // 10 seconds timeout
        });
        
    return res.data;
    } catch (error) {
        console.error('Error fetching payment:', error);
        return { metadata: null };
    }
};

export const requestGetOrderAdmin = async () => {
    const res = await request.get('/api/get-order-admin');
    return res.data;
};

export const requestCreateCategory = async (data) => {
    const res = await request.post('/api/create-category', data);
    return res.data;
};

export const requestGetAllCategory = async () => {
    const res = await request.get('/api/get-all-category');
    return res.data;
};

export const requestDeleteCategory = async (id) => {
    const res = await request.delete('/api/delete-category', { params: { id } });
    return res.data;
};

export const requestUpdateCategory = async (data) => {
    const res = await request.post('/api/update-category', data);
    return res.data;
};

export const requestCreateCoupon = async (data) => {
    const res = await request.post('/api/create-coupon', data);
    return res.data;
};

export const requestGetAllCoupon = async () => {
    const res = await request.get('/api/coupons');
    return res.data;
};

export const requestDeleteCoupon = async (id) => {
    const res = await request.delete('/api/delete-coupon', { params: { id } });
    return res.data;
};

export const requestUpdateCoupon = async (data) => {
    const res = await request.post('/api/update-coupon', data);
    return res.data;
};

export const requestCancelOrder = async (data) => {
    const res = await request.post('/api/cancel-order', data);
    return res.data;
};

export const requestCreateProductPreview = async (data) => {
    const res = await request.post('/api/create-product-preview', data);
    return res.data;
};

export const requestTrackInteraction = async (data) => {
    const res = await request.post('/api/track-interaction', data);
    return res.data;
};

export const requestGetRecommendations = async (userId, limit = 8, method = 'hybrid') => {
    const res = await request.get(`/api/recommendations/${userId}`, { params: { limit, method } });
    return res.data;
};

export const requestGetPopularProducts = async (limit = 8) => {
    const res = await request.get('/api/popular-products', { params: { limit } });
    return res.data;
};

export default request;
