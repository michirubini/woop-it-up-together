import express from "express";
import db from "../db";
import authMiddleware from "../middleware/auth"; // ✅ percorso corretto

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

    // 2. Cerca una richiesta compatibile
    const pendingMatches = await db.query(
      `SELECT * FROM match_requests
       WHERE status = 'pending'
       AND user_id != $1
       AND activity = $2
       AND level = $3
       AND (gender = $4 OR gender = 'entrambi')
       AND max_participants = $5`,
      [userId, activity, level, gender, max_participants]
    );

    const compatible = pendingMatches.rows.find(r => {
      const distance = getDistanceKm(latitude, longitude, r.latitude, r.longitude);
      return distance <= Math.min(radius_km, r.radius_km);
    });

    // 3. Se trova match compatibile → crea woop con is_mock = false
    if (compatible) {
      const woopRes = await db.query(
        `INSERT INTO woops (title, description, user_id, is_mock)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`[AUTO] ${activity}`, `Match automatico per ${activity}`, userId, false]
      );
      const woopId = woopRes.rows[0].id;

      // 4. Inserisci entrambi nei partecipanti
      await db.query(
        `INSERT INTO participants (woop_id, user_id) VALUES ($1, $2), ($1, $3)`,
        [woopId, userId, compatible.user_id]
      );

      // 5. Aggiorna stato delle match_requests
      await db.query(
        `UPDATE match_requests SET status = 'matched', woop_id = $1 WHERE id IN ($2, $3)`,
        [woopId, newRequest.id, compatible.id]
      );

      return res.status(201).json({ matched: true, woopId });
    }

    // Nessun match per ora
    res.status(201).json({ matched: false, requestId: newRequest.id });

  } catch (err) {
    console.error("❌ Errore durante il match automatico:", err);
    res.status(500).json({ error: "Errore interno" });
  }
});

export default router;


