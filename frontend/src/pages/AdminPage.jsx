import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  adminUsersAPI,
  adminSpotsAPI,
  settingsAPI,
  adminBackupAPI,
} from "../services/api";

export default function AdminPage() {
  const { currentUser, logout, refreshState, maxDays, setMaxDays, reservations } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit modals
  const [editingUser, setEditingUser] = useState(null);
  const [editingSpot, setEditingSpot] = useState(null);
  const [newMaxDays, setNewMaxDays] = useState(maxDays);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setNewMaxDays(maxDays);
  }, [maxDays]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, spotsData] = await Promise.all([
        adminUsersAPI.getAll(),
        adminSpotsAPI.getAll(),
      ]);
      setUsers(usersData);
      setSpots(spotsData);
    } catch (err) {
      setError(err.message || "שגיאה בטעינת נתונים");
    } finally {
      setLoading(false);
    }
  };

  // User Management
  const handleUpdateUser = async (userId, updates) => {
    try {
      setError("");
      setLoading(true);
      await adminUsersAPI.update(userId, updates);
      setSuccess("המשתמש עודכן בהצלחה");
      await loadData();
      setEditingUser(null);
    } catch (err) {
      setError(err.message || "שגיאה בעדכון משתמש");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק משתמש זה?")) return;
    try {
      setError("");
      setLoading(true);
      await adminUsersAPI.delete(userId);
      setSuccess("המשתמש נמחק בהצלחה");
      await loadData();
    } catch (err) {
      setError(err.message || "שגיאה במחיקת משתמש");
    } finally {
      setLoading(false);
    }
  };

  // Spot Management
  const handleCreateSpot = async () => {
    const number = prompt("הזן מספר חניה:");
    if (!number) return;
    try {
      setError("");
      setLoading(true);
      await adminSpotsAPI.create(number);
      setSuccess("חניה נוספה בהצלחה");
      await loadData();
      await refreshState();
    } catch (err) {
      setError(err.message || "שגיאה ביצירת חניה");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSpot = async (spotId, number) => {
    try {
      setError("");
      setLoading(true);
      await adminSpotsAPI.update(spotId, number);
      setSuccess("החניה עודכנה בהצלחה");
      await loadData();
      await refreshState();
      setEditingSpot(null);
    } catch (err) {
      setError(err.message || "שגיאה בעדכון חניה");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (!confirm("האם אתה בטוח? כל ההזמנות של חניה זו יימחקו!")) return;
    try {
      setError("");
      setLoading(true);
      await adminSpotsAPI.delete(spotId);
      setSuccess("החניה נמחקה בהצלחה");
      await loadData();
      await refreshState();
    } catch (err) {
      setError(err.message || "שגיאה במחיקת חניה");
    } finally {
      setLoading(false);
    }
  };

  // Settings
  const handleUpdateMaxDays = async () => {
    try {
      setError("");
      setLoading(true);
      await settingsAPI.updateMaxDays(newMaxDays);
      setMaxDays(newMaxDays);
      setSuccess("מגבלת הימים עודכנה בהצלחה");
      await refreshState();
    } catch (err) {
      setError(err.message || "שגיאה בעדכון הגדרות");
    } finally {
      setLoading(false);
    }
  };

  // Backup
  const handleDownloadBackup = async () => {
    try {
      setError("");
      await adminBackupAPI.download();
      setSuccess("הגיבוי הורד בהצלחה");
    } catch (err) {
      setError(err.message || "שגיאה בהורדת גיבוי");
    }
  };

  const handleRestoreBackup = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        setError("");
        setLoading(true);
        const text = await file.text();
        const data = JSON.parse(text);
        await adminBackupAPI.restore(data);
        setSuccess("הגיבוי שוחזר בהצלחה");
        await loadData();
        await refreshState();
      } catch (err) {
        setError(err.message || "שגיאה בשחזור גיבוי");
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  // Statistics
  const stats = {
    totalUsers: users.length,
    totalSpots: spots.length,
    totalReservations: reservations.length,
    activeReservations: reservations.filter(
      (r) =>
        new Date(r.year, r.month, r.day) >= new Date().setHours(0, 0, 0, 0)
    ).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">פאנל ניהול</h1>
            <p className="text-sm text-gray-600">שלום, {currentUser.name}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/calendar")}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              חזור ליומן
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              התנתק
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">משתמשים</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{stats.totalSpots}</div>
          <div className="text-sm text-gray-600">חניות</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalReservations}
          </div>
          <div className="text-sm text-gray-600">הזמנות סה"כ</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-orange-600">
            {stats.activeReservations}
          </div>
          <div className="text-sm text-gray-600">הזמנות פעילות</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex border-b">
          {["users", "spots", "settings", "backup"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === tab
                  ? "bg-purple-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab === "users" && "משתמשים"}
              {tab === "spots" && "חניות"}
              {tab === "settings" && "הגדרות"}
              {tab === "backup" && "גיבוי"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-xl font-bold mb-4">ניהול משתמשים</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right p-2">שם</th>
                      <th className="text-right p-2">שם משתמש</th>
                      <th className="text-right p-2">דירה</th>
                      <th className="text-right p-2">מנהל</th>
                      <th className="text-right p-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.apartment}</td>
                        <td className="p-2">{user.isAdmin ? "כן" : "לא"}</td>
                        <td className="p-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-blue-600 hover:underline mr-2"
                          >
                            ערוך
                          </button>
                          {user.id !== 1 && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:underline"
                            >
                              מחק
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Spots Tab */}
          {activeTab === "spots" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">ניהול חניות</h2>
                <button
                  onClick={handleCreateSpot}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                >
                  הוסף חניה
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {spots.map((spot) => (
                  <div key={spot.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="text-lg font-bold text-center mb-2">
                      {spot.number}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSpot(spot)}
                        className="flex-1 text-xs text-blue-600 hover:underline"
                      >
                        ערוך
                      </button>
                      <button
                        onClick={() => handleDeleteSpot(spot.id)}
                        className="flex-1 text-xs text-red-600 hover:underline"
                      >
                        מחק
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div>
              <h2 className="text-xl font-bold mb-4">הגדרות מערכת</h2>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  מגבלת ימים לחודש
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={newMaxDays}
                    onChange={(e) => setNewMaxDays(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleUpdateMaxDays}
                    disabled={loading || newMaxDays === maxDays}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                  >
                    עדכן
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Backup Tab */}
          {activeTab === "backup" && (
            <div>
              <h2 className="text-xl font-bold mb-4">גיבוי ושחזור</h2>
              <div className="space-y-4 max-w-md">
                <button
                  onClick={handleDownloadBackup}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  הורד גיבוי
                </button>
                <button
                  onClick={handleRestoreBackup}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                >
                  שחזר מגיבוי
                </button>
                <p className="text-sm text-gray-600">
                  שימו לב: שחזור גיבוי ימחק את כל הנתונים הנוכחיים!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">ערוך משתמש</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdateUser(editingUser.id, {
                  name: formData.get("name"),
                  apartment: formData.get("apartment"),
                  isAdmin: formData.get("isAdmin") === "on",
                  password: formData.get("password") || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">שם מלא</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingUser.name}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">דירה</label>
                <input
                  name="apartment"
                  type="text"
                  defaultValue={editingUser.apartment}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  סיסמה חדשה (אופציונלי)
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="השאר ריק לשמירת הסיסמה הנוכחית"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              {editingUser.id !== 1 && (
                <div className="flex items-center gap-2">
                  <input
                    name="isAdmin"
                    type="checkbox"
                    defaultChecked={editingUser.isAdmin}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium">מנהל</label>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Spot Modal */}
      {editingSpot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">ערוך חניה</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleUpdateSpot(editingSpot.id, formData.get("number"));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">מספר חניה</label>
                <input
                  name="number"
                  type="text"
                  defaultValue={editingSpot.number}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setEditingSpot(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}