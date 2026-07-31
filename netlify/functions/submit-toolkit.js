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

    // 1. Send the toolkit + sample answers via Namecheap Private Email
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
      from: '"Detective Dale Hawthorne" <jeff@asktheprecinct.com>',
      to: email,
      subject: 'Your Crime Fiction Toolkit (and two answers you\'ll want)',
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; background: #0b0e14; color: #eef0f3; padding: 40px 32px;">
          <div style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #c9a24b; margin-bottom: 24px;">
            THE WRITERS PRECINCT
          </div>
          <h1 style="font-family: Georgia, serif; font-size: 26px; color: #eef0f3; margin-bottom: 8px;">
            Here's your toolkit.
          </h1>
          <p style="font-size: 15px; color: #b0aea8; line-height: 1.7; margin-bottom: 28px; font-style: italic;">
            Twenty years of homicide work, distilled into eight pages. Attached below.
          </p>

          <div style="text-align:center; margin-bottom: 32px;">
            <a href="https://thewritersprecinct.com/CrimeFictionToolkit.pdf"
               style="display:inline-block; background: linear-gradient(180deg, #e0bc6a, #c9a24b); color: #1a1406; font-family: Arial, sans-serif; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 28px; border-radius: 10px;">
              Download the Toolkit →
            </a>
          </div>

          <div style="border-top: 1px solid #2a2a2e; padding-top: 24px; margin-bottom: 24px;">
            <div style="font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #93999f; margin-bottom: 14px;">
              WHILE YOU'RE HERE — TWO REAL ANSWERS
            </div>
            <p style="font-size: 14px; color: #d7dae0; line-height: 1.6; margin-bottom: 20px;">
              <strong style="color:#eef0f3;">Q: Do banks cooperate with a financial investigation, or do you need a warrant?</strong><br><br>
              Banks don't actually give a damn about your suspect's privacy. What they care about is their legal exposure &mdash; and that difference is what separates a detective who can build a financial case from one who spends three weeks waiting on paperwork while the money disappears to the Cayman Islands...<br><br>
              <em style="color:#93999f;">The most powerful financial investigative tool &mdash; in fiction and in real life &mdash; is almost never the dramatic bank record reveal. It's the gap between what someone earns and how they live.</em>
            </p>
            <p style="font-size: 14px; color: #d7dae0; line-height: 1.6;">
              <strong style="color:#eef0f3;">Q: Can a villain hack parking meters to harvest credit card data?</strong><br><br>
              Yes, it's absolutely possible &mdash; and it's been done. San Francisco, Los Angeles, Chicago. In several documented cases it ran for months before anyone noticed, because nobody was watching...<br><br>
              <em style="color:#93999f;">The most realistic element you can put in your fiction isn't a genius hacker in a dark room. It's the six-month gap between when the crime happened and when anyone realized it.</em>
            </p>
          </div>

          <div style="text-align:center; margin-bottom: 8px;">
            <a href="https://thewritersprecinct.com/hawthorne"
               style="display:inline-block; border: 1.5px solid #c9a24b; color: #e0bc6a; font-family: Arial, sans-serif; font-weight: 700; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px;">
              Ask Your Own Question — Free →
            </a>
          </div>

          <div style="border-top: 1px solid #2a2a2e; padding-top: 24px; margin-top: 28px;">
            <div style="font-size: 12px; color: #8a8880; line-height: 1.8;">
              <strong style="color:#b0aea8;">The Writers Precinct</strong> gives crime fiction and thriller writers instant access to real police, forensic, medical, and legal research — on demand, from experts who've actually been there.
            </div>
          </div>
        </div>
      `
    });

    // 2. Notify Jeff of the new signup
    await transporter.sendMail({
      from: '"Toolkit Signup" <jeff@asktheprecinct.com>',
      to: 'jeff@asktheprecinct.com',
      subject: `New Toolkit Signup: ${email}`,
      text: `New Crime Fiction Toolkit signup from the Hawthorne landing page:\n\n${email}\n\nTime: ${new Date().toISOString()}`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error('submit-toolkit error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Server error. Please try again.' })
    };
  }
};
