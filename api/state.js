// api/state.js - Get full application state
import { loadData } from './lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await loadData();
    res.json({
      users: data.users,
      reservations: data.reservations,
      maxDays: data.maxDays,
      parkingSpots: data.parkingSpots
    });
  } catch (err) {
    console.error('Error loading state:', err);
    res.status(500).json({ message: 'שגיאה בטעינת נתונים' });
  }
}