import { db } from './db.js';

// Parses local date & time in a GMT offset timezone and returns absolute JS Date object
export function getScheduledTimestamp(wish) {
  const tzPart = wish.timezone || '';
  let offsetMinutes = 0; // Default to UTC
  const match = tzPart.match(/GMT([+-])(\d+):(\d+)/);
  if (match) {
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    offsetMinutes = sign * (hours * 60 + minutes);
  }

  const [year, month, day] = wish.date.split('-');
  const [hours, minutes] = (wish.time || '00:00').split(':');

  const utcDate = new Date(Date.UTC(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    parseInt(hours, 10),
    parseInt(minutes, 10),
    0
  ));

  return new Date(utcDate.getTime() - offsetMinutes * 60 * 1000);
}

// Background scheduler processing task
export function processScheduledWishes() {
  const now = new Date();
  const scheduled = db.get('scheduledWishes');
  let updatedCount = 0;

  const newScheduled = scheduled.map(wish => {
    if (wish.status !== 'Scheduled') return wish;

    const targetDate = getScheduledTimestamp(wish);

    // If scheduled time is in the past, send it
    if (targetDate <= now) {
      console.log(`[Worker] Delivering scheduled wish ID ${wish.id} to ${wish.recipientName} via ${wish.channel}...`);

      // 1. Mark as Sent
      wish.status = 'Sent';
      updatedCount++;

      // 2. Add to deliveryLogs
      const logEntry = {
        id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        wishId: wish.id,
        recipientName: wish.recipientName,
        channel: wish.channel,
        sentAt: new Date().toISOString(),
        status: 'Success',
        message: `[DELIVERY SUCCESS] Simulated birthday wish delivered to ${wish.recipientName} via ${wish.channel}. Content: "${wish.messageContent.substring(0, 50)}..."`
      };
      db.insert('deliveryLogs', logEntry);

      // 3. Add to History
      const historyItem = {
        id: `h_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        recipientName: wish.recipientName,
        wishType: wish.wishType,
        channel: wish.channel,
        date: new Date().toISOString().split('T')[0],
        content: wish.messageContent,
        cardConfig: wish.cardConfig
      };
      db.insert('history', historyItem);
    }

    return wish;
  });

  if (updatedCount > 0) {
    db.set('scheduledWishes', newScheduled);
    console.log(`[Worker] Background check completed. Processed ${updatedCount} scheduled wishes.`);
  }
}

// Check for daily birthday reminders and trigger notifications
export function processBirthdayReminders() {
  const settings = db.get('settings');
  if (!settings.emailNotifications && !settings.browserNotifications) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMonthDay = todayStr.substring(5); // MM-DD
  const contacts = db.get('contacts');

  const todaysBirthdays = contacts.filter(c => {
    if (!c.birthday) return false;
    return c.birthday.substring(5) === todayMonthDay;
  });

  if (todaysBirthdays.length > 0) {
    todaysBirthdays.forEach(contact => {
      // Check if reminder is already logged for today
      const logs = db.get('deliveryLogs');
      const alreadyNotified = logs.some(l => 
        l.wishId === `reminder_${contact.id}` && 
        l.sentAt.startsWith(todayStr)
      );

      if (!alreadyNotified) {
        console.log(`[Reminder Alert] Today is ${contact.name}'s birthday! Relationship: ${contact.relationship}.`);
        
        const logEntry = {
          id: `reminder_log_${Date.now()}`,
          wishId: `reminder_${contact.id}`,
          recipientName: contact.name,
          channel: 'System Reminder',
          sentAt: new Date().toISOString(),
          status: 'Alert',
          message: `[NOTIFICATION] System alert triggered: Today is ${contact.name}'s birthday (${contact.relationship}).`
        };
        db.insert('deliveryLogs', logEntry);
      }
    });
  }
}

// Start background worker
let timer = null;
export function startWorker() {
  console.log('[Worker] Starting background scheduler worker (Interval: 1 minute)...');
  
  // Run immediately on start
  processScheduledWishes();
  processBirthdayReminders();

  // Run every 60 seconds
  timer = setInterval(() => {
    processScheduledWishes();
    processBirthdayReminders();
  }, 60 * 1000);
}

export function stopWorker() {
  if (timer) {
    clearInterval(timer);
    console.log('[Worker] Stopped background scheduler worker.');
  }
}
