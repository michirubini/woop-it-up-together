import express = require("express");
import bcrypt = require("bcrypt");
import jwt = require("jsonwebtoken");
import db = require("../db");

const router = express.Router();
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

// ✅ REGISTER endpoint completo
router.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    age,
    gender, // 🆕
    email,
    password,
    bio,
    interests, // Array di nomi attività (es. ["Padel", "Aperitivo"])
    availability,
    profilePicture,
    photos
  } = req.body;

  if (!firstName || !lastName || !age || !email || !password || !gender) {
    return res.status(400).json({ error: "Campi obbligatori mancanti." });
  }

  if (!['maschio', 'femmina'].includes(gender)) {
    return res.status(400).json({ error: "Genere non valido (usa 'maschio' o 'femmina')." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Crea l’utente
    const result = await db.query(
      `INSERT INTO users 
        (first_name, last_name, age, gender, email, password, bio, availability, profile_picture, photos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, first_name, last_name, age, gender, email, bio, availability, profile_picture, photos`,
      [
        firstName,
        lastName,
        age,
        gender,
        email,
        hashedPassword,
        bio || null,
        availability || {},
        profilePicture || null,
        photos || []
      ]
    );

    const user = result.rows[0];
    const userId = user.id;

if (Array.isArray(interests) && interests.length > 0) {
  const normalizedInterests = interests
    .map(i => i.trim().toLowerCase())
    .filter((value, index, self) => value && self.indexOf(value) === index); // ✅ filtra duplicati e vuoti

  await db.query(`
    INSERT INTO user_activities (user_id, activity_id)
    SELECT $1, a.id
    FROM activities a
    WHERE LOWER(a.name) = ANY($2::text[])
  `, [userId, normalizedInterests]);
}




    res.status(201).json({
      message: "Utente registrato con successo.",
      user
    });
  } catch (err) {
    console.error("❌ Errore durante la registrazione:", err);
    res.status(500).json({ error: "Errore interno durante la registrazione." });
  }
});

// ✅ LOGIN endpoint con JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e password obbligatorie." });
  }

  try {
    const result = await db.query(`
      SELECT 
        id,
        first_name AS "firstName",
        last_name AS "lastName",
        age,
        gender, -- 🆕
        email,
        password,
        bio,
        availability,
        profile_picture AS "profilePicture",
        photos,
        rating,
        badges
      FROM users
      WHERE email = $1
    `, [email]);

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Utente non trovato." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Password non corretta." });

    delete user.password;

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login riuscito",
      token,
      user
    });
  } catch (err) {
    console.error("❌ Errore nel login:", err);
    res.status(500).json({ error: "Errore interno" });
  }
});

export = router;
