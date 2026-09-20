import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import FloatingActionButton from './components/layout/FloatingActionButton.jsx';

import TasksView from './components/views/TasksView.jsx';
import ScheduleView from './components/views/ScheduleView.jsx';
import EventsView from './components/views/EventsView.jsx';

import AddEventModal from './components/modals/AddEventModal.jsx';
import AddEditTaskModal from './components/modals/AddEditTaskModal.jsx';
import AddEditScheduleModal from './components/modals/AddEditScheduleModal.jsx';
import ItemDetailModal from './components/modals/ItemDetailModal.jsx';
import ConfirmModal from './components/modals/ConfirmModal.jsx';
import AlarmRingingModal from './components/modals/AlarmRingingModal.jsx';
import RescheduleModal from './components/modals/RescheduleModal.jsx';

import CircularTimePicker from './components/pickers/CircularTimePicker.jsx';
import CustomDatePicker from './components/pickers/CustomDatePicker.jsx';
import SoundPickerModal from './components/pickers/SoundPickerModal.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';

import { appDB } from './services/db.js';
import { nativeBridge } from './services/nativeBridge.js';

export default function App() {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' (default), 'schedule', 'events'
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterMode, setFilterMode] = useState('month'); // 'month' or 'year' or 'date'
  const [selectedSpecificDate, setSelectedSpecificDate] = useState(null);

  // Data Stores
  const [tasksList, setTasksList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [eventsList, setEventsList] = useState([]);

  // Toast System
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Creation & Edit Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventStartDate, setEventStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventEndDate, setEventEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [isAddEditTaskOpen, setIsAddEditTaskOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isAddEditScheduleOpen, setIsAddEditScheduleOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState(null);

  // Detail Modal
  const [detailModal, setDetailModal] = useState({ isOpen: false, item: null, type: 'task' });

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Pickers
  const [timePicker, setTimePicker] = useState({ isOpen: false, initialTime: '', onSelect: null });
  const [datePicker, setDatePicker] = useState({ isOpen: false, title: 'Select Date', initialDate: '', onSelect: null });
  const [soundPicker, setSoundPicker] = useState({ isOpen: false, selectedSound: 'golden_chime', onSelect: null });

  // Alarms Ringing & Reschedule
  const [ringingList, setRingingList] = useState([]);
  const [isAlarmRingingOpen, setIsAlarmRingingOpen] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState({ isOpen: false, target: null });

  // Data Loaders
  const loadTasks = useCallback(async () => {
    try {
      const items = await appDB.getTasks();
      setTasksList(items);
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const items = await appDB.getSchedule();
      setScheduleList(items);
    } catch (err) {
      console.error('Error loading schedule:', err);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      let items = [];
      if (filterMode === 'year') {
        items = await appDB.getEventsByYear(selectedYear);
      } else {
        const ym = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
        items = await appDB.getEventsByMonth(ym);
      }
      setEventsList(items);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  }, [filterMode, selectedYear, viewMonth, viewYear]);

  // Initial Boot
  useEffect(() => {
    loadTasks();
    loadSchedule();
    loadEvents();
  }, [loadTasks, loadSchedule, loadEvents]);

  // Trigger deduplication cache
  const triggeredAlarmKeysRef = React.useRef(new Set());

  // Register Native Alarm Receiver Callback
  useEffect(() => {
    nativeBridge.setAlarmRingingCallback((item) => {
      if (!item) return;
      const key = `alarm_${item.id || item.alarmId}_${item.dueDate || item.date || ''}_${item.dueTime || item.time || ''}`;
      if (triggeredAlarmKeysRef.current.has(key)) return;
      triggeredAlarmKeysRef.current.add(key);
      setTimeout(() => triggeredAlarmKeysRef.current.delete(key), 180000);

      setRingingList((prev) => {
        const exists = prev.some((p) => String(p.id) === String(item.id) || (p.alarmId && p.alarmId === item.alarmId));
        if (exists) return prev;
        return [...prev, item];
      });
      setIsAlarmRingingOpen(true);
    });
  }, []);

  // Periodic Check for scheduled reminders in active app (Browser fallback ONLY)
  useEffect(() => {
    if (nativeBridge.isNative()) {
      // Native AlarmManager and LocalNotifications handle alarms on Android with zero duplicate polling
      return;
    }

    const checkScheduleTime = () => {
      const now = new Date();
      const todayISO = now.toISOString().split('T')[0];
      const curH = String(now.getHours()).padStart(2, '0');
      const curM = String(now.getMinutes()).padStart(2, '0');
      const curTime = `${curH}:${curM}`;

      // Check Tasks
      tasksList.forEach((task) => {
        if (task.alarmActive && task.status === 'open' && task.dueDate === todayISO && task.dueTime === curTime) {
          const key = `alarm_${task.id}_${task.dueDate}_${task.dueTime}`;
          if (!triggeredAlarmKeysRef.current.has(key)) {
            triggeredAlarmKeysRef.current.add(key);
            setTimeout(() => triggeredAlarmKeysRef.current.delete(key), 180000);
            triggerAlarmRinging({ ...task, itemType: 'task' });
          }
        }
      });

      // Check Schedule
      scheduleList.forEach((item) => {
        if (item.alarmActive && item.date === todayISO && item.time === curTime) {
          const key = `alarm_${item.id}_${item.date}_${item.time}`;
          if (!triggeredAlarmKeysRef.current.has(key)) {
            triggeredAlarmKeysRef.current.add(key);
            setTimeout(() => triggeredAlarmKeysRef.current.delete(key), 180000);
            triggerAlarmRinging({ ...item, itemType: 'schedule' });
          }
        }
      });
    };

    const interval = setInterval(checkScheduleTime, 10000);
    return () => clearInterval(interval);
  }, [tasksList, scheduleList]);

  const triggerAlarmRinging = (item) => {
    setRingingList((prev) => {
      const exists = prev.some((p) => String(p.id) === String(item.id) || (p.alarmId && p.alarmId === item.alarmId));
      if (exists) return prev;
      return [...prev, item];
    });
    setIsAlarmRingingOpen(true);
  };

  /* =========================================================================
     ACTIONS & CRUD HANDLERS
     ========================================================================= */

  // 1. Task Submit (Add or Edit)
  const handleSaveTask = async (taskData) => {
    try {
      let alarmId = null;
      let calendarEventId = null;

      if (taskData.id) {
        // Edit Mode
        const existing = await appDB.getTaskById(taskData.id);
        if (existing?.alarmId) {
          await nativeBridge.cancelAlarm(existing.alarmId);
        }

        const reminderRes = await nativeBridge.scheduleReminder(taskData);
        alarmId = reminderRes.alarmId;

        if (taskData.calendarActive && !existing?.calendarEventId) {
          const calRes = await nativeBridge.addCalendarEvent(taskData);
          calendarEventId = calRes.calendarEventId;
        } else if (existing?.calendarEventId) {
          calendarEventId = existing.calendarEventId;
        }

        await appDB.updateTask({
          ...taskData,
          alarmId,
          calendarEventId
        });
        showToast('Task updated successfully', 'success');
      } else {
        // Add Mode
        const reminderRes = await nativeBridge.scheduleReminder(taskData);
        alarmId = reminderRes.alarmId;

        if (taskData.calendarActive) {
          const calRes = await nativeBridge.addCalendarEvent(taskData);
          calendarEventId = calRes.calendarEventId;
        }

        await appDB.addTask({
          ...taskData,
          alarmId,
          calendarEventId
        });
        showToast('Task added', 'success');
      }

      setIsAddEditTaskOpen(false);
      setTaskToEdit(null);
      await loadTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      showToast('Failed to save task', 'error');
    }
  };

  // 2. Schedule Submit (Add or Edit)
  const handleSaveSchedule = async (scheduleData) => {
    try {
      let alarmId = null;
      let calendarEventId = null;

      if (scheduleData.id) {
        // Edit Mode
        const existing = await appDB.getScheduleById(scheduleData.id);
        if (existing?.alarmId) {
          await nativeBridge.cancelAlarm(existing.alarmId);
        }

        const reminderRes = await nativeBridge.scheduleReminder({ ...scheduleData, itemType: 'schedule' });
        alarmId = reminderRes.alarmId;

        if (scheduleData.calendarActive && !existing?.calendarEventId) {
          const calRes = await nativeBridge.addCalendarEvent(scheduleData);
          calendarEventId = calRes.calendarEventId;
        } else if (existing?.calendarEventId) {
          calendarEventId = existing.calendarEventId;
        }

        await appDB.updateSchedule({
          ...scheduleData,
          alarmId,
          calendarEventId
        });
        showToast('Schedule updated successfully', 'success');
      } else {
        // Add Mode
        const reminderRes = await nativeBridge.scheduleReminder({ ...scheduleData, itemType: 'schedule' });
        alarmId = reminderRes.alarmId;

        if (scheduleData.calendarActive) {
          const calRes = await nativeBridge.addCalendarEvent(scheduleData);
          calendarEventId = calRes.calendarEventId;
        }

        await appDB.addSchedule({
          ...scheduleData,
          alarmId,
          calendarEventId
        });
        showToast('Schedule entry added', 'success');
      }

      setIsAddEditScheduleOpen(false);
      setScheduleToEdit(null);
      await loadSchedule();
    } catch (err) {
      console.error('Error saving schedule:', err);
      showToast('Failed to save schedule entry', 'error');
    }
  };

  // 3. Event Submit (Add only)
  const handleSaveEvent = async (eventData) => {
    try {
      await appDB.addEvent(eventData);
      setIsAddEventOpen(false);
      showToast('Event created', 'success');

      const eventYear = parseInt(eventData.startDate.substring(0, 4), 10);
      const eventMonth = parseInt(eventData.startDate.substring(5, 7), 10) - 1;
      setViewYear(eventYear);
      setViewMonth(eventMonth);
      await loadEvents();
    } catch (err) {
      console.error('Error adding event:', err);
      showToast('Failed to save event', 'error');
    }
  };

  // 4. Toggle Task Completion (strictly deletes without polluting schedule/events)
  const handleToggleCompleteTask = async (task) => {
    try {
      if (task.alarmActive && task.alarmId) {
        await nativeBridge.cancelAlarm(task.alarmId);
      }
      if (task.calendarActive && task.calendarEventId) {
        await nativeBridge.deleteCalendarEvent(task.calendarEventId);
      }
      await appDB.deleteTask(task.id);
      showToast('Task completed', 'success');
      await loadTasks();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  // 5. Turn Off Schedule Alarm
  const handleTurnOffScheduleAlarm = async (item) => {
    try {
      if (item.alarmId) {
        await nativeBridge.cancelAlarm(item.alarmId);
      }
      await appDB.updateSchedule({
        ...item,
        alarmActive: false,
        alarmId: null
      });
      showToast(`Alarm turned off for "${item.title}"`, 'info');
      await loadSchedule();
    } catch (err) {
      console.error('Error turning off alarm:', err);
    }
  };

  // 6. Delete Actions
  const handleDeleteTask = (task) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Task',
      message: `Are you sure you want to delete "${task.name}"?`,
      onConfirm: async () => {
        if (task.alarmActive && task.alarmId) {
          await nativeBridge.cancelAlarm(task.alarmId);
        }
        if (task.calendarActive && task.calendarEventId) {
          await nativeBridge.deleteCalendarEvent(task.calendarEventId);
        }
        await appDB.deleteTask(task.id);
        showToast('Task deleted', 'info');
        await loadTasks();
      }
    });
  };

  const handleDeleteSchedule = (item) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Entry',
      message: `Are you sure you want to delete "${item.title}"?`,
      onConfirm: async () => {
        if (item.alarmActive && item.alarmId) {
          await nativeBridge.cancelAlarm(item.alarmId);
        }
        await appDB.deleteSchedule(Number(item.id));
        showToast('Schedule entry deleted', 'info');
        await loadSchedule();
      }
    });
  };

  const handleDeleteEvent = (event) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event',
      message: `Are you sure you want to delete "${event.name}"?`,
      onConfirm: async () => {
        await appDB.deleteEvent(event.id);
        showToast('Event deleted', 'info');
        await loadEvents();
      }
    });
  };

  /* =========================================================================
     ALARM RINGING & RESCHEDULE HANDLERS
     ========================================================================= */

  const handleDismissRingingSingle = (item) => {
    setRingingList((prev) => {
      const next = prev.filter((p) => p.id !== item.id);
      if (next.length === 0) {
        setIsAlarmRingingOpen(false);
      }
      return next;
    });
    showToast(`Alarm turned off for "${item.name || item.title}"`, 'info');
  };

  const handleDismissRingingAll = () => {
    setRingingList([]);
    setIsAlarmRingingOpen(false);
    showToast('All alarms turned off', 'info');
  };

  const handleSnoozeMinutes = async (target, minutes) => {
    const now = new Date();
    const future = new Date(now.getTime() + minutes * 60 * 1000);
    const dateStr = future.toISOString().split('T')[0];
    const h = String(future.getHours()).padStart(2, '0');
    const m = String(future.getMinutes()).padStart(2, '0');
    const timeStr = `${h}:${m}`;

    if (target === 'all') {
      for (const itm of ringingList) {
        await applyReschedule(itm, dateStr, timeStr);
      }
      setRingingList([]);
      setIsAlarmRingingOpen(false);
      showToast(`All alarms snoozed for ${minutes} min`, 'info');
    } else {
      await applyReschedule(target, dateStr, timeStr);
      setRingingList((prev) => {
        const next = prev.filter((p) => p.id !== target.id);
        if (next.length === 0) setIsAlarmRingingOpen(false);
        return next;
      });
      showToast(`Snoozed "${target.name || target.title}" for ${minutes} min`, 'info');
    }
  };

  const applyReschedule = async (item, newDate, newTime) => {
    try {
      if (item.itemType === 'schedule') {
        const scheduleRes = await nativeBridge.scheduleReminder({
          ...item,
          date: newDate,
          time: newTime,
          setAlarm: true,
          itemType: 'schedule'
        });
        if (item.id) {
          try {
            await appDB.updateSchedule({
              ...item,
              date: newDate,
              time: newTime,
              alarmActive: true,
              alarmId: scheduleRes.alarmId
            });
          } catch (e) {
            console.warn('DB update schedule warning:', e);
          }
        }
        await loadSchedule();
      } else {
        const reminderRes = await nativeBridge.scheduleReminder({
          ...item,
          dueDate: newDate,
          dueTime: newTime,
          setAlarm: true,
          itemType: 'task'
        });
        if (item.id) {
          try {
            await appDB.updateTask({
              ...item,
              dueDate: newDate,
              dueTime: newTime,
              alarmActive: true,
              alarmId: reminderRes.alarmId
            });
          } catch (e) {
            console.warn('DB update task warning:', e);
          }
        }
        await loadTasks();
      }
    } catch (err) {
      console.error('applyReschedule error:', err);
    }
  };

  const handleRescheduleConfirm = async (target, newDate, newTime) => {
    if (target === 'all') {
      for (const itm of ringingList) {
        await applyReschedule(itm, newDate, newTime);
      }
      setRingingList([]);
      setIsAlarmRingingOpen(false);
      showToast('All alarms rescheduled', 'success');
    } else {
      await applyReschedule(target, newDate, newTime);
      setRingingList((prev) => {
        const next = prev.filter((p) => p.id !== target.id);
        if (next.length === 0) setIsAlarmRingingOpen(false);
        return next;
      });
      showToast(`Rescheduled "${target.name || target.title}"`, 'success');
    }
    setRescheduleModal({ isOpen: false, target: null });
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        activeTab={activeTab}
        viewMonth={viewMonth}
        viewYear={viewYear}
        filterMode={filterMode}
        selectedYear={selectedYear}
        onMonthChange={(m, y) => {
          setViewMonth(m);
          setViewYear(y);
        }}
        onYearChange={(y) => {
          setSelectedYear(y);
          setViewYear(y);
        }}
        onFilterModeChange={setFilterMode}
        onClearFilter={() => setSelectedSpecificDate(null)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {activeTab === 'schedule' && (
          <ScheduleView
            scheduleList={scheduleList}
            onItemClick={(item) => setDetailModal({ isOpen: true, item, type: 'schedule' })}
            onDeleteClick={handleDeleteSchedule}
            onTurnOffAlarmClick={handleTurnOffScheduleAlarm}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasksList={tasksList}
            onItemClick={(task) => setDetailModal({ isOpen: true, item: task, type: 'task' })}
            onToggleComplete={handleToggleCompleteTask}
            onDeleteClick={handleDeleteTask}
          />
        )}

        {activeTab === 'events' && (
          <EventsView
            eventsList={eventsList}
            filterMode={filterMode}
            selectedSpecificDate={selectedSpecificDate}
            viewMonth={viewMonth}
            viewYear={viewYear}
            selectedYear={selectedYear}
            onItemClick={(event) => setDetailModal({ isOpen: true, item: event, type: 'event' })}
            onDeleteClick={handleDeleteEvent}
            onClearFilter={() => setSelectedSpecificDate(null)}
          />
        )}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        activeTab={activeTab}
        onOpenModal={(modalType) => {
          if (modalType === 'add-schedule') {
            setScheduleToEdit(null);
            setIsAddEditScheduleOpen(true);
          } else if (modalType === 'add-task') {
            setTaskToEdit(null);
            setIsAddEditTaskOpen(true);
          } else if (modalType === 'add-event') {
            setIsAddEventOpen(true);
          }
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Modals */}
      <AddEventModal
        isOpen={isAddEventOpen}
        startDate={eventStartDate}
        endDate={eventEndDate}
        onStartDateChange={setEventStartDate}
        onEndDateChange={setEventEndDate}
        onOpenDatePicker={(type, initial, cb, title) => {
          setDatePicker({
            isOpen: true,
            title,
            initialDate: initial,
            onSelect: cb
          });
        }}
        onSave={handleSaveEvent}
        onClose={() => setIsAddEventOpen(false)}
      />

      <AddEditTaskModal
        isOpen={isAddEditTaskOpen}
        editTask={taskToEdit}
        onSave={handleSaveTask}
        onClose={() => {
          setIsAddEditTaskOpen(false);
          setTaskToEdit(null);
        }}
        onOpenDatePicker={(key, initial, cb, title) => {
          setDatePicker({
            isOpen: true,
            title,
            initialDate: initial,
            onSelect: cb
          });
        }}
        onOpenTimePicker={(key, initial, cb) => {
          setTimePicker({
            isOpen: true,
            initialTime: initial,
            onSelect: cb
          });
        }}
        onOpenSoundPicker={(currentSound, cb) => {
          setSoundPicker({
            isOpen: true,
            selectedSound: currentSound,
            onSelect: cb
          });
        }}
      />

      <AddEditScheduleModal
        isOpen={isAddEditScheduleOpen}
        editItem={scheduleToEdit}
        onSave={handleSaveSchedule}
        onClose={() => {
          setIsAddEditScheduleOpen(false);
          setScheduleToEdit(null);
        }}
        onOpenDatePicker={(key, initial, cb, title) => {
          setDatePicker({
            isOpen: true,
            title,
            initialDate: initial,
            onSelect: cb
          });
        }}
        onOpenTimePicker={(key, initial, cb) => {
          setTimePicker({
            isOpen: true,
            initialTime: initial,
            onSelect: cb
          });
        }}
        onOpenSoundPicker={(currentSound, cb) => {
          setSoundPicker({
            isOpen: true,
            selectedSound: currentSound,
            onSelect: cb
          });
        }}
      />

      <ItemDetailModal
        isOpen={detailModal.isOpen}
        item={detailModal.item}
        type={detailModal.type}
        onClose={() => setDetailModal({ isOpen: false, item: null, type: 'task' })}
        onEdit={(item) => {
          if (detailModal.type === 'task') {
            setTaskToEdit(item);
            setIsAddEditTaskOpen(true);
          } else if (detailModal.type === 'schedule') {
            setScheduleToEdit(item);
            setIsAddEditScheduleOpen(true);
          }
        }}
        onToggleTask={handleToggleCompleteTask}
        onDelete={(item) => {
          if (detailModal.type === 'task') handleDeleteTask(item);
          else if (detailModal.type === 'schedule') handleDeleteSchedule(item);
          else if (detailModal.type === 'event') handleDeleteEvent(item);
        }}
        onTurnOffAlarm={handleTurnOffScheduleAlarm}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

      {/* Pickers */}
      <CircularTimePicker
        isOpen={timePicker.isOpen}
        initialTime={timePicker.initialTime}
        onSelect={(val) => {
          if (timePicker.onSelect) timePicker.onSelect(val);
        }}
        onClose={() => setTimePicker({ isOpen: false, initialTime: '', onSelect: null })}
      />

      <CustomDatePicker
        isOpen={datePicker.isOpen}
        title={datePicker.title}
        initialDate={datePicker.initialDate}
        onSelect={(val) => {
          if (datePicker.onSelect) datePicker.onSelect(val);
        }}
        onClose={() => setDatePicker({ isOpen: false, title: 'Select Date', initialDate: '', onSelect: null })}
      />

      <SoundPickerModal
        isOpen={soundPicker.isOpen}
        selectedSound={soundPicker.selectedSound}
        onSelect={(soundKey) => {
          if (soundPicker.onSelect) soundPicker.onSelect(soundKey);
        }}
        onClose={() => setSoundPicker({ isOpen: false, selectedSound: 'golden_chime', onSelect: null })}
      />

      {/* Alarm Ringing & Multi-Alarm Reschedule */}
      <AlarmRingingModal
        isOpen={isAlarmRingingOpen}
        ringingList={ringingList}
        onDismissSingle={handleDismissRingingSingle}
        onDismissAll={handleDismissRingingAll}
        onSnoozeMinutes={handleSnoozeMinutes}
        onOpenReschedule={(target) => {
          setRescheduleModal({ isOpen: true, target });
        }}
      />

      <RescheduleModal
        isOpen={rescheduleModal.isOpen}
        target={rescheduleModal.target}
        onConfirm={handleRescheduleConfirm}
        onClose={() => setRescheduleModal({ isOpen: false, target: null })}
        onOpenDatePicker={(key, initial, cb, title) => {
          setDatePicker({
            isOpen: true,
            title,
            initialDate: initial,
            onSelect: cb
          });
        }}
        onOpenTimePicker={(key, initial, cb) => {
          setTimePicker({
            isOpen: true,
            initialTime: initial,
            onSelect: cb
          });
        }}
      />
    </div>
  );
}
