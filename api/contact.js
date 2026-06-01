export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const logoUrl = 'https://raw.githubusercontent.com/wphot/rgweb/main/assets/rg-logo-white.png';
    const fromEmail = process.env.FROM_EMAIL || 'RG Media Group <hello@devs.rgmedia.group>';
    const toEmail = process.env.CONTACT_EMAIL || 'hello@rgmedia.group';

    // Labels
    const serviceLabels = {
      strategy: 'Digital Strategy',
      development: 'Product Development',
      marketing: 'Marketing Solutions',
      full: 'Full Package (Strategy + Dev + Marketing)',
      other: 'Other'
    };
    const budgetLabels = {
      '5k': '$5,000 - $10,000',
      '10k': '$10,000 - $25,000',
      '25k': '$25,000 - $50,000',
      '50k': '$50,000+',
      tbd: 'Not sure yet'
    };

    const fullName = `${body.firstName || ''} ${body.lastName || ''}`.trim();
    const service = serviceLabels[body.service] || body.service || '';
    const budget = budgetLabels[body.budget] || body.budget || '';
    const safeMessage = (body.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // ===== EMAIL 1: Admin notification (to business) =====
    const adminHtml = `
      <div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0c0c0f;padding:32px;text-align:center">
          <img src="${logoUrl}" alt="RG Media Group" width="180" style="margin-bottom:16px;display:inline-block"/>
          <h1 style="color:#f4f3ef;font-size:22px;margin:0;font-weight:700">New Project Inquiry</h1>
          <p style="color:#a9a9b0;font-size:14px;margin:8px 0 0">Submitted via rgmedia.group</p>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb;width:35%">Name</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114">${fullName}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb">Email</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114"><a href="mailto:${body.email || ''}" style="color:#F02028">${body.email || ''}</a></td>
            </tr>
            ${body.company ? `
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb">Company</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114">${body.company}</td>
            </tr>` : ''}
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb">Service</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114">${service}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb">Project Details</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114;white-space:pre-wrap">${safeMessage}</td>
            </tr>
            ${body.budget ? `
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44">Budget</td>
              <td style="padding:14px 16px;color:#111114">${budget}</td>
            </tr>` : ''}
          </table>
        </div>
        <div style="padding:20px 32px;background:#f7f6f3;border-top:1px solid #e5e7eb;text-align:center">
          <p style="font-size:12px;color:#7a7a83;margin:0">Sent from rgmedia.group contact form</p>
        </div>
      </div>
    `;

    // ===== EMAIL 2: Client confirmation (auto-reply) =====
    const clientHtml = `
      <div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0c0c0f;padding:40px 32px;text-align:center">
          <img src="${logoUrl}" alt="RG Media Group" width="180" style="margin-bottom:20px;display:inline-block"/>
          <h1 style="color:#f4f3ef;font-size:24px;margin:0;font-weight:700">Thank You, ${fullName}!</h1>
          <p style="color:#a9a9b0;font-size:15px;margin:12px 0 0">We received your project inquiry</p>
        </div>
        <div style="padding:36px 32px">
          <p style="font-size:15px;color:#3d3d44;line-height:1.6;margin:0 0 24px">
            Thank you for reaching out to <strong>RG Media Group</strong>. We have received your inquiry and our team will review your project details carefully.
          </p>
          <p style="font-size:15px;color:#3d3d44;line-height:1.6;margin:0 0 24px">
            Here is a summary of what you submitted:
          </p>
          <div style="background:#f7f6f3;border-radius:12px;padding:20px 24px;margin:0 0 28px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              ${body.company ? `
              <tr>
                <td style="padding:8px 0;color:#7a7a83;font-weight:600;width:40%">Company</td>
                <td style="padding:8px 0;color:#111114">${body.company}</td>
              </tr>` : ''}
              <tr>
                <td style="padding:8px 0;color:#7a7a83;font-weight:600">Service</td>
                <td style="padding:8px 0;color:#111114">${service}</td>
              </tr>
              ${budget ? `
              <tr>
                <td style="padding:8px 0;color:#7a7a83;font-weight:600">Budget Range</td>
                <td style="padding:8px 0;color:#111114">${budget}</td>
              </tr>` : ''}
            </table>
          </div>
          <p style="font-size:15px;color:#3d3d44;line-height:1.6;margin:0 0 28px">
            A member of our team will get back to you within <strong>24-48 hours</strong> to discuss your project in more detail.
          </p>
          <div style="text-align:center;margin-top:28px">
            <a href="https://rgmedia.group" style="display:inline-block;background:#F02028;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px">
              Visit rgmedia.group
            </a>
          </div>
        </div>
        <div style="padding:24px 32px;background:#f7f6f3;border-top:1px solid #e5e7eb;text-align:center">
          <p style="font-size:13px;color:#7a7a83;margin:0 0 4px">RG Media Group</p>
          <p style="font-size:12px;color:#a9a9b0;margin:0">
            <a href="mailto:hello@rgmedia.group" style="color:#F02028;text-decoration:none">hello@rgmedia.group</a>
          </p>
        </div>
      </div>
    `;

    // Send both emails via Resend API
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    };

    // Email 1: Admin notification
    const adminRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: `New Project Inquiry — ${fullName}`,
        html: adminHtml,
        reply_to: body.email || ''
      })
    });

    if (!adminRes.ok) {
      const err = await adminRes.json().catch(() => ({}));
      console.error('Resend admin email error:', JSON.stringify(err));
      return res.status(502).json({ error: err.message || 'Failed to send notification email' });
    }

    // Email 2: Client confirmation (only if client has an email)
    if (body.email) {
      const clientRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: fromEmail,
          to: [body.email],
          subject: `Thank you for your inquiry, ${fullName} — RG Media Group`,
          html: clientHtml
        })
      });

      if (!clientRes.ok) {
        const err = await clientRes.json().catch(() => ({}));
        console.error('Resend client email error:', JSON.stringify(err));
        // Don't fail the request if client email fails — admin still got theirs
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
