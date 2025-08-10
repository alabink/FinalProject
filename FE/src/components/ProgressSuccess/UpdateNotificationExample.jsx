import React, { useState } from 'react';
import { Button, Space, Divider } from 'antd';
import SuccessProgress, { SUCCESS_TYPES } from './SuccessProgress';

const UpdateNotificationExample = () => {
    const [notification, setNotification] = useState({
        type: null,
        message: '',
        isVisible: false
    });

    const showNotification = (type, message = '') => {
        setNotification({
            type,
            message,
            isVisible: true
        });
    };

    const closeNotification = () => {
        setNotification(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>Notification Examples - SuccessProgress Component</h2>
            
            <Divider>Authentication</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.LOGIN)}>
                    Đăng nhập thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.LOGIN_FAILED)}>
                    Đăng nhập thất bại
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.REGISTER)}>
                    Đăng ký thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.REGISTER_FAILED)}>
                    Đăng ký thất bại
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.LOGOUT)}>
                    Đăng xuất thành công
                </Button>
            </Space>

            <Divider>Password & OTP</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.FORGOT_PASSWORD)}>
                    Yêu cầu khôi phục mật khẩu
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.OTP_SENT)}>
                    Gửi mã OTP thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.OTP_FAILED)}>
                    Gửi mã OTP thất bại
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PASSWORD_RESET_SUCCESS)}>
                    Đặt lại mật khẩu thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PASSWORD_RESET_FAILED)}>
                    Đặt lại mật khẩu thất bại
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PASSWORD_UPDATE_SUCCESS)}>
                    Cập nhật mật khẩu thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PASSWORD_UPDATE_FAILED)}>
                    Cập nhật mật khẩu thất bại
                </Button>
            </Space>

            <Divider>Cart & Shopping</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.ADD_TO_CART)}>
                    Thêm vào giỏ hàng
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.REMOVE_FROM_CART)}>
                    Xóa khỏi giỏ hàng
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.CART_UPDATE_FAILED)}>
                    Cập nhật giỏ hàng thất bại
                </Button>
            </Space>

            <Divider>Payment</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PAYMENT)}>
                    Thanh toán thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PAYMENT_FAILED)}>
                    Thanh toán thất bại
                </Button>
            </Space>

            <Divider>General Updates</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.UPDATE_SUCCESS)}>
                    Cập nhật thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.UPDATE_FAILED)}>
                    Cập nhật thất bại
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PROFILE_UPDATE_SUCCESS)}>
                    Cập nhật hồ sơ thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.PROFILE_UPDATE_FAILED)}>
                    Cập nhật hồ sơ thất bại
                </Button>
            </Space>

            <Divider>Wishlist</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.ADD_TO_WISHLIST)}>
                    Thêm vào yêu thích
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.REMOVE_FROM_WISHLIST)}>
                    Xóa khỏi yêu thích
                </Button>
            </Space>

            <Divider>General Notifications</Divider>
            <Space wrap>
                <Button type="primary" onClick={() => showNotification(SUCCESS_TYPES.SUCCESS)}>
                    Thành công
                </Button>
                <Button danger onClick={() => showNotification(SUCCESS_TYPES.ERROR)}>
                    Lỗi
                </Button>
                <Button style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b', color: 'white' }} 
                        onClick={() => showNotification(SUCCESS_TYPES.WARNING)}>
                    Cảnh báo
                </Button>
                <Button style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: 'white' }} 
                        onClick={() => showNotification(SUCCESS_TYPES.INFO)}>
                    Thông tin
                </Button>
            </Space>

            <Divider>Custom Messages</Divider>
            <Space wrap>
                <Button onClick={() => showNotification(SUCCESS_TYPES.SUCCESS, 'Thông báo tùy chỉnh cho thành công!')}>
                    Thông báo tùy chỉnh - Thành công
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.ERROR, 'Đây là thông báo lỗi với nội dung tùy chỉnh!')}>
                    Thông báo tùy chỉnh - Lỗi
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.WARNING, 'Cảnh báo: Hành động này có thể gây rủi ro!')}>
                    Thông báo tùy chỉnh - Cảnh báo
                </Button>
                <Button onClick={() => showNotification(SUCCESS_TYPES.INFO, 'Thông tin: Tính năng mới đã được cập nhật!')}>
                    Thông báo tùy chỉnh - Thông tin
                </Button>
            </Space>

            <SuccessProgress
                type={notification.type}
                message={notification.message}
                isVisible={notification.isVisible}
                onClose={closeNotification}
                duration={5000}
            />
        </div>
    );
};

export default UpdateNotificationExample; 