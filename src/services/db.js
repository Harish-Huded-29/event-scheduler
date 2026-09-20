/**
 * Event Scheduler — React IndexedDB Layer
 * Dedicated local storage for Events with cloud attachments metadata.
 */

class EventSchedulerDB {
  constructor() {
    this.dbName = 'EventSchedulerDB';
    this.dbVersion = 2;
    this.db = null;
  }

  /**
   * Initializes or upgrades the IndexedDB database for Events.
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create or migrate Events Store
        if (!db.objectStoreNames.contains('events')) {
          const eventsStore = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
          eventsStore.createIndex('startDate', 'startDate', { unique: false });
          eventsStore.createIndex('endDate', 'endDate', { unique: false });
          eventsStore.createIndex('category', 'category', { unique: false });
          eventsStore.createIndex('createdAt', 'createdAt', { unique: false });
        } else {
          // If migrating from v1
          const eventsStore = event.target.transaction.objectStore('events');
          if (!eventsStore.indexNames.contains('category')) {
            eventsStore.createIndex('category', 'category', { unique: false });
          }
        }

        // Clean up legacy stores if upgrading from v1
        if (db.objectStoreNames.contains('tasks')) {
          try { db.deleteObjectStore('tasks'); } catch {}
        }
        if (db.objectStoreNames.contains('schedule')) {
          try { db.deleteObjectStore('schedule'); } catch {}
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
     EVENTS CRUD
     ========================================================================= */

  async addEvent(eventData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readwrite');
      const store = tx.objectStore('events');

      const record = {
        name: eventData.name || 'Untitled Event',
        category: eventData.category || 'General',
        startDate: eventData.startDate || new Date().toISOString().split('T')[0],
        endDate: eventData.endDate || eventData.startDate || new Date().toISOString().split('T')[0],
        location: eventData.location || '',
        remarks: eventData.remarks || '',
        attachments: eventData.attachments || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const request = store.add(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateEvent(eventData) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['events'], 'readwrite');
      const store = tx.objectStore('events');

      const getReq = store.get(Number(eventData.id));
      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (!existing) {
          return reject(new Error('Event not found'));
        }

        const updated = {
          ...existing,
          ...eventData,
          id: Number(eventData.id),
          attachments: eventData.attachments || existing.attachments || [],
          updatedAt: new Date().toISOString()
        };

        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
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
      request.onsuccess = () => {
        const events = request.result || [];
        events.sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));
        resolve(events);
      };
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
}

export const appDB = new EventSchedulerDB();
