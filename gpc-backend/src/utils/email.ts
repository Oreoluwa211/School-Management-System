import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    })
  : null;

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

  if (!transporter) {
    console.log("\n📧 [DEV] Password reset link (SMTP not configured):");
    console.log(`   ${resetUrl}\n`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your Goodnews Private College password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 15 minutes. If you didn't request this, please ignore this email.</p>
    `,
  });
}

export async function sendApplicationStatusEmail(admission: {
  reference_number: string;
  father_email: string;
  status: string;
  rejection_reason?: string | null;
}) {
  const statusMessages: Record<string, string> = {
    approved: "Congratulations! Your application has been approved. A payment link for admission fees will follow shortly.",
    rejected: `We regret to inform you that your application was not successful${admission.rejection_reason ? `: ${admission.rejection_reason}` : "."}`,
    review: "Your application is now under review by our admissions team.",
    fee_paid: "Payment received — your enrollment is being finalized.",
    enrolled: "Welcome to Goodnews Private College! Your enrollment is complete.",
  };

  const message = statusMessages[admission.status] || `Your application status has been updated to: ${admission.status}`;
  const to = admission.father_email;

  if (!transporter) {
    console.log(`\n📧 [DEV] Status email to ${to} (ref: ${admission.reference_number}):`);
    console.log(`   ${message}\n`);
    return;
  }

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: `GPC Admission Update — ${admission.reference_number}`,
    html: `
      <p>Dear Parent/Guardian,</p>
      <p>${message}</p>
      <p>Reference: <strong>${admission.reference_number}</strong></p>
    `,
  });
}