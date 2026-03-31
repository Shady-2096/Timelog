import { useState, useEffect } from 'react';
import { getStartTimestamp, getMidnightTimestamp, formatDurationLong } from '../utils/time';

export default function Countdown({ dateStr, dayStartTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    function update() {
      const now = Date.now();
      const dayStart = getStartTimestamp(dayStartTime, dateStr);
      const midnight = getMidnightTimestamp(dateStr);
      const totalTrackable = midnight - dayStart;

      if (now < dayStart) {
        // Day hasn't started — show full trackable time
        setRemaining(formatDurationLong(totalTrackable));
      } else if (now >= midnight) {
        setRemaining('00:00:00');
      } else {
        setRemaining(formatDurationLong(midnight - now));
      }
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
