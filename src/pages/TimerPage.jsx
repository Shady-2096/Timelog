import { useState, useEffect, useCallback, useRef } from 'react';
import Timer from '../components/Timer';
import Countdown from '../components/Countdown';
import SaveModal from '../components/SaveModal';
import EntryList from '../components/EntryList';
import {
  getSettings,
  getDayState,
  saveDayState,
  saveEntry,
  getEntriesForDate,
  deleteEntry,
} from '../utils/storage';
import {
  getTodayStr,
  getStartTimestamp,
  getMidnightTimestamp,
  generateId,
} from '../utils/time';

export default function TimerPage() {
  const [settings, setSettings] = useState(getSettings);
  const [todayStr, setTodayStr] = useState(getTodayStr);
  const [timerStart, setTimerStart] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingSnapshot, setPendingSnapshot] = useState(null);
  const [dayStatus, setDayStatus] = useState('active');

  const initDay = useCallback(() => {
    // Re-read settings and date on every init (handles settings changes + midnight)
    const freshSettings = getSettings();
    setSettings(freshSettings);
    const today = getTodayStr();
    setTodayStr(today);

    const now = Date.now();
    const dayStart = getStartTimestamp(freshSettings.dayStartTime, today);
    const midnight = getMidnightTimestamp(today);

    if (now < dayStart) {
      setDayStatus('before');
      setTimerStart(null);
      setEntries(getEntriesForDate(today));
      return;
    }

    if (now >= midnight) {
      setDayStatus('ended');
      setTimerStart(null);
      setEntries(getEntriesForDate(today));
      return;
    }

    setDayStatus('active');

    const state = getDayState();
    if (state.date === today && state.currentTimerStart) {
      setTimerStart(state.currentTimerStart);
    } else {
      const todayEntries = getEntriesForDate(today);
      const start = todayEntries.length > 0
        ? todayEntries[todayEntries.length - 1].endTime
        : dayStart;
      setTimerStart(start);
      saveDayState({ date: today, currentTimerStart: start });
    }

    setEntries(getEntriesForDate(today));
  }, []);

  // Run on mount
  useEffect(() => {
    initDay();
  }, [initDay]);

  // Re-init when app comes back to foreground (Bug 3 fix)
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        initDay();
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [initDay]);

  // Bug 4 fix: snapshot endTime when user clicks "Save Block", not when modal confirms
  function handleSaveClick(elapsed) {
    setPendingSnapshot({ endTime: Date.now(), elapsed });
    setShowModal(true);
  }

  function handleConfirm(label) {
    const today = getTodayStr();
    const endTime = pendingSnapshot.endTime;
    const entry = {
      id: generateId(),
      date: today,
      label,
      startTime: timerStart,
      endTime,
      durationMinutes: Math.round((endTime - timerStart) / 60000),
    };
    const updated = saveEntry(entry);
    setEntries(updated.filter((e) => e.date === today));
    setTimerStart(endTime);
    saveDayState({ date: today, currentTimerStart: endTime });
    setShowModal(false);
    setPendingSnapshot(null);
  }

  // Bug 5 fix: recalculate timer start after delete
  function handleDelete(id) {
    const today = getTodayStr();
    const updated = deleteEntry(id);
    const todayEntries = updated.filter((e) => e.date === today);
    setEntries(todayEntries);

    // Recalculate timer start: last entry's endTime, or day start
    if (dayStatus === 'active') {
      const freshSettings = getSettings();
      const dayStart = getStartTimestamp(freshSettings.dayStartTime, today);
      const newTimerStart = todayEntries.length > 0
        ? todayEntries[todayEntries.length - 1].endTime
        : dayStart;
      setTimerStart(newTimerStart);
      saveDayState({ date: today, currentTimerStart: newTimerStart });
    }
  }

  return (
    <div className="page timer-page">
      <header className="timer-header">
        <div className="header-left">
          <h1 className="app-title">Time Log</h1>
          <span className="header-date">{formatDisplayDate(todayStr)}</span>
        </div>
        <Countdown dateStr={todayStr} dayStartTime={settings.dayStartTime} />
      </header>

      <main className="timer-main">
        {dayStatus === 'before' && (
          <div className="timer-message">
            <div className="timer-message-icon">🌅</div>
            <p>Your day starts at <strong>{settings.dayStartTime}</strong></p>
            <p className="timer-message-sub">The timer will begin automatically.</p>
          </div>
        )}

        {dayStatus === 'ended' && (
          <div className="timer-message">
            <div className="timer-message-icon">🌙</div>
            <p>Day has ended</p>
            <p className="timer-message-sub">Check your analysis to review today.</p>
          </div>
        )}

        {dayStatus === 'active' && (
          <Timer startTimestamp={timerStart} onSave={handleSaveClick} />
        )}

        <EntryList entries={entries} onDelete={handleDelete} dayStatus={dayStatus} />
      </main>

      {showModal && pendingSnapshot && (
        <SaveModal
          elapsed={pendingSnapshot.elapsed}
          onConfirm={handleConfirm}
          onCancel={() => { setShowModal(false); setPendingSnapshot(null); }}
        />
      )}
    </div>
  );
}

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
