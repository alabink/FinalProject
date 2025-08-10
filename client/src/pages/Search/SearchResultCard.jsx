import { Link } from 'react-router-dom';
import { 
    ShoppingCartOutlined, 
    HeartOutlined, 
    HeartFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useStore } from '../../hooks/useStore';
import { requestAddToCart } from '../../Config/request';
import { SUCCESS_TYPES } from '../../components/ProgressSuccess/SuccessProgress';
import classNames from 'classnames/bind';
import styles from './SearchResultCard.module.scss';

const cx = classNames.bind(styles);

function SearchResultCard({ product, index }) {
    const { addToWishlist, removeFromWishlist, isInWishlist, fetchCart, showSuccessProgress, dataUser } = useStore();
    
    if (!product) return null;

    const discountPercentage = product?.priceDiscount > 0
        ? Math.round(((product.price - product.priceDiscount) / product.price) * 100)
        : 0;

    const finalPrice = product.priceDiscount > 0 ? product.priceDiscount : product.price;
    const isWishlisted = isInWishlist(product._id);

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!dataUser._id) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Vui lòng đăng nhập để thêm vào giỏ hàng');
            return;
        }

        // Check if product has variants
        if (product.variants && product.variants.length > 0) {
            showSuccessProgress(
                SUCCESS_TYPES.WARNING, 
                'Vui lòng chọn màu sắc và phiên bản trước khi thêm vào giỏ hàng'
            );
            // Removed automatic redirection
            return;
        }

        try {
            const data = {
                productId: product._id,
                quantity: 1,
            };
            await requestAddToCart(data);
            showSuccessProgress(SUCCESS_TYPES.ADD_TO_CART, 'Đã thêm vào giỏ hàng');
            fetchCart();
        } catch (error) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!dataUser._id) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Vui lòng đăng nhập để sử dụng wishlist');
            return;
        }

        // Check if product has variants
        if (product.variants && product.variants.length > 0) {
            showSuccessProgress(
                SUCCESS_TYPES.WARNING, 
                'Vui lòng chọn màu sắc và phiên bản trước khi thêm vào yêu thích'
            );
            // Removed automatic redirection
            return;
        }

        if (isWishlisted) {
            removeFromWishlist(product._id);
            showSuccessProgress(SUCCESS_TYPES.REMOVE_FROM_WISHLIST, 'Đã xóa khỏi danh sách yêu thích');
        } else {
            addToWishlist(product);
            showSuccessProgress(SUCCESS_TYPES.ADD_TO_WISHLIST, 'Đã thêm vào danh sách yêu thích');
        }
    };

    return (
        <motion.div
            className={cx('product-card')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -4 }}
        >
            <Link to={`/product/${product._id}`} className={cx('card-link')}>
                <div className={cx('image-container')}>
                    <img 
                        src={product.images?.[0] || '/default-product.jpg'} 
                        alt={product.name}
                        className={cx('product-image')}
                    />
                    
                    {discountPercentage > 0 && (
                        <div className={cx('discount-badge')}>
                            -{discountPercentage}%
                        </div>
                    )}
                    
                    <div className={cx('action-buttons')}>
                        <motion.button
                            className={cx('action-btn', 'cart-btn')}
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Thêm vào giỏ hàng"
                        >
                            <ShoppingCartOutlined />
                        </motion.button>
                        
                        <motion.button
                            className={cx('action-btn', 'wishlist-btn', { active: isWishlisted })}
                            onClick={handleToggleWishlist}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        >
                            {isWishlisted ? <HeartFilled /> : <HeartOutlined />}
                        </motion.button>
                    </div>
                </div>
                
                <div className={cx('product-info')}>
                    <h3 className={cx('product-name')} title={product.name}>
                        {product.name}
                    </h3>
                    
                    <div className={cx('brand-name')}>
                        {product.brand}
                    </div>
                    
                    <div className={cx('price-info')}>
                        {product.priceDiscount > 0 && (
                            <span className={cx('original-price')}>
                                {product.price?.toLocaleString('vi-VN')} ₫
                            </span>
                        )}
                        <span className={cx('current-price')}>
                            {finalPrice?.toLocaleString('vi-VN')} ₫
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default SearchResultCard; 