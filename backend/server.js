// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'data.json');

// ברירת מחדל – כמו Storage.DEFAULT_*
const DEFAULT_DATA = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', isAdmin: true, name: 'מנהל', apartment: 'מנהל' },
    { id: 2, username: 'dani', password: '1234', isAdmin: false, name: 'דני כהן', apartment: 'דירה 5' }
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

// קריאה/כתיבה ל-data.json
async function loadData() {
  try {
    const exists = await fs.pathExists(DATA_FILE);
    if (!exists) {
      await fs.writeJson(DATA_FILE, DEFAULT_DATA, { spaces: 2 });
      return { ...DEFAULT_DATA };
    }
    const data = await fs.readJson(DATA_FILE);
    return { ...DEFAULT_DATA, ...data }; // לוודא שיש כל השדות
  } catch (err) {
    console.error('Error reading data file, using defaults:', err);
    return { ...DEFAULT_DATA };
  }
}

async function saveData(data) {
  await fs.writeJson(DATA_FILE, data, { spaces: 2 });
}

// Middleware
app.use(cors());
app.use(express.json());

// ---------- Routes ---------- //

// מצב מלא (לטעינה ראשונית באפליקציה)
app.get('/api/state', async (req, res) => {
  const data = await loadData();
  // לא מחזירים סיסמאות החוצה
  const safeUsers = data.users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    apartment: u.apartment,
    isAdmin: u.isAdmin
  }));
  res.json({
    users: safeUsers,
    reservations: data.reservations,
    maxDays: data.maxDays,
    parkingSpots: data.parkingSpots
  });
});

// התחברות (login)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const data = await loadData();
  const user = data.users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
  }
  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

// הוספת משתמש חדש (register)
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

  // אם כבר יש הזמנה – ביטול או חסימה
  if (existing) {
    if (existing.userId === userId || user.isAdmin) {
      data.reservations = data.reservations.filter(r => r.id !== existing.id);
      await saveData(data);
      return res.json({ cancelled: true });
    } else {
      return res.status(409).json({ message: 'החניה תפוסה על ידי משתמש אחר', ownerName: existing.userName });
    }
  }

  // בדיקת מגבלת ימים
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

// פתיחת מחסום לפי קוד
app.post('/api/barrier', async (req, res) => {
  const { code, date } = req.body; // date = {day, month, year}
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

// שינוי maxDays
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

// סטטוס
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Parking backend running on http://localhost:${PORT}`);
});

