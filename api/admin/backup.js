// api/admin/backup.js - Download full data backup
import { loadData } from '../../lib/storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = await loadData();

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="parking-backup.json"');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Backup error:', err);
    res.status(500).json({ message: 'שגיאה ביצירת גיבוי' });
  }
}