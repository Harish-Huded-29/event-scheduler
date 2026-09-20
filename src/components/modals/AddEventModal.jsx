import React, { useState } from 'react';
import { formatDateDMY } from '../../services/formatters.js';

export default function AddEventModal({
  isOpen,
  onSave,
  onClose,
  onOpenDatePicker,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    if (startDate > endDate) return;

    onSave({
      name: name.trim(),
      startDate,
      endDate,
      location: location.trim(),
      remarks: remarks.trim()
    });

    setName('');
    setLocation('');
    setRemarks('');
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">New Event</h2>
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
              <label className="form-label required">Event Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Annual Strategy Summit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Start Date</label>
                <button
                  type="button"
                  className="custom-field-trigger date-picker-trigger"
                  onClick={() => onOpenDatePicker('start', startDate, onStartDateChange, 'Event Start Date')}
                >
                  <span className="custom-field-text">{formatDateDMY(startDate)}</span>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label required">End Date</label>
                <button
                  type="button"
                  className="custom-field-trigger date-picker-trigger"
                  onClick={() => onOpenDatePicker('end', endDate, onEndDateChange, 'Event End Date')}
                >
                  <span className="custom-field-text">{formatDateDMY(endDate)}</span>
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Conference Room A / Hybrid"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Description</label>
              <textarea
                className="form-textarea"
                placeholder="Key objectives, agenda..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
