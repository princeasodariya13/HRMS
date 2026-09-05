import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmployeeWelcomeEmail(
  toEmail: string,
  toName: string,
  tempPassword: string,
  loginUrl: string
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email send.");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'NexaHR AI'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Welcome to NexaHR - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-w: 600px; border: 1px solid #E5E7EB; border-radius: 10px;">
          <h2 style="color: #111827;">Welcome to NexaHR, ${toName}!</h2>
          <p style="color: #4B5563; line-height: 1.6;">
            Your employee account has been successfully created. You can now log in to the NexaHR platform to view your dashboard, request leaves, and manage your profile.
          </p>
          
          <div style="background-color: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #111827;"><strong>Login URL:</strong> <a href="${loginUrl}" style="color: #2563EB;">${loginUrl}</a></p>
            <p style="margin: 0 0 10px 0; color: #111827;"><strong>Email:</strong> ${toEmail}</p>
            <p style="margin: 0; color: #111827;"><strong>Temporary Password:</strong> <code style="background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          
          <p style="color: #4B5563; font-size: 14px;">
            <em>Note: Please log in and change your password as soon as possible for security reasons.</em>
          </p>
        </div>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email via Nodemailer:", error);
    return false;
  }
}

export async function sendEmployeeInviteEmail(
  toEmail: string,
  toName: string,
  inviteLink: string
) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured. Skipping email send.");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'NexaHR AI'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: toEmail,
      subject: "Welcome to NexaHR - Set Up Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-w: 600px; border: 1px solid #E5E7EB; border-radius: 10px;">
          <h2 style="color: #111827;">Welcome to NexaHR, ${toName}!</h2>
          <p style="color: #4B5563; line-height: 1.6;">
            Your employee account has been created by your administrator. To get started, you need to set up a secure password for your account.
          </p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${inviteLink}" style="background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Set My Password
            </a>
          </div>
          
          <p style="color: #4B5563; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${inviteLink}" style="color: #2563EB; word-break: break-all;">${inviteLink}</a>
          </p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            This link is valid for 24 hours. If it expires, please ask your administrator to resend the invitation.
          </p>
        </div>
      `,
    });
    console.log("Invite email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending invite email:", error);
    return false;
  }
}
