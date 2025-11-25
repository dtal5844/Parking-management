const Storage = {
    getUsers() {
        return JSON.parse(localStorage.getItem("parking_users") || "[]");
    },

    saveUsers(users) {
        localStorage.setItem("parking_users", JSON.stringify(users));
    },

    getParkingSpots() {
        return JSON.parse(localStorage.getItem("parking_spots") || "[]");
    },

    saveParkingSpots(spots) {
        localStorage.setItem("parking_spots", JSON.stringify(spots));
    },

    getReservations() {
        return JSON.parse(localStorage.getItem("parking_reservations") || "[]");
    },

    saveReservations(reservations) {
        localStorage.setItem("parking_reservations", JSON.stringify(reservations));
    },

    getMaxDays() {
        return parseInt(localStorage.getItem("max_days") || "7");
    },

    setMaxDays(value) {
        localStorage.setItem("max_days", value);
    },

    exportData() {
        return {
            users: this.getUsers(),
            parkingSpots: this.getParkingSpots(),
            reservations: this.getReservations(),
            settings: {
                maxDaysPerMonth: this.getMaxDays()
            }
        };
    },

    importData(data) {
        try {
            if (!data || typeof data !== "object") {
                throw new Error("Invalid backup file");
            }

            // ברירת מחדל – גם אם חסר משהו בקובץ
            const users = Array.isArray(data.users) ? data.users : [];
            const spots = Array.isArray(data.parkingSpots) ? data.parkingSpots : [];
            const reservations = Array.isArray(data.reservations) ? data.reservations : [];
            const maxDays = data.settings?.maxDaysPerMonth || 7;

            localStorage.setItem("parking_users", JSON.stringify(users));
            localStorage.setItem("parking_spots", JSON.stringify(spots));
            localStorage.setItem("parking_reservations", JSON.stringify(reservations));
            localStorage.setItem("max_days", maxDays);

            return true;
        } catch (err) {
            console.error("Restore failed:", err);
            throw err;
        }
    }
};

window.Storage = Storage;
