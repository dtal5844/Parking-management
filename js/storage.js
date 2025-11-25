const Storage = {

    // ---- Users ----
    getUsers() {
        try {
            return JSON.parse(localStorage.getItem("parking_users") || "[]");
        } catch {
            return [];
        }
    },

    saveUsers(users) {
        localStorage.setItem("parking_users", JSON.stringify(users));
    },

    // ---- Parking Spots ----
    getParkingSpots() {
        try {
            return JSON.parse(localStorage.getItem("parking_spots") || "[]");
        } catch {
            return [];
        }
    },

    saveParkingSpots(spots) {
        localStorage.setItem("parking_spots", JSON.stringify(spots));
    },

    // ---- Reservations ----
    getReservations() {
        try {
            return JSON.parse(localStorage.getItem("parking_reservations") || "[]");
        } catch {
            return [];
        }
    },

    saveReservations(reservations) {
        localStorage.setItem("parking_reservations", JSON.stringify(reservations));
    },

    // ---- Settings ----
    getMaxDays() {
        return parseInt(localStorage.getItem("max_days") || "7");
    },

    setMaxDays(value) {
        localStorage.setItem("max_days", value);
    },

    // ---- Export Backup ----
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

    // ---- Import Backup ----
    importData(data) {
        if (!data || typeof data !== "object") {
            throw new Error("Invalid backup file");
        }

        const users = Array.isArray(data.users) ? data.users : [];
        const spots = Array.isArray(data.parkingSpots) ? data.parkingSpots : [];
        const reservations = Array.isArray(data.reservations) ? data.reservations : [];
        const maxDays = data.settings?.maxDaysPerMonth || 7;

        localStorage.setItem("parking_users", JSON.stringify(users));
        localStorage.setItem("parking_spots", JSON.stringify(spots));
        localStorage.setItem("parking_reservations", JSON.stringify(reservations));
        localStorage.setItem("max_days", maxDays);

        return true;
    }
};

// Expose globally
window.Storage = Storage;
