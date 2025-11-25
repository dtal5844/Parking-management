// api/admin/restore.js - Restore data from backup
import { saveData } from '../../lib/storage.js';

const DEFAULT_MAX_DAYS = 7;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const incoming = req.body;

    // Basic validation
    if (
      !incoming ||
      typeof incoming !== 'object' ||
      !Array.isArray(incoming.users) ||
      !Array.isArray(incoming.reservations) ||
      !Array.isArray(incoming.parkingSpots)
    ) {
      return res.status(400).json({ message: 'קובץ גיבוי לא תקין' });
    }

    const normalized = {
      users: incoming.users,
      reservations: incoming.reservations,
      parkingSpots: incoming.parkingSpots,
      maxDays: Number.isInteger(incoming.maxDays) ? incoming.maxDays : DEFAULT_MAX_DAYS
    };

    await saveData(normalized);
    res.json({ ok: true });
  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ message: 'שגיאה בשחזור הגיבוי' });
  }
}