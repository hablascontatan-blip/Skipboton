# ⏩ Mini Meals SKIP IT — WhatsApp Bot

Reenvía una nota de voz → recibe el resumen en 3 mensajes. Sin apps. Sin logins. Solo WhatsApp.

---

## Cómo funciona

```
Usuario reenvía nota de voz
        ↓
Twilio recibe el audio y llama al webhook
        ↓
El servidor descarga el audio
        ↓
OpenAI Whisper transcribe el audio
        ↓
Claude genera el Skip Summary (3 outputs)
        ↓
Twilio envía 3 mensajes de vuelta al usuario
```

---

## Setup en 15 minutos

### 1. Clona e instala

```bash
git clone <tu-repo>
cd skipbot
npm install
cp .env.example .env
```

### 2. Consigue tus credenciales

**Twilio**
1. Crea cuenta en [twilio.com](https://twilio.com)
2. Ve a Messaging → Try it out → Send a WhatsApp message
3. Sigue las instrucciones del Sandbox (envías "join <palabra>" al número de Twilio)
4. Copia tu Account SID y Auth Token del dashboard
5. El número del sandbox es `whatsapp:+14155238886`

**OpenAI**
1. Crea cuenta en [platform.openai.com](https://platform.openai.com)
2. API Keys → Create new secret key

**Anthropic**
1. Ya lo tienes si estás usando Claude API
2. [console.anthropic.com](https://console.anthropic.com) → API Keys

### 3. Rellena el .env

```
TWILIO_ACCOUNT_SID=ACxxxxxxxx...
TWILIO_AUTH_TOKEN=xxxxxxxx...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Despliega (Railway — recomendado)

```bash
# Instala Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway up
```

Railway te da una URL pública tipo `https://skipbot-production.up.railway.app`

### 5. Conecta el webhook en Twilio

1. Ve a tu Sandbox de WhatsApp en Twilio
2. En "When a message comes in" pon:
   ```
   https://tu-url.up.railway.app/webhook
   ```
3. Método: HTTP POST
4. Guarda

### 6. Prueba

Desde tu WhatsApp, envía una nota de voz al número del sandbox de Twilio.
En ~5 segundos recibes 3 mensajes.

---

## Estructura del proyecto

```
skipbot/
├── src/
│   ├── index.js      — Servidor Express + webhook endpoint
│   ├── handler.js    — Lógica principal de routing de mensajes
│   ├── transcribe.js — Descarga audio + Whisper API
│   ├── skip.js       — Claude API → Skip Summary JSON
│   └── twilio.js     — Envío de mensajes WhatsApp
├── .env.example
└── package.json
```

---

## Para producción (número real, no sandbox)

1. Solicita acceso a WhatsApp Business API en Twilio (tarda 1–3 días)
2. Verifica tu Facebook Business Manager
3. Cambia `TWILIO_WHATSAPP_NUMBER` al número aprobado
4. El flujo de código no cambia nada más

---

## Idioma

Por defecto el bot responde en español y Whisper transcribe en español.
Para cambiar a inglés, en `transcribe.js` quita la línea `form.append("language", "es")`.
El prompt de Claude en `skip.js` se adapta al idioma de la nota automáticamente.

---

## Costes estimados (por nota de voz de ~2 min)

| Servicio | Coste aprox. |
|----------|-------------|
| Twilio (recibir + 3 mensajes) | ~$0.04 |
| Whisper (2 min de audio) | ~$0.005 |
| Claude (resumen) | ~$0.002 |
| **Total por nota** | **~$0.05** |

---

_Mini Meals. Unskippable flavor._ ⏩
