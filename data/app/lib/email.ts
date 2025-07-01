import { EmailClient } from "@azure/communication-email";

const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING!;
const client = new EmailClient(connectionString);

const senderAddress = "test@5cf8469b-9fe8-4091-a576-78e1c43d686e.azurecomm.net";

function createWelcomeEmail(recipient: string, link: string): string {
  return `
    <html>
      <body>
        <h1>Welcome to the Restaurant Manager App!</h1>
        <p>Hello,</p>
        <p>You have been invited to manage a restaurant. Please click the link below to access the application:</p>
        <a href="${link}">Get Started</a>
        <p>Thank you!</p>
      </body>
    </html>
  `;
}

export async function sendInviteEmail(recipient: string, link: string) {
  console.log("Attempting to send email from:", senderAddress);
  const emailMessage = {
    senderAddress,
    content: {
      subject: "You're invited to manage a restaurant!",
      html: createWelcomeEmail(recipient, link),
    },
    recipients: {
      to: [{ address: recipient }],
    },
  };

  try {
    const poller = await client.beginSend(emailMessage);
    await poller.pollUntilDone();
    console.log("Email sent successfully to", recipient);
    return true;
  } catch (error) {
    console.error("Error sending email:", JSON.stringify(error, null, 2));
    return false;
  }
}
