import classNames from 'classnames/bind';
import styles from './CardBody.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { Tag } from 'antd';
import { ShoppingCartOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useStore } from '../../hooks/useStore';
import { requestAddToCart } from '../../Config/request';
import { SUCCESS_TYPES } from '../ProgressSuccess/SuccessProgress';

const cx = classNames.bind(styles);

function CardBody({ item }) {
    const { addToWishlist, removeFromWishlist, isInWishlist, fetchCart, showSuccessProgress, dataUser } = useStore();
    const navigate = useNavigate();
    
    if (!item) {
        return (
            <div className={cx('wrapper', 'loading')}>
                <div className={cx('loading-animation')} />
            </div>
        );
    }

    // Xác định giá hiển thị dựa trên variant (nếu có)
    const price = item.variant ? (item.variant.price || item.price) : item.price;
    const priceDiscount = item.variant ? (item.variant.priceDiscount || item.priceDiscount) : item.priceDiscount;
    
    const discountPercentage = priceDiscount > 0
        ? Math.round(((price - priceDiscount) / price) * 100)
        : 0;

    // Xác định uniqueId để kiểm tra trong wishlist
    const uniqueId = item.variant ? `${item._id}_${item.variant._id}` : item._id;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!dataUser._id) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Vui lòng đăng nhập để thêm vào giỏ hàng');
            return;
        }
        
        // Kiểm tra xem sản phẩm có variants không
        if (item.variants && item.variants.length > 0 && !item.variant) {
            showSuccessProgress(SUCCESS_TYPES.WARNING, 'Vui lòng chọn màu sắc và phiên bản trước khi thêm vào giỏ hàng');
            return;
        }

        try {
            const data = {
                productId: item._id,
                quantity: 1,
                // Thêm variantId và sku nếu có variant
                ...(item.variant && {
                    variantId: item.variant._id,
                    sku: item.variant.sku
                })
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
        
        // Kiểm tra có trong wishlist không, sử dụng uniqueId
        const inWishlist = item.variant 
            ? isInWishlist(item._id, item.variant._id)
            : isInWishlist(item._id);
            
        if (inWishlist) {
            removeFromWishlist(uniqueId);
        } else {
            // Không thể thêm vào wishlist từ CardBody nếu sản phẩm có variants
            // vì người dùng cần chọn variant từ trang chi tiết
            if (item.variants && item.variants.length > 0 && !item.variant) {
                showSuccessProgress(SUCCESS_TYPES.WARNING, 'Vui lòng chọn màu sắc và phiên bản trước khi thêm vào yêu thích');
                return;
            }
            addToWishlist(item, item.variant);
        }
    };
    
    const getProductUrl = () => {
        return item.variant ? `/product/${item._id}?variantId=${item.variant._id}` : `/product/${item._id}`;
    };

    const handleProductClick = (e) => {
        e.preventDefault();
        // Force scroll to top before navigation
        window.scrollTo(0, 0);
        // Navigate programmatically with variant pre-selection if any
        navigate(getProductUrl());
    };

    // Xác định hình ảnh hiển thị: nếu có variant thì ưu tiên hình ảnh của variant
    const displayImage = () => {
        // First priority: variant color image if it exists
        if (item.variant && item.variant.color && item.variant.color.image) {
            return item.variant.color.image;
        }
        
        // Second priority: Check for images array
        if (item.images && item.images.length > 0 && item.images[0]) {
            return item.images[0];
        }
        
        // Third priority: Check for image property
        if (item.image) {
            return item.image;
        }
        
        // Fallback image
        return 'https://via.placeholder.com/300x300?text=No+Image';
    };

    return (
        <motion.div 
            className={cx('wrapper')}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <a href={getProductUrl()} className={cx('image-container')} onClick={handleProductClick}>
                <img src={displayImage()} alt={item?.name} />
                {discountPercentage > 0 && (
                    <Tag color="#f5222d" className={cx('discount-tag')}>
                        -{discountPercentage}%
                    </Tag>
                )}
                <div className={cx('overlay')}>
                    <div className={cx('action-buttons')}>
                        <button 
                            className={cx('cart-button')}
                            onClick={handleAddToCart}
                            title="Thêm vào giỏ hàng"
                        >
                            <ShoppingCartOutlined />
                        </button>
                        <button 
                            className={cx('wishlist-button', { 
                                active: item.variant 
                                    ? isInWishlist(item._id, item.variant._id) 
                                    : isInWishlist(item._id)
                            })}
                            onClick={handleToggleWishlist}
                            title={isInWishlist(item._id) ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                        >
                            {item.variant 
                                ? (isInWishlist(item._id, item.variant._id) ? <HeartFilled /> : <HeartOutlined />)
                                : (isInWishlist(item._id) ? <HeartFilled /> : <HeartOutlined />)
                            }
                        </button>
                    </div>
                </div>
            </a>
            
            <div className={cx('content')}>
                <a href={getProductUrl()} className={cx('product-name')} onClick={handleProductClick}>
                    <h4>{item?.name}</h4>
                </a>
                
                {/* Hiển thị thông tin variant nếu có */}
                {item.variant && (
                    <div className={cx('variant-info')}>
                        <div className={cx('variant-detail')}>
                            <span className={cx('variant-color')} 
                                style={{ backgroundColor: item.variant.color.code || item.variant.color.hexCode }}>
                            </span>
                            <span>{item.variant.color.name}</span>
                        </div>
                        {item.variant.storage && (
                            <div className={cx('variant-storage')}>
                                {item.variant.storage.displayName || item.variant.storage.size}
                            </div>
                        )}
                    </div>
                )}
                
                {item?.brand && (
                    <div className={cx('brand')}>
                        <span>{item.brand}</span>
                    </div>
                )}
                
                <div className={cx('price')}>
                    {priceDiscount > 0 ? (
                        <>
                            <p className={cx('price-old')}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                            </p>
                            <p className={cx('price-new')}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceDiscount)}
                            </p>
                        </>
                    ) : (
                        <p className={cx('price-regular')}>
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default CardBody;
