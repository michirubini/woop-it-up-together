import db = require("./db");

async function createTables() {
  // ❌ Elimina le tabelle se esistono (attenzione: cancella anche i dati!)
  await db.query(`DROP TABLE IF EXISTS woops CASCADE;`);
  await db.query(`DROP TABLE IF EXISTS users CASCADE;`);

  // ✅ Ricrea la tabella users
  await db.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      bio TEXT,
      interests TEXT[],
      availability JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // ✅ Ricrea la tabella woops
  await db.query(`
    CREATE TABLE woops (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Tabelle ricreate con successo.");
  await db.end();
}

createTables().catch((err) => {
  console.error("❌ Errore durante la creazione delle tabelle:", err);
});
