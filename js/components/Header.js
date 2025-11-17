// Header Component
const Header = ({
    currentUser,
    onLogout,
    onOpenSettings,
    onOpenBarrier,
    isAdmin,
    isOnSettings,
    onBackToCalendar
}) => {
    return (
        <div className="bg-blue-600 text-white p-4 shadow-lg no-print">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* צד ימין – כותרת ומידע על המשתמש */}
                <div className="flex items-center gap-3">
                    <Icons.Car size={32} />
                    <div>
                        <h1 className="text-xl font-bold header-title">ניהול חניון מגורים</h1>
                        <p className="text-sm text-blue-100">
                            {currentUser?.name} • {currentUser?.apartment}
                        </p>
                    </div>
                </div>

                {/* צד שמאל – כפתורים */}
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <>
                            {/* הגדרות */}
                            <button
                                onClick={onOpenSettings}
                                className="btn flex items-center gap-1 px-3 py-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition"
                                title="הגדרות"
                            >
                                <Icons.Settings size={20} />
                                <span className="text-sm">הגדרות</span>
                            </button>

                            {/* חזרה ליומן – מוצג רק כשנמצאים במסך הגדרות */}
                            {isOnSettings && (
                                <button
                                    onClick={onBackToCalendar}
                                    className="btn flex items-center gap-1 px-3 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition"
                                    title="חזרה ליומן"
                                >
                                    <Icons.Calendar size={20} />
                                    <span className="text-sm">חזרה ליומן</span>
                                </button>
                            )}
                        </>
                    )}

                    {/* פתיחת מחסום */}
                    <button
                        onClick={onOpenBarrier}
                        className="btn flex items-center gap-1 px-3 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
                        title="פתיחת מחסום"
                    >
                        <Icons.Key size={20} />
                        <span className="text-sm">פתיחת מחסום</span>
                    </button>

                    {/* התנתקות */}
                    <button
                        onClick={onLogout}
                        className="btn flex items-center gap-1 px-3 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                        title="התנתק"
                    >
                        <Icons.LogOut size={20} />
                        <span className="text-sm">התנתק</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Export for use in other files
window.Header = Header;
