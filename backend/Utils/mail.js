import "dotenv/config";
import dns from "dns";
import nodemailer from "nodemailer";

// Prefer IPv4 over IPv6
dns.setDefaultResultOrder("ipv4first");

export const sendEmail = async (to, subject, otp) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error(
                "EMAIL_USER or EMAIL_PASS is missing in environment variables."
            );
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            requireTLS: true,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });

        // Verify SMTP connection
        await transporter.verify();
        console.log("✅ SMTP connection established");

        await transporter.sendMail({
            from: `"Vingo Food Delivery" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fff9f6;">
                    <h2 style="color: #ff4d2d; text-align: center;">Vingo Food Delivery</h2>

                    <p>Hello,</p>

                    <p>You requested to reset your password.</p>

                    <p>Your OTP is:</p>

                    <div style="text-align:center;margin:30px 0;">
                        <span style="
                            font-size:30px;
                            font-weight:bold;
                            letter-spacing:6px;
                            color:#ff4d2d;
                            padding:15px 25px;
                            border:2px dashed #ff4d2d;
                            border-radius:8px;
                            display:inline-block;
                        ">
                            ${otp}
                        </span>
                    </div>

                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>

                    <p>If you didn't request this password reset, you can safely ignore this email.</p>

                    <hr>

                    <small style="color:#888;">
                        © ${new Date().getFullYear()} Vingo Food Delivery
                    </small>
                </div>
            `,
        });

        console.log(`✅ OTP email sent to ${to}`);
    } catch (error) {
        console.error("❌ Email sending failed");
        console.error(error);
        throw error;
    }
};
