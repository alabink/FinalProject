import classNames from 'classnames/bind';
import styles from './RegisterUser.module.scss';
import Header from '../../components/Header/Header';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Button, Input, Space } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { requestRegister, requestLoginGoogle } from '../../Config/request';
import { useStore } from '../../hooks/useStore';
import { SUCCESS_TYPES } from '../../components/ProgressSuccess/SuccessProgress';
import heroImage from '../../assets/images/hero-image.png';

const cx = classNames.bind(styles);

function RegisterUser() {
    const navigate = useNavigate();
    const { showSuccessProgress } = useStore();
    
    // Form states
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSuccess = async (response) => {
        try {
            const { credential } = response;
            const res = await requestLoginGoogle(credential);
            showSuccessProgress(SUCCESS_TYPES.LOGIN, res.metadata.message || 'Đăng nhập thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 3000);
            navigate('/');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng nhập bằng Google thất bại!';
            showSuccessProgress(SUCCESS_TYPES.LOGIN_FAILED, errorMessage);
        }
    };

    const validateForm = () => {
        if (!firstname.trim()) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng nhập họ!');
            return false;
        }
        if (!lastname.trim()) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng nhập tên!');
            return false;
        }
        if (!email.trim()) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng nhập email!');
            return false;
        }
        if (!phone.trim()) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng nhập số điện thoại!');
            return false;
        }
        if (!password) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng nhập mật khẩu!');
            return false;
        }
        if (password.length < 6) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Mật khẩu phải có ít nhất 6 ký tự!');
            return false;
        }
        if (!confirmPassword) {
            showSuccessProgress(SUCCESS_TYPES.ERROR, 'Vui lòng xác nhận mật khẩu!');
            return false;
        }
        if (password !== confirmPassword) {
            showSuccessProgress(SUCCESS_TYPES.WARNING, 'Mật khẩu xác nhận không khớp!');
            return false;
        }
        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const data = {
                firstname: firstname.trim(),
                lastname: lastname.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password
            };
            
            const res = await requestRegister(data);
            showSuccessProgress(SUCCESS_TYPES.REGISTER, res.metadata.message || 'Đăng ký thành công!');
            
            // Clear form
            setFirstname('');
            setLastname('');
            setEmail('');
            setPhone('');
            setPassword('');
            setConfirmPassword('');
            
            // Redirect to login after 1.5s
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại!';
            showSuccessProgress(SUCCESS_TYPES.REGISTER_FAILED, errorMessage);
        } finally {
            setLoading(false);
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
                                <h2>Tham gia cùng chúng tôi!</h2>
                                <p>Tạo tài khoản để khám phá thế giới công nghệ đầy thú vị và những ưu đãi đặc biệt</p>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Register Form */}
                    <div className={cx('form-section')}>
                        <div className={cx('form-container')}>
                            <div className={cx('form-header')}>
                    <h1>Đăng ký</h1>
                                <p>Tạo tài khoản mới để bắt đầu</p>
                            </div>

                    <div className={cx('form')}>
                                <Space.Compact className={cx('input-group')} style={{ width: '100%' }}>
                                    <Input 
                                        prefix={<UserOutlined />}
                                        placeholder="Họ" 
                                        size="large"
                                        value={firstname}
                                        onChange={(e) => setFirstname(e.target.value)}
                                    />
                                    <Input 
                                        prefix={<UserOutlined />}
                                        placeholder="Tên" 
                                        size="large"
                                        value={lastname}
                                        onChange={(e) => setLastname(e.target.value)}
                                    />
                                </Space.Compact>

                                <div className={cx('input-group')}>
                                    <Input 
                                        prefix={<PhoneOutlined />}
                                        placeholder="Số điện thoại" 
                                        size="large"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)} 
                                    />
                                </div>

                                <div className={cx('input-group')}>
                                    <Input 
                                        prefix={<MailOutlined />}
                                        placeholder="Email" 
                                        size="large"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)} 
                                        type="email"
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

                                <div className={cx('input-group')}>
                                    <Input.Password 
                                        prefix={<LockOutlined />}
                                        placeholder="Xác nhận mật khẩu" 
                                        size="large"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>

                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block 
                                    className={cx('register-btn')}
                                    onClick={handleRegister}
                                    loading={loading}
                                >
                                    Đăng ký
                                </Button>

                                <div className={cx('divider')}>
                                    <span>Hoặc</span>
                                </div>

                                <div className={cx('google-login')}>
                        <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                                        <GoogleLogin 
                                            onSuccess={handleSuccess} 
                                            onError={() => {
                                                showSuccessProgress(
                                                    SUCCESS_TYPES.LOGIN_FAILED, 
                                                    'Đăng nhập bằng Google thất bại!'
                                                );
                                            }} 
                                        />
                        </GoogleOAuthProvider>
                    </div>
                            </div>

                            <div className={cx('form-footer')}>
                                <div className={cx('links')}>
                                    <span>Đã có tài khoản? </span>
                                    <Link to="/login" className={cx('link')}>Đăng nhập ngay</Link>
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

export default RegisterUser;
