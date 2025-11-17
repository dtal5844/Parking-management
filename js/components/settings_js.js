// Settings Component (Admin Only)
const Settings = ({ maxDaysPerMonth, onMaxDaysChange, onBack, onExportData, onImportData }) => {
    const handleExport = () => {
        const data = Storage.exportData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `parking-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert('הנתונים יוצאו בהצלחה!');
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        Storage.importData(data);
                        alert('הנתונים יובאו בהצלחה! רענן את הדף.');
                        window.location.reload();
                    } catch (error) {
                        alert('שגיאה בקריאת הקובץ');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleClearData = () => {
        if (confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו לא ניתנת לביטול!')) {
            if (confirm('אישור אחרון - כל ההזמנות והמשתמשים יימחקו!')) {
                Storage.clearAll();
                alert('כל הנתונים נמחקו. הדף יתרענן.');
                window.location.reload();
            }
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-card p-6 fade-in">
            <div className="flex items-center gap-3 mb-6">
                <Icons.Shield size={32} className="text-blue-600" />
                <h2 className="text-2xl font-bold">הגדרות מנהל</h2>
            </div>

            <div className="space-y-6">
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
                            onChange={(e) => onMaxDaysChange(parseInt(e.target.value))}
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-gray-600">ימים לכל דייר</span>
                    </div>
                </div>

                {/* Data Management */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">ניהול נתונים</h3>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleExport}
                            className="btn px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                            📥 ייצוא גיבוי
                        </button>
                        <button
                            onClick={handleImport}
                            className="btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                            📤 ייבוא מגיבוי
                        </button>
                        <button
                            onClick={handleClearData}
                            className="btn px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                            🗑️ מחק הכל
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        השתמש בייצוא גיבוי לשמירת הנתונים לפני עדכון או שינוי
                    </p>
                </div>

                {/* Statistics */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-3">סטטיסטיקות</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {Storage.getUsers().length}
                            </div>
                            <div className="text-sm text-gray-600">משתמשים רשומים</div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {Storage.getReservations().length}
                            </div>
                            <div className="text-sm text-gray-600">הזמנות פעילות</div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                                {Storage.getParkingSpots().length}
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

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="btn px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
                >
                    ← חזור ליומן
                </button>
            </div>
        </div>
    );
};

// Export for use in other files
window.Settings = Settings;