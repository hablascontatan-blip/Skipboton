import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres un resumidor brutalmente eficiente para una herramienta llamada SKIP IT de Mini Meals.
Recibes transcripciones de notas de voz y devuelves un resumen en exactamente este formato JSON
(sin markdown, sin preámbulo, solo JSON crudo):

{
  "oneliner": "una frase directa, máximo 15 palabras, lo que realmente quisieron decir",
  "what_they_said": "una frase",
  "what_they_want": "una frase",
  "what_you_should_do": "una frase accionable",
  "reply": "una respuesta de 3 segundos, directa y con personalidad, máximo 10 palabras"
}

Sé gracioso, sé directo. Suena como un amigo que no tiene paciencia para mensajes vagos.
Responde siempre en español a menos que la nota sea en otro idioma.`;

/**
 * Sends a transcript to Claude and returns the structured Skip Summary.
 * @param {string} transcript
 * @returns {Promise<{oneliner, what_they_said, what_they_want, what_you_should_do, reply}>}
 */
export async function skipIt(transcript) {
  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Resumeme esta nota de voz:\n\n${transcript}`,
      },
    ],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    // Fallback if Claude returns something unexpected
    return {
      oneliner: "Algo dijeron. Probablemente importante.",
      what_they_said: "Muchas cosas.",
      what_they_want: "Tu atención.",
      what_you_should_do: "Escucha la nota original.",
      reply: "Ok, te llamo luego.",
    };
  }
}
