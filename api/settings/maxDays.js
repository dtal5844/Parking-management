// api/settings/maxDays.js - Update max days setting
import { loadData, saveMaxDays } from '../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { maxDays } = req.body;

    if (!Number.isInteger(maxDays) || maxDays < 1 || maxDays > 31) {
      return res.status(400).json({ message: 'ערך לא חוקי' });
    }

    await saveMaxDays(maxDays);
    res.json({ maxDays });
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ message: 'שגיאה בעדכון הגדרות' });
  }
}