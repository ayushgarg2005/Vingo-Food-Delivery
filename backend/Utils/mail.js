import 'dotenv/config';
import nodemailer from 'nodemailer';

export const sendEmail = async (to, subject, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error("Email configuration missing on server: EMAIL_USER or EMAIL_PASS environment variables are not set in your Render dashboard.");
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fff9f6;">
                    <h2 style="color: #ff4d2d; text-align: center;">Vingo Food Delivery</h2>
                    <p style="color: #555; font-size: 16px;">Hello,</p>
                    <p style="color: #555; font-size: 16px;">You requested to reset your password. Here is your One-Time Password (OTP):</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #ff4d2d; background-color: #fff; padding: 15px 25px; border-radius: 8px; border: 1px dashed #ff4d2d;">${otp}</span>
                    </div>
                    <p style="color: #777; font-size: 14px;">This code is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};