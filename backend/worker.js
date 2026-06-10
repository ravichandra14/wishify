import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { db } from './db.js';

// SMTP Mail Configuration from env variables
const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || 'Wishify <noreply@wishify.app>';

// Twilio SMS Configuration from env variables
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// Helper to send email using Nodemailer
async function sendEmail({ to, subject, text, cardConfig }) {
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[Worker - SMTP Simulation] Sending email to: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  // Construct styled HTML card layout if it is a greeting card
  let htmlContent = null;
  if (cardConfig) {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; background-color: ${cardConfig.bgColor || '#FFF5F5'}; border: 4px solid ${cardConfig.textColor || '#FF4F9A'}; padding: 40px; text-align: center; max-width: 500px; margin: 0 auto; border-radius: 12px; color: ${cardConfig.textColor || '#FF4F9A'};">
        <div style="font-size: 64px; margin-bottom: 20px;">${cardConfig.sticker || '🎉'}</div>
        <h1 style="font-size: 28px; margin-bottom: 20px;">${cardConfig.heading || 'Happy Birthday!'}</h1>
        <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">${cardConfig.body || text}</p>
        <hr style="border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin-bottom: 20px;" />
        <div style="font-size: 11px; color: rgba(0,0,0,0.4);">MADE WITH WISHIFY.APP 🎂</div>
      </div>
    `;
  }

  const mailOptions = {
    from: emailFrom,
    to,
    subject,
    text,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Worker - SMTP Success] Mail delivered successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Worker - SMTP Error] Failed to send email:', error);
    return { success: false, error: error.message };
  }
}

// Helper to send SMS using Twilio
async function sendSMS({ to, body }) {
  if (!twilioSid || !twilioToken || !twilioPhone) {
    console.log(`[Worker - Twilio Simulation] Sending SMS to: ${to} | Body: ${body}`);
    return { success: true, simulated: true };
  }

  const client = twilio(twilioSid, twilioToken);

  try {
    const message = await client.messages.create({
      body,
      from: twilioPhone,
      to
    });
    console.log(`[Worker - Twilio Success] SMS sent successfully: ${message.sid}`);
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error('[Worker - Twilio Error] Failed to send SMS:', error);
    return { success: false, error: error.message };
  }
}

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
export async function processScheduledWishes() {
  const now = new Date();
  const scheduled = db.get('scheduledWishes');
  let updatedCount = 0;
  let hasChanges = false;

  for (const wish of scheduled) {
    if (wish.status !== 'Scheduled') continue;

    const targetDate = getScheduledTimestamp(wish);

    // If scheduled time is in the past, send it
    if (targetDate <= now) {
      console.log(`[Worker] Starting dispatch process for wish ID ${wish.id} to ${wish.recipientName} via ${wish.channel}...`);
      
      // Look up contact profile by ID to retrieve their email & phone number
      const contact = db.findOne('contacts', c => c.id === wish.recipientId);
      
      let deliveryResult = { success: false, message: '', error: null, simulated: false };

      if (wish.channel === 'Email') {
        const emailTo = contact?.email;
        if (!emailTo) {
          deliveryResult = { 
            success: false, 
            message: `[DELIVERY FAIL] Recipient contact "${wish.recipientName}" has no email address configured in the directory.` 
          };
        } else {
          const res = await sendEmail({
            to: emailTo,
            subject: `Happy Birthday ${wish.recipientName}! 🎂`,
            text: wish.messageContent,
            cardConfig: wish.cardConfig
          });
          if (res.success) {
            deliveryResult = {
              success: true,
              simulated: !!res.simulated,
              message: res.simulated 
                ? `[SIMULATED EMAIL SUCCESS] Delivered greeting email to ${emailTo}.` 
                : `[EMAIL SENT SUCCESS] Delivered greeting email to ${emailTo} (MessageID: ${res.messageId}).`
            };
          } else {
            deliveryResult = {
              success: false,
              message: `[DELIVERY FAIL] Failed to send email to ${emailTo}: ${res.error}`
            };
          }
        }
      } else if (wish.channel === 'Message') {
        const phoneTo = contact?.phone;
        if (!phoneTo) {
          deliveryResult = {
            success: false,
            message: `[DELIVERY FAIL] Recipient contact "${wish.recipientName}" has no phone number configured in the directory.`
          };
        } else {
          const res = await sendSMS({
            to: phoneTo,
            body: wish.messageContent
          });
          if (res.success) {
            deliveryResult = {
              success: true,
              simulated: !!res.simulated,
              message: res.simulated
                ? `[SIMULATED SMS SUCCESS] Delivered SMS message to ${phoneTo}.`
                : `[SMS SENT SUCCESS] Delivered SMS message to ${phoneTo} (SID: ${res.sid}).`
            };
          } else {
            deliveryResult = {
              success: false,
              message: `[DELIVERY FAIL] Failed to send SMS to ${phoneTo}: ${res.error}`
            };
          }
        }
      }

      // Update wish status in db queue
      wish.status = deliveryResult.success ? 'Sent' : 'Failed';
      updatedCount++;
      hasChanges = true;

      // Add to delivery logs database
      const logEntry = {
        id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        wishId: wish.id,
        recipientName: wish.recipientName,
        channel: wish.channel,
        sentAt: new Date().toISOString(),
        status: deliveryResult.success ? (deliveryResult.simulated ? 'Simulated' : 'Success') : 'Failed',
        message: deliveryResult.message
      };
      db.insert('deliveryLogs', logEntry);

      // Add to history list if successful
      if (deliveryResult.success) {
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
    }
  }

  if (hasChanges) {
    db.set('scheduledWishes', scheduled);
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
