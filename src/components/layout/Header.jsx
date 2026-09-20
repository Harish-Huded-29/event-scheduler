import React, { useState, useEffect } from 'react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to compute 12-year block start (e.g. 2021 -> 2021..2032, 2033 -> 2033..2044)
const compute12YearStart = (year) => {
  const offset = ((year - 2021) % 12 + 12) % 12;
  return year - offset;
};

export default function Header({
  viewMonth,
  viewYear,
  filterMode, // 'all', 'month' or 'year'
  selectedYear,
  onMonthChange,
  onYearChange,
  onFilterModeChange
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverView, setPopoverView] = useState('months'); // 'months' or 'years'
  const [yearWindowStart, setYearWindowStart] = useState(() => compute12YearStart(viewYear || new Date().getFullYear()));

  // Sync year window start when viewYear changes
  useEffect(() => {
    if (viewYear) {
      setYearWindowStart(compute12YearStart(viewYear));
    }
  }, [viewYear]);

  const currentActualYear = new Date().getFullYear();
  const currentActualMonth = new Date().getMonth();

  const displayLabel =
    filterMode === 'all'
      ? 'All Events'
      : filterMode === 'year'
      ? `Year ${selectedYear}`
      : `${MONTH_NAMES[viewMonth].substring(0, 3)} ${viewYear}`;

  // Previous button handler for popover header
  const handlePrev = (e) => {
    e.stopPropagation();
    if (popoverView === 'years') {
      // Shift 12-year window backward (e.g. 2021-2032 -> 2009-2020)
      setYearWindowStart((prev) => prev - 12);
    } else {
      // In months view, decrement viewYear by 1
      const newYear = viewYear - 1;
      onYearChange(newYear);
      if (filterMode === 'month') {
        onMonthChange(viewMonth, newYear);
      }
      setYearWindowStart(compute12YearStart(newYear));
    }
  };

  // Next button handler for popover header
  const handleNext = (e) => {
    e.stopPropagation();
    if (popoverView === 'years') {
      // Shift 12-year window forward (e.g. 2021-2032 -> 2033-2044)
      setYearWindowStart((prev) => prev + 12);
    } else {
      // In months view, increment viewYear by 1
      const newYear = viewYear + 1;
      onYearChange(newYear);
      if (filterMode === 'month') {
        onMonthChange(viewMonth, newYear);
      }
      setYearWindowStart(compute12YearStart(newYear));
    }
  };

  const yearsList = Array.from({ length: 12 }, (_, i) => yearWindowStart + i);

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className="header-title">Events Manager</h1>
          <span className="header-credits">By IMMORTAL</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Date Filter Popover Trigger */}
        <div className="header-filter" style={{ position: 'relative' }}>
          <button
            type="button"
            className="calendar-trigger-btn"
            onClick={() => {
              setIsPopoverOpen(!isPopoverOpen);
              if (!isPopoverOpen) {
                setYearWindowStart(compute12YearStart(filterMode === 'year' ? selectedYear : viewYear));
              }
            }}
            aria-label="Filter events by month, year, or view all"
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
                {/* View Mode Selector Tabs: Month & Year */}
                <div className="cal-view-toggle">
                  <button
                    type="button"
                    className={`cal-toggle-btn ${popoverView === 'months' ? 'active' : ''}`}
                    onClick={() => {
                      setPopoverView('months');
                      if (filterMode !== 'month') {
                        onFilterModeChange('month');
                      }
                    }}
                  >
                    Month
                  </button>
                  <button
                    type="button"
                    className={`cal-toggle-btn ${popoverView === 'years' ? 'active' : ''}`}
                    onClick={() => {
                      setPopoverView('years');
                      setYearWindowStart(compute12YearStart(filterMode === 'year' ? selectedYear : viewYear));
                      if (filterMode !== 'year') {
                        onFilterModeChange('year');
                      }
                    }}
                  >
                    Year
                  </button>
                </div>

                {/* Popover Header Navigation with Dynamic Year Range / Single Year */}
                <div className="cal-popover-header" style={{ justifyContent: popoverView === 'years' ? 'space-between' : 'center' }}>
                  {popoverView === 'years' && (
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={handlePrev}
                      aria-label="Previous 12 Years"
                      title="Previous 12 Years"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                  )}

                  <button
                    type="button"
                    className="cal-current-label-btn"
                    onClick={() => {
                      if (popoverView === 'months') {
                        setPopoverView('years');
                        setYearWindowStart(compute12YearStart(viewYear));
                      } else {
                        setPopoverView('months');
                      }
                    }}
                    title={popoverView === 'months' ? 'Click to select year range' : 'Click to view months'}
                  >
                    <span>
                      {popoverView === 'years'
                        ? `${yearWindowStart} – ${yearWindowStart + 11}`
                        : `${viewYear}`}
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px', marginLeft: '4px' }}>
                      <polyline points={popoverView === 'years' ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}></polyline>
                    </svg>
                  </button>

                  {popoverView === 'years' && (
                    <button
                      type="button"
                      className="cal-nav-btn"
                      onClick={handleNext}
                      aria-label="Next 12 Years"
                      title="Next 12 Years"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Body: Months Grid OR 12-Year Window Grid */}
                {popoverView === 'months' ? (
                  <div className="cal-months-grid">
                    {MONTH_NAMES.map((name, idx) => {
                      const isSelected = filterMode === 'month' && viewMonth === idx;
                      const isCurrentRealMonth = currentActualYear === viewYear && currentActualMonth === idx;

                      return (
                        <button
                          key={name}
                          type="button"
                          className={`cal-month-btn ${isSelected ? 'active' : ''} ${isCurrentRealMonth ? 'current-month-dot' : ''}`}
                          onClick={() => {
                            onMonthChange(idx, viewYear);
                            onFilterModeChange('month');
                            setIsPopoverOpen(false);
                          }}
                        >
                          <span>{name.substring(0, 3)}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="cal-years-grid">
                    {yearsList.map((yr) => {
                      const isSelected = (filterMode === 'year' && selectedYear === yr) || (filterMode === 'month' && viewYear === yr);
                      const isCurrentRealYear = currentActualYear === yr;

                      return (
                        <button
                          key={yr}
                          type="button"
                          className={`cal-year-item ${isSelected ? 'active' : ''} ${isCurrentRealYear ? 'current-year-dot' : ''}`}
                          onClick={() => {
                            onYearChange(yr);
                            if (filterMode === 'year') {
                              setIsPopoverOpen(false);
                            } else {
                              onMonthChange(viewMonth, yr);
                              setPopoverView('months');
                            }
                          }}
                        >
                          <span>{yr}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* All Events Button: Full width below Oct, Nov, Dec */}
                <button
                  type="button"
                  className={`cal-all-events-btn ${filterMode === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    onFilterModeChange('all');
                    setIsPopoverOpen(false);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  All Events
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

