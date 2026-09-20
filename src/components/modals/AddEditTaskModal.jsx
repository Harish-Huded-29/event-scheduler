import React, { useState, useEffect } from 'react';
import { SOUND_PRESETS } from '../../services/audioEngine.js';
import { formatDateDMY } from '../../services/formatters.js';

export default function AddEditTaskModal({
  isOpen,
  editTask,
  onSave,
  onClose,
  onOpenDatePicker,
  onOpenTimePicker,
  onOpenSoundPicker
}) {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmSound, setAlarmSound] = useState('golden_chime');
  const [calendarActive, setCalendarActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        setName(editTask.name || '');
        setDueDate(editTask.dueDate || '');
        setDueTime(editTask.dueTime || '');
        setPriority(editTask.priority || 'medium');
        setNotes(editTask.notes || '');
        setAlarmActive(Boolean(editTask.alarmActive));
        setAlarmSound(editTask.alarmSound || 'golden_chime');
        setCalendarActive(Boolean(editTask.calendarActive));
      } else {
        const today = new Date().toISOString().split('T')[0];
        setName('');
        setDueDate(today);
        setDueTime('');
        setPriority('medium');
        setNotes('');
        setAlarmActive(false);
        setAlarmSound('golden_chime');
        setCalendarActive(false);
      }
    }
  }, [isOpen, editTask]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !dueDate) return;

    onSave({
      id: editTask?.id,
      name: name.trim(),
      dueDate,
      dueTime,
      priority,
      notes: notes.trim(),
      alarmActive,
      alarmSound,
      calendarActive,
      status: editTask?.status || 'open'
    });
  };

  const currentSoundName = SOUND_PRESETS[alarmSound]?.name || 'Golden Chime';

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</h2>
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
              <label className="form-label required">Task Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Complete quarterly report"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Due Date</label>
                <button
                  type="button"
                  className="custom-field-trigger date-picker-trigger"
                  onClick={() => onOpenDatePicker('task-due', dueDate, setDueDate, 'Task Due Date')}
                >
                  <span className="custom-field-text">{formatDateDMY(dueDate)}</span>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Due Time</label>
                <button
                  type="button"
                  className="custom-field-trigger time-picker-trigger"
                  onClick={() => onOpenTimePicker('task-time', dueTime, setDueTime)}
                >
                  <span className="custom-field-text">{dueTime || 'Select Time'}</span>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
              {editTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
