import React, { useState, useEffect } from 'react';
import { formatDateDMY } from '../../services/formatters.js';

export default function RescheduleModal({
  isOpen,
  target, // single item or 'all'
  onConfirm,
  onClose,
  onOpenDatePicker,
  onOpenTimePicker
}) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const future = new Date(now.getTime() + 15 * 60 * 1000);
      setDate(future.toISOString().split('T')[0]);
      const h = String(future.getHours()).padStart(2, '0');
      const m = String(future.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickPreset = (minutes) => {
    const now = new Date();
    const future = new Date(now.getTime() + minutes * 60 * 1000);
    setDate(future.toISOString().split('T')[0]);
    const h = String(future.getHours()).padStart(2, '0');
    const m = String(future.getMinutes()).padStart(2, '0');
    setTime(`${h}:${m}`);
  };

  const handleTomorrowPreset = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split('T')[0]);
    setTime('09:00');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) return;
    onConfirm(target, date, time);
  };

  const titleText = target === 'all'
    ? 'Reschedule All Alarms'
    : `Reschedule: ${target?.name || target?.title || 'Alarm'}`;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" style={{ zIndex: 180 }}>
      <div className="modal-dialog" style={{ maxWidth: '380px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{titleText}</h2>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Preset Buttons */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleQuickPreset(15)}
              >
                +15 min
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleQuickPreset(30)}
              >
                +30 min
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => handleQuickPreset(60)}
              >
                +1 hour
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={handleTomorrowPreset}
              >
                Tomorrow 9 AM
              </button>
            </div>

            <div className="form-group">
              <label className="form-label required">New Date</label>
              <button
                type="button"
                className="custom-field-trigger date-picker-trigger"
                onClick={() => onOpenDatePicker('reschedule-date', date, setDate, 'Reschedule Date')}
              >
                <span className="custom-field-text">{formatDateDMY(date)}</span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label required">New Time</label>
              <button
                type="button"
                className="custom-field-trigger time-picker-trigger"
                onClick={() => onOpenTimePicker('reschedule-time', time, setTime)}
              >
                <span className="custom-field-text">{time || 'Select Time'}</span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Set New Time
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
