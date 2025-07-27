import React, { useEffect, useState } from 'react';
import { Table, Space, Button, Input, Card, Tag, Image, Popconfirm, message, Tooltip, Row, Col, Statistic, Select, Badge, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, FilterOutlined, ReloadOutlined, ShoppingOutlined, TagsOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { requestDeleteProduct, requestGetAllProduct } from '../../../Config/request';
import styles from './ProductManagement.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const ProductManagement = ({ setActiveComponent, setProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStock, setFilterStock] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0
    });

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            key: 'images',
            render: (images) => (
                <Image
                    className={cx('product-image')}
                    src={images && images[0] ? images[0] : ''}
                    alt="product"
                    width={80}
                    height={80}
                    fallback="data:image/png;base64,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"
                />
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div className={cx('product-name')}>
                    <span>{text}</span>
                    {record.variants && record.variants.length > 0 && (
                        <Badge count={record.variants.length} className={cx('variant-badge')} />
                    )}
                </div>
            ),
        },
        {
            title: 'Loại sản phẩm',
            key: 'productType',
            render: (_, record) => {
                if (record.variants && record.variants.length > 0) {
                    const variantCount = record.variants.length;
                    const colorCount = [...new Set(record.variants.map(v => v.color.name))].length;
                    const storageCount = [...new Set(record.variants.map(v => v.storage.size))].length;
                    
                    return (
                        <Tooltip title={`${colorCount} màu sắc, ${storageCount} phiên bản`}>
                            <Tag color="blue" className={cx('product-tag')}>
                                <TagsOutlined /> {variantCount} Variants
                            </Tag>
                        </Tooltip>
                    );
                } else {
                    return <Tag color="default" className={cx('product-tag')}><ShoppingOutlined /> Sản phẩm đơn</Tag>;
                }
            },
        },
        {
            title: 'Giá',
            key: 'price',
            render: (_, record) => {
                if (record.variants && record.variants.length > 0) {
                    const prices = record.variants.map(v => v.priceDiscount > 0 ? v.priceDiscount : v.price);
                    const minPrice = Math.min(...prices);
                    const maxPrice = Math.max(...prices);
                    
                    if (minPrice === maxPrice) {
                        return <span className={cx('product-price')}>{minPrice.toLocaleString()} VNĐ</span>;
                    } else {
                        return <span className={cx('product-price')}>{minPrice.toLocaleString()} - {maxPrice.toLocaleString()} VNĐ</span>;
                    }
                } else {
                    const displayPrice = record.priceDiscount > 0 ? record.priceDiscount : record.price;
                    return <span className={cx('product-price')}>{displayPrice?.toLocaleString()} VNĐ</span>;
                }
            },
            sorter: (a, b) => {
                const getPrice = (record) => {
                    if (record.variants && record.variants.length > 0) {
                        const prices = record.variants.map(v => v.priceDiscount > 0 ? v.priceDiscount : v.price);
                        return Math.min(...prices);
                    }
                    return record.priceDiscount > 0 ? record.priceDiscount : record.price;
                };
                return getPrice(a) - getPrice(b);
            },
        },
        {
            title: 'Tồn kho',
            key: 'stock',
            render: (_, record) => {
                let totalStock = 0;
                if (record.variants && record.variants.length > 0) {
                    totalStock = record.variants.reduce((sum, variant) => sum + variant.stock, 0);
                } else {
                    totalStock = record.stock;
                }
                
                let color = 'green';
                let icon = <CheckCircleOutlined />;
                
                if (totalStock === 0) {
                    color = 'red';
                    icon = <WarningOutlined />;
                } else if (totalStock < 10) {
                    color = 'orange';
                    icon = <WarningOutlined />;
                }
                
                return (
                    <Tag color={color} className={cx('stock-tag')}>
                        {icon} {totalStock > 0 ? `${totalStock} sản phẩm` : 'Hết hàng'}
                    </Tag>
                );
            },
            sorter: (a, b) => {
                const getStock = (record) => {
                    if (record.variants && record.variants.length > 0) {
                        return record.variants.reduce((sum, variant) => sum + variant.stock, 0);
                    }
                    return record.stock;
                };
                return getStock(a) - getStock(b);
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="middle" className={cx('action-buttons')}>
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)} className={cx('edit-button')}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa sản phẩm này?"
                        onConfirm={() => handleDelete(record.key)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} className={cx('delete-button')}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Xử lý các action
    const handleAdd = () => {
        setActiveComponent('add-product'); // Chuyển sang component AddProduct
    };

    const handleEdit = (record) => {
        setProductId(record.id);
        setActiveComponent('edit-product'); // Chuyển sang component AddProduct
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await requestGetAllProduct();
            setProducts(res.metadata);
            
            // Tính toán thống kê
            const totalProducts = res.metadata.length;
            let inStock = 0;
            let lowStock = 0;
            let outOfStock = 0;
            
            res.metadata.forEach(product => {
                let stockCount = 0;
                if (product.variants && product.variants.length > 0) {
                    stockCount = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                } else {
                    stockCount = product.stock;
                }
                
                if (stockCount === 0) {
                    outOfStock++;
                } else if (stockCount < 10) {
                    lowStock++;
                } else {
                    inStock++;
                }
            });
            
            setStats({
                total: totalProducts,
                inStock,
                lowStock,
                outOfStock
            });
            
        } catch (error) {
            message.error('Lấy dữ liệu sản phẩm thất bại');
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = () => {
        fetchData();
    };

    const handleFilterTypeChange = (value) => {
        setFilterType(value);
    };

    const handleFilterStockChange = (value) => {
        setFilterStock(value);
    };

    // Xử lý dữ liệu và filter
    const processData = () => {
        let filteredData = products.map((product) => ({
        key: product._id,
        id: product._id,
        name: product.name,
        price: product.price,
        priceDiscount: product.priceDiscount,
        stock: product.stock,
        images: product.images,
            variants: product.variants,
        }));
        
        // Lọc theo tên sản phẩm
        if (searchText) {
            filteredData = filteredData.filter(item => 
                item.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        
        // Lọc theo loại sản phẩm
        if (filterType !== 'all') {
            if (filterType === 'single') {
                filteredData = filteredData.filter(item => 
                    !item.variants || item.variants.length === 0
                );
            } else if (filterType === 'variant') {
                filteredData = filteredData.filter(item => 
                    item.variants && item.variants.length > 0
                );
            }
        }
        
        // Lọc theo tồn kho
        if (filterStock !== 'all') {
            filteredData = filteredData.filter(item => {
                let stockCount = 0;
                if (item.variants && item.variants.length > 0) {
                    stockCount = item.variants.reduce((sum, variant) => sum + variant.stock, 0);
                } else {
                    stockCount = item.stock;
                }
                
                if (filterStock === 'inStock') {
                    return stockCount >= 10;
                } else if (filterStock === 'lowStock') {
                    return stockCount > 0 && stockCount < 10;
                } else if (filterStock === 'outOfStock') {
                    return stockCount === 0;
                }
                return true;
            });
        }
        
        return filteredData;
    };

    const data = processData();

    const handleDelete = async (key) => {
        try {
            await requestDeleteProduct(key);
            await fetchData();
            message.success('Xóa sản phẩm thành công');
        } catch (error) {
            message.error('Xóa sản phẩm thất bại');
        }
    };

    return (
        <div className={cx('product-management')}>
            
            {/* Thống kê */}
            <Row gutter={16} className={cx('stats-row')}>
                <Col xs={24} sm={12} md={6}>
                    <Card className={cx('stat-card', 'total')}>
                        <Statistic 
                            title="Tổng sản phẩm" 
                            value={stats.total} 
                            prefix={<ShoppingOutlined />} 
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={cx('stat-card', 'in-stock')}>
                        <Statistic 
                            title="Còn hàng" 
                            value={stats.inStock} 
                            prefix={<CheckCircleOutlined />} 
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={cx('stat-card', 'low-stock')}>
                        <Statistic 
                            title="Sắp hết hàng" 
                            value={stats.lowStock} 
                            prefix={<WarningOutlined />} 
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={cx('stat-card', 'out-of-stock')}>
                        <Statistic 
                            title="Hết hàng" 
                            value={stats.outOfStock} 
                            prefix={<WarningOutlined />} 
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>
            
            <Card className={cx('card')}>
                <div className={cx('search-add-row')}>
                    <Input.Search 
                        placeholder="Tìm kiếm sản phẩm" 
                        onSearch={handleSearch} 
                        onChange={(e) => setSearchText(e.target.value)}
                        value={searchText}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                    <Select
                        placeholder="Loại sản phẩm"
                        style={{ width: 150 }}
                        onChange={handleFilterTypeChange}
                        value={filterType}
                    >
                        <Select.Option value="all">Tất cả loại</Select.Option>
                        <Select.Option value="single">Sản phẩm đơn</Select.Option>
                        <Select.Option value="variant">Sản phẩm biến thể</Select.Option>
                    </Select>
                    <Select
                        placeholder="Tồn kho"
                        style={{ width: 150 }}
                        onChange={handleFilterStockChange}
                        value={filterStock}
                    >
                        <Select.Option value="all">Tất cả tồn kho</Select.Option>
                        <Select.Option value="inStock">Còn hàng</Select.Option>
                        <Select.Option value="lowStock">Sắp hết hàng</Select.Option>
                        <Select.Option value="outOfStock">Hết hàng</Select.Option>
                    </Select>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        Làm mới
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Thêm sản phẩm
                    </Button>
                </div>
            </Card>

            <Table
                columns={columns}
                dataSource={data}
                pagination={{
                    total: data.length,
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `Tổng ${total} sản phẩm`,
                }}
                loading={loading}
                className={cx('product-table')}
                rowClassName={cx('product-row')}
            />
        </div>
    );
};

export default ProductManagement;
