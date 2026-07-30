import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import session from 'express-session';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3000);
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminEnabled = Boolean(adminUsername && adminPassword && process.env.SESSION_SECRET);
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const passwordHash = adminEnabled ? bcrypt.hashSync(adminPassword, 12) : null;
const directory = path.dirname(fileURLToPath(import.meta.url));
const contentDirectory = path.join(directory, 'data');
const contentFile = path.join(contentDirectory, 'content.json');

app.set('trust proxy', 1);

if (!adminEnabled) {
  console.warn(
    'Yönetici girişi devre dışı: ADMIN_USERNAME, ADMIN_PASSWORD ve SESSION_SECRET ortam değişkenlerini tanımlayın.'
  );
}

app.use(express.json({ limit: '10mb' }));
app.use(session({
  name: 'anindagetir.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.get('/api/auth/me', (request, response) => {
  if (!request.session.admin) return response.status(401).json({ authenticated: false });
  response.json({ authenticated: true, username: request.session.admin });
});

app.post('/api/auth/login', async (request, response) => {
  if (!adminEnabled) {
    return response.status(503).json({ error: 'Yönetici girişi henüz yapılandırılmadı.' });
  }

  const { username, password } = request.body || {};
  const validUser = typeof username === 'string' && username === adminUsername;
  const validPassword = typeof password === 'string' && await bcrypt.compare(password, passwordHash);

  if (!validUser || !validPassword) {
    return response.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }

  request.session.regenerate((error) => {
    if (error) return response.status(500).json({ error: 'Oturum başlatılamadı.' });
    request.session.admin = adminUsername;
    response.json({ authenticated: true, username: adminUsername });
  });
});

app.post('/api/auth/logout', (request, response) => {
  request.session.destroy(() => {
    response.clearCookie('anindagetir.sid');
    response.json({ authenticated: false });
  });
});

async function readContent() {
  try {
    return JSON.parse(await fs.readFile(contentFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

function requireAdmin(request, response, next) {
  if (!request.session.admin) {
    return response.status(401).json({ error: 'Bu işlem için yönetici girişi gereklidir.' });
  }
  next();
}

app.get('/api/content', async (_request, response) => {
  try {
    response.json(await readContent());
  } catch {
    response.status(500).json({ error: 'Site içeriği okunamadı.' });
  }
});

app.put('/api/content', requireAdmin, async (request, response) => {
  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    return response.status(400).json({ error: 'Geçersiz içerik verisi.' });
  }

  try {
    await fs.mkdir(contentDirectory, { recursive: true });
    const temporaryFile = `${contentFile}.${process.pid}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(request.body, null, 2), 'utf8');
    await fs.rename(temporaryFile, contentFile);
    response.json({ saved: true });
  } catch {
    response.status(500).json({ error: 'Site içeriği kaydedilemedi.' });
  }
});

app.delete('/api/content', requireAdmin, async (_request, response) => {
  try {
    await fs.rm(contentFile, { force: true });
    response.json({ cleared: true });
  } catch {
    response.status(500).json({ error: 'Site içeriği sıfırlanamadı.' });
  }
});

const serveApp = (_request, response) => {
  response.sendFile(path.join(directory, 'dist', 'index.html'));
};

app.use((request, response, next) => {
  const isAdminRequest =
    request.path.replace(/\/+$/, '') === '/admin' ||
    request.query.admin === '1';
  if (isAdminRequest) response.set('X-Robots-Tag', 'noindex, nofollow');
  next();
});

app.get(['/admin', '/admin/'], serveApp);
app.use(express.static(path.join(directory, 'dist')));
app.get('/{*path}', serveApp);

app.listen(port, '0.0.0.0', () => {
  console.log(`AnındaGetir sunucusu 0.0.0.0:${port} adresinde çalışıyor.`);
});
