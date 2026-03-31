import { useState, useEffect } from 'react';
import { formatDuration } from '../utils/time';

export default function Timer({ startTimestamp, onSave }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTimestamp) return;
    function update() {
      setElapsed(Math.max(0, Date.now() - startTimestamp));
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTimestamp]);

  if (!startTimestamp) return null;

  return (
    <div className="timer">
      <div className="timer-elapsed">{formatDuration(elapsed)}</div>
      <div className="timer-subtitle">elapsed</div>
      <button className="btn-save" onClick={() => onSave(elapsed)}>
        Save Block
      </button>
    </div>
  );
}
