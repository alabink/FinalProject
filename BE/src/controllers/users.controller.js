const modelUser = require('../models/users.model');
const modelPayments = require('../models/payments.model');
const modelProduct = require('../models/products.model');
const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');

const { BadRequestError } = require('../core/error.response');
const { createApiKey, createToken, createRefreshToken, verifyToken } = require('../services/tokenSevices');
const MailForgotPassword = require('../services/MailForgotPassword');

const { Created, OK } = require('../core/success.response');

const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { jwtDecode } = require('jwt-decode');

// Default avatar URL
const DEFAULT_AVATAR_URL = 'https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/man-user-color-icon.png';

class controllerUsers {
    async register(req, res) {
        const { firstname, lastname, email, password, phone } = req.body;

        if (!firstname || !lastname || !email || !password || !phone) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const user = await modelUser.findOne({ email });
        if (user) {
            throw new BadRequestError('Email đã được sử dụng');
        } else {
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const passwordHash = bcrypt.hashSync(password, salt);
            const newUser = await modelUser.create({
                fullName: `${firstname} ${lastname}`,
                email,
                password: passwordHash,
                typeLogin: 'email',
                phone,
                avatar: DEFAULT_AVATAR_URL,
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });

            const isSecure = process.env.NODE_ENV === 'production';
            res.cookie('token', token, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            // Encrypt user data
            const userString = JSON.stringify(newUser);
            const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();

            new Created({
                message: 'Đăng ký thành công',
                metadata: { token, refreshToken, auth },
            }).send(res);
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const user = await modelUser.findOne({ email });
        if (!user) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        
        // Kiểm tra tài khoản có bị khóa không
        if (user.isBlocked) {
            throw new BadRequestError('Tài khoản của bạn đã bị khóa, hãy liên hệ admin qua mail: techify.asia@gmail.com để có thể khiếu nại');
        }
        
        if (user.typeLogin === 'google') {
            throw new BadRequestError('Tài khoản đăng nhập bằng google');
        }

        const checkPassword = bcrypt.compareSync(password, user.password);
        if (!checkPassword) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(user._id);
        const token = await createToken({ id: user._id });
        const refreshToken = await createRefreshToken({ id: user._id });

        const isSecure = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        });

        res.cookie('logged', 1, {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        });

        // Encrypt user data
        const userString = JSON.stringify(user);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();

        new OK({
            message: 'Đăng nhập thành công',
            metadata: { token, refreshToken, auth },
        }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ email: dataToken.email });
        if (user) {
            await createApiKey(user._id);
            const token = await createToken({ id: user._id });
            const refreshToken = await createRefreshToken({ id: user._id });

            const isSecure = process.env.NODE_ENV === 'production';
            res.cookie('token', token, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            // Encrypt user data
            const userString = JSON.stringify(user);
            const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();

            new OK({
                message: 'Đăng nhập thành công',
                metadata: { token, refreshToken, auth },
            }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
                avatar: DEFAULT_AVATAR_URL,
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });

            const isSecure = process.env.NODE_ENV === 'production';
            res.cookie('token', token, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
            });

            // Encrypt user data
            const userString = JSON.stringify(newUser);
            const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();

