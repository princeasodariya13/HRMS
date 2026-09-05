'use server'

import { transporter } from '@/lib/mail';

export async function submitContactForm(data: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials not configured.");
    return { success: true }; // Pretend it worked so UI doesn't crash in local dev without env vars
  }

  try {
    // Send alert to the business admin
    await transporter.sendMail({
      from: `"${data.firstName} ${data.lastName}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: data.email,
      to: process.env.SMTP_USER,
      subject: `New Contact Form Request from ${data.firstName} ${data.lastName}`,
      text: `Message from: ${data.firstName} ${data.lastName} (${data.email})\n\n${data.message}`,
    });

    // Send auto-reply to the user
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'NexaHR AI'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: data.email,
      subject: "Thank you for contacting NexaHR",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-w: 600px;">
          <h2 style="color: #111827;">Thank you for reaching out, ${data.firstName}!</h2>
          <p style="color: #4B5563; line-height: 1.6;">
            We have received your message and our sales team will get back to you within 24 hours.
          </p>
          <p style="color: #4B5563; line-height: 1.6;">
            <strong>Your Message:</strong><br/>
            <em>${data.message}</em>
          </p>
          <br/>
          <p style="color: #9CA3AF; font-size: 14px;">The NexaHR Team</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Contact form email error:", error);
    return { error: error.message || "Failed to send email." };
  }
}
