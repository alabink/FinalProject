import React, { useState, useEffect } from 'react';
import { 
  Table, Space, Button, Input, Tag, Select, Card, Row, Col, 
  Statistic, Badge, Tooltip, Dropdown, Menu, DatePicker, 
  Divider, Skeleton, Empty, Alert, Typography, Avatar
} from 'antd';
import { 
  SearchOutlined, FilterOutlined, ReloadOutlined, 
  DownloadOutlined, EyeOutlined, CalendarOutlined, 
  DollarOutlined, ShoppingOutlined, CheckCircleOutlined,
  ClockCircleOutlined, SyncOutlined, CarOutlined, StopOutlined,
  BarChartOutlined, RiseOutlined, UserOutlined, PhoneOutlined,
  HomeOutlined, ShoppingCartOutlined, InboxOutlined,
  SafetyCertificateOutlined, TrophyOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { message } from 'antd';
import { requestGetOrderAdmin, requestUpdateStatusOrder } from '../../../Config/request';
import ModalDetailOrder from './ModalDetailOrder';
import styles from './OrderManagement.module.scss';
import classNames from 'classnames/bind';
import { motion } from 'framer-motion';

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

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

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState('');
    const [statistics, setStatistics] = useState({
        total: 0,
        pending: 0,
        completed: 0,
        shipping: 0,
        delivered: 0,
        cancelled: 0,
        revenue: 0,
        cod: 0,
        momo: 0,
        bank: 0
    });

    const statusOptions = [
        { label: 'Chờ xác nhận', value: 'pending', color: 'orange', icon: <ClockCircleOutlined /> },
        { label: 'Đã xác nhận', value: 'completed', color: 'gold', icon: <CheckCircleOutlined /> },
        { label: 'Đang giao', value: 'shipping', color: 'blue', icon: <CarOutlined /> },
        { label: 'Đã giao', value: 'delivered', color: 'green', icon: <CheckCircleOutlined /> },
        { label: 'Đã hủy', value: 'cancelled', color: 'red', icon: <StopOutlined /> },
    ];

    const paymentMethods = [
        { label: 'COD', value: 'COD', color: 'green' },
        { label: 'MOMO', value: 'MOMO', color: 'pink' },
        { label: 'Ngân hàng', value: 'BANK', color: 'blue' }
    ];

    const handleShowModal = (order) => {
        setSelectedOrder(order.originalId);
        setIsModalVisible(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);
            await requestUpdateStatusOrder({ orderId, statusOrder: newStatus });
            message.success({
                content: 'Cập nhật trạng thái thành công',
                icon: <CheckCircleOutlined style={{ color: '#d4af37' }} />
            });
            await fetchOrders();
        } catch (error) {
            message.error('Cập nhật trạng thái thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy biểu tượng theo trạng thái
    const getStatusIcon = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.icon : <ClockCircleOutlined />;
    };

    // Hàm lấy màu theo trạng thái
    const getStatusColor = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.color : 'default';
    };

    // Hàm lấy tên trạng thái
    const getStatusName = (status) => {
        const option = statusOptions.find(opt => opt.value === status);
        return option ? option.label : 'Không xác định';
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            width: 160,
            render: (id) => (
                <Tooltip title={id}>
                    <div className={cx('order-id')}>
                        <span className={cx('id-text')}>{id}</span>
                        <Badge status="processing" className={cx('id-badge')} />
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
            render: (name, record) => (
                <div className={cx('customer-info')}>
                    <Avatar 
                        icon={<UserOutlined />} 
                        className={cx('customer-avatar')}
                        style={{ backgroundColor: generateAvatarColor(name) }}
                    />
                    <div className={cx('customer-details')}>
                        <div className={cx('customer-name')}>{name}</div>
                        <div className={cx('customer-phone')}>
                            <PhoneOutlined /> {record.phone}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'date',
            key: 'date',
            render: (date) => (
                <div className={cx('order-date')}>
                    <CalendarOutlined className={cx('date-icon')} />
                    <span>{date}</span>
                </div>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => (
                <div className={cx('order-total')}>
                    <DollarOutlined className={cx('total-icon')} />
                    <span className={cx('total-amount')}>{total}</span>
                </div>
            ),
        },
        {
            title: 'Phương thức',
            dataIndex: 'typePayments',
            key: 'typePayments',
            render: (type) => {
                const getPaymentIcon = () => {
                    switch(type) {
                        case 'COD': return <ShoppingCartOutlined />;
                        case 'MOMO': return <DollarOutlined />;
                        default: return <DollarOutlined />;
                    }
                };
                
                return (
                    <Tag 
                        icon={getPaymentIcon()} 
                        color={type === 'COD' ? 'gold' : type === 'MOMO' ? 'pink' : 'blue'}
                        className={cx('payment-tag')}
                    >
                        {type}
                    </Tag>
                );
            },
        },
        {
            title: 'Mã giảm giá',
            dataIndex: 'couponApplied',
            key: 'couponApplied',
            render: (couponApplied) => {
                if (!couponApplied || !couponApplied.nameCoupon) {
                    return <span className={cx('no-coupon')}>Không có</span>;
                }
                
                return (
                    <div className={cx('coupon-info')}>
                        <Tag color="gold" className={cx('coupon-tag')}>
                            {couponApplied.nameCoupon}
                        </Tag>
                        <div className={cx('discount-amount')}>
                            -{couponApplied.discount.toLocaleString()} đ
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <div className={cx('status-container')}>
                <Select
                    value={status}
                    style={{ width: 150 }}
                    onChange={(value) => handleUpdateStatus(record.originalId, value)}
                        options={statusOptions.map(option => ({
                            ...option,
                            label: (
                                <div className={cx('status-option')}>
                                    {option.icon}
                                    <span>{option.label}</span>
                                </div>
                            )
                        }))}
                        className={cx('status-select', status)}
                        dropdownClassName={cx('status-dropdown')}
                />
                    <div className={cx('status-badge', status)}></div>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <div className={cx('action-buttons')}>
                    <Button 
                        onClick={() => handleShowModal(record)} 
                        type="primary"
                        icon={<EyeOutlined />}
                        className={cx('detail-button')}
                    >
                        Chi tiết
                    </Button>
                </div>
            ),
        },
    ];

    // Tạo màu avatar nhất quán dựa trên tên
    const generateAvatarColor = (name) => {
        const colors = ['#d4af37', '#9b7b24', '#b38728', '#0f1a2f', '#e5e4e2'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await requestGetOrderAdmin();
            // Backend now returns { metadata: { detailedPayments: [...] } }
            const orderList = response.metadata?.detailedPayments || response.metadata || [];
            if (Array.isArray(orderList)) {
                const formattedOrders = orderList.map((order) => ({
                    key: order.originalId || order.orderId,
                    id: order.orderId,
                    originalId: order.originalId || order.orderId, // Để update status
                    customer: order.fullName,
                    phone: `0${order.phone}`,
                    address: order.address,
                    date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
                    total: `${order.totalPrice?.toLocaleString() || 0} VNĐ`,
                    status: order.statusOrder,
                    typePayments: order.typePayments,
                    products: order.products,
                    rawTotal: order.totalPrice || 0,
                    rawDate: new Date(order.createdAt),
                    couponApplied: order.couponApplied || null
                }));
                setOrders(formattedOrders);
                calculateStatistics(formattedOrders);
            } else {
                setOrders([]);
                calculateStatistics([]);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            message.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    // Tính toán thống kê
    const calculateStatistics = (orderData) => {
        const stats = {
            total: orderData.length,
            pending: 0,
            completed: 0,
            shipping: 0,
            delivered: 0,
            cancelled: 0,
            revenue: 0,
            cod: 0,
            momo: 0,
            bank: 0
        };

        orderData.forEach(order => {
            // Đếm theo trạng thái
            stats[order.status] = (stats[order.status] || 0) + 1;
            
            // Tính doanh thu (chỉ tính đơn đã giao)
            if (order.status === 'delivered') {
                stats.revenue += order.rawTotal;
            }
            
            // Đếm theo phương thức thanh toán
            if (order.typePayments === 'COD') stats.cod++;
            else if (order.typePayments === 'MOMO') stats.momo++;
            else stats.bank++;
        });

        setStatistics(stats);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // Lọc đơn hàng
    const getFilteredOrders = () => {
        return orders.filter(order => {
        const search = searchText.toLowerCase();
            const matchesSearch = 
            order.id.toLowerCase().includes(search) ||
            order.customer.toLowerCase().includes(search) ||
            order.phone.toLowerCase().includes(search) ||
                order.total.toLowerCase().includes(search);
            
            const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
            const matchesPayment = filterPayment === 'all' || order.typePayments === filterPayment;
            
            let matchesDate = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const orderDate = order.rawDate;
                matchesDate = orderDate >= dateRange[0].startOf('day') && 
                              orderDate <= dateRange[1].endOf('day');
            }
            
            return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
    };

    const filteredOrders = getFilteredOrders();

    // Reset bộ lọc
    const handleResetFilters = () => {
        setSearchText('');
        setFilterStatus('all');
        setFilterPayment('all');
        setDateRange(null);
    };

    return (
        <div className={cx('order-management')}>
            <LuxuryParticles />
            
            {/* Banner */}
            <motion.div 
                className={cx('banner')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className={cx('banner-content')}>
                    <h1 className={cx('banner-title')}>Quản lý đơn hàng</h1>
                    <p className={cx('banner-description')}>Theo dõi và xử lý trạng thái đơn hàng khách hàng</p>
                </div>
                <div className={cx('banner-icon')}>
                    <ShoppingOutlined />
                </div>
            </motion.div>

            {/* Thẻ thống kê */}
            <motion.div 
                className={cx('stats-section')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Row gutter={[20, 20]}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'total')}
                        >
                            <Statistic 
                                title="Tổng đơn hàng" 
                                value={statistics.total} 
                                prefix={<SafetyCertificateOutlined />} 
                                className={cx('stat-content')}
                            />
                            <div className={cx('stat-icon-bg')}>
                                <ShoppingOutlined />
                            </div>
                        </motion.div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'revenue')}
                        >
                            <Statistic 
                                title="Doanh thu" 
                                value={statistics.revenue} 
                                prefix={<TrophyOutlined />}
                                suffix="VNĐ"
                                formatter={(value) => `${value.toLocaleString()}`}
                                className={cx('stat-content')}
                            />
                            <div className={cx('stat-icon-bg')}>
                                <BarChartOutlined />
                            </div>
                        </motion.div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'pending')}
                        >
                            <Statistic 
                                title="Chờ xử lý" 
                                value={statistics.pending} 
                                prefix={<ClockCircleOutlined />}
                                className={cx('stat-content')}
                            />
                            <div className={cx('stat-icon-bg')}>
                                <SyncOutlined />
                            </div>
                        </motion.div>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <motion.div 
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={cx('stat-card', 'delivered')}
                        >
                            <Statistic 
                                title="Đã giao" 
                                value={statistics.delivered} 
                                prefix={<ThunderboltOutlined />}
                                className={cx('stat-content')}
                            />
                            <div className={cx('stat-icon-bg')}>
                                <CheckCircleOutlined />
                            </div>
                        </motion.div>
                    </Col>
                </Row>
            </motion.div>

            {/* Bộ lọc */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className={cx('filter-card')}
            >
                <div className={cx('filter-container')}>
                    <div className={cx('filter-group')}>
                        <Input 
                            placeholder="Tìm kiếm đơn hàng" 
                            prefix={<SearchOutlined />} 
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                            className={cx('search-input')}
                        />
                    </div>

                    <div className={cx('filter-group')}>
                        <Select
                            placeholder="Trạng thái"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            className={cx('filter-select')}
                            options={[
                                { label: 'Tất cả trạng thái', value: 'all' },
                                ...statusOptions
                            ]}
                        />

                        <Select
                            placeholder="Phương thức thanh toán"
                            value={filterPayment}
                            onChange={setFilterPayment}
                            className={cx('filter-select')}
                            options={[
                                { label: 'Tất cả phương thức', value: 'all' },
                                ...paymentMethods
                            ]}
                        />

                        <RangePicker 
                            onChange={(dates) => setDateRange(dates)}
                            format="DD/MM/YYYY"
                            placeholder={['Từ ngày', 'Đến ngày']}
                            className={cx('date-picker')}
                            value={dateRange}
                        />
                    </div>

                    <div className={cx('filter-actions')}>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleResetFilters}
                            className={cx('reset-button')}
                        >
                            Đặt lại
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<ReloadOutlined />} 
                            onClick={fetchOrders}
                            className={cx('refresh-button')}
                        >
                            Làm mới
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Hiển thị kết quả lọc */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className={cx('result-info')}
            >
                
                <div className={cx('status-legend')}>
                    {statusOptions.map(status => (
                        <Tag 
                            key={status.value}
                            color={status.color}
                            icon={status.icon}
                            className={cx('legend-tag')}
                        >
                            {status.label}
                        </Tag>
                    ))}
                </div>
            </motion.div>

            {/* Bảng đơn hàng */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
            >
                <Card className={cx('table-card')}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={filteredOrders} 
                            loading={loading} 
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Tổng cộng ${total} đơn hàng`,
                            }}
                            className={cx('order-table')}
                            locale={{
                                emptyText: <Empty description="Không có đơn hàng nào" />
                            }}
                        />
                    </motion.div>
                </Card>
            </motion.div>

            {/* Modal chi tiết đơn hàng */}
            <ModalDetailOrder
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                selectedOrder={selectedOrder}
            />
        </div>
    );
};

export default OrderManagement;
