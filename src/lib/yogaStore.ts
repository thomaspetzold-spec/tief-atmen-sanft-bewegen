import { ref, get, set } from 'firebase/database';
import { db } from './firebase';

export type LocationType = 'indoor' | 'outdoor';

export interface YogaSession {
  id: string;
  date: string;
  time: string;
  duration: number;
  locationType: LocationType;
  maxSpots: number;
  attendees: string[];
}

export interface AttendanceRecord {
  name: string;
  sessions: number;
}

export const INDOOR_MAX_SPOTS = 6;
export const OUTDOOR_MAX_SPOTS = 15;

const TEST_SESSION_ID = 'session-test';

const TEST_SESSION: YogaSession = {
  id: TEST_SESSION_ID,
  date: new Date().toISOString().split('T')[0],
  time: '10:00',
  duration: 60,
  locationType: 'outdoor',
  maxSpots: OUTDOOR_MAX_SPOTS,
  attendees: [],
};

export const getLocationLabel = (type: LocationType): string => {
  return type === 'indoor' ? 'Drinnen' : 'Draußen';
};

const generateInitialSessions = (): YogaSession[] => {
  const sessions: YogaSession[] = [];
  const today = new Date();

  for (let i = 0; i < 28; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() === 2) {
      sessions.push({
        id: `session-${date.toISOString().split('T')[0]}-evening`,
        date: date.toISOString().split('T')[0],
        time: '18:00',
        duration: 60,
        locationType: 'outdoor',
        maxSpots: OUTDOOR_MAX_SPOTS,
        attendees: [],
      });
    }
  }
  return sessions;
};

export const getSessions = async (): Promise<YogaSession[]> => {
  const snapshot = await get(ref(db, 'sessions'));
  let sessions: YogaSession[] = [];

  if (snapshot.exists()) {
    sessions = (snapshot.val() as YogaSession[]).map(s => ({
      ...s,
      attendees: s.attendees ?? [],
    }));
  } else {
    sessions = generateInitialSessions();
    await set(ref(db, 'sessions'), sessions);
  }

  if (!sessions.find(s => s.id === TEST_SESSION_ID)) {
    sessions = [TEST_SESSION, ...sessions];
  }
  return sessions;
};

export const saveSessions = async (sessions: YogaSession[]): Promise<void> => {
  await set(ref(db, 'sessions'), sessions);
};

export const getCapacity = async (): Promise<{ indoor: number; outdoor: number }> => {
  const snapshot = await get(ref(db, 'config/capacity'));
  if (snapshot.exists()) return snapshot.val();
  return { indoor: INDOOR_MAX_SPOTS, outdoor: OUTDOOR_MAX_SPOTS };
};

export const saveCapacity = async (indoor: number, outdoor: number): Promise<void> => {
  await set(ref(db, 'config/capacity'), { indoor, outdoor });
  const sessions = await getSessions();
  const updated = sessions.map(s => ({
    ...s,
    maxSpots: s.locationType === 'indoor' ? indoor : outdoor,
  }));
  await saveSessions(updated);
};

export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  const snapshot = await get(ref(db, 'attendance'));
  if (snapshot.exists()) return snapshot.val();
  return [];
};

export const saveAttendance = async (attendance: AttendanceRecord[]): Promise<void> => {
  await set(ref(db, 'attendance'), attendance);
};

export const updateSessionLocation = async (sessionId: string, locationType: LocationType): Promise<void> => {
  const sessions = await getSessions();
  const capacity = await getCapacity();
  const updated = sessions.map(s => {
    if (s.id !== sessionId) return s;
    const newMax = locationType === 'indoor' ? capacity.indoor : capacity.outdoor;
    return {
      ...s,
      locationType,
      maxSpots: newMax,
      attendees: s.attendees.slice(0, newMax),
    };
  });
  await saveSessions(updated);
};

export const checkIn = async (sessionId: string, name: string): Promise<{ success: boolean; message: string }> => {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) return { success: false, message: 'Bitte gib deinen Namen ein' };

  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return { success: false, message: 'Termin nicht gefunden' };
  if (session.attendees.some(a => a.toLowerCase() === normalizedName))
    return { success: false, message: 'Du bist bereits für diesen Termin angemeldet' };
  if (session.attendees.length >= session.maxSpots)
    return { success: false, message: 'Dieser Termin ist leider voll' };

  session.attendees.push(name.trim());
  await saveSessions(sessions);

  const attendance = await getAttendance();
  const record = attendance.find(a => a.name.toLowerCase() === normalizedName);
  if (record) {
    record.sessions += 1;
    record.name = name.trim();
  } else {
    attendance.push({ name: name.trim(), sessions: 1 });
  }
  await saveAttendance(attendance);

  return { success: true, message: `Willkommen, ${name.trim()}! Du bist angemeldet.` };
};

export const cancelCheckIn = async (sessionId: string, name: string): Promise<{ success: boolean; message: string }> => {
  const normalizedName = name.trim().toLowerCase();
  const sessions = await getSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return { success: false, message: 'Termin nicht gefunden' };

  const idx = session.attendees.findIndex(a => a.toLowerCase() === normalizedName);
  if (idx === -1) return { success: false, message: 'Du bist nicht für diesen Termin angemeldet' };

  session.attendees.splice(idx, 1);
  await saveSessions(sessions);

  const attendance = await getAttendance();
  const record = attendance.find(a => a.name.toLowerCase() === normalizedName);
  if (record && record.sessions > 0) record.sessions -= 1;
  await saveAttendance(attendance);

  return { success: true, message: 'Dein Platz wurde freigegeben' };
};

export const resetAttendance = async (): Promise<void> => {
  await set(ref(db, 'attendance'), []);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes} Uhr`;
};
