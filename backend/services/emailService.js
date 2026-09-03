const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Direct SSL for instant delivery on cloud serverless
  auth: {
    user: process.env.GMAIL_USER || 'piyushverma730929@gmail.com',
    pass: process.env.GMAIL_APP_PASS || 'rkpccfpucbdqmwqs'
  },
  connectionTimeout: 7000,
  greetingTimeout: 7000,
  socketTimeout: 10000
});

/**
 * Send Consultation Notification Email to Atelier Owner (piyushverma730929@gmail.com)
 */
async function sendConsultationEmail(inquiry) {
  const recipient = process.env.ATELIER_CONCIERGE_EMAIL || 'piyushverma730929@gmail.com';

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #08060A; color: #FFFFFF; margin: 0; padding: 20px; }
      .container { max-width: 580px; margin: 0 auto; background: #120914; border: 1px solid #DFB15B; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.8); }
      .header { background: linear-gradient(135deg, #1E1220 0%, #0C070D 100%); padding: 26px 20px; text-align: center; border-bottom: 1px solid rgba(223, 177, 91, 0.3); }
      .eyebrow { font-size: 11px; letter-spacing: 3px; color: #DFB15B; text-transform: uppercase; font-weight: 700; }
      .title { font-size: 22px; font-weight: 300; letter-spacing: 1px; color: #FFFFFF; margin: 8px 0 4px; font-family: Georgia, serif; }
      .subtitle { font-size: 13px; color: #E5CCA3; font-style: italic; margin: 0; }
      .content { padding: 24px 20px; }
      .dossier-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .dossier-table tr { border-bottom: 1px solid rgba(229, 204, 163, 0.15); }
      .dossier-table td { padding: 11px 6px; font-size: 13px; }
      .label { color: #E5CCA3; font-weight: 700; width: 36%; letter-spacing: 0.5px; text-transform: uppercase; font-size: 11px; }
      .value { color: #FFFFFF; font-weight: 400; }
      .value strong { color: #DFB15B; }
      .action-wrap { text-align: center; margin: 20px 0 8px; }
      .btn { display: inline-block; background: linear-gradient(135deg, #FFF4DC 0%, #DFB15B 100%); color: #0E050C; padding: 11px 26px; border-radius: 999px; text-decoration: none; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
      .footer { background: #08060A; padding: 14px 20px; text-align: center; border-top: 1px solid rgba(229, 204, 163, 0.12); font-size: 11px; color: rgba(255, 255, 255, 0.5); }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="eyebrow">✦ LUMIÈRE ATELIER PRIVÉ · CONCIERGE ✦</div>
        <h1 class="title">New Consultation Request</h1>
        <p class="subtitle">A client has reserved a bespoke beauty session.</p>
      </div>
      <div class="content">
        <table class="dossier-table">
          <tr>
            <td class="label">Client Full Name</td>
            <td class="value"><strong>${inquiry.clientName}</strong></td>
          </tr>
          <tr>
            <td class="label">Client Email</td>
            <td class="value"><a href="mailto:${inquiry.clientEmail}" style="color: #DFB15B; text-decoration: underline;">${inquiry.clientEmail}</a></td>
          </tr>
          <tr>
            <td class="label">Preferred Date</td>
            <td class="value"><strong>${inquiry.date}</strong></td>
          </tr>
          <tr>
            <td class="label">Time Window</td>
            <td class="value">${inquiry.time}</td>
          </tr>
          <tr>
            <td class="label">Consultation Format</td>
            <td class="value">${inquiry.service}</td>
          </tr>
          <tr>
            <td class="label">Desired Ritual Focus</td>
            <td class="value" style="color: #FFF4DC;">${inquiry.notes}</td>
          </tr>
          <tr>
            <td class="label">Received At</td>
            <td class="value" style="font-size: 12px; color: rgba(255,255,255,0.7);">${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <div class="action-wrap">
          <a href="mailto:${inquiry.clientEmail}?subject=${encodeURIComponent('✦ Confirmation: Your Lumière Private Consultation Request')}&body=${encodeURIComponent(`Dear ${inquiry.clientName},\n\nThank you for reaching out to Lumière Atelier Privé.\n\nWe are delighted to confirm your consultation for ${inquiry.service} on ${inquiry.date} (${inquiry.time}).\n\nKind regards,\nPiyush Verma\nLumière Atelier Privé`)}" class="btn">REPLY TO CLIENT DIRECTLY ↗</a>
        </div>
      </div>
      <div class="footer">
        Lumière Haute Parfumerie &amp; Skincare Atelier · Vardhman Swarn Lok, Jaipur
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"Lumière Atelier Privé" <${process.env.GMAIL_USER || 'piyushverma730929@gmail.com'}>`,
    to: recipient,
    replyTo: inquiry.clientEmail,
    subject: `✦ New Private Consultation: ${inquiry.clientName} · ${inquiry.date}`,
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Send 6-digit Verification OTP Email to Client
 */
async function sendEmailOtp(email, otp) {
  try {
    const senderEmail = process.env.GMAIL_USER || 'piyushverma730929@gmail.com';
    const cleanEmail = (email || '').trim().toLowerCase();

    const mailOptions = {
      from: `"Lumiere Atelier" <${senderEmail}>`,
      to: cleanEmail,
      replyTo: senderEmail,
      subject: `${otp} is your Lumiere verification code`,
      text: `Your Lumière Atelier verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nEnter this code on the Lumière Atelier sign-in page to access your private account.\n\nIf you did not request this verification code, you can safely ignore this email.\n\nLumière Atelier Privé · Jaipur`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verification Code: ${otp}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f7f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f6f7f9; padding: 32px 16px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 460px; background-color: #ffffff; border: 1px solid #e2e5e9; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                  <tr>
                    <td style="background-color: #0f0a0d; padding: 24px 20px; text-align: center; border-bottom: 2px solid #d4af37;">
                      <div style="font-size: 11px; letter-spacing: 3px; color: #d4af37; text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">✦ LUMIÈRE ATELIER PRIVÉ ✦</div>
                      <div style="font-family: Georgia, serif; font-size: 20px; color: #ffffff; font-weight: 300;">Client Verification Code</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 28px 24px; text-align: center;">
                      <p style="font-size: 14px; color: #333333; line-height: 1.6; margin: 0 0 20px;">
                        Enter the following 6-digit code to complete your verification and access your personal atelier account:
                      </p>
                      <div style="background-color: #fcf9f2; border: 1px dashed #d4af37; border-radius: 8px; padding: 16px; margin: 0 0 20px;">
                        <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0f0a0d;">${otp}</span>
                      </div>
                      <p style="font-size: 12px; color: #666666; line-height: 1.5; margin: 0 0 8px;">
                        This code is valid for <strong>5 minutes</strong>.
                      </p>
                      <p style="font-size: 11px; color: #888888; line-height: 1.5; margin: 0;">
                        If you did not request this verification code, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #fafafa; padding: 16px 20px; text-align: center; border-top: 1px solid #eeeeee; font-size: 11px; color: #999999; line-height: 1.4;">
                      Lumière Haute Parfumerie &amp; Skincare Atelier · Jaipur<br>
                      Security Notice: Lumière will never ask for this code.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[sendEmailOtp] Real email delivered to ${cleanEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[sendEmailOtp] Error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  transporter,
  sendConsultationEmail,
  sendEmailOtp
};
