import React from 'react';
import { formatDateDMY } from '../../services/formatters.js';

export default function ScheduleView({
  scheduleList,
  onItemClick,
  onDeleteClick,
  onTurnOffAlarmClick
}) {
  const formatDateDisplay = (dateStr, timeStr) => {
    if (!dateStr) return '—';
    const formatted = formatDateDMY(dateStr);
    return timeStr ? `${formatted} ${timeStr}` : formatted;
  };

  return (
    <div className="tab-pane active">
      {scheduleList.length === 0 ? (
        <div className="empty-state" style={{ display: 'block' }}>
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="empty-title">No schedule entries</div>
          <div className="empty-desc">Tap the + button to schedule a meeting, call, or event</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-title">Activity / Title</th>
                <th className="col-date">Date & Time</th>
                <th className="col-action"></th>
              </tr>
            </thead>
            <tbody>
              {scheduleList.map((item, index) => {
                return (
                  <tr key={item.id} onClick={() => onItemClick(item)}>
                    <td className="col-num">{index + 1}</td>
                    <td className="cell-title">
                      <div>{item.title}</div>
                      {item.alarmActive && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                            ⏰ Alarm Active
                          </span>
                          <button
                            type="button"
                            className="btn-cancel-sched-alarm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onTurnOffAlarmClick(item);
                            }}
                            style={{
                              background: 'none',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-secondary)',
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Turn Off
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="cell-date">{formatDateDisplay(item.date, item.time)}</td>
                    <td className="col-action">
                      <button
                        type="button"
                        className="btn-delete-row"
                        title="Delete entry"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(item);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
