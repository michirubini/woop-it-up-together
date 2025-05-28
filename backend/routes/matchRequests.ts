import express from "express";
import db from "../db";
import { authenticateToken as authMiddleware } from "../middleware/auth";

const router = express.Router();

// Funzione per calcolare distanza (Haversine)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ✅ Rotta protetta per creare una match request
router.post("/", authMiddleware, async (req, res) => {
  const {
    activity,
    level,
    gender,
    max_participants,
    radius_km,
    latitude,
    longitude
  } = req.body;

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Non autenticato" });

  try {
    // 1. Inserisci nuova richiesta
    const insertRes = await db.query(
      `INSERT INTO match_requests (
        user_id, activity, level, gender, max_participants,
        radius_km, latitude, longitude
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [userId, activity, level, gender, max_participants, radius_km, latitude, longitude]
    );
    const newRequest = insertRes.rows[0];

    // 2. Cerca tutte le richieste compatibili (inclusa la nuova)
    const allPendingMatches = await db.query(
      `SELECT * FROM match_requests
       WHERE status = 'pending'
       AND activity = $1
       AND level = $2
       AND (gender = $3 OR gender = 'entrambi')
       AND max_participants = $4`,
      [activity, level, gender, max_participants]
    );

    const compatible = allPendingMatches.rows.filter(r => {
      const distance = getDistanceKm(latitude, longitude, r.latitude, r.longitude);
      return distance <= Math.min(radius_km, r.radius_km);
    });

    // Rimuove duplicati per user_id
    const uniqueByUser = Array.from(new Map(
      compatible.map(req => [req.user_id, req])
    ).values());

    // Se abbastanza utenti, crea il woop
    if (uniqueByUser.length >= max_participants) {
      const woopRes = await db.query(
        `INSERT INTO woops (
          title, description, user_id, is_mock, status,
          max_participants, max_distance, gender_preference, time_frame
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id`,
        [
          `[AUTO] ${activity}`,
          `Match automatico per ${activity}`,
          userId,
          false,
          'active',
          max_participants,
          radius_km,
          gender,
          'Oggi'
        ]
      );

      const woopId = woopRes.rows[0].id;

      const participantsToInsert = uniqueByUser.slice(0, max_participants);

      // Inserisce partecipanti
      await Promise.all(
        participantsToInsert.map(r =>
          db.query(`INSERT INTO participants (woop_id, user_id) VALUES ($1, $2)`, [woopId, r.user_id])
        )
      );

      // Aggiorna stato delle match_requests
      const matchedIds = participantsToInsert.map(r => r.id);
      await db.query(
        `UPDATE match_requests SET status = 'matched', woop_id = $1 WHERE id = ANY($2::int[])`,
        [woopId, matchedIds]
      );

      return res.status(201).json({ matched: true, woopId });
    }

    // Nessun match completo per ora
    return res.status(201).json({ matched: false, requestId: newRequest.id });
  } catch (err) {
    console.error("❌ Errore durante il match automatico:", err);
    res.status(500).json({ error: "Errore interno" });
  }
});

export default router;
