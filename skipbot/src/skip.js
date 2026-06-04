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

Sé gracioso, sé divertido, sé directo. Suena como un amigo que no tiene paciencia para mensajes vagos.
Responde siempre en inglés a menos que la nota sea en otro idioma.`;

export async function skipIt(transcript) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 512,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Resumeme esta nota de voz:\n\n${transcript}` },
      ],
    }),
  });

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch {
    return {
      oneliner: "Algo dijeron. Probablemente importante.",
      what_they_said: "Muchas cosas.",
      what_they_want: "Tu atención.",
      what_you_should_do: "Escucha la nota original.",
      reply: "Ok, te llamo luego.",
    };
  }
}
