import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import session from 'express-session';
import crypto from 'node:crypto';
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

if (!adminEnabled) {
  console.warn(
    'Yönetici girişi devre dışı: ADMIN_USERNAME, ADMIN_PASSWORD ve SESSION_SECRET ortam değişkenlerini tanımlayın.'
  );
}

app.use(express.json({ limit: '1mb' }));
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

app.use(express.static(path.join(directory, 'dist')));
app.get('/{*path}', (_request, response) => {
  response.sendFile(path.join(directory, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`AnındaGetir sunucusu 0.0.0.0:${port} adresinde çalışıyor.`);
});
