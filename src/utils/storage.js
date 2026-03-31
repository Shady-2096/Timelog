const SETTINGS_KEY = 'timelog_settings';
const ENTRIES_KEY = 'timelog_entries';
const STATE_KEY = 'timelog_state';

const defaults = {
  settings: {
    dayStartTime: '08:00',
  },
  state: {
    currentTimerStart: null,
    date: null,
  },
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { ...defaults.settings };
  } catch {
    return { ...defaults.settings };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getDayState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    return raw ? JSON.parse(raw) : { ...defaults.state };
  } catch {
    return { ...defaults.state };
  }
}

export function saveDayState(state) {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

export function getEntries() {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEntry(entry) {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entries;
}

export function getEntriesForDate(dateStr) {
  return getEntries().filter((e) => e.date === dateStr);
}

export function getAllDates() {
  const entries = getEntries();
  const dates = [...new Set(entries.map((e) => e.date))];
  return dates.sort().reverse();
}

export function deleteEntry(id) {
  const entries = getEntries().filter((e) => e.id !== id);
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  return entries;
}
