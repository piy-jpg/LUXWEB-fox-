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
      from: `"Piyush Verma (Lumière)" <${senderEmail}>`,
      to: cleanEmail,
      replyTo: senderEmail,
      subject: `${otp} is your Lumière verification code`,
      text: `Hello,\n\nYour Lumière Atelier verification code is: ${otp}\n\nThis code is valid for 5 minutes. Enter this code on the screen to access your private account.\n\nIf you did not request this verification code, you can safely ignore this email.\n\nWarm regards,\nPiyush Verma\nLumière Atelier Privé · Jaipur`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${otp} is your Lumière verification code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #222222; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 520px; margin: 0 auto; padding: 28px 20px;">
            <div style="font-size: 11px; letter-spacing: 3px; color: #b8860b; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">✦ LUMIÈRE ATELIER PRIVÉ ✦</div>
            <h2 style="font-size: 20px; font-weight: 600; color: #111111; margin: 0 0 16px;">Your verification code</h2>
            <p style="font-size: 14px; color: #444444; line-height: 1.6; margin: 0 0 20px;">
              Enter the 6-digit code below to verify your email (<strong>${cleanEmail}</strong>) and access your atelier privileges:
            </p>
            <div style="background-color: #fbf9f5; border: 1px solid #e8dfc8; border-radius: 8px; padding: 18px 24px; text-align: center; margin: 0 0 20px;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #111111;">${otp}</span>
            </div>
            <p style="font-size: 13px; color: #666666; line-height: 1.5; margin: 0 0 16px;">
              This code will expire in <strong>5 minutes</strong>. If you did not make this request, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0 16px;">
            <p style="font-size: 11px; color: #888888; line-height: 1.5; margin: 0;">
              Lumière Haute Parfumerie &amp; Skincare Atelier · Vardhman Swarn Lok, Jaipur<br>
              Security note: Never share your verification code with anyone.
            </p>
          </div>
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

/**
 * Send Instant New Order Notification Email to Atelier Owner (piyushverma730929@gmail.com)
 */
