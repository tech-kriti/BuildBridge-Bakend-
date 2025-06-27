// utils/sendVerificationEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();



const sendVerificationEmail = async (userEmail, userId, jwtToken) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASSWORD
            },
        });

        const verificationUrl = `https://buildbridge-bakend.onrender.com/user/verify-email/${userId}/${jwtToken}`;

        const mailOptions = {
            from: '"Project Collaboration Hub" kritisarva@gmail.com',
            to: userEmail,
            subject: 'Verify Your Email',
            html: `
        <h2>Welcome to Project Collaboration Hub</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verificationUrl}" style="
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          font-weight: bold;
          border-radius: 5px;
        ">Verify Email</a>
        <p>If the button doesn't work, you can also click this link:</p>
        <p>${verificationUrl}</p>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendVerificationEmail;
