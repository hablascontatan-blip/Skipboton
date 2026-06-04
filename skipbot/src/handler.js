import { transcribeAudio } from "./transcribe.js";
import { skipIt } from "./skip.js";
import { sendMessage } from "./twilio.js";

/**
 * Handles an incoming Twilio WhatsApp webhook payload.
 * Twilio sends multipart/form-urlencoded with these key fields:
 *   - From: "whatsapp:+1234567890"
 *   - Body: text of the message (empty for voice notes)
 *   - NumMedia: number of media attachments
 *   - MediaUrl0: URL of the first attachment
 *   - MediaContentType0: MIME type (audio/ogg for WhatsApp voice notes)
 */
export async function handleIncoming(body) {
  const from = body.From; // e.g. "whatsapp:+34612345678"
  const numMedia = parseInt(body.NumMedia || "0", 10);
  const mediaType = body.MediaContentType0 || "";
  const mediaUrl = body.MediaUrl0 || "";
  const textBody = (body.Body || "").trim().toLowerCase();

  // --- VOICE NOTE ---
  if (numMedia > 0 && mediaType.startsWith("audio/")) {
    await sendMessage(from, "⏩ Recibido. Skipping…");
    try {
      const transcript = await transcribeAudio(mediaUrl);
      const result = await skipIt(transcript);
      await sendResults(from, result);
    } catch (err) {
      console.error("Error processing voice note:", err);
      await sendMessage(from, "💀 Algo salió mal skipeando eso. Intenta de nuevo.");
    }
    return;
  }

  // --- HELP / GREETING ---
  if (!textBody || textBody.match(/^(hola|hi|hello|help|ayuda|start|empezar)$/)) {
    await sendMessage(
      from,
      `⏩ *Mini Meals SKIP IT*\n\nReenvíame cualquier nota de voz y te devuelvo:\n\n• El punto en una línea\n• 3 bullets para reenviar\n• Una respuesta de 3 segundos\n\nSimplemente reenvía la nota. Nada más.`
    );
    return;
  }

  // --- TEXT TRANSCRIPT (pasted directly) ---
  if (textBody.length > 30) {
    await sendMessage(from, "⏩ Skipping…");
    try {
      const result = await skipIt(body.Body);
      await sendResults(from, result);
    } catch (err) {
      console.error("Error processing text:", err);
      await sendMessage(from, "💀 No pude procesar eso. Intenta con la nota de voz directamente.");
    }
    return;
  }

  // --- FALLBACK ---
  await sendMessage(from, "Reenvíame una nota de voz y te la skipeo. ⏩");
}

/**
 * Sends the three result cards as separate WhatsApp messages.
 * Three messages feel more native than one wall of text.
 */
async function sendResults(to, result) {
  // Card 1 — The one-liner
  await sendMessage(to, `⏩ *El punto:*\n\n_${result.oneliner}_`);

  // Card 2 — Forwardable breakdown
  await sendMessage(
    to,
    `📋 *Para reenviar:*\n\n→ *Lo que dijo:* ${result.what_they_said}\n→ *Lo que quiere:* ${result.what_they_want}\n→ *Qué hacer tú:* ${result.what_you_should_do}`
  );

  // Card 3 — Spicy reply
  await sendMessage(
    to,
    `🔥 *Tu respuesta en 3 segundos:*\n\n"${result.reply}"\n\n— _Mini Meals. Unskippable flavor._ 🍔`
  );
}
