// api/login.js - User login
import { loadData } from './lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;
    const data = await loadData();

    const user = data.users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
    }

    const { password: _pw, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'שגיאה בהתחברות' });
  }
}