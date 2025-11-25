// frontend/src/services/api.js - API Service Layer

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'שגיאה בשרת');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: async (username, password) => {
    return apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (userData) => {
    return apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
};

// State API
export const stateAPI = {
  getFullState: async () => {
    return apiCall('/state');
  },
};

// Reservations API
export const reservationsAPI = {
  create: async (reservationData) => {
    return apiCall('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },

  cancel: async (reservationData) => {
    return apiCall('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },
};

// Barrier API
export const barrierAPI = {
  open: async (code, date) => {
    return apiCall('/barrier', {
      method: 'POST',
      body: JSON.stringify({ code, date }),
    });
  },
};

// Settings API
export const settingsAPI = {
  updateMaxDays: async (maxDays) => {
    return apiCall('/settings/maxDays', {
      method: 'PATCH',
      body: JSON.stringify({ maxDays }),
    });
  },
};

// Admin Users API
export const adminUsersAPI = {
  getAll: async () => {
    return apiCall('/admin/users');
  },

  update: async (userId, userData) => {
    return apiCall(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  delete: async (userId) => {
    return apiCall(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Admin Parking Spots API
export const adminSpotsAPI = {
  getAll: async () => {
    return apiCall('/admin/spots');
  },

  create: async (number) => {
    return apiCall('/admin/spots', {
      method: 'POST',
      body: JSON.stringify({ number }),
    });
  },

  update: async (spotId, number) => {
    return apiCall(`/admin/spots/${spotId}`, {
      method: 'PATCH',
      body: JSON.stringify({ number }),
    });
  },

  delete: async (spotId) => {
    return apiCall(`/admin/spots/${spotId}`, {
      method: 'DELETE',
    });
  },
};

// Admin Backup/Restore API
export const adminBackupAPI = {
  download: async () => {
    // Special handling for file download
    const response = await fetch(`${API_BASE_URL}/admin/backup`);
    if (!response.ok) {
      throw new Error('שגיאה בהורדת גיבוי');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parking-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  restore: async (backupData) => {
    return apiCall('/admin/restore', {
      method: 'POST',
      body: JSON.stringify(backupData),
    });
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiCall('/health');
  },
};