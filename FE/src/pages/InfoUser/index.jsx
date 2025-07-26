import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';
import Header from '../../Components/Header/Header';
import { UserOutlined, ShoppingOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import VerifiedBadge from '../../../Components/VerifiedBadge/VerifiedBadge';

import InfoUser from './Components/InfoUser/InfoUser';
import { useStore } from '../../hooks/useStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const cx = classNames.bind(styles);

function InfoUserPage() {
    const { dataUser, logoutUser } = useStore();

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const handleLogOut = async () => {
        await logoutUser();
        navigate('/');
    };

    const menuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Trang cá nhân',
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Quản lý đơn hàng',
        },
        {
            key: 'password',
            icon: <LockOutlined />,
            label: 'Đổi mật khẩu',
            onClick: () => setIsOpen(true),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogOut,
        },
    ];

    return (
        <div className={cx('wrapper')}>
            <header>
                <Header />
            </header>

            <main className={cx('main')}>
                <div className={cx('container')}>
                    <div className={cx('left')}>
                        <div className={cx('avatar')}>
                            <img
                                src={
                                    dataUser.avatar
                                        ? `http://localhost:3000/uploads/avatars/${dataUser.avatar}`
                                        : 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png'
                                }
                                alt="avatar"
                            />
                            <h4>
                                {dataUser.fullName}
                                {dataUser.isAdmin && <VerifiedBadge size="medium" className={cx('profile-badge')} />}
                            </h4>
                            <span className={cx('email')}>{dataUser.email}</span>
                        </div>
                        <div className={cx('info')}>
                            <ul>
                                {menuItems.map((item) => (
                                    <li
                                        key={item.key}
                                        className={activeTab === item.key ? cx('active') : ''}
                                        onClick={() => {
                                            if (item.onClick) {
                                                item.onClick();
                                            } else {
                                                setActiveTab(item.key);
                                            }
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={cx('right')}>
                        <InfoUser
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default InfoUserPage;
