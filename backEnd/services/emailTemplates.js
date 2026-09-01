const wrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="
  margin:0;
  padding:0;
  background:#f1f5f9;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:600px;
    margin:30px auto;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    box-shadow:0 5px 20px rgba(0,0,0,0.08);
  ">

    <div style="
      background:#2563eb;
      color:white;
      padding:22px 28px;
    ">
      <h2 style="margin:0;">
        OrganSync
      </h2>

      <p style="
        margin:5px 0 0;
        opacity:0.9;
        font-size:13px;
      ">
        Organ Donation & Transplant Coordination
      </p>
    </div>

    <div style="
      padding:28px;
      color:#334155;
      line-height:1.6;
    ">
      ${content}
    </div>

    <div style="
      padding:16px 28px;
      background:#f8fafc;
      color:#94a3b8;
      font-size:12px;
      text-align:center;
    ">
      OrganSync Automated Notification
    </div>

  </div>

</body>
</html>
`;

/* ========================================
   NEW REQUEST → DONOR
======================================== */

export const donorRequestEmail = ({
  donorName,
  recipientName,
  organ,
  bloodGroup,
  hospital
}) =>
  wrapper(`
    <h2 style="color:#0f172a;">
      New Organ Request
    </h2>

    <p>
      Hello <strong>${donorName}</strong>,
    </p>

    <p>
      A compatible recipient has requested
      an organ that matches one of your
      active pledges.
    </p>

    <div style="
      background:#eff6ff;
      padding:16px;
      border-radius:10px;
      margin:20px 0;
    ">
      <p>
        <strong>Recipient:</strong>
        ${recipientName}
      </p>

      <p>
        <strong>Organ:</strong>
        ${organ}
      </p>

      <p>
        <strong>Blood Group:</strong>
        ${bloodGroup}
      </p>

      <p>
        <strong>Hospital:</strong>
        ${hospital || "Assigned Hospital"}
      </p>
    </div>

    <p>
      Please sign in to your OrganSync
      Donor Portal to review the request.
    </p>
  `);

/* ========================================
   DONOR DECISION → RECIPIENT
======================================== */

export const requestStatusEmail = ({
  recipientName,
  donorName,
  organ,
  status,
  hospital
}) => {
  const accepted =
    status === "Accepted";

  return wrapper(`
    <h2 style="
      color:${accepted ? "#15803d" : "#dc2626"};
    ">
      Organ Request ${status}
    </h2>

    <p>
      Hello
      <strong>${recipientName}</strong>,
    </p>

    <p>
      Your request for a
      <strong>${organ}</strong>
      has been
      <strong>${status.toLowerCase()}</strong>
      by the matched donor.
    </p>

    ${
      accepted
        ? `
          <div style="
            background:#dcfce7;
            padding:16px;
            border-radius:10px;
            margin:20px 0;
          ">

            <p>
              <strong>Donor:</strong>
              ${donorName}
            </p>

            <p>
              <strong>Hospital:</strong>
              ${
                hospital ||
                "Assigned Hospital"
              }
            </p>

            <p>
              Your case will now move
              to hospital review and
              transplant scheduling.
            </p>

          </div>
        `
        : `
          <div style="
            background:#fef2f2;
            padding:16px;
            border-radius:10px;
            margin:20px 0;
          ">
            OrganSync will allow you to
            continue searching for another
            compatible donor.
          </div>
        `
    }

    <p>
      You can view the latest status in
      your OrganSync Recipient Portal.
    </p>
  `);
};

/* ========================================
   APPOINTMENT → RECIPIENT
======================================== */

export const recipientAppointmentEmail = ({
  recipientName,
  donorName,
  organ,
  date,
  time,
  surgeon,
  hospital
}) =>
  wrapper(`
    <h2 style="color:#2563eb;">
      Transplant Appointment Scheduled
    </h2>

    <p>
      Hello
      <strong>${recipientName}</strong>,
    </p>

    <p>
      Your transplant procedure has been
      scheduled by the hospital.
    </p>

    <div style="
      background:#eff6ff;
      padding:18px;
      border-radius:10px;
      margin:20px 0;
    ">

      <p>
        <strong>Organ:</strong>
        ${organ}
      </p>

      <p>
        <strong>Donor:</strong>
        ${donorName}
      </p>

      <p>
        <strong>Date:</strong>
        ${date}
      </p>

      <p>
        <strong>Time:</strong>
        ${time}
      </p>

      <p>
        <strong>Surgeon:</strong>
        ${surgeon}
      </p>

      <p>
        <strong>Hospital:</strong>
        ${hospital}
      </p>

    </div>

    <p>
      Please follow all pre-operative
      instructions provided by your
      hospital.
    </p>
  `);

/* ========================================
   APPOINTMENT → DONOR
======================================== */

export const donorAppointmentEmail = ({
  donorName,
  recipientName,
  organ,
  date,
  time,
  surgeon,
  hospital
}) =>
  wrapper(`
    <h2 style="color:#2563eb;">
      Transplant Procedure Scheduled
    </h2>

    <p>
      Hello
      <strong>${donorName}</strong>,
    </p>

    <p>
      The transplant associated with your
      accepted organ donation has been
      scheduled.
    </p>

    <div style="
      background:#f8fafc;
      padding:18px;
      border-radius:10px;
      margin:20px 0;
    ">

      <p>
        <strong>Recipient:</strong>
        ${recipientName}
      </p>

      <p>
        <strong>Organ:</strong>
        ${organ}
      </p>

      <p>
        <strong>Date:</strong>
        ${date}
      </p>

      <p>
        <strong>Time:</strong>
        ${time}
      </p>

      <p>
        <strong>Surgeon:</strong>
        ${surgeon}
      </p>

      <p>
        <strong>Hospital:</strong>
        ${hospital}
      </p>

    </div>

    <p>
      Please contact the transplant center
      if you need additional instructions.
    </p>
  `);