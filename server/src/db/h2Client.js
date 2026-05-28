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
let jdbcUrlLogged = false;

let readyPromise;

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
    ['-cp', `${h2JarPath}${path.delimiter}${__dirname}`, 'H2AuthBridge', command, jdbcUrl, ...args],
    {
      cwd: serverRoot,
      windowsHide: true,
      maxBuffer: 1024 * 1024,
    }
  );

  if (stderr.trim()) {
    console.warn(stderr.trim());
  }

  const output = stdout.trim();
  return output ? JSON.parse(output) : null;
}

let h2Available = true;

export function initDatabase() {
  if (!jdbcUrlLogged) {
    console.log(`JDBC URL usada por backend: ${jdbcUrl}`);
    jdbcUrlLogged = true;
  }
  readyPromise ??= runBridge('init').catch(err => {
    h2Available = false;
    console.warn('H2 no disponible (requiere Java). Auth deshabilitado:', err.message);
    return null;
  });
  return readyPromise;
}

function requireH2() {
  if (!h2Available) throw new Error('Base de datos no disponible (requiere Java instalado)');
}

export function getJdbcUrl() {
  return jdbcUrl;
}

export async function findUserByEmail(email) {
  await initDatabase();
  requireH2();
  return runBridge('findByEmail', [email]);
}

export async function findUserById(id) {
  await initDatabase();
  requireH2();
  return runBridge('findById', [String(id)]);
}

export async function createUser({ name, email, passwordHash }) {
  await initDatabase();
  requireH2();
  return runBridge('createUser', [name, email, passwordHash]);
}

export async function listUsers() {
  await initDatabase();
  requireH2();
  return runBridge('listUsers');
}
