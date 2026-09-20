import React from 'react';

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="bottom-nav">
      {/* 1. Schedule Tab */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}
        onClick={() => onTabChange('schedule')}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="nav-label">Schedule</span>
      </button>

      {/* 2. Tasks Tab (Default) */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
        onClick={() => onTabChange('tasks')}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4"></polyline>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
        </svg>
        <span className="nav-label">Tasks</span>
      </button>

      {/* 3. Events Tab */}
      <button
        type="button"
        className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
        onClick={() => onTabChange('events')}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="nav-label">Events</span>
      </button>
    </nav>
  );
}
