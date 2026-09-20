import React from 'react';
import { SOUND_PRESETS } from '../../services/audioEngine.js';
import { formatDateDMY, formatDateTimeDMY } from '../../services/formatters.js';

export default function ItemDetailModal({
  isOpen,
  item,
  type, // 'task', 'schedule', 'event'
  onClose,
  onEdit,
  onToggleTask,
  onDelete,
  onTurnOffAlarm
}) {
  if (!isOpen || !item) return null;

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true">
      <div className="modal-dialog">
        <div className="modal-header">
          <h2 className="modal-title">
            {type === 'task' ? 'Task Details' : type === 'schedule' ? 'Schedule Entry' : 'Event Details'}
          </h2>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-list">
            {type === 'task' && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Task Name</span>
                  <span
                    className="detail-value"
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                      color: item.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)'
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Due Date & Time</span>
                  <span className="detail-value">
                    {formatDateDMY(item.dueDate)} {item.dueTime ? `at ${item.dueTime}` : ''}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority</span>
                  <span className="detail-value">
                    <span className={`priority-dot ${item.priority || 'medium'}`}></span>
                    <span style={{ textTransform: 'capitalize' }}>{item.priority || 'medium'}</span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span
                    className="detail-value"
                    style={{
                      textTransform: 'capitalize',
                      fontWeight: 500,
                      color: item.status === 'completed' ? 'var(--accent-sage)' : 'var(--accent-gold)'
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Alarm Reminder</span>
                  <div>
                    <span className={`detail-status-badge ${item.alarmActive ? 'on' : 'off'}`}>
                      ● Alarm: {item.alarmActive ? `On (${SOUND_PRESETS[item.alarmSound]?.name || 'Golden Chime'})` : 'Off'}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Calendar Entry</span>
                  <div>
                    <span className={`detail-status-badge ${item.calendarActive ? 'on' : 'off'}`}>
                      ● Calendar: {item.calendarActive ? 'On' : 'Off'}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{item.notes || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Added On</span>
                  <span className="detail-value" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {formatDateTimeDMY(item.createdAt)}
                  </span>
                </div>
              </>
            )}

            {type === 'schedule' && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Activity / Title</span>
                  <span className="detail-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {item.title}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date & Time</span>
                  <span className="detail-value">
                    {formatDateDMY(item.date)} {item.time || ''}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Alarm Status</span>
                  <span
                    className="detail-value"
                    style={{
                      color: item.alarmActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontWeight: 600
                    }}
                  >
                    {item.alarmActive ? `⏰ Active (${SOUND_PRESETS[item.alarmSound]?.name || 'Golden Chime'})` : 'Off'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{item.notes || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Added On</span>
                  <span className="detail-value" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {formatDateTimeDMY(item.createdAt)}
                  </span>
                </div>
              </>
            )}

            {type === 'event' && (
              <>
                <div className="detail-item">
                  <span className="detail-label">Event Name</span>
                  <span className="detail-value" style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {item.name}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Start Date</span>
                  <span className="detail-value">{formatDateDMY(item.startDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">End Date</span>
                  <span className="detail-value">{formatDateDMY(item.endDate)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{item.location || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Remarks</span>
                  <span className="detail-value">{item.remarks || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Added On</span>
                  <span className="detail-value" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {formatDateTimeDMY(item.createdAt)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {type === 'task' && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
              >
                Edit Task
              </button>
              <button
                type="button"
                className={`btn ${item.status === 'completed' ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => {
                  onClose();
                  onToggleTask(item);
                }}
              >
                {item.status === 'completed' ? 'Mark Open' : 'Mark Done'}
              </button>
            </>
          )}

          {type === 'schedule' && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
              >
                Edit Schedule
              </button>
              {item.alarmActive && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    onClose();
                    onTurnOffAlarm(item);
                  }}
                >
                  Turn Off Alarm
                </button>
              )}
            </>
          )}

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onClose();
              onDelete(item);
            }}
          >
            Delete
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
