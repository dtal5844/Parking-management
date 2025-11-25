// api/admin/users/[id].js - Update or delete a specific user
import { loadData, saveUsers, saveReservations } from '../../lib/storage.js';

export default async function handler(req, res) {
  const { id: idStr } = req.query;
  const id = parseInt(idStr, 10);

  if (req.method === 'PATCH') {
    try {
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
      if (typeof password === 'string' && password.trim() !== '') {
        user.password = password.trim();
      }

      await saveUsers(data.users);

      const { password: _pw, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      console.error('Update user error:', err);
      res.status(500).json({ message: 'שגיאה בעדכון משתמש' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const data = await loadData();
      const user = data.users.find(u => u.id === id);

      if (!user) {
        return res.status(404).json({ message: 'משתמש לא נמצא' });
      }

      if (user.id === 1) {
        return res.status(400).json({ message: 'לא ניתן למחוק את המשתמש הראשי (admin)' });
      }

      // Remove user and their reservations
      const updatedUsers = data.users.filter(u => u.id !== id);
      const updatedReservations = data.reservations.filter(r => r.userId !== id);

      await saveUsers(updatedUsers);
      await saveReservations(updatedReservations);

      res.json({ ok: true });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ message: 'שגיאה במחיקת משתמש' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}