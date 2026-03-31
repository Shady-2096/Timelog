import { formatDuration, formatTime } from '../utils/time';

export default function EntryList({ entries, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="entry-list-empty">
        <p>No entries yet today. Your timer is running!</p>
      </div>
    );
  }

  return (
    <div className="entry-list">
      <h3 className="entry-list-title">Today's Log</h3>
      {entries.map((entry) => (
        <div key={entry.id} className="entry-item">
          <div className="entry-color" style={{ background: stringToColor(entry.label) }} />
          <div className="entry-info">
            <span className="entry-label">{entry.label}</span>
            <span className="entry-meta">
              {formatTime(entry.startTime)} — {formatTime(entry.endTime)}
            </span>
          </div>
          <div className="entry-duration">{formatDuration(entry.endTime - entry.startTime)}</div>
          <button className="entry-delete" onClick={() => onDelete(entry.id)} title="Delete">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 55%, 55%)`;
}
