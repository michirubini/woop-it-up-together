import db = require("../db");

export async function joinWoop(woop_id: number, user_id: number) {
  await db.query(
    `INSERT INTO participants (woop_id, user_id) VALUES ($1, $2)`,
    [woop_id, user_id]
  );
}

export async function getParticipants(woop_id: number) {
  const result = await db.query(
    `SELECT u.id, u.first_name, u.last_name, u.profile_picture
     FROM participants p
     JOIN users u ON u.id = p.user_id
     WHERE p.woop_id = $1`,
    [woop_id]
  );
  return result.rows;
}
