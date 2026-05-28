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
    return JSON.parse(raw);
  } catch {
    return { users: [], nextId: 1 };
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

// ── API pública ───────────────────────────────────────────────────────────────

export function initDatabase() {
  if (!jdbcUrlLogged) {
    console.log(`JDBC URL usada por backend: ${jdbcUrl}`);
    jdbcUrlLogged = true;
  }
  readyPromise ??= runBridge('init').catch(err => {
    useJsonFallback = true;
    console.warn('Java no disponible, usando almacén JSON en data/users.json:', err.message);
    return null;
  });
  return readyPromise;
}

export function getJdbcUrl() { return jdbcUrl; }

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
