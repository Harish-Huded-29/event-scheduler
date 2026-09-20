import React, { useState, useEffect } from 'react';
import { SOUND_PRESETS } from '../../services/audioEngine.js';
import { formatDateDMY } from '../../services/formatters.js';

export default function AddEditScheduleModal({
  isOpen,
  editItem,
  onSave,
  onClose,
  onOpenDatePicker,
  onOpenTimePicker,
  onOpenSoundPicker
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmSound, setAlarmSound] = useState('golden_chime');
  const [calendarActive, setCalendarActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setTitle(editItem.title || '');
        setDate(editItem.date || '');
        setTime(editItem.time || '');
        setNotes(editItem.notes || '');
        setAlarmActive(Boolean(editItem.alarmActive));
        setAlarmSound(editItem.alarmSound || 'golden_chime');
        setCalendarActive(Boolean(editItem.calendarActive));
      } else {
        const today = new Date().toISOString().split('T')[0];
        setTitle('');
        setDate(today);
        setTime('');
        setNotes('');
        setAlarmActive(false);
        setAlarmSound('golden_chime');
        setCalendarActive(false);
      }
    }
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onSave({
      id: editItem?.id,
      title: title.trim(),
      date,
      time,
      notes: notes.trim(),
      alarmActive,
      alarmSound,
      calendarActive
    });
  };

  const currentSoundName = SOUND_PRESETS[alarmSound]?.name || 'Golden Chime';

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">{editItem ? 'Edit Schedule Entry' : 'New Schedule Entry'}</h2>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">Activity / Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Team Standup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required">Date</label>
              <button
                type="button"
                className="custom-field-trigger date-picker-trigger"
                onClick={() => onOpenDatePicker('schedule-date', date, setDate, 'Activity Date')}
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
              <label className="form-label">Time</label>
              <button
                type="button"
                className="custom-field-trigger time-picker-trigger"
                onClick={() => onOpenTimePicker('schedule-time', time, setTime)}
              >
                <span className="custom-field-text">{time || 'Select Time'}</span>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                placeholder="Optional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="switch-group">
              <label className="switch-label">
                <span className="switch-text">Set alarm (sound & chime)</span>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={alarmActive}
                  onChange={(e) => setAlarmActive(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>

              {alarmActive && (
                <div style={{ paddingTop: '6px', borderTop: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>
                    Alarm Ringtone / Sound
                  </label>
                  <button
                    type="button"
                    className="custom-field-trigger"
                    onClick={() => onOpenSoundPicker(alarmSound, setAlarmSound)}
                  >
                    <span className="custom-field-text">{currentSoundName}</span>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  </button>
                </div>
              )}

              <label className="switch-label">
                <span className="switch-text">Add to calendar</span>
                <input
                  type="checkbox"
                  className="switch-input"
                  checked={calendarActive}
                  onChange={(e) => setCalendarActive(e.target.checked)}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editItem ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
