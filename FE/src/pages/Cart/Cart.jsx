import classNames from 'classnames/bind';
import styles from './Cart.module.scss';
import Header from '../../Components/Header/Header';
import Footer from '../../Components/Footer/Footer';

import { Button, Form, Input, Card, Space, InputNumber, Badge, Tag, Divider } from 'antd';
import { useEffect, useState } from 'react';
import { requestDeleteCart, requestPayment, requestUpdateInfoUserCart, requestApplyCoupon, requestUpdateCartQuantity } from '../../Config/request';
import { message } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { 
    ShoppingOutlined, 
    DeleteOutlined, 
    PlusOutlined, 
    MinusOutlined,
    ShoppingCartOutlined,
    CreditCardOutlined,
    PhoneOutlined,
    UserOutlined,
    EnvironmentOutlined,
    GiftOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    TagOutlined,
    MobileOutlined
} from '@ant-design/icons';

import vnpayLogo from '../../assets/images/vnpay.png';
import momoLogo from '../../assets/images/momo.png';

const cx = classNames.bind(styles);

function Cart() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [quantityLoading, setQuantityLoading] = useState({});

    useEffect(() => {
        document.title = 'Giỏ hàng';
    }, []);

    const { dataCart, fetchCart, removeFromCart } = useStore();

    const handleDelete = async (productId) => {
        await removeFromCart(productId);
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setQuantityLoading(prev => ({ ...prev, [productId]: true }));
        
        try {
            await requestUpdateCartQuantity({
                productId,
                quantity: newQuantity
            });

            await fetchCart();
            message.success('Cập nhật số lượng thành công');
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật số lượng thất bại');
            console.error('Error updating quantity:', error);
        } finally {
            setQuantityLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            const data = {
                fullName: values.fullName,
                phone: values.phone,
                address: values.address,
            };

            await requestUpdateInfoUserCart(data);
            return;
        } catch (error) {
            message.error('Cập nhật thông tin thất bại');
        } finally {
            setLoading(false);
        }
    };

    const navigate = useNavigate();

    const handlePayments = async (typePayment) => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            await handleSubmit(values);

            switch (typePayment) {
                case 'COD':
                    const codRes = await requestPayment(typePayment);
                    navigate(`/payment/${codRes.metadata}`);
                    fetchCart();
                    break;
                case 'VNPAY':
                    const vnpayRes = await requestPayment(typePayment);
                    window.open(vnpayRes.metadata, '_blank');
                    break;
                case 'MOMO':
                    const momoRes = await requestPayment(typePayment);
                    // MoMo API trả về payUrl hoặc deeplink, ưu tiên payUrl
                    const momoUrl = momoRes?.metadata?.payUrl || momoRes?.metadata?.deeplink || momoRes?.metadata;
                    if (momoUrl) {
                        window.open(momoUrl, '_blank');
                    } else {
                        message.error('Không lấy được liên kết thanh toán MoMo');
                    }
                    break;
                default:
                    message.error('Phương thức thanh toán không hợp lệ');
            }
        } catch (error) {
            if (error.errorFields) {
                message.error('Vui lòng điền đầy đủ thông tin thanh toán');
            } else {
                message.error('Có lỗi xảy ra khi thanh toán');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [nameCoupon, setNameCoupon] = useState('');

    const handleApplyCoupon = async () => {
        if (!nameCoupon.trim()) {
            message.error('Vui lòng nhập mã giảm giá');
            return;
        }
        
        try {
            setLoading(true);
            const data = {
                nameCoupon,
            };
            const response = await requestApplyCoupon(data);
            
            if (response.success) {
            await fetchCart();
            message.success('Áp dụng mã giảm giá thành công');
                setNameCoupon('');
            } else {
                message.error(response.message || 'Áp dụng mã giảm giá thất bại');
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            const errorMessage = error.response?.data?.message || 'Áp dụng mã giảm giá thất bại';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const totalItems = dataCart?.newData?.data?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('container')}>
                    <div className={cx('cart-header')}>
                        <div className={cx('header-left')}>
                            <ShoppingCartOutlined className={cx('cart-icon')} />
                            <div>
                                <h2>Giỏ hàng của bạn</h2>
                                {totalItems > 0 && (
                                    <span className={cx('item-text')}>
                                        {totalItems} sản phẩm
                                    </span>
                                )}
                            </div>
                        </div>
                        {dataCart?.newData?.data?.length > 0 && (
                            <div className={cx('header-right')}>
                                <div className={cx('total-section')}>
                                    <span className={cx('total-label')}>Tổng tiền:</span>
                                    <span className={cx('total-amount')}>
                                {dataCart?.newData?.totalPrice?.toLocaleString('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                })}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {dataCart?.newData?.data?.length > 0 ? (
                        <div className={cx('cart-wrapper')}>
                            <div className={cx('cart-content')}>
                                <div className={cx('cart-section')}>
                                    <div className={cx('section-header')}>
                                        <InfoCircleOutlined />
                                        <h3>Sản phẩm trong giỏ hàng</h3>
                                    </div>
                                    <div className={cx('cart-items')}>
                                        {dataCart.newData.data.map((item, index) => (
                                            <Card key={item._id} className={cx('cart-item')}>
                                                <div className={cx('item-layout')}>
                                                    <div className={cx('item-number')}>
                                                        <span>{index + 1}</span>
                                                    </div>
                                                    
                                                    <div className={cx('item-image')}>
                                                        <img 
                                                            src={item.variant?.color?.image || item.images?.[0]} 
                                                            alt={item.name}
                                                        />
                                                        <div className={cx('image-overlay')}>
                                                            <CheckCircleOutlined />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={cx('item-details')}>
                                                        <div className={cx('item-info')}>
                                                            <h3 className={cx('item-name')}>{item.name}</h3>
                                                            <Tag className={cx('item-id')} color="blue">
                                                                ID: {item._id.slice(-8)}
                                                            </Tag>
                                                            
                                                            {/* Display variant information if available */}
                                                            {item.variant && (
                                                                <div className={cx('variant-info')}>
                                                                    <div className={cx('variant-color')}>
                                                                        <span 
                                                                            className={cx('color-dot')} 
                                                            style={{ backgroundColor: item.variant.color.code || item.variant.color.hexCode }}
                                                                        ></span>
                                                                        <span className={cx('color-name')}>
                                                                            {item.variant.color.name}
                                                                        </span>
                                                                    </div>
                                                                    {item.variant.storage && (
                                                                        <div className={cx('variant-storage')}>
                                                            {item.variant.storage.displayName || item.variant.storage.size}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                            
                                                            <div className={cx('item-price-wrapper')}>
                                                                <DollarOutlined className={cx('price-icon')} />
                                                                <span className={cx('item-price')}>
                                                                    {(item.variant?.price || item.price)?.toLocaleString('vi-VN')} đ
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className={cx('item-actions')}>
                                                            <div className={cx('quantity-control')}>
                                                                <span className={cx('quantity-label')}>
                                                                    <TagOutlined />
                                                                    Số lượng:
                                                                </span>
                                                                <div className={cx('quantity-buttons')}>
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        icon={<MinusOutlined />}
                                                                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1 || quantityLoading[item._id]}
                                                                        className={cx('quantity-btn', 'minus')}
                                                                        loading={quantityLoading[item._id]}
                                                                    />
                                                                    <span className={cx('quantity-value')}>
                                                                        {item.quantity}
                                                                    </span>
                                                                    <Button
                                                                        type="primary"
                                                                        size="small"
                                                                        icon={<PlusOutlined />}
                                                                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                                                        className={cx('quantity-btn', 'plus')}
                                                                        disabled={quantityLoading[item._id]}
                                                                        loading={quantityLoading[item._id]}
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            <Button
                                                                danger
                                                                type="primary"
                                                                icon={<DeleteOutlined />}
                                                                onClick={() => handleDelete(item._id)}
                                                                className={cx('delete-btn')}
                                                            >
                                                                Xóa khỏi giỏ
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={cx('item-total')}>
                                                        <div className={cx('total-label')}>Thành tiền</div>
                                                        <div className={cx('total-price')}>
                                                            {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                                                        </div>
                                                        <div className={cx('calculation')}>
                                                            {item.price?.toLocaleString('vi-VN')} × {item.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                <Divider className={cx('section-divider')} />

                                <div className={cx('coupon-section')}>
                                    <div className={cx('section-header')}>
                                        <GiftOutlined />
                                        <h3>Mã giảm giá</h3>
                            </div>
                            <div className={cx('coupon-container')}>
                                        <div className={cx('coupon-input-wrapper')}>
                                            <Input
                                                placeholder="Nhập mã giảm giá của bạn"
                                        value={nameCoupon}
                                        onChange={(e) => setNameCoupon(e.target.value)}
                                                prefix={<GiftOutlined className={cx('input-icon')} />}
                                                className={cx('coupon-input')}
                                                size="large"
                                    />
                                            <Button
                                                type="primary"
                                                size="large"
                                                onClick={handleApplyCoupon}
                                                className={cx('coupon-btn')}
                                            >
                                                Áp dụng
                                            </Button>
                                        </div>
                                        {dataCart?.newData?.couponApplied && (
                                            <div className={cx('applied-coupon')}>
                                                <div className={cx('coupon-badge')}>
                                                    <CheckCircleOutlined className={cx('check-icon')} />
                                                    <span className={cx('coupon-code')}>{dataCart.newData.couponApplied.nameCoupon}</span>
                                                    <Tag color="success" className={cx('coupon-status')}>Đã áp dụng</Tag>
                                                </div>
                                                <div className={cx('discount-info')}>
                                                    <span className={cx('discount-label')}>Giảm giá:</span>
                                                    <span className={cx('discount-value')}>
                                                        -{dataCart.newData.couponApplied.discount.toLocaleString('vi-VN')}đ
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <div className={cx('coupon-info')}>
                                            <InfoCircleOutlined />
                                            <span>Nhập mã giảm giá để được ưu đãi tốt nhất</span>
                                        </div>
                                    </div>
                                </div>

                                <Divider className={cx('section-divider')} />

                                <div className={cx('checkout-section')}>
                                    <div className={cx('section-header')}>
                                        <CreditCardOutlined />
                                        <h3>Thông tin giao hàng</h3>
                            </div>
                                    <div className={cx('order-summary')}>
                                        <h4>Tóm tắt đơn hàng</h4>
                                        <div className={cx('summary-item')}>
                                            <span>Tạm tính:</span>
                                            <span>{dataCart?.newData?.subtotal?.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        {dataCart?.newData?.couponApplied && (
                                            <div className={cx('summary-item', 'discount')}>
                                                <span>Giảm giá ({dataCart.newData.couponApplied.nameCoupon}):</span>
                                                <span>-{dataCart.newData.couponApplied.discount.toLocaleString('vi-VN')}đ</span>
                                            </div>
                                        )}
                                        <div className={cx('summary-item', 'total')}>
                                            <span>Tổng cộng:</span>
                                            <span>{dataCart?.newData?.totalPrice?.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>
                            <div className={cx('checkout-form')}>
                                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                                            <div className={cx('form-row')}>
                                    <Form.Item
                                        label="Họ và tên"
                                        name="fullName"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                                                    className={cx('form-item')}
                                    >
                                                    <Input 
                                                        placeholder="Nhập họ và tên của bạn" 
                                                        prefix={<UserOutlined className={cx('input-icon')} />}
                                                        size="large"
                                                    />
                                    </Form.Item>

                                    <Form.Item
                                        label="Số điện thoại"
                                        name="phone"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                                        ]}
                                                    className={cx('form-item')}
                                    >
                                                    <Input 
                                                        placeholder="Nhập số điện thoại" 
                                                        prefix={<PhoneOutlined className={cx('input-icon')} />}
                                                        size="large"
                                                    />
                                    </Form.Item>
                                            </div>

                                    <Form.Item
                                                label="Địa chỉ giao hàng"
                                        name="address"
                                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                                                className={cx('form-item')}
                                    >
                                                <Input 
                                                    placeholder="Nhập địa chỉ giao hàng chi tiết" 
                                                    prefix={<EnvironmentOutlined className={cx('input-icon')} />}
                                                    size="large"
                                                />
                                    </Form.Item>

                                            <div className={cx('payment-methods')}>
                                                <h4>Phương thức thanh toán</h4>
                                                <div className={cx('payment-buttons')}>
                                        <Button
                                                        type="primary"
                                                        size="large"
                                            onClick={() => handlePayments('COD')}
                                                        className={cx('payment-btn', 'cod')}
                                            loading={loading}
                                                        icon={<DollarOutlined />}
                                        >
                                            Thanh toán khi nhận hàng
                                        </Button>
                                        <Button
                                                        type="primary"
                                                        size="large"
                                            onClick={() => handlePayments('VNPAY')}
                                                        className={cx('payment-btn', 'vnpay')}
                                            loading={loading}
                                                        icon={<img src={vnpayLogo} alt="VNPay" className={cx('logo-icon')} />}
                                        >
                                            Thanh toán qua VNPAY
                                        </Button>
                                        <Button
                                                        type="primary"
                                                        size="large"
                                            onClick={() => handlePayments('MOMO')}
                                                        className={cx('payment-btn', 'momo')}
                                            loading={loading}
                                                        icon={<img src={momoLogo} alt="MoMo" className={cx('logo-icon')} />}
                                        >
                                            Thanh toán qua MoMo
                                        </Button>
                                                </div>
                                    </div>
                                </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={cx('empty-cart')}>
                            <div className={cx('empty-cart-content')}>
                                <div className={cx('empty-cart-animation')}>
                                <ShoppingOutlined className={cx('empty-cart-icon')} />
                                </div>
                                <h3>Giỏ hàng trống</h3>
                                <p>Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm những sản phẩm yêu thích!</p>
                                <Link to="/" className={cx('back-to-shop')}>
                                    <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                                        Khám phá sản phẩm
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Cart;
