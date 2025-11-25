const Settings = ({
    maxDaysPerMonth,
    onMaxDaysChange,
    onBack
}) => {

    const [restoreFileName, setRestoreFileName] = React.useState("");
    const fileInputRef = React.useRef(null);

    // שינוי מקסימום ימים בחודש
    const handleMaxDaysChangeInternal = (e) => {
        const value = parseInt(e.target.value);
        if (!value) return;

        Storage.setMaxDays(value);
        onMaxDaysChange(value);
    };

    // הורדת גיבוי מלא
    const handleDownloadBackup = () => {
        try {
            const data = Storage.exportData();
            const json = JSON.stringify(data, null, 2);

            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "parking-backup.json";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("שגיאה בהורדת הגיבוי");
        }
    };

    // שחזור מגיבוי
    const handleRestoreFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setRestoreFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);

                if (!confirm("השחזור ידרוס את כל הנתונים הקיימים. להמשיך?")) return;

                Storage.importData(data);

                alert("✅ השחזור בוצע בהצלחה\nטען את הדף מחדש לקבלת הנתונים.");

            } catch (err) {
                console.error(err);
                alert("❌ שגיאה בקריאת קובץ הגיבוי");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = "";
                setRestoreFileName("");
            }
        };

        reader.readAsText(file, "utf-8");
    };

    return (
        <div className="bg-white rounded-lg shadow-card p-6 fade-in">

            <h1 className="text-2xl font-bold mb-6">הגדרות מנהל</h1>

            {/* מקסימום ימים לחודש */}
            <div className="mb-6">
                <label className="block text-lg mb-2">מקסימום ימים לחודש:</label>
                <input
                    type="number"
                    value={maxDaysPerMonth}
                    onChange={handleMaxDaysChangeInternal}
                    className="border px-3 py-2 w-24 text-lg rounded"
                />
            </div>

            {/* גיבוי */}
            <div className="mb-6">
                <button
                    onClick={handleDownloadBackup}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-lg hover:bg-blue-700"
                >
                    הורדת גיבוי מלא
                </button>
            </div>

            {/* שחזור */}
            <div className="mb-6">
                <label className="block mb-2 font-semibold">שחזור מגיבוי</label>
                <input
                    type="file"
                    accept="application/json"
                    onChange={handleRestoreFileChange}
                    ref={fileInputRef}
                />
                {restoreFileName && (
                    <div className="text-sm text-gray-600 mt-2">
                        נבחר קובץ: {restoreFileName}
                    </div>
                )}
            </div>

            {/* חזרה ליומן */}
            <div>
                <button
                    onClick={onBack}
                    className="bg-gray-700 text-white px-6 py-2 rounded-lg text-lg hover:bg-gray-800"
                >
                    חזרה ליומן
                </button>
            </div>
        </div>
    );
};

window.Settings = Settings;
