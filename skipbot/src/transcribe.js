import fetch from "node-fetch";
import FormData from "form-data";

/**
 * Downloads a Twilio media URL and transcribes it with OpenAI Whisper.
 *
 * Twilio protects media URLs with HTTP Basic Auth using your
 * Account SID and Auth Token. We pass those as credentials.
 *
 * @param {string} mediaUrl - The Twilio MediaUrl0 from the webhook
 * @returns {Promise<string>} - The transcribed text
 */
export async function transcribeAudio(mediaUrl) {
  // 1. Download the audio from Twilio (authenticated)
  const audioRes = await fetch(mediaUrl, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString("base64"),
    },
  });

  if (!audioRes.ok) {
    throw new Error(`Failed to download audio: ${audioRes.status}`);
  }

  const audioBuffer = await audioRes.buffer();
  const contentType = audioRes.headers.get("content-type") || "audio/ogg";

  // Whisper needs a file extension it recognises — WhatsApp sends ogg/opus
  const ext = contentType.includes("ogg") ? "ogg" : "mp4";

  // 2. Upload to Whisper
  const form = new FormData();
  form.append("file", audioBuffer, { filename: `voice.${ext}`, contentType });
  form.append("model", "whisper-1");
  form.append("language", "es"); // change to "en" or remove for auto-detect

  const whisperRes = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    }
  );

  if (!whisperRes.ok) {
    const err = await whisperRes.text();
    throw new Error(`Whisper error: ${err}`);
  }

  const data = await whisperRes.json();
  return data.text;
}
