import express = require("express");
import db = require("../db");

const router = express.Router();

// GET /api/woops
router.get("/woops", async (_req: any, res: any) => {
  try {
    const result = await db.query("SELECT * FROM woops ORDER BY created_at DESC");
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Errore nel recupero dei woops" });
  }
});

// POST /api/woops
router.post("/woops", async (req: any, res: any) => {
  const { title, description, user_id } = req.body;

  try {
    await db.query(
      "INSERT INTO woops (title, description, user_id) VALUES ($1, $2, $3)",
      [title, description, user_id]
    );
    res.status(201).json({ message: "Woop creato" });
  } catch (err) {
    res.status(400).json({ error: "Errore durante la creazione del woop" });
  }
});

export = router;
