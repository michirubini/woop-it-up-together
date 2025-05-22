import { Router } from "express";
import db from "../db";

const router = Router();

// GET /api/community-ideas - tutte le idee della community
router.get("/", async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT ci.*, u.first_name, u.last_name, u.profile_picture 
       FROM community_ideas ci
       JOIN users u ON ci.user_id = u.id
       ORDER BY ci.created_at DESC`
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ Errore recupero idee:", err);
    res.status(500).json({ error: "Errore nel recupero delle idee" });
  }
});

// POST /api/community-ideas - aggiungi una nuova idea
router.post("/", async (req, res) => {
  const { title, description, user_id } = req.body;
  if (!title || !description || !user_id) {
    return res.status(400).json({ error: "title, description e user_id sono richiesti" });
  }

  try {
    const result = await db.query(
      `INSERT INTO community_ideas (title, description, user_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Errore creazione idea:", err);
    res.status(400).json({ error: "Errore durante la creazione dell'idea" });
  }
});

export default router;
