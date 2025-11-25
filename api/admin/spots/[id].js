// api/admin/spots/[id].js - Update or delete a specific parking spot
import { loadData, saveParkingSpots, saveReservations } from '../../lib/storage.js';

export default async function handler(req, res) {
  const { id: idStr } = req.query;
  const id = parseInt(idStr, 10);

  if (req.method === 'PATCH') {
    try {
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
      await saveParkingSpots(data.parkingSpots);

      res.json(spot);
    } catch (err) {
      console.error('Update spot error:', err);
      res.status(500).json({ message: 'שגיאה בעדכון חניה' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const data = await loadData();
      const spot = data.parkingSpots.find(s => s.id === id);

      if (!spot) {
        return res.status(404).json({ message: 'חניה לא נמצאה' });
      }

      // Remove spot and its reservations
      const updatedSpots = data.parkingSpots.filter(s => s.id !== id);
      const updatedReservations = data.reservations.filter(r => r.spotId !== id);

      await saveParkingSpots(updatedSpots);
      await saveReservations(updatedReservations);

      res.json({ ok: true });
    } catch (err) {
      console.error('Delete spot error:', err);
      res.status(500).json({ message: 'שגיאה במחיקת חניה' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}