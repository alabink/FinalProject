import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Tooltip, Button, Dropdown, Menu, Radio, Space, Typography } from 'antd';
import { 
    UserOutlined, 
    ShoppingCartOutlined, 
    DollarOutlined, 
    SyncOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    MoreOutlined,
    ReloadOutlined,
    CalendarOutlined,
    BarChartOutlined,
    LineChartOutlined,
    ClockCircleOutlined,
    CalendarOutlined as CalendarIcon
} from '@ant-design/icons';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    Title,
    Tooltip as ChartTooltip,
    Legend,
    PointElement,
} from 'chart.js';
import { requestGetAdminStats } from '../../../Config/request';
import styles from './Dashboard.module.scss';
import classNames from 'classnames/bind';

const { Title: AntTitle } = Typography;

const cx = classNames.bind(styles);

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, ChartTooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        newOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        todayRevenue: 0,
        periodRevenue: [],
        periodTotalRevenue: 0,
        period: 'week',
        recentOrders: [],
    });

    const [chartType, setChartType] = useState('line');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    const fetchStats = async (period = selectedPeriod) => {
        setIsLoading(true);
        try {
            const response = await requestGetAdminStats(period);
            setStats(response.metadata);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
        fetchStats(period);
    };

    const getPeriodTitle = () => {
        switch (selectedPeriod) {
            case 'day':
                return 'Thống kê theo giờ hôm nay';
            case 'week':
                return 'Thống kê 7 ngày gần đây';
            case 'month':
                return `Thống kê tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`;
            default:
                return 'Thống kê doanh thu và đơn hàng';
        }
    };

    const getPeriodDescription = () => {
        switch (selectedPeriod) {
            case 'day':
                return 'Hiển thị doanh thu và đơn hàng theo từng giờ trong ngày hôm nay';
            case 'week':
                return 'Hiển thị doanh thu và đơn hàng trong 7 ngày gần đây';
            case 'month':
                return `Hiển thị doanh thu và đơn hàng theo từng ngày trong tháng ${new Date().getMonth() + 1}`;
            default:
                return '';
        }
    };

    const revenueData = {
        labels: stats.periodRevenue.map((item) => item.label),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: stats.periodRevenue.map((item) => item.revenue),
                backgroundColor: 'rgba(212, 175, 55, 0.15)',
                borderColor: '#d4af37',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Số đơn hàng',
                data: stats.periodRevenue.map((item) => item.orderCount),
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: '#ef4444',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'orderCount',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '500',
                        family: "'Montserrat', sans-serif"
                    },
                },
            },
            tooltip: {
                backgroundColor: 'white',
                titleColor: '#1a1a1a',
                bodyColor: '#1a1a1a',
                borderColor: 'rgba(212, 175, 55, 0.3)',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                titleFont: {
                    family: "'Cormorant Garamond', serif",
                    size: 14,
                    weight: '600'
                },
                bodyFont: {
                    family: "'Montserrat', sans-serif",
                    size: 12
                },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString() + (context.dataset.yAxisID === 'orderCount' ? ' đơn' : ' VNĐ');
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Doanh thu (VNĐ)',
                    font: {
                        size: 12,
                        weight: '500',
                        family: "'Montserrat', sans-serif"
                    },
                },
                grid: {
                    color: 'rgba(212, 175, 55, 0.1)',
                },
                ticks: {
                    font: {
                        family: "'Montserrat', sans-serif",
                    }
                }
            },
            x: {
                ticks: {
                    font: {
                        family: "'Montserrat', sans-serif",
                    }
                },
                grid: {
                    color: 'rgba(212, 175, 55, 0.1)',
                },
            },
            orderCount: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Số đơn hàng',
                    font: {
                        size: 12,
                        weight: '500',
                        family: "'Montserrat', sans-serif"
                    },
                },
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        family: "'Montserrat', sans-serif",
                    }
                }
            },
        },
    };

    const chartMenu = (
        <Menu>
            <Menu.Item key="line" onClick={() => setChartType('line')} icon={<LineChartOutlined />}>
                Biểu đồ đường
            </Menu.Item>
            <Menu.Item key="bar" onClick={() => setChartType('bar')} icon={<BarChartOutlined />}>
                Biểu đồ cột
            </Menu.Item>
        </Menu>
    );

    return (
        <div className={cx('dashboard')}>
            {/* Statistics Cards */}
            <div className={cx('stats-grid')}>
                <Card className={cx('stat-card')} loading={isLoading}>
                    <div className={cx('stat-header')}>
                        <h4 className={cx('stat-title')}>Tổng người dùng</h4>
                        <div className={cx('stat-icon', 'users')}>
                            <UserOutlined />
                        </div>
                    </div>
                    <div className={cx('stat-value')}>
                        {stats.totalUsers?.toLocaleString() || '0'}
                    </div>
                    <div className={cx('stat-description')}>
                        <ArrowUpOutlined className={cx('trend-icon', 'up')} />
                        Tổng số người dùng đã đăng ký
                    </div>
                </Card>

                <Card className={cx('stat-card')} loading={isLoading}>
                    <div className={cx('stat-header')}>
                        <h4 className={cx('stat-title')}>Đơn hàng mới</h4>
                        <div className={cx('stat-icon', 'orders')}>
                            <ShoppingCartOutlined />
                        </div>
                    </div>
                    <div className={cx('stat-value')}>
                        {stats.newOrders?.toLocaleString() || '0'}
                    </div>
                    <div className={cx('stat-description')}>
                        <ArrowUpOutlined className={cx('trend-icon', 'up')} />
                        Đơn hàng chờ xác nhận
                    </div>
                </Card>

                <Card className={cx('stat-card')} loading={isLoading}>
                    <div className={cx('stat-header')}>
                        <h4 className={cx('stat-title')}>Đang xử lý</h4>
                        <div className={cx('stat-icon', 'processing')}>
                            <SyncOutlined />
                        </div>
                    </div>
                    <div className={cx('stat-value')}>
                        {stats.processingOrders?.toLocaleString() || '0'}
                    </div>
                    <div className={cx('stat-description')}>
                        <SyncOutlined className={cx('trend-icon')} />
                        Đơn hàng đang được xử lý
                    </div>
                </Card>

                <Card className={cx('stat-card')} loading={isLoading}>
                    <div className={cx('stat-header')}>
                        <h4 className={cx('stat-title')}>
                            {selectedPeriod === 'day' ? 'Doanh thu hôm nay' :
                             selectedPeriod === 'week' ? 'Doanh thu tuần này' :
                             selectedPeriod === 'month' ? 'Doanh thu tháng này' : 'Doanh thu hôm nay'}
                        </h4>
                        <div className={cx('stat-icon', 'revenue')}>
                            <DollarOutlined />
                        </div>
                    </div>
                    <div className={cx('stat-value')}>
                        {(() => {
                            if (selectedPeriod === 'day') {
                                return stats.todayRevenue?.toLocaleString() || '0';
                            } else if (selectedPeriod === 'week') {
                                return stats.periodTotalRevenue?.toLocaleString() || '0';
                            } else if (selectedPeriod === 'month') {
                                return stats.periodTotalRevenue?.toLocaleString() || '0';
                            }
                            return stats.todayRevenue?.toLocaleString() || '0';
                        })()} VNĐ
                    </div>
                    <div className={cx('stat-description')}>
                        <ArrowUpOutlined className={cx('trend-icon', 'up')} />
                        {selectedPeriod === 'day' ? 'Doanh thu trong ngày' :
                         selectedPeriod === 'week' ? 'Doanh thu trong tuần' :
                         selectedPeriod === 'month' ? 'Doanh thu trong tháng' : 'Doanh thu trong ngày'}
                    </div>
                </Card>
            </div>

            <div className={cx('chart-section')}>
                <div className={cx('chart-header')}>
                    <div className={cx('chart-title-section')}>
                        <AntTitle level={3} className={cx('chart-title')}>
                            {getPeriodTitle()}
                        </AntTitle>
                        <Typography.Text type="secondary" className={cx('chart-description')}>
                            {getPeriodDescription()}
                        </Typography.Text>
                    </div>
                    <div className={cx('chart-actions')}>
                        <Space>
                            <Radio.Group 
                                value={selectedPeriod} 
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                buttonStyle="solid"
                                size="middle"
                            >
                                <Radio.Button value="day">
                                    <ClockCircleOutlined /> Ngày
                                </Radio.Button>
                                <Radio.Button value="week">
                                    <CalendarOutlined /> Tuần
                                </Radio.Button>
                                <Radio.Button value="month">
                                    <CalendarIcon /> Tháng
                                </Radio.Button>
                            </Radio.Group>
                            <Tooltip title="Làm mới dữ liệu">
                                <Button 
                                    icon={<ReloadOutlined />} 
                                    onClick={() => fetchStats()}
                                    loading={isLoading}
                                    type="text"
                                />
                            </Tooltip>
                            <Dropdown overlay={chartMenu} trigger={['click']}>
                                <Button icon={<MoreOutlined />} type="text" />
                            </Dropdown>
                        </Space>
                    </div>
                </div>
                <div className={cx('chart-container')}>
                    {chartType === 'line' ? (
                        <Line data={revenueData} options={chartOptions} />
                    ) : (
                        <Bar data={revenueData} options={chartOptions} />
                    )}
                </div>
            </div>

            <div className={cx('recent-orders')}>
                <div className={cx('table-header')}>
                    <h3>Đơn hàng gần đây</h3>
                    <Button type="primary" icon={<CalendarOutlined />}>
                        Xem tất cả
                    </Button>
                </div>
                <Table
                    dataSource={stats.recentOrders}
                    columns={[
                        {
                            title: 'Mã đơn',
                            dataIndex: 'order',
                            key: 'order',
                        },
                        {
                            title: 'Khách hàng',
                            dataIndex: 'customer',
                            key: 'customer',
                        },
                        {
                            title: 'Sản phẩm',
                            dataIndex: 'product',
                            key: 'product',
                        },
                        {
                            title: 'Tổng tiền',
                            dataIndex: 'amount',
                            key: 'amount',
                            render: (amount) => `${amount?.toLocaleString()} VNĐ`,
                        },
                        {
                            title: 'Trạng thái',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => (
                                <Tag
                                    color={
                                        status === 'Chờ xử lý'
                                            ? 'gold'
                                            : status === 'Đã xác nhận'
                                            ? 'blue'
                                            : status === 'Đang giao'
                                            ? 'blue'
                                            : status === 'Đã giao'
                                            ? 'green'
                                            : 'red'
                                    }
                                >
                                    {status}
                                </Tag>
                            ),
                        },
                    ]}
                    pagination={false}
                />
            </div>
        </div>
    );
};

export default Dashboard;

