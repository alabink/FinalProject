import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    DatePicker,
    message,
    Space,
    Tag,
    Select,
    Tooltip,
    Badge,
    Progress,
    Row,
    Col,
    Statistic,
    Empty,
    Segmented,
    Spin,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    GiftOutlined,
    CalendarOutlined,
    DollarOutlined,
    TagOutlined,
    FilterOutlined,
    ReloadOutlined,
    SearchOutlined,
    ShoppingOutlined,
    PercentageOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    StopOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './CouponManagement.module.scss';
import dayjs from 'dayjs';
import {
    requestCreateCoupon,
    requestDeleteCoupon,
    requestGetAllCoupon,
    requestGetAllProduct,
    requestUpdateCoupon,
} from '../../../../Config/request';
import { motion } from 'framer-motion';

const cx = classNames.bind(styles);
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

function CouponManagement() {
    // States
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [statistics, setStatistics] = useState({
        total: 0,
        active: 0,
        upcoming: 0,
        expired: 0,
        totalDiscount: 0,
    });
    
    const [form] = Form.useForm();

    // Fetch data functions
    const fetchData = async () => {
        try {
            setLoading(true);
        const res = await requestGetAllProduct();
        setProducts(res.metadata);
        } catch (error) {
            message.error('Không thể tải dữ liệu sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            setLoading(true);
        const res = await requestGetAllCoupon();
        setCoupons(res.coupons);
            calculateStatistics(res.coupons);
        } catch (error) {
            message.error('Không thể tải dữ liệu mã giảm giá');
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics from coupon data
    const calculateStatistics = (couponData) => {
        const now = dayjs();
        const upcoming = couponData.filter(coupon => dayjs(coupon.startDate).isAfter(now)).length;
        const active = couponData.filter(coupon => 
            (coupon.isActive !== false) &&
            dayjs(coupon.startDate).isBefore(now) &&
            dayjs(coupon.endDate).isAfter(now) &&
            coupon.quantity > 0
        ).length;
        const expired = couponData.filter(coupon => 
            (coupon.isActive === false) || 
            dayjs(coupon.endDate).isBefore(now) || 
            coupon.quantity <= 0
        ).length;
        
        const totalDiscount = couponData.reduce((sum, coupon) => sum + coupon.discount, 0);
        
        setStatistics({
            total: couponData.length,
            active,
            upcoming,
            expired,
            totalDiscount,
        });
    };

    useEffect(() => {
        fetchCoupons();
        fetchData();
    }, []);

    // Modal handlers
    const showModal = (coupon = null) => {
        setEditingCoupon(coupon);
        if (coupon) {
            form.setFieldsValue({
                nameCoupon: coupon.nameCoupon,
                discount: coupon.discount,
                quantity: coupon.quantity,
                dateRange: [dayjs(coupon.startDate), dayjs(coupon.endDate)],
                productUsed: coupon.productUsed,
                minPrice: coupon.minPrice,
                isActive: coupon.isActive,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                isActive: true,
                productUsed: ['all'],
            });
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    setLoading(true);
                const { dateRange, ...rest } = values;
                const couponData = {
                    ...rest,
                    startDate: dateRange[0].format('YYYY-MM-DD'),
                    endDate: dateRange[1].format('YYYY-MM-DD'),
                };

                if (editingCoupon) {
                    // Update existing coupon
                    const updatedCoupons = {
                        ...couponData,
                        _id: editingCoupon._id,
                    };

                    await requestUpdateCoupon(updatedCoupons);
                        message.success({
                            content: 'Mã giảm giá đã được cập nhật!',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        });
                } else {
                    // Add new coupon
                    const newCoupon = {
                        _id: Date.now().toString(),
                        ...couponData,
                        used: 0,
                    };

                    await requestCreateCoupon(newCoupon);
                        message.success({
                            content: 'Mã giảm giá đã được thêm mới!',
                            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        });
                    }
                    fetchCoupons();
                setIsModalOpen(false);
                form.resetFields();
                } catch (error) {
                    message.error('Đã xảy ra lỗi khi lưu mã giảm giá');
                } finally {
                    setLoading(false);
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa mã giảm giá này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    setLoading(true);
                await requestDeleteCoupon(id);
                fetchCoupons();
                    message.success({
                        content: 'Mã giảm giá đã được xóa!',
                        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    });
                } catch (error) {
                    message.error('Không thể xóa mã giảm giá');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    // Filter functions
    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setFilterStatus(value);
    };

    const handleDateFilter = (dates) => {
        setDateFilter(dates);
    };

    const handleResetFilters = () => {
        setSearchText('');
        setFilterStatus('all');
        setDateFilter(null);
    };

    const getFilteredCoupons = () => {
        const now = dayjs();
        
        return coupons.filter(coupon => {
            // Search filter
            const matchesSearch = coupon.nameCoupon.toLowerCase().includes(searchText.toLowerCase());
            
            // Status filter
            let matchesStatus = true;
            if (filterStatus === 'active') {
                matchesStatus = (coupon.isActive !== false) && dayjs(coupon.startDate).isBefore(now) && dayjs(coupon.endDate).isAfter(now) && coupon.quantity > 0;
            } else if (filterStatus === 'expired') {
                matchesStatus = (coupon.isActive === false) || dayjs(coupon.endDate).isBefore(now) || coupon.quantity <= 0;
            } else if (filterStatus === 'upcoming') {
                matchesStatus = dayjs(coupon.startDate).isAfter(now);
            }
            
            // Date filter
            let matchesDate = true;
            if (dateFilter && dateFilter[0] && dateFilter[1]) {
                const startDate = dayjs(coupon.startDate);
                const endDate = dayjs(coupon.endDate);
                const filterStart = dayjs(dateFilter[0]);
                const filterEnd = dayjs(dateFilter[1]);
                
                matchesDate = (
                    (startDate.isAfter(filterStart) || startDate.isSame(filterStart)) && 
                    (endDate.isBefore(filterEnd) || endDate.isSame(filterEnd))
                );
            }
            
            return matchesSearch && matchesStatus && matchesDate;
        });
    };

    const getProductNames = (productIds) => {
        if (productIds.includes('all')) {
            return 'Tất cả sản phẩm';
        }

        return productIds
            .map((id) => {
                const product = products.find((p) => p._id === id);
                return product ? product.name : '';
            })
            .join(', ');
    };

    // Check if coupon is expired or inactive
    const isCouponUpcoming = (coupon) => {
        const now = dayjs();
        return dayjs(coupon.startDate).isAfter(now);
    };

    const isCouponExpired = (coupon) => {
        const now = dayjs();
        if (isCouponUpcoming(coupon)) return false;
        return (coupon.isActive === false) || dayjs(coupon.endDate).isBefore(now) || coupon.quantity <= 0;
    };

    // Helper: sao chép mã giảm giá
    const copyCouponCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            message.success('Đã sao chép mã giảm giá!');
        });
    };

    // Render card cho chế độ lưới
    const renderCouponCard = (coupon) => {
        const expired = isCouponExpired(coupon);
        const upcoming = isCouponUpcoming(coupon);
        const used = coupon.used || 0;
        const total = coupon.quantity + used;
        const percent = Math.round((coupon.quantity / total) * 100);
        
        return (
            
            <Card
                key={coupon._id}
                className={cx('coupon-card', {
                    inactive: expired,
                    upcoming: upcoming,
                })}
            >
                <div className={cx('coupon-card-content')}>
                    <div className={cx('coupon-card-header')}>
                        <TagOutlined className={cx('coupon-card-icon')} />
                        <span className={cx('code')} onClick={() => copyCouponCode(coupon.nameCoupon)}>
                            {coupon.nameCoupon}
                        </span>
                    </div>
                    <Tag color="error" className={cx('discount-tag')}> 
                        <DollarOutlined />
                        {coupon.discount.toLocaleString('vi-VN')}đ
                    </Tag>
                    <div className={cx('usage-info')}>
                        <span>{coupon.quantity} / {total} lượt sử dụng</span>
                        <Progress 
                            percent={percent}
                            size="small"
                            status={coupon.quantity === 0 ? 'exception' : 'active'}
                            className={cx('usage-progress')}
                        />
                    </div>
                    <div className={cx('date-range')}>
                        {dayjs(coupon.startDate).format('DD/MM/YYYY')} - {dayjs(coupon.endDate).format('DD/MM/YYYY')}
                    </div>
                    <div className={cx('card-actions')}>
                        <Tooltip title="Chỉnh sửa">
                            <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => showModal(coupon)} />
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(coupon._id)} />
                        </Tooltip>
                    </div>
                </div>
            </Card>
        );
    };

    // Table columns
    const columns = [
        {
            title: 'Mã giảm giá',
            dataIndex: 'nameCoupon',
            key: 'nameCoupon',
            render: (text) => (
                <div className={cx('coupon-code')}>
                    <TagOutlined className={cx('coupon-icon')} />
                    <span className={cx('code')}>{text}</span>
                </div>
            ),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount) => (
                <Tag color="#f50" className={cx('discount-tag')}>
                    <DollarOutlined />
                    {discount.toLocaleString('vi-VN')}đ
                </Tag>
            ),
        },
        {
            title: 'Số lượng còn lại',
            key: 'quantity',
            render: (_, record) => {
                const used = record.initialQuantity ? (record.initialQuantity - record.quantity) : (record.used || 0);
                const total = record.initialQuantity || (record.quantity + used);
                const percent = total > 0 ? Math.round((record.quantity / total) * 100) : 0;
                
                return (
                    <div className={cx('usage-info')}>
                        <span>{record.quantity} / {total} lượt sử dụng</span>
                        <Progress 
                            percent={percent} 
                            size="small" 
                            status={record.quantity === 0 ? "exception" : "active"}
                            className={cx('usage-progress')}
                        />
                        <span className={cx('usage-text')}>
                            {used > 0 ? `Đã sử dụng ${used} lần` : 'Chưa được sử dụng'}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => (
                <div className={cx('date-info')}>
                    <CalendarOutlined className={cx('date-icon')} />
                    <div className={cx('date-range')}>
                        <div className={cx('date-start')}>
                            Từ: {dayjs(record.startDate).format('DD/MM/YYYY')}
                        </div>
                        <div className={cx('date-end')}>
                            Đến: {dayjs(record.endDate).format('DD/MM/YYYY')}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minPrice',
            key: 'minPrice',
            render: (minPrice) => (
                <div className={cx('min-price')}>
                    <DollarOutlined className={cx('price-icon')} />
                    <span className={cx('price-value')}>
                    {minPrice.toLocaleString('vi-VN')}đ
                    </span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const expired = isCouponExpired(record);
                const upcoming = isCouponUpcoming(record);
                let tagColor = 'success';
                let tagIcon = <CheckCircleOutlined />;
                let tagText = 'Đang hoạt động';

                if (upcoming) {
                    tagColor = 'processing';
                    tagIcon = <ClockCircleOutlined />;
                    tagText = 'Chưa bắt đầu';
                } else if (expired) {
                    tagColor = 'error';
                    tagIcon = <StopOutlined />;
                    tagText = 'Hết hạn/Vô hiệu';
                }

                return (
                    <Tag icon={tagIcon} color={tagColor}>
                        {tagText}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space size="small" className={cx('action-buttons')}>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                            size="middle"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record._id)}
                            size="middle"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const expandableConfig = {
        expandedRowRender: (record) => (
            <div className={cx('expanded-content')}>
                <div className={cx('expanded-item')}>
                    <strong>Áp dụng cho:</strong>
                    <div className={cx('product-list')}>
                        {record.productUsed.includes('all') ? (
                            <Tag className={cx('product-tag')}>
                                <ShoppingOutlined className={cx('product-icon')} />
                                Tất cả sản phẩm
                            </Tag>
                        ) : (
                            record.productUsed.map(id => {
                                const product = products.find(p => p._id === id);
                                return product ? (
                                    <Tag key={id} className={cx('product-tag')}>
                                        <InboxOutlined className={cx('product-icon')} />
                                        {product.name}
                                    </Tag>
                                ) : null;
                            })
                        )}
                    </div>
                </div>
            </div>
        ),
    };

    const filteredCoupons = getFilteredCoupons();

    return (
        <div className={cx('coupon-management')}>
            <motion.div 
                className={cx('banner')}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                            >
                            <div className={cx('banner-content')}>
                                <h1 className={cx('banner-title')}>Quản lý mã giảm giá</h1>
                                <p className={cx('banner-description')}>Quản lý các mã giảm giá trong cửa hàng</p>
                            </div>
                            <div className={cx('banner-icon')}>
                                <TagOutlined />
                            </div>
            </motion.div>
            <div className={cx('header')}>
                
                {/* <div className={cx('title-section')}>
                    <h2>Quản lý mã giảm giá</h2>
                    <p className={cx('subtitle')}>Quản lý các mã giảm giá trong cửa hàng</p>
                </div> */}
                <div className={cx('actions')}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        className={cx('add-button')}
                    >
                        Thêm mã giảm giá
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className={cx('stats-row')}>
                <Card className={cx('stat-card', 'total')}>
                    <div className={cx('stat-title')}>
                        <GiftOutlined className={cx('stat-icon')} />
                        <span>Tổng mã giảm giá</span>
                    </div>
                    <div className={cx('stat-value')}>{statistics.total}</div>
                    <div className={cx('stat-footer')}>Tổng số mã giảm giá đã tạo</div>
                </Card>
                
                <Card className={cx('stat-card', 'active')}>
                    <div className={cx('stat-title')}>
                        <CheckCircleOutlined className={cx('stat-icon')} />
                        <span>Mã đang hoạt động</span>
                    </div>
                    <div className={cx('stat-value')}>{statistics.active}</div>
                    <div className={cx('stat-footer')}>Mã giảm giá còn hiệu lực</div>
                </Card>
                
                <Card className={cx('stat-card', 'upcoming')}>
                    <div className={cx('stat-title')}>
                        <ClockCircleOutlined className={cx('stat-icon')} />
                        <span>Mã sắp bắt đầu</span>
                    </div>
                    <div className={cx('stat-value')}>{statistics.upcoming}</div>
                    <div className={cx('stat-footer')}>Mã giảm giá chưa hiệu lực</div>
                </Card>

                <Card className={cx('stat-card', 'expired')}>
                    <div className={cx('stat-title')}>
                        <StopOutlined className={cx('stat-icon')} />
                        <span>Mã hết hạn</span>
                    </div>
                    <div className={cx('stat-value')}>{statistics.expired}</div>
                    <div className={cx('stat-footer')}>Mã giảm giá đã hết hạn hoặc vô hiệu</div>
                </Card>
                
                <Card className={cx('stat-card', 'discount')}>
                    <div className={cx('stat-title')}>
                        <PercentageOutlined className={cx('stat-icon')} />
                        <span>Tổng giá trị giảm giá</span>
                    </div>
                    <div className={cx('stat-value')}>{statistics.totalDiscount.toLocaleString('vi-VN')}đ</div>
                    <div className={cx('stat-footer')}>Tổng giá trị giảm giá của tất cả mã</div>
                </Card>
            </div>

            {/* Filters */}
            <div className={cx('filter-row')}>
                <div className={cx('filter-item', 'search')}>
                    <Search
                        placeholder="Tìm kiếm mã giảm giá..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="middle"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={handleSearch}
                    />
                </div>
                
                <div className={cx('filter-item')}>
                    <Select
                        placeholder="Lọc theo trạng thái"
                        style={{ width: '100%' }}
                        value={filterStatus}
                        onChange={handleStatusFilter}
                        options={[
                            { value: 'all', label: 'Tất cả trạng thái' },
                            { value: 'active', label: 'Đang hoạt động' },
                            {
                                value: 'upcoming',
                                label: 'Chưa bắt đầu'
                            },
                            { value: 'expired', label: 'Hết hạn/Vô hiệu' },
                        ]}
                    />
                </div>
                
                <div className={cx('filter-item')}>
                    <RangePicker 
                        style={{ width: '100%' }} 
                        placeholder={['Từ ngày', 'Đến ngày']}
                        value={dateFilter}
                        onChange={handleDateFilter}
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
                </div>
            </div>
            
            {/* View Mode Toggle */}
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Segmented
                    options={[
                        {
                            value: 'table',
                            icon: <UnorderedListOutlined />,
                            label: 'Bảng',
                        },
                        {
                            value: 'grid',
                            icon: <AppstoreOutlined />,
                            label: 'Lưới',
                        },
                    ]}
                    value={viewMode}
                    onChange={setViewMode}
                />
            </div>

            {/* Nội dung theo chế độ xem */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" />
                </div>
            ) : viewMode === 'table' ? (
                filteredCoupons.length > 0 ? (
            <Card className={cx('table-card')}>
                <Table
                            dataSource={filteredCoupons}
                    columns={columns}
                    rowKey="_id"
                    expandable={expandableConfig}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total) => `Tổng cộng ${total} mã giảm giá`,
                    }}
                    className={cx('coupons-table')}
                            rowClassName={(record) => (isCouponExpired(record) ? cx('inactive-row') : '')}
                />
            </Card>
                ) : (
                    <Card>
                        <Empty description="Không tìm thấy mã giảm giá nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Card>
                )
            ) : filteredCoupons.length > 0 ? (
                <div className={cx('grid-container')}>
                    <div className={cx('grid-header')}>
                        <h3>Danh sách mã giảm giá</h3>
                        <div className={cx('grid-stats')}>
                            <span>{filteredCoupons.length} mã giảm giá</span>
                            {searchText && (
                                <span className={cx('search-result')}>Kết quả: "{searchText}"</span>
                            )}
                        </div>
                    </div>
                    <div className={cx('coupon-grid')}>
                        {filteredCoupons.map((coupon) => renderCouponCard(coupon))}
                    </div>
                </div>
            ) : (
                <Card>
                    <Empty description="Không tìm thấy mã giảm giá nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </Card>
            )}

            {/* Modal Form */}
            <Modal
                title={
                    <div className={cx('modal-title')}>
                        <GiftOutlined className={cx('modal-icon')} />
                        {editingCoupon ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText={editingCoupon ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                width={600}
                className={cx('coupon-modal')}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical" name="coupon_form">
                    <Form.Item
                        name="nameCoupon"
                        label="Mã giảm giá"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mã giảm giá!',
                            },
                            {
                                pattern: /^[A-Z0-9]+$/,
                                message: 'Mã giảm giá chỉ chấp nhận chữ in hoa và số!',
                            },
                        ]}
                    >
                        <Input
                            prefix={<GiftOutlined />}
                            placeholder="Nhập mã giảm giá (VD: SUMMER2023)"
                            style={{ textTransform: 'uppercase' }}
                        />
                    </Form.Item>

                    <div className={cx('form-row')}>
                        <Form.Item
                            name="discount"
                            label="Giảm giá (đ)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập giá trị giảm giá!',
                                },
                            ]}
                            className={cx('discount-input')}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập giá trị giảm giá" />
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label="Số lượng"
                            rules={[
                                {
                                    required: true,
                                    message: 'Vui lòng nhập số lượng!',
                                },
                            ]}
                            className={cx('quantity-input')}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="Nhập số lượng mã giảm giá" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian hiệu lực"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn thời gian hiệu lực!',
                            },
                        ]}
                    >
                        <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        name="productUsed"
                        label="Áp dụng cho sản phẩm"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng chọn sản phẩm áp dụng!',
                            },
                        ]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn sản phẩm áp dụng"
                            style={{ width: '100%' }}
                            optionLabelProp="label"
                        >
                            <Option key="all" value="all" label="Tất cả sản phẩm">
                                <div className={cx('product-option')}>
                                    <ShoppingOutlined className={cx('product-icon')} />
                                    Tất cả sản phẩm
                                </div>
                            </Option>
                            {products.map((product) => (
                                <Option
                                    key={product._id}
                                    value={product._id}
                                    label={product.name}
                                >
                                    <div className={cx('product-option')}>
                                        <InboxOutlined className={cx('product-icon')} />
                                        {product.name}
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="minPrice"
                        label="Đơn hàng tối thiểu"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập đơn hàng tối thiểu!',
                            },
                        ]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: '100%' }}
                            formatter={(value) => `${value} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\s?đ\s?|(,*)/g, '')}
                            placeholder="Nhập giá trị đơn hàng tối thiểu"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CouponManagement;