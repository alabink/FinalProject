import Context from './Context';
import CryptoJS from 'crypto-js';

import cookies from 'js-cookie';

import { useEffect, useState } from 'react';
import { requestAuth, requestGetAllCategory, requestGetCart, requestLogout, requestDeleteCart } from '../Config/request';
import SuccessProgress from '../components/ProgressSuccess/SuccessProgress';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});

    const [dataCategory, setDataCategory] = useState([]);
    const [dataCart, setDataCart] = useState([]);
    const [dataWishlist, setDataWishlist] = useState([]);
    
    // Success Progress state
    const [successProgress, setSuccessProgress] = useState({
        isVisible: false,
        type: '',
        message: '',
        duration: 3000,
    });

    const fetchAuth = async () => {
        const res = await requestAuth();
        const bytes = CryptoJS.AES.decrypt(res.metadata.auth, import.meta.env.VITE_SECRET_CRYPTO);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        const user = JSON.parse(originalText);
        setDataUser(user);
    };

    const fetchCategory = async () => {
        const res = await requestGetAllCategory();
        setDataCategory(res.metadata);
    };

    const fetchCart = async () => {
        const res = await requestGetCart();
        setDataCart(res.metadata);
    };

    // Success Progress functions
    const showSuccessProgress = (type, message = '', duration = 3000) => {
        setSuccessProgress({
            isVisible: true,
            type,
            message,
            duration,
        });
    };

    const hideSuccessProgress = () => {
        setSuccessProgress(prev => ({
            ...prev,
            isVisible: false,
        }));
    };

    // Helper functions for update notifications
    const showUpdateSuccess = (message = 'Cập nhật thành công') => {
        showSuccessProgress('update_success', message);
    };

    const showUpdateFailure = (message = 'Cập nhật thất bại') => {
        showSuccessProgress('update_failure', message);
    };

    // Wishlist functions
    const addToWishlist = (product, variant = null) => {
        // Kiểm tra xem sản phẩm có variants không và yêu cầu người dùng chọn variant
        if (product.variants && product.variants.length > 0 && !variant) {
            showSuccessProgress('update_failure', 'Vui lòng chọn màu sắc và phiên bản trước khi thêm vào yêu thích');
            return;
        }

        // Tạo productId độc nhất kết hợp giữa id sản phẩm và id variant (nếu có)
        const uniqueId = variant ? `${product._id}_${variant._id}` : product._id;
        
        // Kiểm tra xem sản phẩm với cùng variant đã có trong wishlist chưa
        const isExist = dataWishlist.find(item => {
            const itemId = item.variant ? `${item._id}_${item.variant._id}` : item._id;
            return itemId === uniqueId;
        });
        
        if (isExist) {
            showSuccessProgress('update_failure', 'Sản phẩm đã có trong danh sách yêu thích');
            return;
        }
        
        // Lưu thông tin variant đã chọn một cách chi tiết
        let variantToSave = null;
        if (variant) {
            variantToSave = {
                _id: variant._id,
                sku: variant.sku,
                price: variant.price,
                priceDiscount: variant.priceDiscount,
                stock: variant.stock,
                color: variant.color,
                storage: variant.storage
            };
        }
        
        // Thêm thông tin variant vào sản phẩm để lưu vào wishlist
        const productToAdd = { 
            ...product,
            variant: variantToSave, // Lưu thông tin variant đã chọn
            uniqueId // Thêm trường uniqueId để định danh
        };
        
        const newWishlist = [...dataWishlist, productToAdd];
        setDataWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        showSuccessProgress('add_to_wishlist', 'Đã thêm vào danh sách yêu thích');
    };

    const removeFromWishlist = (uniqueId) => {
        // Tìm sản phẩm để xóa dựa trên uniqueId hoặc productId
        const newWishlist = dataWishlist.filter(item => {
            const itemId = item.uniqueId || item._id;
            return itemId !== uniqueId;
        });
        setDataWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        showSuccessProgress('remove_from_wishlist', 'Đã xóa khỏi danh sách yêu thích');
    };

    const isInWishlist = (productId, variantId = null) => {
        // Nếu có variantId, kiểm tra cả sản phẩm và variant
        if (variantId) {
            const uniqueId = `${productId}_${variantId}`;
            return dataWishlist.some(item => item.uniqueId === uniqueId || 
                (item._id === productId && item.variant && item.variant._id === variantId));
        }
        
        // Nếu không có variantId, chỉ kiểm tra theo productId
        return dataWishlist.some(item => item._id === productId);
    };

    const clearWishlist = () => {
        setDataWishlist([]);
        localStorage.removeItem('wishlist');
        showSuccessProgress('remove_from_wishlist', 'Đã xóa tất cả sản phẩm yêu thích');
    };

    // Cart functions
    const removeFromCart = async (productId) => {
        try {
            await requestDeleteCart(productId);
            await fetchCart();
            showSuccessProgress('remove_from_cart', 'Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            showSuccessProgress('update_failure', 'Xóa sản phẩm thất bại');
        }
    };

    // Logout function
    const logoutUser = async () => {
        try {
            await requestLogout();
            showSuccessProgress('logout', 'Đăng xuất thành công');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            showSuccessProgress('update_failure', 'Đăng xuất thất bại');
        }
    };

    // Load wishlist from localStorage
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setDataWishlist(JSON.parse(savedWishlist));
            } catch (error) {
                console.error('Error loading wishlist from localStorage:', error);
                localStorage.removeItem('wishlist');
            }
        }
    }, []);

    useEffect(() => {
        const token = cookies.get('logged');
        fetchCategory();
        if (!token) {
            return;
        }
        fetchAuth();
        fetchCart();
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                fetchAuth,
                dataCategory,
                dataCart,
                dataWishlist,
                fetchCategory,
                fetchCart,
                showSuccessProgress,
                hideSuccessProgress,
                showUpdateSuccess,
                showUpdateFailure,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                clearWishlist,
                removeFromCart,
                logoutUser,
            }}
        >
            {children}
            <SuccessProgress 
                type={successProgress.type}
                message={successProgress.message}
                isVisible={successProgress.isVisible}
                onClose={hideSuccessProgress}
                duration={successProgress.duration}
            />
        </Context.Provider>
    );
}
