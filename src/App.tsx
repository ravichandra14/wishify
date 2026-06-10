import { useState, useEffect } from 'react';
import { Home, Users, Sparkles, Clock, FileText, Settings as SettingsIcon, LogOut, ChevronUp } from 'lucide-react';

// Import subcomponents
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Contacts } from './components/Contacts';
import { CreateWish } from './components/CreateWish';
import { ScheduledWishes } from './components/ScheduledWishes';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { ShareModal, ScheduleModal, ContactModal } from './components/Modals';

// Import helpers & structures
import {
  DEFAULT_CONTACTS,
  DEFAULT_SCHEDULED,
  DEFAULT_HISTORY
} from './utils/wishGenerator';
import type { Contact, ScheduledWish, HistoryItem } from './utils/wishGenerator';

function App() {
  // Navigation & Page routing states
  const [isOnLandingPage, setIsOnLandingPage] = useState(true);
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Contacts' | 'Create Birthday Wish' | 'Scheduled Wishes' | 'History' | 'Settings'>('Dashboard');

  // Authentication & Profile states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('wishify_logged_in') === 'true';
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogin = async (name: string, email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        localStorage.setItem('wishify_logged_in', 'true');
        setSettings((prev: any) => ({
          ...prev,
          userName: data.user.name,
          userEmail: data.user.email
        }));
        triggerToast('Logged in successfully!');
      } else {
        setIsLoggedIn(true);
        localStorage.setItem('wishify_logged_in', 'true');
      }
    } catch (err) {
      console.warn('Backend offline, logging in locally.');
      setIsLoggedIn(true);
      localStorage.setItem('wishify_logged_in', 'true');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('wishify_logged_in');
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.sidebar-user-trigger') && !target.closest('.profile-popover')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileMenuOpen]);

  // Data lists with localStorage hydration
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('wishify_contacts');
    return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
  });

  const [scheduledWishes, setScheduledWishes] = useState<ScheduledWish[]>(() => {
    const saved = localStorage.getItem('wishify_scheduled');
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULED;
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('wishify_history');
    return saved ? JSON.parse(saved) : DEFAULT_HISTORY;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('wishify_settings');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      browserNotifications: true,
      reminderDayOf: true,
      reminderOneDayBefore: true,
      reminderThreeDaysBefore: false,
      timezone: 'Asia/Kolkata (GMT+5:30)',
      userName: 'User Profile',
      userEmail: 'user@wishify.app'
    };
  });

  // Flow State hooks
  const [preFilledContact, setPreFilledContact] = useState<Contact | null>(null);

  // Modals visibility state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareText, setShareText] = useState('');
  const [shareRecipient, setShareRecipient] = useState('');

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedRecipientName, setSchedRecipientName] = useState('');
  const [schedRecipientId, setSchedRecipientId] = useState('');
  const [schedChannel, setSchedChannel] = useState<'Email' | 'Message' | undefined>(undefined);
  const [schedContent, setSchedContent] = useState('');
  const [schedCardConfig, setSchedCardConfig] = useState<any>(undefined);
  const [schedWishType, setSchedWishType] = useState<'AI Wish' | 'Greeting Card' | 'Written'>('AI Wish');
  const [schedId, setSchedId] = useState<string | undefined>(undefined);
  const [schedDate, setSchedDate] = useState<string | undefined>(undefined);
  const [schedTime, setSchedTime] = useState<string | undefined>(undefined);
  const [schedTimezone, setSchedTimezone] = useState<string | undefined>(undefined);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch all data from backend when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchData = async () => {
      try {
        const contactsRes = await fetch('/api/contacts');
        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          setContacts(contactsData);
        }
        
        const scheduledRes = await fetch('/api/scheduled');
        if (scheduledRes.ok) {
          const scheduledData = await scheduledRes.json();
          setScheduledWishes(scheduledData);
        }
        
        const historyRes = await fetch('/api/history');
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setHistory(historyData.history || []);
        }
        
        const settingsRes = await fetch('/api/settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
      } catch (err) {
        console.error('Failed to load data from backend, using LocalStorage fallback:', err);
      }
    };
    
    fetchData();
  }, [isLoggedIn]);

  // Save states to local storage on modification
  useEffect(() => {
    localStorage.setItem('wishify_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('wishify_scheduled', JSON.stringify(scheduledWishes));
  }, [scheduledWishes]);

  useEffect(() => {
    localStorage.setItem('wishify_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('wishify_settings', JSON.stringify(settings));
  }, [settings]);

  // Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Contacts handlers
  const handleSaveContact = async (cData: Omit<Contact, 'id'> & { id?: string }) => {
    if (cData.id) {
      // Edit mode
      setContacts(prev => prev.map(c => c.id === cData.id ? { ...c, ...cData } as Contact : c));
      try {
        await fetch(`/api/contacts/${cData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cData)
        });
      } catch (err) {
        console.warn('Backend offline, updated contact locally.');
      }
    } else {
      // Add mode
      const localId = `c_${Date.now()}`;
      const newContactLocal: Contact = { ...cData, id: localId };
      setContacts(prev => [newContactLocal, ...prev]);

      try {
        const res = await fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cData)
        });
        if (res.ok) {
          const savedContact = await res.json();
          setContacts(prev => prev.map(c => c.id === localId ? savedContact : c));
        }
      } catch (err) {
        console.warn('Backend offline, saved contact locally.');
      }
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact? All scheduled wishes for them will remain in queue.')) {
      setContacts(prev => prev.filter(c => c.id !== id));
      triggerToast('Contact deleted.');
      try {
        await fetch(`/api/contacts/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('Backend offline, contact deleted locally.');
      }
    }
  };

  // Scheduled Wishes handlers
  const handleSaveSchedule = async (sData: Omit<ScheduledWish, 'id' | 'status'> & { id?: string }) => {
    if (sData.id) {
      setScheduledWishes(prev => prev.map(w => w.id === sData.id ? { ...w, ...sData } as ScheduledWish : w));
      try {
        await fetch(`/api/scheduled/${sData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sData)
        });
      } catch (err) {
        console.warn('Backend offline, rescheduled locally.');
      }
    } else {
      const localId = `s_${Date.now()}`;
      const newScheduleLocal: ScheduledWish = {
        ...sData,
        id: localId,
        status: 'Scheduled'
      };
      setScheduledWishes(prev => [newScheduleLocal, ...prev]);

      try {
        const res = await fetch('/api/scheduled', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sData)
        });
        if (res.ok) {
          const savedSchedule = await res.json();
          setScheduledWishes(prev => prev.map(w => w.id === localId ? savedSchedule : w));
        }
      } catch (err) {
        console.warn('Backend offline, scheduled locally.');
      }
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    setScheduledWishes(prev => prev.filter(w => w.id !== id));
    try {
      await fetch(`/api/scheduled/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Backend offline, scheduled wish deleted locally.');
    }
  };

  const handleOpenReschedule = (wish: ScheduledWish) => {
    setSchedId(wish.id);
    setSchedRecipientName(wish.recipientName);
    setSchedRecipientId(wish.recipientId);
    setSchedWishType(wish.wishType);
    setSchedContent(wish.messageContent);
    setSchedCardConfig(wish.cardConfig);
    setSchedChannel(wish.channel);
    setSchedDate(wish.date);
    setSchedTime(wish.time);
    setSchedTimezone(wish.timezone);
    setIsScheduleModalOpen(true);
  };

  // History Logger helper
  const handleSaveHistory = async (
    recipientName: string,
    content: string,
    wishType: 'AI Wish' | 'Greeting Card' | 'Written',
    cardConfig?: any
  ) => {
    const localId = `h_${Date.now()}`;
    const newLogLocal: HistoryItem = {
      id: localId,
      recipientName,
      wishType,
      date: new Date().toISOString().split('T')[0],
      content,
      cardConfig
    };
    setHistory(prev => [newLogLocal, ...prev]);

    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName,
          wishType,
          date: new Date().toISOString().split('T')[0],
          content,
          cardConfig
        })
      });
      if (res.ok) {
        const savedHistory = await res.json();
        setHistory(prev => prev.map(h => h.id === localId ? savedHistory : h));
      }
    } catch (err) {
      console.warn('Backend offline, logged to history locally.');
    }
  };

  // Navigation Pre-fill helper
  const handlePreFillWishCreator = (contact: Contact) => {
    setPreFilledContact(contact);
    setActiveTab('Create Birthday Wish');
    setIsOnLandingPage(false);
  };

  // CSV Import / Export handlers
  const handleExportCSV = () => {
    window.open('/api/contacts/export', '_blank');
    triggerToast('Downloading contacts CSV...');
  };

  const handleImportCSV = async (csvContent: string) => {
    try {
      const res = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvContent })
      });
      if (res.ok) {
        const data = await res.json();
        const contactsRes = await fetch('/api/contacts');
        if (contactsRes.ok) {
          const updatedContacts = await contactsRes.json();
          setContacts(updatedContacts);
        }
        triggerToast(data.message || 'Contacts imported successfully!');
      } else {
        const errData = await res.json();
        triggerToast(errData.error || 'Failed to import CSV.');
      }
    } catch (err) {
      triggerToast('Error connecting to backend for import.');
    }
  };

  return (
    <>
      {/* Toast popup alert */}
      {toastMessage && (
        <div className="toast">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Router */}
      {isOnLandingPage ? (
        <LandingPage
          onLaunchApp={() => setIsOnLandingPage(false)}
          onLaunchCreateWish={() => {
            setActiveTab('Create Birthday Wish');
            setIsOnLandingPage(false);
          }}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      ) : (
        <div className="app-container">
          {/* Sidebar Navigation */}
          <aside className="app-sidebar">
            <div className="sidebar-top">
              <div className="sidebar-logo" onClick={() => setIsOnLandingPage(true)}>
                <span>Wishify</span> 🎂
              </div>

              <nav className="sidebar-nav">
                <div
                  className={`nav-item ${activeTab === 'Dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Dashboard')}
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </div>

                <div
                  className={`nav-item ${activeTab === 'Contacts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Contacts')}
                >
                  <Users size={18} />
                  <span>Contacts</span>
                </div>

                <div
                  className={`nav-item ${activeTab === 'Create Birthday Wish' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Create Birthday Wish')}
                >
                  <Sparkles size={18} />
                  <span>Create Wish</span>
                </div>

                <div
                  className={`nav-item ${activeTab === 'Scheduled Wishes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Scheduled Wishes')}
                >
                  <Clock size={18} />
                  <span>Scheduled Wishes</span>
                </div>

                <div
                  className={`nav-item ${activeTab === 'History' ? 'active' : ''}`}
                  onClick={() => setActiveTab('History')}
                >
                  <FileText size={18} />
                  <span>History</span>
                </div>

                <div
                  className={`nav-item ${activeTab === 'Settings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Settings')}
                >
                  <SettingsIcon size={18} />
                  <span>Settings</span>
                </div>
              </nav>
            </div>

            <div className="sidebar-user-container">
              {isProfileMenuOpen && (
                <div className="profile-popover">
                  <div className="profile-popover-header">
                    <span>Logged in as:</span>
                    <span style={{ fontWeight: 700, display: 'block', color: 'var(--dark-text)', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {settings.userEmail}
                    </span>
                  </div>
                  <button 
                    className="profile-popover-item" 
                    onClick={() => {
                      setActiveTab('Settings');
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <SettingsIcon size={14} />
                    <span>Account Settings</span>
                  </button>
                  <button 
                    className="profile-popover-item logout-btn" 
                    onClick={() => {
                      handleLogout();
                      setIsOnLandingPage(true);
                      setIsProfileMenuOpen(false);
                    }}
                  >
                    <LogOut size={14} />
                    <span>Exit App</span>
                  </button>
                </div>
              )}

              <button 
                type="button"
                className={`sidebar-user-trigger ${isProfileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
              >
                <div className="sidebar-user-info">
                  <div className="user-avatar">
                    {settings.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{settings.userName}</span>
                    <span className="user-role">SaaS Pro Member</span>
                  </div>
                </div>
                <ChevronUp size={16} className="chevron-icon" />
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="app-content">
            {activeTab === 'Dashboard' && (
              <Dashboard
                contacts={contacts}
                scheduledWishes={scheduledWishes}
                historyCount={history.length}
                onNavigate={(tab: any) => setActiveTab(tab)}
                onOpenAddContact={() => {
                  setEditingContact(undefined);
                  setIsContactModalOpen(true);
                }}
                onPreFillWishCreator={handlePreFillWishCreator}
              />
            )}

            {activeTab === 'Contacts' && (
              <Contacts
                contacts={contacts}
                onOpenAddContact={() => {
                  setEditingContact(undefined);
                  setIsContactModalOpen(true);
                }}
                onOpenEditContact={(c) => {
                  setEditingContact(c);
                  setIsContactModalOpen(true);
                }}
                onDeleteContact={handleDeleteContact}
                onPreFillWishCreator={handlePreFillWishCreator}
                onImportCSV={handleImportCSV}
                onExportCSV={handleExportCSV}
              />
            )}

            {activeTab === 'Create Birthday Wish' && (
              <CreateWish
                contacts={contacts}
                preFilledContact={preFilledContact}
                onClearPreFill={() => setPreFilledContact(null)}
                onSaveHistory={handleSaveHistory}
                onOpenShareModal={(text, name) => {
                  setShareText(text);
                  setShareRecipient(name);
                  setIsShareModalOpen(true);
                }}
                onOpenScheduleModal={(name, id, type, content, config) => {
                  setSchedRecipientName(name);
                  setSchedRecipientId(id);
                  setSchedWishType(type);
                  setSchedContent(content);
                  setSchedCardConfig(config);
                  setSchedId(undefined);
                  setSchedChannel(undefined);
                  setSchedDate(undefined);
                  setSchedTime(undefined);
                  setSchedTimezone(undefined);
                  setIsScheduleModalOpen(true);
                }}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === 'Scheduled Wishes' && (
              <ScheduledWishes
                scheduledWishes={scheduledWishes}
                onDeleteSchedule={handleDeleteSchedule}
                onOpenReschedule={handleOpenReschedule}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === 'History' && (
              <History
                history={history}
                onClearHistory={async () => {
                  if (window.confirm('Are you sure you want to clear your entire history?')) {
                    setHistory([]);
                    triggerToast('Archive cleared.');
                    try {
                      await fetch('/api/history', {
                        method: 'DELETE'
                      });
                    } catch (err) {
                      console.warn('Backend offline, history cleared locally.');
                    }
                  }
                }}
                triggerToast={triggerToast}
              />
            )}

            {activeTab === 'Settings' && (
              <Settings
                settings={settings}
                onSaveSettings={async (s) => {
                  setSettings(s);
                  try {
                    await fetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(s)
                    });
                  } catch (err) {
                    console.warn('Backend offline, settings saved locally.');
                  }
                }}
                triggerToast={triggerToast}
              />
            )}
          </main>
        </div>
      )}

      {/* --- MODALS OVERLAYS --- */}

      {/* Contact Manager Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        contact={editingContact}
        onSave={handleSaveContact}
        triggerToast={triggerToast}
      />

      {/* Social Platforms Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareText={shareText}
        recipientName={shareRecipient}
        triggerToast={triggerToast}
      />

      {/* Delivery Queue Scheduling Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSchedId(undefined);
          setSchedChannel(undefined);
          setSchedDate(undefined);
          setSchedTime(undefined);
          setSchedTimezone(undefined);
        }}
        recipientName={schedRecipientName}
        recipientId={schedRecipientId}
        wishType={schedWishType}
        messageContent={schedContent}
        cardConfig={schedCardConfig}
        onSchedule={handleSaveSchedule}
        triggerToast={triggerToast}
        editWishId={schedId}
        initialChannel={schedChannel}
        initialDate={schedDate}
        initialTime={schedTime}
        initialTimezone={schedTimezone}
      />
    </>
  );
}

export default App;
