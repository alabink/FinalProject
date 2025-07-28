import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Card, Tag, Modal, Form, message, Popconfirm, Tooltip, Badge, Avatar, Spin, Empty, Switch, Progress, Skeleton } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  AppstoreOutlined, 
  SearchOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  CrownOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import {
    requestCreateCategory,
    requestDeleteCategory,
    requestGetAllCategory,
    requestUpdateCategory,
} from '../../../Config/request';

import { useStore } from '../../../hooks/useStore';
import styles from './CategoryManagement.module.scss';
import classNames from 'classnames/bind';
import { motion } from 'framer-motion';
const cx = classNames.bind(styles);

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

const CategoryManagement = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    const { dataCategory, fetchCategory } = useStore();

    // Nếu dataCategory chưa có (undefined/null), coi như đang loading lần đầu
    const isInitialLoading = !dataCategory || loading;

    // Filter categories based on search text
    const filteredCategories = dataCategory?.filter(
        (category) => category.nameCategory.toLowerCase().includes(searchText.toLowerCase())
    );

    // Calculate statistics
    const totalProducts = dataCategory?.reduce((sum, category) => sum + category.products.length, 0) || 0;
    const averageProductsPerCategory = dataCategory?.length > 0 
        ? Math.round((totalProducts / dataCategory.length) * 10) / 10 
        : 0;
    const categoriesWithProducts = dataCategory?.filter(cat => cat.products.length > 0).length || 0;
    const percentageWithProducts = dataCategory?.length > 0 
        ? Math.round((categoriesWithProducts / dataCategory.length) * 100) 
        : 0;

    // Enhanced color generator based on category name
    const generateColor = (name) => {
        // Luxury-themed color palette
        const luxuryColors = [
            '#d4af37', // Gold
            '#b38728', // Royal Gold
            '#9b7b24', // Luxury Gold Dark
            '#825e17', // Deep Gold
            '#c0c0c0', // Silver
            '#0f1a2f', // Luxury Navy
            '#1c1c1c'  // Luxury Charcoal
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return luxuryColors[Math.abs(hash) % luxuryColors.length];
    };

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            width: '15%',
            render: (id) => (
                <Tooltip title={id}>
                    <span className={cx('category-id')}>{id.substring(0, 8)}...</span>
                </Tooltip>
            ),
        },
        {
            title: 'Tên danh mục',
            dataIndex: 'nameCategory',
            key: 'nameCategory',
            sorter: (a, b) => a.nameCategory.localeCompare(b.nameCategory),
            render: (name) => (
                <div className={cx('category-name')}>
                    <Avatar 
                        className={cx('category-icon')}
                        style={{ 
                            backgroundColor: generateColor(name),
                            color: '#fff'
                        }}
                    >
                        {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <span>{name}</span>
                </div>
            ),
        },
        {
            title: 'Số sản phẩm',
            dataIndex: 'products',
            key: 'products',
            render: (products) => (
                <div className={cx('product-count-wrapper')}>
                    <Badge 
                        count={products.length} 
                        showZero 
                        className={cx('product-count')}
                        style={{ backgroundColor: products.length > 0 ? '#d4af37' : '#f5222d' }}
                    />
                    {products.length > 0 && (
                        <Progress 
                            percent={Math.min(100, Math.round((products.length / Math.max(...dataCategory.map(c => c.products.length))) * 100))} 
                            size="small" 
                            showInfo={false}
                            strokeColor={{
                                '0%': '#d4af37',
                                '100%': '#9b7b24',
                            }}
                            className={cx('product-progress')}
                        />
                    )}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.products.length > 0 ? 'gold' : 'default'} className={cx('status-tag')}>
                    {record.products.length > 0 ? 'Đang sử dụng' : 'Chưa sử dụng'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle" className={cx('action-buttons')}>
                    <Button 
                        type="primary" 
                        icon={<EditOutlined />} 
                        onClick={() => handleEdit(record)}
                        className={cx('edit-button')}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa danh mục này?"
                        description={
                            <div>
                                <p>Xóa danh mục sẽ ảnh hưởng đến các sản phẩm liên quan.</p>
                                {record.products.length > 0 && (
                                    <p className={cx('warning-text')}>
                                        <InfoCircleOutlined /> Danh mục này đang có {record.products.length} sản phẩm!
                                    </p>
                                )}
                            </div>
                        }
                        onConfirm={() => handleDelete(record._id)}
                        okText="Có"
                        cancelText="Không"
                        placement="topRight"
                        icon={<InfoCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button 
                            type="primary" 
                            danger 
                            icon={<DeleteOutlined />}
                            className={cx('delete-button')}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Handlers for category actions
    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingCategory(record);
        form.setFieldsValue({
            name: record.nameCategory,
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (key) => {
        setLoading(true);
        try {
        await requestDeleteCategory(key);
        fetchCategory();
            message.success({
                content: 'Xóa danh mục thành công',
                icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />,
                className: cx('custom-message')
            });
        } catch (error) {
            message.error({
                content: 'Có lỗi xảy ra khi xóa danh mục',
                className: cx('custom-message')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                setLoading(true);
                try {
                if (editingCategory) {
                    const data = {
                        id: editingCategory._id,
                        nameCategory: values.name,
                    };
                    await requestUpdateCategory(data);
                    fetchCategory();
                        message.success({
                            content: 'Cập nhật danh mục thành công',
                            icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />,
                            className: cx('custom-message')
                        });
                } else {
                    const data = {
                        nameCategory: values.name,
                    };
                    await requestCreateCategory(data);
                    fetchCategory();
                        message.success({
                            content: 'Thêm danh mục thành công',
                            icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />,
                            className: cx('custom-message')
                        });
                }
                setIsModalVisible(false);
                form.resetFields();
                } catch (error) {
                    message.error({
                        content: 'Có lỗi xảy ra khi lưu danh mục',
                        className: cx('custom-message')
                    });
                } finally {
                    setLoading(false);
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchCategory().finally(() => setLoading(false));
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    // Render skeleton loaders cho lần đầu hoặc đang loading
    const renderSkeletons = () => {
        return (
            <div className={cx('skeleton-container')}>
                <div className={cx('skeleton-header')}>
                    <Skeleton active paragraph={{ rows: 1 }} title={{ width: '40%' }} />
                    <div className={cx('skeleton-stats')}>
                        <Skeleton.Button active size="large" shape="square" style={{ width: 200, height: 100 }} />
                        <Skeleton.Button active size="large" shape="square" style={{ width: 200, height: 100 }} />
                        <Skeleton.Button active size="large" shape="square" style={{ width: 200, height: 100 }} />
                    </div>
                </div>
                <Skeleton.Button active size="large" shape="square" style={{ width: '100%', height: 60, marginBottom: 20 }} />
                <Skeleton active paragraph={{ rows: 10 }} />
            </div>
        );
    };

    if (isInitialLoading) {
        return renderSkeletons();
    }

    return (
        <div className={cx('category-management')}>
            <LuxuryParticles />
            
            {/* Banner */}
            <motion.div 
                className={cx('banner')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={cx('banner-content')}>
                    <h1 className={cx('banner-title')}>Quản lý danh mục</h1>
                    <p className={cx('banner-description')}>Quản lý và cập nhật danh mục sản phẩm trong hệ thống</p>
                </div>
                <div className={cx('banner-icon')}>
                    <CrownOutlined />
                </div>
            </motion.div>

            {/* Statistic Cards */}
            <motion.div 
                className={cx('stats-cards')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <motion.div 
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className={cx('stat-card')}
                >
                    <div className={cx('stat-icon')}>
                        <SafetyCertificateOutlined />
                    </div>
                    <div className={cx('stat-info')}>
                        <span className={cx('stat-value')}>{dataCategory?.length || 0}</span>
                        <span className={cx('stat-label')}>Tổng danh mục</span>
                    </div>
                    <div className={cx('stat-decoration')}></div>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className={cx('stat-card')}
                >
                    <div className={cx('stat-icon', 'products-icon')}>
                        <TrophyOutlined />
                    </div>
                    <div className={cx('stat-info')}>
                        <span className={cx('stat-value')}>{totalProducts}</span>
                        <span className={cx('stat-label')}>Tổng sản phẩm</span>
                    </div>
                    <div className={cx('stat-decoration')}></div>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    className={cx('stat-card')}
                >
                    <div className={cx('stat-icon', 'average-icon')}>
                        <ThunderboltOutlined />
                    </div>
                    <div className={cx('stat-info')}>
                        <span className={cx('stat-value')}>
                            {averageProductsPerCategory}
                        </span>
                        <span className={cx('stat-label')}>Trung bình SP/danh mục</span>
                    </div>
                    <Progress 
                        type="circle" 
                        percent={percentageWithProducts} 
                        width={46}
                        strokeColor={{
                            '0%': '#d4af37',
                            '100%': '#9b7b24',
                        }}
                        className={cx('stat-circle')}
                    />
                    <div className={cx('stat-decoration')}></div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
            <Card className={cx('control-card')}>
                <div className={cx('card-content')}>
                    <div className={cx('search-area')}>
                        <Input
                            placeholder="Tìm kiếm danh mục..."
                            prefix={<SearchOutlined />}
                            onChange={handleSearch}
                            className={cx('search-input')}
                            allowClear
                        />
                        <div className={cx('view-toggles')}>
                            <Tooltip title="Xem dạng bảng">
                                <Button 
                                    type={viewMode === 'table' ? 'primary' : 'default'}
                                    icon={<UnorderedListOutlined />}
                                    onClick={() => setViewMode('table')}
                                    className={cx('view-toggle-btn')}
                                />
                            </Tooltip>
                            <Tooltip title="Xem dạng lưới">
                                <Button 
                                    type={viewMode === 'grid' ? 'primary' : 'default'}
                                    icon={<AppstoreOutlined />}
                                    onClick={() => setViewMode('grid')}
                                    className={cx('view-toggle-btn')}
                                />
                            </Tooltip>
                        </div>
                    </div>
                    
                    <div className={cx('action-area')}>
                        <Button 
                            type="default"
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            className={cx('refresh-btn')}
                        >
                            Làm mới
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={handleAdd}
                            className={cx('add-btn')}
                        >
                        Thêm danh mục
                    </Button>
                    </div>
                </div>
            </Card>
            </motion.div>

            <motion.div 
                className={cx('content-section')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                {loading ? (
                    <div className={cx('loading-container')}>
                        <Spin size="large" />
                        <p className={cx('loading-text')}>Đang tải dữ liệu...</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className={cx('table-container')}>
                        <div className={cx('table-header')}>
                            <h3>Danh sách danh mục</h3>
                            <div className={cx('table-stats')}>
                                <span>{filteredCategories?.length || 0} danh mục</span>
                                {searchText && <span className={cx('search-result')}>Kết quả tìm kiếm: "{searchText}"</span>}
                            </div>
                        </div>
            <Table
                columns={columns}
                            dataSource={filteredCategories}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                                showTotal: (total) => `Tổng cộng ${total} danh mục`,
                            }}
                            className={cx('category-table')}
                            rowKey="_id"
                            locale={{
                                emptyText: <Empty description="Không có danh mục nào" />
                            }}
                            rowClassName={(record) => cx('table-row', { 'has-products': record.products.length > 0 })}
                        />
                    </div>
                ) : (
                    <div className={cx('grid-container')}>
                        <div className={cx('grid-header')}>
                            <h3>Danh sách danh mục</h3>
                            <div className={cx('grid-stats')}>
                                <span>{filteredCategories?.length || 0} danh mục</span>
                                {searchText && <span className={cx('search-result')}>Kết quả tìm kiếm: "{searchText}"</span>}
                            </div>
                        </div>
                        <div className={cx('category-grid')}>
                            {filteredCategories?.length > 0 ? (
                                filteredCategories.map(category => (
                                    <motion.div
                                        key={category._id}
                                        initial={{ scale: 0.95, opacity: 0.8 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{ 
                                            y: -10, 
                                            transition: { duration: 0.3 }
                                        }}
                                    >
                                        <Card className={cx('category-card', { 'has-products': category.products.length > 0 })}>
                                        <div className={cx('category-card-content')}>
                                            <div className={cx('category-card-header')}>
                                                <Avatar 
                                                    size={64}
                                                    style={{ 
                                                        backgroundColor: generateColor(category.nameCategory),
                                                        color: '#fff'
                                                    }}
                                                    className={cx('category-card-avatar')}
                                                >
                                                    {category.nameCategory.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <div className={cx('category-card-badge-container')}>
                                                    <Badge 
                                                        count={category.products.length} 
                                                        showZero 
                                                        overflowCount={999}
                                                        className={cx('category-card-badge')}
                                                            style={{ backgroundColor: category.products.length > 0 ? '#d4af37' : '#f5222d' }}
                                                    />
                                                </div>
                                            </div>
                                            
                                            <h3>{category.nameCategory}</h3>
                                            
                                            <div className={cx('category-card-stats')}>
                                                    <Tag color={category.products.length > 0 ? 'gold' : 'default'} className={cx('card-status-tag')}>
                                                    {category.products.length > 0 ? 'Đang sử dụng' : 'Chưa sử dụng'}
                                                </Tag>
                                                <span className={cx('products-label')}>
                                                    {category.products.length} sản phẩm
                                                </span>
                                            </div>
                                            
                                            {category.products.length > 0 && (
                                                <Progress 
                                                    percent={Math.min(100, Math.round((category.products.length / Math.max(...dataCategory.map(c => c.products.length))) * 100))} 
                                                    size="small" 
                                                    strokeColor={{
                                                            '0%': '#d4af37',
                                                            '100%': '#9b7b24',
                                                    }}
                                                    className={cx('category-progress')}
                                                />
                                            )}
                                            
                                            <div className={cx('category-card-actions')}>
                                                <Button 
                                                    type="primary" 
                                                    icon={<EditOutlined />} 
                                                    onClick={() => handleEdit(category)}
                                                    className={cx('card-edit-btn')}
                                                >
                                                    Sửa
                                                </Button>
                                                <Popconfirm
                                                    title="Bạn có chắc chắn muốn xóa danh mục này?"
                                                    description={
                                                        <div>
                                                            <p>Xóa danh mục sẽ ảnh hưởng đến các sản phẩm liên quan.</p>
                                                            {category.products.length > 0 && (
                                                                <p className={cx('warning-text')}>
                                                                    <InfoCircleOutlined /> Danh mục này đang có {category.products.length} sản phẩm!
                                                                </p>
                                                            )}
                                                        </div>
                                                    }
                                                    onConfirm={() => handleDelete(category._id)}
                                                    okText="Có"
                                                    cancelText="Không"
                                                    placement="topRight"
                                                    icon={<InfoCircleOutlined style={{ color: 'red' }} />}
                                                >
                                                    <Button 
                                                        type="primary" 
                                                        danger 
                                                        icon={<DeleteOutlined />}
                                                        className={cx('card-delete-btn')}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Popconfirm>
                                            </div>
                                            
                                            <div className={cx('card-decoration')}></div>
                                        </div>
                                    </Card>
                                    </motion.div>
                                ))
                            ) : (
                                <Empty 
                                    description="Không có danh mục nào" 
                                    className={cx('empty-container')}
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )}
                        </div>
                    </div>
                )}
            </motion.div>

            <Modal
                title={
                    <div className={cx('modal-title')}>
                        {editingCategory ? (
                            <>
                                <EditOutlined className={cx('modal-icon')} />
                                <span>Sửa danh mục</span>
                            </>
                        ) : (
                            <>
                                <PlusOutlined className={cx('modal-icon')} />
                                <span>Thêm danh mục mới</span>
                            </>
                        )}
                    </div>
                }
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={editingCategory ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                className={cx('category-modal')}
                okButtonProps={{ 
                    className: cx('modal-ok-button'),
                    icon: editingCategory ? <EditOutlined /> : <CloudUploadOutlined />
                }}
                cancelButtonProps={{ className: cx('modal-cancel-button') }}
                centered
            >
                <Form form={form} layout="vertical" name="category_form" className={cx('category-form')}>
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input 
                            placeholder="Nhập tên danh mục" 
                            prefix={<AppstoreOutlined className={cx('input-icon')} />}
                            className={cx('category-input')}
                            autoFocus
                        />
                    </Form.Item>
                    
                    {editingCategory && (
                        <div className={cx('category-info')}>
                            <div className={cx('category-info-header')}>
                                <h4>Thông tin danh mục</h4>
                                <Tag color={editingCategory.products?.length > 0 ? 'gold' : 'default'}>
                                    {editingCategory.products?.length > 0 ? 'Đang sử dụng' : 'Chưa sử dụng'}
                                </Tag>
                            </div>
                            <div className={cx('category-info-content')}>
                                <div className={cx('info-item')}>
                                    <span className={cx('info-label')}>ID:</span>
                                    <span className={cx('info-value', 'id-value')}>{editingCategory._id}</span>
                                </div>
                                <div className={cx('info-item')}>
                                    <span className={cx('info-label')}>Số sản phẩm:</span>
                                    <span className={cx('info-value', 'count-value')}>{editingCategory.products?.length || 0}</span>
                                </div>
                                
                                {editingCategory.products?.length > 0 && (
                                    <Progress 
                                        percent={Math.min(100, Math.round((editingCategory.products.length / Math.max(...dataCategory.map(c => c.products.length))) * 100))} 
                                        size="small" 
                                        strokeColor={{
                                            '0%': '#d4af37',
                                            '100%': '#9b7b24',
                                        }}
                                        className={cx('info-progress')}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </Form>
                
                <div className={cx('modal-decoration')}></div>
            </Modal>
        </div>
    );
};

export default CategoryManagement;
