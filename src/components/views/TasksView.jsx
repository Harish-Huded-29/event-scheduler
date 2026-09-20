import React from 'react';
import { formatDateDMY } from '../../services/formatters.js';

export default function TasksView({
  tasksList,
  onItemClick,
  onToggleComplete,
  onDeleteClick
}) {
  const formatDateDisplay = (dateStr, timeStr) => {
    if (!dateStr) return '';
    const formatted = formatDateDMY(dateStr);
    return timeStr ? `${formatted} at ${timeStr}` : formatted;
  };

  return (
    <div className="tab-pane active">
      {tasksList.length === 0 ? (
        <div className="empty-state" style={{ display: 'block' }}>
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div className="empty-title">No tasks found</div>
          <div className="empty-desc">Tap the + button to create a new task</div>
        </div>
      ) : (
        <div className="task-list">
          {tasksList.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`task-card ${isDone ? 'completed' : ''}`}
                onClick={() => onItemClick(task)}
              >
                {/* Circle Checkbox */}
                <button
                  type="button"
                  className={`task-checkbox ${isDone ? 'checked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task);
                  }}
                  title={isDone ? 'Mark as open' : 'Complete and delete task'}
                  aria-label="Toggle task completion"
                >
                  {isDone && (
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>

                {/* Priority Dot */}
                <span
                  className={`priority-dot ${task.priority || 'medium'}`}
                  title={`Priority: ${task.priority || 'medium'}`}
                ></span>

                {/* Task Info */}
                <div className="task-content">
                  <div className="task-name">{task.name}</div>
                  <div className="task-meta">
                    <span className="task-due">{formatDateDisplay(task.dueDate, task.dueTime)}</span>
                    {task.alarmActive && (
                      <span className="task-badge alarm-badge" title="Alarm Enabled">
                        ⏰ Alarm
                      </span>
                    )}
                    {task.calendarActive && (
                      <span className="task-badge cal-badge" title="Calendar Synced">
                        📅 Cal
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  className="btn-delete-row"
                  title="Delete task"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(task);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
