import classNames from 'classnames/bind';
import styles from './LoginUser.module.scss';

import Header from '../../components/Header/Header';

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

import { Input, Button, Space, message } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { requestLogin, requestLoginGoogle } from '../../Config/request';
import { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { SUCCESS_TYPES } from '../../components/ProgressSuccess/SuccessProgress';

import heroImage from '../../assets/images/hero-image.png';

const cx = classNames.bind(styles);

function LoginUser() {
    const navigate = useNavigate();
    const { showSuccessProgress } = useStore();

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const res = await requestLoginGoogle(credential);
            showSuccessProgress(SUCCESS_TYPES.LOGIN, res.message);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            navigate('/');
        } catch (error) {
            message.error(error.response.data.message);
        }
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        
        const data = {
            email,
            password,
        };
        try {
            const res = await requestLogin(data);
            showSuccessProgress(SUCCESS_TYPES.LOGIN, res.metadata.message || 'Đăng nhập thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            navigate('/');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại!';
            showSuccessProgress(SUCCESS_TYPES.LOGIN_FAILED, errorMessage);
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
                                <h2>Chào mừng trở lại!</h2>
                                <p>Đăng nhập để tiếp tục mua sắm và khám phá những sản phẩm tuyệt vời</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Login Form */}
                    <div className={cx('form-section')}>
                        <div className={cx('form-container')}>
                            <div className={cx('form-header')}>
                    <h1>Đăng nhập</h1>
                                <p>Đăng nhập vào tài khoản của bạn</p>
                            </div>

                    <div className={cx('form')}>
                                <div className={cx('input-group')}>
                                    <Input 
                                        prefix={<UserOutlined />}
                                        placeholder="Email" 
                                        size="large"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </div>

                                <div className={cx('input-group')}>
                                    <Input.Password 
                                        prefix={<LockOutlined />}
                                        placeholder="Mật khẩu" 
                                        size="large"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                </div>

                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block 
                                    className={cx('login-btn')}
                                    onClick={handleLogin}
                                >
                            Đăng nhập
                        </Button>

                                <div className={cx('divider')}>
                                    <span>Hoặc</span>
                                </div>

                                <div className={cx('google-login')}>
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                            <GoogleLogin onSuccess={handleSuccess} onError={() => console.log('Login Failed')} />
                        </GoogleOAuthProvider>
                    </div>
                            </div>

                            <div className={cx('form-footer')}>
                                <div className={cx('links')}>
                                    <span>Chưa có tài khoản? </span>
                                    <Link to="/register" className={cx('link')}>Đăng ký ngay</Link>
                                </div>
                                <Link to="/forgot-password" className={cx('forgot-link')}>Quên mật khẩu?</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default LoginUser;
