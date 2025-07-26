import classNames from 'classnames/bind';
import styles from './ForgotPassword.module.scss';
import Header from '../../Components/Header/Header';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { requestForgotPassword, requestResetPassword } from '../../Config/request';

import cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { SUCCESS_TYPES } from '../../../Components/ProgressSuccess/SuccessProgress';
import heroImage from '../../assets/images/hero-image.png';

const cx = classNames.bind(styles);

function ForgotPassword() {
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [email, setEmail] = useState('');
    const { showSuccessProgress } = useStore();

    const navigate = useNavigate();

    useEffect(() => {
        const token = cookies.get('tokenOtp');
        if (token) {
            setIsEmailSent(true);
        }
    }, []);

    const handleSendEmail = async (values) => {
        setLoading(true);
        try {
            await requestForgotPassword(values);
            setEmail(values.email);
            showSuccessProgress(SUCCESS_TYPES.OTP_SENT, 'Mã OTP đã được gửi đến email của bạn!');
            setIsEmailSent(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
            showSuccessProgress(SUCCESS_TYPES.OTP_FAILED, errorMessage);
            
            // Clear any existing cookie if there's an error
            cookies.remove('tokenOtp');
            setIsEmailSent(false);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values) => {
        setLoading(true);
        try {
            await requestResetPassword(values);
            showSuccessProgress(SUCCESS_TYPES.PASSWORD_RESET_SUCCESS, 'Đặt lại mật khẩu thành công!');
            
            // Clear form and state
            form.resetFields();
            setIsEmailSent(false);
            setEmail('');
            cookies.remove('tokenOtp');
            
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
            showSuccessProgress(SUCCESS_TYPES.PASSWORD_RESET_FAILED, errorMessage);
            
            // If token expired or invalid, reset the form
            if (errorMessage.includes('hết hạn') || errorMessage.includes('không hợp lệ')) {
                cookies.remove('tokenOtp');
                setIsEmailSent(false);
                form.resetFields();
                showSuccessProgress(SUCCESS_TYPES.INFO, 'Vui lòng yêu cầu mã OTP mới');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!email) {
            showSuccessProgress(SUCCESS_TYPES.OTP_FAILED, 'Không tìm thấy email. Vui lòng thử lại!');
            setIsEmailSent(false);
            return;
        }

        setResendLoading(true);
        try {
            await requestForgotPassword({ email });
            showSuccessProgress(SUCCESS_TYPES.OTP_SENT, 'Mã OTP mới đã được gửi đến email của bạn!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi lại mã OTP!';
            showSuccessProgress(SUCCESS_TYPES.OTP_FAILED, errorMessage);
            
            // If there's a serious error, go back to email form
            if (errorMessage.includes('không tồn tại') || errorMessage.includes('không hợp lệ')) {
                cookies.remove('tokenOtp');
                setIsEmailSent(false);
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>
            
            <main className={cx('main')}>
                <div className={cx('auth-container')}>
                    {/* Left side - Hero Image */}
                    <div className={cx('hero-section')} style={{ backgroundImage: `url(${heroImage})` }}>
                        <div className={cx('hero-content')}>
                            <div className={cx('hero-text')}>
                                <h2>Khôi phục tài khoản</h2>
                                <p>Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản một cách nhanh chóng và an toàn</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Forgot Password Form */}
                    <div className={cx('form-section')}>
                        <div className={cx('form-container')}>
                {!isEmailSent ? (
                    <Form name="email-form" className={cx('forgot-form')} onFinish={handleSendEmail}>
                                    <div className={cx('form-header')}>
                                        <h1>Quên mật khẩu</h1>
                        <p className={cx('description')}>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu</p>
                                    </div>

                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                        </Form.Item>

                        <Form.Item>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            className={cx('submit-button')} 
                                            size="large" 
                                            block
                                            loading={loading}
                                        >
                                Gửi mã OTP
                            </Button>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form
                        name="reset-password-form"
                        className={cx('forgot-form')}
                        onFinish={handleResetPassword}
                        form={form}
                    >
                                    <div className={cx('form-header')}>
                                        <h1>Đặt lại mật khẩu</h1>
                                        <p className={cx('description')}>
                                            Mã OTP đã được gửi đến email: <strong>{email}</strong>
                                        </p>
                                        <p className={cx('note')}>Mã OTP có hiệu lực trong 5 phút</p>
                                    </div>

                        <Form.Item
                            name="otp"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã OTP!' },
                                { len: 6, message: 'Mã OTP phải có 6 ký tự!' },
                            ]}
                        >
                                        <Input prefix={<KeyOutlined />} placeholder="Nhập mã OTP" size="large" maxLength={6} />
                        </Form.Item>

                        <Form.Item
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" size="large" />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Xác nhận mật khẩu mới"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            className={cx('submit-button')} 
                                            size="large" 
                                            block
                                            loading={loading}
                                        >
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>

                                    <Form.Item>
                                        <Button 
                                            type="default" 
                                            onClick={handleResendOTP}
                                            className={cx('back-button')} 
                                            size="large" 
                                            block
                                            loading={resendLoading}
                                        >
                                            Gửi lại mã OTP
                                        </Button>
                                    </Form.Item>
                    </Form>
                )}
            </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ForgotPassword;
