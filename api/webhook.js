import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TG_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let rawBody = "";
  try {
    // Acumular el body desde el stream
    for await (const chunk of req) {
      rawBody += chunk;
    }
  } catch (err) {
    console.error("Error leyendo body:", err);
    return res.status(400).json({ ok: false, error: "Body read error" });
  }

  let update;
  try {
    update = JSON.parse(rawBody);
  } catch (err)
