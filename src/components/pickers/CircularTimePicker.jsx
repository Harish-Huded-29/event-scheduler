import React, { useState, useRef, useEffect } from 'react';

export default function CircularTimePicker({ isOpen, initialTime, onSelect, onClose }) {
  const [mode, setMode] = useState('hours'); // 'hours' or 'minutes'
  const [hours, setHours] = useState(7); // 1-12
  const [minutes, setMinutes] = useState(15); // 0-59
  const [period, setPeriod] = useState('AM'); // 'AM' or 'PM'

  const dialRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setMode('hours');
      if (initialTime && initialTime.includes(':')) {
        const parts = initialTime.split(':');
        let h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const p = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        setHours(h);
        setMinutes(isNaN(m) ? 0 : m);
        setPeriod(p);
      } else {
        const now = new Date();
        let h = now.getHours();
        const m = now.getMinutes();
        const p = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        setHours(h);
        setMinutes(Math.round(m / 5) * 5 % 60);
        setPeriod(p);
      }
    }
  }, [isOpen, initialTime]);

  if (!isOpen) return null;

  const handleDialPointer = (clientX, clientY) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (mode === 'hours') {
      let val = Math.round(angle / 30);
      if (val === 0) val = 12;
      setHours(val);
    } else {
      let val = Math.round(angle / 6);
      if (val === 60) val = 0;
      setMinutes(val);
    }
  };

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    handleDialPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (isDraggingRef.current) {
      handleDialPointer(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      if (mode === 'hours') {
        setMode('minutes');
      }
    }
  };

  const handleDone = () => {
    let h = hours;
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const formatted = `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    onSelect(formatted);
    onClose();
  };

  // Selected coordinate for the hand tip
  const radius = 88;
  const currentAngle = mode === 'hours'
    ? (hours * 30 - 90) * (Math.PI / 180)
    : (minutes * 6 - 90) * (Math.PI / 180);
  const selectedX = 120 + radius * Math.cos(currentAngle);
  const selectedY = 120 + radius * Math.sin(currentAngle);

  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minuteNumbers = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div className="modal-overlay modal-overlay-centered active" role="dialog" aria-modal="true" style={{ zIndex: 300 }}>
      <div
        className="modal-dialog clock-picker-card"
        style={{
          backgroundColor: '#18181b',
          borderRadius: '20px',
          maxWidth: '340px',
          width: '90%',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)'
        }}
      >
        {/* Header Display (Matches Screenshot Exactly) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              onClick={() => setMode('hours')}
              style={{
                fontSize: '2.4rem',
                fontWeight: 700,
                color: mode === 'hours' ? 'var(--accent-gold)' : '#71717a',
                backgroundColor: mode === 'hours' ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
                padding: '4px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {String(hours).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '2.2rem', color: '#52525b', fontWeight: 600 }}>:</span>
            <span
              onClick={() => setMode('minutes')}
              style={{
                fontSize: '2.4rem',
                fontWeight: 700,
                color: mode === 'minutes' ? 'var(--accent-gold)' : '#71717a',
                backgroundColor: mode === 'minutes' ? 'rgba(197, 160, 89, 0.15)' : 'transparent',
                padding: '4px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {String(minutes).padStart(2, '0')}
            </span>
          </div>

          {/* AM / PM Toggle Stack */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#101012',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #27272a'
            }}
          >
            <button
              type="button"
              onClick={() => setPeriod('AM')}
              style={{
                background: period === 'AM' ? 'var(--accent-gold)' : 'none',
                color: period === 'AM' ? '#121212' : '#a1a1aa',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => setPeriod('PM')}
              style={{
                background: period === 'PM' ? 'var(--accent-gold)' : 'none',
                color: period === 'PM' ? '#121212' : '#a1a1aa',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              PM
            </button>
          </div>
        </div>

        {/* Circular Clock Dial */}
        <div
          ref={dialRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            margin: '0 auto',
            backgroundColor: '#202024',
            borderRadius: '50%',
            touchAction: 'none',
            userSelect: 'none',
            cursor: 'pointer'
          }}
        >
          {/* SVG Hand & Selected Highlight Node */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
            viewBox="0 0 240 240"
          >
            {/* Center Pin */}
            <circle cx="120" cy="120" r="5" fill="#c5a059" />

            {/* Hand Line */}
            <line
              x1="120"
              y1="120"
              x2={selectedX}
              y2={selectedY}
              stroke="#c5a059"
              strokeWidth="2.5"
            />

            {/* Selected Golden Circular Node */}
            <circle cx={selectedX} cy={selectedY} r="18" fill="#c5a059" />
          </svg>

          {/* Clock Numbers (Strictly Upright, Never Rotated) */}
          {mode === 'hours'
            ? hourNumbers.map((num, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const nx = 120 + radius * Math.cos(angle);
                const ny = 120 + radius * Math.sin(angle);
                const isSelected = hours === num;
                return (
                  <div
                    key={num}
                    style={{
                      position: 'absolute',
                      left: `${nx}px`,
                      top: `${ny}px`,
                      transform: 'translate(-50%, -50%)',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.92rem',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#121212' : '#f4f4f5',
                      zIndex: 2,
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  >
                    {num}
                  </div>
                );
              })
            : minuteNumbers.map((num, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const nx = 120 + radius * Math.cos(angle);
                const ny = 120 + radius * Math.sin(angle);
                const isSelected = minutes === num;
                return (
                  <div
                    key={num}
                    style={{
                      position: 'absolute',
                      left: `${nx}px`,
                      top: `${ny}px`,
                      transform: 'translate(-50%, -50%)',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.88rem',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#121212' : '#f4f4f5',
                      zIndex: 2,
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}
                  >
                    {String(num).padStart(2, '0')}
                  </div>
                );
              })}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '8px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleDone}
            style={{ padding: '8px 22px', borderRadius: '8px' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
