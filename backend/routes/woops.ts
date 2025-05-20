import express = require("express");
import db = require("../db");

const router = express.Router();

// GET /api/woops
router.get("/woops", async (_req: any, res: any) => {
  try {
    // 👇 Mostra solo Woop reali (mock esclusi)
    const result = await db.query(`
      SELECT * FROM woops
      WHERE is_mock = false
      ORDER BY created_at DESC
    `);
    res.status(200).json({ woops: result.rows });
  } catch (err) {
    console.error("❌ Errore recupero Woops:", err);
    res.status(500).json({ error: "Errore nel recupero dei Woops" });
  }
});

// POST /api/woops
router.post("/woops", async (req: any, res: any) => {
  const { title, description, user_id } = req.body;

  try {
    await db.query(
      `INSERT INTO woops (title, description, user_id, is_mock)
       VALUES ($1, $2, $3, false)`, // 👈 Ogni nuovo woop è reale
      [title, description, user_id]
    );
    res.status(201).json({ message: "Woop creato" });
  } catch (err) {
    console.error("❌ Errore creazione Woop:", err);
    res.status(400).json({ error: "Errore durante la creazione del woop" });
  }
});

export = router;

