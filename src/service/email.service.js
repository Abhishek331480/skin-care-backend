// const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       family: 4,

//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },

//       connectionTimeout: 30000,
//       greetingTimeout: 30000,
//       socketTimeout: 30000,
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

// module.exports = sendEmail;


const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `SkinCare Store <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Email send exception:", error);
    return false;
  }
};

module.exports = sendEmail;