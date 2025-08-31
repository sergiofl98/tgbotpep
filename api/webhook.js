import fetch from "node-fetch";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TG_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  let rawBody = "";
  try {
    for await (const chunk of req) rawBody += chunk;
  } catch (err) {
    console.error("Error leyendo body:", err);
    return res.status(400).json({ ok: false, error: "Body read error" });
  }

  let update;
  try {
    update = JSON.parse(rawBody);
  } catch (err) {
    console.error("Error parseando JSON:", rawBody);
    return res.status(400).json({ ok: false, error: "Invalid JSON" });
  }

  try {
    console.log("Update recibido:", JSON.stringify(update));

    // Revisar todos los mensajes enviados por usuarios
    if (update.message && update.message.from) {
      const userId = update.message.from.id;
      const chatId = update.message.chat.id;
      const description = update.message.from?.bio || "";
	  const test = JSON.stringify(update.message.from || {});

      console.log(`Usuario ${userId} posteó algo. Bio: "${description}"`);
	  console.log(`Usuario ${userId} posteó algo. From completo: ${test}`);

      if (/50-100x\+ charts!/i.test(description)) {
        try {
          await fetch(`${TG_API}/banChatMember`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, user_id: userId }),
          });
          console.log(`Usuario ${userId} baneado en chat ${chatId}`);
        } catch (err) {
          console.error(`No se pudo banear usuario ${userId}:`, err.message);
        }
      }
    }

    // También mantener la verificación de nuevos miembros
    if (update.message && update.message.new_chat_members) {
      for (const user of update.message.new_chat_members) {
        const userId = user.id;
        const chatId = update.message.chat.id;
        const description = user?.bio || "";

        if (/50-100x\+ charts!/i.test(description)) {
          try {
            await fetch(`${TG_API}/banChatMember`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, user_id: userId }),
            });
            console.log(`Nuevo usuario ${userId} baneado en chat ${chatId}`);
          } catch (err) {
            console.error(`No se pudo banear nuevo usuario ${userId}:`, err.message);
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error en handler:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
