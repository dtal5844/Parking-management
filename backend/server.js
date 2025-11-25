// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = process.env.DATA_FILE_PATH || path.join(__dirname, 'data.json');

// ----- נתוני ברירת מחדל -----
const DEFAULT_DATA = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', isAdmin: true, name: 'מנהל', apartment: 'מנהל' },
    { id: 2, username: 'dani',  password: '1234',      isAdmin: false, name: 'דני כהן', apartment: 'דירה 5' }
  ],
  reservations: [],
  parkingSpots: [
    { id: 1, number: 'P1' },
    { id: 2, number: 'P2' },
    { id: 3, number: 'P3' },
    { id: 4, number: 'P4' },
    { id: 5, number: 'P5' }
  ],
  maxDays: 7
};

// ----- קריאה/כתיבה ל-data.json -----
async function loadData() {
  try {
    const exists = await fs.pathExists(DATA_FILE);
    if (!exists) {
      await fs.writeJson(DATA_FILE, DEFAULT_DATA, { spaces: 2 });
      return { ...DEFAULT_DATA };
    }
    const data = await fs.readJson(DATA_FILE);
    return { ...DEFAULT_DATA, ...data };
  } catch (err) {
    console.error('Error reading data file, using defaults:', err);
    return { ...DEFAULT_DATA };
  }
}

async function saveData(data) {
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

// ----- Middleware -----
app.use(cors());
app.use(express.json());

// ----- API בסיסי ----- //

// מצב מלא – לטעינה ראשונית
app.get('/api/state', async (req, res) => {
  const data = await loadData();
  // כאן אנו מחזירים את המשתמשים כפי שהם (כולל סיסמה) כי ה־frontend עדיין בודק חלק מהדברים
  res.json({
    users: data.users,
    reservations: data.reservations,
    maxDays: data.maxDays,
    parkingSpots: data.parkingSpots
  });
});

// התחברות
app.post('/api/login', async (req, res) => {
  console.log('LOGIN REQUEST:', req.body);
  const { username, password } = req.body;
  const data = await loadData();
  const user = data.users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
  }
  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

// הרשמה
app.post('/api/users', async (req, res) => {
  const { username, password, name, apartment } = req.body;
  if (!username || !password || !name || !apartment) {
    return res.status(400).json({ message: 'נא למלא את כל השדות' });
  }

  const data = await loadData();
  if (data.users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'שם משתמש כבר קיים' });
  }

  const newUser = {
    id: data.users.length ? Math.max(...data.users.map(u => u.id)) + 1 : 1,
    username,
    password,
    name,
    apartment,
    isAdmin: false
  };

  data.users.push(newUser);
  await saveData(data);

  const { password: _pw, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// יצירת/ביטול הזמנה
app.post('/api/reservations', async (req, res) => {
  const { userId, spotId, day, month, year } = req.body;
  const data = await loadData();

  const user = data.users.find(u => u.id === userId);
  if (!user) return res.status(400).json({ message: 'משתמש לא קיים' });

  const existing = data.reservations.find(r =>
    r.spotId === spotId &&
    r.day === day &&
    r.month === month &&
    r.year === year
  );

  if (existing) {
    if (existing.userId === userId || user.isAdmin) {
      data.reservations = data.reservations.filter(r => r.id !== existing.id);
      await saveData(data);
      return res.json({ cancelled: true, cancelledId: existing.id });
    } else {
      return res.status(409).json({ message: 'החניה תפוסה על ידי משתמש אחר', ownerName: existing.userName });
    }
  }

  const count = data.reservations.filter(r =>
    r.userId === userId &&
    r.month === month &&
    r.year === year
  ).length;

  if (count >= data.maxDays && !user.isAdmin) {
    return res.status(403).json({ message: `הגעת למגבלת ${data.maxDays} ימים בחודש` });
  }

  const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
  const newReservation = {
    id: Date.now(),
    userId,
    userName: user.name,
    spotId,
    day,
    month,
    year,
    accessCode
  };

  data.reservations.push(newReservation);
  await saveData(data);
  res.status(201).json(newReservation);
});

// פתיחת מחסום
app.post('/api/barrier', async (req, res) => {
  const { code, date } = req.body; // {day, month, year}
  const data = await loadData();
  const reservation = data.reservations.find(r =>
    r.accessCode === code &&
    r.day === date.day &&
    r.month === date.month &&
    r.year === date.year
  );
  if (!reservation) {
    return res.status(404).json({ message: 'קוד שגוי או לא בתוקף' });
  }
  const spot = data.parkingSpots.find(s => s.id === reservation.spotId);
  res.json({
    ok: true,
    userName: reservation.userName,
    spotNumber: spot?.number
  });
});

// שינוי מגבלת ימים
app.patch('/api/settings/maxDays', async (req, res) => {
  const { maxDays } = req.body;
  if (!Number.isInteger(maxDays) || maxDays < 1 || maxDays > 31) {
    return res.status(400).json({ message: 'ערך לא חוקי' });
  }
  const data = await loadData();
  data.maxDays = maxDays;
  await saveData(data);
  res.json({ maxDays });
});

// ----- ניהול משתמשים לאדמין ----- //
app.get('/api/admin/users', async (req, res) => {
  const data = await loadData();
  const safeUsers = data.users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    apartment: u.apartment,
    isAdmin: u.isAdmin
  }));
  res.json(safeUsers);
});

