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
    const fileInputRef = React.useRef(null);

    // =========================
    // Load Data from LocalStorage
    // =========================
    const reloadUsers = () => {
        const data = Storage.getUsers();
        setUsers(data);
    };

    const reloadSpots = () => {
        const data = Storage.getParkingSpots();
        setParkingSpots(data);
    };

    React.useEffect(() => {
        reloadUsers();
        reloadSpots();
    }, []);

    // =========================
    // Settings
    // =========================
    const handleMaxDaysChangeInternal = (e) => {
        const value = parseInt(e.target.value);
        if (!value) return;

        Storage.setMaxDays(value);
        onMaxDaysChange(value);
    };

    // =========================
    // User Management
    // =========================
    const handleToggleAdmin = (user) => {
        if (user.id === 1 && user.isAdmin) {
            alert('לא ניתן להסיר הרשאת מנהל מהמשתמש הראשי');
            return;
        }

        const updatedUsers = users.map(u =>
            u.id === user.id ? { ...u, isAdmin: !u.isAdmin } : u
        );

        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);
    };

    const handleUpdateUserField = (user, field, value) => {
        const updatedUsers = users.map(u =>
            u.id === user.id ? { ...u, [field]: value } : u
        );

        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);
    };

    const handleResetPassword = (user) => {
        const password = prompt(`סיסמה חדשה עבור ${user.username}:`);
        if (!password || !password.trim()) return;

        const updatedUsers = users.map(u =>
            u.id === user.id ? { ...u, password: password.trim() } : u
        );

        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);
        alert('✅ הסיסמה עודכנה בהצלחה');
    };

    const handleDeleteUser = (user) => {
        if (user.id === 1) {
            alert('לא ניתן למחוק את המשתמש הראשי');
            return;
        }

        if (!confirm(`למחוק את המשתמש "${user.username}" וכל ההזמנות שלו?`)) return;

        const updatedUsers = users.filter(u => u.id !== user.id);
        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);

        alert('✅ המשתמש נמחק');
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        const { username, password, name, apartment } = newUser;

        if (!username || !password || !name || !apartment) {
            alert('נא למלא את כל השדות');
            return;
        }

        if (users.some(u => u.username === username)) {
            alert('שם המשתמש כבר קיים');
            return;
        }

        const newId = users.length === 0 ? 1 : Math.max(...users.map(u => u.id)) + 1;

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

        alert('✅ משתמש נוצר בהצלחה');
    };

    // =========================
    // Parking Spots Management
    // =========================
    const handleCreateSpot = (e) => {
        e.preventDefault();

        if (!newSpotNumber.trim()) {
            alert('נא להזין מספר חניה');
            return;
        }

        if (parkingSpots.some(s => s.number === newSpotNumber)) {
            alert('חניה כזו כבר קיימת');
            return;
        }

        const newId = parkingSpots.length === 0 ? 1 : Math.max(...parkingSpots.map(s => s.id)) + 1;

        const newSpot = {
            id: newId,
            number: newSpotNumber.trim()
        };

        const updatedSpots = [...parkingSpots, newSpot];
        Storage.saveParkingSpots(updatedSpots);
        setParkingSpots(updatedSpots);

        setNewSpotNumber('');
        alert('✅ חניה נוספה בהצלחה');
    };

    const handleUpdateSpotNumber = (spot, value) => {
        const updatedSpots = parkingSpots.map(s =>
            s.id === spot.id ? { ...s, number: value } : s
        );

        Storage.saveParkingSpots(updatedSpots);
        setParkingSpots(updatedSpots);
    };

    const handleDeleteSpot = (spot) => {
        const count = reservations.filter(r => r.spotId === spot.id).length;

        const confirmMsg = count > 0
            ? `לחניה יש ${count} הזמנות. למחוק בכל זאת?`
            : `למחוק את החניה ${spot.number}?`;

        if (!confirm(confirmMsg)) return;

        const updatedSpots = parkingSpots.filter(s => s.id !== spot.id);
        Storage.saveParkingSpots(updatedSpots);
        setParkingSpots(updatedSpots);

        alert('✅ חניה נמחקה');
    };

    // =========================
    // Backup
    // =========================
    const handleDownloadBackup = () => {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "parking-full-backup.json";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleRestoreFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setRestoreFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const json = JSON.parse(evt.target.result);

                if (!confirm("⚠ שחזור ידרוס את כל הנתונים. להמשיך?")) return;

                Storage.importData(json);

                reloadUsers();
                reloadSpots();

                alert("✅ השחזור בוצע בהצלחה");
            } catch (err) {
                console.error(err);
                alert("❌ שגיאה בשחזור הקובץ");
            } finally {
                fileInputRef.current.value = "";
                setRestoreFileName("");
            }
        };

        reader.readAsText(file, "utf-8");
    };

    // =========================
    // Render
    // =========================
    return (
        <div className="bg-white rounded-lg shadow p-6">

            <h2 className="text-xl font-bold mb-4">⚙ הגדרות מערכת</h2>

            <div className="mb-6">
                <label className="block mb-1 font-semibold">מקסימום ימים לחודש:</label>
                <input
                    type="number"
                    value={maxDaysPerMonth}
                    onChange={handleMaxDaysChangeInternal}
                    className="border px-3 py-1 rounded w-32"
                />
            </div>

            <div className="mb-6">
                <button onClick={handleDownloadBackup} className="bg-blue-600 text-white px-4 py-2 rounded">
                    📥 הורדת גיבוי מלא
                </button>
            </div>

            <div className="mb-6">
                <input
                    type="file"
                    accept="application/json"
                    onChange={handleRestoreFileChange}
                    ref={fileInputRef}
                />
                {restoreFileName && <p>נבחר: {restoreFileName}</p>}
            </div>

        </div>
    );
};

window.Settings = Settings;
