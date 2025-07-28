import classNames from 'classnames/bind';
import styles from './Payments.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import { requestGetOnePayment } from '../../Config/request';
import { useEffect, useState } from 'react';
import { Button, Card, Typography, Space, Divider, Tag, message } from 'antd';
import { 
    UserOutlined, 
    EnvironmentOutlined,
    PhoneOutlined,
    CreditCardOutlined,
    ShoppingOutlined,
    HomeOutlined,
    HistoryOutlined,
    TruckOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import successGif from '../../assets/images/success.gif';
import vnpayLogo from '../../assets/images/vnpay.png';
import momoLogo from '../../assets/images/momo.png';

const cx = classNames.bind(styles);
const { Title, Text, Paragraph } = Typography;

function Payments() {
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
            const res = await requestGetOnePayment(id);
                console.log("API Response:", res); // Debug log
                
                if (res && res.metadata) {
                    setOrderData(res.metadata);
                } else {
                    message.error("Không thể tải thông tin đơn hàng");
                }
            } catch (error) {
                console.error('Error fetching payment data:', error);
                message.error("Đã xảy ra lỗi khi tải thông tin đơn hàng");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
        document.title = 'Thanh toán thành công | Techify';
        
        // Add confetti effect
        const timer = setTimeout(() => {
            createConfetti();
        }, 500);
        
        return () => clearTimeout(timer);
    }, [id]);

    const createConfetti = () => {
        const colors = ['#667eea', '#764ba2', '#10b981', '#f093fb', '#34d399', '#fbbf24'];
        const confettiContainer = document.createElement('div');
        confettiContainer.className = cx('confetti-container');
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            confetti.className = cx('confetti');
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = Math.random() * 4 + 3 + 's';
            confetti.style.width = Math.random() * 8 + 6 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            if (document.body.contains(confettiContainer)) {
                document.body.removeChild(confettiContainer);
            }
        }, 7000);
    };

    const getPaymentMethodIcon = (type) => {
        if (!type) return '💳';
        
        switch(type) {
            case 'VNPAY':
                return <img src={vnpayLogo} alt="VNPay" style={{width:24}} />;
            case 'MOMO':
                return <img src={momoLogo} alt="MoMo" style={{width:24}} />;
            case 'COD':
                return '💵';
            default:
                return '💳';
        }
    };

    const getPaymentMethodName = (type) => {
        if (!type) return 'Không xác định';
        
        switch(type) {
            case 'VNPAY':
                return 'VNPay';
            case 'MOMO':
                return 'MoMo';
            case 'COD':
                return 'Thanh toán khi nhận hàng';
            default:
                return type;
        }
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return '0';
        return price.toLocaleString('vi-VN');
    };

    const getItemPrice = (item) => {
        if (!item) return 0;

        // 1) Use explicit variantPrice if provided by backend
        if (item.variantPrice !== undefined && item.variantPrice !== null) {
            return item.variantPrice;
        }

        // 2) Check variantInfo price / priceDiscount
        if (item.variantInfo) {
            if (item.variantInfo.priceDiscount && item.variantInfo.priceDiscount > 0) {
                return item.variantInfo.priceDiscount;
            }
            if (item.variantInfo.price && item.variantInfo.price > 0) {
                return item.variantInfo.price;
            }
        }

        // 3) Fallback to product level price
        if (item.product) {
            if (item.product.priceDiscount && item.product.priceDiscount > 0) {
                return item.product.priceDiscount;
            }
            if (item.product.price) {
                return item.product.price;
            }
        }

        return 0;
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    if (isLoading) {
    return (
            <div className={cx('wrapper')}>
                <Header />
                <div className={cx('loading-container')}>
                    <div className={cx('loading-spinner')} />
                    <Text>Đang tải thông tin đơn hàng...</Text>
                </div>
                <Footer />
            </div>
        );
    }

    // Nếu không có dữ liệu hoặc dữ liệu không hợp lệ
    if (!orderData || !orderData.findPayment) {
        return (
            <div className={cx('wrapper')}>
                <Header />
                <div className={cx('error-container')}>
                    <div className={cx('error-icon')}>⚠️</div>
                    <Title level={3}>Đã xảy ra lỗi</Title>
                    <Text>Không thể tải thông tin đơn hàng</Text>
                    <Button 
                        type="primary" 
                        onClick={() => navigate('/')}
                        className={cx('home-button')}
                    >
                        Quay về trang chủ
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    const payment = orderData.findPayment || {};
    const products = Array.isArray(orderData.dataProduct) ? orderData.dataProduct : [];
    const subtotal = orderData.subtotal || 0;
    const couponInfo = orderData.couponInfo || null;

    return (
                <div className={cx('wrapper')}>
            <Header />
            
            {/* Floating Elements */}
            <div className={cx('floating-elements')}>
                <div className={cx('floating-circle', 'circle-1')} />
                <div className={cx('floating-circle', 'circle-2')} />
                <div className={cx('floating-circle', 'circle-3')} />
                <div className={cx('floating-star', 'star-1')}>⭐</div>
                <div className={cx('floating-star', 'star-2')}>🎉</div>
                <div className={cx('floating-star', 'star-3')}>✨</div>
            </div>

            <main className={cx('main-content')}>
                <motion.div 
                    className={cx('container')}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Success Header */}
                    <motion.div className={cx('success-header')} variants={itemVariants}>
                        <div className={cx('success-icon')}>
                            <img src={successGif} alt="Success" />
                        </div>
                        <Title level={2} className={cx('success-title')}>
                            Đặt hàng thành công! 🎉
                        </Title>
                        <Paragraph className={cx('success-subtitle')}>
                            Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>Techify</strong>. 
                            Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
                        </Paragraph>
                    </motion.div>

                    {/* Order Info Cards */}
                    <motion.div className={cx('info-cards')} variants={itemVariants}>
                        <Card className={cx('info-card')}>
                            <div className={cx('card-header')}>
                                <UserOutlined className={cx('card-icon')} />
                                <Text strong>Thông tin người nhận</Text>
                            </div>
                            <div className={cx('card-content')}>
                                <Text className={cx('info-value')}>{payment.fullName || 'Không có thông tin'}</Text>
                            </div>
                        </Card>

                        <Card className={cx('info-card')}>
                            <div className={cx('card-header')}>
                                <EnvironmentOutlined className={cx('card-icon')} />
                                <Text strong>Địa chỉ giao hàng</Text>
                            </div>
                            <div className={cx('card-content')}>
                                <Text className={cx('info-value')}>{payment.address || 'Không có thông tin'}</Text>
                            </div>
                        </Card>

                        <Card className={cx('info-card')}>
                            <div className={cx('card-header')}>
                                <PhoneOutlined className={cx('card-icon')} />
                                <Text strong>Số điện thoại</Text>
                            </div>
                            <div className={cx('card-content')}>
                                <Text className={cx('info-value')}>{payment.phone ? `0${payment.phone}` : 'Không có thông tin'}</Text>
                        </div>
                        </Card>

                        <Card className={cx('info-card')}>
                            <div className={cx('card-header')}>
                                <CreditCardOutlined className={cx('card-icon')} />
                                <Text strong>Phương thức thanh toán</Text>
                            </div>
                            <div className={cx('card-content')}>
                                <div className={cx('payment-method')}>
                                    <span className={cx('payment-icon')}>
                                        {getPaymentMethodIcon(payment.typePayments)}
                                    </span>
                                    <Text className={cx('info-value')}>
                                        {getPaymentMethodName(payment.typePayments)}
                                    </Text>
                                </div>
                        </div>
                        </Card>
                    </motion.div>

                    {/* Products Section */}
                    <motion.div className={cx('products-section')} variants={itemVariants}>
                        <Card className={cx('products-card')}>
                            <div className={cx('products-header')}>
                                <ShoppingOutlined className={cx('section-icon')} />
                                <Title level={4}>Sản phẩm đã đặt</Title>
                        </div>

                            <div className={cx('products-list')}>
                                {products.length > 0 ? products.map((item, index) => (
                                    <motion.div 
                                        key={index}
                                        className={cx('product-item')}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <div className={cx('product-image')}>
                                            <img 
                                                src={
                                                    item?.variantInfo?.color?.image || 
                                                    (item?.product?.images && item.product.images.length > 0 ? 
                                                        item.product.images[0] : '/placeholder.png')
                                                } 
                                                alt={item?.product?.name || "Sản phẩm"} 
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/placeholder.png';
                                                }}
                                            />
                                        </div>
                                        <div className={cx('product-info')}>
                                            <Text strong className={cx('product-name')}>
                                                {item?.product?.name || "Sản phẩm không có tên"}
                                            </Text>
                                            {item?.variantInfo && (
                                                <div className={cx('variant-info')}>
                                                    {item.variantInfo.color && (
                                                    <div className={cx('color-info')}>
                                                        <span className={cx('variant-label')}>Màu sắc:</span>
                                                        <span className={cx('color-name')}>
                                                                {item.variantInfo.color.name || "Không có thông tin"}
                                                        </span>
                                                            {item.variantInfo.color.code && (
                                                        <span 
                                                            className={cx('color-dot')} 
                                                                    style={{ backgroundColor: item.variantInfo.color.code }}
                                                        ></span>
                                                            )}
                                                    </div>
                                                    )}
                                                    {item.variantInfo.storage && item.variantInfo.storage.displayName && (
                                                        <div className={cx('storage-info')}>
                                                            <span className={cx('variant-label')}>Phiên bản:</span>
                                                            <span className={cx('storage-name')}>
                                                                {item.variantInfo.storage.displayName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <Text className={cx('product-quantity')}>
                                                Số lượng: <strong>x{item?.quantity || 0}</strong>
                                            </Text>
                                        </div>
                                        <div className={cx('product-price')}>
                                            <Text strong>
                                                {formatPrice(getItemPrice(item))}₫
                                            </Text>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className={cx('no-products')}>
                                        <Text>Không có sản phẩm nào</Text>
                                    </div>
                                )}
                            </div>

                            <Divider />
                            
                            {/* Trong phần hiển thị total-section, cập nhật để hiển thị đúng khi giảm giá 100% */}
                            <div className={cx('total-section')}>
                                {subtotal > 0 && (
                                    <div className={cx('subtotal-row')}>
                                        <Text>Tạm tính:</Text>
                                        <Text>{formatPrice(subtotal)}₫</Text>
                                    </div>
                                )}
                                
                                {couponInfo && couponInfo.discount > 0 && (
                                    <div className={cx('discount-row')}>
                                        <Text>
                                            <span className={cx('discount-label')}>Giảm giá:</span>
                                            <Tag color="success" className={cx('coupon-tag')}>
                                                {couponInfo.nameCoupon || "Mã giảm giá"}
                                                {couponInfo.fullDiscount && " (100%)"}
                                            </Tag>
                                        </Text>
                                        <Text className={cx('discount-value')}>
                                            -{formatPrice(couponInfo.discount || 0)}₫
                                        </Text>
                                    </div>
                                )}
                                
                                <div className={cx('total-row')}>
                                    <Text strong size="large">Tổng cộng:</Text>
                                    <Title level={4} className={cx('total-price')}>
                                        {payment.totalPrice === 0 && couponInfo?.fullDiscount ? (
                                            <span className={cx('free-price')}>
                                                0₫ <span className={cx('free-label')}>(Miễn phí)</span>
                                            </span>
                                        ) : (
                                            formatPrice(Math.max(0, payment.totalPrice || 0)) + '₫'
                                        )}
                                    </Title>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Status Timeline */}
                    <motion.div className={cx('status-section')} variants={itemVariants}>
                        <Card className={cx('status-card')}>
                            <div className={cx('status-header')}>
                                <TruckOutlined className={cx('section-icon')} />
                                <Title level={4}>Trạng thái đơn hàng</Title>
                            </div>
                            
                            <div className={cx('timeline')}>
                                <div className={cx('timeline-item', 'active')}>
                                    <div className={cx('timeline-dot')} />
                                    <div className={cx('timeline-content')}>
                                        <Text strong>Đơn hàng đã được đặt</Text>
                                        <Text type="secondary">Đơn hàng của bạn đã được xác nhận</Text>
                                    </div>
                                </div>
                                <div className={cx('timeline-item', payment.statusOrder === 'completed' ? 'active' : '')}>
                                    <div className={cx('timeline-dot')} />
                                    <div className={cx('timeline-content')}>
                                        <Text>Đang chuẩn bị hàng</Text>
                                        <Text type="secondary">Chúng tôi đang chuẩn bị sản phẩm của bạn</Text>
                                    </div>
                                </div>
                                <div className={cx('timeline-item', payment.statusOrder === 'shipping' ? 'active' : '')}>
                                    <div className={cx('timeline-dot')} />
                                    <div className={cx('timeline-content')}>
                                        <Text>Đang vận chuyển</Text>
                                        <Text type="secondary">Đơn hàng đang trên đường giao đến bạn</Text>
                                    </div>
                                </div>
                                <div className={cx('timeline-item', payment.statusOrder === 'delivered' ? 'active' : '')}>
                                    <div className={cx('timeline-dot')} />
                                    <div className={cx('timeline-content')}>
                                        <Text>Giao hàng thành công</Text>
                                        <Text type="secondary">Đơn hàng đã được giao đến địa chỉ của bạn</Text>
                        </div>
                    </div>
                </div>
                        </Card>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div className={cx('actions')} variants={itemVariants}>
                        <Space size="large" wrap>
                            <Button 
                                type="primary" 
                                icon={<HomeOutlined />}
                                size="large"
                                className={cx('action-btn', 'primary')}
                                onClick={() => navigate('/')}
                            >
                                Tiếp tục mua sắm
                            </Button>
                            
                            <Button 
                                icon={<HistoryOutlined />}
                                size="large"
                                className={cx('action-btn')}
                                onClick={() => navigate(`/info-user/${payment.userId || ''}`)}
                            >
                                Xem lịch sử đơn hàng
                            </Button>
                        </Space>
                    </motion.div>

                    {/* Thank You Message */}
                    <motion.div className={cx('thank-you')} variants={itemVariants}>
                        <Text type="secondary" className={cx('thank-you-text')}>
                            Cảm ơn bạn đã lựa chọn Techify! Chúng tôi hy vọng bạn sẽ hài lòng với sản phẩm. 
                            Nếu có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.
                        </Text>
                    </motion.div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}

export default Payments;
