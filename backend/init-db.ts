const { db: database } = require("./db");

async function createTables() {
  // 1. Tabella utenti
  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // 2. Tabella woops con riferimento a users
  await database.query(`
    CREATE TABLE IF NOT EXISTS woops (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Tabelle users e woops create con successo.");
  await database.end();
}

createTables().catch((err) => {
  console.error("❌ Errore durante la creazione delle tabelle:", err);
});
