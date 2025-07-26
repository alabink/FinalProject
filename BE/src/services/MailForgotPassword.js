const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fallback values for environment variables
const CLIENT_ID = process.env.CLIENT_ID || '';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || '';
const USER_EMAIL = process.env.USER_EMAIL || 'noreply@techify.com';

// Create OAuth2 client with error handling
let oAuth2Client;
try {
    oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
} catch (error) {
    console.error('Error creating OAuth2 client:', error);
}

// Create a fallback transporter for testing/development
const createFallbackTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: USER_EMAIL,
            pass: 'testpassword'
        }
    });
};

// Function to get logo as base64
const getLogoBase64 = () => {
    try {
        // Path to logo file
        const logoPath = path.join(__dirname, '../uploads/logo1.png');
        // Read file as buffer
        const logoBuffer = fs.readFileSync(logoPath);
        // Convert to base64
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Error reading logo file:', error);
        // Return empty string if error
        return '';
    }
};

const MailForgotPassword = async (email, otp) => {
    try {
        // Check if OAuth2 client is properly configured
        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !USER_EMAIL) {
            console.warn('Email credentials not properly configured. Using fallback transporter.');
            throw new Error('Email credentials not properly configured');
        }
        
        // Get access token
        const accessToken = await oAuth2Client.getAccessToken();
        
        // Get logo as base64
        const logoBase64 = getLogoBase64();
        
        // Create transporter with OAuth2
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: USER_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        
        // Email Template - Simplified for wider compatibility
        const htmlTemplate = `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <title>Khôi phục mật khẩu - Techify</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9f8ff; font-family: 'Segoe UI', Arial, Helvetica, sans-serif;">
            <!-- Elegant Wrapper with Gold Accents -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 650px; margin: 20px auto; background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwYXRoIGQ9Ik0gLTIwIC0yMCBMIDIwIDIwIE0gNDAgLTIwIEwgODAgMjAgTSAtMjAgNDAgTCAyMCA4MCIgc3Ryb2tlPSIjZDRhZjM3IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==');">
                <tr>
                    <td style="padding: 0 20px;">
                        <!-- Ultra-Premium Container with Gold Border -->
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(17, 24, 39, 0.1), 0 10px 20px rgba(17, 24, 39, 0.05); border: 1px solid rgba(212, 175, 55, 0.2);">
                            <!-- Luxurious Header with Navy-Gold Gradient -->
                            <tr>
                                <td>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center" style="background: linear-gradient(135deg, #0a2342 0%, #112a54 40%, #1e3a8a 90%, #0f3460 100%); padding: 48px 25px; position: relative;">
                                                <!-- Decorative Gold Elements -->
                                                <div style="position: absolute; top: 0; right: 0; width: 200px; height: 100%; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.05)); z-index: 1;"></div>
                                                <div style="position: absolute; bottom: 0; left: 0; width: 250px; height: 90px; background: linear-gradient(45deg, rgba(212, 175, 55, 0.07), transparent); border-top-right-radius: 120px; z-index: 1;"></div>
                                                
                                                <!-- Gold Accent Top Border -->
                                                <div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.8), rgba(212, 175, 55, 0.3)); z-index: 2;"></div>
                                                
                                                <!-- Elite Logo with Gold Border Effect -->
                                                <div style="position: relative; z-index: 2; display: inline-block; margin-bottom: 30px; background: rgba(255, 255, 255, 0.03); padding: 5px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2), 0 0 15px rgba(255, 255, 255, 0.1);">
                                                    <div style="border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 20px; padding: 15px;">
                                                        <img src="cid:logo" alt="Techify Logo" style="width: 140px; height: auto; display: block;" />
                                                    </div>
                </div>
                
                                                <h1 style="position: relative; z-index: 2; color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);">
                                                    Khôi Phục Mật Khẩu
                                                </h1>
                                                
                                                <p style="position: relative; z-index: 2; color: rgba(255, 255, 255, 0.85); margin: 15px 0 0; font-size: 18px; font-weight: 300; letter-spacing: 0.3px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
                            Thế giới công nghệ số - Techify
                        </p>
                                                
                                                <!-- Elegant Gold Line Accent -->
                                                <div style="position: relative; z-index: 2; width: 80px; height: 3px; margin: 20px auto 0; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.8), transparent);"></div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Content Area with Premium Spacing -->
                            <tr>
                                <td style="padding: 0; background-color: #ffffff;">
                                    <!-- Luxury Card Container -->
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff;">
                                        <tr>
                                            <td style="padding: 55px 38px 45px;">
                                                <!-- Distinguished Welcome Message -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 50px; text-align: center;">
                                                    <tr>
                                                        <td>
                                                            <h2 style="color: #0a2342; margin: 0 0 18px; font-size: 28px; font-weight: 600; letter-spacing: 0.3px;">
                                                                Xin chào! 👋
                            </h2>
                                                            <p style="color: #374151; margin: 0; font-size: 18px; line-height: 1.6; letter-spacing: 0.2px;">
                                                                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản
                            </p>
                                                            <div style="margin: 22px 0 5px;">
                                                                <span style="display: inline-block; font-weight: 500; color: #112a54; padding: 12px 24px; background: linear-gradient(to right, #f9fafb, #f3f4f6, #f9fafb); border-radius: 50px; border: 1px solid rgba(212, 175, 55, 0.3); box-shadow: 0 3px 10px rgba(0, 0, 0, 0.04);">
                                                                    ${email}
                                                                </span>
                        </div>
                        
                                                            <!-- Elegant Divider -->
                                                            <div style="width: 180px; height: 1px; margin: 35px auto 0; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);"></div>
                                                        </td>
                                                    </tr>
                                                </table>
                                                
                                                <!-- Luxury OTP Section with Raised Effect -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 50px;">
                                                    <tr>
                                                        <td>
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(to bottom, #fcfcff, #f8f9ff); border-radius: 24px; border: 1px solid #e5e7eb; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.1);">
                                                                <tr>
                                                                    <td align="center" style="background: linear-gradient(90deg, #0a2342, #1e3a8a); padding: 22px; border-radius: 24px 24px 0 0; box-shadow: 0 3px 8px rgba(15, 23, 42, 0.1);">
                                                                        <h3 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center;">
                                                                            <span style="margin-right: 10px;">🔐</span> Mã Xác Thực OTP
                                </h3>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding: 40px 35px 35px; text-align: center;">
                                                                        <p style="color: #374151; margin: 0 0 28px; font-size: 18px; font-weight: 500; letter-spacing: 0.2px;">
                                                                            Vui lòng sử dụng mã dưới đây để đặt lại mật khẩu
                                                                        </p>
                                                                        
                                                                        <!-- Exquisite OTP Display with Gold Accents -->
                                                                        <div style="padding: 15px 12px; background: linear-gradient(135deg, rgba(250, 250, 255, 0.9), rgba(255, 255, 255, 0.95)); border-radius: 28px; margin: 0 auto 40px; max-width: 400px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.03), inset 0 0 15px rgba(255, 255, 255, 0.8); border: 1px solid rgba(212, 175, 55, 0.15);">
                                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-spacing: 12px 0; background-color: transparent;">
                                                                                <tr>
                                                                                    ${otp.split('').map(digit => `
                                                                                    <td align="center" width="${100/otp.length}%" style="padding: 0;">
                                                                                        <div style="background: linear-gradient(to bottom, #ffffff, #fcfcff); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 18px; box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(0, 0, 0, 0.03); padding: 12px 5px; transform: translateY(-3px);">
                                                                                            <span style="font-size: 32px; font-weight: 700; color: #0a2342; font-family: Consolas, monospace; display: block; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05); letter-spacing: 1px;">${digit}</span>
                                </div>
                                                                                    </td>
                                                                                    `).join('')}
                                                                                </tr>
                                                                            </table>
                            </div>
                            
                                                                        <!-- Sophisticated Timer Notice -->
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 440px; margin: 0 auto;">
                                                                            <tr>
                                                                                <td>
                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(to right, #fff5f5, #fee2e2); border-radius: 16px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.08);">
                                                                                        <tr>
                                                                                            <td style="padding: 16px 20px; border-left: 5px solid #ef4444; border-radius: 16px 0 0 16px;">
                                                                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                                    <tr>
                                                                                                        <td width="32" valign="middle">
                                                                                                            <span style="font-size: 22px; display: block; text-align: center;">⏱️</span>
                                                                                                        </td>
                                                                                                        <td style="padding-left: 16px;">
                                                                                                            <p style="color: #b91c1c; margin: 0; font-size: 16px; font-weight: 600; line-height: 1.5; letter-spacing: 0.2px;">
                                                                                                                Mã này sẽ hết hạn sau <strong>5 phút</strong>
                                    </p>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                        
                                                <!-- Luxury Steps with Depth Effect -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 50px;">
                                                    <tr>
                                                        <td>
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 24px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04), 0 0 1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
                                                                <tr>
                                                                    <td style="background: linear-gradient(to right, #f8fafc, #f9fafb); padding: 20px 24px; border-radius: 24px 24px 0 0; border-bottom: 1px solid #e5e7eb;">
                                                                        <h3 style="color: #0a2342; margin: 0; font-size: 22px; font-weight: 600; display: flex; align-items: center; letter-spacing: 0.2px;">
                                                                            <span style="margin-right: 12px; font-size: 24px;">📋</span> Các bước thực hiện
                                </h3>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td style="padding: 35px 28px 30px;">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <!-- Step 1 - Luxury Style -->
                                                                            <tr>
                                                                                <td style="padding-bottom: 25px;">
                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                        <tr>
                                                                                            <td width="56" valign="top">
                                                                                                <div style="background: linear-gradient(135deg, #0a2342, #1e3a8a); color: #ffffff; border-radius: 50%; width: 44px; height: 44px; text-align: center; line-height: 44px; font-weight: 600; font-size: 18px; box-shadow: 0 6px 12px rgba(15, 23, 42, 0.2), 0 2px 4px rgba(15, 23, 42, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">1</div>
                                                                                            </td>
                                                                                            <td style="padding-left: 20px;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 17px; line-height: 1.5; font-weight: 500; letter-spacing: 0.1px;">
                                                                                                    Sao chép mã OTP ở trên
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                            
                                                                            <!-- Step 2 - Luxury Style -->
                                                                            <tr>
                                                                                <td style="padding-bottom: 25px;">
                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                        <tr>
                                                                                            <td width="56" valign="top">
                                                                                                <div style="background: linear-gradient(135deg, #0a2342, #1e3a8a); color: #ffffff; border-radius: 50%; width: 44px; height: 44px; text-align: center; line-height: 44px; font-weight: 600; font-size: 18px; box-shadow: 0 6px 12px rgba(15, 23, 42, 0.2), 0 2px 4px rgba(15, 23, 42, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">2</div>
                                                                                            </td>
                                                                                            <td style="padding-left: 20px;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 17px; line-height: 1.5; font-weight: 500; letter-spacing: 0.1px;">
                                                                                                    Quay lại trang đặt lại mật khẩu trên Techify
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                            
                                                                            <!-- Step 3 - Luxury Style -->
                                                                            <tr>
                                                                                <td style="padding-bottom: 25px;">
                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                        <tr>
                                                                                            <td width="56" valign="top">
                                                                                                <div style="background: linear-gradient(135deg, #0a2342, #1e3a8a); color: #ffffff; border-radius: 50%; width: 44px; height: 44px; text-align: center; line-height: 44px; font-weight: 600; font-size: 18px; box-shadow: 0 6px 12px rgba(15, 23, 42, 0.2), 0 2px 4px rgba(15, 23, 42, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">3</div>
                                                                                            </td>
                                                                                            <td style="padding-left: 20px;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 17px; line-height: 1.5; font-weight: 500; letter-spacing: 0.1px;">
                                                                                                    Nhập mã OTP và thiết lập mật khẩu mới
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                            
                                                                            <!-- Step 4 - Luxury Style with Success Color -->
                                                                            <tr>
                                                                                <td>
                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                        <tr>
                                                                                            <td width="56" valign="top">
                                                                                                <div style="background: linear-gradient(135deg, #047857, #10b981); color: #ffffff; border-radius: 50%; width: 44px; height: 44px; text-align: center; line-height: 44px; font-weight: 600; font-size: 18px; box-shadow: 0 6px 12px rgba(5, 150, 105, 0.2), 0 2px 4px rgba(5, 150, 105, 0.1); border: 1px solid rgba(255, 255, 255, 0.1);">✓</div>
                                                                                            </td>
                                                                                            <td style="padding-left: 20px;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 17px; line-height: 1.5; font-weight: 500; letter-spacing: 0.1px;">
                                                                                                    Hoàn tất! Đăng nhập với mật khẩu mới của bạn
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                        
                                                <!-- Luxury Security Notice with Gold Accents -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 50px;">
                                                    <tr>
                                                        <td>
                                                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(to right, #f8f9ff, #f3f4ff); border-radius: 24px; box-shadow: 0 8px 16px rgba(59, 130, 246, 0.06); border: 1px solid rgba(212, 175, 55, 0.15);">
                                                                <tr>
                                                                    <td style="padding: 28px 25px;">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                            <tr>
                                                                                <td width="48" valign="top">
                                                                                    <div style="background: linear-gradient(135deg, #0a2342, #1e3a8a); border-radius: 50%; width: 48px; height: 48px; display: table-cell; text-align: center; vertical-align: middle; box-shadow: 0 6px 12px rgba(15, 23, 42, 0.15); border: 1px solid rgba(212, 175, 55, 0.2);">
                                                                                        <span style="color: #ffffff; font-size: 24px; line-height: 48px;">🔒</span>
                                    </div>
                                                                                </td>
                                                                                <td style="padding-left: 22px;">
                                                                                    <h4 style="color: #0a2342; margin: 0 0 14px; font-size: 20px; font-weight: 600; letter-spacing: 0.3px;">
                                                                                        Thông tin bảo mật quan trọng
                                    </h4>
                                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                                                        <tr>
                                                                                            <td style="padding: 6px 0;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6; letter-spacing: 0.2px;">
                                                                                                    • Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td style="padding: 6px 0;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6; letter-spacing: 0.2px;">
                                                                                                    • Không chia sẻ mã OTP này với bất kỳ ai, kể cả nhân viên Techify.
                                                                                                </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td style="padding: 6px 0;">
                                                                                                <p style="color: #374151; margin: 0; font-size: 16px; line-height: 1.6; letter-spacing: 0.2px;">
                                                                                                    • Mã OTP chỉ sử dụng một lần và sẽ hết hạn sau 5 phút.
                                    </p>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </table>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                    
                                                <!-- Support Section - Luxury Button with Gold Accents -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td align="center" style="padding-top: 15px; border-top: 1px solid rgba(212, 175, 55, 0.15);">
                                                            <p style="color: #64748b; margin: 0 0 22px; font-size: 16px; line-height: 1.5; letter-spacing: 0.2px;">
                                                                Cần hỗ trợ? Liên hệ đội ngũ chăm sóc khách hàng của chúng tôi
                                                            </p>
                                                            <table border="0" cellpadding="0" cellspacing="0">
                                                                <tr>
                                                                    <td>
                                                                        <a href="mailto:${USER_EMAIL}" style="display: inline-block; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; background: linear-gradient(135deg, #0a2342, #1e3a8a); padding: 14px 32px; border-radius: 50px; box-shadow: 0 6px 12px rgba(15, 23, 42, 0.15), 0 2px 4px rgba(15, 23, 42, 0.1); border: 1px solid rgba(212, 175, 55, 0.2);">
                                                                            <span style="margin-right: 8px;">📧</span> ${USER_EMAIL}
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Luxury Footer with Gold Accents and Social Icons -->
                            <tr>
                                <td style="background: linear-gradient(to right, #f9fafb, #f3f4f6); padding: 35px 30px; text-align: center; border-top: 1px solid rgba(212, 175, 55, 0.15); border-radius: 0 0 20px 20px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td style="text-align: center;">
                                                <!-- Gold Logo Symbol -->
                                                <div style="margin: 0 auto 20px; width: 40px; height: 40px; background: #ffffff; border-radius: 50%; line-height: 40px; font-size: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); border: 1px solid rgba(212, 175, 55, 0.3);">
                                                    T
                        </div>
                        
                                                <p style="color: #4b5563; margin: 0 0 12px; font-size: 15px; line-height: 1.5; letter-spacing: 0.2px;">
                                                    © ${new Date().getFullYear()} <strong style="color: #0a2342; letter-spacing: 0.5px;">Techify</strong>. Tất cả quyền được bảo lưu.
                                                </p>
                                                <p style="color: #9ca3af; margin: 0; font-size: 14px; letter-spacing: 0.2px;">
                                                    Email này được gửi tự động, vui lòng không trả lời.
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="text-align: center; padding-top: 25px;">
                                                <div style="margin: 0 auto; display: inline-block; background: #ffffff; padding: 10px 30px; border-radius: 50px; box-shadow: 0 3px 6px rgba(0, 0, 0, 0.03); border: 1px solid rgba(212, 175, 55, 0.15);">
                                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #0a2342; text-decoration: none; font-size: 22px;">📱</a>
                                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #0a2342; text-decoration: none; font-size: 22px;">💻</a>
                                                    <a href="#" style="display: inline-block; margin: 0 10px; color: #0a2342; text-decoration: none; font-size: 22px;">📷</a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        `;
        
        // Fallback template for maximum compatibility
        const simpleHtml = `
        <html>
        <body style="font-family: Arial, sans-serif; color: #333333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1>Khôi Phục Mật Khẩu</h1>
                    <p>Thế giới công nghệ số - Techify</p>
                </div>
                <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dddddd; border-radius: 0 0 8px 8px;">
                    <p>Xin chào!</p>
                    <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản: <strong>${email}</strong></p>
                    <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #3b82f6;">${otp}</strong></p>
                    <p><strong>Lưu ý:</strong> Mã này sẽ hết hạn sau 5 phút.</p>
                    <div style="margin-top: 20px;">
                        <p><strong>Các bước thực hiện:</strong></p>
                        <ol>
                            <li>Sao chép mã OTP ở trên</li>
                            <li>Quay lại trang đặt lại mật khẩu trên Techify</li>
                            <li>Nhập mã OTP và thiết lập mật khẩu mới</li>
                            <li>Hoàn tất! Đăng nhập với mật khẩu mới của bạn</li>
                        </ol>
                        </div>
                    <div style="margin-top: 20px; padding: 10px; background-color: #f0f7ff; border-left: 4px solid #3b82f6;">
                        <p><strong>Thông tin bảo mật quan trọng:</strong></p>
                        <ul>
                            <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</li>
                            <li>Không chia sẻ mã OTP này với bất kỳ ai.</li>
                            <li>Mã OTP chỉ sử dụng một lần và sẽ hết hạn sau 5 phút.</li>
                        </ul>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #666666; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} Techify. Tất cả quyền được bảo lưu.</p>
                    <p>Email này được gửi tự động, vui lòng không trả lời.</p>
                    <p>Liên hệ: ${USER_EMAIL}</p>
                </div>
            </div>
            </body>
            </html>
        `;
        
        // Send email with OAuth2 transporter
        const result = await transport.sendMail({
            from: `"Techify" <${USER_EMAIL}>`,
            to: email,
            subject: '🔐 Mã xác thực khôi phục mật khẩu - Techify',
            text: `Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Techify. Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
            html: htmlTemplate,
            attachments: [
                {
                    filename: 'logo.png',
                    content: Buffer.from(logoBase64.split('base64,')[1], 'base64'),
                    cid: 'logo',
                    contentDisposition: 'inline'
                }
            ]
        });
        
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending email with OAuth2:', error);
        
        // Improved fallback transporter for compatibility with other email services
        try {
            console.log('Attempting to send with fallback transporter...');
            const fallbackTransport = createFallbackTransporter();
            
            // Create simple HTML for maximum compatibility
            const result = await fallbackTransport.sendMail({
                from: `"Techify" <${USER_EMAIL}>`,
                to: email,
                subject: '🔐 Mã xác thực khôi phục mật khẩu - Techify',
                text: `Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản Techify. Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.`,
                html: simpleHtml
            });
            
            console.log('Email sent with fallback transporter:', result.messageId);
            return result;
        } catch (fallbackError) {
            console.error('Fallback email sending failed:', fallbackError);
            throw new Error('Không thể gửi email. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.');
        }
    }
};

module.exports = MailForgotPassword;
