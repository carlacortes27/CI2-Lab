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
      notifications: db.notifications || [],
      nextNotificationId: db.nextNotificationId || 1,
    };
  } catch {
    return { users: [], nextId: 1, applications: [], nextApplicationId: 1, notifications: [], nextNotificationId: 1 };
  }
}

async function writeJsonDb(db) {
  await fs.mkdir(dbDir, { recursive: true });
  await fs.writeFile(jsonDbPath, JSON.stringify(db, null, 2), 'utf8');
}

// ── H2 bridge ────────────────────────────────────────────────────────────────

let readyPromise;
let useJsonFallback = false;
let bridgeQueue = Promise.resolve();
const userByIdCache = new Map();
const userByEmailCache = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cacheUser(user) {
  if (!user) return user;
  userByIdCache.set(Number(user.id), user);
  if (user.email) userByEmailCache.set(user.email.toLowerCase(), user);
  return user;
}

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

function isH2LockRace(error) {
  const message = `${error?.message || ''}\n${error?.stderr || ''}`;
  return message.includes('Lock file recently modified') || message.includes('[8000-232]');
}

async function runBridgeProcess(command, args = []) {
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

async function runBridge(command, args = []) {
  const operation = bridgeQueue.then(async () => {
    const delays = [150, 300, 600, 1000, 1500];
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        return await runBridgeProcess(command, args);
      } catch (err) {
        if (!isH2LockRace(err) || attempt === delays.length) {
          throw err;
        }
        await sleep(delays[attempt]);
      }
    }
    return null;
  });

  bridgeQueue = operation.catch(() => null);
  return operation;
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
  const cacheKey = email?.toLowerCase();
  if (cacheKey && userByEmailCache.has(cacheKey)) {
    return userByEmailCache.get(cacheKey);
  }
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return cacheUser(db.users.find(u => u.email === email) || null);
  }
  return cacheUser(await runBridge('findByEmail', [email]));
}

export async function findUserById(id) {
  const cacheKey = Number(id);
  if (userByIdCache.has(cacheKey)) {
    return userByIdCache.get(cacheKey);
  }
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return cacheUser(db.users.find(u => u.id === Number(id)) || null);
  }
  return cacheUser(await runBridge('findById', [String(id)]));
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
    return cacheUser(user);
  }
  return cacheUser(await runBridge('createUser', [name, email, passwordHash]));
}

export async function listUsers() {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    return db.users.map(cacheUser);
  }
  return (await runBridge('listUsers')).map(cacheUser);
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

export async function unsaveApplication({ userId, offerId }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const before = db.applications.length;
    db.applications = db.applications.filter(app => (
      app.userId !== Number(userId) ||
      app.offerId !== offerId ||
      app.status !== 'guardada'
    ));
    if (db.applications.length !== before) {
      await writeJsonDb(db);
    }
    return { ok: true };
  }
  return runBridge('unsaveApplication', [String(userId), offerId]);
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

export async function upsertNotification({
  userId,
  type,
  entityType,
  entityId,
  message,
  expiresAt = null,
  sourceKey,
}) {
  await initDatabase();
  const key = sourceKey || `${userId}:${type}:${entityType}:${entityId}`;

  if (useJsonFallback) {
    const db = await readJsonDb();
    const existing = db.notifications.find(item => item.sourceKey === key);
    const now = new Date().toISOString();
    if (existing) {
      existing.message = message;
      existing.expiresAt = expiresAt;
      existing.deletedAt = null;
      await writeJsonDb(db);
      return existing;
    }

    const notification = {
      id: db.nextNotificationId++,
      userId: Number(userId),
      type,
      entityType,
      entityId,
      message,
      isRead: false,
      createdAt: now,
      expiresAt,
      deletedAt: null,
      sourceKey: key,
    };
    db.notifications.push(notification);
    await writeJsonDb(db);
    return notification;
  }

  return runBridge('upsertNotification', [
    String(userId),
    type,
    entityType,
    String(entityId),
    message,
    expiresAt || '',
    key,
  ]);
}

export async function listNotificationsByUser(userId, limit = 10) {
  await initDatabase();
  await softDeleteOldNotifications(userId);

  if (useJsonFallback) {
    const db = await readJsonDb();
    const now = Date.now();
    return db.notifications
      .filter(item => item.userId === Number(userId))
      .filter(item => !item.deletedAt)
      .filter(item => !item.expiresAt || new Date(item.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  return runBridge('listNotifications', [String(userId), String(limit)]);
}

export async function markNotificationRead({ userId, notificationId }) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const notification = db.notifications.find(item => item.userId === Number(userId) && item.id === Number(notificationId));
    if (!notification) return null;
    notification.isRead = true;
    await writeJsonDb(db);
    return notification;
  }
  return runBridge('markNotificationRead', [String(notificationId), String(userId)]);
}

export async function markAllNotificationsRead(userId) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    db.notifications
      .filter(item => item.userId === Number(userId) && !item.deletedAt)
      .forEach(item => {
        item.isRead = true;
      });
    await writeJsonDb(db);
    return { ok: true };
  }
  return runBridge('markAllNotificationsRead', [String(userId)]);
}

export async function softDeleteOldNotifications(userId) {
  await initDatabase();
  if (useJsonFallback) {
    const db = await readJsonDb();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const now = new Date().toISOString();
    db.notifications
      .filter(item => item.userId === Number(userId))
      .filter(item => !item.deletedAt)
      .filter(item => new Date(item.createdAt).getTime() < cutoff)
      .forEach(item => {
        item.deletedAt = now;
      });
    await writeJsonDb(db);
    return { ok: true };
  }
  return runBridge('softDeleteOldNotifications', [String(userId)]);
}
