import React, { useEffect, useState } from 'react';
import { 
    CheckCircleOutlined, 
    ShoppingCartOutlined, 
    UserOutlined, 
    LogoutOutlined, 
    CreditCardOutlined, 
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    CloseOutlined,
    HeartOutlined,
    HeartFilled,
    MailOutlined,
    LockOutlined,
    KeyOutlined,
    EyeInvisibleOutlined,
    InfoCircleOutlined,
    WarningOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import styles from './SuccessProgress.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

// Export SUCCESS_TYPES constant with expanded types
export const SUCCESS_TYPES = {
    // Authentication
    LOGIN: 'login',
    LOGIN_FAILED: 'login_failed',
    REGISTER: 'register',
    REGISTER_FAILED: 'register_failed',
    LOGOUT: 'logout',
    
    // Password & OTP
    FORGOT_PASSWORD: 'forgot_password',
    OTP_SENT: 'otp_sent',
    OTP_FAILED: 'otp_failed',
    PASSWORD_RESET_SUCCESS: 'password_reset_success',
    PASSWORD_RESET_FAILED: 'password_reset_failed',
    PASSWORD_UPDATE_SUCCESS: 'password_update_success',
    PASSWORD_UPDATE_FAILED: 'password_update_failed',
    
    // Cart & Shopping
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    CART_UPDATE_FAILED: 'cart_update_failed',
    
    // Payment
    PAYMENT: 'payment',
    PAYMENT_FAILED: 'payment_failed',
    
    // General Updates
    UPDATE_SUCCESS: 'update_success',
    UPDATE_FAILED: 'update_failed',
    
    // Wishlist
    ADD_TO_WISHLIST: 'add_to_wishlist',
    REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
    
    // Profile & Info
    PROFILE_UPDATE_SUCCESS: 'profile_update_success',
    PROFILE_UPDATE_FAILED: 'profile_update_failed',
    
    // General
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

const SuccessProgress = ({ 
    type, 
    message, 
    isVisible, 
    onClose, 
    duration = 3000 
}) => {
    const [progress, setProgress] = useState(100);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            setProgress(100);
            
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev <= 0) {
                        clearInterval(progressInterval);
                        handleClose();
                        return 0;
                    }
                    return prev - (100 / (duration / 100));
                });
            }, 100);

            return () => clearInterval(progressInterval);
        }
    }, [isVisible, duration]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            // Authentication
            case SUCCESS_TYPES.LOGIN:
            case SUCCESS_TYPES.REGISTER:
                return <UserOutlined />;
            case SUCCESS_TYPES.LOGIN_FAILED:
            case SUCCESS_TYPES.REGISTER_FAILED:
                return <CloseCircleOutlined />;
            case SUCCESS_TYPES.LOGOUT:
                return <LogoutOutlined />;
            
            // Password & OTP
            case SUCCESS_TYPES.FORGOT_PASSWORD:
            case SUCCESS_TYPES.OTP_SENT:
                return <MailOutlined />;
            case SUCCESS_TYPES.OTP_FAILED:
                return <CloseCircleOutlined />;
            case SUCCESS_TYPES.PASSWORD_RESET_SUCCESS:
            case SUCCESS_TYPES.PASSWORD_UPDATE_SUCCESS:
                return <LockOutlined />;
            case SUCCESS_TYPES.PASSWORD_RESET_FAILED:
            case SUCCESS_TYPES.PASSWORD_UPDATE_FAILED:
                return <EyeInvisibleOutlined />;
            
            // Cart & Shopping
            case SUCCESS_TYPES.ADD_TO_CART:
                return <ShoppingCartOutlined />;
            case SUCCESS_TYPES.REMOVE_FROM_CART:
                return <DeleteOutlined />;
            case SUCCESS_TYPES.CART_UPDATE_FAILED:
                return <ExclamationCircleOutlined />;
            
            // Payment
            case SUCCESS_TYPES.PAYMENT:
                return <CreditCardOutlined />;
            case SUCCESS_TYPES.PAYMENT_FAILED:
                return <CloseCircleOutlined />;
            
            // Updates
            case SUCCESS_TYPES.UPDATE_SUCCESS:
            case SUCCESS_TYPES.PROFILE_UPDATE_SUCCESS:
                return <EditOutlined />;
            case SUCCESS_TYPES.UPDATE_FAILED:
            case SUCCESS_TYPES.PROFILE_UPDATE_FAILED:
                return <ExclamationCircleOutlined />;
            
            // Wishlist
            case SUCCESS_TYPES.ADD_TO_WISHLIST:
                return <HeartFilled />;
            case SUCCESS_TYPES.REMOVE_FROM_WISHLIST:
                return <HeartOutlined />;
            
            // General
            case SUCCESS_TYPES.SUCCESS:
                return <CheckCircleOutlined />;
            case SUCCESS_TYPES.ERROR:
                return <CloseCircleOutlined />;
            case SUCCESS_TYPES.WARNING:
                return <WarningOutlined />;
            case SUCCESS_TYPES.INFO:
                return <InfoCircleOutlined />;
            
            default:
                return <CheckCircleOutlined />;
        }
    };

    const getMessage = () => {
        if (message) return message;
        
        switch (type) {
            // Authentication
            case SUCCESS_TYPES.LOGIN:
                return 'Đăng nhập thành công!';
            case SUCCESS_TYPES.LOGIN_FAILED:
                return 'Đăng nhập thất bại!';
            case SUCCESS_TYPES.REGISTER:
                return 'Đăng ký thành công!';
            case SUCCESS_TYPES.REGISTER_FAILED:
                return 'Đăng ký thất bại!';
            case SUCCESS_TYPES.LOGOUT:
                return 'Đăng xuất thành công!';
            
            // Password & OTP
            case SUCCESS_TYPES.FORGOT_PASSWORD:
                return 'Yêu cầu khôi phục mật khẩu đã được gửi!';
            case SUCCESS_TYPES.OTP_SENT:
                return 'Mã OTP đã được gửi đến email của bạn!';
            case SUCCESS_TYPES.OTP_FAILED:
                return 'Gửi mã OTP thất bại!';
            case SUCCESS_TYPES.PASSWORD_RESET_SUCCESS:
                return 'Đặt lại mật khẩu thành công!';
            case SUCCESS_TYPES.PASSWORD_RESET_FAILED:
                return 'Đặt lại mật khẩu thất bại!';
            case SUCCESS_TYPES.PASSWORD_UPDATE_SUCCESS:
                return 'Cập nhật mật khẩu thành công!';
            case SUCCESS_TYPES.PASSWORD_UPDATE_FAILED:
                return 'Cập nhật mật khẩu thất bại!';
            
            // Cart & Shopping
            case SUCCESS_TYPES.ADD_TO_CART:
                return 'Đã thêm vào giỏ hàng!';
            case SUCCESS_TYPES.REMOVE_FROM_CART:
                return 'Đã xóa khỏi giỏ hàng!';
            case SUCCESS_TYPES.CART_UPDATE_FAILED:
                return 'Cập nhật giỏ hàng thất bại!';
            
            // Payment
            case SUCCESS_TYPES.PAYMENT:
                return 'Thanh toán thành công!';
            case SUCCESS_TYPES.PAYMENT_FAILED:
                return 'Thanh toán thất bại!';
            
            // Updates
            case SUCCESS_TYPES.UPDATE_SUCCESS:
                return 'Cập nhật thành công!';
            case SUCCESS_TYPES.UPDATE_FAILED:
                return 'Cập nhật thất bại!';
            case SUCCESS_TYPES.PROFILE_UPDATE_SUCCESS:
                return 'Cập nhật hồ sơ thành công!';
            case SUCCESS_TYPES.PROFILE_UPDATE_FAILED:
                return 'Cập nhật hồ sơ thất bại!';
            
            // Wishlist
            case SUCCESS_TYPES.ADD_TO_WISHLIST:
                return 'Đã thêm vào danh sách yêu thích!';
            case SUCCESS_TYPES.REMOVE_FROM_WISHLIST:
                return 'Đã xóa khỏi danh sách yêu thích!';
            
            // General
            case SUCCESS_TYPES.SUCCESS:
                return 'Thành công!';
            case SUCCESS_TYPES.ERROR:
                return 'Có lỗi xảy ra!';
            case SUCCESS_TYPES.WARNING:
                return 'Cảnh báo!';
            case SUCCESS_TYPES.INFO:
                return 'Thông tin!';
            
            default:
                return 'Thành công!';
        }
    };

    const getNotificationClass = () => {
        const failureTypes = [
            SUCCESS_TYPES.LOGIN_FAILED,
            SUCCESS_TYPES.REGISTER_FAILED,
            SUCCESS_TYPES.OTP_FAILED,
            SUCCESS_TYPES.PASSWORD_RESET_FAILED,
            SUCCESS_TYPES.PASSWORD_UPDATE_FAILED,
            SUCCESS_TYPES.CART_UPDATE_FAILED,
            SUCCESS_TYPES.PAYMENT_FAILED,
            SUCCESS_TYPES.UPDATE_FAILED,
            SUCCESS_TYPES.PROFILE_UPDATE_FAILED,
            SUCCESS_TYPES.ERROR
        ];

        const warningTypes = [
            SUCCESS_TYPES.WARNING
        ];

        const infoTypes = [
            SUCCESS_TYPES.INFO,
            SUCCESS_TYPES.FORGOT_PASSWORD,
            SUCCESS_TYPES.OTP_SENT
        ];

        const isFailure = failureTypes.includes(type);
        const isWarning = warningTypes.includes(type);
        const isInfo = infoTypes.includes(type);

        return cx('notification', {
            'visible': isVisible && isAnimating,
            'success': !isFailure && !isWarning && !isInfo,
            'failure': isFailure,
            'warning': isWarning,
            'info': isInfo
        });
    };

    if (!isVisible) return null;

    return (
        <div className={getNotificationClass()}>
            <div className={cx('notification-content')}>
                <div className={cx('icon')}>
                    {getIcon()}
                </div>
                <div className={cx('message')}>
                    {getMessage()}
                </div>
                <button 
                    className={cx('close-button')} 
                    onClick={handleClose}
                    aria-label="Đóng thông báo"
                >
                    <CloseOutlined />
                </button>
            </div>
            <div 
                className={cx('progress-bar')}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default SuccessProgress; 