import db = require("../db");

export async function completeWoop(woop_id: number) {
  await db.query(
    `UPDATE woops SET status = 'completed' WHERE id = $1`,
    [woop_id]
  );
}
