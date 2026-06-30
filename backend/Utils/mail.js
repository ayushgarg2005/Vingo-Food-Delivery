import "dotenv/config";

const RESEND_EMAIL_URL = "https://api.resend.com/emails";

export const getEmailErrorMessage = (error) => {
    if (error?.status === 401 || error?.statusCode === 401) {
        return "Resend authentication failed. Check RESEND_API_KEY in Render.";
    }

    if (error?.status === 403 || error?.statusCode === 403) {
        return "Resend rejected the sender. Check RESEND_FROM_EMAIL and verify your sending domain in Resend.";
    }

    if (error?.status === 422 || error?.statusCode === 422) {
        return error?.message || "Resend could not send the OTP email. Check the sender and recipient email addresses.";
    }

    return error?.message || "Failed to send OTP email";
};

export const sendEmail = async (to, subject, otp) => {
    try {
        const apiKey = process.env.RESEND_API_KEY?.trim();
        const from =
            process.env.RESEND_FROM_EMAIL?.trim() ||
            "Vingo Food Delivery <onboarding@resend.dev>";

        if (!apiKey) {
            throw new Error("RESEND_API_KEY must be configured in your deployment environment.");
        }

        const response = await fetch(RESEND_EMAIL_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from,
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
                            &copy; ${new Date().getFullYear()} Vingo Food Delivery
                        </small>
                    </div>
                `,
            }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(
                result?.message ||
                result?.error?.message ||
                "Resend failed to send the OTP email."
            );
            error.status = response.status;
            throw error;
        }

        console.log(`OTP email sent to ${to} with Resend id ${result.id}`);
        return result;
    } catch (error) {
        console.error("Email sending failed:", getEmailErrorMessage(error));
        throw error;
    }
};
