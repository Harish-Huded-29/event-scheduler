import React from 'react';

export default function FloatingActionButton({ onOpenModal }) {
  return (
    <div className="fab-container">
      <button
        type="button"
        className="fab-main"
        onClick={() => onOpenModal('add-event')}
        aria-label="Create New Event"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
