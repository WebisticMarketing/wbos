// app/lib/email.ts
import nodemailer from "nodemailer";
import { getRequiredEnv } from "@/lib/env";

const SMTP_HOST = getRequiredEnv("SMTP_HOST");
const SMTP_PORT = parseInt(getRequiredEnv("SMTP_PORT"), 10);
const SMTP_USER = getRequiredEnv("SMTP_USER");
const SMTP_PASS = getRequiredEnv("SMTP_PASS");
const SMTP_FROM = process.env.SMTP_FROM || "noreply@webistic.co";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendInvitationEmail(
  to: string,
  name: string,
  businessName: string,
  token: string
) {
  const invitationLink = `${APP_URL}/wbos/register?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to WBOS</h1>
          <p style="margin: 0; opacity: 0.8;">Webistic Business Operating System</p>
        </div>
        <div class="content">
          <h2>Hello ${name || "there"},</h2>
          <p>You have been invited to join <strong>${businessName}</strong> on WBOS.</p>
          <p>Click the button below to set up your account and get started:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${invitationLink}" class="btn" style="color: white;">Accept Invitation</a>
          </p>
          <p>Or copy this link into your browser:</p>
          <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; font-size: 12px; border: 1px solid #ddd;">
            ${invitationLink}
          </p>
          <p style="margin-top: 20px; color: #888; font-size: 14px;">
            This invitation expires in 7 days. If you didn't request this, please ignore this email.
          </p>
        </div>
        <div class="footer">
          <p>Powered by <strong>Webistic</strong> · Business Operating System</p>
        </div>
      </div>
    </html>
  `;

  const text = `
    Welcome to WBOS

    Hello ${name || "there"},

    You have been invited to join ${businessName} on WBOS.

    Click the link below to set up your account:
    ${invitationLink}

    This invitation expires in 7 days. If you didn't request this, please ignore this email.

    Powered by Webistic · Business Operating System
  `;

  const mailOptions = {
    from: SMTP_FROM,
    to: to,
    subject: `Invitation to ${businessName} on WBOS`,
    text: text,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}