const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Generate random OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate reset token
const generateResetToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Send OTP for signup
const sendSignupOTP = async (toEmail, otp, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; }
                .content { background: white; padding: 30px; border-radius: 10px; text-align: center; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; padding: 15px; background: #f0f0ff; display: inline-block; border-radius: 8px; margin: 20px 0; }
                .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h2>Welcome to E-Commerce Store! 🎉</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Thank you for signing up! Please use the following OTP to verify your email:</p>
                    <div class="otp-code">${otp}</div>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <div class="footer">
                        <p>Best regards,<br>E-Commerce Store Team</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return await transporter.sendMail({
        from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verify Your Email - OTP for Signup',
        html: html
    });
};

// Send OTP for login
const sendLoginOTP = async (toEmail, otp, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; }
                .content { background: white; padding: 30px; border-radius: 10px; text-align: center; }
                .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; padding: 15px; background: #f0f0ff; display: inline-block; border-radius: 8px; margin: 20px 0; }
                .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin-top: 20px; font-size: 14px; text-align: left; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h2>Login Verification Required! 🔐</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Your OTP for login is:</p>
                    <div class="otp-code">${otp}</div>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <div class="warning">
                        <strong>⚠️ Security Alert:</strong> If you didn't request this, please ignore this email.
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>E-Commerce Store Team</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return await transporter.sendMail({
        from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Login Verification - OTP Required',
        html: html
    });
};

// Send password reset OTP
const sendPasswordResetOTP = async (toEmail, otp, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); border-radius: 10px; }
                .content { background: white; padding: 30px; border-radius: 10px; text-align: center; }
                .otp-code { font-size: 32px; font-weight: bold; color: #f59e0b; letter-spacing: 5px; padding: 15px; background: #fef3c7; display: inline-block; border-radius: 8px; margin: 20px 0; }
                .warning { background: #fee2e2; border-left: 4px solid #ef4444; padding: 10px; margin-top: 20px; font-size: 14px; text-align: left; }
                .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <h2>Password Reset Request 🔒</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>We received a request to reset your password. Use the following OTP to proceed:</p>
                    <div class="otp-code">${otp}</div>
                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                    <div class="warning">
                        <strong>⚠️ Important:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
                    </div>
                    <div class="footer">
                        <p>Best regards,<br>E-Commerce Store Team</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return await transporter.sendMail({
        from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Password Reset OTP - E-Commerce Store',
        html: html
    });
};

// Send password reset success email
const sendPasswordResetSuccess = async (toEmail, name) => {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 10px; }
                .content { background: white; padding: 30px; border-radius: 10px; text-align: center; }
                .success-icon { font-size: 64px; margin-bottom: 20px; }
                .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="content">
                    <div class="success-icon">✅</div>
                    <h2>Password Changed Successfully!</h2>
                    <p>Hello <strong>${name}</strong>,</p>
                    <p>Your password has been successfully changed.</p>
                    <p>If you did not make this change, please contact our support team immediately.</p>
                    <div class="footer">
                        <p>Best regards,<br>E-Commerce Store Team</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    return await transporter.sendMail({
        from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Password Changed Successfully',
        html: html
    });
};

module.exports = {
    generateOTP,
    generateResetToken,
    sendSignupOTP,
    sendLoginOTP,
    sendPasswordResetOTP,
    sendPasswordResetSuccess
};