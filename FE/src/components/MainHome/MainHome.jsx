import classNames from 'classnames/bind';
import styles from './MainHome.module.scss';
import SlideHome from './SlideHome/SlideHome';
import ProductsHome from './ProductsHome/ProductsHome';
import RecommendedProducts from './RecommendedProducts/RecommendedProducts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faDollarSign, 
    faRotateRight, 
    faThumbsUp, 
    faTruck,
    faHeadset,
    faShieldHalved,
    faCreditCard,
    faGift,
    faStar,
    faUsers,
    faLaptop
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useStore } from '../../hooks/useStore';

const cx = classNames.bind(styles);

const features = [
    {
        icon: faTruck,
        title: 'Miễn phí vận chuyển',
        description: 'Cho đơn hàng từ 5 triệu',
        color: '#667eea'
    },
    {
        icon: faRotateRight,
        title: 'Đổi trả miễn phí',
        description: '30 ngày đầu tiên',
        color: '#764ba2'
    },
    {
        icon: faHeadset,
        title: 'Hỗ trợ 24/7',
        description: 'Tư vấn nhiệt tình',
        color: '#f093fb'
    },
    {
        icon: faShieldHalved,
        title: 'Bảo hành chính hãng',
        description: '12 tháng bảo hành',
        color: '#f5576c'
    }
];

const benefits = [
    {
        icon: faCreditCard,
        title: 'Thanh toán an toàn',
        description: 'Hỗ trợ nhiều hình thức thanh toán'
    },
    {
        icon: faGift,
        title: 'Ưu đãi hấp dẫn',
        description: 'Nhiều chương trình khuyến mãi'
    },
    {
        icon: faThumbsUp,
        title: 'Sản phẩm chính hãng',
        description: '100% sản phẩm chính hãng'
    },
    {
        icon: faDollarSign,
        title: 'Giá cả cạnh tranh',
        description: 'Cam kết giá tốt nhất thị trường'
    }
];

const stats = [
    {
        title: '50K+',
        description: 'Khách hàng tin tưởng',
        icon: faUsers,
        color: '#667eea'
    },
    {
        title: '15K+',
        description: 'Sản phẩm đa dạng',
        icon: faLaptop,
        color: '#764ba2'
    },
    {
        title: '99%',
        description: 'Khách hàng hài lòng',
        icon: faStar,
        color: '#f093fb'
    },
    {
        title: '24/7',
        description: 'Hỗ trợ khách hàng',
        icon: faHeadset,
        color: '#f5576c'
    }
];

function MainHome() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6
            }
        }
    };

    return (
        <div className={cx('wrapper')}>
            {/* Hero Section with Slider */}
            <motion.section 
                className={cx('hero-section')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <SlideHome />
            </motion.section>

            {/* Stats Section */}
            <motion.section 
                className={cx('stats-section')}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <div className={cx('container')}>
                    <div className={cx('stats-grid')}>
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className={cx('stat-card')}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className={cx('stat-icon')} style={{ background: stat.color }}>
                                    <FontAwesomeIcon icon={stat.icon} />
                                </div>
                                <div className={cx('stat-content')}>
                                    <h3>{stat.title}</h3>
                                    <p>{stat.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section 
                className={cx('features-section')}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <div className={cx('container')}>
                    <motion.div className={cx('section-header')} variants={itemVariants}>
                        <h2>✨ Tại sao chọn Techify?</h2>
                        <p>Chúng tôi cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất</p>
                    </motion.div>
                    
                    <div className={cx('features-grid')}>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className={cx('feature-card')}
                                variants={itemVariants}
                                whileHover={{ scale: 1.03, y: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className={cx('feature-icon')} style={{ background: feature.color }}>
                                    <FontAwesomeIcon icon={feature.icon} />
                                </div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Products Section */}
            <motion.section 
                className={cx('products-section')}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                <div className={cx('container')}>
                    <motion.div className={cx('section-header')} variants={itemVariants}>
                        <h2>🔥 Sản phẩm hot nhất</h2>
                        <p>Những sản phẩm được yêu thích nhất tại Techify</p>
                    </motion.div>
                </div>
                
                <motion.div variants={itemVariants}>
                    <ProductsHome />
                </motion.div>
            </motion.section>

            {/* Personalized Recommendations Section - Moved here, after Products Section */}
            <motion.section 
                className={cx('recommendations-section')}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                <motion.div variants={itemVariants}>
                    <RecommendedProducts />
                </motion.div>
            </motion.section>

            {/* Benefits Section */}
            <motion.section 
                className={cx('benefits-section')}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
            >
                <div className={cx('container')}>
                    <motion.div className={cx('section-header')} variants={itemVariants}>
                        <h2>🏆 Cam kết chất lượng</h2>
                        <p>Những giá trị cốt lõi mà chúng tôi mang đến cho khách hàng</p>
                    </motion.div>
                    
                    <div className={cx('benefits-grid')}>
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                className={cx('benefit-card')}
                                variants={itemVariants}
                                whileHover={{ scale: 1.03, y: -5 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className={cx('benefit-icon')}>
                                    <FontAwesomeIcon icon={benefit.icon} />
                                </div>
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
}

export default MainHome;
