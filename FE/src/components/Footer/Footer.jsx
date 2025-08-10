import classNames from 'classnames/bind';
import styles from './Footer.module.scss';
import { 
    FacebookOutlined, 
    InstagramOutlined, 
    YoutubeOutlined, 
    TwitterOutlined,
    LinkedinOutlined,
    PhoneOutlined, 
    MailOutlined, 
    ClockCircleOutlined, 
    EnvironmentOutlined,
    ShoppingOutlined,
    SafetyCertificateOutlined,
    CustomerServiceOutlined,
    GiftOutlined
} from '@ant-design/icons';
import logo from '../../assets/images/logo.png';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

function Footer() {
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
            transition: { duration: 0.6 }
        }
    };

    return (
        <motion.footer 
            className={cx('wrapper')}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
        >
            {/* Main Footer */}
            <div className={cx('main-footer')}>
                <div className={cx('container')}>
                    <div className={cx('footer-content')}>
                        {/* Company Info */}
                        <motion.div className={cx('footer-column', 'company-info')} variants={itemVariants}>
                            <div className={cx('brand-section')}>
                                <img src={logo} alt="Techify Logo" className={cx('footer-logo')} />
                                {/* <h3>Techify</h3> */}
                            </div>
                            <p className={cx('company-desc')}>
                                Thế giới đồ công nghệ hàng đầu Việt Nam. Chúng tôi cam kết mang đến 
                                những sản phẩm công nghệ chính hãng với chất lượng tốt nhất và dịch vụ 
                                hậu mãi hoàn hảo.
                            </p>
                            
                            <div className={cx('contact-info')}>
                                <div className={cx('contact-item')}>
                                    <PhoneOutlined />
                                    <span>Hotline: 1900 100Có</span>
                                </div>
                                <div className={cx('contact-item')}>
                                    <MailOutlined />
                                    <span>contact.techify@gmail.com</span>
                                </div>
                                <div className={cx('contact-item')}>
                                    <ClockCircleOutlined />
                                    <span>8:30 - 22:30 (Hàng ngày)</span>
                                </div>
                            </div>

                            <div className={cx('social-links')}>
                                <a href="#" className={cx('social-link', 'facebook')}>
                                    <FacebookOutlined />
                                </a>
                                <a href="#" className={cx('social-link', 'instagram')}>
                                    <InstagramOutlined />
                                </a>
                                <a href="#" className={cx('social-link', 'youtube')}>
                                    <YoutubeOutlined />
                                </a>
                                <a href="#" className={cx('social-link', 'twitter')}>
                                    <TwitterOutlined />
                                </a>
                                <a href="#" className={cx('social-link', 'linkedin')}>
                                    <LinkedinOutlined />
                                </a>
                            </div>
                        </motion.div>

                        {/* Quick Links */}
                        <motion.div className={cx('footer-column')} variants={itemVariants}>
                            <h4>
                                <ShoppingOutlined />
                                Hỗ trợ khách hàng
                            </h4>
                            <ul>
                                <li><Link to="/about">Giới thiệu về Techify</Link></li>
                                <li><Link to="/purchase-guide">Hướng dẫn mua hàng</Link></li>
                                <li><Link to="/payment-guide">Hướng dẫn thanh toán</Link></li>
                                <li><Link to="/contact">Liên hệ hợp tác</Link></li>
                            </ul>
                        </motion.div>

                        {/* Policies */}
                        <motion.div className={cx('footer-column')} variants={itemVariants}>
                            <h4>
                                <SafetyCertificateOutlined />
                                Chính sách
                            </h4>
                            <ul>
                                <li><Link to="/warranty-policy">Chính sách bảo hành</Link></li>
                                <li><Link to="/return-policy">Chính sách đổi trả</Link></li>
                                <li><Link to="/shipping-policy">Chính sách vận chuyển</Link></li>
                                <li><Link to="/privacy-policy">Chính sách bảo mật</Link></li>
                            </ul>
                        </motion.div>

                        {/* Store Locations */}
                        <motion.div className={cx('footer-column')} variants={itemVariants}>
                            <h4>
                                <EnvironmentOutlined />
                                Hệ thống cửa hàng
                            </h4>
                            <div className={cx('store-list')}>
                                <div className={cx('store-item')}>
                                    <h5>📍 Hà Nội</h5>
                                    <p>442 Phạm Văn Đồng, Q.Bắc Từ Liêm</p>
                                </div>
                                <div className={cx('store-item')}>
                                    <h5>📍 TP.HCM</h5>
                                    <p>123 Nguyễn Văn Linh, Q.7</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className={cx('features-section')}>
                <div className={cx('container')}>
                    <motion.div className={cx('features-grid')} variants={itemVariants}>
                        <div className={cx('feature-item')}>
                            <CustomerServiceOutlined />
                            <div>
                                <h5>Hỗ trợ 24/7</h5>
                                <p>Tư vấn nhiệt tình</p>
                            </div>
                        </div>
                        <div className={cx('feature-item')}>
                            <GiftOutlined />
                            <div>
                                <h5>Ưu đãi hấp dẫn</h5>
                                <p>Khuyến mãi liên tục</p>
                            </div>
                        </div>
                        <div className={cx('feature-item')}>
                            <SafetyCertificateOutlined />
                            <div>
                                <h5>Bảo hành chính hãng</h5>
                                <p>12 tháng bảo hành</p>
                            </div>
                        </div>
                        <div className={cx('feature-item')}>
                            <ShoppingOutlined />
                            <div>
                                <h5>Giao hàng miễn phí</h5>
                                <p>Từ 5 triệu đồng</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>



            {/* Bottom Bar */}
            <div className={cx('bottom-bar')}>
                <div className={cx('container')}>
                    <motion.div className={cx('bottom-content')} variants={itemVariants}>
                        <div className={cx('copyright')}>
                            <p>&copy; 2025 Techify. All right reserved.</p>
                            <p>Design by <strong>@bindbl</strong></p>
                        </div>
                        
                        <div className={cx('trust-badges')}>
                            <div className={cx('badge')}>
                                <SafetyCertificateOutlined />
                                <span>Bộ Công Thương</span>
                            </div>
                            <div className={cx('badge')}>
                                <ShoppingOutlined />
                                <span>TMĐT Uy Tín</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.footer>
    );
}

export default Footer;
