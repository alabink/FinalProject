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
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
                maxAge: 15 * 60 * 1000, // 15 phút
            });

            res.cookie('logged', 1, {
                httpOnly: false,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isSecure,
                sameSite: 'Lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
            maxAge: 15 * 60 * 1000, // 15 phút
        });

        res.cookie('logged', 1, {
            httpOnly: false,
            secure: isSecure,
            sameSite: 'Lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
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
}

module.exports = new controllerUsers();