import React, { useState } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Header({
  activeTab,
  viewMonth,
  viewYear,
  filterMode,
  selectedYear,
  onMonthChange,
  onYearChange,
  onFilterModeChange,
  onClearFilter
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverView, setPopoverView] = useState('months'); // 'months' or 'years'
  const [yearGridBase, setYearGridBase] = useState(viewYear);

  const displayLabel = filterMode === 'year'
    ? `Year ${selectedYear}`
    : `${MONTH_NAMES[viewMonth].substring(0, 3)} ${viewYear}`;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (filterMode === 'year') {
      onYearChange(selectedYear - 1);
    } else {
      if (viewMonth === 0) {
        onMonthChange(11, viewYear - 1);
      } else {
        onMonthChange(viewMonth - 1, viewYear);
      }
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (filterMode === 'year') {
      onYearChange(selectedYear + 1);
    } else {
      if (viewMonth === 11) {
        onMonthChange(0, viewYear + 1);
      } else {
        onMonthChange(viewMonth + 1, viewYear);
      }
    }
  };

  const yearsList = Array.from({ length: 12 }, (_, i) => yearGridBase - 5 + i);

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1 className="header-title">Event Scheduler</h1>
        <span className="header-subtitle">By Immortal</span>
      </div>

      {activeTab === 'events' && (
        <div className="header-filter" style={{ position: 'relative' }}>
          <button
            type="button"
            className="calendar-trigger-btn"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            aria-label="Filter events by month or year"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>{displayLabel}</span>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {isPopoverOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 35 }}
                onClick={() => setIsPopoverOpen(false)}
              />
              <div className="cal-popover active" style={{ display: 'block', top: '48px', right: 0, zIndex: 40 }}>
                <div className="cal-popover-header">
                  <button
                    type="button"
                    className="cal-nav-btn"
                    onClick={handlePrev}
                    aria-label="Previous"
                    style={{
                      width: '34px',
                      height: '34px',
                      backgroundColor: '#27272a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <span
                    className="cal-current-label"
                    style={{ cursor: 'pointer', fontSize: '0.92rem', fontWeight: 700, color: 'var(--accent-gold)' }}
                    onClick={() => setPopoverView(popoverView === 'months' ? 'years' : 'months')}
                  >
                    {popoverView === 'months' ? `${viewYear} (View Years)` : 'Select Year'}
                  </span>
                  <button
                    type="button"
                    className="cal-nav-btn"
                    onClick={handleNext}
                    aria-label="Next"
                    style={{
                      width: '34px',
                      height: '34px',
                      backgroundColor: '#27272a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>

                <div className="cal-view-toggle">
                  <button
                    type="button"
                    className={`cal-toggle-btn ${filterMode === 'month' ? 'active' : ''}`}
                    onClick={() => {
                      onFilterModeChange('month');
                      setPopoverView('months');
                    }}
                  >
                    Month View
                  </button>
                  <button
                    type="button"
                    className={`cal-toggle-btn ${filterMode === 'year' ? 'active' : ''}`}
                    onClick={() => {
                      onFilterModeChange('year');
                      setPopoverView('years');
                    }}
                  >
                    Year View
                  </button>
                </div>

                {popoverView === 'months' ? (
                  <div className="cal-months-grid">
                    {MONTH_NAMES.map((name, idx) => (
                      <button
                        key={name}
                        type="button"
                        className={`cal-month-btn ${filterMode === 'month' && viewMonth === idx ? 'active' : ''}`}
                        onClick={() => {
                          onMonthChange(idx, viewYear);
                          onFilterModeChange('month');
                          setIsPopoverOpen(false);
                        }}
                      >
                        {name.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="cal-years-scroller">
                    {yearsList.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        className={`cal-year-item ${viewYear === yr ? 'active' : ''}`}
                        onClick={() => {
                          onYearChange(yr);
                          if (filterMode === 'year') {
                            setIsPopoverOpen(false);
                          } else {
                            setPopoverView('months');
                          }
                        }}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
