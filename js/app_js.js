// Main Application
const App = () => {
    const { useState, useEffect } = React;

    // State
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [parkingSpots, setParkingSpots] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [maxDaysPerMonth, setMaxDaysPerMonth] = useState(7);
    const [activeView, setActiveView] = useState('login');
    const [showRegister, setShowRegister] = useState(false);
    const [barrierCode, setBarrierCode] = useState(null);

    // Load data on mount
    useEffect(() => {
        const savedUser = Storage.getCurrentUser();
        const savedUsers = Storage.getUsers();
        const savedSpots = Storage.getParkingSpots();
        const savedReservations = Storage.getReservations();
        const savedMaxDays = Storage.getMaxDays();

        if (savedUser) {
            setCurrentUser(savedUser);
            setActiveView('calendar');
        }
        setUsers(savedUsers);
        setParkingSpots(savedSpots);
        setReservations(savedReservations);
        setMaxDaysPerMonth(savedMaxDays);
    }, []);

    // Save data when changed
    useEffect(() => {
        if (users.length > 0) {
            Storage.saveUsers(users);
        }
    }, [users]);

    useEffect(() => {
        Storage.saveReservations(reservations);
    }, [reservations]);

    useEffect(() => {
        Storage.saveMaxDays(maxDaysPerMonth);
    }, [maxDaysPerMonth]);

    // Login handler
    const handleLogin = (formData) => {
        const user = users.find(u => 
            u.username === formData.username && 
            u.password === formData.password
        );
        
        if (user) {
            setCurrentUser(user);
            Storage.setCurrentUser(user);
            setActiveView('calendar');
        } else {
            alert('שם משתמש או סיסמה שגויים');
        }
    };

    // Register handler
    const handleRegister = (formData) => {
        if (!formData.username || !formData.password || !formData.name || !formData.apartment) {
            alert('נא למלא את כל השדות');
            return;
        }
        
        if (users.find(u => u.username === formData.username)) {
            alert('שם משתמש כבר קיים');
            return;
        }

        const newUser = {
            id: users.length + 1,
            ...formData,
            isAdmin: false
        };
        
        setUsers([...users, newUser]);
        alert('נרשמת בהצלחה! כעת תוכל להתחבר');
        setShowRegister(false);
    };

    // Logout handler
    const handleLogout = () => {
        setCurrentUser(null);
        Storage.setCurrentUser(null);
        setActiveView('login');
    };

    // Reservation handler
    const handleReservation = (spotId, day, month, year) => {
        if (!currentUser) return;

        const existing = reservations.find(r => 
            r.spotId === spotId && 
            r.day === day && 
            r.month === month && 
            r.year === year
        );
        
        if (existing) {
            if (existing.userId === currentUser.id || currentUser.isAdmin) {
                setReservations(reservations.filter(r => r.id !== existing.id));
                alert('ההזמנה בוטלה');
            } else {
                alert('החניה תפוסה על ידי ' + existing.userName);
            }
            return;
        }

        const userReservations = reservations.filter(r => 
            r.userId === currentUser.id && 
            r.month === month && 
            r.year === year
        ).length;

        if (userReservations >= maxDaysPerMonth && !currentUser.isAdmin) {
            alert(`הגעת למגבלת ${maxDaysPerMonth} ימים בחודש`);
            return;
        }

        const accessCode = Math.floor(1000 + Math.random() * 9000).toString();
        const newReservation = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.name,
            spotId,
            day,
            month,
            year,
            accessCode
        };

        setReservations([...reservations, newReservation]);
        alert(`חניה נשמרה בהצלחה!\n\n📍 חניה: ${parkingSpots.find(s => s.id === spotId)?.number}\n📅 תאריך: ${day}/${month + 1}/${year}\n🔑 קוד גישה: ${accessCode}\n\n⚠️ שמור את הקוד הזה!`);
    };

    // Barrier access handler
    const handleBarrierAccess = () => {
        const code = prompt('🔑 הזן קוד גישה (4 ספרות):');
        if (!code) return;

        const today = new Date();
        const reservation = reservations.find(r => 
            r.accessCode === code &&
            r.day === today.getDate() &&
            r.month === today.getMonth() &&
            r.year === today.getFullYear()
        );

        if (reservation) {
            const spot = parkingSpots.find(s => s.id === reservation.spotId);
            alert(`✅ מחסום נפתח!\n\nשלום ${reservation.userName}\nחניה: ${spot?.number}\nכניסה אושרה`);
            setBarrierCode(code);
            setTimeout(() => setBarrierCode(null), 3000);
        } else {
            alert('❌ קוד שגוי או לא בתוקף להיום\n\nוודא:\n• הקוד נכון (4 ספרות)\n• ההזמנה היא להיום\n• ההזמנה לא בוטלה');
        }
    };

    // Render login/register
    if (activeView === 'login') {
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

    // Render main app
    return (
        <div className="min-h-screen bg-gray-100">
            <Header
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenSettings={() => setActiveView('settings')}
                onOpenBarrier={handleBarrierAccess}
                isAdmin={currentUser?.isAdmin}
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
                        onMaxDaysChange={setMaxDaysPerMonth}
                        onBack={() => setActiveView('calendar')}
                    />
                )}
            </div>

            {/* Barrier Notification */}
            {barrierCode && (
                <div className="barrier-notification bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg text-center animate-bounce">
                    <div className="text-xl font-bold">✅ מחסום נפתח!</div>
                    <div className="text-sm">כניסה אושרה</div>
                </div>
            )}
        </div>
    );
};

// Render app
ReactDOM.render(<App />, document.getElementById('root'));