import express = require("express");
import bcrypt = require("bcrypt");
import db = require("../db");

const router = express.Router();

// ✅ REGISTER endpoint
router.post("/register", async (req: any, res: any) => {
  const {
    firstName,
    lastName,
    age,
    email,
    password,
    bio,
    interests,
    availability
  } = req.body;

  if (!firstName || !lastName || !age || !email || !password) {
    return res.status(400).json({ error: "Campi obbligatori mancanti." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users 
        (first_name, last_name, age, email, password, bio, interests, availability)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        firstName,
        lastName,
        age,
        email,
        hashedPassword,
        bio || null,
        interests || [],
        availability || {}
      ]
    );

    res.status(201).json({ message: "Utente registrato con successo." });
  } catch (err) {
    console.error("❌ Errore durante la registrazione:", err);
    res.status(400).json({ error: "Errore durante la registrazione." });
  }
});

// ✅ LOGIN endpoint (fuori dal blocco di /register)
router.post("/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email e password obbligatorie." });
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Utente non trovato." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Password non corretta." });
    }

    res.status(200).json({
      message: "Login riuscito",
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Errore nel login:", err);
    res.status(500).json({ error: "Errore interno" });
  }
});

export = router;



