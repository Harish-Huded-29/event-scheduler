import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header.jsx';
import FloatingActionButton from './components/layout/FloatingActionButton.jsx';
import EventsView from './components/views/EventsView.jsx';

import AddEditEventModal from './components/modals/AddEditEventModal.jsx';
import EventDetailModal from './components/modals/EventDetailModal.jsx';
import ConfirmModal from './components/modals/ConfirmModal.jsx';
import CustomDatePicker from './components/pickers/CustomDatePicker.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';

import { appDB } from './services/db.js';
import { localStorageManager } from './services/localStorageManager.js';
import { nativeBridge } from './services/nativeBridge.js';
import { backButtonManager } from './utils/backButtonManager.js';

export default function App() {
  // Navigation & Filtering
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'month' or 'year'

  // Data Store
  const [eventsList, setEventsList] = useState([]);

  // Toast System
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  const [detailModal, setDetailModal] = useState({ isOpen: false, event: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [datePicker, setDatePicker] = useState({ isOpen: false, title: 'Select Date', initialDate: '', onSelect: null });

  // Data Loader
  const loadEvents = useCallback(async () => {
    try {
      let items = [];
      if (filterMode === 'all') {
        items = await appDB.getAllEvents();
      } else if (filterMode === 'year') {
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
    loadEvents();
  }, [loadEvents]);

  // Handle Android Hardware Back Button with hierarchical priority stack
  useEffect(() => {
    const unregisters = [];

    if (confirmModal.isOpen) {
      unregisters.push(
        backButtonManager.register(() => {
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null });
        }, 100) // Highest priority: confirm modal
      );
    }

    if (datePicker.isOpen) {
      unregisters.push(
        backButtonManager.register(() => {
          setDatePicker({ isOpen: false, title: 'Select Date', initialDate: '', onSelect: null });
        }, 80) // High priority: date picker
      );
    }

    if (isAddEditOpen) {
      unregisters.push(
        backButtonManager.register(() => {
          setIsAddEditOpen(false);
          setEventToEdit(null);
        }, 50) // Medium priority: create/edit event
      );
    }

    if (detailModal.isOpen) {
      unregisters.push(
        backButtonManager.register(() => {
          setDetailModal({ isOpen: false, event: null });
        }, 40) // Base modal priority: event details (image viewer has priority 70)
      );
    }

    return () => {
      unregisters.forEach((unreg) => unreg());
    };
  }, [confirmModal.isOpen, datePicker.isOpen, isAddEditOpen, detailModal.isOpen]);

  /* =========================================================================
     CRUD HANDLERS
     ========================================================================= */

  // Save Event (Create or Update)
  const handleSaveEvent = async (eventData) => {
    try {
      if (eventData.id) {
        // Edit Mode
        await appDB.updateEvent(eventData);
        showToast('Event updated successfully', 'success');
        nativeBridge.triggerHaptic('success');
      } else {
        // Create Mode
        await appDB.addEvent(eventData);
        showToast('Event created successfully', 'success');
        nativeBridge.triggerHaptic('success');

        // Navigate calendar view to created event's date
        if (eventData.startDate) {
          const eventYear = parseInt(eventData.startDate.substring(0, 4), 10);
          const eventMonth = parseInt(eventData.startDate.substring(5, 7), 10) - 1;
          if (!isNaN(eventYear) && !isNaN(eventMonth)) {
            setViewYear(eventYear);
            setViewMonth(eventMonth);
          }
        }
      }

      setIsAddEditOpen(false);
      setEventToEdit(null);
      await loadEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      showToast('Failed to save event', 'error');
      nativeBridge.triggerHaptic('warning');
    }
  };

  // Delete Event with EventSchedule folder cleanup
  const handleDeleteEvent = (event) => {
    if (!event) return;
    const attachmentCount = (event.attachments || []).length;
    const confirmMessage = attachmentCount > 0
      ? `Are you sure you want to delete "${event.name}" and its ${attachmentCount} attached file(s) from your device storage?`
      : `Are you sure you want to delete "${event.name}"?`;

    setConfirmModal({
      isOpen: true,
      title: 'Delete Event',
      message: confirmMessage,
      onConfirm: async () => {
        try {
          // 1. Delete all attached files from device EventSchedule folder
          const attachments = event.attachments || [];
          await localStorageManager.deleteFiles(attachments);

          // 2. Delete event from IndexedDB
          await appDB.deleteEvent(event.id);
          showToast('Event and stored files deleted', 'info');
          nativeBridge.triggerHaptic('light');

          setDetailModal({ isOpen: false, event: null });
          await loadEvents();
        } catch (err) {
          console.error('Error deleting event:', err);
          showToast('Failed to delete event', 'error');
        }
      }
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (event) => {
    setDetailModal({ isOpen: false, event: null });
    setEventToEdit(event);
    setIsAddEditOpen(true);
  };

  return (
    <div className="app-container">
      {/* Header with Search and Month/Year Filter */}
      <Header
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
      />

      {/* Main Content Area — Events View */}
      <main className="app-main">
        <EventsView
          eventsList={eventsList}
          filterMode={filterMode}
          viewMonth={viewMonth}
          viewYear={viewYear}
          selectedYear={selectedYear}
          onItemClick={(event) => setDetailModal({ isOpen: true, event })}
          onEditClick={handleOpenEdit}
          onDeleteClick={handleDeleteEvent}
          onCreateNew={() => {
            setEventToEdit(null);
            setIsAddEditOpen(true);
          }}
        />
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton
        onOpenModal={() => {
          setEventToEdit(null);
          setIsAddEditOpen(true);
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />

      {/* Modals */}
      <AddEditEventModal
        isOpen={isAddEditOpen}
        editEvent={eventToEdit}
        onSave={handleSaveEvent}
        onClose={() => {
          setIsAddEditOpen(false);
          setEventToEdit(null);
        }}
        onOpenDatePicker={(key, initial, cb, title) => {
          setDatePicker({
            isOpen: true,
            title,
            initialDate: initial,
            onSelect: cb
          });
        }}
        showToast={showToast}
      />

      <EventDetailModal
        isOpen={detailModal.isOpen}
        event={detailModal.event}
        onClose={() => setDetailModal({ isOpen: false, event: null })}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteEvent}
        showToast={showToast}
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null })}
      />
    </div>
  );
}
