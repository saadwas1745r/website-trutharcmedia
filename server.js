const express = require('express');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const resend = new Resend('re_brbnp8fQ_DHEoojgT77zaY4nRr7BSN4Qm');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/send-email', async (req, res) => {
  const { name, email, phone, brand, service, message } = req.body;

  const sentAt = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const field = (label, value) => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
      <tr>
        <td style="background:rgba(0,212,200,0.05);border:1px solid rgba(0,212,200,0.15);border-radius:10px;padding:18px 22px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#00D4C8;text-transform:uppercase;">${label}</p>
          <p style="margin:0;font-size:17px;font-weight:600;color:#ffffff;">${value || '<em style="color:#6B7280;font-weight:400;">Not provided</em>'}</p>
        </td>
      </tr>
    </table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Inquiry — Truth Arc Media</title>
</head>
<body style="margin:0;padding:0;background:#07090A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090A;padding:48px 20px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;">
  <tr><td style="background:linear-gradient(90deg,#00D4C8,#00A89E);height:4px;border-radius:4px 4px 0 0;"></td></tr>
  <tr>
    <td style="background:linear-gradient(160deg,#0c1d1c 0%,#071412 100%);padding:44px 48px 38px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:3.5px;color:#00D4C8;text-transform:uppercase;">Truth Arc Media</p>
      <h1 style="margin:0 0 4px;font-size:30px;font-weight:800;color:#ffffff;line-height:1.2;">New Inquiry</h1>
      <h1 style="margin:0;font-size:30px;font-weight:800;color:#00D4C8;line-height:1.2;">Received ✦</h1>
    </td>
  </tr>
  <tr>
    <td style="background:#0c1a19;padding:30px 48px 10px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <p style="margin:0;font-size:15px;color:#9CA3AF;line-height:1.8;">
        A potential client submitted the contact form. Hit <strong style="color:#ffffff;">Reply to ${name}</strong> to respond directly.
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#0c1a19;padding:20px 48px 30px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      ${field('Full Name', name)}
      ${field('Email Address', email)}
      ${field('Phone Number', phone)}
      ${field('Brand / Business', brand)}
      ${field('Looking For', service)}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:rgba(0,212,200,0.05);border:1px solid rgba(0,212,200,0.15);border-radius:10px;padding:18px 22px;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#00D4C8;text-transform:uppercase;">Message</p>
            <p style="margin:0;font-size:15px;color:#D1D5DB;line-height:1.8;">${message || '<em style="color:#6B7280;">No message provided.</em>'}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background:#0c1a19;padding:8px 48px 36px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);" align="center">
      <a href="mailto:${email}?subject=Re%3A%20Your%20Inquiry%20%E2%80%94%20Truth%20Arc%20Media"
         style="display:inline-block;background:#00D4C8;color:#000000;font-size:14px;font-weight:800;letter-spacing:0.8px;text-decoration:none;padding:16px 44px;border-radius:8px;text-transform:uppercase;">
        Reply to ${name} &rarr;
      </a>
    </td>
  </tr>
  <tr>
    <td style="background:#071210;border-radius:0 0 12px 12px;padding:26px 48px;border:1px solid rgba(0,212,200,0.10);border-top:none;">
      <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.7;">
        Auto-generated from <span style="color:#00D4C8;">trutharcmedia.com</span> &mdash; ${sentAt}
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Truth Arc Media <onboarding@resend.dev>',
      to: ['saadwaseem209@gmail.com'],
      reply_to: email,
      subject: `New Inquiry from ${name} — Truth Arc Media`,
      html,
    });

    if (error) return res.status(400).json({ error });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/book-call', async (req, res) => {
  const { name, email, phone, brand, message, date, time } = req.body;

  if (!name || !email || !phone || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const sentAt = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });

  const field = (label, value, icon = '') => `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td style="background:rgba(0,212,200,0.05);border:1px solid rgba(0,212,200,0.15);border-radius:10px;padding:16px 20px;">
          <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:2px;color:#00D4C8;text-transform:uppercase;">${icon ? icon + ' ' : ''}${label}</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#ffffff;">${value || '<em style="color:#6B7280;font-weight:400;">Not provided</em>'}</p>
        </td>
      </tr>
    </table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>New Call Booking — Truth Arc Media</title>
</head>
<body style="margin:0;padding:0;background:#07090A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07090A;padding:48px 20px;">
<tr><td align="center">
<table width="620" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;width:100%;">

  <!-- Top bar -->
  <tr><td style="background:linear-gradient(90deg,#00D4C8,#00A89E);height:4px;border-radius:4px 4px 0 0;"></td></tr>

  <!-- Brand header -->
  <tr>
    <td style="background:linear-gradient(160deg,#0c1d1c 0%,#071412 100%);padding:40px 48px 32px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <p style="margin:0 0 10px;font-size:10px;font-weight:700;letter-spacing:3.5px;color:#00D4C8;text-transform:uppercase;">Truth Arc Media</p>
      <h1 style="margin:0 0 4px;font-size:32px;font-weight:800;color:#ffffff;line-height:1.15;">📞 New Call</h1>
      <h1 style="margin:0;font-size:32px;font-weight:800;color:#00D4C8;line-height:1.15;">Booking Received ✦</h1>
      <p style="margin:16px 0 0;font-size:14px;color:#9CA3AF;line-height:1.7;">
        <strong style="color:#fff;">${name}</strong> just booked a call. Confirm and get on their calendar!
      </p>
    </td>
  </tr>

  <!-- Booking summary highlight -->
  <tr>
    <td style="background:#0a1918;padding:0 48px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,rgba(0,212,200,0.1),rgba(0,212,200,0.04));border:1px solid rgba(0,212,200,0.25);border-radius:14px;margin:24px 0;">
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#00D4C8;text-transform:uppercase;">Scheduled For</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">${date}</p>
            <p style="margin:6px 0 0;font-size:16px;font-weight:600;color:#00D4C8;">${time} PKT</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Client details -->
  <tr>
    <td style="background:#0a1918;padding:0 48px 28px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <p style="margin:0 0 16px;font-size:10px;font-weight:700;letter-spacing:2px;color:#6B7280;text-transform:uppercase;">Client Details</p>
      ${field('Full Name', name, '👤')}
      ${field('Email Address', email, '✉️')}
      ${field('Phone Number', phone, '📱')}
      ${field('Brand / Business', brand || 'Not provided', '🏢')}
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:rgba(0,212,200,0.05);border:1px solid rgba(0,212,200,0.15);border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 5px;font-size:10px;font-weight:700;letter-spacing:2px;color:#00D4C8;text-transform:uppercase;">💬 What They Want to Discuss</p>
            <p style="margin:0;font-size:14px;color:#D1D5DB;line-height:1.8;">${message || '<em style="color:#6B7280;">No message provided.</em>'}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#0a1918;padding:8px 48px 36px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);" align="center">
      <a href="mailto:${email}?subject=Your%20Call%20is%20Confirmed%20%E2%80%94%20Truth%20Arc%20Media&body=Hi%20${encodeURIComponent(name)}%2C%0A%0AGreat%20news%20%E2%80%94%20your%20call%20is%20confirmed!%0A%0ADate%3A%20${encodeURIComponent(date)}%0ATime%3A%20${encodeURIComponent(time)}%20PKT%0A%0ALooking%20forward%20to%20speaking%20with%20you.%0A%0ATeam%20Truth%20Arc%20Media"
         style="display:inline-block;background:#00D4C8;color:#000000;font-size:14px;font-weight:800;letter-spacing:0.8px;text-decoration:none;padding:16px 44px;border-radius:10px;text-transform:uppercase;">
        Reply &amp; Confirm Call &rarr;
      </a>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#071210;border-radius:0 0 12px 12px;padding:24px 48px;border:1px solid rgba(0,212,200,0.10);border-top:none;">
      <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.7;">
        Auto-generated from <span style="color:#00D4C8;">trutharcmedia.com</span> &mdash; ${sentAt}
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Truth Arc Media <onboarding@resend.dev>',
      to: ['saadwaseem209@gmail.com'],
      reply_to: email,
      subject: `📞 New Call Booking: ${name} — ${date} at ${time}`,
      html,
    });

    if (error) return res.status(400).json({ error });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
