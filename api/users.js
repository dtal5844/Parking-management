// api/users.js - User registration
import { loadData, saveUsers } from './lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
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
    await saveUsers(data.users);

    const { password: _pw, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'שגיאה בהרשמה' });
  }
}