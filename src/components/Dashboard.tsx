import React from 'react';
import { Calendar, UserPlus, Sparkles, ArrowRight, CheckCircle2, XCircle, Bell, History } from 'lucide-react';
import { getDaysRemaining } from '../utils/wishGenerator';
import type { Contact, ScheduledWish } from '../utils/wishGenerator';

interface DashboardProps {
  contacts: Contact[];
  scheduledWishes: ScheduledWish[];
  historyCount: number;
  userName: string;
  deliveryLogs: any[];
  onNavigate: (tab: string) => void;
  onOpenAddContact: () => void;
  onPreFillWishCreator: (contact: Contact) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contacts,
  scheduledWishes,
  historyCount,
  userName,
  deliveryLogs,
  onNavigate,
  onOpenAddContact,
  onPreFillWishCreator
}) => {
  // Compute metrics
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayMonthDay = todayStr.substring(5); // MM-DD

  const todaysBirthdays = contacts.filter(c => {
    if (!c.birthday) return false;
    return c.birthday.substring(5) === todayMonthDay;
  });

  const upcomingBirthdays = contacts
    .filter(c => {
      const days = getDaysRemaining(c.birthday);
      return days > 0 && days <= 30;
    })
    .sort((a, b) => getDaysRemaining(a.birthday) - getDaysRemaining(b.birthday));

  const activeScheduled = scheduledWishes.filter(w => w.status === 'Scheduled').length;
  const sentWishes = scheduledWishes.filter(w => w.status === 'Sent').length + historyCount;

  // Monthly Birthday Distribution calculations
  const getMonthIndex = (birthdayStr: string): number => {
    if (!birthdayStr) return -1;
    const parts = birthdayStr.split('-');
    if (parts.length === 3) {
      return parseInt(parts[1], 10) - 1;
    } else if (parts.length === 2) {
      return parseInt(parts[0], 10) - 1;
    }
    const d = new Date(birthdayStr);
    return isNaN(d.getTime()) ? -1 : d.getMonth();
  };

  const getMonthlyCelebrationsCount = () => {
    const counts = Array(12).fill(0);
    contacts.forEach(c => {
      const mIdx = getMonthIndex(c.birthday);
      if (mIdx >= 0 && mIdx < 12) {
        counts[mIdx]++;
      }
    });
    return counts;
  };

  const monthlyCounts = getMonthlyCelebrationsCount();
  const maxCount = Math.max(...monthlyCounts, 1);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Sorting logs descending
  const sortedLogs = [...deliveryLogs]
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .slice(0, 5);

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const getRemainingDaysPill = (days: number) => {
    if (days === 1) {
      return { text: 'Tomorrow', className: 'pill-tomorrow' };
    } else if (days <= 3) {
      return { text: `In ${days} days`, className: 'pill-soon' };
    } else if (days <= 7) {
      return { text: `In ${days} days`, className: 'pill-week' };
    } else {
      return { text: `In ${days} days`, className: 'pill-month' };
    }
  };

  // Find the single next celebrant
  const getNextCelebrant = () => {
    if (contacts.length === 0) return null;
    const sortedByUpcoming = [...contacts]
      .filter(c => c.birthday)
      .map(c => ({
        contact: c,
        days: getDaysRemaining(c.birthday)
      }))
      .sort((a, b) => a.days - b.days);
    
    return sortedByUpcoming[0] || null;
  };

  const nextCelebrantInfo = getNextCelebrant();

  return (
    <div className="anim-fade-in dashboard-wrapper">
      <div className="dash-glow-blob blob-1"></div>
      <div className="dash-glow-blob blob-2"></div>
      <div className="dash-glow-blob blob-3"></div>
      {/* Today Alert Banner if any birthdays today */}
      {todaysBirthdays.length > 0 && (
        <div className="today-banner">
          <div className="banner-emoji">🎂</div>
          <div className="banner-info">
            <h4>Birthday Today!</h4>
            <p>
              It's <strong>{todaysBirthdays.map(c => c.name).join(', ')}</strong>'s birthday today. Don't let them feel forgotten!
            </p>
          </div>
          <button 
            className="btn-primary" 
            onClick={() => onPreFillWishCreator(todaysBirthdays[0])}
          >
            Create Wish Now
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-today">🎂</div>
          <div className="stat-info">
            <span className="stat-value">{todaysBirthdays.length}</span>
            <span className="stat-label">Today's Birthdays</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-upcoming">📆</div>
          <div className="stat-info">
            <span className="stat-value">{upcomingBirthdays.length}</span>
            <span className="stat-label">Upcoming (30 days)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-scheduled">⏰</div>
          <div className="stat-info">
            <span className="stat-value">{activeScheduled}</span>
            <span className="stat-label">Scheduled Wishes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-sent">✨</div>
          <div className="stat-info">
            <span className="stat-value">{sentWishes}</span>
            <span className="stat-label">Sent Wishes</span>
          </div>
        </div>
      </div>
      {/* Dashboard Main layout: Flattened for perfect CSS Grid row heights */}
      <div className="dashboard-sections">
        
          {/* Upcoming Birthdays list */}
          <div className="dash-panel">
            <div className="panel-header">
              <h2>Upcoming Birthdays</h2>
              <button 
                onClick={() => onNavigate('Contacts')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-pink)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Manage Contacts <ArrowRight size={14} />
              </button>
            </div>

            {upcomingBirthdays.length === 0 ? (
              <div className="empty-panel-state">
                <Calendar size={40} className="empty-state-icon" />
                <p>No birthdays in the next 30 days.</p>
                <button className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }} onClick={onOpenAddContact}>
                  Add Someone New
                </button>
              </div>
            ) : (
              <div className="upcoming-list scrollable-upcoming">
                {upcomingBirthdays.map(contact => {
                  const days = getDaysRemaining(contact.birthday);
                  const pill = getRemainingDaysPill(days);
                  return (
                    <div key={contact.id} className="upcoming-item">
                      <div className="upcoming-left">
                        <div className="upcoming-avatar">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="upcoming-details">
                          <div className="upcoming-name-row">
                            <span className="upcoming-name">{contact.name}</span>
                            <span className="relationship-tag">{contact.relationship}</span>
                          </div>
                          <div className="upcoming-meta">
                            <span>{new Date(contact.birthday).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className={`days-pill ${pill.className}`}>
                          {pill.text}
                        </span>
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
                          onClick={() => onPreFillWishCreator(contact)}
                        >
                          Generate Wish
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        



                    {/* Celebrant Spotlight Card */}
          {!nextCelebrantInfo ? (
            <div className="dash-panel">
              <div className="panel-header">
                <h2>Celebrant Spotlight</h2>
              </div>
              <div className="empty-panel-state">
                <UserPlus size={40} className="empty-state-icon" />
                <p>No celebrants found</p>
                <p className="sub-p">Add contacts with birthday dates to view next celebrations spotlight here.</p>
                <button className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }} onClick={onOpenAddContact}>
                  Add Contact
                </button>
              </div>
            </div>
          ) : (
            <div className="dash-panel">
              <div className="panel-header">
                <h2>Celebrant Spotlight</h2>
              </div>
              <div className="spotlight-card-content">
                <div className="spotlight-header">
                  <div className="spotlight-avatar">
                    {nextCelebrantInfo.contact.name.charAt(0)}
                  </div>
                  <div className="spotlight-meta-info">
                    <span className="spotlight-name">{nextCelebrantInfo.contact.name}</span>
                    <div className="spotlight-relation-row">
                      <span className="relationship-tag">{nextCelebrantInfo.contact.relationship}</span>
                      <span className="spotlight-countdown-pill">
                        {nextCelebrantInfo.days === 0 ? 'Today' : nextCelebrantInfo.days === 1 ? 'Tomorrow' : `In ${nextCelebrantInfo.days} days`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="spotlight-details-section" style={{ marginTop: '1.25rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {nextCelebrantInfo.contact.interests && (
                      <div>
                        <div className="spotlight-title">Interests</div>
                        <div className="spotlight-interests-list">
                          {nextCelebrantInfo.contact.interests.split(',').map((item) => (
                            <span key={item.trim()} className="spotlight-interest-tag">
                              #{item.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {nextCelebrantInfo.contact.notes && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <div className="spotlight-title">Notes</div>
                        <p className="spotlight-notes">"{nextCelebrantInfo.contact.notes}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  className="spotlight-action-btn"
                  style={{ marginTop: '1.25rem' }}
                  onClick={() => onPreFillWishCreator(nextCelebrantInfo.contact)}
                >
                  <Sparkles size={16} />
                  <span>Prepare Birthday Wish</span>
                </button>
              </div>
            </div>
          )}
        

          {/* Activity Feed Panel */}
          <div className="dash-panel activity-panel">
            <div className="panel-header">
              <h2>Recent Delivery Activity</h2>
              <button 
                onClick={() => onNavigate('History')} 
                style={{ background: 'none', border: 'none', color: 'var(--primary-pink)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Full History <ArrowRight size={14} />
              </button>
            </div>

            {sortedLogs.length === 0 ? (
              <div className="empty-panel-state">
                <History size={40} className="empty-state-icon" />
                <p>No scheduler execution logs recorded yet.</p>
                <p className="sub-p">Background worker logs will appear here when greetings are auto-dispatched.</p>
              </div>
            ) : (
              <div className="activity-feed">
                {sortedLogs.map(log => (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon-container" data-status={log.status}>
                      {log.status === 'Success' && <CheckCircle2 size={16} />}
                      {log.status === 'Simulated' && <Sparkles size={16} />}
                      {log.status === 'Failed' && <XCircle size={16} />}
                      {log.status === 'Alert' && <Bell size={16} />}
                    </div>
                    <div className="activity-details">
                      <div className="activity-header">
                        <span className="activity-title">{log.message}</span>
                        <span className="activity-badge" data-status={log.status}>{log.status}</span>
                      </div>
                      <span className="activity-time">{formatLogTime(log.sentAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        

{/* Monthly Celebrations Distribution Chart */}
          <div className="dash-panel">
            <div className="panel-header">
              <h2>Celebration Distribution</h2>
            </div>
            <div className="monthly-chart-card">
              <div className="monthly-chart-grid">
                {monthNames.map((name, idx) => {
                  const count = monthlyCounts[idx];
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={name} className="month-row">
                      <span className="month-name">{name}</span>
                      <div className="month-bar-container">
                        <div 
                          className="month-bar-fill" 
                          style={{ width: count > 0 ? `${pct}%` : '0%' }}
                        />
                      </div>
                      <span className="month-count" style={{ opacity: count > 0 ? 1 : 0.2 }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

      </div>

    </div>
  );
};
