exports.handler = async function (event) {
  const CORS = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, brand, service, budget, message } =
      JSON.parse(event.body || '{}');

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

  <!-- accent bar -->
  <tr><td style="background:linear-gradient(90deg,#00D4C8,#00A89E);height:4px;border-radius:4px 4px 0 0;"></td></tr>

  <!-- header -->
  <tr>
    <td style="background:linear-gradient(160deg,#0c1d1c 0%,#071412 100%);padding:44px 48px 38px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:3.5px;color:#00D4C8;text-transform:uppercase;">Truth Arc Media</p>
            <h1 style="margin:0 0 4px;font-size:30px;font-weight:800;color:#ffffff;line-height:1.2;letter-spacing:-0.5px;">New Inquiry</h1>
            <h1 style="margin:0;font-size:30px;font-weight:800;color:#00D4C8;line-height:1.2;letter-spacing:-0.5px;">Received ✦</h1>
            <table cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
              <tr>
                <td style="background:#00D4C8;width:40px;height:3px;border-radius:2px;"></td>
                <td width="6"></td>
                <td style="background:rgba(0,212,200,0.3);width:18px;height:3px;border-radius:2px;"></td>
                <td width="4"></td>
                <td style="background:rgba(0,212,200,0.12);width:10px;height:3px;border-radius:2px;"></td>
              </tr>
            </table>
          </td>
          <td align="right" valign="top">
            <div style="width:60px;height:60px;border-radius:50%;border:1.5px solid rgba(0,212,200,0.3);background:rgba(0,212,200,0.08);text-align:center;line-height:60px;font-size:26px;">✉</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- intro -->
  <tr>
    <td style="background:#0c1a19;padding:30px 48px 10px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <p style="margin:0;font-size:15px;color:#9CA3AF;line-height:1.8;">
        A potential client just submitted the contact form on your website. Their details are below — hit <strong style="color:#ffffff;">Reply to ${name}</strong> to respond directly.
      </p>
    </td>
  </tr>

  <!-- fields -->
  <tr>
    <td style="background:#0c1a19;padding:20px 48px 30px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      ${field('Full Name', name)}
      ${field('Email Address', email)}
      ${field('Brand / Business', brand)}
      ${field('Looking For', service)}
      ${field('Monthly Budget', budget)}
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

  <!-- CTA button -->
  <tr>
    <td style="background:#0c1a19;padding:8px 48px 36px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);" align="center">
      <a href="mailto:${email}?subject=Re%3A%20Your%20Inquiry%20%E2%80%94%20Truth%20Arc%20Media&body=Hi%20${encodeURIComponent(name)}%2C%0A%0AThank%20you%20for%20reaching%20out%20to%20Truth%20Arc%20Media!%0A%0A"
         style="display:inline-block;background:#00D4C8;color:#000000;font-size:14px;font-weight:800;letter-spacing:0.8px;text-decoration:none;padding:16px 44px;border-radius:8px;text-transform:uppercase;">
        Reply to ${name} &rarr;
      </a>
    </td>
  </tr>

  <!-- divider -->
  <tr>
    <td style="background:#0c1a19;padding:0 48px;border-left:1px solid rgba(0,212,200,0.12);border-right:1px solid rgba(0,212,200,0.12);">
      <div style="border-top:1px solid rgba(255,255,255,0.06);"></div>
    </td>
  </tr>

  <!-- footer -->
  <tr>
    <td style="background:#071210;border-radius:0 0 12px 12px;padding:26px 48px;border:1px solid rgba(0,212,200,0.10);border-top:none;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle">
            <p style="margin:0;font-size:12px;color:#4B5563;line-height:1.7;">
              Auto-generated from the contact form at <span style="color:#00D4C8;">trutharcmedia.com</span><br>
              <span style="color:#374151;">Truth Arc Media &mdash; Strategy. Storytelling. Scale.</span>
            </p>
          </td>
          <td align="right" valign="middle">
            <p style="margin:0;font-size:11px;color:#374151;white-space:nowrap;">${sentAt}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    const resend = new (require('resend').Resend)('re_4HS3L5SE_Ndh7GexNssrSdMVwwK7VgJtV');

    const { data, error: sendError } = await resend.emails.send({
      from: 'Truth Arc Media <onboarding@resend.dev>',
      to: ['saadwaseem209@gmail.com'],
      reply_to: email,
      subject: `New Inquiry from ${name} — Truth Arc Media`,
      html,
    });

    if (sendError) {
      return {
        statusCode: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: sendError }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
