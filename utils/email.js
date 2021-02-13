const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) define transporter

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) define email options

  const mailOptions = {
    from: "<arfazcool9212@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) send actual email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
