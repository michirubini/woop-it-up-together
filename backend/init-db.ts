import db = require("./db");

async function createTables() {
  // 🔍 Stampa il nome del database attivo
  const result = await db.query('SELECT current_database();');
  console.log("🎯 Database attivo:", result.rows[0].current_database);

  // ❌ Elimina le tabelle se esistono (attenzione: cancella anche i dati!)
  await db.query(`DROP TABLE IF EXISTS messages CASCADE;`);
  await db.query(`DROP TABLE IF EXISTS ratings CASCADE;`);
  await db.query(`DROP TABLE IF EXISTS participants CASCADE;`);
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
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // ✅ Nuove tabelle per funzionalità mancanti
  await db.query(`
    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      woop_id INTEGER REFERENCES woops(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE ratings (
      id SERIAL PRIMARY KEY,
      from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      woop_id INTEGER REFERENCES woops(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      badges TEXT[]
    );
  `);

  await db.query(`
    CREATE TABLE participants (
      id SERIAL PRIMARY KEY,
      woop_id INTEGER REFERENCES woops(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ Tabelle ricreate con successo.");
  await db.end();
}

createTables().catch((err) => {
  console.error("❌ Errore durante la creazione delle tabelle:", err);
});
