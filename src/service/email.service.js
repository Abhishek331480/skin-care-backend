const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       requireTLS: true,
//       family: 4,

//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },

//       connectionTimeout: 10000,
//       greetingTimeout: 10000,
//       socketTimeout: 10000,
//     });

//     const info = await transporter.sendMail({
//       from: `"SkinCare Store" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("Email sent successfully to:", to);
//     console.log("Message ID:", info.messageId);

//     return true;
//   } catch (error) {
//     console.error("Email send error:", error.message);
//     return false;
//   }
// };
await sendEmail({
  to: "abhishekthakur412002@gmail.com",
  subject: "Mailtrap Test",
  html: "<h1>Hello Abhishek</h1>",
});

module.exports = sendEmail;