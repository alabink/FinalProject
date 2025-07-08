const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const MailForgotPassword = async (email, otp) => {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        await transport.sendMail({
            from: `"Techify" <${process.env.USER_EMAIL}>`,
            to: email,
            subject: 'Quên mật khẩu - Khôi phục tài khoản',
            text: `Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản của mình. Mã OTP để đặt lại mật khẩu của bạn là: ${otp}. Vui lòng nhập mã này trong vòng 5 phút để hoàn tất quá trình khôi phục.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color:rgb(69, 84, 255);">Techify</h2>
                        <p style="color: #555; font-size: 14px;">Khôi phục mật khẩu tài khoản</p>
                    </div>
                    <p>Xin chào <strong>${email}</strong>,</p>
                    <p>Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                    <p>Mã OTP để đặt lại mật khẩu của bạn là: <strong style="font-size: 18px; color: #e67e22;">${otp}</strong></p>
                    <p>Mã OTP có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng nhập mã này trên trang khôi phục mật khẩu để tiếp tục.</p>
                    <p>Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email <a href="mailto:${process.env.USER_EMAIL}" style="color: #3498db; text-decoration: none;">${process.env.USER_EMAIL}</a>.</p>
                    <p style="margin-top: 20px; font-size: 14px; text-align: center; color: #777;">Trân trọng,</p>
                    <p style="text-align: center; color:rgb(69, 84, 255); font-size: 18px;">Đội ngũ Techify</p>
                </div>
            `,
        });
    } catch (error) {
        console.log('Lỗi khi gửi email:', error);
    }
};

module.exports = MailForgotPassword;
