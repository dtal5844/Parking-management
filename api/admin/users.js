// api/admin/users.js - Get all users (admin only)
import { loadData } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await loadData();
    const safeUsers = data.users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      apartment: u.apartment,
      isAdmin: u.isAdmin
    }));

    res.json(safeUsers);
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ message: 'שגיאה בטעינת משתמשים' });
  }
}