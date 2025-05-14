// scripts/mockUsers.ts
import db = require('../db');

const users = [
  {
    firstName: 'Marco',
    lastName: 'Rossi',
    age: 28,
    email: 'marco@test.it',
    password: '1234'
  },
  {
    firstName: 'Luca',
    lastName: 'Verdi',
    age: 32,
    email: 'luca@demo.it',
    password: '1234'
  },
  {
    firstName: 'Giulia',
    lastName: 'Bianchi',
    age: 25,
    email: 'giulia@example.it',
    password: '1234'
  }
];

async function createMockUsers() {
  for (const user of users) {
    try {
      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );
      if (existing.rows.length > 0) {
        console.log(`ℹ️ Utente ${user.email} già esistente`);
        continue;
      }

      await db.query(
        `INSERT INTO users (first_name, last_name, age, email, password)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.firstName, user.lastName, user.age, user.email, user.password]
      );

      console.log(`✅ Utente ${user.email} creato`);
    } catch (err) {
      console.error(`❌ Errore creando ${user.email}:`, err);
    }
  }

  await db.end();
}

createMockUsers();

