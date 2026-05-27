import crypto from 'node:crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail, findUserById, getJdbcUrl, listUsers } from '../db/h2Client.js';

const router = express.Router();
const sessions = new Map();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function validateCredentials({ email, password }) {
  if (!email || !password) {
    return 'Email y contrasena son obligatorios';
  }
  if (!EMAIL_RE.test(email)) {
    return 'Introduce un email valido';
  }
  return null;
}

function getBearerToken(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

function maskHash(passwordHash) {
  if (!passwordHash) return null;
  return `${passwordHash.slice(0, 7)}...${passwordHash.slice(-6)}`;
}

router.post('/register', async (req, res, next) => {
  try {
    console.log('POST /api/auth/register recibido');
    const name = req.body?.name?.trim();
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contrasena son obligatorios' });
    }
    if (name.length > 100) {
      return res.status(400).json({ error: 'El nombre no puede superar 100 caracteres' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Introduce un email valido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contrasena debe tener al menos 6 caracteres' });
    }

    console.log(`Consultando email en USERS: ${email}`);
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    console.log(`Generando hash bcrypt para: ${email}`);
    const passwordHash = await bcrypt.hash(password, 12);
    let user;

    try {
      console.log(`Ejecutando INSERT real en USERS: ${email}`);
      user = await createUser({ name, email, passwordHash });
      console.log(`Usuario insertado en USERS: ${email}`);
    } catch (insertError) {
      console.error(`Error al insertar usuario en H2 (${email}):`, insertError);
      throw insertError;
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user.id);

    res.status(201).json({ token, user: cleanUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();
    const password = req.body?.password;
    const validationError = validateCredentials({ email, password });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const user = await findUserByEmail(email);
    const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user) {
      return res.status(401).json({ error: 'No existe una cuenta con ese email' });
    }

    if (!passwordOk) {
      return res.status(401).json({ error: 'La contrasena es incorrecta' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user.id);

    res.json({ token, user: cleanUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    const userId = token ? sessions.get(token) : null;

    if (!userId) {
      return res.status(401).json({ error: 'Sesion no iniciada' });
    }

    const user = await findUserById(userId);
    if (!user) {
      sessions.delete(token);
      return res.status(401).json({ error: 'Sesion no valida' });
    }

    res.json({ user: cleanUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  const token = getBearerToken(req);
  if (token) sessions.delete(token);
  res.json({ ok: true });
});

router.get('/debug/users', async (req, res, next) => {
  try {
    const users = await listUsers();

    res.json({
      jdbcUrl: getJdbcUrl(),
      table: 'USERS',
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHashPreview: maskHash(user.passwordHash),
        createdAt: user.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
