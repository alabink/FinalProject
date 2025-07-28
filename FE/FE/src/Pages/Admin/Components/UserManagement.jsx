import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Modal, Form, Select, message, Card, Row, Col, Statistic, Avatar, Tag, Tooltip, Divider, Skeleton } from 'antd';
import { 
    SearchOutlined, 
    EditOutlined, 
    UserOutlined, 
    TeamOutlined, 
    CrownOutlined,
    UserSwitchOutlined,
    ReloadOutlined,
    PhoneOutlined,
    MailOutlined,
    FilterOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    LockOutlined,
    UnlockOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    EnvironmentOutlined,
    SafetyCertificateOutlined,
    TrophyOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import { requestGetAllUser, requestUpdateUser } from '../../../Config/request';
import styles from './UserManagement.module.scss';
import classNames from 'classnames/bind';
import { motion } from 'framer-motion';
const cx = classNames.bind(styles);

// Base URL for avatar images
const AVATAR_BASE_URL = 'http://localhost:3000/uploads/avatars/';
// Default avatar image
const DEFAULT_AVATAR = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png';

// Luxury particles effect
const LuxuryParticles = () => {
  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS('luxury-particles', {
        particles: {
          number: { value: 20, density: { enable: true, value_area: 800 } },
          color: { value: "#d4af37" },
          shape: { type: "circle" },
          opacity: { 
            value: 0.6, 
            random: true,
            anim: { enable: true, speed: 0.5, opacity_min: 0.1, sync: false }
          },
          size: { 
            value: 3, 
            random: true,
            anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
          },
          line_linked: { enable: false },
          move: {
            enable: true,
            speed: 1,
            direction: "top",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          }
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "bubble" },
            onclick: { enable: false },
            resize: true
          },
          modes: {
            bubble: { distance: 200, size: 6, duration: 0.4 }
          }
        },
        retina_detect: true
      });
    }
  }, []);

  return <div id="luxury-particles" className={cx('luxury-particles')}></div>;
};

const EditUserModal = ({ visible, onCancel, onOk, initialValues }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue({
                fullName: initialValues.name,
                email: initialValues.email,
                phone: initialValues.phone,
                isAdmin: initialValues.isAdmin,
                address: initialValues.address || '',
            });
        }
    }, [visible, initialValues, form]);

    const handleOk = async () => {
        setLoading(true);
        try {
            const values = await form.validateFields();
            await onOk(values);
            form.resetFields();
            setLoading(false);
        } catch (error) {
            console.error('Validation failed:', error);
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div className={cx('modal-title')}>
                    <UserOutlined className={cx('modal-icon')} />
                    <span>Chỉnh sửa thông tin người dùng</span>
                </div>
            }
            open={visible}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            className={cx('edit-modal')}
            okButtonProps={{ className: cx('modal-ok-button') }}
            cancelButtonProps={{ className: cx('modal-cancel-button') }}
            confirmLoading={loading}
            centered
        >
            <div className={cx('user-avatar-container')}>
                <Avatar 
                    size={80} 
                    icon={<UserOutlined />} 
                    src={initialValues?.avatar ? `${AVATAR_BASE_URL}${initialValues.avatar}` : DEFAULT_AVATAR}
                    className={cx('user-avatar')}
                />
                <div className={cx('user-avatar-name')}>{initialValues?.name}</div>
            </div>
            
            <Form form={form} layout="vertical" className={cx('edit-form')}>
                <Form.Item 
                    name="fullName" 
                    label="Tên người dùng" 
                    rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Nhập tên người dùng" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                >
                    <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                >
                    <Input prefix={<EnvironmentOutlined />} placeholder="Nhập địa chỉ (không bắt buộc)" />
                </Form.Item>
                <Form.Item 
                    name="isAdmin" 
                    label="Quyền người dùng" 
                    rules={[{ required: true, message: 'Vui lòng chọn quyền!' }]}
                >
                    <Select>
                        <Select.Option value={true}>
                            <div className={cx('select-option')}>
                                <CrownOutlined className={cx('option-icon', 'admin')} />
                                <span>Quản trị viên</span>
                            </div>
                        </Select.Option>
                        <Select.Option value={false}>
                            <div className={cx('select-option')}>
                                <UserOutlined className={cx('option-icon', 'user')} />
                                <span>Người dùng thường</span>
                            </div>
                        </Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const UserCard = ({ user, onEdit }) => {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ 
                y: -10, 
                transition: { duration: 0.3 }
            }}
        >
        <Card className={cx('user-card', { 'admin-card': user.isAdmin })}>
            <div className={cx('user-card-header')}>
                <Avatar 
                    size={60} 
                    icon={<UserOutlined />} 
                    src={user.avatar ? `${AVATAR_BASE_URL}${user.avatar}` : DEFAULT_AVATAR}
                    className={cx('user-card-avatar')}
                />
                <div className={cx('user-card-badges')}>
                    {user.isAdmin && (
                        <Tooltip title="Quản trị viên">
                            <div className={cx('admin-badge')}>
                                <CrownOutlined />
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>
            <div className={cx('user-card-info')}>
                <h3 className={cx('user-card-name')}>{user.name}</h3>
                <div className={cx('user-card-email')}>
                    <MailOutlined /> {user.email}
                </div>
                <div className={cx('user-card-phone')}>
                    <PhoneOutlined /> {user.phone || 'Chưa cập nhật'}
                </div>
            </div>
            <div className={cx('user-card-footer')}>
                <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => onEdit(user)}
                    className={cx('edit-button')}
                >
                    Chỉnh sửa
                </Button>
            </div>
                <div className={cx('card-decoration')}></div>
        </Card>
        </motion.div>
    );
};

