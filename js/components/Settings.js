// Settings Component (Admin Only)
const Settings = ({
    maxDaysPerMonth,
    onMaxDaysChange,
    onBack,
    users,
    setUsers,
    reservations,
    parkingSpots,
    setParkingSpots
}) => {
    const [saving, setSaving] = React.useState(false);
    const [newUser, setNewUser] = React.useState({
        username: '',
        password: '',
        name: '',
        apartment: ''
    });
    const [newSpotNumber, setNewSpotNumber] = React.useState('');
    const [reportMonth, setReportMonth] = React.useState(new Date().getMonth());
    const [reportYear, setReportYear] = React.useState(new Date().getFullYear());
    const [restoreFileName, setRestoreFileName] = React.useState('');
    const [restoreInProgress, setRestoreInProgress] = React.useState(false);
    const fileInputRef = React.useRef(null);
    const API_BASE = ''; // אותו origin

    const handleMaxDaysChangeInternal = async (e) => {
        const value = e.target.value;
        if (!value) return;
        await onMaxDaysChange(value);
    };

    // ----- טעינת משתמשים וחניות -----
    const reloadUsers = () => {
        try {
            const users = Storage.getUsers();
            setUsers(users || []);
        } catch (err) {
            console.error(err);
            alert('שגיאה בטעינת רשימת המשתמשים ');
        }
    };


    const reloadSpots = () => {
        try {
            const spots = Storage.getParkingSpots();
            setParkingSpots(spots || []);
        } catch (err) {
            console.error(err);
            alert('שגיאה בטעינת רשימת החניות מהאחסון המקומי');
        }
    };


    React.useEffect(() => {
        reloadUsers();
        reloadSpots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ----- ניהול משתמשים -----
    const handleToggleAdmin = async (user) => {
        if (user.id === 1 && user.isAdmin) {
            alert('לא ניתן להסיר הרשאת מנהל מהמשתמש הראשי');
            return;
        }
        try {
            setSaving(true);
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAdmin: !user.isAdmin })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'שגיאה בעדכון המשתמש');
                return;
            }
            setUsers(users.map(u => (u.id === user.id ? data : u)));
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת עדכון משתמש');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUserField = async (user, field, value) => {
        try {
            setSaving(true);
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'שגיאה בעדכון המשתמש');
                return;
            }
            setUsers(users.map(u => (u.id === user.id ? data : u)));
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת עדכון משתמש');
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async (user) => {
        const password = prompt(`סיסמה חדשה עבור ${user.username}:`);
        if (!password || !password.trim()) return;
        try {
            setSaving(true);
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password.trim() })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'שגיאה בעדכון הסיסמה');
                return;
            }
            alert('הסיסמה עודכנה בהצלחה');
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת עדכון סיסמה');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (user.id === 1) {
            alert('לא ניתן למחוק את המשתמש הראשי');
            return;
        }
        if (!confirm(`האם אתה בטוח שברצונך למחוק את המשתמש "${user.username}" וכל ההזמנות שלו?`)) {
            return;
        }
        try {
            setSaving(true);
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'DELETE'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'שגיאה במחיקת המשתמש');
                return;
            }
            setUsers(users.filter(u => u.id !== user.id));
            alert('המשתמש נמחק בהצלחה');
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת מחיקת משתמש');
        } finally {
            setSaving(false);
        }
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        const { username, password, name, apartment } = newUser;

        if (!username || !password || !name || !apartment) {
            alert('נא למלא את כל השדות');
            return;
        }

        const users = Storage.getUsers();

        if (users.find(u => u.username === username)) {
            alert('שם המשתמש כבר קיים');
            return;
        }

        const newId = Math.max(...users.map(u => u.id)) + 1;

        const user = {
            id: newId,
            username,
            password,
            name,
            apartment,
            isAdmin: false
        };

        const updatedUsers = [...users, user];
        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);

        setNewUser({ username: '', password: '', name: '', apartment: '' });
        alert('משתמש חדש נוצר בהצלחה');
    };


    // ----- ניהול חניות -----
    const handleCreateSpot = (e) => {
        e.preventDefault();

        if (!newSpotNumber.trim()) {
            alert('נא להזין מספר חניה');
            return;
        }

        const spots = Storage.getParkingSpots();

        if (spots.find(s => s.number === newSpotNumber.trim())) {
            alert('חניה כזו כבר קיימת');
            return;
        }

        const newId = Math.max(...spots.map(s => s.id)) + 1;

        const newSpot = {
            id: newId,
            number: newSpotNumber.trim()
        };

        const updatedSpots = [...spots, newSpot];
        Storage.saveParkingSpots(updatedSpots);
        setParkingSpots(updatedSpots);
        setNewSpotNumber('');

        alert('החניה נוספה בהצלחה');
    };


    const handleUpdateSpotNumber = async (spot, value) => {
        try {
            setSaving(true);
            const res = await fetch(`/api/admin/spots/${spot.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: value })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'שגיאה בעדכון החניה');
                return;
            }
            setParkingSpots(parkingSpots.map(s => (s.id === spot.id ? data : s)));
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת עדכון חניה');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSpot = async (spot) => {
        const spotReservations = reservations.filter(r => r.spotId === spot.id).length;
        let msg = `האם אתה בטוח שברצונך למחוק את החניה "${spot.number}"?`;
        if (spotReservations > 0) {
            msg += `\nיש לחניה זו ${spotReservations} הזמנות פעילות/עבר שיימחקו גם כן.`;
        }
        if (!confirm(msg)) return;

        try {
            setSaving(true);
            const res = await fetch(`/api/admin/spots/${spot.id}`, {
                method: 'DELETE'
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                alert(data.message || 'שגיאה במחיקת החניה');
                return;
            }
            setParkingSpots(parkingSpots.filter(s => s.id !== spot.id));
            alert('החניה נמחקה בהצלחה');
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת מחיקת חניה');
        } finally {
            setSaving(false);
        }
    };

        // ----- דוח שימוש לפי משתמש -----
    const getUserUsageForPeriod = (userId) => {
        const allUserReservations = reservations.filter(r => r.userId === userId);
        const total = allUserReservations.length;
        const monthly = allUserReservations.filter(
            r => r.month === reportMonth && r.year === reportYear
        ).length;
        return { total, monthly };
    };

    const monthsNames = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];

        // ----- גיבוי ושחזור ----- //
    const handleDownloadBackup = () => {
        // הכי פשוט – לפתוח את ה-URL, הדפדפן ידאג להורדה
        window.open('/api/admin/backup', '_blank');
    };

    const handleRestoreFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setRestoreFileName('');
            return;
        }
        setRestoreFileName(file.name);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const text = evt.target.result;
                const json = JSON.parse(text);

                if (!confirm('האם אתה בטוח שברצונך לשחזר את הגיבוי? פעולה זו תדרוס את כל הנתונים הקיימים.')) {
                    return;
                }

                setRestoreInProgress(true);
                const res = await fetch('/api/admin/restore', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(json)
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    alert(data.message || 'שגיאה בשחזור הגיבוי');
                    return;
                }

                alert('השחזור הצליח! טוען מחדש את הנתונים...');
                // כדי לוודא שהמצב מסתנכרן – נטען מחדש את המשתמשים והחניות
                await reloadUsers();
                await reloadSpots();
            } catch (err) {
                console.error(err);
                alert('קובץ גיבוי לא תקין או שגיאה בקריאה שלו');
            } finally {
                setRestoreInProgress(false);
                // איפוס השדה כך שאפשר יהיה לבחור את אותו קובץ שוב
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                setRestoreFileName('');
            }
        };
        reader.readAsText(file, 'utf-8');
    };

    // ----- סטטיסטיקות -----
    const usersCount = users.length;
    const reservationsCount = reservations.length;
    const parkingSpotCount = parkingSpots.length;

    return (
        <div className="bg-white rounded-lg shadow-card p-6 fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Icons.Shield size={32} className="text-blue-600" />
                <h2 className="text-2xl font-bold">הגדרות מנהל</h2>
            </div>

            <div className="space-y-8">
                {/* Max Days Setting */}
                <div className="border-b pb-4">
                    <label className="block text-lg font-semibold mb-2">
                        מגבלת ימים לחודש:
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={maxDaysPerMonth}
                            onChange={handleMaxDaysChangeInternal}
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">ימים לכל דייר</span>
                    </div>
                </div>

                {/* Statistics */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">סטטיסטיקות</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {usersCount}
                            </div>
                            <div className="text-sm text-gray-600">משתמשים רשומים</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {reservationsCount}
                            </div>
                            <div className="text-sm text-gray-600">הזמנות פעילות</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {parkingSpotCount}
                            </div>
                            <div className="text-sm text-gray-600">חניות במערכת</div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {maxDaysPerMonth}
                            </div>
                            <div className="text-sm text-gray-600">ימים מקסימום</div>
                        </div>
                    </div>
                </div>

                {/* Users Management */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">ניהול משתמשים</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        עדכון פרטי דיירים, הגדרת מנהלים, איפוס סיסמה ומחיקה.
                    </p>

                    <div className="overflow-x-auto mb-4">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 border">ID</th>
                                    <th className="px-3 py-2 border">שם משתמש</th>
                                    <th className="px-3 py-2 border">שם מלא</th>
                                    <th className="px-3 py-2 border">דירה</th>
                                    <th className="px-3 py-2 border">מנהל?</th>
                                    <th className="px-3 py-2 border">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-3 py-2 border text-center">{user.id}</td>
                                        <td className="px-3 py-2 border">{user.username}</td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded px-2 py-1"
                                                value={user.name || ''}
                                                onChange={(e) => handleUpdateUserField(user, 'name', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded px-2 py-1"
                                                value={user.apartment || ''}
                                                onChange={(e) => handleUpdateUserField(user, 'apartment', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-2 border text-center">
                                            <button
                                                onClick={() => handleToggleAdmin(user)}
                                                className={`px-3 py-1 rounded text-xs font-semibold ${
                                                    user.isAdmin
                                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                                                }`}
                                                disabled={saving}
                                            >
                                                {user.isAdmin ? 'מנהל' : 'רגיל'}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 border">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleResetPassword(user)}
                                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    disabled={saving}
                                                >
                                                    איפוס סיסמה
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                    disabled={saving}
                                                >
                                                    מחיקה
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-gray-500">
                                            אין משתמשים להצגה
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Create New User */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">יצירת משתמש חדש</h4>
                        <form className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end" onSubmit={handleCreateUser}>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">שם משתמש</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">סיסמה</label>
                                <input
                                    type="password"
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">שם מלא</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">דירה</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                    value={newUser.apartment}
                                    onChange={(e) => setNewUser({ ...newUser, apartment: e.target.value })}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-green-500 text-white rounded px-3 py-2 text-sm font-semibold hover:bg-green-600"
                                    disabled={saving}
                                >
                                    צור משתמש
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Parking Spots Management */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">ניהול חניות</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        הוספה, עדכון ומחיקה של חניות. מחיקת חניה מוחקת גם את כל ההזמנות המשויכות אליה.
                    </p>

                    <div className="overflow-x-auto mb-4">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 border">ID</th>
                                    <th className="px-3 py-2 border">מספר חניה</th>
                                    <th className="px-3 py-2 border">מספר הזמנות</th>
                                    <th className="px-3 py-2 border">פעולות</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parkingSpots.map(spot => {
                                    const spotReservations = reservations.filter(r => r.spotId === spot.id).length;
                                    return (
                                        <tr key={spot.id}>
                                            <td className="px-3 py-2 border text-center">{spot.id}</td>
                                            <td className="px-3 py-2 border">
                                                <input
                                                    type="text"
                                                    className="w-full border border-gray-200 rounded px-2 py-1"
                                                    value={spot.number}
                                                    onChange={(e) => handleUpdateSpotNumber(spot, e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-2 border text-center">
                                                {spotReservations}
                                            </td>
                                            <td className="px-3 py-2 border">
                                                <button
                                                    onClick={() => handleDeleteSpot(spot)}
                                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                                    disabled={saving}
                                                >
                                                    מחיקת חניה
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {parkingSpots.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-gray-500">
                                            אין חניות במערכת
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Create New Spot */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">הוספת חניה חדשה</h4>
                        <form className="flex flex-col md:flex-row gap-2 items-end" onSubmit={handleCreateSpot}>
                            <div className="flex-1">
                                <label className="block text-xs text-gray-600 mb-1">מספר חניה (לדוגמה P6)</label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded px-2 py-1"
                                    value={newSpotNumber}
                                    onChange={(e) => setNewSpotNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white rounded px-3 py-2 text-sm font-semibold hover:bg-blue-600"
                                    disabled={saving}
                                >
                                    הוסף חניה
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                                {/* Usage Report */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">דוח שימוש בחניון</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        צפייה בכמות הימים שכל משתמש השתמש בחניון, כולל סינון לפי חודש ושנה.
                    </p>

                    {/* בחירת חודש ושנה */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">חודש</label>
                            <select
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                value={reportMonth}
                                onChange={(e) => setReportMonth(parseInt(e.target.value))}
                            >
                                {monthsNames.map((name, idx) => (
                                    <option key={idx} value={idx}>{name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">שנה</label>
                            <input
                                type="number"
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-24"
                                value={reportYear}
                                onChange={(e) => setReportYear(parseInt(e.target.value) || new Date().getFullYear())}
                            />
                        </div>
                    </div>

                    {/* טבלת שימוש */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-3 py-2 border">שם משתמש</th>
                                    <th className="px-3 py-2 border">שם מלא</th>
                                    <th className="px-3 py-2 border">דירה</th>
                                    <th className="px-3 py-2 border">סה״כ הזמנות</th>
                                    <th className="px-3 py-2 border">
                                        הזמנות בחודש {monthsNames[reportMonth]} {reportYear}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const usage = getUserUsageForPeriod(user.id);
                                    return (
                                        <tr key={user.id}>
                                            <td className="px-3 py-2 border">{user.username}</td>
                                            <td className="px-3 py-2 border">{user.name}</td>
                                            <td className="px-3 py-2 border">{user.apartment}</td>
                                            <td className="px-3 py-2 border text-center">{usage.total}</td>
                                            <td className="px-3 py-2 border text-center">{usage.monthly}</td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">
                                            אין משתמשים להצגה
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                                {/* Backup & Restore */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">גיבוי ושחזור</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        הורדת גיבוי של כל נתוני המערכת (משתמשים, חניות, הזמנות והגדרות) ושחזור מגיבוי קיים.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 items-start">
                        {/* גיבוי */}
                        <div>
                            <button
                                type="button"
                                onClick={handleDownloadBackup}
                                className="bg-blue-500 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-blue-600"
                            >
                                הורדת גיבוי מלא
                            </button>
                            <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                קובץ JSON שניתן לשמור במקום בטוח ולהטעין מאוחר יותר בשחזור.
                            </p>
                        </div>

                        {/* שחזור */}
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">
                                שחזור מגיבוי (קובץ JSON)
                            </label>
                            <input
                                type="file"
                                accept="application/json"
                                onChange={handleRestoreFileChange}
                                className="block text-sm"
                                disabled={restoreInProgress}
                                ref={fileInputRef}   // ← זה השינוי!
                            />
                            {restoreFileName && (
                                <p className="text-xs text-gray-500 mt-1">
                                    קובץ נבחר: {restoreFileName}
                                </p>
                            )}
                            {restoreInProgress && (
                                <p className="text-xs text-gray-500 mt-1">
                                    מבצע שחזור... אנא המתן
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="btn px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                    ← חזור ליומן
                </button>

                {saving && (
                    <div className="text-sm text-gray-500 mt-2">
                        מבצע שמירה... אנא המתן
                    </div>
                )}
            </div>
        </div>
    );
};

// Export for use in other files
window.Settings = Settings;
