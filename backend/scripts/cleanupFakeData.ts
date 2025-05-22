// scripts/cleanupFakeData.ts
import db = require("../db");

async function cleanupFakeData() {
  try {
    // Elimina partecipanti dei Woop finti (modifica il criterio se serve)
    await db.query(`
      DELETE FROM participants WHERE woop_id IN (
        SELECT id FROM woops WHERE is_mock = true OR title IN ('Tennis', 'Calcetto')
      );
    `);

    // Elimina messaggi dei Woop finti
    await db.query(`
      DELETE FROM messages WHERE woop_id IN (
        SELECT id FROM woops WHERE is_mock = true OR title IN ('Tennis', 'Calcetto')
      );
    `);

    // Elimina i Woop finti
    await db.query(`
      DELETE FROM woops WHERE is_mock = true OR title IN ('Tennis', 'Calcetto');
    `);

    // Elimina utenti finti (occhio ai nomi)
    await db.query(`
      DELETE FROM users WHERE first_name IN ('Marco', 'Luca', 'Giulia', 'Linda');
    `);

    console.log("✅ Dati fake rimossi dal database!");
    await db.end();
  } catch (error) {
    console.error("❌ Errore nella pulizia:", error);
  }
}

cleanupFakeData();
