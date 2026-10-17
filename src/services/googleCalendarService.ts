import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Booking, GoogleCalendarEvent } from '../types';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Calendar scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/calendar');
provider.addScope('https://www.googleapis.com/auth/calendar.events');
provider.addScope('https://www.googleapis.com/auth/calendar.readonly');

// In-memory token cache (strictly NO localStorage per security requirements)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Listeners for auth state changes
type AuthListener = (user: FirebaseUser | null, token: string | null) => void;
const listeners = new Set<AuthListener>();

export const subscribeToCalendarAuth = (listener: AuthListener): (() => void) => {
  listeners.add(listener);
  // Initial callback with current memory state
  listener(auth.currentUser, cachedAccessToken);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = (user: FirebaseUser | null, token: string | null) => {
  listeners.forEach(fn => {
    try {
      fn(user, token);
    } catch (e) {
      console.error('Error notifying calendar auth listener:', e);
    }
  });
};

// Monitor Firebase auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    cachedAccessToken = null;
    notifyListeners(null, null);
  } else if (!isSigningIn && !cachedAccessToken) {
    // User signed in previously but memory cache is empty
    notifyListeners(user, null);
  } else {
    notifyListeners(user, cachedAccessToken);
  }
});

/**
 * Sign in to Google Workspace to authorize Google Calendar
 */
export const signInWithGoogleCalendar = async (): Promise<{ user: FirebaseUser; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan Access Token Google Calendar dari otentikasi Firebase.');
    }

    cachedAccessToken = credential.accessToken;
    notifyListeners(result.user, cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Calendar sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign in with Google strictly for Pemohon account authentication
 */
export const signInWithGoogleAccount = async (): Promise<{
  email: string;
  displayName: string;
  photoURL?: string;
  uid: string;
}> => {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  const result = await signInWithPopup(auth, googleProvider);
  return {
    email: result.user.email || '',
    displayName: result.user.displayName || 'Pemohon Google',
    photoURL: result.user.photoURL || undefined,
    uid: result.user.uid,
  };
};

/**
 * Get current cached access token in memory
 */
export const getCalendarAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Disconnect Google Calendar (Sign out)
 */
export const disconnectGoogleCalendar = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  notifyListeners(null, null);
};

/**
 * Fetch events from the user's primary Google Calendar
 */
export const fetchGoogleCalendarEvents = async (
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> => {
  if (!cachedAccessToken) {
    throw new Error('Google Calendar belum terhubung. Silakan login terlebih dahulu.');
  }

  const min = timeMin || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const max = timeMax || new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
    min
  )}&timeMax=${encodeURIComponent(max)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedAccessToken = null;
      notifyListeners(auth.currentUser, null);
      throw new Error('Sesi Google Calendar telah berakhir. Silakan login kembali.');
    }
    const errBody = await response.text();
    throw new Error(`Gagal mengambil data kalender (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || '(Tanpa Judul)',
    description: item.description,
    location: item.location,
    start: item.start || {},
    end: item.end || {},
    htmlLink: item.htmlLink,
    status: item.status,
  }));
};

/**
 * Create a new event on Google Calendar for a booking
 */
export const createGoogleCalendarEvent = async (
  booking: Booking,
  labName?: string
): Promise<{ id: string; htmlLink: string }> => {
  if (!cachedAccessToken) {
    throw new Error('Google Calendar belum terhubung. Silakan login terlebih dahulu.');
  }

  const resolvedLabName = labName || booking.labName;
  const startDateTime = `${booking.date}T${booking.startTime}:00+07:00`;
  const endDateTime = `${booking.date}T${booking.endTime}:00+07:00`;

  const payload = {
    summary: `[SIMLAB BLSDM] ${booking.activityTitle} - ${resolvedLabName}`,
    description: `KODE BOOKING: ${booking.bookingCode}
Laboratorium: ${resolvedLabName}
Kegiatan: ${booking.activityTitle} (${booking.activityType.toUpperCase()})
Unit Pemohon: ${booking.userUnit}
Penanggung Jawab: ${booking.userName} (${booking.userPhone})
Jumlah Peserta: ${booking.participants} Orang
Fasilitas Dibutuhkan: ${booking.requiredFacilities.length ? booking.requiredFacilities.join(', ') : 'Standar'}
Catatan Tambahan: ${booking.notes || '-'}

Status SIMLAB: Disetujui & Terjadwal
BLSDM KOMDIGI SURABAYA`,
    location: `${resolvedLabName}, BLSDM KOMDIGI SURABAYA, Jl. Raya Ketintang No. 156 Surabaya`,
    start: {
      dateTime: startDateTime,
      timeZone: 'Asia/Jakarta',
    },
    end: {
      dateTime: endDateTime,
      timeZone: 'Asia/Jakarta',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 120 },
      ],
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 401) {
      cachedAccessToken = null;
      notifyListeners(auth.currentUser, null);
      throw new Error('Sesi Google Calendar berakhir. Silakan login kembali.');
    }
    const errBody = await response.text();
    throw new Error(`Gagal membuat jadwal di Google Calendar: ${errBody}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
  };
};

/**
 * Delete an event from Google Calendar (Requires confirmation beforehand)
 */
export const deleteGoogleCalendarEvent = async (eventId: string): Promise<boolean> => {
  if (!cachedAccessToken) {
    throw new Error('Google Calendar belum terhubung.');
  }

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errBody = await response.text();
    throw new Error(`Gagal menghapus event Google Calendar: ${errBody}`);
  }

  return true;
};
