import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { reservationsAPI } from "../services/api";

export default function CalendarPage() {
  const { currentUser, reservations, parkingSpots, maxDays, logout, refreshState, setReservations } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  // Get user's reservations count for current month
  const getUserMonthlyCount = () => {
    return reservations.filter(
      (r) => r.userId === currentUser.id && r.month === month && r.year === year
    ).length;
  };

  // Get reservations for a specific date
  const getReservationsForDate = (day) => {
    return reservations.filter(
      (r) => r.day === day && r.month === month && r.year === year
    );
  };

  // Check if spot is reserved on specific date
  const isSpotReserved = (spotId, day) => {
    return getReservationsForDate(day).some((r) => r.spotId === spotId);
  };

  // Get reservation for spot on specific date
  const getReservation = (spotId, day) => {
    return getReservationsForDate(day).find((r) => r.spotId === spotId);
  };

  // Handle reservation toggle
  const handleReservation = async (spotId, day) => {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const result = await reservationsAPI.create({
        userId: currentUser.id,
        spotId,
        day,
        month,
        year,
      });

      if (result.cancelled) {
        // Reservation was cancelled
        setReservations(reservations.filter((r) => r.id !== result.cancelledId));
        setSuccess("ההזמנה בוטלה בהצלחה");
      } else {
        // New reservation created
        setReservations([...reservations, result]);
        setSuccess(`חניה נקבעה! קוד גישה: ${result.accessCode}`);
      }

      await refreshState();
    } catch (err) {
      setError(err.message || "שגיאה בביצוע פעולה");
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
  ];

  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  // Generate calendar days array
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const userCount = getUserMonthlyCount();
  const limitReached = !currentUser.isAdmin && userCount >= maxDays;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              שלום, {currentUser.name}
            </h1>
            <p className="text-sm text-gray-600">{currentUser.apartment}</p>
          </div>
          <div className="flex gap-2">
            {currentUser.isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                ניהול
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              התנתק
            </button>
          </div>
        </div>

        {/* Month Counter */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            השתמשת ב-<span className="font-bold">{userCount}</span> מתוך{" "}
            <span className="font-bold">{maxDays}</span> ימים החודש
            {limitReached && !currentUser.isAdmin && (
              <span className="text-red-600 font-semibold mr-2">
                (הגעת למגבלה!)
              </span>
            )}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            ←
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            →
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 p-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => day && setSelectedDate(day)}
              className={`
                p-2 min-h-[60px] border rounded-lg cursor-pointer transition
                ${!day ? "bg-gray-50" : "bg-white hover:bg-blue-50"}
                ${selectedDate === day ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                ${day && getReservationsForDate(day).some(r => r.userId === currentUser.id) ? "bg-green-50" : ""}
              `}
            >
              {day && (
                <>
                  <div className="font-semibold text-gray-800 text-center mb-1">
                    {day}
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    {getReservationsForDate(day).length > 0 && (
                      <span>{getReservationsForDate(day).length} הזמנות</span>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Parking Spots for Selected Date */}
        {selectedDate && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              חניות זמינות ב-{selectedDate} {monthNames[month]}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {parkingSpots.map((spot) => {
                const reservation = getReservation(spot.id, selectedDate);
                const isMyReservation = reservation?.userId === currentUser.id;
                const isReserved = !!reservation;

                return (
                  <button
                    key={spot.id}
                    onClick={() =>
                      !loading && handleReservation(spot.id, selectedDate)
                    }
                    disabled={loading || (isReserved && !isMyReservation && !currentUser.isAdmin)}
                    className={`
                      p-4 rounded-lg font-semibold transition
                      ${isMyReservation
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : isReserved
                        ? "bg-red-400 text-white cursor-not-allowed opacity-60"
                        : limitReached
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                      }
                      ${loading ? "opacity-50 cursor-wait" : ""}
                    `}
                  >
                    <div className="text-lg">{spot.number}</div>
                    {isMyReservation && reservation && (
                      <div className="text-xs mt-2">
                        קוד: {reservation.accessCode}
                      </div>
                    )}
                    {isReserved && !isMyReservation && (
                      <div className="text-xs mt-1">תפוס</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}