            new OK({
                message: 'Đăng nhập thành công',
                metadata: { token, refreshToken, auth },
            }).send(res);
        }
    }

    async authUser(req, res) {
        const user = req.user;
        const findUser = await modelUser.findOne({ _id: user.id });
        if (!findUser) {
            throw new BadRequestError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const userString = JSON.stringify(findUser);
        const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();
        new OK({ message: 'success', metadata: { auth } }).send(res);
    }

    async logout(req, res) {
        const user = req.user;
        await modelApiKey.deleteOne({ userId: user.id });
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.clearCookie('logged');
        new OK({ message: 'Đăng xuất thành công' }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;
        const decoded = await verifyToken(refreshToken);
        const user = await modelUser.findById(decoded.id);
        const token = await createToken({ id: user._id });

        const isSecure = process.env.NODE_ENV === 'production';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        });

        res.cookie('logged', 1, {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async updateInfoUser(req, res) {
        try {
            const { id } = req.user;
            const { fullName, phone, email, address } = req.body;

            // Validate required fields
            if (!fullName || !phone || !email) {
                throw new BadRequestError('Vui lòng nhập đầy đủ thông tin bắt buộc');
            }

            // Validate phone number
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                throw new BadRequestError('Số điện thoại không hợp lệ');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new BadRequestError('Email không hợp lệ');
            }

            // Check if email exists for other users
            const existingUser = await modelUser.findOne({ 
                email, 
                _id: { $ne: id } 
            });
            if (existingUser) {
                throw new BadRequestError('Email đã được sử dụng bởi tài khoản khác');
            }

            // Prepare update data
            const updateData = {
                fullName: fullName.trim(),
                phone: phone.trim(),
                email: email.trim(),
                address: address ? address.trim() : ''
            };

            // Add avatar if uploaded
            if (req.file) {
                updateData.avatar = req.file.path; // Cloudinary returns the full URL in path
            }

            // Update user info
            await modelUser.updateOne(
                { _id: id },
                updateData
            );

            // Get updated user data
            const updatedUser = await modelUser.findById(id);
            const userString = JSON.stringify(updatedUser);
            const auth = CryptoJS.AES.encrypt(userString, process.env.SECRET_CRYPTO).toString();

            new OK({ 
                message: 'Cập nhật thông tin thành công',
                metadata: { auth }
            }).send(res);
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError('Có lỗi xảy ra khi cập nhật thông tin');
        }
    }

    async changePassword(req, res) {
        const { id } = req.user;
        const { oldPassword, newPassword } = req.body;
        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('Không tìm thấy người dùng');
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestError('Mật khẩu không chính xác');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await modelUser.updateOne({ _id: id }, { password: hashedPassword });
        new OK({
            message: 'Đổi mật khẩu thành công',
            metadata: 'success',
        }).send(res);
    }

    async authAdmin(req, res) {
        const { id } = req.user;
        const findUser = await modelUser.findById(id);
        if (findUser.isAdmin === false) {
            throw new BadRequestError('Bạn không có quyền truy cập');
        }
        new OK({ message: 'Đăng nhập thành công' }).send(res);
    }

    async updateUser(req, res) {
        const { id, fullName, email, phone, isAdmin } = req.body;
        await modelUser.updateOne({ _id: id }, { fullName, email, phone, isAdmin });
        new OK({ message: 'Cập nhật thông tin người dùng thành công' }).send(res);
    }

    async getAdminStats(req, res) {
        try {
            const { period = 'week' } = req.query; // 'day', 'week', 'month'
            
            // Lấy tổng số người dùng
            const totalUsers = await modelUser.countDocuments();

            // Lấy tất cả đơn hàng và sắp xếp theo ngày tạo
            const allOrders = await modelPayments.find().sort({ createdAt: -1 });

            // Thống kê trạng thái đơn hàng
            const newOrders = allOrders.filter(order => order.statusOrder === 'pending').length;
            const processingOrders = allOrders.filter(order => order.statusOrder === 'completed').length;
            const completedOrders = allOrders.filter(order => order.statusOrder === 'delivered').length;

            // Tính doanh thu hôm nay
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayOrders = allOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= today && orderDate < tomorrow && order.statusOrder === 'delivered';
            });

            const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

            // Tính doanh thu theo period
            let periodRevenue = [];
            let periodOrders = [];
            
            if (period === 'day') {
                // Thống kê theo giờ trong ngày hôm nay
                for (let i = 0; i < 24; i++) {
                    const startHour = new Date(today);
                    startHour.setHours(i, 0, 0, 0);
                    const endHour = new Date(today);
                    endHour.setHours(i + 1, 0, 0, 0);

                    const hourOrders = allOrders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= startHour && orderDate < endHour;
                    });

                    const hourlyRevenue = hourOrders
                        .filter(order => order.statusOrder === 'delivered')
                        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

                    const orderCount = hourOrders.length;

                    periodRevenue.push({
                        label: `${i.toString().padStart(2, '0')}:00`,
                        revenue: hourlyRevenue,
                        orderCount
                    });
                }
            } else if (period === 'week') {
                // Thống kê 7 ngày gần đây
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);
                    
                    const nextDay = new Date(date);
                    nextDay.setDate(nextDay.getDate() + 1);

                    const dayOrders = allOrders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= date && orderDate < nextDay;
                    });

                    const dailyRevenue = dayOrders
                        .filter(order => order.statusOrder === 'delivered')
                        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

                    const orderCount = dayOrders.length;

                    periodRevenue.push({
                        label: date.toLocaleDateString('vi-VN', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                        }),
                        revenue: dailyRevenue,
                        orderCount
                    });
                }
            } else if (period === 'month') {
                // Thống kê theo ngày trong tháng hiện tại
                const currentMonth = new Date();
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                for (let day = 1; day <= daysInMonth; day++) {
                    const startOfDay = new Date(year, month, day, 0, 0, 0, 0);
                    const endOfDay = new Date(year, month, day + 1, 0, 0, 0, 0);

                    const dayOrders = allOrders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= startOfDay && orderDate < endOfDay;
                    });

                    const dailyRevenue = dayOrders
                        .filter(order => order.statusOrder === 'delivered')
                        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

                    const orderCount = dayOrders.length;

                    periodRevenue.push({
                        label: `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}`,
                        revenue: dailyRevenue,
                        orderCount
                    });
                }
            }

            // Lấy 10 đơn hàng gần đây nhất với thông tin sản phẩm
            const recentOrdersWithProducts = await Promise.all(
                allOrders.slice(0, 10).map(async (order) => {
                    let productName = 'Không có sản phẩm';
                    
                    if (order.products && order.products.length > 0) {
                        try {
                            const firstProduct = await modelProduct.findById(order.products[0].productId);
                            if (firstProduct) {
                                productName = firstProduct.name;
                                if (order.products.length > 1) {
                                    productName += ` và ${order.products.length - 1} sản phẩm khác`;
                                }
                            }
                        } catch (error) {
                            productName = 'Sản phẩm không tồn tại';
                        }
                    }

                    // Tạo mã đơn hàng từ timestamp và ObjectId
                    const orderDate = new Date(order.createdAt);
                    const dateStr = orderDate.getFullYear().toString().slice(-2) + 
                                   (orderDate.getMonth() + 1).toString().padStart(2, '0') + 
                                   orderDate.getDate().toString().padStart(2, '0');
                    const orderCode = 'DH' + dateStr + order._id.toString().substring(18, 24).toUpperCase();

                    return {
                        key: order._id,
                        order: orderCode,
                        customer: order.fullName,
                        product: productName,
                        amount: order.totalPrice,
                        status: order.statusOrder === 'pending' ? 'Chờ xử lý' :
                                order.statusOrder === 'completed' ? 'Đã xác nhận' :
                                order.statusOrder === 'shipping' ? 'Đang giao' :
                                order.statusOrder === 'delivered' ? 'Đã giao' :
                                order.statusOrder === 'cancelled' ? 'Đã hủy' : 'Không xác định'
                    };
                })
            );

            const stats = {
                totalUsers,
                newOrders,
                processingOrders,
                completedOrders,
                todayRevenue,
                periodRevenue,
                period,
                recentOrders: recentOrdersWithProducts
            };

            new OK({ 
                message: 'Lấy thống kê thành công', 
                metadata: stats 
            }).send(res);

        } catch (error) {
            console.error('Error in getAdminStats:', error);
            throw new BadRequestError('Không thể lấy thống kê admin');
        }
    }

    async getAllUser(req, res) {
        try {
            const users = await modelUser.find().select('-password');
            new OK({
                message: 'Lấy danh sách người dùng thành công',
                metadata: { users }
            }).send(res);
        } catch (error) {
            console.error('Error in getAllUser:', error);
            throw new BadRequestError('Không thể lấy danh sách người dùng');
        }
    }

    async toggleBlockUser(req, res) {
        try {
            const { userId } = req.body;
            
            if (!userId) {
                throw new BadRequestError('ID người dùng là bắt buộc');
            }

            const user = await modelUser.findById(userId);
            if (!user) {
                throw new BadRequestError('Không tìm thấy người dùng');
            }

            // Không cho phép khóa tài khoản admin
            if (user.isAdmin) {
                throw new BadRequestError('Không thể khóa tài khoản quản trị viên');
            }

            // Toggle trạng thái khóa
            const newBlockedStatus = !user.isBlocked;
            await modelUser.updateOne({ _id: userId }, { isBlocked: newBlockedStatus });

            const action = newBlockedStatus ? 'khóa' : 'mở khóa';
            new OK({
                message: `Đã ${action} tài khoản thành công`,
                metadata: { isBlocked: newBlockedStatus }
            }).send(res);
        } catch (error) {
            console.error('Error in toggleBlockUser:', error);
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError('Có lỗi xảy ra khi thay đổi trạng thái tài khoản');
        }
    }

    async deleteUser(req, res) {
        try {
            const { userId } = req.body;
            
            if (!userId) {
                throw new BadRequestError('ID người dùng là bắt buộc');
            }

            const user = await modelUser.findById(userId);
            if (!user) {
                throw new BadRequestError('Không tìm thấy người dùng');
            }

            // Không cho phép xóa tài khoản admin
            if (user.isAdmin) {
                throw new BadRequestError('Không thể xóa tài khoản quản trị viên');
            }

            // Xóa tài khoản
            await modelUser.deleteOne({ _id: userId });

            new OK({
                message: 'Đã xóa tài khoản thành công',
                metadata: { deleted: true }
            }).send(res);
        } catch (error) {
            console.error('Error in deleteUser:', error);
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError('Có lỗi xảy ra khi xóa tài khoản');
        }
    }
}

module.exports = new controllerUsers();