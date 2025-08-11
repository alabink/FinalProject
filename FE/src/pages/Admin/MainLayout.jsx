import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Tooltip, Badge } from 'antd';
import {
    HomeOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined,
    AppstoreOutlined,
    GiftOutlined,
    BellOutlined,
    LogoutOutlined,
    SettingOutlined,
    BulbOutlined,
    MoonOutlined,
    DashboardOutlined,
    TagOutlined
} from '@ant-design/icons';
import Dashboard from './Components/Dashboard';
import ProductManagement from './Components/ProductManagement';
import UserManagement from './Components/UserManagement';
import AddProduct from './Pages/AddProduct';
import OrderManagement from './Components/OrderManagement';
import EditProduct from './Pages/EditProduct';
import CategoryManagement from './Components/CategoryManagement';
import { requestAdmin } from '../../Config/request';
import { useNavigate, Navigate } from 'react-router-dom';
import cookies from 'js-cookie';
import CouponManagement from './Components/CouponManagement/CouponManagement';
import styles from './MainLayout.module.scss';
import classNames from 'classnames/bind';
import { useStore } from '../../hooks/useStore';
import VerifiedBadge from '../../components/VerifiedBadge/VerifiedBadge';
import logoImage from '../../assets/images/747.png';

const cx = classNames.bind(styles);
const { Header, Sider, Content } = Layout;

const MainLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeComponent, setActiveComponent] = useState('dashboard');
    const [productId, setProductId] = useState();
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('admin-theme');
        if (saved) return saved;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });

    useEffect(() => {
        document.body.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('admin-theme', theme);
    }, [theme]);

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng',
        },
        {
            key: 'category',
            icon: <AppstoreOutlined />,
            label: 'Quản lý danh mục',
        },
        {
            key: 'orders',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý đơn hàng',
        },
        {
            key: 'products',
            icon: <TagOutlined />,
            label: 'Quản lý sản phẩm',
        },
        {
            key: 'coupon',
            icon: <GiftOutlined />,
            label: 'Quản lý mã giảm giá',
        },
    ];

    const pageTitles = {
        dashboard: 'Tổng quan',
        users: 'Quản lý người dùng',
        category: 'Quản lý danh mục',
        orders: 'Quản lý đơn hàng',
        products: 'Quản lý sản phẩm',
        coupon: 'Quản lý mã giảm giá',
        'add-product': 'Thêm sản phẩm mới',
        'edit-product': 'Chỉnh sửa sản phẩm',
    }

    const userMenu = (
        <Menu>
            <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

    const renderComponent = () => {
        switch (activeComponent) {
            case 'dashboard':
                return <Dashboard />;
            case 'products':
                return <ProductManagement setActiveComponent={setActiveComponent} setProductId={setProductId} />;
            case 'add-product':
                return <AddProduct setActiveComponent={setActiveComponent} />;
            case 'edit-product':
                return <EditProduct setActiveComponent={setActiveComponent} productId={productId} />;
            case 'users':
                return <UserManagement />;
            case 'orders':
                return <OrderManagement />;
            case 'category':
                return <CategoryManagement />;
            case 'coupon':
                return <CouponManagement />;
            default:
                return <Dashboard />;
        }
    };

    const navigate = useNavigate();
    const { dataUser } = useStore();

    // Guard: verify admin before rendering
    const [isChecking, setIsChecking] = useState(true);
    const [isAllowed, setIsAllowed] = useState(false);

    // ULTRA SIMPLE and INSTANT redirect logic
    const isLogged = cookies.get('logged');
    
    // Debug logging
    console.log('🔍 Debug - isLogged:', isLogged);
    console.log('🔍 Debug - dataUser:', dataUser);
    console.log('🔍 Debug - dataUser.isAdmin:', dataUser?.isAdmin);
    
    // If not logged in, redirect immediately
    if (!isLogged) {
        console.log('❌ Not logged in, redirecting to home');
        window.location.href = '/';
        return null;
    }
    
    // INSTANT CHECK: If user data exists and is NOT admin, redirect immediately
    if (dataUser && Object.keys(dataUser).length > 0) {
        // Check if user is admin - if not, redirect instantly
        if (dataUser.isAdmin !== true) {
            console.log('❌ INSTANT REDIRECT: User is not admin, going home now!');
            window.location.href = '/';
            return null;
        }
    }
    
    // EXTRA INSTANT CHECK: If user data exists but isAdmin is false, redirect immediately
    if (dataUser && dataUser.isAdmin === false) {
        console.log('❌ EXTRA INSTANT REDIRECT: User isAdmin is false, going home now!');
        window.location.href = '/';
        return null;
    }
    
    // If we reach here, user might be admin or data not loaded yet
    // Continue to backend check for final verification

    useEffect(() => {
        const checkAccess = async () => {
            // Backend verification as fallback
            try {
                await requestAdmin();
                setIsAllowed(true);
            } catch (error) {
                setIsAllowed(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkAccess();
    }, []);

    // Show loading while checking backend
    if (isChecking) {
        return <div>Loading...</div>;
    }
    
    // If backend check failed, redirect
    if (!isAllowed) {
        window.location.href = '/';
        return null;
    }
    
    // FINAL INSTANT CHECK: Redirect non-admin users immediately
    if (dataUser && Object.keys(dataUser).length > 0 && dataUser.isAdmin !== true) {
        console.log('❌ FINAL INSTANT REDIRECT: User is not admin, going home now!');
        window.location.href = '/';
        return null;
    }
    
    // If user data is not loaded yet, show loading
    if (!dataUser || Object.keys(dataUser).length === 0) {
        return <div>Loading...</div>;
    }
    
    // If we reach here, user is confirmed admin, allow access
    console.log('✅ FINAL CHECK PASSED: User is admin, rendering admin page');

    // Custom menu item renderer to add badges and active indicators
    const getMenuItem = (item) => {
        const isActive = activeComponent === item.key;
        
        return (
            <div className={cx('menu-item-wrapper', { active: isActive })}>
                <div className={cx('menu-item-content')}>
                    <span className={cx('menu-item-icon')}>{item.icon}</span>
                    {!collapsed && (
                        <div className={cx('menu-item-text-container')}>
                            <span className={cx('menu-item-label')}>{item.label}</span>
                        </div>
                    )}
                    {!collapsed && item.badge && (
                        <Badge count={item.badge} className={cx('menu-item-badge')} />
                    )}
                </div>
                {isActive && <div className={cx('active-indicator')} />}
            </div>
        );
    };

    return (
        <Layout className={cx('admin-layout', { dark: theme === 'dark' })}>
            <Sider 
                trigger={null} 
                collapsible 
                collapsed={collapsed} 
                width={380} 
                collapsedWidth={88}
                className={cx('sidebar', { collapsed: collapsed })}
            >
                <div className={cx('logo-container', { collapsed })}>
                    <div className={cx('logo-wrapper', { collapsed })}>
                        <img 
                            src={logoImage} 
                            alt="Techify.asia Logo" 
                            className={cx('logo-image', { collapsed })}
                        />
                    </div>
                </div>
                
                <div className={cx('menu-container')}>
                    {menuItems.map(item => (
                        <Tooltip 
                            key={item.key} 
                            title={collapsed ? item.label : ''} 
                            placement="right" 
                            mouseEnterDelay={0.3}
                            overlayClassName={cx('menu-tooltip')}
                        >
                            <div 
                                className={cx('custom-menu-item', { active: activeComponent === item.key, collapsed })}
                                onClick={() => setActiveComponent(item.key)}
                            >
                                {getMenuItem(item)}
                            </div>
                        </Tooltip>
                    ))}
                </div>

                <div className={cx('sidebar-footer', { collapsed })}>
                    <div
                        className={cx('sidebar-theme-toggle', { collapsed })}
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
                    >
                        {theme === 'dark' ? <BulbOutlined /> : <MoonOutlined />}
                    </div>
                </div>
            </Sider>
            <Layout>
                <Header className={cx('header')}>
                    <div className={cx('header-left')}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className={cx('trigger-button')}
                        />
                        <div className={cx('header-title-container')}>
                            <h2 className={cx('page-title')}>
                                {pageTitles[activeComponent]}
                            </h2>
                            <div className={cx('header-decorative-line')}></div>
                        </div>
                    </div>
                    <div className={cx('header-right')}>
                        {/* Đã bỏ theme toggle và notification button ở đây */}
                        <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
                            <div className={cx('user-info')}>
                                <Avatar
                                    src={dataUser.avatar ? `${import.meta.env.VITE_API_URL_IMG}/uploads/avatars/${dataUser.avatar}` : undefined}
                                    icon={<UserOutlined />}
                                />
                                <span className={cx('user-name')}>
                                    {dataUser.fullName || 'Admin'}
                                    {dataUser.isAdmin && <VerifiedBadge size="medium" />}
                                </span>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className={cx('content')}>
                    <div className={cx('content-wrapper')}>
                        {renderComponent()}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
