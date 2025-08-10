import { Button, Table, Modal, Rate, Input, Select, Card, Space, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { requestCancelOrder, requestCreateProductPreview, requestGetHistoryOrder } from '../../../../Config/request';
import classNames from 'classnames/bind';
import styles from './OrderHistory.module.scss';
import dayjs from 'dayjs';
import { useStore } from '../../../../hooks/useStore';
import { SUCCESS_TYPES } from '../../../../components/ProgressSuccess/SuccessProgress';
import { 
    CheckCircleOutlined, 
    ClockCircleOutlined, 
    CarOutlined, 
    GiftOutlined,
    CloseCircleOutlined 
} from '@ant-design/icons';

const cx = classNames.bind(styles);
const { TextArea } = Input;

function OrderHistory() {
    const [dataOrder, setDataOrder] = useState([]);
    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(5);
    const [reviewContent, setReviewContent] = useState('');
    const { showSuccessProgress } = useStore();

    // Helper function to render order status timeline
    const renderOrderStatusTimeline = (status) => {
        const orderStatuses = [
            { key: 'pending', label: 'Đơn hàng đã được đặt', icon: <CheckCircleOutlined /> },
            { key: 'completed', label: 'Đang chuẩn bị hàng', icon: <ClockCircleOutlined /> },
            { key: 'shipping', label: 'Đang vận chuyển', icon: <CarOutlined /> },
            { key: 'delivered', label: 'Giao hàng thành công', icon: <GiftOutlined /> },
        ];

        const cancelledStatus = { key: 'cancelled', label: 'Đơn hàng đã hủy', icon: <CloseCircleOutlined /> };
        
        if (status === 'cancelled') {
            return (
                <div className={cx('order-timeline', 'cancelled')}>
                    <div className={cx('timeline-item', 'active', 'cancelled')}>
                        <div className={cx('timeline-icon')}>{cancelledStatus.icon}</div>
                        <div className={cx('timeline-content')}>
                            <div className={cx('timeline-label')}>{cancelledStatus.label}</div>
                            <div className={cx('timeline-desc')}>Đơn hàng của bạn đã bị hủy</div>
                        </div>
                    </div>
                </div>
            );
        }

        // Determine current status index
        const currentIndex = orderStatuses.findIndex(s => s.key === status);
        const progressClass = `progress-${Math.max(0, currentIndex)}`;

                return (
            <div className={cx('order-timeline', progressClass)}>
                {orderStatuses.map((statusItem, index) => (
                    <div 
                        key={statusItem.key} 
                        className={cx('timeline-item', {
                            'active': index <= currentIndex,
                            'completed': index < currentIndex,
                            'current': index === currentIndex
                        })}
                    >
                        <div className={cx('timeline-icon')}>{statusItem.icon}</div>
                        <div className={cx('timeline-content')}>
                            <div className={cx('timeline-label')}>{statusItem.label}</div>
                            <div className={cx('timeline-desc')}>
                                {index <= currentIndex ? 'Đã hoàn thành' : 'Đang chờ xử lý'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Removed columns definition as we're now using card-based layout

    const fetchData = async () => {
        const res = await requestGetHistoryOrder();
        setDataOrder(res.metadata.orders);
    };

    const handleCancelOrder = async (id) => {
        try {
            const data = {
                orderId: id,
            };
            await requestCancelOrder(data);
            fetchData();
            showSuccessProgress(SUCCESS_TYPES.UPDATE_SUCCESS, 'Đơn hàng đã được hủy');
        } catch (error) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, error.response.data.message);
        }
    };

    const handleOpenReviewModal = (order) => {
        // Chỉ cho phép đánh giá đơn hàng đã giao thành công
        if (order.statusOrder !== 'delivered') {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Chỉ có thể đánh giá sản phẩm từ đơn hàng đã giao thành công');
            return;
        }
        
        setSelectedOrder(order);
        // Tự động chọn sản phẩm đầu tiên chưa được đánh giá
        const unReviewedProducts = order.products.filter((product) => product.dataPreview.length < 1);
        if (unReviewedProducts.length > 0) {
            setSelectedProduct(unReviewedProducts[0].productId);
        } else {
        setSelectedProduct(null);
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Tất cả sản phẩm trong đơn hàng này đã được đánh giá');
        }
        setRating(5);
        setReviewContent('');
        setIsReviewModalVisible(true);
    };

    const handleCloseReviewModal = () => {
        setIsReviewModalVisible(false);
        setSelectedOrder(null);
        setSelectedProduct(null);
        setRating(5);
        setReviewContent('');
    };

    const handleSubmitReview = async () => {
        if (!selectedProduct) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Không có sản phẩm để đánh giá');
            return;
        }

        if (!reviewContent.trim()) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            const data = {
                productId: selectedProduct,
                orderId: selectedOrder.orderId,
                rating,
                comment: reviewContent,
            };
            await requestCreateProductPreview(data);
            showSuccessProgress(SUCCESS_TYPES.UPDATE_SUCCESS, 'Đánh giá sản phẩm thành công');
            
            // Cập nhật dataPreview của sản phẩm đã đánh giá
            const updatedProducts = selectedOrder.products.map(product => {
                if (product.productId === selectedProduct) {
                    return {
                        ...product,
                        dataPreview: [{ rating, comment: reviewContent }] // Thêm đánh giá mới
                    };
                }
                return product;
            });
            
            const updatedOrder = {
                ...selectedOrder,
                products: updatedProducts
            };
            
            setSelectedOrder(updatedOrder);
            
            // Cập nhật dataOrder để hiển thị ngay lập tức
            const updatedDataOrder = dataOrder.map(order => {
                if (order.orderId === selectedOrder.orderId) {
                    return updatedOrder;
                }
                return order;
            });
            setDataOrder(updatedDataOrder);
            
            // Kiểm tra xem còn sản phẩm nào chưa đánh giá không
            const unReviewedProducts = updatedProducts.filter(
                (product) => product.dataPreview.length < 1
            );
            
            if (unReviewedProducts.length > 0) {
                // Chuyển sang sản phẩm tiếp theo
                setSelectedProduct(unReviewedProducts[0].productId);
                setRating(5);
                setReviewContent('');
                showSuccessProgress(SUCCESS_TYPES.UPDATE_SUCCESS, 'Chuyển sang sản phẩm tiếp theo để đánh giá');
            } else {
                // Đóng modal nếu không còn sản phẩm nào
            handleCloseReviewModal();
                fetchData(); // Reload dữ liệu để cập nhật table
            }
        } catch (error) {
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILURE, 'Có lỗi xảy ra khi gửi đánh giá');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={cx('order-history-container')}>
            <div className={cx('page-header')}>
                <h2 className={cx('page-title')}>Lịch sử đơn hàng</h2>
                <p className={cx('page-subtitle')}>Theo dõi tất cả đơn hàng của bạn</p>
            </div>
            
            <div className={cx('orders-grid')}>
                {dataOrder.length > 0 ? (
                    [...dataOrder].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((order) => (
                        <Card key={order.orderId} className={cx('order-card')}>
                            <div className={cx('order-header')}>
                                <div className={cx('order-id')}>
                                    <span className={cx('order-label')}>Mã đơn hàng:</span>
                                    <span className={cx('order-value')}>#{order.orderId}</span>
                                </div>
                                <div className={cx('order-date')}>
                                    {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
                                </div>
                            </div>

                            <div className={cx('order-content')}>
                                <div className={cx('order-products')}>
                                    <h4>Sản phẩm đã mua:</h4>
                                    <div className={cx('products-list')}>
                                        {order.products.map((product) => (
                                            <div key={product.productId} className={cx('product-item')}>
                                                <img src={product.image} alt={product.name} />
                                                <div className={cx('product-info')}>
                                                    <span className={cx('product-name')}>{product.name}</span>
                                                    <span className={cx('product-price')}>
                                                        {product.price.toLocaleString('vi-VN')} đ
                                                    </span>
                                                    <span className={cx('product-quantity')}>
                                                        Số lượng: {product.quantity}
                                                    </span>
                                                    {/* Hiển thị phiên bản và màu sắc nếu có */}
                                                    {product.variantInfo && (
                                                        <div className={cx('product-variant')}>
                                                            <span>Phiên bản: <b>{product.variantInfo.storage?.displayName || product.variantInfo.storage?.size}</b></span>
                                                            <span style={{marginLeft: 12}}>Màu sắc: <b>{product.variantInfo.color?.name}</b></span>
                                                        </div>
                                                    )}
                                                    {product.dataPreview.length > 0 && (
                                                        <div className={cx('review-status')}>
                                                            <span className={cx('review-badge')}>
                                                                ✅ Đã đánh giá
                                                            </span>
                                                            <span className={cx('review-rating')}>
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span 
                                                                        key={i} 
                                                                        className={cx('star', { 
                                                                            filled: i < product.dataPreview[0].rating 
                                                                        })}
                                                                    >★</span>
                                                                ))}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {order.couponApplied && order.couponApplied.nameCoupon && (
                                        <div className={cx('detail-item', 'coupon-item')} style={{marginTop: 12}}>
                                            <span className={cx('detail-label')}>Mã giảm giá:</span>
                                            <div className={cx('coupon-details')}>
                                                <span className={cx('coupon-name')}>{order.couponApplied.nameCoupon}</span>
                                                <span className={cx('discount-amount')}>
                                                    -{order.couponApplied.discount.toLocaleString('vi-VN')} đ
                                                </span>
                                            </div>
                                        </div>
                                   )}
                                </div>

                                <div className={cx('order-details')}>
                                    <div className={cx('detail-item')}>
                                        <span className={cx('detail-label')}>Tổng tiền:</span>
                                        <span className={cx('detail-value', 'total-price')}>
                                            {order.totalPrice.toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <span className={cx('detail-label')}>Địa chỉ:</span>
                                        <span className={cx('detail-value')}>{order.address}</span>
                                    </div>
                                    <div className={cx('detail-item')}>
                                        <span className={cx('detail-label')}>Phương thức:</span>
                                        <span className={cx('detail-value')}>{order.typePayments}</span>
                                    </div>
                                </div>

                                <div className={cx('order-timeline-wrapper')}>
                                    <h4>Trạng thái đơn hàng:</h4>
                                    {renderOrderStatusTimeline(order.statusOrder)}
                                </div>

                                <div className={cx('order-actions')}>
                                    <Space>
                                        {order.statusOrder === 'delivered' && 
                                         order.products.some(product => product.dataPreview.length < 1) && (
                                            <Button
                                                type="primary"
                                                onClick={() => handleOpenReviewModal(order)}
                                                className={cx('review-btn')}
                                            >
                                                Đánh giá sản phẩm
                                            </Button>
                                        )}
                                        {order.statusOrder === 'pending' && (
                                            <Button
                                                danger
                                                onClick={() => handleCancelOrder(order.orderId)}
                                                className={cx('cancel-btn')}
                                            >
                                                Hủy đơn hàng
                                            </Button>
                                        )}
                                    </Space>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className={cx('empty-state')}>
                        <p>Bạn chưa có đơn hàng nào</p>
                    </div>
                )}
            </div>

            <Modal
                title="Đánh giá sản phẩm"
                open={isReviewModalVisible}
                onCancel={handleCloseReviewModal}
                onOk={handleSubmitReview}
                okText="Gửi đánh giá"
                cancelText="Hủy"
                width={600}
            >
                <div className={cx('review-modal')}>
                    <div className={cx('product-select')}>
                        <h4>Sản phẩm đang đánh giá:</h4>
                            {selectedOrder?.products
                            .filter((product) => product.productId === selectedProduct)
                                .map((product) => (
                                <div key={product.productId} className={cx('product-option')}>
                                        <img src={product.image} alt={product.name} />
                                    <div className={cx('product-info')}>
                                        <div className={cx('product-name')}>{product.name}</div>
                                        <div className={cx('product-price')}>
                                                {product.price.toLocaleString('vi-VN')} đ
                                        </div>
                                    </div>
                                </div>
                            ))}
                        
                        {/* Hiển thị navigation nếu có nhiều sản phẩm chưa đánh giá */}
                        {selectedOrder?.products.filter((product) => product.dataPreview.length < 1).length > 1 && (
                            <div className={cx('product-navigation')}>
                                <span>Sản phẩm chưa đánh giá: </span>
                                {selectedOrder.products
                                    .filter((product) => product.dataPreview.length < 1)
                                    .map((product, index) => (
                                        <Button
                                            key={product.productId}
                                            type={selectedProduct === product.productId ? 'primary' : 'default'}
                                            size="small"
                                            style={{ marginRight: 8 }}
                                            onClick={() => {
                                                setSelectedProduct(product.productId);
                                                setRating(5);
                                                setReviewContent('');
                                            }}
                                        >
                                            {index + 1}
                                        </Button>
                                ))}
                        </div>
                        )}
                        
                        {/* Hiển thị tổng số sản phẩm đã đánh giá */}
                        <div className={cx('review-summary')}>
                            <span>Đã đánh giá: {selectedOrder?.products.filter(p => p.dataPreview.length > 0).length}</span>
                            <span>Chưa đánh giá: {selectedOrder?.products.filter(p => p.dataPreview.length < 1).length}</span>
                        </div>
                    </div>

                    <div className={cx('review-form')}>
                        <div className={cx('rate-label')}>Đánh giá của bạn:</div>
                        <Rate value={rating} onChange={setRating} />

                        <div className={cx('review-content')}>
                            <TextArea
                                rows={4}
                                placeholder="Nhập nội dung đánh giá của bạn..."
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default OrderHistory;
