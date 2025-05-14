// FILE: scripts/cleanupMockUsers.ts
import db = require('../db');

const emails = ['marco@test.it', 'luca@demo.it', 'giulia@example.it'];

async function cleanupMockUsers() {
  for (const email of emails) {
    try {
      const res = await db.query(`SELECT id FROM users WHERE email = $1`, [email]);
      const userId = res.rows[0]?.id;

      if (!userId) {
        console.warn(`⚠️ Utente ${email} non trovato, salto...`);
        continue;
      }

      // 1. Rimuove partecipazioni
      await db.query(`DELETE FROM participants WHERE user_id = $1`, [userId]);

      // 2. Rimuove l'utente
      await db.query(`DELETE FROM users WHERE id = $1`, [userId]);

      console.log(`🧹 Utente ${email} e relative partecipazioni rimosse`);
    } catch (err) {
      console.error(`❌ Errore rimuovendo ${email}:`, err);
    }
  }

  await db.end();
}

cleanupMockUsers();
