import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..', '..');
const dbDir = path.join(serverRoot, 'data');
const jsonDbPath = path.join(dbDir, 'users.json');
const databaseUrl = process.env.DATABASE_URL || '';

let pool;
let readyPromise;
let usingJsonFallback = false;

function shouldUseSsl(connectionString) {
  if (process.env.PGSSLMODE === 'disable') return false;
  if (process.env.PGSSL === 'false') return false;
  return !/localhost|127\.0\.0\.1/.test(connectionString);
}

function getPool() {
  if (!databaseUrl) return null;
  pool ??= new Pool({
    connectionString: databaseUrl,
    ssl: shouldUseSsl(databaseUrl) ? { rejectUnauthorized: false } : false,
  });
  return pool;
}

async function query(sql, params = []) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error('DATABASE_URL no configurada');
  }
  return activePool.query(sql, params);
}

async function readJsonDb() {
  try {
    const raw = await fs.readFile(jsonDbPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { users: [], nextId: 1 };
  }
}

async function writeJsonDb(db) {
  await fs.mkdir(dbDir, { recursive: true });
  await fs.writeFile(jsonDbPath, JSON.stringify(db, null, 2), 'utf8');
}

function mapUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export function initDatabase() {
  readyPromise ??= (async () => {
    if (!databaseUrl) {
      usingJsonFallback = true;
      console.warn('DATABASE_URL no configurada. Usando data/users.json solo para desarrollo local.');
      return null;
    }

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    console.log('Base de datos PostgreSQL conectada.');
    return null;
  })();

  return readyPromise;
}

export function getDatabaseInfo() {
  if (!databaseUrl) {
    return {
      provider: 'json-fallback',
      databaseUrl: null,
    };
  }

  let host = 'postgres';
  try {
    host = new URL(databaseUrl).host;
  } catch {
    host = 'postgres';
  }

  return {
    provider: 'postgres',
    host,
    ssl: shouldUseSsl(databaseUrl),
  };
}

export async function findUserByEmail(email) {
  await initDatabase();
  if (usingJsonFallback) {
    const db = await readJsonDb();
    return db.users.find(u => u.email === email) || null;
  }

  const result = await query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1',
    [email]
  );
  return mapUser(result.rows[0]);
}

export async function findUserById(id) {
  await initDatabase();
  if (usingJsonFallback) {
    const db = await readJsonDb();
    return db.users.find(u => u.id === Number(id)) || null;
  }

  const result = await query(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE id = $1',
    [id]
  );
  return mapUser(result.rows[0]);
}

export async function createUser({ name, email, passwordHash }) {
  await initDatabase();
  if (usingJsonFallback) {
    const db = await readJsonDb();
    if (db.users.find(u => u.email === email)) {
      throw new Error('El email ya esta registrado');
    }
    const user = { id: db.nextId++, name, email, passwordHash, createdAt: new Date().toISOString() };
    db.users.push(user);
    await writeJsonDb(db);
    return user;
  }

  try {
    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, password_hash, created_at`,
      [name, email, passwordHash]
    );
    return mapUser(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('El email ya esta registrado');
    }
    throw error;
  }
}

export async function listUsers() {
  await initDatabase();
  if (usingJsonFallback) {
    const db = await readJsonDb();
    return db.users;
  }

  const result = await query(
    'SELECT id, name, email, password_hash, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows.map(mapUser);
}
