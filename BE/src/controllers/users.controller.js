const modelUser = require('../models/users.model');
const modelPayments = require('../models/payments.model');
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
                avatar: DEFAULT_AVATAR_URL, // Set default avatar
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            res.cookie('token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new Created({
                message: 'Đăng ký thành công',
                metadata: { token, refreshToken },
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

        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({
            message: 'Đăng nhập thành công',
            metadata: { token, refreshToken },
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
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({
                message: 'Đăng nhập thành công',
                metadata: { token, refreshToken },
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
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({
                message: 'Đăng nhập thành công',
                metadata: { token, refreshToken, message: 'Đăng nhập thành công' },
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
        res.cookie('token', token, {
            httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
            secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
            sameSite: 'Strict', // Chống tấn công CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async getAdminStats(req, res) {
        try {
            // 1. Thống kê tổng số người dùng
            const totalUsers = await modelUser.countDocuments();

            // 2. Thống kê đơn hàng và doanh thu
            const orderStats = await modelPayments.aggregate([
                {
                    $facet: {
                        // Đơn hàng theo trạng thái
                        ordersByStatus: [
                            {
                                $group: {
                                    _id: '$statusOrder',
                                    count: { $sum: 1 },
                                },
                            },
                        ],
                        // Doanh thu hôm nay
                        todayRevenue: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                    },
                                    statusOrder: { $ne: 'cancelled' },
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: '$totalPrice' },
                                },
                            },
                        ],
                        // Doanh thu 7 ngày gần nhất
                        weeklyRevenue: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                                    },
                                    statusOrder: { $ne: 'cancelled' },
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                                    },
                                    dailyRevenue: { $sum: '$totalPrice' },
                                    orderCount: { $sum: 1 },
                                },
                            },
                            { $sort: { _id: 1 } },
                        ],
                        // Đơn hàng gần đây
                        recentOrders: [
                            { $sort: { createdAt: -1 } },
                            { $limit: 10 },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'user',
                                },
                            },
                        ],
                    },
                },
            ]);

            // Xử lý kết quả thống kê
            const stats = orderStats[0];

            // Chuyển đổi ordersByStatus thành object dễ sử dụng
            const orderStatusCounts = stats.ordersByStatus.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {});

            // Tạo mảng 7 ngày gần nhất
            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse();

            // Map dữ liệu doanh thu với 7 ngày
            const formattedWeeklyRevenue = last7Days.map((date) => {
                const dayData = stats.weeklyRevenue.find((item) => item._id === date) || {
                    dailyRevenue: 0,
                    orderCount: 0,
                };
                return {
                    _id: date,
                    dailyRevenue: dayData.dailyRevenue,
                    orderCount: dayData.orderCount,
                    dayLabel: new Date(date).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                    }),
                };
            });

            // Format đơn hàng gần đây
            const formattedRecentOrders = stats.recentOrders.map((order) => ({
                key: order._id.toString(),
                order: order._id.toString().slice(-6).toUpperCase(),
                customer: order.fullName,
                product: `${order.products.length} sản phẩm`,
                amount: order.totalPrice,
                status:
                    order.statusOrder === 'pending'
                        ? 'Chờ xử lý'
                        : order.statusOrder === 'shipping'
                        ? 'Đang giao'
                        : order.statusOrder === 'delivered'
                        ? 'Đã giao'
                        : 'Đã hủy',
            }));

            new OK({
                message: 'Lấy thống kê thành công',
                metadata: {
                    totalUsers,
                    newOrders: orderStatusCounts.pending || 0,
                    processingOrders: orderStatusCounts.shipping || 0,
                    completedOrders: orderStatusCounts.delivered || 0,
                    todayRevenue: stats.todayRevenue[0]?.total || 0,
                    weeklyRevenue: formattedWeeklyRevenue,
                    recentOrders: formattedRecentOrders,
                    orderStatusCounts,
                },
            }).send(res);
        } catch (error) {
            console.error('Error in getAdminStats:', error);
            throw new BadRequestError('Lỗi khi lấy thống kê');
        }
    }

    async getAllUser(req, res) {
        const users = await modelUser.find();
        new OK({
            message: 'Lấy thống kê thông tin người dùng',
            metadata: { users },
        }).send(res);
    }

    async changePassword(req, res) {
        const { id } = req.user;
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (!oldPassword || !newPassword || !confirmPassword) {
            throw new BadRequestError('Vui lòng nhập đày đủ thông tin');
        }

        if (newPassword !== confirmPassword) {
            throw new BadRequestError('Mật khẩu không khớp');
        }

        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('Không tìm thấy người dùng');
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new BadRequestError('Mật khẩu cũ không chính xác');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();
        new OK({ message: 'Đổi mật khẩu thành công' }).send(res);
    }

    async sendMailForgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new BadRequestError('Vui lòng nhập email');
            }
            
            const user = await modelUser.findOne({ email });
            if (!user) {
                throw new BadRequestError('Email không tồn tại trong hệ thống');
            }

            // Check if user is Google account
            if (user.typeLogin === 'google') {
                throw new BadRequestError('Tài khoản Google không thể đặt lại mật khẩu');
            }
            
            const otp = otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });

            // Delete existing OTP for this email
            await modelOtp.deleteMany({ email });

            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const passwordHash = bcrypt.hashSync(otp, salt);

            // Create new OTP with type field
            await modelOtp.create({ 
                email: user.email, 
                otp: passwordHash,
                type: 'forgot_password'
            });
            
            try {
                // Send email
                await MailForgotPassword(email, otp);
                
                // Create token with shorter expiration time
                const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY_JWT || '123456';
                const token = jwt.sign({ email: user.email }, SECRET_KEY, {
                    expiresIn: '5m', // 5 minutes to match OTP expiration
                });
                
                res.cookie('tokenOtp', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 5 * 60 * 1000, // 5 minutes
                });
                
                new OK({ message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra email!' }).send(res);
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                
                // Delete the OTP since email failed
                await modelOtp.deleteMany({ email });
                
                throw new BadRequestError('Không thể gửi email. Vui lòng thử lại sau!');
            }
        } catch (error) {
            console.error('Error in sendMailForgotPassword:', error);
            
            // If it's already a BadRequestError, pass it through
            if (error instanceof BadRequestError) {
                throw error;
            }
            
            // Otherwise, wrap it in a BadRequestError
            throw new BadRequestError(error.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau!');
        }
    }

    async verifyOtp(req, res) {
        const { otp, newPassword } = req.body;
        const token = req.cookies.tokenOtp;
        
        if (!token) {
            throw new BadRequestError('Phiên làm việc đã hết hạn. Vui lòng thử lại!');
        }

        if (!otp || !newPassword) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        if (newPassword.length < 6) {
            throw new BadRequestError('Mật khẩu phải có ít nhất 6 ký tự');
        }

        try {
            // Verify JWT token
            const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY_JWT || '123456';
            const decoded = jwt.verify(token, SECRET_KEY);
            const { email } = decoded;

            // Find OTP record
            const findOtp = await modelOtp.findOne({ 
                email: email, 
                type: 'forgot_password' 
            });
            
        if (!findOtp) {
                // Clear invalid cookie
                res.clearCookie('tokenOtp');
                throw new BadRequestError('Mã OTP đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu mã mới!');
        }

            // Verify OTP
        const checkOtp = bcrypt.compareSync(otp, findOtp.otp);
        if (!checkOtp) {
                throw new BadRequestError('Mã OTP không chính xác. Vui lòng kiểm tra lại!');
        }

            // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
            
            // Update password
        await modelUser.updateOne({ email }, { password: hashedPassword });
            
            // Clean up: delete OTP and clear cookie
            await modelOtp.deleteOne({ email, type: 'forgot_password' });
            res.clearCookie('tokenOtp');
            
            new OK({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.' }).send(res);
            
        } catch (error) {
            // Clear cookie on any error
        res.clearCookie('tokenOtp');
            
            if (error.name === 'TokenExpiredError') {
                // Clean up expired OTP
                try {
                    const decoded = jwt.decode(token);
                    if (decoded && decoded.email) {
                        await modelOtp.deleteMany({ email: decoded.email });
                    }
                } catch (decodeError) {
                    console.error('Error decoding expired token:', decodeError);
                }
                throw new BadRequestError('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới!');
            }
            
            if (error.name === 'JsonWebTokenError') {
                throw new BadRequestError('Phiên làm việc không hợp lệ. Vui lòng thử lại!');
            }
            
            // Re-throw BadRequestError as is
            if (error instanceof BadRequestError) {
                throw error;
            }
            
            throw new BadRequestError('Có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại!');
        }
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
                updateData.avatar = req.file.filename;
            }

            // Update user info
            await modelUser.updateOne(
                { _id: id },
                updateData
            );

            new OK({ 
                message: 'Cập nhật thông tin thành công',
                metadata: updateData
            }).send(res);
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError('Có lỗi xảy ra khi cập nhật thông tin');
        }
    }

    async updatePassword(req, res) {
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
            message: 'Đăng nhập thành công',
            metadata: 'success',
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
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // Chống tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({
                message: 'Đăng nhập thành công',
                metadata: { token, refreshToken },
            }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser._id);
            const token = await createToken({ id: newUser._id });
            const refreshToken = await createRefreshToken({ id: newUser._id });
            res.cookie('token', token, {
                httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 15 * 60 * 1000, // 15 phút
            });
            res.cookie('logged', 1, {
                httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
                secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
                sameSite: 'Strict', // ChONGL tấn công CSRF
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });
            new OK({
                message: 'Đăng nhập thành công',
                metadata: { token, refreshToken },
            }).send(res);
        }
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
}

module.exports = new controllerUsers();
