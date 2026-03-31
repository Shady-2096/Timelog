import { useState, useRef, useEffect } from 'react';
import { formatDuration } from '../utils/time';

export default function SaveModal({ elapsed, onConfirm, onCancel }) {
  const [label, setLabel] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = label.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Log Time Block</h2>
        <div className="modal-duration">{formatDuration(elapsed)}</div>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="What did you do?"
            className="modal-input"
            maxLength={100}
          />
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm" disabled={!label.trim()}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
