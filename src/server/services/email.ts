import { env } from "../config";

async function send(to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    console.info(`[email:development] ${subject} for ${to}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });
  if (!response.ok) throw new Error("Transactional email delivery failed.");
}

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #1a1f36;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #333333;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #1a1f36;
      padding: 40px 0;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #1a1f36;
      padding: 30px;
      text-align: center;
      border-bottom: 4px solid #c5a55a;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      background-color: #c5a55a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 4px;
      font-weight: 600;
      display: inline-block;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #888888;
      border-top: 1px solid #eeeeee;
    }
    .footer p {
      margin: 5px 0;
    }
    h2 {
      color: #1a1f36;
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main" cellspacing="0" cellpadding="0">
      <tr>
        <td class="header">
          <h1>EVOLVE TRADE HUB</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; ${new Date().getFullYear()} EVOLVE TRADE HUB. All rights reserved.</p>
          <p>This is an automated message, please do not reply directly to this email.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
}

export const email = {
  verification: (to: string, token: string) => {
    const link = `${env.APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
    const html = layout(`
      <h2>Welcome to EVOLVE TRADE HUB</h2>
      <p>Thank you for registering with us. We're excited to have you on board!</p>
      <p>To get started, please verify your email address by clicking the button below:</p>
      <div class="button-container">
        <a href="${link}" class="button">Verify Your Email</a>
      </div>
      <p style="font-size: 14px; color: #666;">This link expires in 24 hours.</p>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="font-size: 12px; word-break: break-all; color: #888;"><a href="${link}" style="color: #c5a55a;">${link}</a></p>
    `);
    return send(to, "Verify your EVOLVE TRADE HUB email", html);
  },
  
  passwordReset: (to: string, token: string) => {
    const link = `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
    const html = layout(`
      <h2>Password Reset Request</h2>
      <p>We received a request to reset the password for your EVOLVE TRADE HUB account.</p>
      <p>Click the button below to choose a new password:</p>
      <div class="button-container">
        <a href="${link}" class="button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #666;">This link expires in 1 hour.</p>
      <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your account is secure.</p>
    `);
    return send(to, "Reset your password", html);
  },

  welcome: (to: string) => {
    const html = layout(`
      <h2>Your Account is Ready</h2>
      <p>Your email has been verified and your EVOLVE TRADE HUB account is fully activated.</p>
      <p>Here are a few things you can do to get started:</p>
      <ul>
        <li>Complete your profile information</li>
        <li>Explore our trading tools and analytics</li>
        <li>Set up your preferred notification settings</li>
      </ul>
      <div class="button-container">
        <a href="${env.APP_URL}/dashboard" class="button">Go to Dashboard</a>
      </div>
      <p>If you have any questions, our support team is always here to help.</p>
    `);
    return send(to, "Welcome to EVOLVE TRADE HUB", html);
  }
};
