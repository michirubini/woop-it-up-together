// ✅ routes/users.ts aggiornato
import express = require("express");
import db = require("../db");
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        u.id, 
        u.first_name AS "firstName", 
        u.last_name AS "lastName", 
        u.age, 
        u.email, 
        u.bio, 
        u.availability, 
        u.profile_picture AS "profilePicture",
        u.photos,
        u.rating,
        u.badges,
        COALESCE(array_agg(a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS interests
      FROM users u
      LEFT JOIN user_activities ua ON u.id = ua.user_id
      LEFT JOIN activities a ON ua.activity_id = a.id
      GROUP BY u.id
    `);

    res.status(200).json({ users: result.rows });
  } catch (err: any) {
    console.error("❌ Errore nel recupero utenti:", err.message);
    res.status(500).json({ error: "Errore interno nel recupero utenti" });
  }
});


// PATCH foto profilo
router.patch("/:id/photo", async (req, res) => {
  const userId = parseInt(req.params.id);
  const { profilePicture, photos } = req.body;

  if (!userId || !profilePicture || !Array.isArray(photos)) {
    return res.status(400).json({ error: "Dati mancanti o non validi" });
  }

  try {
    await db.query(
      `UPDATE users SET profile_picture = $1, photos = $2 WHERE id = $3`,
      [profilePicture, photos, userId]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Errore aggiornamento foto:", err);
    res.status(500).json({ error: "Errore interno aggiornamento foto" });
  }
});

// GET interessi utente
router.get("/:id/interests", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await db.query(`
      SELECT a.name
      FROM user_activities ua
      JOIN activities a ON ua.activity_id = a.id
      WHERE ua.user_id = $1
    `, [userId]);

    res.json({ interests: result.rows.map(r => r.name) });
  } catch (err) {
    console.error("Errore get interests:", err);
    res.status(500).json({ error: "Errore caricamento interessi" });
  }
});

// POST aggiorna interessi utente
router.post("/:id/interests", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { interests } = req.body;

  if (!Array.isArray(interests)) {
    return res.status(400).json({ error: "interests deve essere un array" });
  }

  try {
    await db.query("BEGIN");
    await db.query("DELETE FROM user_activities WHERE user_id = $1", [userId]);
    await db.query(`
      INSERT INTO user_activities (user_id, activity_id)
      SELECT $1, id FROM activities WHERE name = ANY($2)
    `, [userId, interests]);
    await db.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await db.query("ROLLBACK");
    console.error("Errore post interests:", err);
    res.status(500).json({ error: "Errore aggiornamento interessi" });
  }
});

export = router;
