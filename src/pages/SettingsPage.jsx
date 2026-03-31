import { useState } from 'react';
import { getSettings, saveSettings } from '../utils/storage';
import Countdown from '../components/Countdown';
import { getTodayStr } from '../utils/time';

export default function SettingsPage() {
  const todayStr = getTodayStr();
  const [settings, setSettingsState] = useState(getSettings);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const updated = { ...settings, dayStartTime: e.target.value };
    setSettingsState(updated);
    setSaved(false);
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const [h, m] = settings.dayStartTime.split(':').map(Number);
  const totalHours = 24 - h - m / 60;

  return (
    <div className="page settings-page">
      <header className="timer-header">
        <div className="header-left">
          <h1 className="app-title">Settings</h1>
        </div>
        <Countdown dateStr={todayStr} dayStartTime={settings.dayStartTime} />
      </header>

      <div className="settings-content">
        <div className="setting-group">
          <label className="setting-label">Day Start Time</label>
          <p className="setting-desc">
            Your timer will automatically start at this time each day and run until midnight.
          </p>
          <input
            type="time"
            value={settings.dayStartTime}
            onChange={handleChange}
            className="setting-input"
          />
          <p className="setting-info">
            Total trackable hours: <strong>{totalHours.toFixed(1)}h</strong>
          </p>
        </div>

        <button className="btn-confirm" onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </button>

        <div className="setting-group" style={{ marginTop: '2rem' }}>
          <label className="setting-label">About</label>
          <p className="setting-desc">
            Time Log helps you track how you spend your day. The timer runs
            continuously from your start time to midnight — just check in
            periodically to log what you've been doing.
          </p>
          <p className="setting-desc" style={{ marginTop: '0.5rem', opacity: 0.6 }}>
            All data is stored locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
