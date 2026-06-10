import React, { useState } from 'react';
import { Save, Bell, Clock, User, Shield } from 'lucide-react';

interface SettingsProps {
  settings: {
    emailNotifications: boolean;
    browserNotifications: boolean;
    reminderDayOf: boolean;
    reminderOneDayBefore: boolean;
    reminderThreeDaysBefore: boolean;
    timezone: string;
    userName: string;
    userEmail: string;
  };
  onSaveSettings: (settings: any) => void;
  triggerToast: (msg: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onSaveSettings, triggerToast }) => {
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotifications);
  const [browserNotifications, setBrowserNotifications] = useState(settings.browserNotifications);
  const [reminderDayOf, setReminderDayOf] = useState(settings.reminderDayOf);
  const [reminderOneDayBefore, setReminderOneDayBefore] = useState(settings.reminderOneDayBefore);
  const [reminderThreeDaysBefore, setReminderThreeDaysBefore] = useState(settings.reminderThreeDaysBefore);
  const [timezone, setTimezone] = useState(settings.timezone);
  
  const [userName, setUserName] = useState(settings.userName);
  const [userEmail, setUserEmail] = useState(settings.userEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      emailNotifications,
      browserNotifications,
      reminderDayOf,
      reminderOneDayBefore,
      reminderThreeDaysBefore,
      timezone,
      userName,
      userEmail
    });
    triggerToast('Settings saved successfully!');
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Account Settings</h1>
          <p style={{ color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
            Configure reminder triggers, delivery details, and system alerts.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="settings-section">
        
        {/* Section 1: User Profile info */}
        <div className="settings-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <User size={18} style={{ color: 'var(--primary-pink)' }} />
            <h3>Profile Information</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                value={userEmail} 
                onChange={e => setUserEmail(e.target.value)} 
                required 
              />
            </div>
          </div>
        </div>

        {/* Section 2: Notifications toggles */}
        <div className="settings-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Bell size={18} style={{ color: 'var(--primary-orange)' }} />
            <h3>Notification Preferences</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={emailNotifications} 
                onChange={e => setEmailNotifications(e.target.checked)} 
              />
              <span>Send me emails when scheduled wishes are dispatched</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={browserNotifications} 
                onChange={e => setBrowserNotifications(e.target.checked)} 
              />
              <span>Show in-browser reminder alerts for upcoming birthdays</span>
            </label>
          </div>
        </div>

        {/* Section 3: Birthday Reminder schedules */}
        <div className="settings-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Clock size={18} style={{ color: 'var(--primary-pink)' }} />
            <h3>Birthday Reminders</h3>
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '-0.5rem', marginBottom: '0.5rem' }}>
            Configure when Wishify alerts you about upcoming dates:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={reminderDayOf} 
                onChange={e => setReminderDayOf(e.target.checked)} 
              />
              <span>Alert me on the day of the birthday (at 9:00 AM)</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={reminderOneDayBefore} 
                onChange={e => setReminderOneDayBefore(e.target.checked)} 
              />
              <span>Alert me 1 day before the birthday</span>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={reminderThreeDaysBefore} 
                onChange={e => setReminderThreeDaysBefore(e.target.checked)} 
              />
              <span>Alert me 3 days before the birthday</span>
            </label>
          </div>
        </div>

        {/* Section 4: Timezone Selector */}
        <div className="settings-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={18} style={{ color: 'var(--primary-orange)' }} />
            <h3>Regional Settings</h3>
          </div>

          <div className="form-group">
            <label>Default Timezone</label>
            <select 
              className="form-select" 
              value={timezone} 
              onChange={e => setTimezone(e.target.value)}
            >
              <option value="Asia/Kolkata (GMT+5:30)">Asia/Kolkata (GMT+5:30)</option>
              <option value="UTC (GMT+0:00)">UTC (GMT+0:00)</option>
              <option value="US/Eastern (GMT-5:00)">US/Eastern (GMT-5:00)</option>
              <option value="US/Pacific (GMT-8:00)">US/Pacific (GMT-8:00)</option>
              <option value="Europe/London (GMT+1:00)">Europe/London (GMT+1:00)</option>
            </select>
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
            <Save size={16} /> Save Settings
          </button>
        </div>

      </form>

    </div>
  );
};
