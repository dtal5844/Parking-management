// Calendar Component
const Calendar = ({ 
    currentUser, 
    parkingSpots, 
    reservations, 
    onReservation,
    maxDaysPerMonth 
}) => {
    const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

    const getMonthName = (month) => {
        const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
                        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        return months[month];
    };

    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getUserReservationsForMonth = (userId) => {
        return reservations.filter(r => 
            r.userId === userId && 
            r.month === selectedMonth && 
            r.year === selectedYear
        ).length;
    };

    const getReservationForDate = (spotId, day) => {
        return reservations.find(r => 
            r.spotId === spotId && 
            r.day === day && 
            r.month === selectedMonth && 
            r.year === selectedYear
        );
    };

    const nextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    const prevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const userReservationCount = getUserReservationsForMonth(currentUser.id);

    return (
        <div className="fade-in">
            {/* Month Navigation */}
            <div className="bg-white rounded-lg shadow-card p-4 mb-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={nextMonth}
                        className="btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        ←
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {getMonthName(selectedMonth)} {selectedYear}
                    </h2>
                    <button
                        onClick={prevMonth}
                        className="btn px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        →
                    </button>
                </div>
                <div className="mt-3 text-center">
                    <span className={`text-sm font-medium ${
                        userReservationCount >= maxDaysPerMonth ? 'text-red-600' : 'text-gray-600'
                    }`}>
                        השתמשת ב-{userReservationCount} מתוך {maxDaysPerMonth} ימים בחודש זה
                    </span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow-card p-4 overflow-x-auto">
                <table className="calendar-table border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-2 bg-gray-100 sticky right-0 z-10">
                                חניה
                            </th>
                            {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => (
                                <th key={i} className="border border-gray-300 p-2 bg-gray-100 text-sm">
                                    {i + 1}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {parkingSpots.map(spot => (
                            <tr key={spot.id}>
                                <td className="border border-gray-300 p-2 font-semibold bg-blue-50 sticky right-0 z-10">
                                    {spot.number}
                                </td>
                                {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }, (_, i) => {
                                    const day = i + 1;
                                    const reservation = getReservationForDate(spot.id, day);
                                    const isMyReservation = reservation?.userId === currentUser.id;
                                    
                                    return (
                                        <td
                                            key={i}
                                            onClick={() => onReservation(spot.id, day, selectedMonth, selectedYear)}
                                            className={`calendar-cell border border-gray-300 p-2 cursor-pointer transition text-center ${
                                                reservation
                                                    ? isMyReservation
                                                        ? 'bg-green-500 hover:bg-green-600 text-white font-bold'
                                                        : 'bg-red-400 hover:bg-red-500 text-white'
                                                    : 'bg-white hover:bg-blue-100'
                                            }`}
                                            title={reservation 
                                                ? `${reservation.userName}\nקוד: ${reservation.accessCode}\n${isMyReservation ? 'לחץ לביטול' : ''}` 
                                                : 'לחץ לשמירה'
                                            }
                                        >
                                            {reservation && (
                                                <div className="text-xs font-bold">
                                                    {isMyReservation ? '✓' : '✗'}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow-card p-4 mt-4">
                <h3 className="font-bold mb-2">מקרא:</h3>
                <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-500 rounded"></div>
                        <span>ההזמנות שלי</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-400 rounded"></div>
                        <span>תפוס</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white border border-gray-300 rounded"></div>
                        <span>פנוי</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export for use in other files
window.Calendar = Calendar;