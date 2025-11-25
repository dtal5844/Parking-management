// frontend/src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { stateAPI } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [maxDays, setMaxDays] = useState(7);
  const [loading, setLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    loadAppState();
    // Try to restore user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Error parsing saved user:', err);
      }
    }
  }, []);

  const loadAppState = async () => {
    try {
      setLoading(true);
      const data = await stateAPI.getFullState();
      setUsers(data.users || []);
      setReservations(data.reservations || []);
      setParkingSpots(data.parkingSpots || []);
      setMaxDays(data.maxDays || 7);
    } catch (err) {
      console.error('Error loading app state:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const refreshState = async () => {
    await loadAppState();
  };

  const value = {
    currentUser,
    users,
    reservations,
    parkingSpots,
    maxDays,
    loading,
    login,
    logout,
    refreshState,
    setReservations,
    setParkingSpots,
    setMaxDays,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}