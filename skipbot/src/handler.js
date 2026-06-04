import { transcribeAudio } from "./transcribe.js";
import { skipIt } from "./skip.js";
import { sendMessage } from "./twilio.js";

export async function handleIncoming(body) {
  const from = body.From;
  const numMedia = parseInt(body.NumMedia || "0", 10);
  const mediaType = body.MediaContentType0 || "";
  const mediaUrl = body.MediaUrl0 || "";
  const textBody = (body.Body || "").trim().toLowerCase();

  // --- VOICE NOTE ---
  if (numMedia > 0 && mediaType.startsWith("audio/")) {
    await sendMessage(from, "⏩ Got it. Skipping…");
    try {
      const transcript = await transcribeAudio(mediaUrl);
      const result = await skipIt(transcript);
      await sendResults(from, result);
    } catch (err) {
      console.error("Error processing voice note:", err);
      await sendMessage(from, "💀 Something went wrong. Try again.");
    }
    return;
  }

  // --- HELP / GREETING ---
  if (!textBody || textBody.match(/^(hola|hi|hello|help|ayuda|start|empezar)$/)) {
    await sendMessage(
      from,
      `⏩ *Mini Meals SKIP IT*\n\nForward me any voice note and I'll send back:\n\n• The point in one line\n• 3 bullets to forward\n• A 3-second reply\n\nJust forward the note. That's it.`
    );
    return;
  }

  // --- TEXT TRANSCRIPT ---
  if (textBody.length > 30) {
    await sendMessage(from, "⏩ Skipping…");
    try {
      const result = await skipIt(body.Body);
      await sendResults(from, result);
    } catch (err) {
      console.error("Error processing text:", err);
      await sendMessage(from, "💀 Couldn't process that. Try sending the voice note directly.");
    }
    return;
  }

  // --- FALLBACK ---
  await sendMessage(from, "Forward me a voice note and I'll skip it for you. ⏩");
}

async function sendResults(to, result) {
  await sendMessage(to, `⏩ *The point:*\n\n_${result.oneliner}_`);

  await sendMessage(
    to,
    `📋 *Forward this:*\n\n→ *What they said:* ${result.what_they_said}\n→ *What they want:* ${result.what_they_want}\n→ *What you should do:* ${result.what_you_should_do}`
  );

  await sendMessage(
    to,
    `🔥 *3-second reply:*\n\n"${result.reply}"\n\n— _Mini Meals. Unskippable flavor._ 🍔`
  );
}
