import classNames from 'classnames/bind';
import styles from './Header.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useStore } from '../../hooks/useStore';
import useDebounce from '../../hooks/useDebounce';
import { 
    Avatar, 
    Input, 
    Badge, 
    Button,
    Divider,
    Spin 
} from 'antd';
import { 
    UserOutlined, 
    LogoutOutlined, 
    ShoppingCartOutlined, 
    ShoppingOutlined,
    SearchOutlined,
    MenuOutlined,
    LoadingOutlined,
    HeartOutlined,
    DownOutlined,
    SettingOutlined
} from '@ant-design/icons';
import VerifiedBadge from '../VerifiedBadge/VerifiedBadge';
import { requestSearchProduct } from '../../Config/request';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png';

const cx = classNames.bind(styles);

function Header() {
    const { dataUser, dataCart, dataCategory, dataWishlist, logoutUser } = useStore();
    const [keyword, setKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const debouncedValue = useDebounce(keyword, 300);
    const [resultSearch, setResultSearch] = useState([]);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Add body padding to prevent content from going under fixed header
    useEffect(() => {
        document.body.style.paddingTop = '0px';
        return () => {
            document.body.style.paddingTop = '0';
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (!debouncedValue.trim()) {
                setResultSearch([]);
                return;
            }
            setIsSearching(true);
            try {
                const res = await requestSearchProduct(debouncedValue);
                setResultSearch(res.metadata);
            } catch (error) {
                setResultSearch([]);
            } finally {
                setIsSearching(false);
            }
        };
        fetchData();
    }, [debouncedValue]);

    const handleLogout = async () => {
        await logoutUser();
        navigate('/');
    };

    const handleSearchSubmit = (value) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value.trim())}`);
            setKeyword('');
            setResultSearch([]);
            setSearchFocused(false);
        }
    };

    const userDropdownVariants = {
        hidden: { 
            opacity: 0, 
            y: -10, 
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1
        }
    };

    const menuItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.05 }
        }),
        hover: {
            x: 5,
            scale: 1.02,
            transition: { type: 'spring', stiffness: 400, damping: 10 }
        }
    };

    const handleUserDropdownToggle = (e) => {
        e.stopPropagation();
        setUserDropdownOpen(!userDropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setUserDropdownOpen(false);
        }
    };

    useEffect(() => {
        if (userDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        } else {
            document.removeEventListener('click', handleClickOutside);
        }
        
        return () => document.removeEventListener('click', handleClickOutside);
    }, [userDropdownOpen]);

    // Removed sliding animation as requested

    const logoVariants = {
        hover: { 
            scale: 1.1,
            transition: { 
                duration: 0.3, 
                ease: [0.4, 0, 0.2, 1] 
            }
        }
    };

    const navItemVariants = {
        hover: { 
            scale: 1.05, 
            y: -2,
            transition: { 
                type: 'spring',
                stiffness: 400,
                damping: 10
            }
        },
        tap: { scale: 0.95 }
    };

    const searchVariants = {
        focus: { 
            scale: 1.03,
            transition: { 
                type: 'spring',
                stiffness: 300,
                damping: 20
            }
        }
    };

    const rippleVariants = {
        initial: { scale: 0, opacity: 0.5 },
        animate: { 
            scale: 1, 
            opacity: 0,
            transition: { 
                duration: 0.6, 
                ease: 'easeOut' 
            }
        }
    };

    return (
        <header 
            className={cx('header', { 
                scrolled: isScrolled,
                'search-focused': searchFocused 
            })}
        >
            <div className={cx('header-glow')} />
            
            <div className={cx('container')}>
                <div className={cx('header-content')}>
                    {/* Left Side - Logo and Navigation */}
                    <div className={cx('left-section')}>
                        {/* Logo */}
                        <motion.div
                            variants={logoVariants}
                            whileHover="hover"
                            className={cx('logo-wrapper')}
                        >
                            <Link to="/" className={cx('logo')}>
                                <div className={cx('logo-bg')}>
                                    <img src={logo} alt="Techify" />
                                </div>
                                {/* <span className={cx('brand-name')}>TECHIFY</span> */}
                            </Link>
                        </motion.div>

                        {/* Navigation */}
                        <nav className={cx('nav')}>
                            <motion.div 
                                variants={navItemVariants}
                                whileHover="hover" 
                                whileTap="tap"
                            >
                                <Link 
                                    to="/" 
                                    className={cx('nav-item')}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate('/');
                                        window.scrollTo(0, 0);
                                    }}
                                >
                                    <span>Trang chủ</span>
                                    <div className={cx('nav-indicator')} />
                        </Link>
                            </motion.div>
                            {dataCategory?.slice(0, 6).map((category) => (
                                <motion.div 
                                    key={category._id}
                                    variants={navItemVariants}
                                    whileHover="hover" 
                                    whileTap="tap"
                                >
                                    <Link 
                                        to={`/category/${category._id}`}
                                        className={cx('nav-item')}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate(`/category/${category._id}`);
                                            window.scrollTo(0, 0);
                                        }}
                                    >
                                        <span>{category.nameCategory}</span>
                                        <div className={cx('nav-indicator')} />
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                    </div>

                    {/* Right Side - Search and Actions */}
                    <div className={cx('right-section')}>
                        {/* Search */}
                        <div className={cx('search-section')}>
                            <motion.div 
                                className={cx('search-wrapper')}
                                variants={searchVariants}
                                animate={searchFocused ? 'focus' : 'initial'}
                            >
                                <div className={cx('search-container')}>
                                    <div className={cx('search-input-wrapper')}>
                                        <div className={cx('search-icon-left')}>
                                            <SearchOutlined />
                                        </div>
                                        <Input
                                            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                            onPressEnter={() => handleSearchSubmit(keyword)}
                                        onFocus={() => setSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                            className={cx('search-input-field')}
                                        />
                                        <div className={cx('search-divider')} />
                                        <motion.button
                                            className={cx('search-button')}
                                            onClick={() => handleSearchSubmit(keyword)}
                                            disabled={isSearching}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <motion.div
                                                animate={isSearching ? { rotate: 360 } : { rotate: 0 }}
                                                transition={{ duration: 1, repeat: isSearching ? Infinity : 0 }}
                                            >
                                                {isSearching ? <LoadingOutlined /> : <SearchOutlined />}
                                            </motion.div>
                                        </motion.button>
                                    </div>
                                    
                                    {/* Search Suggestions */}
                                    {!keyword && searchFocused && (
                                        <motion.div
                                            className={cx('search-suggestions')}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <div className={cx('suggestion-header')}>
                                                <span>Tìm kiếm phổ biến</span>
                                            </div>
                                            <div className={cx('suggestion-tags')}>
                                                {['iPhone', 'Samsung', 'Laptop', 'Tai nghe', 'Máy tính bảng'].map((tag, index) => (
                                                    <motion.button
                                                        key={tag}
                                                        className={cx('suggestion-tag')}
                                                        onClick={() => {
                                                            setKeyword(tag);
                                                            handleSearchSubmit(tag);
                                                        }}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <SearchOutlined />
                                                        {tag}
                                                    </motion.button>
                                                ))}
                                        </div>
                                        </motion.div>
                                    )}
                                </div>
                                
                                <AnimatePresence>
                                    {resultSearch.length > 0 && searchFocused && (
                                        <motion.div 
                                            className={cx('search-results')}
                                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                        >
                                            <div className={cx('results-header')}>
                                                <span>Kết quả tìm kiếm</span>
                                                <span className={cx('results-count')}>
                                                    {resultSearch.length} sản phẩm
                                                </span>
                                            </div>
                                            
                                            <div className={cx('results-list')}>
                                            {resultSearch.slice(0, 5).map((item, index) => (
                                                <motion.div
                                                    key={item._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    whileHover={{ 
                                                            x: 8, 
                                                            scale: 1.02,
                                                            transition: { duration: 0.2 }
                                                    }}
                                                >
                                                    <Link 
                                                        to={`/product/${item._id}`}
                                                        className={cx('search-item')}
                                                        onClick={() => {
                                                            setKeyword('');
                                                            setResultSearch([]);
                                                            setSearchFocused(false);
                                                        }}
                                                    >
                                                        <div className={cx('item-image')}>
                                                            <img src={item.images?.[0]} alt={item.name} />
                                                                <div className={cx('image-overlay')} />
                                                        </div>
                                                            <div className={cx('item-details')}>
                                                        <div className={cx('item-info')}>
                                                                    <h4 className={cx('item-name')}>{item.name}</h4>
                                                                    <div className={cx('item-meta')}>
                                                                        <span className={cx('item-price')}>
                                                                            {(item.priceDiscount || item.price)?.toLocaleString('vi-VN')}đ
                                                                        </span>
                                                            <span className={cx('item-brand')}>{item.brand}</span>
                                                                    </div>
                                                                </div>
                                                                <div className={cx('item-arrow')}>
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                        <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                                    </svg>
                                                                </div>
                                                        </div>
                                            </Link>
                                                </motion.div>
                                            ))}
                                            </div>
                                            
                                            {resultSearch.length > 5 && (
                                                <motion.div 
                                                    className={cx('view-all')}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                >
                                                    <button 
                                                        onClick={() => handleSearchSubmit(keyword)}
                                                        className={cx('view-all-btn')}
                                                    >
                                                        Xem tất cả {resultSearch.length} kết quả
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <div className={cx('actions')}>
                            {dataUser._id ? (
                                <>
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                    >
                                        <Link 
                                            to="/wishlist" 
                                            className={cx('action-item')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/wishlist');
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            <Badge count={dataWishlist?.length || 0} size="small">
                                                <HeartOutlined className={cx('action-icon')} />
                                            </Badge>
                                            <div className={cx('action-ripple')} />
                                        </Link>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                    >
                                        <Link 
                                            to="/cart" 
                                            className={cx('action-item', 'cart-btn')}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/cart');
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            <Badge count={dataCart?.newData?.data?.length || 0} size="small">
                                                <ShoppingCartOutlined className={cx('action-icon')} />
                                            </Badge>
                                            <div className={cx('action-ripple')} />
                                        </Link>
                                    </motion.div>
                                    
                                    <div className={cx('user-dropdown-container')} ref={dropdownRef}>
                                        <motion.div 
                                            className={cx('user-info', { 'dropdown-open': userDropdownOpen })}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleUserDropdownToggle}
                                        >
                                            <Avatar 
                                                size={40}
                                                src={dataUser.avatar ? 
                                                    (typeof dataUser.avatar === 'object' ? 
                                                        (dataUser.avatar.secure_url || dataUser.avatar.url || dataUser.avatar.path) :
                                                        dataUser.avatar.startsWith('http') ? 
                                                            dataUser.avatar : 
                                                            `${import.meta.env.VITE_API_URL_IMG}/uploads/avatars/${dataUser.avatar}`
                                                    ) : DEFAULT_AVATAR_URL}
                                                className={cx('user-avatar')}
                                            />
                                            <span className={cx('username')}>
                                                {dataUser.fullName?.split(' ').slice(-1)[0] || 'User'}
                                                {dataUser.isAdmin && (
                                                    <VerifiedBadge size="medium" />
                                                )}
                                            </span>
                                            <motion.div 
                                                className={cx('dropdown-arrow')}
                                                animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <DownOutlined />
                                            </motion.div>
                                            <div className={cx('user-status')} />
                                        </motion.div>
                                        
                                        <AnimatePresence>
                                            {userDropdownOpen && (
                                                <motion.div
                                                    className={cx('user-dropdown')}
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className={cx('dropdown-header')}>
                                                        <Avatar 
                                                            size={48}
                                                            src={dataUser.avatar || DEFAULT_AVATAR_URL}
                                                            className={cx('dropdown-avatar')}
                                                        />
                                                        <div className={cx('user-details')}>
                                                            <h4>
                                                                {dataUser.fullName || 'User'}
                                                                {dataUser.isAdmin && (
                                                                    <VerifiedBadge size="medium" />
                                                                )}
                                                            </h4>
                                                            <p>{dataUser.email || 'user@example.com'}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className={cx('dropdown-divider')} />
                                                    
                                                    <div className={cx('dropdown-menu')}>
                                                        <motion.div
                                                            variants={menuItemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover="hover"
                                                            custom={0}
                                                        >
                                                            <Link 
                                                                to={`/info-user/${dataUser._id}`}
                                                                className={cx('dropdown-item')}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setUserDropdownOpen(false);
                                                                    navigate(`/info-user/${dataUser._id}`);
                                                                    window.scrollTo(0, 0);
                                                                }}
                                                            >
                                                                <div className={cx('item-icon')}>
                                                                    <UserOutlined />
                                                                </div>
                                                                <div className={cx('item-content')}>
                                                                    <span className={cx('item-title')}>Hồ sơ của tôi</span>
                                                                    <span className={cx('item-subtitle')}>Xem và chỉnh sửa thông tin</span>
                                                                </div>
                                                            </Link>
                                                        </motion.div>

                                                        <motion.div
                                                            variants={menuItemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover="hover"
                                                            custom={1}
                                                        >
                                                            <Link 
                                                                to={`/info-user/${dataUser._id}`}
                                                                className={cx('dropdown-item')}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setUserDropdownOpen(false);
                                                                    navigate(`/info-user/${dataUser._id}`);
                                                                    window.scrollTo(0, 0);
                                                                }}
                                                            >
                                                                <div className={cx('item-icon')}>
                                                                    <ShoppingOutlined />
                                                                </div>
                                                                <div className={cx('item-content')}>
                                                                    <span className={cx('item-title')}>Đơn hàng của tôi</span>
                                                                    <span className={cx('item-subtitle')}>Theo dõi đơn hàng</span>
                                                                </div>
                                                            </Link>
                                                        </motion.div>

                                                        <motion.div
                                                            variants={menuItemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover="hover"
                                                            custom={2}
                                                        >
                                                            <Link 
                                                                to={`/info-user/${dataUser._id}`}
                                                                className={cx('dropdown-item')}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    setUserDropdownOpen(false);
                                                                    navigate(`/info-user/${dataUser._id}`);
                                                                    window.scrollTo(0, 0);
                                                                }}
                                                            >
                                                                <div className={cx('item-icon')}>
                                                                    <SettingOutlined />
                                                                </div>
                                                                <div className={cx('item-content')}>
                                                                    <span className={cx('item-title')}>Cài đặt</span>
                                                                    <span className={cx('item-subtitle')}>Tùy chỉnh tài khoản</span>
                                                                </div>
                                                            </Link>
                                                        </motion.div>

                                                        <div className={cx('dropdown-divider')} />

                                                        <motion.div
                                                            variants={menuItemVariants}
                                                            initial="hidden"
                                                            animate="visible"
                                                            whileHover="hover"
                                                            custom={3}
                                                        >
                                                            <button 
                                                                className={cx('dropdown-item', 'logout-item')}
                                                                onClick={() => {
                                                                    setUserDropdownOpen(false);
                                                                    handleLogout();
                                                                }}
                                                            >
                                                                <div className={cx('item-icon')}>
                                                                    <LogoutOutlined />
                                                                </div>
                                                                <div className={cx('item-content')}>
                                                                    <span className={cx('item-title')}>Đăng xuất</span>
                                                                    <span className={cx('item-subtitle')}>Thoát khỏi tài khoản</span>
                                                                </div>
                                                            </button>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className={cx('auth-actions')}>
                                    <motion.div 
                                        whileHover={{ scale: 1.05, y: -2 }} 
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link 
                                            to="/login"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/login');
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            <Button type="text" className={cx('login-btn')}>
                                                Đăng nhập
                                                <div className={cx('btn-ripple')} />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                    <motion.div 
                                        whileHover={{ scale: 1.05, y: -2 }} 
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link 
                                            to="/register"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate('/register');
                                                window.scrollTo(0, 0);
                                            }}
                                        >
                                            <Button type="primary" className={cx('register-btn')}>
                                                Đăng ký
                                                <div className={cx('btn-ripple')} />
                                            </Button>
                                        </Link>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                        <Button
                            type="text"
                            icon={<MenuOutlined />}
                            className={cx('mobile-toggle')}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        />
                    </motion.div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div 
                            className={cx('mobile-menu')}
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        >
                            <div className={cx('mobile-search')}>
                                <Input.Search
                                    placeholder="Tìm kiếm..."
                                    onSearch={handleSearchSubmit}
                                    enterButton
                                />
                            </div>
                            
                            <Divider />
                            
                            <div className={cx('mobile-nav')}>
                                <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                                    Trang chủ
                                </Link>
                                {dataCategory?.slice(0, 6).map((category) => (
                                    <Link 
                                        key={category._id}
                                        to={`/category/${category._id}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {category.nameCategory}
                                    </Link>
                                ))}
                                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
                                    Giới thiệu
                                </Link>
                                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                                    Liên hệ
                                </Link>
                            </div>
                            
                            {!dataUser._id && (
                                <>
                                    <Divider />
                                    <div className={cx('mobile-auth')}>
                                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button type="text" block>Đăng nhập</Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                                            <Button type="primary" block>Đăng ký</Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}

export default Header;
