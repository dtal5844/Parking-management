// Header Component
const Header = ({ currentUser, onLogout, onOpenSettings, onOpenBarrier, isAdmin }) => {
    return (
        <div className="bg-blue-600 text-white p-4 shadow-lg no-print">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icons.Car size={32} />
                    <div>
                        <h1 className="text-xl font-bold header-title">ניהול חניון מגורים</h1>
                        <p className="text-sm text-blue-100">
                            {currentUser?.name} • {currentUser?.apartment}
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {isAdmin && (
                        <button
                            onClick={onOpenSettings}
                            className="btn p-2 bg-blue-700 rounded-lg hover:bg-blue-800 transition"
                            title="הגדרות"
                        >
                            <Icons.Settings size={24} />
                        </button>
                    )}
                    
                    <button
                        onClick={onOpenBarrier}
                        className="btn p-2 bg-green-500 rounded-lg hover:bg-green-600 transition"
                        title="פתיחת מחסום"
                    >
                        <Icons.Key size={24} />
                    </button>
                    
                    <button
                        onClick={onLogout}
                        className="btn p-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
                        title="התנתק"
                    >
                        <Icons.LogOut size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Export for use in other files
window.Header = Header;
