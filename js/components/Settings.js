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

    // ======================
    // Load data from storage
    // ======================
    const reloadUsers = () => setUsers(Storage.getUsers());
    const reloadSpots = () => setParkingSpots(Storage.getParkingSpots());

    React.useEffect(() => {
        reloadUsers();
        reloadSpots();
    }, []);

    // ======================
    // Max days per month
    // ======================
    const handleMaxDaysChangeInternal = (e) => {
        const value = parseInt(e.target.value);
        if (!value) return;

        Storage.setMaxDays(value);
        onMaxDaysChange(value);
    };

    // ======================
    // User Management
    // ======================
    const handleToggleAdmin = (user) => {
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
        if (!password) return;

        const updatedUsers = users.map(u =>
            u.id === user.id ? { ...u, password } : u
        );

        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);
        alert("✅ הסיסמה עודכנה");
    };

    const handleDeleteUser = (user) => {
        if (user.id === 1) {
            alert("לא ניתן למחוק את המשתמש הראשי");
            return;
        }

        if (!confirm(`למחוק את ${user.username}?`)) return;

        const updatedUsers = users.filter(u => u.id !== user.id);
        Storage.saveUsers(updatedUsers);
        setUsers(updatedUsers);

        alert("✅ המשתמש נמחק");
    };

    const handleCreateUser = (e) => {
        e.preventDefault();

        const { username, password, name, apartment } = newUser;

        if (!username || !password || !name || !apartment) {
            alert("נא למלא את כל השדות");
            return;
        }

        if (users.find(u => u.username === username)) {
            alert("שם משתמש כבר קיים");
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

        alert("✅ משתמש נוצר בהצלחה");
    };

    // ======================
    // Parking Spots
    // ======================
    const handleCreateSpot = (e) => {
        e.preventDefault();

        const spots = Storage.getParkingSpots();

        if (!newSpotNumber.trim()) {
            alert("נא להזין מספר חניה");
            return;
        }

        if (spots.find(s => s.number === newSpotNumber.trim())) {
            alert("חניה כזו כבר קיימת");
            return;
        }

        const newId = spots.length === 0 ? 1 : Math.max(...spots.map(s => s.id)) + 1;

        const newSpot = {
            id: newId,
            number: newSpotNumber.trim()
        };

        const updated = [...spots, newSpot];

        Storage.saveParkingSpots(updated);
        setParkingSpots(updated);
        setNewSpotNumber("");

        alert("✅ חניה נוספה");
    };

    const handleUpdateSpotNumber = (spot, value) => {
        const updated = parkingSpots.map(s =>
            s.id === spot.id ? { ...s, number: value } : s
        );

        Storage.saveParkingSpots(updated);
        setParkingSpots(updated);
    };

    const handleDeleteSpot = (spot) => {
        if (!confirm(`למחוק את החניה ${spot.number}?`)) return;

        const updated = parkingSpots.filter(s => s.id !== spot.id);
        Storage.saveParkingSpots(updated);
        setParkingSpots(updated);

        alert("✅ חניה נמחקה");
    };

    // ======================
    // Backup
    // ======================
    const handleDownloadBackup = () => {
        const data = Storage.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "parking-backup.json";
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
                const data = JSON.parse(evt.target.result);

                if (!confirm("⚠ השחזור ידרוס את כל הנתונים. להמשיך?")) return;

                Storage.importData(data);

                reloadUsers();
                reloadSpots();

                alert("✅ השחזור הצליח");
            } catch (err) {
                console.error(err);
                alert("❌ שגיאה בשחזור הקובץ");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setRestoreFileName("");
            }
        };

        reader.readAsText(file, "utf-8");
    };

    return (
        <div className="bg-white p-6 rounded shadow">

            <h2 className="text-xl font-bold mb-4">הגדרות מנהל</h2>

            <div className="mb-4">
                <label>מקסימום ימים לחודש:</label>
                <input type="number" value={maxDaysPerMonth}
                    onChange={handleMaxDaysChangeInternal}
                    className="border p-1 ml-2 w-20"
                />
            </div>

            <div className="mb-6">
                <button onClick={handleDownloadBackup} className="bg-blue-600 text-white px-4 py-2 rounded">
                    הורדת גיבוי מלא
                </button>
            </div>

            <div className="mb-6">
                <input type="file"
                    accept="application/json"
                    onChange={handleRestoreFileChange}
                    ref={fileInputRef}
                />
                {restoreFileName && <div>נבחר קובץ: {restoreFileName}</div>}
            </div>

            <button onClick={onBack} className="bg-gray-600 text-white px-4 py-2 rounded">
                חזרה ליומן
            </button>
        </div>
    );
};

window.Settings = Settings;
