// Storage Module - Manages all localStorage operations
const Storage = {
    // Keys
    KEYS: {
        CURRENT_USER: 'parkingCurrentUser',
        USERS: 'parkingUsers',
        RESERVATIONS: 'parkingReservations',
        MAX_DAYS: 'parkingMaxDays',
        PARKING_SPOTS: 'parkingSpots'
    },

    // Default data
    DEFAULT_USERS: [
        { id: 1, username: 'admin', password: 'admin123', isAdmin: true, name: 'מנהל', apartment: 'מנהל' },
        { id: 2, username: 'dani', password: '1234', isAdmin: false, name: 'דני כהן', apartment: 'דירה 5' }
    ],

    DEFAULT_PARKING_SPOTS: [
        { id: 1, number: 'P1' },
        { id: 2, number: 'P2' },
        { id: 3, number: 'P3' },
        { id: 4, number: 'P4' },
        { id: 5, number: 'P5' }
    ],

    DEFAULT_MAX_DAYS: 7,

    // Get current user
    getCurrentUser() {
        const data = localStorage.getItem(this.KEYS.CURRENT_USER);
        return data ? JSON.parse(data) : null;
    },

    // Set current user
    setCurrentUser(user) {
        if (user) {
            localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.KEYS.CURRENT_USER);
        }
    },

    // Get all users
    getUsers() {
        const data = localStorage.getItem(this.KEYS.USERS);
        return data ? JSON.parse(data) : this.DEFAULT_USERS;
    },

    // Save users
    saveUsers(users) {
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    },

    // Get reservations
    getReservations() {
        const data = localStorage.getItem(this.KEYS.RESERVATIONS);
        return data ? JSON.parse(data) : [];
    },

    // Save reservations
    saveReservations(reservations) {
        localStorage.setItem(this.KEYS.RESERVATIONS, JSON.stringify(reservations));
    },

    // Get max days per month
    getMaxDays() {
        const data = localStorage.getItem(this.KEYS.MAX_DAYS);
        return data ? parseInt(data) : this.DEFAULT_MAX_DAYS;
    },

    // Save max days per month
    saveMaxDays(days) {
        localStorage.setItem(this.KEYS.MAX_DAYS, days.toString());
    },

    // Get parking spots
    getParkingSpots() {
        const data = localStorage.getItem(this.KEYS.PARKING_SPOTS);
        return data ? JSON.parse(data) : this.DEFAULT_PARKING_SPOTS;
    },

    // Save parking spots
    saveParkingSpots(spots) {
        localStorage.setItem(this.KEYS.PARKING_SPOTS, JSON.stringify(spots));
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    },

    // Export data (for backup)
    exportData() {
        return {
            users: this.getUsers(),
            reservations: this.getReservations(),
            maxDays: this.getMaxDays(),
            parkingSpots: this.getParkingSpots(),
            exportDate: new Date().toISOString()
        };
    },

    // Import data (from backup)
    importData(data) {
        if (data.users) this.saveUsers(data.users);
        if (data.reservations) this.saveReservations(data.reservations);
        if (data.maxDays) this.saveMaxDays(data.maxDays);
        if (data.parkingSpots) this.saveParkingSpots(data.parkingSpots);
    }
};

// Export for use in other files
window.Storage = Storage;