import { Modal, Spin, Descriptions, Tag, Divider, Timeline, Badge, Typography, Button, Avatar, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { requestGetOnePayment } from '../../../Config/request';
import classNames from 'classnames/bind';
import styles from './ModalDetailOrder.module.scss';
import { motion } from 'framer-motion';
import { 
    UserOutlined, 
    PhoneOutlined, 
    HomeOutlined, 
    ShoppingOutlined, 
    DollarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CarOutlined,
    StopOutlined,
    PrinterOutlined,
    DownloadOutlined,
    FileDoneOutlined
} from '@ant-design/icons';

const cx = classNames.bind(styles);
const { Title, Text } = Typography;

const ModalDetailOrder = ({ isModalVisible, setIsModalVisible, selectedOrder }) => {
    const [order, setOrder] = useState({});
    const [loading, setLoading] = useState(false);

    // Mapping trạng thái đơn hàng sang icon và màu sắc
    const getStatusInfo = (status) => {
        switch(status) {
            case 'pending':
                return { 
                    icon: <ClockCircleOutlined />, 
                    color: 'orange', 
                    text: 'Chờ xác nhận'
                };
            case 'completed':
                return { 
                    icon: <CheckCircleOutlined />, 
                    color: 'gold', 
                    text: 'Đã xác nhận'
                };
            case 'shipping':
                return { 
                    icon: <CarOutlined />, 
                    color: 'blue', 
                    text: 'Đang giao'
                };
            case 'delivered':
                return { 
                    icon: <CheckCircleOutlined />, 
                    color: 'green', 
                    text: 'Đã giao'
                };
            case 'cancelled':
                return { 
                    icon: <StopOutlined />, 
                    color: 'red', 
                    text: 'Đã hủy'
                };
            default:
                return { 
                    icon: <ClockCircleOutlined />, 
                    color: 'default', 
                    text: 'Không xác định'
                };
        }
    };

    // Tạo timeline trạng thái đơn hàng
    const getOrderTimeline = (status) => {
        const allStatuses = ['pending', 'completed', 'shipping', 'delivered'];
        const currentIndex = allStatuses.indexOf(status);
        
        if (status === 'cancelled') {
            return [
                {
                    color: 'green',
                    dot: <CheckCircleOutlined />,
                    children: 'Đơn hàng đã được tạo'
                },
                {
                    color: 'red',
                    dot: <StopOutlined />,
                    children: 'Đơn hàng đã bị hủy'
                }
            ];
        }
        
        return [
            {
                color: 'green',
                dot: <CheckCircleOutlined />,
                children: 'Đơn hàng đã được tạo'
            },
            {
                color: currentIndex >= 1 ? 'gold' : 'gray',
                dot: currentIndex >= 1 ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                children: 'Đã xác nhận'
            },
            {
                color: currentIndex >= 2 ? 'blue' : 'gray',
                dot: currentIndex >= 2 ? <CarOutlined /> : <ClockCircleOutlined />,
                children: 'Đang giao hàng'
            },
            {
                color: currentIndex >= 3 ? 'green' : 'gray',
                dot: currentIndex >= 3 ? <CheckCircleOutlined /> : <ClockCircleOutlined />,
                children: 'Đã giao hàng thành công'
            }
        ];
    };

    useEffect(() => {
        const fetchData = async () => {
            if (selectedOrder === '') {
                return;
            }
            
            setLoading(true);
            try {
            const res = await requestGetOnePayment(selectedOrder);
            setOrder(res.metadata);
            } catch (error) {
                console.error('Error fetching order details:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [isModalVisible, selectedOrder]);

    // Lấy thông tin trạng thái
    const statusInfo = order?.findPayment?.statusOrder 
        ? getStatusInfo(order.findPayment.statusOrder) 
        : { icon: <ClockCircleOutlined />, color: 'default', text: 'Không xác định' };

    // Tạo timeline
    const timelineItems = order?.findPayment?.statusOrder 
        ? getOrderTimeline(order.findPayment.statusOrder)
        : [];

    return (
        <Modal
            title={
                <div className={cx('modal-title')}>
                    <ShoppingOutlined className={cx('title-icon')} />
                    <span>Chi tiết đơn hàng</span>
                    {order?.findPayment?.orderId && (
                        <Tag color="gold" className={cx('order-id-tag')}>
                            #{order.findPayment.orderId.substring(0, 8)}...
                        </Tag>
                    )}
                </div>
            }
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            width={1024}
            footer={
                <div className={cx('modal-footer')}>
                    <Button icon={<PrinterOutlined />} className={cx('print-button')}>
                        In đơn hàng
                    </Button>
                    <Button type="primary" icon={<DownloadOutlined />} className={cx('download-button')}>
                        Tải xuống
                    </Button>
                </div>
            }
            className={cx('order-detail-modal')}
            centered
        >
            {loading ? (
                <div className={cx('loading-container')}>
                    <Spin size="large" />
                    <Text className={cx('loading-text')}>Đang tải thông tin đơn hàng...</Text>
                </div>
            ) : (
            <div className={cx('modalContent')}>
                    {/* Trạng thái đơn hàng */}
                    <motion.div 
                        className={cx('order-status-section')}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className={cx('status-badge')}>
                            <Badge 
                                status={statusInfo.color} 
                                text={
                                    <span className={cx('status-text')}>
                                        {statusInfo.icon} {statusInfo.text}
                                    </span>
                                } 
                            />
                        </div>
                        <div className={cx('order-date')}>
                            <ClockCircleOutlined /> Ngày đặt: {new Date(order?.findPayment?.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </motion.div>

                    <div className={cx('order-content-wrapper')}>
                        <div className={cx('order-main-content')}>
                            {/* Thông tin khách hàng */}
                            <motion.div 
                                className={cx('section', 'customer-section')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <div className={cx('section-header')}>
                                    <Title level={5} className={cx('section-title')}>
                                        <UserOutlined /> Thông tin khách hàng
                                    </Title>
                                </div>
                                <motion.div 
                                    className={cx('customerInfo')}
                                    whileHover={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={cx('customer-avatar')}>
                                        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                                            <Avatar 
                                                size={64} 
                                                icon={<UserOutlined />} 
                                                className={cx('avatar')}
                                            />
                                        </motion.div>
                                    </div>
                                    <div className={cx('customer-details')}>
                                        <div className={cx('info-row')}>
                                            <UserOutlined className={cx('info-icon')} />
                                            <div className={cx('info-content')}>
                                                <div className={cx('info-label')}>Người nhận:</div>
                                                <div className={cx('info-value')}>{order?.findPayment?.fullName}</div>
                                            </div>
                                        </div>
                                        
                                        <div className={cx('info-row')}>
                                            <PhoneOutlined className={cx('info-icon')} />
                                            <div className={cx('info-content')}>
                                                <div className={cx('info-label')}>Số điện thoại:</div>
                                                <div className={cx('info-value')}>0{order?.findPayment?.phone}</div>
                                            </div>
                                        </div>

                                        <div className={cx('info-row')}>
                                            <HomeOutlined className={cx('info-icon')} />
                                            <div className={cx('info-content')}>
                                                <div className={cx('info-label')}>Địa chỉ:</div>
                                                <div className={cx('info-value', 'address')}>{order?.findPayment?.address}</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Danh sách sản phẩm */}
                            <motion.div 
                                className={cx('section', 'products-section')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <div className={cx('section-header')}>
                                    <Title level={5} className={cx('section-title')}>
                                        <ShoppingOutlined /> Danh sách sản phẩm
                                    </Title>
                                    <Badge 
                                        count={order?.dataProduct?.length || 0} 
                                        className={cx('product-count-badge')}
                                        overflowCount={99}
                                    />
                                </div>
                                <div className={cx('productList')}>
                                    {order?.dataProduct?.map((item, index) => (
                                        <motion.div 
                                            key={item?.product?._id + (item?.variantInfo?.sku || '')} 
                                            className={cx('productItem')}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ 
                                                duration: 0.4, 
                                                delay: 0.3 + (index * 0.1),
                                            }}
                                            whileHover={{ y: -5 }}
                                        >
                                            <div className={cx('product-image-container')}>
                                                <motion.img
                                                    className={cx('productImage')}
                                                    src={item?.variantInfo?.color?.image || item?.product.images[0]}
                                                    alt={item?.product?.name}
                                                    whileHover={{ scale: 1.05 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                                <Badge 
                                                    count={item?.quantity} 
                                                    className={cx('quantity-badge')}
                                                    overflowCount={99}
                                                />
                                            </div>
                                            <div className={cx('productDetails')}>
                                                <h4 className={cx('productName')}>{item?.product?.name}</h4>
                                                <div className={cx('productMeta')}>
                                                    <span className={cx('quantity')}>
                                                        <ShoppingOutlined /> Số lượng: x{item?.quantity}
                                                    </span>
                                                    <span className={cx('price')}>
                                                        <DollarOutlined /> {item?.variantPrice?.toLocaleString()} đ
                                                    </span>
                                                </div>
                                                {item?.variantInfo && (
                                                    <div className={cx('variant-info')}>
                                                        {item.variantInfo.color?.name && (
                                                            <Tag color="gold" className={cx('variant-tag')}>
                                                                Màu: {item.variantInfo.color?.name}
                                                            </Tag>
                                                        )}
                                                        {(item.variantInfo.storage?.displayName || item.variantInfo.storage?.size) && (
                                                            <Tag color="gold" className={cx('variant-tag')}>
                                                                Phiên bản: {item.variantInfo.storage?.displayName || item.variantInfo.storage?.size}
                                                            </Tag>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={cx('product-total')}>
                                                <div className={cx('total-label')}>Thành tiền:</div>
                                                <div className={cx('total-value')}>
                                                    {(item?.variantPrice * item?.quantity).toLocaleString()} đ
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>

                        <div className={cx('order-sidebar')}>
                            {/* Tiến trình đơn hàng */}
                            <motion.div 
                                className={cx('section', 'timeline-section')}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <div className={cx('section-header')}>
                                    <Title level={5} className={cx('section-title')}>
                                        <FileDoneOutlined /> Tiến trình đơn hàng
                                    </Title>
                                </div>
                                <motion.div 
                                    className={cx('timeline-container')}
                                    whileHover={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Timeline
                                        items={timelineItems}
                                        className={cx('order-timeline')}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Thông tin thanh toán */}
                            <motion.div 
                                className={cx('section', 'payment-section')}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <div className={cx('section-header')}>
                                    <Title level={5} className={cx('section-title')}>
                                        <DollarOutlined /> Thông tin thanh toán
                                    </Title>
                                </div>
                                <motion.div 
                                    className={cx('payment-details')}
                                    whileHover={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={cx('payment-row')}>
                                        <div className={cx('payment-label')}>Phương thức:</div>
                                        <div className={cx('payment-value')}>
                                            <Tag 
                                                color={
                                                    order?.findPayment?.typePayments === 'COD' ? 'gold' : 
                                                    order?.findPayment?.typePayments === 'MOMO' ? 'pink' : 
                                                    order?.findPayment?.typePayments === 'VNPAY' ? 'blue' : 'default'
                                                }
                                            >
                                                {order?.findPayment?.typePayments}
                                            </Tag>
                                        </div>
                                    </div>
                                    <div className={cx('payment-row')}>
                                        <div className={cx('payment-label')}>Tổng tiền sản phẩm:</div>
                                        <div className={cx('payment-value')}>
                                            {order?.findPayment?.totalPrice?.toLocaleString()} đ
                                        </div>
                                    </div>
                                    <div className={cx('payment-row')}>
                                        <div className={cx('payment-label')}>Phí vận chuyển:</div>
                                        <div className={cx('payment-value')}>0 đ</div>
                                    </div>
                                    {order?.findPayment?.couponApplied && order?.findPayment?.couponApplied.nameCoupon && (
                                        <motion.div 
                                            className={cx('payment-row', 'coupon-row')}
                                            initial={{ scale: 0.95 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.3, delay: 0.6 }}
                                            whileHover={{ scale: 1.03 }}
                                        >
                                            <div className={cx('payment-label')}>Mã giảm giá:</div>
                                            <div className={cx('payment-value', 'coupon-value')}>
                                                <div className={cx('coupon-name')}>
                                                    {order.findPayment.couponApplied.nameCoupon}
                                                </div>
                                                <div className={cx('coupon-discount')}>
                                                    -{order.findPayment.couponApplied.discount?.toLocaleString()} đ
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    <Divider className={cx('payment-divider')} />
                                    <motion.div 
                                        className={cx('payment-row', 'total-row')}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.7 }}
                                    >
                                        <div className={cx('payment-label')}>Tổng thanh toán:</div>
                                        <div className={cx('payment-value', 'total-value')}>
                                            {order?.findPayment?.totalPrice?.toLocaleString()} đ
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ModalDetailOrder;
