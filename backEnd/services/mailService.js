import nodemailer from "nodemailer";

const createTransporter = () => {
  const mailUser =
    process.env.MAIL_USER;

  const mailPass =
    process.env.MAIL_PASS;

  if (!mailUser) {
    throw new Error(
      "MAIL_USER is missing from environment variables."
    );
  }

  if (!mailPass) {
    throw new Error(
      "MAIL_PASS is missing from environment variables."
    );
  }

  return nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: mailUser,
      pass: mailPass
    }
  });
};


export const sendEmail = async ({
  to,
  subject,
  html
}) => {
  if (!to) {
    throw new Error(
      "Recipient email address is missing."
    );
  }

  try {
    const transporter =
      createTransporter();

    const info =
      await transporter.sendMail({
        from:
          process.env.MAIL_FROM ||
          `OrganSync <${process.env.MAIL_USER}>`,

        to,
        subject,
        html
      });

    console.log(
      `✅ OrganSync email sent to ${to}`
    );

    console.log(
      `📧 Message ID: ${info.messageId}`
    );

    return info;

  } catch (error) {
    console.error(
      `❌ Email failed for ${to}:`,
      error.message
    );

    throw error;
  }
};