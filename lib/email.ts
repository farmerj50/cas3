import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Cash 3 Edge" <${from}>`,
    to: toEmail,
    subject: "Reset your Cash 3 Edge password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;background:#020b2d;color:#fff;padding:32px;border-radius:16px;">
        <h2 style="color:#22d3ee;margin-top:0;">Password Reset</h2>
        <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#22d3ee;color:#020b2d;font-weight:700;border-radius:12px;text-decoration:none;">
          Reset Password
        </a>
        <p style="color:#94a3b8;font-size:13px;">If you didn't request this, ignore this email — your password won't change.</p>
        <hr style="border-color:#1e293b;margin:24px 0;" />
        <p style="color:#64748b;font-size:12px;">Cash 3 Edge — independent number tracking tool</p>
      </div>
    `,
  });
}
