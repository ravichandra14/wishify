import React from 'react';
import { Calendar, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { getDaysRemaining } from '../utils/wishGenerator';
import type { Contact, ScheduledWish } from '../utils/wishGenerator';

interface DashboardProps {
  contacts: Contact[];
  scheduledWishes: ScheduledWish[];
  historyCount: number;
  onNavigate: (tab: string) => void;
  onOpenAddContact: () => void;
  onPreFillWishCreator: (contact: Contact) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  contacts,
  scheduledWishes,
  historyCount,
  onNavigate,
  onOpenAddContact,
  onPreFillWishCreator
}) => {
  // Dynamic Welcome Greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Compute metrics
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayMonthDay = todayStr.substring(5); // MM-DD

  const todaysBirthdays = contacts.filter(c => {
    if (!c.birthday) return false;
    return c.birthday.substring(5) === todayMonthDay;
  });

  const upcomingBirthdays = contacts.filter(c => {
    const days = getDaysRemaining(c.birthday);
    return days > 0 && days <= 7;
  });

  const activeScheduled = scheduledWishes.filter(w => w.status === 'Scheduled').length;
  const sentWishes = scheduledWishes.filter(w => w.status === 'Sent').length + historyCount;

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Welcome Header */}
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h1>{getGreeting()}, User 👋</h1>
          <p>
            {upcomingBirthdays.length === 0 
              ? 'You have no upcoming birthdays this week.' 
              : `You have ${upcomingBirthdays.length} upcoming birthday${upcomingBirthdays.length > 1 ? 's' : ''} this week.`
            }
          </p>
        </div>
      </div>

      {/* Today Alert Banner if any birthdays today */}
      {todaysBirthdays.length > 0 && (
        <div style={{
          background: 'var(--grad-glow)',
          border: '1px solid var(--primary-pink)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '2rem' }}>🎂</div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontWeight: 800, color: 'var(--primary-pink)' }}>Birthday Today!</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--dark-text)' }}>
              It's <strong>{todaysBirthdays.map(c => c.name).join(', ')}</strong>'s birthday today. Don't let them feel forgotten!
            </p>
          </div>
          <button 
            className="btn-primary" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
            onClick={() => onPreFillWishCreator(todaysBirthdays[0])}
          >
            Create Wish Now
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFF0F5', color: 'var(--primary-pink)' }}>🎂</div>
          <div className="stat-info">
            <span className="stat-value">{todaysBirthdays.length}</span>
            <span className="stat-label">Today's Birthdays</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FFFBEB', color: 'var(--primary-orange)' }}>📆</div>
          <div className="stat-info">
            <span className="stat-value">{upcomingBirthdays.length}</span>
            <span className="stat-label">Upcoming (7 days)</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>⏰</div>
          <div className="stat-info">
            <span className="stat-value">{activeScheduled}</span>
            <span className="stat-label">Scheduled Wishes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>✨</div>
          <div className="stat-info">
            <span className="stat-value">{sentWishes}</span>
            <span className="stat-label">Sent Wishes</span>
          </div>
        </div>
      </div>

      {/* Dashboard Main layout: Upcoming birthdays (left), Quick Actions (right) */}
      <div className="dashboard-sections">
        
        {/* Left Side: Upcoming Birthdays list */}
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
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary-text)' }}>
              <Calendar size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.95rem' }}>No birthdays in the next 7 days.</p>
              <button className="btn-secondary" style={{ marginTop: '1rem', fontSize: '0.85rem' }} onClick={onOpenAddContact}>
                Add Someone New
              </button>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingBirthdays.map(contact => {
                const days = getDaysRemaining(contact.birthday);
                const isSoon = days <= 3;
                return (
                  <div key={contact.id} className="upcoming-item">
                    <div className="upcoming-left">
                      <div className="upcoming-avatar">
                        {contact.name.charAt(0)}
                      </div>
                      <div className="upcoming-details">
                        <span className="upcoming-name">{contact.name}</span>
                        <div className="upcoming-meta">
                          <span>{contact.relationship}</span>
                          <span>•</span>
                          <span>{new Date(contact.birthday).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: 700, 
                        color: isSoon ? '#D97706' : 'var(--secondary-text)',
                        background: isSoon ? '#FEF3C7' : 'var(--bg-color)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {days === 1 ? 'Tomorrow' : `In ${days} days`}
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

        {/* Right Side: Quick Actions Panel */}
        <div className="dash-panel" style={{ height: 'max-content' }}>
          <div className="panel-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions-panel">
            <button className="action-btn" onClick={() => onNavigate('Create Birthday Wish')}>
              <div className="action-btn-icon" style={{ background: '#FFF0F5', color: 'var(--primary-pink)' }}>
                <Sparkles size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Create Birthday Wish</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontWeight: 500 }}>Tailor a note or design a card</span>
              </div>
            </button>

            <button className="action-btn" onClick={onOpenAddContact}>
              <div className="action-btn-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
                <UserPlus size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Add Contact</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontWeight: 500 }}>Register a new birthday profile</span>
              </div>
            </button>

            <button className="action-btn" onClick={() => onNavigate('Create Birthday Wish')}>
              <div className="action-btn-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                <Calendar size={18} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Schedule Wish</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontWeight: 500 }}>Queue a greeting for later</span>
              </div>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
