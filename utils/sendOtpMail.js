// utils/sendVerificationEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();



const sendVerificationotp = async (userEmail, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASSWORD
            },
        });

   
        const mailOptions = {
            from: '"Project Collaboration Hub" kritisarva@gmail.com',
            to: userEmail,
            subject: 'Verify Your Email',
            html: `<p>Your OTP for password reset is: <b>${otp}</b>. It is valid for 10 minutes.</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendVerificationotp;
