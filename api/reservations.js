// api/reservations.js - Create/cancel reservations
import { loadData, saveReservations } from './lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, spotId, day, month, year } = req.body;
    const data = await loadData();

    const user = data.users.find(u => u.id === userId);
    if (!user) {
      return res.status(400).json({ message: 'משתמש לא קיים' });
    }

    // Check if reservation already exists
    const existing = data.reservations.find(r =>
      r.spotId === spotId &&
      r.day === day &&
      r.month === month &&
      r.year === year
    );

    if (existing) {
      // Cancel reservation if it's the user's own or user is admin
      if (existing.userId === userId || user.isAdmin) {
        const updatedReservations = data.reservations.filter(r => r.id !== existing.id);
        await saveReservations(updatedReservations);
        return res.json({ cancelled: true, cancelledId: existing.id });
      } else {
        return res.status(409).json({
          message: 'החניה תפוסה על ידי משתמש אחר',
          ownerName: existing.userName
        });
      }
    }

    // Check monthly limit
    const count = data.reservations.filter(r =>
      r.userId === userId &&
      r.month === month &&
      r.year === year
    ).length;

    if (count >= data.maxDays && !user.isAdmin) {
      return res.status(403).json({ message: `הגעת למגבלת ${data.maxDays} ימים בחודש` });
    }

    // Create new reservation
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
    await saveReservations(data.reservations);

    res.status(201).json(newReservation);
  } catch (err) {
    console.error('Reservation error:', err);
    res.status(500).json({ message: 'שגיאה ביצירת הזמנה' });
  }
}