import express = require("express");
import db = require("../db");

const router = express.Router();

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, 
        first_name AS "firstName", 
        last_name AS "lastName", 
        age, 
        email, 
        bio, 
        interests, 
        availability, 
        profile_picture AS "profilePicture",  -- ✅ aggiunto
        photos,                               -- ✅ aggiunto
        rating, 
        badges
      FROM users
    `);

    res.status(200).json({ users: result.rows });
  } catch (err: any) {
    console.error("❌ Errore nel recupero utenti:", err.message);
    res.status(500).json({ error: "Errore interno nel recupero utenti" });
  }

});

// PATCH /api/users/:id/photo
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

export = router;

