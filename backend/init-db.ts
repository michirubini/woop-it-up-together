import db = require("./db");

async function createTablesSafely() {
  const result = await db.query("SELECT current_database();");
  console.log("🎯 Database attivo:", result.rows[0].current_database);

  // 👤 USERS
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      bio TEXT,
      interests TEXT[],
      availability JSONB,
      profile_picture TEXT,
      photos TEXT[],
      rating REAL,
      badges TEXT[],
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // 💡 COMMUNITY IDEAS
  await db.query(`
    CREATE TABLE IF NOT EXISTS community_ideas (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // 📅 WOOPS
  await db.query(`
    CREATE TABLE IF NOT EXISTS woops (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // 💬 MESSAGES
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      woop_id INTEGER REFERENCES woops(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT NOW()
    );
  `);

  // ⭐ RATINGS
  await db.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      woop_id INTEGER REFERENCES woops(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      badges TEXT[]
    );
  `);

  // 👥 PARTICIPANTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      woop_id INTEGER REFERENCES woops(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log("✅ Tabelle verificate o create con successo.");
  await db.end();
}

createTablesSafely().catch((err) => {
  console.error("❌ Errore nella creazione delle tabelle:", err);
});
