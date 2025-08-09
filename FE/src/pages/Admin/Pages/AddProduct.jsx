import React, { useState } from 'react';
import { Form, Input, InputNumber, Upload, Button, Card, message, Space, Switch, Divider } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { requestAddProduct, requestUploadImage } from '../../../Config/request';
import { useStore } from '../../../hooks/useStore';
import { Select } from 'antd';
import VariantManager from '../Components/VariantManager/VariantManager';

const { TextArea } = Input;

const AddProduct = ({ setActiveComponent }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [variants, setVariants] = useState([]);
    const [useVariants, setUseVariants] = useState(false);

    const { dataCategory } = useStore();

    // Custom file change handler để tránh trùng lặp
    const handleFileChange = ({ fileList: newFileList }) => {
        // Lọc bỏ file trùng lặp dựa trên name, size và lastModified
        const uniqueFiles = [];
        const fileSignatures = new Set();

        newFileList.forEach(file => {
            const signature = `${file.name}-${file.size}-${file.lastModified || ''}`;
            
            if (!fileSignatures.has(signature)) {
                fileSignatures.add(signature);
                // Đảm bảo mỗi file có uid duy nhất
                if (!file.uid) {
                    file.uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                }
                uniqueFiles.push(file);
            }
        });

        setFileList(uniqueFiles);
        // Cập nhật form field
        form.setFieldsValue({ image: uniqueFiles });
    };

    const handleUpload = async (files) => {
        try {
            const formData = new FormData();

            // Lọc và thêm tất cả files hợp lệ vào formData
            const validFiles = files.filter(file => file.originFileObj && file.originFileObj instanceof File);
            
            if (validFiles.length === 0) {
                throw new Error('Không có file hợp lệ để upload');
            }

            // Validation thêm để tránh trùng lặp file name
            const fileNames = new Set();
            const uniqueValidFiles = validFiles.filter(file => {
                const fileName = file.originFileObj.name;
                if (fileNames.has(fileName)) {
                    return false;
                }
                fileNames.add(fileName);
                return true;
            });

            uniqueValidFiles.forEach((file) => {
                formData.append('images', file.originFileObj);
            });

            const res = await requestUploadImage(formData);
            return res.metadata;
        } catch (error) {
            console.error('Upload failed:', error);
            message.error('Upload ảnh thất bại!');
            throw error;
        }
    };

    const onFinish = async (values) => {
        try {
            // Kiểm tra và upload ảnh từ fileList state
            if (!fileList || fileList.length === 0) {
                message.error('Vui lòng chọn ít nhất một ảnh!');
                return;
            }

            // Kiểm tra variants nếu đã bật chế độ variants
            if (useVariants) {
                if (!variants || variants.length === 0) {
                    message.error('Vui lòng thêm ít nhất một variant khi sử dụng chế độ variants!');
                    return;
                }
                
                // Kiểm tra từng variant có đầy đủ thông tin
                for (let i = 0; i < variants.length; i++) {
                    const variant = variants[i];
                    if (!variant.color?.name || !variant.storage?.size || !variant.price || !variant.sku) {
                        message.error(`Variant ${i + 1} thiếu thông tin bắt buộc!`);
                        return;
                    }
                }
            } else {
                // Nếu không dùng variants, kiểm tra các field cũ
                if (!values.price || !values.stock) {
                    message.error('Vui lòng nhập giá và số lượng sản phẩm!');
                    return;
                }
            }

            // Upload ảnh trước
            const imageUrls = await handleUpload(fileList);

            // Tạo dữ liệu sản phẩm
            const productData = {
                name: values.name,
                brand: values.brand,
                description: values.description || '',
                images: imageUrls,
                category: values.category,
                attributes: {
                    cpu: values.cpu,
                    screen: values.screen,
                    gpu: values.gpu,
                    storage: values.storage,
                    screenHz: values.screenHz,
                    ram: values.ram,
                    battery: values.battery,
                    camera: values.camera,
                    weight: values.weight,
                },
            };

            if (useVariants) {
                // Sử dụng variants
                productData.variants = variants;
            } else {
                // Sử dụng cách cũ
                productData.price = values.price;
                productData.priceDiscount = values.priceDiscount || 0;
                productData.stock = values.stock;
            }

            message.loading({ content: 'Đang thêm sản phẩm...', key: 'addProduct' });
            
            // Gửi dữ liệu sản phẩm
            await requestAddProduct(productData);

            message.success({ content: 'Thêm sản phẩm thành công', key: 'addProduct' });
            form.resetFields();
            setFileList([]); // Reset file list
            setVariants([]); // Reset variants
            setUseVariants(false); // Reset variant mode
            setActiveComponent('products');
        } catch (error) {
            console.error('Error adding product:', error);
            
            if (error.response) {
                // Xử lý lỗi từ server
                if (error.response.status === 401) {
                    message.error({ 
                        content: 'Bạn không có quyền thêm sản phẩm hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!', 
                        key: 'addProduct',
                        duration: 5 
                    });
                } else if (error.response.data && error.response.data.message) {
                    message.error({ 
                        content: `Lỗi: ${error.response.data.message}`, 
                        key: 'addProduct',
                        duration: 5 
                    });
                } else {
                    message.error({ 
                        content: `Có lỗi xảy ra: ${error.response.status}`, 
                        key: 'addProduct',
                        duration: 5 
                    });
                }
            } else {
                message.error({ 
                    content: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!', 
                    key: 'addProduct',
                    duration: 5 
                });
            }
        }
    };

    const handleBack = () => {
        setActiveComponent('products'); // Quay lại trang quản lý sản phẩm
    };

    return (
        <Card
            title={
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
                        Quay lại
                    </Button>
                    <span>Thêm Sản Phẩm Mới</span>
                </Space>
            }
        >
            <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
                <Form.Item
                    name="category"
                    label="Danh mục"
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                >
                    <Select
                        defaultValue="Chọn danh mục"
                        style={{ flex: 1 }}
                        options={dataCategory.map((item) => ({
                            value: item._id,
                            label: item.nameCategory,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
                >
                    <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Form.Item
                    name="brand"
                    label="Thương hiệu"
                    rules={[{ required: true, message: 'Vui lòng nhập thương hiệu!' }]}
                >
                    <Input placeholder="Nhập thương hiệu" />
                </Form.Item>

                <Form.Item name="description" label="Mô tả sản phẩm">
                    <TextArea rows={3} placeholder="Nhập mô tả sản phẩm" />
                </Form.Item>

                <Divider />
                
                {/* Chế độ variants */}
                <Form.Item label="Sử dụng biến thể sản phẩm (màu sắc, dung lượng)">
                    <Switch 
                        checked={useVariants} 
                        onChange={setUseVariants}
                        checkedChildren="Có"
                        unCheckedChildren="Không"
                    />
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                        {useVariants 
                            ? 'Sản phẩm sẽ có nhiều biến thể với màu sắc và dung lượng khác nhau'
                            : 'Sản phẩm đơn giản với một giá và số lượng duy nhất'
                        }
                    </div>
                </Form.Item>

                {useVariants ? (
                    // Hiển thị VariantManager nếu bật chế độ variants
                    <VariantManager 
                        variants={variants}
                        onChange={setVariants}
                        form={form}
                    />
                ) : (
                    // Hiển thị form cũ nếu không dùng variants
                    <>
                        <Form.Item name="price" label="Giá gốc" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="Nhập giá gốc"
                            />
                        </Form.Item>

                        <Form.Item name="priceDiscount" label="Giá khuyến mãi">
                            <InputNumber
                                style={{ width: '100%' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                placeholder="Nhập giá khuyến mãi"
                            />
                        </Form.Item>

                        <Form.Item
                            name="stock"
                            label="Số lượng trong kho"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="Nhập số lượng" />
                        </Form.Item>
                    </>
                )}

                <Divider />

                <Form.Item
                    name="image"
                    label="Hình ảnh"
                    rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh!' }]}
                >
                    <Upload
                        name="images"
                        listType="picture-card"
                        multiple
                        maxCount={10}
                        fileList={fileList}
                        onChange={handleFileChange}
                        beforeUpload={() => false} // Ngăn upload tự động
                        onRemove={(file) => {
                            const newFileList = fileList.filter(item => item.uid !== file.uid);
                            setFileList(newFileList);
                            form.setFieldsValue({ image: newFileList });
                        }}
                    >
                        {fileList.length >= 10 ? null : (
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

                <Form.Item name="cpu" label="CPU" rules={[{ required: true, message: 'Vui lòng nhập thông tin CPU!' }]}>
                    <Input placeholder="Ví dụ: Intel Core i7-11800H" />
                </Form.Item>

                <Form.Item
                    name="screen"
                    label="Màn hình"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin màn hình!' }]}
                >
                    <Input placeholder="Ví dụ: 15.6 inch FHD" />
                </Form.Item>

                <Form.Item
                    name="gpu"
                    label="Card đồ họa"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin GPU!' }]}
                >
                    <Input placeholder="Ví dụ: NVIDIA RTX 3060" />
                </Form.Item>

                <Form.Item
                    name="storage"
                    label="Ổ cứng"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin ổ cứng!' }]}
                >
                    <Input placeholder="Ví dụ: 512GB SSD NVMe" />
                </Form.Item>

                <Form.Item
                    name="screenHz"
                    label="Tần số màn hình"
                    rules={[{ required: true, message: 'Vui lòng nhập tần số màn hình!' }]}
                >
                    <Input placeholder="Ví dụ: 144Hz" />
                </Form.Item>

                <Form.Item name="ram" label="RAM" rules={[{ required: true, message: 'Vui lòng nhập thông tin RAM!' }]}>
                    <Input placeholder="Ví dụ: 16GB DDR4 3200MHz" />
                </Form.Item>

                <Form.Item
                    name="battery"
                    label="Pin"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin pin!' }]}
                >
                    <Input placeholder="Ví dụ: 4 Cell 90WHr" />
                </Form.Item>

                <Form.Item
                    name="camera"
                    label="Camera"
                    rules={[{ required: true, message: 'Vui lòng nhập thông tin camera!' }]}
                >
                    <Input placeholder="Ví dụ: HD 720p" />
                </Form.Item>

                <Form.Item
                    name="weight"
                    label="Cân nặng"
                    rules={[{ required: true, message: 'Vui lòng nhập cân nặng!' }]}
                >
                    <Input placeholder="Ví dụ: 2.3 kg" />
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit">
                            Thêm sản phẩm
                        </Button>
                        <Button onClick={handleBack}>Hủy</Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default AddProduct;
