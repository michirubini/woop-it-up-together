// FILE: backend/api/woops.ts
import db = require("../db");

// ✅ COMPLETA UN WOOP
export async function completeWoop(woop_id: number) {
  await db.query(
    `UPDATE woops SET status = 'completed' WHERE id = $1`,
    [woop_id]
  );
}

// ✅ USCITA DA UN WOOP
export async function leaveWoop(woopId: number, userId: number): Promise<void> {
  await db.query(`DELETE FROM participants WHERE woop_id = $1 AND user_id = $2`, [woopId, userId]);

  const result = await db.query(`SELECT user_id FROM woops WHERE id = $1`, [woopId]);
  const creatorId = result.rows[0]?.user_id;

  if (creatorId === userId) {
    const newCreatorResult = await db.query(
      `SELECT user_id FROM participants WHERE woop_id = $1 ORDER BY id ASC LIMIT 1`,
      [woopId]
    );
    const newCreatorId = newCreatorResult.rows[0]?.user_id || null;
    await db.query(`UPDATE woops SET user_id = $1 WHERE id = $2`, [newCreatorId, woopId]);
  }
}

// ✅ CREA UN NUOVO WOOP NEL DATABASE
export async function createWoopInDb(
  title: string,
  description: string,
  userId: number,
  preferences: {
    genderPreference: string;
    maxParticipants: number;
    maxDistance: number;
    timeFrame: string;
  }
): Promise<number> {
  const result = await db.query(
    `INSERT INTO woops (title, description, user_id, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [title, description, userId, 'searching']
  );
  const woopId = result.rows[0].id;

  await db.query(`INSERT INTO participants (woop_id, user_id) VALUES ($1, $2)`, [woopId, userId]);

  // Puoi salvare le preferenze in tabella a parte oppure estenderle nel JSON del Woop

  return woopId;
}
