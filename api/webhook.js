import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TG_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  let update;
  try {
    update = req.body;
    if (typeof update === "string") {
      update = JSON.parse(update);
    }
  } catch (err) {
    console.error("Error parseando body:", err);
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  try {
    // Filtrar usuarios que se unen
    if (update.message && update.message.new_chat_members) {
      for (const user of update.message.new_chat_members) {
        const userId = user.id;
        const chatId = update.message.chat.id;

        const description = user?.bio || ""; // bio pública
        if (/50-100x\+ charts!/i.test(description)) {
          await fetch(`${TG_API}/banChatMember`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, user_id: userId }),
          });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error en webhook:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
