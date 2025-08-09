import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Upload, Button, Card, Space, Row, Col, message, Modal, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { requestUploadImage } from '../../../../Config/request';
import './VariantManager.module.scss';

const VariantManager = ({ variants = [], onChange, form }) => {
    const [variantList, setVariantList] = useState(variants);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [currentVariant, setCurrentVariant] = useState({
        color: { name: '', code: '#000000', image: '' },
        storage: { size: '', displayName: '' },
        price: 0,
        priceDiscount: 0,
        stock: 0,
        sku: ''
    });
    const [colorImageList, setColorImageList] = useState([]);

    useEffect(() => {
        if (onChange) {
            onChange(variantList);
        }
    }, [variantList, onChange]);

    const predefinedColors = [
        { name: 'Titan Tự Nhiên', code: '#F5F5DC' },
        { name: 'Titan Sa Mạc', code: '#DEB887' },
        { name: 'Titan Trắng', code: '#F8F8FF' },
        { name: 'Titan Đen', code: '#2F2F2F' },
        { name: 'Xanh Dương', code: '#4169E1' },
        { name: 'Hồng', code: '#FFB6C1' },
        { name: 'Tím', code: '#9370DB' },
        { name: 'Xanh Lá', code: '#32CD32' },
        { name: 'Vàng', code: '#FFD700' },
        { name: 'Đỏ', code: '#FF6347' }
    ];

    const predefinedStorages = [
        { size: '64GB', displayName: '64GB' },
        { size: '128GB', displayName: '128GB' },
        { size: '256GB', displayName: '256GB' },
        { size: '512GB', displayName: '512GB' },
        { size: '1TB', displayName: '1TB' },
        { size: '2TB', displayName: '2TB' }
    ];

    const openModal = (index = -1) => {
        if (index >= 0) {
            setCurrentVariant({ ...variantList[index] });
            setEditingIndex(index);
        } else {
            setCurrentVariant({
                color: { name: '', code: '#000000', image: '' },
                storage: { size: '', displayName: '' },
                price: 0,
                priceDiscount: 0,
                stock: 0,
                sku: ''
            });
            setEditingIndex(-1);
        }
        setColorImageList([]);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setCurrentVariant({
            color: { name: '', code: '#000000', image: '' },
            storage: { size: '', displayName: '' },
            price: 0,
            priceDiscount: 0,
            stock: 0,
            sku: ''
        });
        setColorImageList([]);
        setEditingIndex(-1);
    };

    const handleColorImageUpload = async ({ fileList }) => {
        setColorImageList(fileList);
        
        if (fileList.length > 0 && fileList[0].originFileObj) {
            try {
                const formData = new FormData();
                formData.append('images', fileList[0].originFileObj);
                
                const res = await requestUploadImage(formData);
                if (res && res.metadata && res.metadata.length > 0) {
                    setCurrentVariant(prev => ({
                        ...prev,
                        color: {
                            ...prev.color,
                            image: res.metadata[0]
                        }
                    }));
                    message.success('Upload ảnh thành công');
                }
            } catch (error) {
                console.error('Upload failed:', error);
                message.error('Upload ảnh thất bại');
            }
        }
    };

    const generateSKU = () => {
        if (currentVariant.color.name && currentVariant.storage.size) {
            // Tạo mã màu từ chữ cái đầu của từng từ
            const colorCode = currentVariant.color.name
                .split(' ')
                .map(word => word.charAt(0).toUpperCase())
                .join('')
                .substring(0, 3); // Giới hạn 3 ký tự
            
            // Tạo mã dung lượng
            const storageCode = currentVariant.storage.size.replace(/[^0-9A-Z]/gi, '').toUpperCase();
            
            // Tạo timestamp ngắn
            const timestamp = Date.now().toString().slice(-4);
            
            // Tạo số random để đảm bảo unique
            const randomCode = Math.floor(Math.random() * 99).toString().padStart(2, '0');
            
            const sku = `${colorCode}${storageCode}${timestamp}${randomCode}`;
            setCurrentVariant(prev => ({
                ...prev,
                sku
            }));
        }
    };

    const saveVariant = () => {
        // Validation
        if (!currentVariant.color.name || !currentVariant.storage.size || 
            !currentVariant.price || !currentVariant.sku) {
            message.error('Vui lòng điền đầy đủ thông tin variant');
            return;
        }

        // Kiểm tra trùng lặp SKU (trừ variant đang edit)
        const isDuplicateSKU = variantList.some((variant, index) => 
            index !== editingIndex && variant.sku === currentVariant.sku
        );

        if (isDuplicateSKU) {
            message.error('SKU đã tồn tại, vui lòng sử dụng SKU khác');
            return;
        }

        // Kiểm tra trùng lặp tổ hợp màu + dung lượng (trừ variant đang edit)
        const isDuplicateVariant = variantList.some((variant, index) => 
            index !== editingIndex &&
            variant.color.name.toLowerCase() === currentVariant.color.name.toLowerCase() && 
            variant.storage.size.toLowerCase() === currentVariant.storage.size.toLowerCase()
        );

        if (isDuplicateVariant) {
            message.error('Đã tồn tại variant với tổ hợp màu sắc và dung lượng này');
            return;
        }

        const newVariantList = [...variantList];
        
        if (editingIndex >= 0) {
            newVariantList[editingIndex] = { ...currentVariant };
        } else {
            newVariantList.push({ ...currentVariant });
        }

        setVariantList(newVariantList);
        closeModal();
        message.success(editingIndex >= 0 ? 'Cập nhật variant thành công' : 'Thêm variant thành công');
    };

    const deleteVariant = (index) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa variant này?',
            onOk: () => {
                const newVariantList = variantList.filter((_, i) => i !== index);
                setVariantList(newVariantList);
                message.success('Xóa variant thành công');
            }
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <div className="variant-manager">
            <Card 
                title="Quản lý Variants"
                extra={
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => openModal()}
                    >
                        Thêm Variant
                    </Button>
                }
            >
                <div style={{ 
                    marginBottom: '16px', 
                    padding: '12px', 
                    backgroundColor: '#f6ffed', 
                    border: '1px solid #b7eb8f',
                    borderRadius: '6px',
                    fontSize: '13px'
                }}>
                    <strong>💡 Mẹo:</strong> Bạn có thể thêm nhiều phiên bản dung lượng cho cùng một màu sắc. 
                    Ví dụ: "Titan Đen" có thể có cả 256GB, 512GB và 1TB với giá khác nhau.
                </div>
                
                {variantList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                        Chưa có variant nào. Hãy thêm variant đầu tiên!
                    </div>
                ) : (
                    <Row gutter={[16, 16]}>
                        {variantList.map((variant, index) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={`${variant.color.name}-${variant.storage.size}-${index}`}>
                                <Card
                                    size="small"
                                    className="variant-card"
                                    actions={[
                                        <EditOutlined key="edit" onClick={() => openModal(index)} />,
                                        <DeleteOutlined key="delete" onClick={() => deleteVariant(index)} />
                                    ]}
                                >
                                    <div style={{ textAlign: 'center' }}>
                                        {variant.color.image && (
                                            <img 
                                                src={variant.color.image} 
                                                alt={variant.color.name}
                                                style={{ 
                                                    width: '60px', 
                                                    height: '60px', 
                                                    objectFit: 'cover',
                                                    borderRadius: '4px',
                                                    marginBottom: '8px'
                                                }}
                                            />
                                        )}
                                        <div style={{ marginBottom: '4px' }}>
                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    backgroundColor: variant.color.code,
                                                    borderRadius: '50%',
                                                    border: '2px solid #fff',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                                    margin: '0 auto 4px',
                                                    display: 'inline-block'
                                                }}
                                            />
                                            <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                {variant.color.name}
                                            </div>
                                        </div>
                                        <div style={{ margin: '8px 0' }}>
                                            <Tag color="blue" style={{ fontSize: '11px' }}>
                                                {variant.storage.displayName}
                                            </Tag>
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                                            SKU: {variant.sku}
                                        </div>
                                        <div style={{ margin: '4px 0' }}>
                                            {variant.priceDiscount > 0 ? (
                                                <>
                                                    <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '13px' }}>
                                                        {formatPrice(variant.priceDiscount)}
                                                    </div>
                                                    <div style={{ 
                                                        textDecoration: 'line-through', 
                                                        fontSize: '10px', 
                                                        color: '#999' 
                                                    }}>
                                                        {formatPrice(variant.price)}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ color: '#ff4d4f', fontWeight: 'bold', fontSize: '13px' }}>
                                                    {formatPrice(variant.price)}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '11px' }}>
                                            <span style={{ color: variant.stock > 0 ? '#52c41a' : '#ff4d4f' }}>
                                                {variant.stock > 0 ? `Kho: ${variant.stock}` : 'Hết hàng'}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            <Modal
                title={editingIndex >= 0 ? 'Chỉnh sửa Variant' : 'Thêm Variant'}
                open={modalVisible}
                onOk={saveVariant}
                onCancel={closeModal}
                width={600}
                okText={editingIndex >= 0 ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Màu sắc">
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    placeholder="Nhập tên màu sắc"
                                    value={currentVariant.color.name}
                                    onChange={(e) => setCurrentVariant(prev => ({
                                        ...prev,
                                        color: {
                                            ...prev.color,
                                            name: e.target.value
                                        }
                                    }))}
                                    style={{ width: 'calc(100% - 40px)' }}
                                />
                                <input
                                    type="color"
                                    value={currentVariant.color.code}
                                    onChange={(e) => setCurrentVariant(prev => ({
                                        ...prev,
                                        color: {
                                            ...prev.color,
                                            code: e.target.value
                                        }
                                    }))}
                                    style={{ 
                                        width: '40px', 
                                        height: '32px', 
                                        border: '1px solid #d9d9d9',
                                        borderRadius: '0 6px 6px 0',
                                        cursor: 'pointer'
                                    }}
                                />
                            </Space.Compact>
                            <div style={{ marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>Gợi ý: </span>
                                {predefinedColors.slice(0, 5).map(color => (
                                    <Button
                                        key={color.name}
                                        size="small"
                                        style={{ 
                                            marginRight: '4px', 
                                            marginBottom: '4px',
                                            fontSize: '11px',
                                            height: '24px'
                                        }}
                                        onClick={() => setCurrentVariant(prev => ({
                                            ...prev,
                                            color: {
                                                ...prev.color,
                                                name: color.name,
                                                code: color.code
                                            }
                                        }))}
                                    >
                                        {color.name}
                                    </Button>
                                ))}
                            </div>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Dung lượng">
                            <Input
                                placeholder="Nhập dung lượng (VD: 256GB)"
                                value={currentVariant.storage.size}
                                onChange={(e) => setCurrentVariant(prev => ({
                                    ...prev,
                                    storage: {
                                        size: e.target.value,
                                        displayName: e.target.value
                                    }
                                }))}
                            />
                            <div style={{ marginTop: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#666' }}>Gợi ý: </span>
                                {predefinedStorages.slice(0, 4).map(storage => (
                                    <Button
                                        key={storage.size}
                                        size="small"
                                        style={{ 
                                            marginRight: '4px', 
                                            marginBottom: '4px',
                                            fontSize: '11px',
                                            height: '24px'
                                        }}
                                        onClick={() => setCurrentVariant(prev => ({
                                            ...prev,
                                            storage: {
                                                size: storage.size,
                                                displayName: storage.size
                                            }
                                        }))}
                                    >
                                        {storage.size}
                                    </Button>
                                ))}
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Ảnh màu sắc">
                    <Upload
                        listType="picture-card"
                        fileList={colorImageList}
                        onChange={handleColorImageUpload}
                        beforeUpload={() => false}
                        maxCount={1}
                    >
                        {colorImageList.length === 0 && (
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Giá gốc (VNĐ)">
                            <InputNumber
                                min={0}
                                value={currentVariant.price}
                                onChange={(value) => setCurrentVariant(prev => ({ ...prev, price: value || 0 }))}
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giá khuyến mãi (VNĐ)">
                            <InputNumber
                                min={0}
                                value={currentVariant.priceDiscount}
                                onChange={(value) => setCurrentVariant(prev => ({ ...prev, priceDiscount: value || 0 }))}
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Số lượng">
                            <InputNumber
                                min={0}
                                value={currentVariant.stock}
                                onChange={(value) => setCurrentVariant(prev => ({ ...prev, stock: value || 0 }))}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="SKU">
                            <Input.Group compact>
                                <Input
                                    value={currentVariant.sku}
                                    onChange={(e) => setCurrentVariant(prev => ({ ...prev, sku: e.target.value }))}
                                    style={{ width: 'calc(100% - 80px)' }}
                                />
                                <Button onClick={generateSKU} style={{ width: '80px' }}>
                                    Tạo tự động
                                </Button>
                            </Input.Group>
                        </Form.Item>
                    </Col>
                </Row>
            </Modal>
        </div>
    );
};

export default VariantManager; 