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

// ✅ RESTITUISCE TUTTI I WOOP DAL DATABASE
export async function getAllWoops() {
  // Unisci dati di woop + creator + preferenze + partecipanti, se vuoi
  const woopRes = await db.query(
    `SELECT w.*, 
            u.id as creator_id, u.first_name, u.last_name, u.age, u.profile_picture
     FROM woops w
     JOIN users u ON u.id = w.user_id`
  );

  // Questo prende anche i partecipanti (semplificato)
  const participantRes = await db.query(
    `SELECT p.woop_id, json_agg(
       json_build_object(
         'id', u.id,
         'firstName', u.first_name,
         'lastName', u.last_name,
         'profilePicture', u.profile_picture
       )
     ) as participants
     FROM participants p
     JOIN users u ON u.id = p.user_id
     GROUP BY p.woop_id`
  );

  // Mappa i partecipanti ai rispettivi woop
  const participantsMap: Record<string, any[]> = {};
  participantRes.rows.forEach((row: any) => {
    participantsMap[row.woop_id] = row.participants;
  });

  // Ricostruisci ogni woop con il creator e i partecipanti
  return woopRes.rows.map((row: any) => ({
    id: `woop-${row.id}`,
    creator: {
      id: String(row.creator_id),
      firstName: row.first_name,
      lastName: row.last_name,
      age: row.age,
      profilePicture: row.profile_picture,
      interests: [], // se vuoi aggiungi anche questi
      photos: []
    },
    interest: row.title,
    description: row.description,
    preferences: {
      genderPreference: 'entrambi',
      maxParticipants: row.max_participants || 4,
      maxDistance: row.max_distance || 10,
      timeFrame: row.time_frame || 'Oggi'
    },
    participants: participantsMap[row.id] || [],
    status: row.status
  }));
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

// ✅ ELIMINA UN WOOP
export async function deleteWoop(woop_id: number): Promise<void> {
  await db.query(`DELETE FROM participants WHERE woop_id = $1`, [woop_id]);
  await db.query(`DELETE FROM woops WHERE id = $1`, [woop_id]);
}