async function sendOrderNotificationToOwner(order) {
  const primaryOwnerEmail = process.env.ATELIER_OWNER_EMAIL || 'piyushverma9903@gmail.com';
  // Delivers to piyushverma9903@gmail.com and piyushverma730929@gmail.com
  const ownerEmail = primaryOwnerEmail === 'piyushverma9903@gmail.com' ? 'piyushverma9903@gmail.com, piyushverma730929@gmail.com' : primaryOwnerEmail;
  const orderNumber = order.orderNumber || 'LUM-PENDING';
  const customerName = order.customerName || 'Valued Client';
  const customerEmail = order.customerEmail || 'client@lumiere.com';
  const customerPhone = (order.shippingAddress && order.shippingAddress.phone) ? order.shippingAddress.phone : (order.phone || 'N/A');
  const subtotal = parseFloat(order.subtotal || 0).toFixed(2);
  const totalAmount = parseFloat(order.totalAmount || 0).toFixed(2);
  const inrAmount = Math.round(parseFloat(totalAmount) * 84).toLocaleString('en-IN');
  const paymentMethod = order.paymentMethod || 'Cash on Delivery (COD)';
  const paymentStatus = order.paymentStatus || 'Confirmed';

  const addr = order.shippingAddress || {};
  const formattedAddress = [
    addr.address,
    addr.city,
    addr.state,
    addr.postalCode
  ].filter(Boolean).join(', ') || 'Complimentary Concierge White-Glove Dispatch';

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRowsHtml = items.map(item => {
    const name = item.name || item.product_name || `Product #${item.productId || ''}`;
    const qty = item.quantity || item.qty || 1;
    const price = parseFloat(item.unitPrice || item.price || 0).toFixed(2);
    const lineTotal = (parseFloat(price) * qty).toFixed(2);
    return `
      <tr style="border-bottom: 1px solid rgba(229, 204, 163, 0.15);">
        <td style="padding: 10px 8px; font-size: 13px; color: #FFFFFF;">${name}</td>
        <td style="padding: 10px 8px; font-size: 13px; color: #E5CCA3; text-align: center;">&times; ${qty}</td>
        <td style="padding: 10px 8px; font-size: 13px; color: #DFB15B; text-align: right;">₹${lineTotal}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08060A; color: #FFFFFF; margin: 0; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background: #120914; border: 1px solid #DFB15B; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.8); }
      .header { background: linear-gradient(135deg, #1E1220 0%, #0C070D 100%); padding: 28px 24px; text-align: center; border-bottom: 1px solid rgba(223, 177, 91, 0.3); }
      .eyebrow { font-size: 11px; letter-spacing: 3px; color: #DFB15B; text-transform: uppercase; font-weight: 700; }
      .title { font-size: 24px; font-weight: 400; letter-spacing: 1px; color: #FFFFFF; margin: 8px 0 4px; font-family: Georgia, serif; }
      .subtitle { font-size: 13px; color: #E5CCA3; font-style: italic; margin: 0; }
      .content { padding: 24px; }
      .dossier-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .dossier-table tr { border-bottom: 1px solid rgba(229, 204, 163, 0.12); }
      .dossier-table td { padding: 9px 6px; font-size: 13px; }
      .label { color: #E5CCA3; font-weight: 700; width: 34%; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
      .value { color: #FFFFFF; }
      .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      .items-table th { text-align: left; padding: 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #E5CCA3; border-bottom: 1px solid rgba(223, 177, 91, 0.3); }
      .total-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(223, 177, 91, 0.2); border-radius: 8px; padding: 14px 18px; margin: 18px 0; text-align: right; }
      .total-amount { font-family: Georgia, serif; font-size: 22px; color: #DFB15B; font-weight: 700; }
      .action-buttons { text-align: center; margin: 24px 0 8px; }
      .btn-whatsapp { display: inline-block; background: #25D366; color: #FFFFFF; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 6px 8px; }
      .btn-email { display: inline-block; background: linear-gradient(135deg, #FFF4DC 0%, #DFB15B 100%); color: #0E050C; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin: 0 6px 8px; }
      .footer { background: #08060A; padding: 16px 20px; text-align: center; border-top: 1px solid rgba(229, 204, 163, 0.12); font-size: 11px; color: rgba(255, 255, 255, 0.5); }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="eyebrow">✦ LUMIÈRE BEAUTY ATELIER PRIVÉ ✦</div>
        <h1 class="title">New Client Order Confirmed</h1>
        <p class="subtitle">Order #${orderNumber} has been successfully recorded in the atelier ledger.</p>
      </div>
      <div class="content">
        <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(223, 177, 91, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 11px; color: #E5CCA3; text-transform: uppercase;">Order Number:</span>
              <strong style="font-family: Georgia, serif; font-size: 18px; color: #DFB15B; display: block;">#${orderNumber}</strong>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 11px; color: #E5CCA3; text-transform: uppercase;">Settlement Status:</span>
              <span style="display: inline-block; background: ${paymentStatus === 'Paid' ? '#10B981' : '#F59E0B'}; color: #FFFFFF; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 12px;">${paymentStatus}</span>
            </div>
          </div>
        </div>

        <h3 style="font-size: 13px; letter-spacing: 1px; color: #DFB15B; text-transform: uppercase; margin: 18px 0 8px;">Client Information &amp; Delivery Destination</h3>
        <table class="dossier-table">
          <tr>
            <td class="label">Client Name</td>
            <td class="value"><strong>${customerName}</strong></td>
          </tr>
          <tr>
            <td class="label">Contact Phone</td>
            <td class="value"><a href="tel:${customerPhone}" style="color: #DFB15B; text-decoration: underline;">${customerPhone}</a></td>
          </tr>
          <tr>
            <td class="label">Email Address</td>
            <td class="value"><a href="mailto:${customerEmail}" style="color: #DFB15B; text-decoration: underline;">${customerEmail}</a></td>
          </tr>
          <tr>
            <td class="label">Delivery Address</td>
            <td class="value">${formattedAddress}</td>
          </tr>
          <tr>
            <td class="label">Payment Method</td>
            <td class="value"><strong>${paymentMethod}</strong></td>
          </tr>
          ${addr.notes ? `<tr><td class="label">Concierge Notes</td><td class="value" style="color: #FFF4DC;">${addr.notes}</td></tr>` : ''}
        </table>

        <h3 style="font-size: 13px; letter-spacing: 1px; color: #DFB15B; text-transform: uppercase; margin: 24px 0 8px;">Curated Atelier Formulations</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <div class="total-card">
          <div style="font-size: 12px; color: #E5CCA3; margin-bottom: 4px;">Total Order Settlement:</div>
          <div class="total-amount">₹${totalAmount}</div>
        </div>

        <div class="action-buttons">
          ${customerPhone && customerPhone !== 'N/A' ? `
            <a href="https://api.whatsapp.com/send?phone=${customerPhone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(`Hello ${customerName}, this is Piyush Verma from Lumière Beauty Atelier regarding your Order #${orderNumber}. We have received your order and are preparing your luxury package for dispatch.`)}" class="btn-whatsapp" target="_blank">
              WhatsApp Client ↗
            </a>
          ` : ''}
          <a href="mailto:${customerEmail}?subject=${encodeURIComponent(`✦ Order Confirmation #${orderNumber} — Lumière Beauty Atelier`)}" class="btn-email">
            Email Client ↗
          </a>
        </div>
      </div>
      <div class="footer">
        Lumière Haute Parfumerie &amp; Skincare Atelier · Vardhman Swarn Lok, Jaipur<br/>
        Owner Direct Contact: +91 7300212948 · piyushverma730929@gmail.com
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: `"Lumière Atelier Orders" <${process.env.GMAIL_USER || 'piyushverma730929@gmail.com'}>`,
    to: ownerEmail,
    replyTo: customerEmail,
    subject: `✦ NEW ORDER RECEIVED: #${orderNumber} (₹${totalAmount}) — ${customerName}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[sendOrderNotificationToOwner] Delivered order notification #${orderNumber} to owner ${ownerEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[sendOrderNotificationToOwner] Notice for ${ownerEmail}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Format and generate WhatsApp notification URL for Atelier Owner (+91 7300212948)
 */
function generateOwnerWhatsAppNotification(order) {
  const ownerPhone = '917300212948'; // 7300212948 with India country code
  const orderNumber = order.orderNumber || 'LUM-PENDING';
  const customerName = order.customerName || 'Valued Client';
  const customerPhone = (order.shippingAddress && order.shippingAddress.phone) ? order.shippingAddress.phone : (order.phone || 'N/A');
  const customerEmail = order.customerEmail || 'client@lumiere.com';
  const totalAmount = parseFloat(order.totalAmount || 0).toFixed(2);
  const paymentMethod = order.paymentMethod || 'COD';
  const paymentStatus = order.paymentStatus || 'Confirmed';

  const addr = order.shippingAddress || {};
  const formattedAddress = [
    addr.address,
    addr.city,
    addr.state,
    addr.postalCode
  ].filter(Boolean).join(', ') || 'Standard White-Glove Dispatch';

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsText = items.map((it, idx) => {
    const name = it.name || it.product_name || `Product #${it.productId || ''}`;
    const qty = it.quantity || it.qty || 1;
    const price = parseFloat(it.unitPrice || it.price || 0).toFixed(2);
    return `  ${idx + 1}. ${name} (x${qty}) — ₹${price}`;
  }).join('\n');

  const text = [
    `🛍️ *NEW ORDER RECEIVED — LUMIÈRE BEAUTY ATELIER*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `📋 *Order ID:* #${orderNumber}`,
    `👤 *Client:* ${customerName}`,
    `📞 *Phone:* ${customerPhone}`,
    `✉️ *Email:* ${customerEmail}`,
    `📍 *Delivery Address:* ${formattedAddress}`,
    addr.notes ? `📝 *Notes:* ${addr.notes}` : null,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💎 *Items Ordered:*`,
    itemsText || '  (Atelier Formulations)',
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *Total Settlement:* ₹${totalAmount}`,
    `💳 *Payment:* ${paymentMethod}`,
    `🏷️ *Status:* ${paymentStatus}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `✨ *Action:* Prepare atelier inventory for white-glove courier dispatch.`
  ].filter(Boolean).join('\n');

  const url = `https://api.whatsapp.com/send?phone=${ownerPhone}&text=${encodeURIComponent(text)}`;
  return { ownerPhone, text, url };
}

module.exports = {
  transporter,
  sendConsultationEmail,
  sendEmailOtp,
  sendOrderNotificationToOwner,
  generateOwnerWhatsAppNotification
};
