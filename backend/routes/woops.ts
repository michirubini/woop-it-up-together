import { Router } from "express";
import db from "../db";

const router = Router();

// GET /api/woops - Recupera tutti i Woop reali (no mock)
router.get("/", async (_req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM woops
      WHERE (is_mock = false OR is_mock IS NULL)
      AND user_id IS NOT NULL
      ORDER BY created_at DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Errore recupero Woops:", err);
    res.status(500).json({ error: "Errore nel recupero dei Woops" });
  }
});

// POST /api/woops - Crea un nuovo Woop reale
router.post("/", async (req, res) => {
  const { title, description, user_id, userId } = req.body;
  const finalUserId = user_id || userId;

  if (!title || !description || !finalUserId) {
    return res.status(400).json({ error: 'title, description e user_id sono richiesti' });
  }

  try {
    const result = await db.query(
      `INSERT INTO woops (title, description, user_id, is_mock)
       VALUES ($1, $2, $3, false)
       RETURNING *`,
      [title, description, finalUserId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Errore creazione Woop:", err);
    res.status(400).json({ error: "Errore durante la creazione del Woop" });
  }
});

export default router;

