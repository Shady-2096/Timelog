import { useState, useEffect, useCallback } from 'react';
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
  const [settings] = useState(getSettings);
  const [todayStr] = useState(getTodayStr);
  const [timerStart, setTimerStart] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingElapsed, setPendingElapsed] = useState(0);
  const [dayStatus, setDayStatus] = useState('active'); // 'before' | 'active' | 'ended'

  const initDay = useCallback(() => {
    const today = getTodayStr();
    const now = Date.now();
    const dayStart = getStartTimestamp(settings.dayStartTime, today);
    const midnight = getMidnightTimestamp(today);

    if (now < dayStart) {
      setDayStatus('before');
      setTimerStart(null);
      return;
    }

    if (now >= midnight) {
      setDayStatus('ended');
      setTimerStart(null);
      return;
    }

    setDayStatus('active');

    const state = getDayState();
    // If we have a saved timer start for today, use it
    if (state.date === today && state.currentTimerStart) {
      setTimerStart(state.currentTimerStart);
    } else {
      // First open today — check if there are entries
      const todayEntries = getEntriesForDate(today);
      const start = todayEntries.length > 0
        ? todayEntries[todayEntries.length - 1].endTime
        : dayStart;
      setTimerStart(start);
      saveDayState({ date: today, currentTimerStart: start });
    }

    setEntries(getEntriesForDate(today));
  }, [settings.dayStartTime]);

  useEffect(() => {
    initDay();
  }, [initDay]);

  function handleSaveClick(elapsed) {
    setPendingElapsed(elapsed);
    setShowModal(true);
  }

  function handleConfirm(label) {
    const now = Date.now();
    const entry = {
      id: generateId(),
      date: todayStr,
      label,
      startTime: timerStart,
      endTime: now,
      durationMinutes: Math.round((now - timerStart) / 60000),
    };
    const updated = saveEntry(entry);
    setEntries(updated.filter((e) => e.date === todayStr));
    setTimerStart(now);
    saveDayState({ date: todayStr, currentTimerStart: now });
    setShowModal(false);
  }

  function handleDelete(id) {
    const updated = deleteEntry(id);
    setEntries(updated.filter((e) => e.date === todayStr));
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

        <EntryList entries={entries} onDelete={handleDelete} />
      </main>

      {showModal && (
        <SaveModal
          elapsed={pendingElapsed}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
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
