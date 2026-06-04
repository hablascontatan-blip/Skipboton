import express from "express";
import { handleIncoming } from "./handler.js";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Twilio sends a POST to this endpoint on every incoming WhatsApp message
app.post("/webhook", async (req, res) => {
  // Respond 200 immediately so Twilio doesn't retry
  res.sendStatus(200);
  await handleIncoming(req.body);
});

// Health check
app.get("/", (_, res) => res.send("SkipBot is running ⏩"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SkipBot listening on port ${PORT}`));
