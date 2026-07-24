import "dotenv/config";

async function testResend() {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("No RESEND_API_KEY found");
    return;
  }
  
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: "test@example.com",
      subject: "Test Email from Resend",
      html: "<p>This is a test email.</p>"
    }),
  });
  
  const data = await response.json();
  console.log("Status:", response.status);
  console.log("Response:", data);
}

testResend().catch(console.error);
