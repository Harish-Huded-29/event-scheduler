/**
 * Event Scheduler — React IndexedDB Layer
 * Zero-dependency local storage using IndexedDB with date and status indexes.
 */

class EventSchedulerDB {
  constructor() {
    this.dbName = 'EventSchedulerDB';
    this.dbVersion = 1;
    this.db = null;
  }

  /**
   * Initializes or upgrades the IndexedDB database and object stores.
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Events Store: { id, name, startDate, endDate, location, remarks, createdAt }
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
          eventsStore.createIndex('startDate', 'startDate', { unique: false });
          eventsStore.createIndex('endDate', 'endDate', { unique: false });
          eventsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 2. Tasks Store: { id, name, dueDate, dueTime, priority, notes, status, alarmActive, alarmSound, alarmId, calendarActive, calendarEventId, createdAt }
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          tasksStore.createIndex('dueDate', 'dueDate', { unique: false });
          tasksStore.createIndex('status', 'status', { unique: false });
          tasksStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 3. Schedule Store: { id, title, date, time, notes, alarmActive, alarmSound, alarmId, calendarActive, calendarEventId, createdAt }
        if (!db.objectStoreNames.contains('schedule')) {
          const scheduleStore = db.createObjectStore('schedule', { keyPath: 'id', autoIncrement: true });
          scheduleStore.createIndex('date', 'date', { unique: false });
          scheduleStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  /* =========================================================================
     EVENTS
     ========================================================================= */

  async addEvent(eventData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readwrite');
      const store = tx.objectStore('events');
      
      const record = {
        name: eventData.name,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        location: eventData.location || '',
        remarks: eventData.remarks || '',
        createdAt: new Date().toISOString()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getEventsByMonth(yearMonthStr) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readonly');
      const store = tx.objectStore('events');
      const request = store.openCursor();
      const results = [];
      const targetPrefix = yearMonthStr;

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const val = cursor.value;
          const startMonth = val.startDate ? val.startDate.substring(0, 7) : '';
          const endMonth = val.endDate ? val.endDate.substring(0, 7) : startMonth;

          if (startMonth <= targetPrefix && targetPrefix <= endMonth) {
            results.push(val);
          }
          cursor.continue();
        } else {
          results.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getEventsByYear(yearStr) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readonly');
      const store = tx.objectStore('events');
      const request = store.openCursor();
      const results = [];
      const targetYear = String(yearStr);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const val = cursor.value;
          const startYr = val.startDate ? val.startDate.substring(0, 4) : '';
          const endYr = val.endDate ? val.endDate.substring(0, 4) : startYr;

          if (startYr <= targetYear && targetYear <= endYr) {
            results.push(val);
          }
          cursor.continue();
        } else {
          results.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllEvents() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readonly');
      const store = tx.objectStore('events');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getEventById(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readonly');
      const store = tx.objectStore('events');
      const request = store.get(Number(id));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteEvent(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readwrite');
      const store = tx.objectStore('events');
      const request = store.delete(Number(id));
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /* =========================================================================
     TASKS
     ========================================================================= */

  async addTask(taskData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tasks'], 'readwrite');
      const store = tx.objectStore('tasks');

      const record = {
        name: taskData.name,
        dueDate: taskData.dueDate,
        dueTime: taskData.dueTime || '',
        priority: taskData.priority || 'medium',
        notes: taskData.notes || '',
        status: 'open',
        alarmActive: Boolean(taskData.alarmActive),
        alarmSound: taskData.alarmSound || 'golden_chime',
        alarmId: taskData.alarmId || null,
        calendarActive: Boolean(taskData.calendarActive),
        calendarEventId: taskData.calendarEventId || null,
        createdAt: new Date().toISOString()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTasks() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tasks'], 'readonly');
      const store = tx.objectStore('tasks');
      const request = store.getAll();

      request.onsuccess = () => {
        const tasks = request.result || [];
        tasks.sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === 'open' ? -1 : 1;
          }
          const dtA = `${a.dueDate} ${a.dueTime || '00:00'}`;
          const dtB = `${b.dueDate} ${b.dueTime || '00:00'}`;
          return dtA.localeCompare(dtB);
        });
        resolve(tasks);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getTaskById(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tasks'], 'readonly');
      const store = tx.objectStore('tasks');
      const request = store.get(Number(id));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTask(taskData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tasks'], 'readwrite');
      const store = tx.objectStore('tasks');

      const getReq = store.get(Number(taskData.id));
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) {
          return reject(new Error('Task not found'));
        }

        const updated = {
          ...item,
          ...taskData,
          id: Number(taskData.id)
        };

        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async updateTaskStatus(id, status, extraFields = {}) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tasks'], 'readwrite');
      const store = tx.objectStore('tasks');
      const getReq = store.get(Number(id));

      getReq.onsuccess = () => {
        const task = getReq.result;
        if (!task) {
          reject(new Error(`Task not found: ${id}`));
          return;
        }

        task.status = status;
        Object.assign(task, extraFields);

        const putReq = store.put(task);
        putReq.onsuccess = () => resolve(task);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  }

  async deleteTask(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['tasks'], 'readwrite');
      const store = tx.objectStore('tasks');
      const request = store.delete(Number(id));
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  /* =========================================================================
     SCHEDULE
     ========================================================================= */

  async addSchedule(scheduleData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['schedule'], 'readwrite');
      const store = tx.objectStore('schedule');

      const record = {
        title: scheduleData.title,
        date: scheduleData.date,
        time: scheduleData.time || '',
        notes: scheduleData.notes || '',
        alarmActive: Boolean(scheduleData.alarmActive),
        alarmSound: scheduleData.alarmSound || 'golden_chime',
        alarmId: scheduleData.alarmId || null,
        calendarActive: Boolean(scheduleData.calendarActive),
        calendarEventId: scheduleData.calendarEventId || null,
        createdAt: new Date().toISOString()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSchedule(scheduleData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['schedule'], 'readwrite');
      const store = tx.objectStore('schedule');

      const getReq = store.get(Number(scheduleData.id));
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) {
          return reject(new Error('Schedule entry not found'));
        }

        const updated = {
          ...item,
          ...scheduleData,
          id: Number(scheduleData.id)
        };

        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async getSchedule() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['schedule'], 'readonly');
      const store = tx.objectStore('schedule');
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        items.sort((a, b) => {
          const dtA = `${a.date || ''} ${a.time || '00:00'}`;
          const dtB = `${b.date || ''} ${b.time || '00:00'}`;
          return dtA.localeCompare(dtB);
        });
        resolve(items);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getScheduleById(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['schedule'], 'readonly');
      const store = tx.objectStore('schedule');
      const request = store.get(Number(id));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteSchedule(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['schedule'], 'readwrite');
      const store = tx.objectStore('schedule');
      const request = store.delete(Number(id));
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}

export const appDB = new EventSchedulerDB();
