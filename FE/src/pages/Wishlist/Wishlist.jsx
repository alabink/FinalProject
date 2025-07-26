import classNames from 'classnames/bind';
import styles from './Wishlist.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../../Components/Footer/Footer';
import CardBody from '../../../Components/CardBody/CardBody';
import { useStore } from '../../hooks/useStore';
import { Button, Empty, Row, Col } from 'antd';
import { 
    HeartOutlined, 
    ShoppingCartOutlined, 
    DeleteOutlined,
    ArrowLeftOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { requestAddToCart } from '../../Config/request';
import { SUCCESS_TYPES } from '../../../Components/ProgressSuccess/SuccessProgress';

const cx = classNames.bind(styles);

function Wishlist() {
    const { dataWishlist, clearWishlist, fetchCart, showSuccessProgress, dataUser } = useStore();
    const navigate = useNavigate();
    const [isAddingAll, setIsAddingAll] = useState(false);

    useEffect(() => {
        document.title = 'Danh sách yêu thích | Techify';
    }, []);

    const handleAddAllToCart = async () => {
        if (!dataUser || !dataUser._id) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Vui lòng đăng nhập để thêm vào giỏ hàng');
            return;
        }

        setIsAddingAll(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            // Thêm từng sản phẩm vào giỏ hàng
            for (const product of dataWishlist) {
                try {
                    // Create proper cart data object
                    const data = {
                        productId: product._id,
                        quantity: 1
                    };
                    
                    // Add variant information if present
                    if (product.variant && product.variant._id) {
                        data.variantId = product.variant._id;
                        if (product.variant.sku) {
                            data.sku = product.variant.sku;
                        }
                    }
                    
                    // Add to cart
                    await requestAddToCart(data);
                    successCount++;
                } catch (error) {
                    console.error('Error adding product to cart:', error);
                    errorCount++;
                }
            }

            // Hiển thị thông báo kết quả
            if (successCount > 0) {
                showSuccessProgress(
                    SUCCESS_TYPES.ADD_TO_CART, 
                    `Đã thêm ${successCount} sản phẩm vào giỏ hàng${errorCount > 0 ? `, ${errorCount} sản phẩm thất bại` : ''}`
                );
                fetchCart();
            } else {
                showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Không thể thêm sản phẩm vào giỏ hàng');
            }
        } catch (error) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
        } finally {
            setIsAddingAll(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <motion.div 
                    className={cx('container')}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header Section */}
                    <motion.div className={cx('page-header')} variants={itemVariants}>
                        <button 
                            className={cx('back-btn')}
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeftOutlined />
                            Quay lại
                        </button>
                        
                        <div className={cx('header-content')}>
                            <h1>
                                <HeartOutlined />
                                Danh sách yêu thích
                            </h1>
                            <p>Những sản phẩm bạn đã lưu để mua sau</p>
                        </div>

                        {dataWishlist.length > 0 && (
                            <div className={cx('header-actions')}>
                                <span className={cx('item-count')}>
                                    {dataWishlist.length} sản phẩm
                                </span>
                                <Button 
                                    danger 
                                    icon={<DeleteOutlined />}
                                    onClick={clearWishlist}
                                    className={cx('clear-btn')}
                                >
                                    Xóa tất cả
                                </Button>
                            </div>
                        )}
                    </motion.div>

                    {/* Wishlist Content */}
                    {dataWishlist.length > 0 ? (
                        <motion.div className={cx('wishlist-content')} variants={itemVariants}>
                            <Row gutter={[24, 24]} className={cx('products-grid')}>
                                {dataWishlist.map((product, index) => (
                                    <Col key={product.uniqueId || product._id} xs={24} sm={12} md={8} lg={6}>
                                        <motion.div
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -5 }}
                                            className={cx('product-item')}
                                        >
                                            <CardBody item={product} />
                                        </motion.div>
                                    </Col>
                                ))}
                            </Row>
                        </motion.div>
                    ) : (
                        <motion.div className={cx('empty-state')} variants={itemVariants}>
                            <Empty
                                image={
                                    <div className={cx('empty-icon')}>
                                        <HeartOutlined />
                                    </div>
                                }
                                description={
                                    <div className={cx('empty-text')}>
                                        <h3>Danh sách yêu thích trống</h3>
                                        <p>Hãy thêm những sản phẩm bạn yêu thích để mua sau nhé!</p>
                                    </div>
                                }
                            />
                            <div className={cx('empty-actions')}>
                                <Button 
                                    type="primary" 
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    onClick={() => navigate('/')}
                                    className={cx('shop-now-btn')}
                                >
                                    Khám phá sản phẩm
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Actions */}
                    {dataWishlist.length > 0 && (
                        <motion.div className={cx('quick-actions')} variants={itemVariants}>
                            <div className={cx('actions-content')}>
                                <div className={cx('action-info')}>
                                    <h3>Mua ngay tất cả sản phẩm yêu thích?</h3>
                                    <p>Tiết kiệm thời gian với tính năng thêm tất cả vào giỏ hàng</p>
                                </div>
                                <Button 
                                    type="primary" 
                                    size="large"
                                    icon={<ShoppingCartOutlined />}
                                    className={cx('add-all-btn')}
                                    onClick={handleAddAllToCart}
                                    loading={isAddingAll}
                                    disabled={isAddingAll}
                                >
                                    {isAddingAll ? 'Đang thêm...' : 'Thêm tất cả vào giỏ'}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Wishlist; 