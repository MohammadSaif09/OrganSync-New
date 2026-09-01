import dotenv from "dotenv";

dotenv.config();

import {
  sendEmail
} from "./services/mailService.js";


console.log(
  "MAIL_USER:",
  process.env.MAIL_USER
);

console.log(
  "MAIL_PASS loaded:",
  process.env.MAIL_PASS
    ? "YES"
    : "NO"
);


const test = async () => {
  try {
    await sendEmail({
      to:
        process.env.MAIL_USER,

      subject:
        "OrganSync Mail Test",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            padding: 30px;
          "
        >

          <h2
            style="
              color: #2563eb;
            "
          >
            OrganSync
          </h2>

          <h3>
            ✅ Email Notification System Working
          </h3>

          <p>
            Your OrganSync backend can now
            send email notifications.
          </p>

        </div>
      `
    });

    console.log(
      "✅ Test completed successfully"
    );

    process.exit(0);

  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.message
    );

    process.exit(1);
  }
};


test();