export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  const admin = {
    username: process.env.ADMIN_USER,
    password: process.env.ADMIN_PASS
  };

  if (username === admin.username && password === admin.password) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({
    success: false,
    message: "שם משתמש או סיסמה שגויים"
  });
}
