const { sendConsultationEmail } = require('../services/emailService');

const ATELIER_CONCIERGE_EMAIL = process.env.ATELIER_CONCIERGE_EMAIL || 'piyushverma730929@gmail.com';

const INQUIRIES = [
  {
    id: 1,
    clientName: 'Lady Genevieve Vance',
    clientEmail: 'genevieve.vance@atelier-paris.com',
    category: 'Haute Skincare Rituals',
    service: 'Virtual Video Atelier (45 min)',
    notes: 'Bespoke hydration diagnostic requested for sensitive alpine skin.',
    targetEmail: ATELIER_CONCIERGE_EMAIL,
    status: 'routed_to_email',
    createdAt: new Date().toISOString(),
  }
];

exports.submitInquiry = (req, res) => {
  const { clientName, clientEmail, category, service, notes } = req.body;

  if (!clientName || !clientEmail) {
    return res.status(400).json({
      success: false,
      message: 'Client name and email are required to request a consultation.'
    });
  }

  const newInquiry = {
    id: INQUIRIES.length + 1,
    clientName: clientName.trim(),
    clientEmail: clientEmail.trim(),
    category: category || 'Haute Skincare Rituals',
    service: service || 'Virtual Video Atelier (45 min)',
    notes: notes ? notes.trim() : 'General private beauty consultation',
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || 'Morning Atelier (10 AM - 1 PM)',
    targetEmail: ATELIER_CONCIERGE_EMAIL,
    status: 'routed_to_email',
    createdAt: new Date().toISOString(),
  };

  INQUIRIES.unshift(newInquiry);

  console.log(`[Atelier Consultation] New inquiry received:`, {
    client: newInquiry.clientName,
    email: newInquiry.clientEmail,
    date: newInquiry.date,
    time: newInquiry.time,
    service: newInquiry.service,
    focus: newInquiry.notes
  });

  // Dispatch real email via Google SMTP
  sendConsultationEmail(newInquiry)
    .then(info => {
      console.log(`[Atelier Consultation] Real email dispatched to ${ATELIER_CONCIERGE_EMAIL}:`, info.messageId);
    })
    .catch(err => {
      console.error(`[Atelier Consultation] SMTP delivery warning:`, err.message);
    });

  res.status(201).json({
    success: true,
    message: `Consultation request successfully recorded and dispatched to ${ATELIER_CONCIERGE_EMAIL}`,
    targetEmail: ATELIER_CONCIERGE_EMAIL,
    data: newInquiry
  });
};

exports.getInquiries = (req, res) => {
  res.json({
    success: true,
    count: INQUIRIES.length,
    targetEmail: ATELIER_CONCIERGE_EMAIL,
    data: INQUIRIES
  });
};