const UserManagement = () => {
    const [dataUsers, setDataUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [stats, setStats] = useState({
        total: 0,
        admins: 0,
        regularUsers: 0,
        activeUsers: 0
    });

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <div className={cx('user-info-cell')}>
                    <Avatar 
                        size={40} 
                        icon={<UserOutlined />}
                        src={record.avatar ? `${AVATAR_BASE_URL}${record.avatar}` : DEFAULT_AVATAR}
                        className={cx('user-avatar-table')}
                    />
                    <div className={cx('user-details')}>
                        <div className={cx('user-name')}>
                            {record.name}
                            {record.isAdmin && (
                                <Tooltip title="Quản trị viên">
                                    <Tag color="gold" className={cx('role-tag')}>
                                        <CrownOutlined /> Admin
                                    </Tag>
                                </Tooltip>
                            )}
                        </div>
                        <div className={cx('user-email')}>{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 240,
            ellipsis: true,
            render: (id) => (
                <Tooltip title={id} placement="topLeft">
                    <span className={cx('user-id')}>{id}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => (
                <span className={cx('user-phone')}>
                    <PhoneOutlined style={{ marginRight: '8px', color: '#d4af37' }} />
                    {phone || 'Chưa cập nhật'}
                </span>
            ),
        },
        {
            title: 'Quyền',
            dataIndex: 'isAdmin',
            key: 'isAdmin',
            render: (isAdmin) => (
                <Tag color={isAdmin ? 'gold' : 'default'} className={cx('role-tag-full')}>
                    {isAdmin ? <CrownOutlined /> : <UserOutlined />} {isAdmin ? 'Quản trị viên' : 'Người dùng thường'}
                </Tag>
            ),
            filters: [
                { text: 'Quản trị viên', value: true },
                { text: 'Người dùng thường', value: false },
            ],
            onFilter: (value, record) => record.isAdmin === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className={cx('action-buttons')}>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        className={cx('edit-button')}
                    >
                    Chỉnh sửa
                </Button>
                    <Button
                        type={record.isAdmin ? "default" : "primary"}
                        icon={record.isAdmin ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => handleToggleAdmin(record)}
                        className={cx('toggle-admin-button')}
                    >
                        {record.isAdmin ? 'Hủy quyền admin' : 'Cấp quyền admin'}
                    </Button>
                </div>
            ),
        },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
        const res = await requestGetAllUser();
            const users = res.metadata.users;
            setDataUsers(users);
            setFilteredUsers(users);
            
            // Calculate statistics
            setStats({
                total: users.length,
                admins: users.filter(user => user.isAdmin).length,
                regularUsers: users.filter(user => !user.isAdmin).length,
                activeUsers: users.length // Assuming all users are active for now
            });
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            message.error('Không thể tải dữ liệu người dùng');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        handleFilter();
    }, [searchText, filterRole, dataUsers]);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditModalVisible(true);
    };

    const handleToggleAdmin = async (user) => {
        try {
            const data = {
                id: user.id,
                fullName: user.name,
                email: user.email,
                phone: user.phone,
                isAdmin: !user.isAdmin,
            };
            
            await requestUpdateUser(data);
            message.success({
                content: `Đã ${user.isAdmin ? 'hủy quyền' : 'cấp quyền'} quản trị viên thành công!`,
                icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />,
            });
            fetchData(); // Refresh data after update
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật quyền người dùng!');
        }
    };

    const handleEditSubmit = async (values) => {
        try {
            const data = {
                id: selectedUser.id,
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                isAdmin: values.isAdmin,
                address: values.address,
            };
            await requestUpdateUser(data);
            message.success({
                content: 'Cập nhật thông tin thành công!',
                icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />,
            });
            setEditModalVisible(false);
            fetchData(); // Refresh data after update
            return true;
        } catch (error) {
            message.error('Có lỗi xảy ra khi cập nhật thông tin!');
            return false;
        }
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleRoleFilterChange = (value) => {
        setFilterRole(value);
    };

    const handleFilter = () => {
        let filtered = [...dataUsers];
        
        // Apply search filter
        if (searchText) {
            filtered = filtered.filter(
                user => 
                    user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
                    user.phone?.includes(searchText)
            );
        }
        
        // Apply role filter
        if (filterRole !== 'all') {
            const isAdmin = filterRole === 'admin';
            filtered = filtered.filter(user => user.isAdmin === isAdmin);
        }
        
        setFilteredUsers(filtered);
    };

    const handleRefresh = () => {
        fetchData();
        message.success({
            content: 'Dữ liệu đã được làm mới',
            icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />,
        });
    };

    const toggleViewMode = () => {
        setViewMode(viewMode === 'table' ? 'card' : 'table');
    };

    const data = filteredUsers.map((user) => ({
        key: user._id,
        id: user._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        address: user.address
    }));

    const renderSkeletons = () => {
        return Array(4).fill(null).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card className={cx('user-card', 'skeleton-card')}>
                    <Skeleton avatar active paragraph={{ rows: 3 }} />
                </Card>
            </Col>
        ));
    };

    return (
        <div className={cx('user-management')}>
            <LuxuryParticles />
            
            {/* Animated Banner */}
            <motion.div 
                className={cx('banner')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={cx('banner-content')}>
                    <h1 className={cx('banner-title')}>Quản lý người dùng</h1>
                    <p className={cx('banner-description')}>
                        Quản lý và cập nhật thông tin người dùng trong hệ thống
                    </p>
                </div>
                <div className={cx('banner-icon')}>
                    <TeamOutlined />
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div 
                className={cx('stats-row')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} md={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'total-card')}
                        >
                        <Statistic 
                            title="Tổng người dùng" 
                            value={stats.total} 
                                prefix={<SafetyCertificateOutlined />} 
                            loading={loading}
                        />
                        <div className={cx('stat-icon')}>
                            <TeamOutlined />
                        </div>
                        </motion.div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'admin-card')}
                        >
                        <Statistic 
                            title="Quản trị viên" 
                            value={stats.admins} 
                            prefix={<CrownOutlined />} 
                            loading={loading}
                        />
                        <div className={cx('stat-icon')}>
                            <CrownOutlined />
                        </div>
                        </motion.div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'user-card')}
                        >
                        <Statistic 
                            title="Người dùng thường" 
                            value={stats.regularUsers} 
                            prefix={<UserOutlined />} 
                            loading={loading}
                        />
                        <div className={cx('stat-icon')}>
                            <UserOutlined />
                        </div>
                        </motion.div>
                </Col>
                <Col xs={24} sm={12} md={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'active-card')}
                        >
                        <Statistic 
                            title="Người dùng hoạt động" 
                            value={stats.activeUsers} 
                                prefix={<ThunderboltOutlined />} 
                            loading={loading}
                        />
                        <div className={cx('stat-icon')}>
                            <CheckCircleOutlined />
                        </div>
                        </motion.div>
                </Col>
            </Row>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
            <Card className={cx('table-card')}>
                <div className={cx('header')}>
                    <h2>Danh sách người dùng</h2>
                    <div className={cx('filters')}>
                        <Input 
                            placeholder="Tìm kiếm người dùng" 
                            prefix={<SearchOutlined />} 
                            value={searchText}
                            onChange={handleSearch}
                            className={cx('search-input')}
                            allowClear
                        />
                        <Select
                            defaultValue="all"
                            value={filterRole}
                            onChange={handleRoleFilterChange}
                            className={cx('role-filter')}
                            suffixIcon={<FilterOutlined />}
                        >
                            <Select.Option value="all">Tất cả người dùng</Select.Option>
                            <Select.Option value="admin">Quản trị viên</Select.Option>
                            <Select.Option value="user">Người dùng thường</Select.Option>
                        </Select>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleRefresh}
                            className={cx('refresh-button')}
                            loading={loading}
                        />
                        <Button
                            icon={viewMode === 'table' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
                            onClick={toggleViewMode}
                            className={cx('view-mode-button')}
                        >
                            {viewMode === 'table' ? 'Xem dạng thẻ' : 'Xem dạng bảng'}
                        </Button>
                    </div>
                </div>

                <Divider className={cx('divider')} />
                
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                {viewMode === 'table' ? (
                            <div className={cx('table-container')}>
                    <Table 
                        columns={columns} 
                        dataSource={data} 
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng cộng ${total} người dùng`,
                        }}
                        className={cx('users-table')}
                    />
                            </div>
                ) : (
                    <div className={cx('card-view')}>
                                <Row gutter={[24, 24]}>
                            {loading ? (
                                renderSkeletons()
                            ) : (
                                data.map(user => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                                        <UserCard user={user} onEdit={handleEdit} />
                                    </Col>
                                ))
                            )}
                        </Row>
                    </div>
                )}
                    </motion.div>
            </Card>
            </motion.div>

            <EditUserModal
                visible={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                onOk={handleEditSubmit}
                initialValues={selectedUser}
            />
        </div>
    );
};

export default UserManagement;
