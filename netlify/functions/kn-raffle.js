const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email } = JSON.parse(event.body);

    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Name and email are required.' })
      };
    }

    // 1. Log to Google Sheet
    const sheetResponse = await fetch(
      'https://script.google.com/macros/s/AKfycbzdj52_WWkQiwhl9SUU0TQkvTPUMuib2eeuB2FX5l5x6dApYsj-QCE5DlzASQEAptuN/exec',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      }
    );

    // 2. Send confirmation email via Namecheap Private Email
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'jeff@asktheprecinct.com',
        pass: process.env.PRIVATE_EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: '"The Writers Precinct" <jeff@asktheprecinct.com>',
      to: email,
      subject: 'You\'re In — Your Killer Nashville Discount Code',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0e0e0f; color: #e8e6e0; padding: 40px 32px;">
          <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c8782a; margin-bottom: 24px;">
            THE WRITERS PRECINCT — KILLER NASHVILLE 2026
          </div>
          <h1 style="font-family: Arial Black, sans-serif; font-size: 28px; color: #e8e6e0; margin-bottom: 8px;">
            You're In, ${name.split(' ')[0]}.
          </h1>
          <p style="font-size: 16px; color: #b0aea8; line-height: 1.7; margin-bottom: 32px; font-style: italic;">
            Your raffle entry is confirmed. One winner receives 3 months of full membership free — announced after Killer Nashville.
          </p>
          <div style="background: #161618; border: 1px solid #c8782a; border-radius: 8px; padding: 24px; margin-bottom: 32px; text-align: center;">
            <div style="font-family: Arial, sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #8a8880; margin-bottom: 12px;">
              YOUR EXCLUSIVE DISCOUNT CODE
            </div>
            <div style="font-family: 'Courier New', monospace; font-size: 32px; letter-spacing: 8px; color: #c8782a; margin-bottom: 12px;">
              KN2026
            </div>
            <div style="font-size: 14px; color: #b0aea8;">
              50% off your first month — $14.99 instead of $29.99
            </div>
          </div>
          <p style="font-size: 14px; color: #b0aea8; line-height: 1.7; margin-bottom: 24px;">
            Use code <strong style="color: #e8e6e0;">KN2026</strong> at checkout on <a href="https://thewritersprecinct.com" style="color: #c8782a;">TheWritersPrecinct.com</a>. Code expires August 31, 2026. Limited to 500 redemptions.
          </p>
          <div style="border-top: 1px solid #2a2a2e; padding-top: 24px; margin-top: 24px;">
            <div style="font-size: 13px; color: #8a8880; line-height: 1.8;">
              <strong style="color: #b0aea8;">The Writers Precinct</strong> gives crime fiction and thriller writers instant access to real police, forensic, medical, and legal research — on demand, from experts who've actually been there.<br><br>
              <a href="https://thewritersprecinct.com" style="color: #c8782a;">Explore the full suite →</a>
            </div>
          </div>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('kn-raffle error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Server error. Please try again.' })
    };
  }
};
