import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

let transporter: nodemailer.Transporter | null = null;

async function createTransporterIfNeeded() {
  if (transporter) return transporter;
  if (smtpHost && smtpPort) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    });
    return transporter;
  }

  // No SMTP configured: create Ethereal test account for dev/testing
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  const tr = await createTransporterIfNeeded();
  const from = process.env.SMTP_FROM || smtpUser || 'GeoLedger <no-reply@example.com>';
  const info = await tr.sendMail({ from, to, subject, text, html });
  // nodemailer.getTestMessageUrl returns a preview URL when using Ethereal
  const previewUrl = (nodemailer as any).getTestMessageUrl ? (nodemailer as any).getTestMessageUrl(info) : undefined;
  return { info, previewUrl };
}
