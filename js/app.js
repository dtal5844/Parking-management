// Main Application
const App = () => {
    const { useState, useEffect } = React;

    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [parkingSpots, setParkingSpots] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [maxDaysPerMonth, setMaxDaysPerMonth] = useState(7);
    const [activeView, setActiveView] = useState('login');
    const [showRegister, setShowRegister] = useState(false);
    const [barrierCode, setBarrierCode] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE = ''; // אותו origin – http://localhost:4000

    // טעינת מצב ראשוני מהשרת + משתמש שמור בדפדפן
    useEffect(() => {
        const savedUserStr = localStorage.getItem('parkingCurrentUser');
        if (savedUserStr) {
            try {
                const u = JSON.parse(savedUserStr);
                setCurrentUser(u);
                setActiveView('calendar');
            } catch (e) {
                console.error(e);
            }
        }

        const loadState = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/state`);
                const data = await res.json();
                setUsers(data.users || []);
                setParkingSpots(data.parkingSpots || []);
                setReservations(data.reservations || []);
                setMaxDaysPerMonth(data.maxDays ?? 7);
            } catch (err) {
                console.error(err);
                alert('שגיאה בטעינת הנתונים מהשרת');
            } finally {
                setLoading(false);
            }
        };

        loadState();
    }, []);

    // התחברות דרך ה-API
    const handleLogin = async (formData) => {
        try {
            const res = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data.message || 'שם משתמש או סיסמה שגויים');
                return;
            }

            setCurrentUser(data);
            localStorage.setItem('parkingCurrentUser', JSON.stringify(data));
            setActiveView('calendar');
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת התחברות');
        }
    };

    // הרשמה
    const handleRegister = async (formData) => {
        if (!formData.username || !formData.password || !formData.name || !formData.apartment) {
            alert('נא למלא את כל השדות');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data.message || 'שגיאה בהרשמה');
                return;
            }

            setUsers([...users, data]);
            alert('נרשמת בהצלחה! כעת תוכל להתחבר');
            setShowRegister(false);
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת הרשמה');
        }
    };

    // התנתקות
    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('parkingCurrentUser');
        setActiveView('login');
    };

    // הזמנה / ביטול חניה
    const handleReservation = async (spotId, day, month, year) => {
        if (!currentUser) return;

        const existing = reservations.find(r =>
            r.spotId === spotId &&
            r.day === day &&
            r.month === month &&
            r.year === year
        );

        try {
            const res = await fetch(`${API_BASE}/api/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    spotId,
                    day,
                    month,
                    year
                })
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (data.ownerName) {
                    alert(`החניה תפוסה על ידי ${data.ownerName}`);
                } else if (data.message) {
                    alert(data.message);
                } else {
                    alert('שגיאה בשמירת החניה');
                }
                return;
            }

            // ביטול
            if (data.cancelled) {
                if (existing) {
                    setReservations(reservations.filter(r => r.id !== existing.id));
                }
                alert('ההזמנה בוטלה');
                return;
            }

            // הזמנה חדשה
            const newReservation = data;
            setReservations([...reservations, newReservation]);

            const spot = parkingSpots.find(s => s.id === spotId);
            alert(
                `חניה נשמרה בהצלחה!\n\n` +
                `📍 חניה: ${spot?.number}\n` +
                `📅 תאריך: ${day}/${month + 1}/${year}\n` +
                `🔑 קוד גישה: ${newReservation.accessCode}\n\n` +
                `⚠️ שמור את הקוד הזה!`
            );
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת שמירת חניה');
        }
    };

    // פתיחת מחסום
    const handleBarrierAccess = async () => {
        const code = prompt('🔑 הזן קוד גישה (4 ספרות):');
        if (!code) return;

        const today = new Date();
        const payload = {
            code,
            date: {
                day: today.getDate(),
                month: today.getMonth(),
                year: today.getFullYear()
            }
        };

        try {
            const res = await fetch(`${API_BASE}/api/barrier`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data.message || '❌ קוד שגוי או לא בתוקף להיום');
                return;
            }

            alert(
                `✅ מחסום נפתח!\n\n` +
                `שלום ${data.userName}\n` +
                `חניה: ${data.spotNumber}\n` +
                `כניסה אושרה`
            );
            setBarrierCode(code);
            setTimeout(() => setBarrierCode(null), 3000);
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת פתיחת מחסום');
        }
    };

    // שינוי maxDays דרך השרת
    const handleMaxDaysChange = async (value) => {
        const v = parseInt(value);
        if (!Number.isInteger(v) || v < 1 || v > 31) {
            alert('ערך לא חוקי');
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/api/settings/maxDays`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maxDays: v })
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data.message || 'שגיאה בשמירת ההגדרה');
                return;
            }

            setMaxDaysPerMonth(data.maxDays);
        } catch (err) {
            console.error(err);
            alert('שגיאה בקשר לשרת בעת שינוי מגבלה');
        }
    };

    // מסך טעינה
    if (loading) {
        return (
            <div className="login-container">
                <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold mb-4">טוען נתונים...</h1>
                    <p className="text-gray-600">אנא המתן</p>
                </div>
            </div>
        );
    }

    // Login / Register
    if (activeView === 'login' || !currentUser) {
        if (showRegister) {
            return (
                <RegisterForm
                    onRegister={handleRegister}
                    onSwitchToLogin={() => setShowRegister(false)}
                />
            );
        }
        return (
            <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setShowRegister(true)}
            />
        );
    }

    // Main app
    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenSettings={() => setActiveView('settings')}
                onOpenBarrier={handleBarrierAccess}
                isAdmin={currentUser?.isAdmin}
                isOnSettings={activeView === 'settings'}
                onBackToCalendar={() => setActiveView('calendar')}
            />


            <div className="max-w-6xl mx-auto p-4">
                {activeView === 'calendar' ? (
                    <Calendar
                        currentUser={currentUser}
                        parkingSpots={parkingSpots}
                        reservations={reservations}
                        onReservation={handleReservation}
                        maxDaysPerMonth={maxDaysPerMonth}
                    />
                ) : (
                    <Settings
                        maxDaysPerMonth={maxDaysPerMonth}
                        onMaxDaysChange={handleMaxDaysChange}
                        onBack={() => setActiveView('calendar')}
                        users={users}
                        setUsers={setUsers}
                        reservations={reservations}
                        parkingSpots={parkingSpots}
                        setParkingSpots={setParkingSpots}
                    />

                )}
            </div>

            {barrierCode && (
                <div className="barrier-notification bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg text-center animate-bounce">
                    <div className="text-xl font-bold">✅ מחסום נפתח!</div>
                    <div className="text-sm">כניסה אושרה</div>
                </div>
            )}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
