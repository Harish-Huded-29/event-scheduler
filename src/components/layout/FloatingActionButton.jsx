import React from 'react';

export default function FloatingActionButton({ activeTab, onOpenModal }) {
  const handleClick = () => {
    if (activeTab === 'schedule') {
      onOpenModal('add-schedule');
    } else if (activeTab === 'tasks') {
      onOpenModal('add-task');
    } else if (activeTab === 'events') {
      onOpenModal('add-event');
    }
  };

  const getAriaLabel = () => {
    if (activeTab === 'schedule') return 'Add Schedule Entry';
    if (activeTab === 'tasks') return 'Add Task';
    return 'Add Event';
  };

  return (
    <div className="fab-container">
      <button
        type="button"
        className="fab-main"
        onClick={handleClick}
        aria-label={getAriaLabel()}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}
