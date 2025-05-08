import db = require("../db");

export async function joinWoop(woop_id: number, user_id: number) {
  await db.query(
    `INSERT INTO participants (woop_id, user_id) VALUES ($1, $2)`,
    [woop_id, user_id]
  );
}

export async function getParticipants(woop_id: number) {
  const result = await db.query(
    `SELECT user_id FROM participants WHERE woop_id = $1`,
    [woop_id]
  );
  return result.rows;
}
