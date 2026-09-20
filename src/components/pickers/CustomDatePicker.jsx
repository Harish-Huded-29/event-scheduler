import React, { useState, useEffect, useRef } from 'react';
import { backButtonManager } from '../../utils/backButtonManager.js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_LABELS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

export default function CustomDatePicker({
  isOpen,
  title = 'Select Date',
  initialDate,
  onSelect,
  onClose
}) {
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'
  const [slideDirection, setSlideDirection] = useState(''); // 'slide-left' or 'slide-right'

  const touchStartXRef = useRef(null);
  const touchStartYRef = useRef(null);

  // Register high-priority Back button handler so pressing Android Back closes DatePicker without closing Create/Edit Event
  useEffect(() => {
    if (isOpen && onClose) {
      const unregister = backButtonManager.register(() => {
        onClose();
      }, 90);
      return () => unregister();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setViewMode('days');
      setSlideDirection('');
      if (initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate)) {
        setSelectedDate(initialDate);
        const parts = initialDate.split('-');
        setViewYear(parseInt(parts[0], 10));
        setViewMonth(parseInt(parts[1], 10) - 1);
      } else {
        const today = new Date();
        const iso = today.toISOString().split('T')[0];
        setSelectedDate(iso);
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
      }
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handlePrev = () => {
    setSlideDirection('slide-right');
    setTimeout(() => setSlideDirection(''), 220);

    if (viewMode === 'days') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else if (viewMode === 'months') {
      setViewYear((y) => y - 1);
    } else if (viewMode === 'years') {
      setViewYear((y) => y - 12);
    }
  };

  const handleNext = () => {
    setSlideDirection('slide-left');
    setTimeout(() => setSlideDirection(''), 220);

    if (viewMode === 'days') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else if (viewMode === 'months') {
      setViewYear((y) => y + 1);
    } else if (viewMode === 'years') {
      setViewYear((y) => y + 12);
    }
  };

  // Touch Swipe Handlers for smooth finger sliding between months
  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Only trigger if horizontal swipe is dominant and exceeds threshold (40px)
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX < 0) {
        // Finger moved right to left -> Next Month
        handleNext();
      } else {
        // Finger moved left to right -> Previous Month
        handlePrev();
      }
    }
  };

  const renderDaysGrid = () => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];
    const todayISO = new Date().toISOString().split('T')[0];

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      cells.push(
        <div key={`prev-${d}`} className="cal-day-cell other-month" style={{ color: '#52525b', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '38px', fontSize: '0.9rem' }}>
          {d}
        </div>
      );
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = selectedDate === iso;
      const isToday = todayISO === iso;

      cells.push(
        <div
          key={`cur-${d}`}
          className={`cal-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '38px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: isSelected ? 800 : 500,
            backgroundColor: isSelected ? '#ffffff' : 'transparent',
            border: isSelected ? '1px solid #ffffff' : isToday ? '1px solid rgba(255, 255, 255, 0.35)' : 'none',
            color: isSelected ? '#000000' : '#ffffff',
            boxShadow: isSelected ? '0 2px 8px rgba(255, 255, 255, 0.25)' : 'none'
          }}
          onClick={() => {
            setSelectedDate(iso);
            onSelect(iso);
            onClose();
          }}
        >
          {d}
        </div>
      );
    }

    return cells;
  };

  const yearsList = Array.from({ length: 12 }, (_, i) => viewYear - 5 + i);

  return (
    <div
      className="modal-overlay modal-overlay-centered active"
      role="dialog"
      aria-modal="true"
      style={{ zIndex: 300 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog calendar-picker-card"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0d0d10',
          borderRadius: '16px',
          maxWidth: '360px',
          width: '92%',
          padding: '16px',
          border: '1px solid rgba(255,255,255,0.16)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
          userSelect: 'none',
          touchAction: 'pan-y'
        }}
      >
        {/* Top Nav Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          {/* Back / Previous Button */}
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handlePrev}
            aria-label="Previous Month"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#181820',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          {/* Month & Year Pill Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'months' ? 'days' : 'months')}
              style={{
                backgroundColor: viewMode === 'months' ? '#ffffff' : '#181820',
                color: viewMode === 'months' ? '#000000' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '9999px',
                padding: '7px 18px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {MONTH_NAMES[viewMonth]}
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'years' ? 'days' : 'years')}
              style={{
                backgroundColor: viewMode === 'years' ? '#ffffff' : '#181820',
                color: viewMode === 'years' ? '#000000' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '9999px',
                padding: '7px 18px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {viewYear}
            </button>
          </div>

          {/* Next / Forward Button */}
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handleNext}
            aria-label="Next Month"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: '#181820',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        {/* Days View with Gesture Slider Wrapper */}
        {viewMode === 'days' && (
          <div className={slideDirection} style={{ transition: 'transform 0.2s ease, opacity 0.2s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', color: '#a1a1aa', fontSize: '0.78rem', fontWeight: 700, marginBottom: '10px' }}>
              {DAY_LABELS.map((lbl) => (
                <div key={lbl}>{lbl}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {renderDaysGrid()}
            </div>
          </div>
        )}

        {/* Month Picker Grid */}
        {viewMode === 'months' && (
          <div>
            <div style={{ textAlign: 'center', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
              Select Month ({viewYear})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '4px 0' }}>
              {MONTH_NAMES.map((name, idx) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setViewMonth(idx);
                    setViewMode('days');
                  }}
                  style={{
                    backgroundColor: viewMonth === idx ? '#ffffff' : '#181820',
                    color: viewMonth === idx ? '#000000' : '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px 0',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {name.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Year Picker Grid */}
        {viewMode === 'years' && (
          <div>
            <div style={{ textAlign: 'center', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
              Select Year
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '4px 0' }}>
              {yearsList.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setViewYear(yr);
                    setViewMode('days');
                  }}
                  style={{
                    backgroundColor: viewYear === yr ? '#ffffff' : '#181820',
                    color: viewYear === yr ? '#000000' : '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px 0',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer (Matches Screenshot: [This Year] on left, [Close] on right) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setViewYear(new Date().getFullYear());
              setViewMonth(new Date().getMonth());
              setViewMode('days');
            }}
            style={{ padding: '7px 16px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            This Year
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onClose}
            style={{ padding: '7px 22px', fontSize: '0.85rem', borderRadius: '8px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
