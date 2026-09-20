import React from 'react';
import { SOUND_PRESETS, audioEngine } from '../../services/audioEngine.js';

export default function SoundPickerModal({
  isOpen,
  selectedSound,
  onSelect,
  onClose
}) {
  if (!isOpen) return null;

  const handlePreview = (e, key) => {
    e.stopPropagation();
    audioEngine.previewSound(key);
  };

  const handleSelect = (key) => {
    audioEngine.previewSound(key);
    onSelect(key);
  };

  return (
    <div className="modal-overlay active" role="dialog" aria-modal="true" style={{ zIndex: 300 }}>
      <div className="modal-dialog" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Select Alarm Sound</h2>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: '8px 16px 16px' }}>
          <div className="sound-list">
            {Object.entries(SOUND_PRESETS).map(([key, info]) => {
              const isSelected = (selectedSound || 'golden_chime') === key;
              return (
                <div
                  key={key}
                  className={`sound-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(key)}
                >
                  <div className="sound-radio-circle">
                    {isSelected && <div className="sound-radio-dot"></div>}
                  </div>
                  <div className="sound-info">
                    <div className="sound-name">{info.name}</div>
                    <div className="sound-desc">{info.desc}</div>
                  </div>
                  <button
                    type="button"
                    className="btn-sound-preview"
                    onClick={(e) => handlePreview(e, key)}
                    title="Preview ringtone"
                    aria-label={`Preview ${info.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
