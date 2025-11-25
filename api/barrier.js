// api/barrier.js - Open barrier with access code
import { loadData } from './lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code, date } = req.body;
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
  } catch (err) {
    console.error('Barrier error:', err);
    res.status(500).json({ message: 'שגיאה בפתיחת מחסום' });
  }
}