app.patch('/api/admin/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, apartment, isAdmin, password } = req.body;

  const data = await loadData();
  const user = data.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ message: 'משתמש לא נמצא' });
  }

  if (user.id === 1 && isAdmin === false) {
    return res.status(400).json({ message: 'לא ניתן להסיר הרשאת מנהל מהמשתמש הראשי' });
  }

  if (typeof name === 'string') user.name = name;
  if (typeof apartment === 'string') user.apartment = apartment;
  if (typeof isAdmin === 'boolean') user.isAdmin = isAdmin;
  if (typeof password === 'string' && password.trim() !== '') user.password = password.trim();

  await saveData(data);

  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = await loadData();
  const user = data.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: 'משתמש לא נמצא' });
  }

  if (user.id === 1) {
    return res.status(400).json({ message: 'לא ניתן למחוק את המשתמש הראשי (admin)' });
  }

  data.users = data.users.filter(u => u.id !== id);
  data.reservations = data.reservations.filter(r => r.userId !== id);

  await saveData(data);
  res.json({ ok: true });
});

// ----- ניהול חניות לאדמין ----- //

// קבלת כל החניות
app.get('/api/admin/spots', async (req, res) => {
  const data = await loadData();
  res.json(data.parkingSpots || []);
});

// יצירת חניה חדשה
app.post('/api/admin/spots', async (req, res) => {
  const { number } = req.body;
  if (!number || typeof number !== 'string') {
    return res.status(400).json({ message: 'מספר חניה אינו תקין' });
  }

  const data = await loadData();

  if (data.parkingSpots.find(s => s.number === number)) {
    return res.status(409).json({ message: 'קיימת כבר חניה עם מספר זה' });
  }

  const newId = data.parkingSpots.length
    ? Math.max(...data.parkingSpots.map(s => s.id)) + 1
    : 1;

  const newSpot = { id: newId, number: number.trim() };
  data.parkingSpots.push(newSpot);
  await saveData(data);

  res.status(201).json(newSpot);
});

// עדכון מספר חניה
app.patch('/api/admin/spots/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { number } = req.body;
  if (!number || typeof number !== 'string') {
    return res.status(400).json({ message: 'מספר חניה אינו תקין' });
  }

  const data = await loadData();
  const spot = data.parkingSpots.find(s => s.id === id);
  if (!spot) {
    return res.status(404).json({ message: 'חניה לא נמצאה' });
  }

  if (data.parkingSpots.find(s => s.number === number && s.id !== id)) {
    return res.status(409).json({ message: 'קיימת כבר חניה עם מספר זה' });
  }

  spot.number = number.trim();
  await saveData(data);

  res.json(spot);
});

// מחיקת חניה
app.delete('/api/admin/spots/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = await loadData();
  const spot = data.parkingSpots.find(s => s.id === id);

  if (!spot) {
    return res.status(404).json({ message: 'חניה לא נמצאה' });
  }

  // מוחקים גם כל ההזמנות של החניה
  data.parkingSpots = data.parkingSpots.filter(s => s.id !== id);
  data.reservations = data.reservations.filter(r => r.spotId !== id);

  await saveData(data);
  res.json({ ok: true });
});

// ----- גיבוי ושחזור (Admin) ----- //

// הורדת גיבוי של כל הנתונים
app.get('/api/admin/backup', async (req, res) => {
  const data = await loadData();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="parking-backup.json"');
  res.send(JSON.stringify(data, null, 2));
});

// שחזור מגיבוי
app.post('/api/admin/restore', async (req, res) => {
  const incoming = req.body;

  // בדיקה בסיסית שהמבנה הגיוני
  if (
    !incoming ||
    typeof incoming !== 'object' ||
    !Array.isArray(incoming.users) ||
    !Array.isArray(incoming.reservations) ||
    !Array.isArray(incoming.parkingSpots)
  ) {
    return res.status(400).json({ message: 'קובץ גיבוי לא תקין' });
  }

  const normalized = {
    users: incoming.users,
    reservations: incoming.reservations,
    parkingSpots: incoming.parkingSpots,
    maxDays: Number.isInteger(incoming.maxDays) ? incoming.maxDays : DEFAULT_DATA.maxDays
  };

  try {
    await saveData(normalized);
    res.json({ ok: true });
  } catch (err) {
    console.error('restore error:', err);
    res.status(500).json({ message: 'שגיאה בשחזור הגיבוי' });
  }
});


// ----- סטטוס -----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ----- Serve icon as API endpoint -----
app.get('/api/pwa-icon', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#667eea;stop-opacity:1"/><stop offset="100%" style="stop-color:#764ba2;stop-opacity:1"/></linearGradient></defs><rect width="512" height="512" rx="80" fill="url(#bg)"/><text x="256" y="360" font-family="Arial" font-size="320" font-weight="bold" fill="white" text-anchor="middle">P</text></svg>`;
  res.send(svg);
});

// ----- Static Frontend ----- //
const publicDir = path.join(__dirname, '..');

// Explicitly serve images directory
app.use('/images', express.static(path.join(publicDir, 'images')));

// Serve all other static files
app.use(express.static(publicDir));

// Catch-all route for SPA (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ----- Start server ----- //
app.listen(PORT, () => {
  console.log(`Parking app running on http://localhost:${PORT}`);
});
