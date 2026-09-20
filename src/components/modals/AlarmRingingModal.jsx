import React, { useEffect, useState } from 'react';
import { audioEngine, SOUND_PRESETS } from '../../services/audioEngine.js';
import { nativeBridge } from '../../services/nativeBridge.js';

export default function AlarmRingingModal({
  isOpen,
  ringingList,
  onDismissSingle,
  onDismissAll,
  onSnoozeMinutes,
  onOpenReschedule
}) {
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes = 180s

  useEffect(() => {
    if (isOpen && ringingList.length > 0) {
      setSecondsLeft(180);

      // Start audio chime and vibration
      const firstSound = ringingList[0].alarmSound || 'golden_chime';
      audioEngine.startRinging(firstSound);
      nativeBridge.startVibration();

      // 3-minute countdown timer
      const interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(interval);
        audioEngine.stopRinging();
        nativeBridge.stopVibration();
      };
    } else {
      audioEngine.stopRinging();
      nativeBridge.stopVibration();
    }
  }, [isOpen, ringingList]);

  if (!isOpen || ringingList.length === 0) return null;

  const handleAutoTimeout = () => {
    audioEngine.stopRinging();
    nativeBridge.stopVibration();
    // For each item, if schedule -> auto-reschedule +10m; if task -> dismiss
    ringingList.forEach((item) => {
      if (item.itemType === 'schedule') {
        onSnoozeMinutes(item, 10);
      } else {
        onDismissSingle(item);
      }
    });
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" style={{ zIndex: 120 }}>
      <div className="modal-dialog modal-alarm-dialog" style={{ maxWidth: '440px' }}>
        {/* Pulsing Alarm Icon Banner */}
        <div className="alarm-banner">
          <div className="alarm-icon-pulse">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <h2 className="alarm-banner-title">
            {ringingList.length === 1 ? 'ALARM RINGING' : `${ringingList.length} ALARMS RINGING`}
          </h2>
          <div className="alarm-timeout-badge">
            Auto-silence in: <strong>{formatTimer(secondsLeft)}</strong>
          </div>
        </div>

        {/* Ringing Items List */}
        <div className="modal-body" style={{ maxHeight: '280px', overflowY: 'auto', padding: '12px 16px' }}>
          <div className="ringing-cards-container">
            {ringingList.map((item) => (
              <div key={item.id || item.alarmId} className="ringing-alarm-card">
                <div className="ringing-card-header">
                  <div className="ringing-card-title">{item.name || item.title}</div>
                  <span className={`ringing-type-badge ${item.itemType || 'task'}`}>
                    {(item.itemType || 'task').toUpperCase()}
                  </span>
                </div>
                <div className="ringing-card-time">
                  Scheduled for: {item.dueDate || item.date} {item.dueTime || item.time || ''}
                </div>

                {/* Quick Snooze Chips for this item */}
                <div className="snooze-chips-row">
                  <span className="snooze-label">Remind in:</span>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => onSnoozeMinutes(item, 5)}
                  >
                    +5 min
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => onSnoozeMinutes(item, 10)}
                  >
                    +10 min
                  </button>
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => onSnoozeMinutes(item, 15)}
                  >
                    +15 min
                  </button>
                </div>

                {/* Individual Action Buttons */}
                <div className="ringing-card-actions">
                  <button
                    type="button"
                    className="btn-alarm-action btn-alarm-resched"
                    onClick={() => onOpenReschedule(item)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    Reschedule
                  </button>
                  <button
                    type="button"
                    className="btn-alarm-action btn-alarm-dismiss"
                    onClick={() => onDismissSingle(item)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Turn Off
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Alarm Batch Controls */}
        {ringingList.length > 1 && (
          <div className="batch-actions-panel">
            <div className="batch-snooze-row">
              <span className="batch-label">Snooze All:</span>
              <button
                type="button"
                className="chip-btn batch-chip"
                onClick={() => onSnoozeMinutes('all', 5)}
              >
                All +5m
              </button>
              <button
                type="button"
                className="chip-btn batch-chip"
                onClick={() => onSnoozeMinutes('all', 10)}
              >
                All +10m
              </button>
              <button
                type="button"
                className="chip-btn batch-chip"
                onClick={() => onSnoozeMinutes('all', 15)}
              >
                All +15m
              </button>
            </div>
            <div className="batch-btn-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenReschedule('all')}
                style={{ flex: 1 }}
              >
                Reschedule All
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onDismissAll}
                style={{ flex: 1 }}
              >
                Turn Off All ({ringingList.length})
              </button>
            </div>
          </div>
        )}

        {ringingList.length === 1 && (
          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-danger"
              style={{ width: '100%', padding: '12px 0', fontSize: '1rem' }}
              onClick={() => onDismissSingle(ringingList[0])}
            >
              Turn Off Alarm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
