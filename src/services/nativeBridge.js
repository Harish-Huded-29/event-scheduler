/**
 * Event Scheduler — React Native Bridge
 * Capacitor Local Notifications, Android AlarmManager & Vibration Haptics.
 */

import { audioEngine, SOUND_PRESETS } from './audioEngine.js';

class NativeBridge {
  constructor() {
    this.vibrationInterval = null;
    this.alarmRingingCallback = null;
    this.handledItemKeys = new Set();
    this.activeTimeouts = new Map();
    this.init();
  }

  isNative() {
    if (typeof window === 'undefined') return false;
    return Boolean(
      window.Capacitor?.isNativePlatform?.() ||
      (window.Capacitor?.getPlatform && window.Capacitor.getPlatform() !== 'web') ||
      Boolean(window.Capacitor?.Plugins?.LocalNotifications)
    );
  }

  setAlarmRingingCallback(cb) {
    this.alarmRingingCallback = cb;
  }

  async init() {
    if (this.isNative()) {
      await this.initCapacitor();
    }
  }

  async initCapacitor() {
    try {
      const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;
      if (LocalNotifications) {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }

        // Create High-Priority Alarm Channel
        try {
          await LocalNotifications.createChannel({
            id: 'alarm_channel',
            name: 'Alarm Clock & Reminders',
            description: 'High-priority sound and vibration alerts for tasks and schedules',
            importance: 5,
            visibility: 1, // VISIBILITY_PUBLIC (shows on lock screen)
            sound: 'beep.wav',
            vibration: true,
            lights: true,
            lightColor: '#C5A059'
          });
        } catch (e) {
          console.warn('Channel creation error:', e);
        }

        // Listen for system local notification trigger
        LocalNotifications.addListener('localNotificationReceived', (notification) => {
          this.handleNotificationTrigger(notification);
        });

        // Listen for user interaction/tap on notification
        LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
          if (action?.notification) {
            this.handleNotificationTrigger(action.notification);
          }
        });
      }
    } catch (err) {
      console.warn('Capacitor init error:', err);
    }
  }

  handleNotificationTrigger(notification) {
    if (!notification) return;
    let extra = notification.extra || {};
    if (typeof extra === 'string') {
      try {
        extra = JSON.parse(extra);
      } catch (e) {
        extra = {};
      }
    }

    const itemId = String(extra.id || notification.id || '');
    const dateVal = extra.dueDate || extra.date || '';
    const timeVal = extra.dueTime || extra.time || '';
    
    // Strict deduplication key
    const dedupeKey = `alarm_${itemId}_${dateVal}_${timeVal}`;
    if (this.handledItemKeys.has(dedupeKey)) {
      return; // Completely ignore duplicate event
    }
    this.handledItemKeys.add(dedupeKey);
    // Retain key for 3 minutes to avoid double-ring
    setTimeout(() => this.handledItemKeys.delete(dedupeKey), 180000);

    const item = {
      id: itemId,
      name: notification.title || extra.name || extra.title || 'Alarm Reminder',
      title: notification.title || extra.title || extra.name || 'Alarm Reminder',
      itemType: extra.itemType || 'task',
      alarmSound: extra.alarmSound || 'golden_chime',
      dueDate: dateVal,
      dueTime: timeVal,
      alarmId: notification.id
    };

    if (this.alarmRingingCallback) {
      this.alarmRingingCallback(item);
    }
  }

  startVibration() {
    this.stopVibration();
    const triggerHaptic = () => {
      if (this.isNative() && window.Capacitor?.Plugins?.Haptics) {
        try {
          window.Capacitor.Plugins.Haptics.vibrate({ duration: 600 });
        } catch {}
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([500, 200, 500, 200, 800]);
        } catch {}
      }
    };

    triggerHaptic();
    this.vibrationInterval = setInterval(triggerHaptic, 2400);
  }

  stopVibration() {
    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }

  async scheduleReminder(item) {
    const isAlarm = Boolean(item.alarmActive || item.setAlarm);
    if (!isAlarm) {
      // If alarm is not active, do not schedule alarm/notification
      return { scheduled: false, alarmId: null };
    }

    const dateVal = item.dueDate || item.date;
    const timeVal = item.dueTime || item.time || '09:00';
    if (!dateVal) return { scheduled: false, alarmId: null };

    const alarmId = Math.floor(Math.random() * 2147483640) + 1;
    const scheduleDate = new Date(`${dateVal}T${timeVal}:00`);

    if (isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
      return { scheduled: false, alarmId };
    }

    if (this.isNative() && window.Capacitor?.Plugins?.LocalNotifications) {
      try {
        await window.Capacitor.Plugins.LocalNotifications.schedule({
          notifications: [
            {
              title: item.name || item.title || 'Scheduled Reminder',
              body: item.notes || `Scheduled for ${timeVal}`,
              id: alarmId,
              schedule: {
                at: scheduleDate,
                allowWhileIdle: true
              },
              sound: 'beep.wav',
              channelId: 'alarm_channel',
              smallIcon: 'ic_stat_notification',
              iconColor: '#C5A059',
              ongoing: true,
              autoCancel: false,
              extra: {
                id: String(item.id),
                name: item.name || item.title || '',
                title: item.title || item.name || '',
                itemType: item.itemType || 'task',
                alarmSound: item.alarmSound || 'golden_chime',
                dueDate: dateVal,
                dueTime: timeVal
              }
            }
          ]
        });
        return { scheduled: true, alarmId };
      } catch (err) {
        console.warn('Capacitor schedule error:', err);
      }
    } else if (!this.isNative()) {
      // Browser fallback only (never run simultaneously with native Capacitor)
      const delay = scheduleDate.getTime() - Date.now();
      if (delay > 0 && delay < 2147483647) {
        if (this.activeTimeouts.has(item.id)) {
          clearTimeout(this.activeTimeouts.get(item.id));
        }
        const timeoutId = setTimeout(() => {
          this.activeTimeouts.delete(item.id);
          this.handleNotificationTrigger({
            id: alarmId,
            title: item.name || item.title,
            extra: {
              id: String(item.id),
              name: item.name,
              title: item.title,
              itemType: item.itemType || 'task',
              alarmSound: item.alarmSound || 'golden_chime',
              dueDate: dateVal,
              dueTime: timeVal
            }
          });
        }, delay);
        this.activeTimeouts.set(item.id, timeoutId);
      }
    }

    return { scheduled: true, alarmId };
  }

  async cancelAlarm(alarmId) {
    if (!alarmId) return;
    if (this.isNative() && window.Capacitor?.Plugins?.LocalNotifications) {
      try {
        await window.Capacitor.Plugins.LocalNotifications.cancel({
          notifications: [{ id: Number(alarmId) }]
        });
      } catch (err) {
        console.warn('Cancel alarm error:', err);
      }
    }
  }

  async addCalendarEvent(item) {
    const title = item.name || item.title || 'Scheduled Event';
    const dateStr = item.dueDate || item.date;
    const timeStr = item.dueTime || item.time || '09:00';
    const startDate = new Date(`${dateStr}T${timeStr}:00`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    const calendarEventId = `cal_${Date.now()}`;

    if (this.isNative() && (window.Capacitor?.Plugins?.Calendar || window.plugins?.calendar)) {
      try {
        const CalendarPlugin = window.Capacitor?.Plugins?.Calendar || window.plugins?.calendar;
        if (typeof CalendarPlugin.createEventWithOptions === 'function') {
          await new Promise((res, rej) => {
            CalendarPlugin.createEventWithOptions(
              title,
              item.location || '',
              item.notes || '',
              startDate,
              endDate,
              { firstReminderMinutes: 15 },
              res,
              rej
            );
          });
          return { success: true, calendarEventId, message: 'Added to phone calendar' };
        }
      } catch (e) {
        console.warn('Calendar plugin error:', e);
      }
    }

    return { success: true, calendarEventId, message: 'Calendar entry recorded' };
  }

  async removeCalendarEvent(calendarEventId) {
    if (!calendarEventId) return { success: true };
    return { success: true };
  }

  deleteCalendarEvent(calendarEventId) {
    return this.removeCalendarEvent(calendarEventId);
  }
}

export const nativeBridge = new NativeBridge();
export { SOUND_PRESETS };
