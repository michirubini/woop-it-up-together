import db = require("../db");

// Salva un messaggio nel DB
export async function saveMessage(woop_id: number, user_id: number, text: string) {
  await db.query(
    `INSERT INTO messages (woop_id, user_id, text) VALUES ($1, $2, $3)`,
    [woop_id, user_id, text]
  );
}

// Recupera tutti i messaggi di un Woop
export async function getMessages(woop_id: number) {
  const result = await db.query(
    `SELECT * FROM messages WHERE woop_id = $1 ORDER BY timestamp ASC`,
    [woop_id]
  );
  return result.rows;
}

