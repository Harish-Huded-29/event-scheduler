import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay active modal-center-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-dialog modal-confirm-dialog" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title || 'Confirm Action'}</h2>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
          <p>{message || 'Are you sure you want to proceed?'}</p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
