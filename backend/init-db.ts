const { db: database } = require("./db");

async function createTables() {
  await database.query(`
    CREATE TABLE IF NOT EXISTS woops (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Tabelle create con successo.");
  await database.end();
}

createTables().catch((err) => {
  console.error("❌ Errore durante la creazione delle tabelle:", err);
});
