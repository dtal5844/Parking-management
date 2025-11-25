// api/lib/storage.js - Vercel KV Storage Helper
import { kv } from '@vercel/kv';

// ----- נתוני ברירת מחדל -----
const DEFAULT_DATA = {
  users: [
    { id: 1, username: 'admin', password: 'admin123', isAdmin: true, name: 'מנהל', apartment: 'מנהל' },
    { id: 2, username: 'dani', password: '1234', isAdmin: false, name: 'דני כהן', apartment: 'דירה 5' }
  ],
  reservations: [],
  parkingSpots: [
    { id: 1, number: 'P1' },
    { id: 2, number: 'P2' },
    { id: 3, number: 'P3' },
    { id: 4, number: 'P4' },
    { id: 5, number: 'P5' }
  ],
  maxDays: 7
};

// Keys for KV storage
const KEYS = {
  USERS: 'parking:users',
  RESERVATIONS: 'parking:reservations',
  PARKING_SPOTS: 'parking:parkingSpots',
  MAX_DAYS: 'parking:maxDays'
};

// ----- Initialize data if not exists -----
async function initializeData() {
  try {
    const users = await kv.get(KEYS.USERS);
    if (!users) {
      await kv.set(KEYS.USERS, DEFAULT_DATA.users);
      await kv.set(KEYS.RESERVATIONS, DEFAULT_DATA.reservations);
      await kv.set(KEYS.PARKING_SPOTS, DEFAULT_DATA.parkingSpots);
      await kv.set(KEYS.MAX_DAYS, DEFAULT_DATA.maxDays);
    }
  } catch (err) {
    console.error('Error initializing data:', err);
  }
}

// ----- Load full state -----
export async function loadData() {
  await initializeData();

  try {
    const [users, reservations, parkingSpots, maxDays] = await Promise.all([
      kv.get(KEYS.USERS),
      kv.get(KEYS.RESERVATIONS),
      kv.get(KEYS.PARKING_SPOTS),
      kv.get(KEYS.MAX_DAYS)
    ]);

    return {
      users: users || DEFAULT_DATA.users,
      reservations: reservations || DEFAULT_DATA.reservations,
      parkingSpots: parkingSpots || DEFAULT_DATA.parkingSpots,
      maxDays: maxDays || DEFAULT_DATA.maxDays
    };
  } catch (err) {
    console.error('Error loading data:', err);
    return { ...DEFAULT_DATA };
  }
}

// ----- Save individual components -----
export async function saveUsers(users) {
  await kv.set(KEYS.USERS, users);
}

export async function saveReservations(reservations) {
  await kv.set(KEYS.RESERVATIONS, reservations);
}

export async function saveParkingSpots(parkingSpots) {
  await kv.set(KEYS.PARKING_SPOTS, parkingSpots);
}

export async function saveMaxDays(maxDays) {
  await kv.set(KEYS.MAX_DAYS, maxDays);
}

// ----- Helper to save full data object -----
export async function saveData(data) {
  await Promise.all([
    kv.set(KEYS.USERS, data.users),
    kv.set(KEYS.RESERVATIONS, data.reservations),
    kv.set(KEYS.PARKING_SPOTS, data.parkingSpots),
    kv.set(KEYS.MAX_DAYS, data.maxDays)
  ]);
}