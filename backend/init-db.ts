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

  // 🔧 Aggiunta colonne utenti (se mancanti)
  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE users ADD COLUMN IF NOT EXISTS rating REAL;
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE users ADD COLUMN IF NOT EXISTS badges TEXT[];
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE users ADD COLUMN IF NOT EXISTS photos TEXT[];
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

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
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // ✅ AGGIUNGIAMO is_mock SOLO SE NON ESISTE
  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE woops ADD COLUMN IF NOT EXISTS is_mock BOOLEAN DEFAULT false;
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  // ✅ AGGIUNGIAMO LE NUOVE COLONNE
  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE woops ADD COLUMN IF NOT EXISTS max_participants INTEGER;
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE woops ADD COLUMN IF NOT EXISTS max_distance INTEGER;
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE woops ADD COLUMN IF NOT EXISTS gender_preference VARCHAR(10);
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  await db.query(`DO $$ BEGIN
    BEGIN ALTER TABLE woops ADD COLUMN IF NOT EXISTS time_frame TEXT;
    EXCEPTION WHEN duplicate_column THEN END;
  END $$;`);

  // 💬 MESSAGES
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      woop_id BIGINT REFERENCES woops(id) ON DELETE CASCADE,
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
      woop_id BIGINT REFERENCES woops(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      comment TEXT,
      badges TEXT[]
    );
  `);

  // 👥 PARTICIPANTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS participants (
      id SERIAL PRIMARY KEY,
      woop_id BIGINT REFERENCES woops(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 🤝 MATCH REQUESTS
  await db.query(`
    CREATE TABLE IF NOT EXISTS match_requests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity VARCHAR(100) NOT NULL,
      level VARCHAR(20) CHECK (level IN ('principiante', 'intermedio', 'esperto')) NOT NULL,
      gender VARCHAR(10) CHECK (gender IN ('maschio', 'femmina', 'entrambi')) NOT NULL,
      max_participants INTEGER NOT NULL,
      radius_km INTEGER NOT NULL,
      latitude DECIMAL(9,6) NOT NULL,
      longitude DECIMAL(9,6) NOT NULL,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'matched')),
      woop_id INTEGER REFERENCES woops(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ Tabelle verificate o create con successo.");
  await db.end();
}

createTablesSafely().catch((err) => {
  console.error("❌ Errore nella creazione delle tabelle:", err);
});
