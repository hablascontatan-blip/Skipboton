import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Your Twilio WhatsApp sender number, e.g. "whatsapp:+14155238886"
const FROM = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Sends a WhatsApp message via Twilio.
 * @param {string} to   - Recipient in "whatsapp:+XXXXXXXXXXX" format
 * @param {string} body - Message text (supports WhatsApp markdown: *bold*, _italic_)
 */
export async function sendMessage(to, body) {
  try {
    await client.messages.create({ from: FROM, to, body });
  } catch (err) {
    console.error(`Failed to send message to ${to}:`, err.message);
    throw err;
  }
}
