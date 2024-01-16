import nodemailer from "nodemailer";
import { smtpPassword, smtpUserName } from "../secret.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // TODO: replace `user` and `pass` values from <https://forwardemail.net>
    user: smtpUserName,
    pass: smtpPassword,
  },
});

const sendEmailWithNodeMailer = async (emailData) => {
  // const info = await transporter.sendMail({
  //     from: smtpUserName,
  //     to: emailData.email,
  //     subject: emailData.subject,
  //     html: emailData.html,
  //   });

  try {
    const mailOptions = {
      from: smtpUserName,
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message Sent Successfully", info);
  } catch (error) {
    console.log("Sending Mail Failed . Try Again", error?.message);
    throw error;
  }
};

export { sendEmailWithNodeMailer };
