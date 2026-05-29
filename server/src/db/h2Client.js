import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..', '..');
const h2JarPath = path.join(serverRoot, 'h2.jar');
const bridgeSourcePath = path.join(__dirname, 'H2AuthBridge.java');
const bridgeClassPath = path.join(__dirname, 'H2AuthBridge.class');
const dbDir = path.join(serverRoot, 'data');
const dbFile = path.join(dbDir, 'cvcomillas').replaceAll('\\', '/');
const jdbcUrl = `jdbc:h2:file:${dbFile};AUTO_SERVER=TRUE;DATABASE_TO_UPPER=false`;
const jsonDbPath = path.join(dbDir, 'users.json');
let jdbcUrlLogged = false;

// ── Fallback JSON store (usado cuando Java no está disponible) ────────────────

async function readJsonDb() {
  try {
    const raw = await fs.readFile(jsonDbPath, 'utf8');
    const db = JSON.parse(raw);
    return {
      users: db.users || [],
      nextId: db.nextId || 1,
      applications: db.applications || [],
      nextApplicationId: db.nextApplicationId || 1,
    };
  } catch {
    return { users: [], nextId: 1, applications: [], nextApplicationId: 1 };
  }
}

async function writeJsonDb(db) {
  await fs.mkdir(dbDir, { recursive: true });
  await fs.writeFile(jsonDbPath, JSON.stringify(db, null, 2), 'utf8');
}

// ── H2 bridge ────────────────────────────────────────────────────────────────

let readyPromise;
let useJsonFallback = false;

async function ensureBridge() {
  await fs.access(h2JarPath);
  const [sourceStat, classStat] = await Promise.all([
    fs.stat(bridgeSourcePath),
    fs.stat(bridgeClassPath).catch(() => null),
  ]);
  if (!classStat || classStat.mtimeMs < sourceStat.mtimeMs) {
    await execFileAsync('javac', ['-cp', h2JarPath, bridgeSourcePath], {
      cwd: serverRoot,
      windowsHide: true,
    });
  }
}

async function runBridge(command, args = []) {
  await fs.mkdir(dbDir, { recursive: true });
  await ensureBridge();
  const { stdout, stderr } = await execFileAsync(
    'java',
    ['-Dfile.encoding=UTF-8', '-cp', `${h2JarPath}${path.delimiter}${__dirname}`, 'H2AuthBridge', command, jdbcUrl, ...args],
    { cwd: serverRoot, windowsHide: true, maxBuffer: 1024 * 1024 }
  );
  if (stderr.trim()) console.warn(stderr.trim());
  const output = stdout.trim();
  return output ? JSON.parse(output) : null;
}

// ── Migración JSON → H2 ───────────────────────────────────────────────────────

async function migrateJsonApplicationsToH2() {
  try {
    const db = await readJsonDb();
    const apps = db.applications || [];
    for (const app of apps) {
      if (!app || !app.offerId || !app.userId) continue;
      try {
        await runBridge('migrateApplication', [
          String(app.userId),
          app.offerId,
          app.status || 'enviada',
          app.createdAt || new Date().toISOString(),
          app.updatedAt || new Date().toISOString(),
        ]);
      } catch (_) {
        // duplicate or parse error — already migrated or invalid row
      }
    }
  } catch (_) {
    // users.json missing or unreadable — nothing to migrate
  }
}

// ── API pública ───────────────────────────────────────────────────────────────

export function initDatabase() {
  if (!jdbcUrlLogged) {
    console.log(`JDBC URL usada por backend: ${jdbcUrl}`);
    jdbcUrlLogged = true;
  }
  readyPromise ??= runBridge('init')
    .then(() => migrateJsonApplicationsToH2())
    .catch(err => {
      useJsonFallback = true;
      console.warn('Java no disponible, usando almacén JSON en data/users.json:', err.message);
      return null;
    });
  return readyPromise;
}

export function getJdbcUrl() { return jdbcUrl; }

export function getDatabaseInfo() {
  return {
    provider: useJsonFallback ? 'json-fallback' : 'h2',
    jdbcUrl: useJsonFallback ? null : jdbcUrl,
  };
}

export async function findUserByEmail(email) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return db.users.find(u => u.email === email) || null;
  }
  return runBridge('findByEmail', [email]);
}

export async function findUserById(id) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return db.users.find(u => u.id === Number(id)) || null;
  }
  return runBridge('findById', [String(id)]);
}

export async function createUser({ name, email, passwordHash }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    if (db.users.find(u => u.email === email)) {
      throw new Error('El email ya está registrado');
    }
    const user = { id: db.nextId++, name, email, passwordHash };
    db.users.push(user);
    await writeJsonDb(db);
    return user;
  }
  return runBridge('createUser', [name, email, passwordHash]);
}

export async function listUsers() {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return db.users;
  }
  return runBridge('listUsers');
}

const APPLICATION_PHASES = ['enviada', 'revision', 'entrevista', 'aceptada', 'finalizada'];

export async function listApplicationsByUser(userId) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return db.applications
      .filter(app => app.userId === Number(userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return runBridge('listApplications', [String(userId)]);
}

export async function createApplication({ userId, offerId }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const existing = db.applications.find(app => app.userId === Number(userId) && app.offerId === offerId);
    if (existing) {
      if (existing.status === 'guardada') {
        existing.status = 'enviada';
        existing.updatedAt = new Date().toISOString();
        await writeJsonDb(db);
      }
      return existing;
    }
    const now = new Date().toISOString();
    const application = {
      id: db.nextApplicationId++,
      userId: Number(userId),
      offerId,
      status: 'enviada',
      createdAt: now,
      updatedAt: now,
    };
    db.applications.push(application);
    await writeJsonDb(db);
    return application;
  }
  const result = await runBridge('createApplication', [String(userId), offerId]);
  if (!result) throw new Error('La base de datos no devolvió la candidatura creada');
  return result;
}

export async function saveApplication({ userId, offerId }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const existing = db.applications.find(app => app.userId === Number(userId) && app.offerId === offerId);
    if (existing) return existing;
    const now = new Date().toISOString();
    const application = {
      id: db.nextApplicationId++,
      userId: Number(userId),
      offerId,
      status: 'guardada',
      createdAt: now,
      updatedAt: now,
    };
    db.applications.push(application);
    await writeJsonDb(db);
    return application;
  }
  const result = await runBridge('saveApplication', [String(userId), offerId]);
  if (!result) throw new Error('La base de datos no devolvió la candidatura guardada');
  return result;
}

export async function advanceApplication({ userId, applicationId }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const application = db.applications.find(app => app.userId === Number(userId) && app.id === Number(applicationId));
    if (!application) return null;
    const currentIndex = APPLICATION_PHASES.indexOf(application.status);
    application.status = APPLICATION_PHASES[Math.min(currentIndex + 1, APPLICATION_PHASES.length - 1)];
    application.updatedAt = new Date().toISOString();
    await writeJsonDb(db);
    return application;
  }
  return runBridge('advanceApplication', [String(applicationId), String(userId)]);
}

export async function rejectApplication({ userId, applicationId }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const application = db.applications.find(app => app.userId === Number(userId) && app.id === Number(applicationId));
    if (!application) return null;
    application.status = 'rechazada';
    application.updatedAt = new Date().toISOString();
    await writeJsonDb(db);
    return application;
  }
  return runBridge('rejectApplication', [String(applicationId), String(userId)]);
}
