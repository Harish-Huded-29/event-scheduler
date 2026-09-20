import React, { useState, useMemo } from 'react';
import { parseDateParts } from '../../utils/dateFormatter.js';

export default function EventsView({
  eventsList = [],
  filterMode = 'month',
  viewMonth,
  viewYear,
  selectedYear,
  onItemClick,
  onEditClick,
  onDeleteClick,
  onCreateNew
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return eventsList;
    const q = searchQuery.toLowerCase();

    return eventsList.filter((event) => {
      const matchesName = (event.name || '').toLowerCase().includes(q);
      const matchesLocation = (event.location || '').toLowerCase().includes(q);
      const matchesRemarks = (event.remarks || '').toLowerCase().includes(q);
      const matchesAttachments = (event.attachments || []).some((att) =>
        (att.name || '').toLowerCase().includes(q)
      );

      return matchesName || matchesLocation || matchesRemarks || matchesAttachments;
    });
  }, [eventsList, searchQuery]);

  return (
    <div className="events-view-container">
      {/* Search Header Bar with Count Badge */}
      <div className="events-search-bar-wrap">
        <div className="search-input-box">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search events, locations, files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          <div className="events-counter-pill">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="events-cards-grid">
        {filteredEvents.length === 0 ? (
          <div className="empty-events-state">
            <div className="empty-icon-box">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
                <path d="M8 14h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 18h.01"></path>
                <path d="M12 18h.01"></path>
              </svg>
            </div>
            <h3>No events found</h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Plan your schedule, organize gatherings, and attach documents or media.'}
            </p>
            {onCreateNew && (
              <button type="button" className="btn btn-primary btn-sm" onClick={onCreateNew}>
                + Create Event
              </button>
            )}
          </div>
        ) : (
          filteredEvents.map((event, index) => {
            const attachments = event.attachments || [];
            const pdfCount = attachments.filter((a) =>
              a.type === 'application/pdf' || a.name?.toLowerCase().endsWith('.pdf')
            ).length;
            const imgCount = attachments.filter((a) =>
              a.type?.startsWith('image/') || a.name?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
            ).length;
            const otherCount = attachments.length - (pdfCount + imgCount);

            const isSingleDay = !event.endDate || event.endDate === event.startDate;
            const startParts = parseDateParts(event.startDate);
            const endParts = parseDateParts(event.endDate);

            return (
              <div
                key={event.id}
                className="event-card-item"
                style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                onClick={() => onItemClick(event)}
              >
                {/* Left: Sculpted High-Visibility Date Badge */}
                <div className="event-sculpted-date-badge">
                  <span className="badge-month">{startParts.month || 'EVENT'}</span>
                  <div className="badge-days-wrapper">
                    {isSingleDay ? (
                      <span className="badge-day-single">{startParts.day || '•'}</span>
                    ) : (
                      <div className="badge-day-range">
                        <span className="day-val">{startParts.day}</span>
                        <span className="day-separator">→</span>
                        <span className="day-val">{endParts.day}</span>
                      </div>
                    )}
                  </div>
                  <span className="badge-year">{startParts.year}</span>
                </div>

                {/* Middle: Event Title, Location, and Smart Attachment Tags */}
                <div className="event-card-content">
                  <h3 className="event-card-title">{event.name}</h3>

                  {event.location && (
                    <div className="event-card-location">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span className="location-text">{event.location}</span>
                    </div>
                  )}

                  {attachments.length > 0 && (
                    <div className="event-card-meta-chips">
                      <div className="meta-chip-main">
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                        <span>{attachments.length} {attachments.length === 1 ? 'file' : 'files'}</span>
                      </div>
                      {pdfCount > 0 && <span className="meta-chip-sub">📄 {pdfCount} PDF</span>}
                      {imgCount > 0 && <span className="meta-chip-sub">🖼️ {imgCount}</span>}
                      {otherCount > 0 && <span className="meta-chip-sub">📁 {otherCount}</span>}
                    </div>
                  )}
                </div>

                {/* Right: Sleek Touch Action Affordance */}
                <div className="event-card-action-cue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

