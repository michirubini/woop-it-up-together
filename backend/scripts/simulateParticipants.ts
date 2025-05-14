// scripts/simulateParticipants.ts
import db = require('../db');

const woopId = 1; // SOSTITUISCI con l’ID reale del tuo Woop nel DB

const userEmails = ['marco@test.it', 'luca@demo.it', 'giulia@example.it'];

async function simulateParticipants() {
  for (const email of userEmails) {
    try {
      const res = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
      const userId = res.rows[0]?.id;

      if (!userId) {
        console.warn(`⚠️ Utente con email ${email} non trovato, salto...`);
        continue;
      }

      await db.query(
        `INSERT INTO participants (woop_id, user_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [woopId, userId]
      );

      console.log(`✅ Utente ${email} aggiunto al Woop ${woopId}`);
    } catch (err) {
      console.error(`❌ Errore aggiungendo utente ${email}:`, err);
    }
  }

  await db.end();
}

simulateParticipants();


