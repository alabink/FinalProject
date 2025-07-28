import classNames from 'classnames/bind';
import styles from './DetailProduct.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import ProductVariants from '../../Components/ProductVariants/ProductVariants';

import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Navigation, Pagination, Autoplay, Thumbs, FreeMode } from 'swiper/modules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid, faCartPlus, faCartShopping } from '@fortawesome/free-solid-svg-icons';

import { useEffect, useRef, useState } from 'react';
import { requestAddToCart, requestCreateComment, requestGetProductById, requestTrackInteraction } from '../../Config/request';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';

import { message, Rate, Form, Input, Button, List, Avatar, Space } from 'antd';
import { Comment } from '@ant-design/compatible';
import { useStore } from '../../hooks/useStore';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';

import CardBody from '../../Components/CardBody/CardBody';
import { SUCCESS_TYPES } from '../../Components/ProgressSuccess/SuccessProgress';

const cx = classNames.bind(styles);

// Component hiển thị bình luận và phản hồi đệ quy
const CommentItem = ({ comment, dataUser, selectedComment, setSelectedComment, replyingTo, setReplyingTo, replyComment, setReplyComment, postId, fetchData }) => {
    // Hàm xử lý phản hồi cho comment này
    const handleReply = async (e) => {
        if (e.key === 'Enter' && replyComment.trim()) {
            try {
                const data = {
                    postId: postId,
                    content: `@${comment.fullName}: ${replyComment}`,
                    parentId: comment._id, // Phản hồi trực tiếp đến comment này
                };
                await requestCreateComment(data);
                setReplyComment('');
                setSelectedComment(null);
                setReplyingTo(null);
                message.success('Trả lời bình luận thành công');
                // Tải lại dữ liệu sau khi phản hồi
                setTimeout(() => {
                    fetchData();
                }, 500);
            } catch (error) {
                message.error('Có lỗi xảy ra khi phản hồi bình luận');
            }
        }
    };

    return (
        <div className={cx('comment-item')}>
            <img
                src={
                    comment.avatar && !comment.avatar.startsWith('http')
                        ? `http://localhost:3000/uploads/avatars/${comment.avatar}`
                        : comment.avatar || 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png'
                }
                alt={comment.fullName}
                className={cx('avatar-img')}
            />
            <div>
                <h4>
                    <span>
                        {comment.fullName}
                        {comment.isAdmin && <VerifiedBadge size="small" />}
                    </span> - {new Date(comment.createdAt).toLocaleString()}
                </h4>
                <p>{comment.content}</p>
                {dataUser._id && (
                    <button onClick={() => {
                        const isSelected = selectedComment === comment._id && replyingTo === comment.fullName;
                        setSelectedComment(isSelected ? null : comment._id);
                        setReplyingTo(isSelected ? null : comment.fullName);
                    }}>
                        {selectedComment === comment._id && replyingTo === comment.fullName ? 'Hủy phản hồi' : 'Phản hồi'}
                    </button>
                )}

                {/* Hiển thị form phản hồi nếu đang phản hồi comment này */}
                {selectedComment === comment._id && replyingTo === comment.fullName && (
                    <div className={cx('comment-section')}>
                        <img
                            src={
                                dataUser?.avatar && !dataUser.avatar.startsWith('http')
                                    ? `http://localhost:3000/uploads/avatars/${dataUser.avatar}`
                                    : dataUser.avatar || 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png'
                            }
                            alt={dataUser.fullName}
                            className={cx('avatar-img')}
                        />
                        <div className={cx('comment-form')}>
                            <input
                                type="text"
                                placeholder={`Phản hồi đến ${replyingTo}...`}
                                onChange={(e) => setReplyComment(e.target.value)}
                                onKeyDown={handleReply}
                                value={replyComment}
                                autoFocus
                            />
                        </div>
                    </div>
                )}

                {/* Hiển thị các phản hồi */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className={cx('replies-container')}>
                        {comment.replies.map(reply => (
                            <CommentItem
                                key={reply._id}
                                comment={reply}
                                dataUser={dataUser}
                                selectedComment={selectedComment}
                                setSelectedComment={setSelectedComment}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                replyComment={replyComment}
                                setReplyComment={setReplyComment}
                                postId={postId}
                                fetchData={fetchData}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

function DetailProduct() {
    const ref = useRef();

    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const variantIdParam = searchParams.get('variantId');

    const navigate = useNavigate();

    const [dataProduct, setDataProduct] = useState({});
    const [dataCoupon, setDataCoupon] = useState([]);
    const [dataPreview, setDataPreview] = useState([]);
    const [dataComment, setDataComment] = useState([]);
    const [dataProductRelated, setDataProductRelated] = useState([]);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [mainSwiper, setMainSwiper] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [reviewFilter, setReviewFilter] = useState('all'); // all, 5, 4, 3, 2, 1
    const [currentVariant, setCurrentVariant] = useState(null);
    const [defaultColorIndex, setDefaultColorIndex] = useState(-1);
    const [defaultStorageIndex, setDefaultStorageIndex] = useState(-1);
    const [currentMainImage, setCurrentMainImage] = useState(null); // Ảnh chính hiện tại

    const { fetchCart, dataUser, showSuccessProgress, addToWishlist, isInWishlist, removeFromWishlist } = useStore();

    const handleVariantChange = (variant) => {
        setCurrentVariant(variant);
    };

    const handleImageChange = (colorImage) => {
        setCurrentMainImage(colorImage);
        // Reset active index về 0 khi thay đổi ảnh màu
        setActiveIndex(0);
        // Update swiper if needed
        if (mainSwiper) {
            mainSwiper.slideTo(0);
        }
    };

    const onCoppyCoupon = (nameCoupon) => {
        navigator.clipboard.writeText(nameCoupon);
        message.success('Sao chép mã giảm giá thành công');
    };

    const fetchData = async () => {
        const res = await requestGetProductById(id);
        document.title = `Sản phẩm | ${res.metadata.data.name} `;
        setDataProduct(res.metadata.data);
        setDataCoupon(res.metadata.dataCoupon);
        setDataPreview(res.metadata.dataPreview);
         // Process related products: remove current, shuffle, limit to 4
         const relatedFiltered = res.metadata.productRelated.filter(p => p._id !== id);
         const shuffledRelated = [...relatedFiltered].sort(() => 0.5 - Math.random());
         setDataProductRelated(shuffledRelated.slice(0, 4));
        setDataComment(res.metadata.dataComment);

        // Handle variant preselection if variantId is provided in query params
        if (variantIdParam && res.metadata.data.variants && res.metadata.data.variants.length > 0) {
            const matchedVariant = res.metadata.data.variants.find(v => v._id === variantIdParam);
            if (matchedVariant) {
                setCurrentVariant(matchedVariant);
                // Set default indices for ProductVariants component
                // Build colors array order as ProductVariants does
                const colors = [];
                res.metadata.data.variants.forEach(variant => {
                    if (!colors.find(c => c.name === variant.color.name)) {
                        colors.push(variant.color);
                    }
                });
                const colorIndex = colors.findIndex(c => c.name === matchedVariant.color.name);

                // Build storages array as ProductVariants
                const storages = [];
                res.metadata.data.variants.forEach(variant => {
                    if (!storages.find(s => s.size === variant.storage.size)) {
                        storages.push(variant.storage);
                    }
                });
                const storageIndex = storages.findIndex(s => s.size === matchedVariant.storage.size);

                setDefaultColorIndex(colorIndex);
                setDefaultStorageIndex(storageIndex);

                // Also update main image to the chosen color image
                if (matchedVariant.color && matchedVariant.color.image) {
                    setCurrentMainImage(matchedVariant.color.image);
                }
            }
        }
    };

    useEffect(() => {
        fetchData();
        // Reset states khi chuyển sản phẩm
        setCurrentVariant(null);
        setCurrentMainImage(null);
        setActiveIndex(0);
    }, [id]);

    useEffect(() => {
        if (ref.current) {
            // Use a timeout to ensure this happens after ScrollToTop
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 100);
        }
    }, [id]);

    useEffect(() => {
        if (dataProduct._id && dataUser && dataUser._id) {
            // Track a view interaction when product details are fetched
            requestTrackInteraction({
                userId: dataUser._id,
                productId: dataProduct._id,
                type: 'view'
            }).catch(err => {
                console.error('Failed to track view interaction:', err);
            });
        }
    }, [dataProduct._id, dataUser]);

    const handleAddToCart = async () => {
        try {
            // Kiểm tra nếu có variants thì phải chọn variant
            if (dataProduct.variants && dataProduct.variants.length > 0) {
                if (!currentVariant) {
                    message.warning('Vui lòng chọn màu sắc và phiên bản trước khi thêm vào giỏ hàng');
                    return;
                }
                if (currentVariant.stock <= 0) {
                    message.warning('Sản phẩm này hiện đã hết hàng');
                    return;
                }
            }

            const data = {
                productId: id,
                quantity: 1,
                variantId: currentVariant?._id, // Thêm variantId nếu có
                sku: currentVariant?.sku, // Thêm SKU để định danh chính xác
                // Thêm thông tin chi tiết về màu sắc và phiên bản đã chọn
                variantInfo: currentVariant ? {
                    color: currentVariant.color,
                    storage: currentVariant.storage,
                    price: currentVariant.price,
                    priceDiscount: currentVariant.priceDiscount
                } : null
            };
            await requestAddToCart(data);
            showSuccessProgress(SUCCESS_TYPES.ADD_TO_CART, 'Đã thêm vào giỏ hàng');
            fetchCart();
            await requestTrackInteraction({
                userId: dataUser._id,
                productId: dataProduct._id,
                type: 'click'
            }).catch(err => console.error('Failed to track click interaction:', err));
        } catch (error) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, error.response.data.message);
        }
    };

    const handleBuyNow = async () => {
        try {
            // Kiểm tra nếu có variants thì phải chọn variant
            if (dataProduct.variants && dataProduct.variants.length > 0) {
                if (!currentVariant) {
                    message.warning('Vui lòng chọn màu sắc và phiên bản trước khi mua ngay');
                    return;
                }
                if (currentVariant.stock <= 0) {
                    message.warning('Sản phẩm này hiện đã hết hàng');
                    return;
                }
            }

            const data = {
                productId: id,
                quantity: 1,
                variantId: currentVariant?._id, // Thêm variantId nếu có
                sku: currentVariant?.sku, // Thêm SKU để định danh chính xác
                // Thêm thông tin chi tiết về màu sắc và phiên bản đã chọn
                variantInfo: currentVariant ? {
                    color: currentVariant.color,
                    storage: currentVariant.storage,
                    price: currentVariant.price,
                    priceDiscount: currentVariant.priceDiscount
                } : null
            };
            await requestAddToCart(data);
            showSuccessProgress(SUCCESS_TYPES.ADD_TO_CART, 'Đang chuyển đến giỏ hàng...');
            fetchCart();
            setTimeout(() => {
                navigate('/cart');
            }, 2000);
        } catch (error) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, error.response.data.message);
        }
    };
    
    // Xử lý thêm vào danh sách yêu thích
    const handleAddToWishlist = async () => {
        const inWishlist = isProductInWishlist();

        if (inWishlist) {
            // Xóa sản phẩm khỏi yêu thích (kể cả trường hợp có variant)
            if (currentVariant) {
                removeFromWishlist(`${dataProduct._id}_${currentVariant._id}`);
            } else {
                removeFromWishlist(dataProduct._id);
            }
        } else {
            // Thêm vào yêu thích, truyền chi tiết variant đã chọn (nếu có)
            addToWishlist(dataProduct, currentVariant);

            // Ghi nhận tương tác "favorite" nếu người dùng đã đăng nhập
            if (dataUser && dataUser._id) {
                requestTrackInteraction({
                    userId: dataUser._id,
                    productId: dataProduct._id,
                    type: 'favorite'
                }).catch(err => console.error('Failed to track favorite interaction:', err));
            }
        }
    };
    
    // Kiểm tra xem sản phẩm với variant hiện tại có trong wishlist không
    const isProductInWishlist = () => {
        if (currentVariant) {
            return isInWishlist(id, currentVariant._id);
        }
        return isInWishlist(id);
    };

    const [comment, setComment] = useState('');
    const [replyComment, setReplyComment] = useState('');
    const [selectedComment, setSelectedComment] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null); // Thêm state để lưu thông tin đang phản hồi ai

    const handleCreateComment = async (e) => {
        if (e.key === 'Enter' && comment.trim()) {
            try {
            const data = {
                postId: id,
                content: comment,
                    parentId: null, // Comment gốc không có parentId
            };
            await requestCreateComment(data);
            fetchData();
            setComment('');
            setSelectedComment(null);
            message.success('Bình luận thành công');
            } catch (error) {
                message.error('Có lỗi xảy ra khi bình luận');
            }
        }
    };

    // Tính toán thống kê đánh giá
    const calculateReviewStats = () => {
        if (dataPreview.length === 0) return { averageRating: 0, totalReviews: 0, ratingDistribution: {} };

        const totalReviews = dataPreview.length;
        const totalRating = dataPreview.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        const ratingDistribution = {};
        for (let i = 1; i <= 5; i++) {
            ratingDistribution[i] = dataPreview.filter(review => review.rating === i).length;
        }

        return { averageRating, totalReviews, ratingDistribution };
    };

    const reviewStats = calculateReviewStats();

    // Lọc đánh giá theo rating
    const filteredReviews = reviewFilter === 'all' 
        ? dataPreview 
        : dataPreview.filter(review => review.rating === parseInt(reviewFilter));

    // Scroll to reviews section when clicking on rating
    const scrollToReviews = () => {
        const reviewsSection = document.querySelector('[class*="reviews-section"]');
        if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')} ref={ref}>
                {/* Product Info Section */}
                <div className={cx('container')}>
                    <div className={cx('product-main')}>
                        <div className={cx('product-gallery')}>
                            <Swiper
                                style={{
                                    '--swiper-navigation-color': '#fff',
                                    '--swiper-pagination-color': '#fff',
                                }}
                                spaceBetween={10}
                                navigation={true}
                                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                modules={[EffectFade, Navigation, Thumbs]}
                                className={cx('main-swiper')}
                                onSwiper={setMainSwiper}
                                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                                effect={'fade'}
                            >
                                {currentMainImage ? (
                                    // Hiển thị ảnh màu được chọn
                                    <SwiperSlide key="color-image">
                                        <div className={cx('swiper-zoom-container')}>
                                            <img src={currentMainImage} alt={`${dataProduct?.name} - ${currentVariant?.color?.name}`} />
                                        </div>
                                    </SwiperSlide>
                                ) : (
                                    // Hiển thị ảnh gốc
                                    dataProduct?.images?.map((item, index) => (
                                        <SwiperSlide key={index}>
                                            <div className={cx('swiper-zoom-container')}>
                                                <img src={item} alt={`${dataProduct?.name} - Ảnh ${index + 1}`} />
                                            </div>
                                        </SwiperSlide>
                                    ))
                                )}
                            </Swiper>
                            
                            <Swiper
                                onSwiper={setThumbsSwiper}
                                spaceBetween={10}
                                slidesPerView={4}
                                freeMode={true}
                                watchSlidesProgress={true}
                                modules={[FreeMode, Navigation, Thumbs]}
                                className={cx('thumbs-swiper')}
                                breakpoints={{
                                    0: {
                                        slidesPerView: 3,
                                    },
                                    480: {
                                        slidesPerView: 4,
                                    },
                                    768: {
                                        slidesPerView: 4,
                                    },
                                }}
                                onClick={(swiper, event, clickedIndex) => {
                                    if (mainSwiper) {
                                        mainSwiper.slideTo(clickedIndex);
                                    }
                                }}
                            >
                                {currentMainImage ? (
                                    // Hiển thị thumbnail ảnh màu
                                    <SwiperSlide key="color-thumb">
                                        <div 
                                            className={cx('thumb-slide', { active: true })} 
                                            role="button" 
                                            tabIndex={0}
                                        >
                                            <img src={currentMainImage} alt={`${dataProduct?.name} - ${currentVariant?.color?.name} Thumbnail`} />
                                        </div>
                                    </SwiperSlide>
                                ) : (
                                    // Hiển thị thumbnail ảnh gốc
                                    dataProduct?.images?.map((item, index) => (
                                    <SwiperSlide key={index}>
                                        <div 
                                            className={cx('thumb-slide', { active: index === activeIndex })} 
                                            role="button" 
                                            tabIndex={0}
                                            onClick={() => {
                                                if (mainSwiper) {
                                                    mainSwiper.slideTo(index);
                                                }
                                            }}
                                        >
                                            <img src={item} alt={`${dataProduct?.name} - Thumbnail ${index + 1}`} />
                                        </div>
                                    </SwiperSlide>
                                    ))
                                )}
                            </Swiper>
                        </div>

                        <div className={cx('product-info')}>
                            <h1>{dataProduct?.name}</h1>
                            {dataProduct?.brand && (
                                <div className={cx('brand')}>
                                    <span>Thương hiệu: {dataProduct.brand}</span>
                                </div>
                            )}
                            
                            {/* Rating Summary */}
                            {reviewStats.totalReviews > 0 && (
                                <div className={cx('product-rating')}>
                                    <div 
                                        className={cx('rating-display')} 
                                        onClick={scrollToReviews}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                scrollToReviews();
                                            }
                                        }}
                                    >
                                        <Rate 
                                            disabled 
                                            value={reviewStats.averageRating} 
                                            allowHalf 
                                            className={cx('rating-stars')}
                                        />
                                        <span className={cx('rating-text')}>
                                            {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} đánh giá)
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            <div className={cx('price')}>
                                {/* Hiển thị giá từ variant hiện tại hoặc giá gốc */}
                                {dataProduct.variants && dataProduct.variants.length > 0 ? (
                                    // Nếu có variants
                                    currentVariant ? (
                                        <>
                                            {currentVariant.priceDiscount > 0 && (
                                                <span className={cx('original-price')}>
                                                    {currentVariant.price?.toLocaleString()}đ
                                                </span>
                                            )}
                                            <p className={cx('current-price')}>
                                                {(currentVariant.priceDiscount || currentVariant.price)?.toLocaleString()}đ
                                            </p>
                                        </>
                                    ) : (
                                        // Chưa chọn variant
                                        <div className={cx('price-placeholder')}>
                                            <p className={cx('select-variant-text')} style={{ 
                                                color: '#1890ff', 
                                                fontSize: '16px',
                                                fontStyle: 'italic' 
                                            }}>
                                                Vui lòng chọn màu sắc và phiên bản để xem giá
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    // Sản phẩm đơn
                                    <>
                                {dataProduct?.priceDiscount > 0 && (
                                    <span className={cx('original-price')}>
                                        {dataProduct?.price?.toLocaleString()}đ
                                    </span>
                                )}
                                <p className={cx('current-price')}>
                                    {(dataProduct?.priceDiscount || dataProduct?.price)?.toLocaleString()}đ
                                </p>
                                    </>
                                )}
                            </div>

                            {/* ProductVariants Component */}
                            {dataProduct.variants && dataProduct.variants.length > 0 && (
                                <ProductVariants 
                                    productId={id}
                                    variants={dataProduct.variants}
                                    onVariantChange={handleVariantChange}
                                    onImageChange={handleImageChange}
                                    defaultColorIndex={defaultColorIndex}
                                    defaultStorageIndex={defaultStorageIndex}
                                />
                            )}

                            <div className={cx('features')}>
                                <ul>
                                    <li>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Giao hàng ngày mở bán tại Việt Nam 16/05/2025</span>
                                    </li>
                                    <li>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Sản phẩm chính hãng mới 100% nguyên seal</span>
                                    </li>
                                    <li>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Giá đã bao gồm VAT</span>
                                    </li>
                                    <li>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Bảo hành 12 tháng chính hãng</span>
                                    </li>
                                    <li>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        <span>Giảm giá 10% khi mua phụ kiện kèm theo</span>
                                    </li>
                                </ul>
                            </div>

                            <div className={cx('coupons')}>
                                <h3>Mã giảm giá</h3>
                                <div className={cx('coupon-list')}>
                                    {dataCoupon.length > 0 ? (
                                        dataCoupon.map((item) => (
                                            <button
                                                key={item._id}
                                                onClick={() => onCoppyCoupon(item.nameCoupon)}
                                                className={cx('coupon-btn')}
                                            >
                                                {item.nameCoupon} - Giảm {item.discount?.toLocaleString()}đ
                                            </button>
                                        ))
                                    ) : (
                                        <p>Không có mã giảm giá phù hợp</p>
                                    )}
                                </div>
                            </div>

                            {dataUser._id ? (
                                <>
                                <div className={cx('button-group')}>
                                        <button onClick={handleBuyNow} title="Mua ngay">
                                            <FontAwesomeIcon icon={faCartShopping} />
                                            Mua ngay
                                        </button>
                                        <button onClick={handleAddToCart} title="Thêm vào giỏ hàng">
                                            <FontAwesomeIcon icon={faCartPlus} />
                                            Thêm vào giỏ
                                        </button>
                                        <button 
                                            onClick={handleAddToWishlist} 
                                            className={cx('wishlist-btn', { active: isProductInWishlist() })}
                                            title={isProductInWishlist() ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                                        >
                                            <FontAwesomeIcon icon={isProductInWishlist() ? faHeartSolid : faHeartRegular} />
                                            {isProductInWishlist() ? 'Đã thích' : 'Yêu thích'}
                                        </button>
                                </div>
                                </>
                            ) : (
                                <div className={cx('button-group')}>
                                    <Link to="/login">
                                        <button>Đăng nhập để mua hàng</button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Specifications Section */}
                <div className={cx('container')}>
                    <div className={cx('specs')}>
                        <h2>Thông số kỹ thuật</h2>
                        <div className={cx('specs-grid')}>
                            <div>
                                <h5>Bộ xử lý CPU</h5>
                                <p>{dataProduct?.attributes?.cpu}</p>
                            </div>
                            <div>
                                <h5>Ram</h5>
                                <p>{dataProduct?.attributes?.ram}</p>
                            </div>
                            <div>
                                <h5>Màn hình</h5>
                                <p>{dataProduct?.attributes?.screen}</p>
                            </div>
                            <div>
                                <h5>GPU</h5>
                                <p>{dataProduct?.attributes?.gpu}</p>
                            </div>
                            <div>
                                <h5>Ổ cứng</h5>
                                <p>{dataProduct?.attributes?.storage}</p>
                            </div>
                            <div>
                                <h5>Kích thước</h5>
                                <p>{dataProduct?.attributes?.weight} gram</p>
                            </div>
                            <div>
                                <h5>Camera</h5>
                                <p>{dataProduct?.attributes?.camera}</p>
                            </div>
                            <div>
                                <h5>Pin</h5>
                                <p>{dataProduct?.attributes?.battery}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Description Section */}
                {dataProduct?.description && (
                    <div className={cx('container')}>
                        <div className={cx('description-section')}>
                            <h2>Mô tả sản phẩm</h2>
                            <div className={cx('description-content')}>
                                {dataProduct.description.split('\n').map((paragraph, index) => (
                                    paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                {dataPreview.length > 0 && (
                    <div className={cx('container')}>
                        <div className={cx('reviews-section')}>
                            <h2>Đánh giá từ khách hàng</h2>
                            
                            {/* Review Summary */}
                            <div className={cx('review-summary')}>
                                <div className={cx('summary-left')}>
                                    <div className={cx('average-rating')}>
                                        <span className={cx('rating-number')}>
                                            {reviewStats.averageRating.toFixed(1)}
                                        </span>
                                        <Rate 
                                            disabled 
                                            value={reviewStats.averageRating} 
                                            allowHalf 
                                            className={cx('rating-stars')}
                                        />
                                        <span className={cx('total-reviews')}>
                                            ({reviewStats.totalReviews} đánh giá)
                                        </span>
                                    </div>
                                </div>
                                
                                <div className={cx('summary-right')}>
                                    <div className={cx('rating-distribution')}>
                                        {[5, 4, 3, 2, 1].map(star => (
                                            <div key={star} className={cx('rating-bar')}>
                                                <span className={cx('star-label')}>
                                                    {star} <span className={cx('star-icon')}>⭐</span>
                                                </span>
                                                <div className={cx('progress-bar')}>
                                                    <div 
                                                        className={cx('progress-fill')} 
                                                        style={{ 
                                                            width: `${(reviewStats.ratingDistribution[star] / reviewStats.totalReviews) * 100}%` 
                                                        }}
                                                    />
                                                </div>
                                                <span className={cx('count')}>
                                                    {reviewStats.ratingDistribution[star]}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Review Filter */}
                            <div className={cx('review-filter')}>
                                <span className={cx('filter-label')}>Lọc theo:</span>
                                <div className={cx('filter-buttons')}>
                                    <button 
                                        className={cx('filter-btn', { active: reviewFilter === 'all' })}
                                        onClick={() => setReviewFilter('all')}
                                    >
                                        Tất cả ({reviewStats.totalReviews})
                                    </button>
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <button 
                                            key={star}
                                            className={cx('filter-btn', { active: reviewFilter === star.toString() })}
                                            onClick={() => setReviewFilter(star.toString())}
                                        >
                                            {star} ⭐ ({reviewStats.ratingDistribution[star]})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reviews List */}
                            <List
                                className={cx('reviews-list')}
                                itemLayout="horizontal"
                                dataSource={filteredReviews}
                                renderItem={(item) => (
                                    <div className={cx('review-item')}>
                                        <div className={cx('review-header')}>
                                            <Avatar 
                                                src={
                                                    item.avatar && !item.avatar.startsWith('http')
                                                        ? `http://localhost:3000/uploads/avatars/${item.avatar}`
                                                        : item.avatar || 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png'
                                                }
                                                alt={item.fullName}
                                                size={48}
                                                className={cx('review-avatar')}
                                            />
                                            <div className={cx('review-info')}>
                                                <span className={cx('reviewer-name')}>
                                                    {item.fullName}
                                                    {item.isAdmin && <VerifiedBadge size="small" />}
                                                </span>
                                                <div className={cx('review-rating')}>
                                                    <Rate disabled defaultValue={item.rating} size="small" />
                                                    <span className={cx('review-date')}>
                                                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cx('review-content')}>
                                            <p>{item.comment}</p>
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Comments Section */}
                <div className={cx('container')}>
                    <div className={cx('comment-list')}>
                        <h2>Bình luận sản phẩm</h2>
                        {dataUser._id ? (
                            <div className={cx('comment-section')}>
                                <img
                                    src={
                                        dataUser?.avatar && !dataUser.avatar.startsWith('http')
                                            ? `http://localhost:3000/uploads/avatars/${dataUser.avatar}`
                                            : dataUser.avatar || 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png'
                                    }
                                    alt={dataUser.fullName}
                                    className={cx('avatar-img')}
                                />
                                <div className={cx('comment-form')}>
                                    <input
                                        type="text"
                                        placeholder="Chia sẻ ý kiến của bạn về sản phẩm..."
                                        onChange={(e) => setComment(e.target.value)}
                                        onKeyDown={handleCreateComment}
                                        value={comment}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className={cx('login-to-comment')}>
                                <p>Vui lòng <Link to="/login">đăng nhập</Link> để bình luận về sản phẩm</p>
                            </div>
                        )}
                        <div className={cx('comment-items')}>
                            {dataComment.map((item) => (
                                <CommentItem
                                    key={item._id}
                                    comment={item}
                                    dataUser={dataUser}
                                    selectedComment={selectedComment}
                                    setSelectedComment={setSelectedComment}
                                    replyingTo={replyingTo}
                                    setReplyingTo={setReplyingTo}
                                    replyComment={replyComment}
                                    setReplyComment={setReplyComment}
                                    postId={id}
                                    fetchData={fetchData}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                <div className={cx('container')}>
                    <div className={cx('product-related-list')}>
                        <h2>Sản phẩm tương tự</h2>
                        <div className={cx('products-grid')}>
                            {dataProductRelated.map((item) => (
                                <CardBody key={item._id} item={item} />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default DetailProduct;
