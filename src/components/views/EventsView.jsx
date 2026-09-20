import React from 'react';
import { formatDateDMY } from '../../services/formatters.js';

export default function EventsView({
  eventsList,
  filterMode,
  selectedSpecificDate,
  viewMonth,
  viewYear,
  selectedYear,
  onItemClick,
  onDeleteClick,
  onClearFilter
}) {
  const formatDateRange = (start, end) => {
    if (!start) return '—';
    const s = formatDateDMY(start);
    if (!end || start === end) {
      return s;
    }
    const e = formatDateDMY(end);
    return `${s} – ${e}`;
  };

  const getEmptyMessage = () => {
    if (filterMode === 'year') {
      return `No events in year ${selectedYear}`;
    }
    if (selectedSpecificDate) {
      return `No events on ${formatDateDMY(selectedSpecificDate)}`;
    }
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `No events in ${monthNames[viewMonth]}, ${viewYear}`;
  };

  return (
    <div className="tab-pane active">
      {/* Date Filter Active Banner */}
      {selectedSpecificDate && (
        <div className="filter-active-banner" style={{ display: 'flex' }}>
          <span>Filtered by date: <strong>{formatDateDMY(selectedSpecificDate)}</strong></span>
          <button
            type="button"
            className="btn-clear-filter"
            onClick={onClearFilter}
            aria-label="Clear filter"
          >
            Clear
          </button>
        </div>
      )}

      {eventsList.length === 0 ? (
        <div className="empty-state" style={{ display: 'block' }}>
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="empty-title">{getEmptyMessage()}</div>
          <div className="empty-desc">Tap the + button below to create an event</div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="events-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-title">Event Name</th>
                <th className="col-date">Date Range</th>
                <th className="col-action"></th>
              </tr>
            </thead>
            <tbody>
              {eventsList.map((event, index) => (
                <tr key={event.id} onClick={() => onItemClick(event)}>
                  <td className="col-num">{index + 1}</td>
                  <td className="cell-title">{event.name}</td>
                  <td className="cell-date">{formatDateRange(event.startDate, event.endDate)}</td>
                  <td className="col-action">
                    <button
                      type="button"
                      className="btn-delete-row"
                      title="Delete event"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(event);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
