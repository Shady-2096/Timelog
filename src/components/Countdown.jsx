import { useState, useEffect } from 'react';
import { getMidnightTimestamp, formatDurationLong } from '../utils/time';

export default function Countdown({ dateStr, dayStartTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function update() {
      const now = Date.now();
      const midnight = getMidnightTimestamp(dateStr);
      const diff = midnight - now;
      setRemaining(diff > 0 ? formatDurationLong(diff) : '00:00:00');
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [dateStr, dayStartTime]);

  return (
    <div className="countdown">
      <span className="countdown-label">remaining</span>
      <span className="countdown-time">{remaining}</span>
    </div>
  );
}
