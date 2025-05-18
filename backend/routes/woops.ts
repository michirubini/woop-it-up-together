import express from "express";
import db = require("../db");

const router = express.Router();

/**
 * GET /api/woops
 * Restituisce tutti i Woop, con creator e partecipanti
 */
router.get("/", async (_req, res) => {
  try {
    // Prendi i Woop e i dati base del creator
    const woopRes = await db.query(
      `SELECT w.*, 
              u.id as creator_id, u.first_name, u.last_name, u.age, u.profile_picture
       FROM woops w
       JOIN users u ON u.id = w.user_id
       ORDER BY w.created_at DESC`
    );

    // Prendi i partecipanti
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

    // Mappa per woop_id → partecipanti[]
    const participantsMap: Record<string, any[]> = {};
    participantRes.rows.forEach((row: any) => {
      participantsMap[row.woop_id] = row.participants;
    });

    // Costruisci risposta finale per ogni Woop
    const woops = woopRes.rows.map((row: any) => ({
      id: `woop-${row.id}`,
      creator: {
        id: String(row.creator_id),
        firstName: row.first_name,
        lastName: row.last_name,
        age: row.age,
        profilePicture: row.profile_picture,
        interests: [], // puoi popolare se vuoi
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
      status: row.status
    }));

    res.status(200).json({ woops });
  } catch (err) {
    console.error("Errore GET /api/woops", err);
    res.status(500).json({ error: "Errore nel recupero dei woops" });
  }
});

export default router;
