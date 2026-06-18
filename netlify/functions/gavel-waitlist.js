const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Email is required.' })
      };
    }

    // 1. Log to Google Sheet (reuse same sheet, add a source column)
    await fetch(
      'https://script.google.com/macros/s/AKfycbzdj52_WWkQiwhl9SUU0TQkvTPUMuib2eeuB2FX5l5x6dApYsj-QCE5DlzASQEAptuN/exec',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Gavel Waitlist', email })
      }
    );

    // 2. Send confirmation email
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
      subject: 'You\'re on the list — The Gavel is coming',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0e0e0f; color: #e8e6e0; padding: 40px 32px;">
          <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c8782a; margin-bottom: 24px;">
            THE WRITERS PRECINCT
          </div>
          <h1 style="font-family: Arial Black, sans-serif; font-size: 28px; color: #e8e6e0; margin-bottom: 8px;">
            The Gavel is coming.
          </h1>
          <p style="font-size: 16px; color: #b0aea8; line-height: 1.7; margin-bottom: 32px; font-style: italic;">
            You're on the list. We'll email you the moment Victoria Mills, Esq. opens her doors.
          </p>
          <div style="background: #161618; border: 1px solid #4a3a6b; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
            <div style="font-family: Arial, sans-serif; font-size: 22px; font-weight: 900; color: #e8e6e0; margin-bottom: 8px;">Victoria Mills, Esq.</div>
            <div style="font-size: 14px; color: #b0aea8; line-height: 1.7;">Trial attorney. Ruthless. Brilliant. Criminal procedure, courtroom mechanics, sentencing, evidence rules — all written for fiction writers who need it to read right.</div>
          </div>
          <p style="font-size: 14px; color: #b0aea8; line-height: 1.7; margin-bottom: 24px;">
            In the meantime, three expert tools are live right now — <a href="https://asktheprecinct.com" style="color: #c8782a;">The Precinct</a>, <a href="https://asktheer.com" style="color: #c8782a;">The ER</a>, and <a href="https://askthearmory.com" style="color: #c8782a;">The Armory</a>. First 3 questions are always free.
          </p>
          <div style="border-top: 1px solid #2a2a2e; padding-top: 24px; margin-top: 24px;">
            <a href="https://thewritersprecinct.com" style="color: #c8782a; font-size: 14px;">Explore the full suite →</a>
          </div>
        </div>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('gavel-waitlist error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Server error.' })
    };
  }
};
