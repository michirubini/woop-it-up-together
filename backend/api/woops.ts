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

// ✅ RESTITUISCE TUTTI I WOOP REALI (con partecipanti e messaggi)
export async function getAllWoops() {
  const woopRes = await db.query(
    `SELECT w.*, 
            u.id as creator_id, u.first_name, u.last_name, u.age, u.profile_picture
     FROM woops w
     JOIN users u ON u.id = w.user_id
     WHERE (w.is_mock = false OR w.is_mock IS NULL)
     ORDER BY w.created_at DESC`
  );

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

  const messagesRes = await db.query(
    `SELECT * FROM messages ORDER BY timestamp ASC`
  );

  const participantsMap: Record<string, any[]> = {};
  participantRes.rows.forEach((row: any) => {
    participantsMap[row.woop_id] = row.participants;
  });

  const messagesMap: Record<number, any[]> = {};
  messagesRes.rows.forEach((msg: any) => {
    if (!messagesMap[msg.woop_id]) messagesMap[msg.woop_id] = [];
    messagesMap[msg.woop_id].push({
      userId: msg.user_id.toString(),
      text: msg.text,
      timestamp: msg.timestamp,
    });
  });

  return woopRes.rows.map((row: any) => ({
    id: `woop-${row.id}`,
    creator: {
      id: String(row.creator_id),
      firstName: row.first_name,
      lastName: row.last_name,
      age: row.age,
      profilePicture: row.profile_picture,
      interests: [],
      photos: []
    },
    interest: row.title,
    description: row.description,
    preferences: {
      genderPreference: row.gender_preference || 'entrambi',
      maxParticipants: row.max_participants || 4,
      maxDistance: row.max_distance || 10,
      timeFrame: row.time_frame || 'Oggi'
    },
    participants: participantsMap[row.id] || [],
    messages: messagesMap[row.id] || [],
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
    `INSERT INTO woops (
      title, description, user_id, is_mock, status,
      max_participants, max_distance, gender_preference, time_frame
    ) VALUES ($1, $2, $3, false, 'searching', $4, $5, $6, $7)
     RETURNING id`,
    [
      title,
      description,
      userId,
      preferences.maxParticipants,
      preferences.maxDistance,
      preferences.genderPreference,
      preferences.timeFrame
    ]
  );

  const woopId = result.rows[0].id;

  await db.query(
    `INSERT INTO participants (woop_id, user_id) VALUES ($1, $2)`,
    [woopId, userId]
  );

  return woopId;
}

// ✅ ELIMINA UN WOOP
export async function deleteWoop(woop_id: number): Promise<void> {
  await db.query(`DELETE FROM participants WHERE woop_id = $1`, [woop_id]);
  await db.query(`DELETE FROM messages WHERE woop_id = $1`, [woop_id]);
  await db.query(`DELETE FROM woops WHERE id = $1`, [woop_id]);
}
