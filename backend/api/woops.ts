import db = require("../db");

export async function completeWoop(woop_id: number) {
  await db.query(
    `UPDATE woops SET status = 'completed' WHERE id = $1`,
    [woop_id]
  );
}

// ✅ NUOVA FUNZIONE: uscita da un Woop
export async function leaveWoop(woopId: number, userId: number): Promise<void> {
  // 1. Rimuovi l'utente dalla tabella dei partecipanti
  await db.query(
    `DELETE FROM participants WHERE woop_id = $1 AND user_id = $2`,
    [woopId, userId]
  );

  // 2. Controlla se l'utente che ha lasciato era il creatore del Woop
  const result = await db.query(
    `SELECT user_id FROM woops WHERE id = $1`,
    [woopId]
  );

  const creatorId = result.rows[0]?.user_id;

  if (creatorId === userId) {
    // 3. Se sì, trova il primo partecipante rimanente
    const newCreatorResult = await db.query(
      `SELECT user_id FROM participants WHERE woop_id = $1 ORDER BY id ASC LIMIT 1`,
      [woopId]
    );

    const newCreatorId = newCreatorResult.rows[0]?.user_id || null;

    // 4. Aggiorna la tabella woops con il nuovo creatore (può anche essere null)
    await db.query(
      `UPDATE woops SET user_id = $1 WHERE id = $2`,
      [newCreatorId, woopId]
    );
  }
}
