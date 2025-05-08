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
        rating, 
        badges
      FROM users
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Errore nel recupero utenti:", err);
    res.status(500).json({ error: "Errore interno nel recupero utenti" });
  }
});

export = router;
