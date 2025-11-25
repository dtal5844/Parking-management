// api/admin/spots.js - Get all parking spots or create new one
import { loadData, saveParkingSpots } from '../../lib/storage.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await loadData();
      res.json(data.parkingSpots || []);
    } catch (err) {
      console.error('Get spots error:', err);
      res.status(500).json({ message: 'שגיאה בטעינת חניות' });
    }
  } else if (req.method === 'POST') {
    try {
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
      await saveParkingSpots(data.parkingSpots);

      res.status(201).json(newSpot);
    } catch (err) {
      console.error('Create spot error:', err);
      res.status(500).json({ message: 'שגיאה ביצירת חניה' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}