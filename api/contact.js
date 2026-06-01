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

    // Build HTML email with table layout
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

    const html = `
      <div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
        <div style="background:#0c0c0f;padding:32px;text-align:center">
          <h1 style="color:#f4f3ef;font-size:22px;margin:0;font-weight:700">New Project Inquiry</h1>
          <p style="color:#a9a9b0;font-size:14px;margin:8px 0 0">RG Media Group Website</p>
        </div>
        <div style="padding:32px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb;width:35%">Name</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114">${body.firstName || ''} ${body.lastName || ''}</td>
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
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114">${serviceLabels[body.service] || body.service || ''}</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44;border-bottom:1px solid #e5e7eb">Project Details</td>
              <td style="padding:14px 16px;border-bottom:1px solid #e5e7eb;color:#111114;white-space:pre-wrap">${(body.message || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            </tr>
            ${body.budget ? `
            <tr>
              <td style="padding:14px 16px;background:#f7f6f3;font-weight:600;color:#3d3d44">Budget</td>
              <td style="padding:14px 16px;color:#111114">${budgetLabels[body.budget] || body.budget}</td>
            </tr>` : ''}
          </table>
        </div>
        <div style="padding:20px 32px;background:#f7f6f3;border-top:1px solid #e5e7eb;text-align:center">
          <p style="font-size:12px;color:#7a7a83;margin:0">Sent from rgmedia.group contact form</p>
        </div>
      </div>
    `;

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'RG Website <onboarding@resend.dev>',
        to: ['hello@rgmedia.group'],
        subject: 'New Project Inquiry — RG Media Group',
        html: html,
        reply_to: body.email || ''
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
