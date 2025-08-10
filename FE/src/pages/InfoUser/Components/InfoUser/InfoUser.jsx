import classNames from 'classnames/bind';
import styles from './InfoUser.module.scss';

import { Button, Input, Form, Upload, Avatar, Row, Col, Card, Typography, Divider } from 'antd';
import { UserOutlined, UploadOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import VerifiedBadge from '../../../../components/VerifiedBadge/VerifiedBadge';
import { useStore } from '../../../../hooks/useStore';
import { useEffect, useState } from 'react';
import { requestUpdateInfoUser } from '../../../../Config/request';
import ModalUpdatePassword from './ModalUpdatePassword/ModalUpdatePassword';
import OrderHistory from '../OrderHistory/OrderHistory';
import { SUCCESS_TYPES } from '../../../../components/ProgressSuccess/SuccessProgress';

const cx = classNames.bind(styles);
const { Title, Text } = Typography;

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png';

function InfoUser({ isOpen, setIsOpen, activeTab }) {
    const { dataUser, showSuccessProgress } = useStore();
    const [form] = Form.useForm();

    const [fullName, setFullName] = useState(dataUser.fullName);
    const [email, setEmail] = useState(dataUser.email);
    const [phone, setPhone] = useState(dataUser.phone);
    const [address, setAddress] = useState(dataUser.address || '');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFullName(dataUser.fullName);
        setEmail(dataUser.email);
        setPhone(dataUser.phone);
        setAddress(dataUser.address || '');
        
        // Set avatar preview
        if (dataUser.avatar) {
            setAvatarPreview(dataUser.avatar); // Using Cloudinary URL directly
        } else {
            setAvatarPreview(DEFAULT_AVATAR_URL);
        }

        form.setFieldsValue({
            fullName: dataUser.fullName,
            email: dataUser.email,
            phone: dataUser.phone,
            address: dataUser.address || '',
        });
    }, [dataUser, form]);

    const handleUpdateInfoUser = async (values) => {
        try {
            setLoading(true);
            
            // Validate phone number
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(values.phone)) {
                showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILED, 'Số điện thoại không hợp lệ!');
                return;
            }

            // Create FormData
            const formData = new FormData();
            formData.append('fullName', values.fullName.trim());
            formData.append('email', values.email.trim());
            formData.append('phone', values.phone.trim());
            formData.append('address', values.address ? values.address.trim() : '');
            
            // Only append avatar if a new one was selected
            if (avatar) {
                formData.append('avatar', avatar);
            }

            const res = await requestUpdateInfoUser(formData);
            showSuccessProgress(SUCCESS_TYPES.UPDATE_SUCCESS, res.message || 'Cập nhật thông tin thành công!');
            
            // Reload after 1.5s to show updated info
            setTimeout(() => {
            window.location.reload();
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Cập nhật thông tin thất bại!';
            showSuccessProgress(SUCCESS_TYPES.UPDATE_FAILED, errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        name: 'avatar',
        maxCount: 1,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                showSuccessProgress(SUCCESS_TYPES.ERROR, 'Chỉ chấp nhận file hình ảnh!');
                return false;
            }

            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                showSuccessProgress(SUCCESS_TYPES.ERROR, 'Kích thước ảnh phải nhỏ hơn 2MB!');
                return false;
            }

            // Set file for upload
            setAvatar(file);

            // Create preview URL from local file temporarily
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setAvatarPreview(reader.result);
            };

            return false; // Prevent auto upload
        },
        onRemove: () => {
            setAvatar(null);
            setAvatarPreview(DEFAULT_AVATAR_URL);
        }
    };

    return (
        <div className={cx('wrapper')}>
            {activeTab === 'profile' ? (
                <Card bordered={false} className={cx('profile-card')}>
                    <Title level={4} className={cx('section-title')}>
                        Thông tin cá nhân
                    </Title>
                    <Divider />
                    <Row gutter={[32, 32]}>
                        <Col xs={24} md={8}>
                            <div className={cx('avatar-section')}>
                                <Avatar
                                    size={160}
                                    icon={<UserOutlined />}
                                    src={avatarPreview}
                                    className={cx('avatar-display')}
                                />
                                <Upload {...uploadProps} className={cx('upload-button')}>
                                    <Button icon={<UploadOutlined />} size="large">
                                        Cập nhật ảnh đại diện
                                    </Button>
                                </Upload>
                                <Text type="secondary" className={cx('upload-hint')}>
                                    Cho phép JPG, GIF hoặc PNG. Tối đa 2MB
                                </Text>
                            </div>
                        </Col>
                        <Col xs={24} md={16}>
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleUpdateInfoUser}
                                className={cx('form')}
                                initialValues={{
                                    fullName,
                                    email,
                                    phone,
                                    address,
                                }}
                            >
                                <Row gutter={16}>
                                    <Col xs={24}>
                                        <Form.Item
                                            name="fullName"
                                            label="Họ và tên"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập họ và tên!' },
                                                { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                                            ]}
                                        >
                                            <Input
                                                prefix={<UserOutlined className={cx('input-icon')} />}
                                                size="large"
                                                placeholder="Nhập họ và tên"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="email"
                                            label="Email"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập email!' },
                                                { type: 'email', message: 'Email không hợp lệ!' },
                                            ]}
                                        >
                                            <Input
                                                prefix={<MailOutlined className={cx('input-icon')} />}
                                                size="large"
                                                placeholder="Nhập email"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            name="phone"
                                            label="Số điện thoại"
                                            rules={[
                                                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                                { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
                                            ]}
                                        >
                                            <Input
                                                prefix={<PhoneOutlined className={cx('input-icon')} />}
                                                size="large"
                                                placeholder="Nhập số điện thoại"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col xs={24}>
                                        <Form.Item 
                                            name="address" 
                                            label="Địa chỉ"
                                        >
                                            <Input
                                                prefix={<HomeOutlined className={cx('input-icon')} />}
                                                size="large"
                                                placeholder="Nhập địa chỉ (không bắt buộc)"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item className={cx('submit-section')}>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        loading={loading}
                                        className={cx('submit-button')}
                                    >
                                        Cập nhật thông tin
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Col>
                    </Row>
                </Card>
            ) : (
                <OrderHistory />
            )}
            <ModalUpdatePassword isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
    );
}

export default InfoUser;
