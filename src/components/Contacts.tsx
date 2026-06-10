import React, { useState } from 'react';
import { Plus, Search, Calendar, Mail, Phone, BookOpen, Trash2, Edit2, Sparkles, ChevronDown, ChevronUp, User } from 'lucide-react';
import { getDaysRemaining } from '../utils/wishGenerator';
import type { Contact } from '../utils/wishGenerator';

interface ContactsProps {
  contacts: Contact[];
  onOpenAddContact: () => void;
  onOpenEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onPreFillWishCreator: (contact: Contact) => void;
  onImportCSV: (csvText: string) => void;
  onExportCSV: () => void;
}

export const Contacts: React.FC<ContactsProps> = ({
  contacts,
  onOpenAddContact,
  onOpenEditContact,
  onDeleteContact,
  onPreFillWishCreator,
  onImportCSV,
  onExportCSV
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  // Toggle detail section of cards
  const toggleExpand = (id: string) => {
    if (expandedContactId === id) {
      setExpandedContactId(null);
    } else {
      setExpandedContactId(id);
    }
  };

  const handleImportCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        onImportCSV(text);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input selection
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(query) ||
      contact.relationship.toLowerCase().includes(query) ||
      (contact.interests && contact.interests.toLowerCase().includes(query))
    );
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-title">
          <h1>Birthday Directory</h1>
          <p style={{ color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
            Manage upcoming birthdays, review interests, and trigger personalized greetings.
          </p>
        </div>
        <button className="btn-primary" onClick={onOpenAddContact}>
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="page-actions" style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '250px' }}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search contacts by name, relationship, or interests..." 
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button"
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            onClick={onExportCSV}
          >
            Download CSV
          </button>
          <label 
            className="btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, cursor: 'pointer', margin: 0 }}
          >
            Upload CSV
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSVChange} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>
      </div>

      {/* Grid of Contacts */}
      {filteredContacts.length === 0 ? (
        <div style={{
          background: 'var(--white)',
          padding: '4rem 2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          color: 'var(--secondary-text)'
        }}>
          <User size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No Contacts Found</h3>
          <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            {contacts.length === 0 
              ? "Your contact list is currently empty. Add your friends and family to stay organized!"
              : "We couldn't find any contacts matching your search query. Try typing something else."
            }
          </p>
          {contacts.length === 0 && (
            <button className="btn-primary" onClick={onOpenAddContact}>
              <Plus size={16} /> Add Your First Contact
            </button>
          )}
        </div>
      ) : (
        <div className="contacts-grid">
          {filteredContacts.map(contact => {
            const days = getDaysRemaining(contact.birthday);
            const isSoon = days <= 7;
            const isToday = days === 0;
            const isExpanded = expandedContactId === contact.id;

            return (
              <div key={contact.id} className="contact-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* Card Header Info */}
                  <div className="contact-card-top">
                    <div className="contact-avatar-big">
                      {contact.name.charAt(0)}
                    </div>
                    <span className="contact-badge">{contact.relationship}</span>
                  </div>

                  {/* Contact Summary */}
                  <div className="contact-info-section">
                    <h3>{contact.name}</h3>
                    <div className="contact-bday">
                      <Calendar size={14} />
                      <span>{formatDate(contact.birthday)}</span>
                    </div>

                    {/* Birthday Counter Alert */}
                    <div className={`contact-countdown ${isSoon ? 'soon' : ''}`}>
                      <span>🎂</span>
                      <span>
                        {isToday 
                          ? "Birthday Today! 🎉" 
                          : days === 1 
                            ? "Tomorrow!" 
                            : `${days} days remaining`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Expandable detailed profile */}
                  {isExpanded && (
                    <div className="contact-details-hidden anim-fade-in">
                      {contact.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail size={14} />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone size={14} />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.interests && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <BookOpen size={14} style={{ marginTop: '0.15rem' }} />
                          <div>
                            <strong>Interests:</strong>
                            <p style={{ fontSize: '0.8rem' }}>{contact.interests}</p>
                          </div>
                        </div>
                      )}
                      {contact.notes && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <BookOpen size={14} style={{ marginTop: '0.15rem', color: 'rgba(0,0,0,0)' }} />
                          <div>
                            <strong>Notes:</strong>
                            <p style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{contact.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    onClick={() => toggleExpand(contact.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--secondary-text)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      width: '100%',
                      padding: '0.25rem'
                    }}
                  >
                    {isExpanded ? (
                      <>Hide Details <ChevronUp size={14} /></>
                    ) : (
                      <>Show Details <ChevronDown size={14} /></>
                    )}
                  </button>

                  <div className="contact-card-actions">
                    <button 
                      className="btn-icon-only" 
                      title="Edit Contact"
                      onClick={() => onOpenEditContact(contact)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      className="btn-icon-only delete" 
                      title="Delete Contact"
                      onClick={() => onDeleteContact(contact.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                    
                    <button 
                      className="btn-card-primary"
                      onClick={() => onPreFillWishCreator(contact)}
                    >
                      <Sparkles size={14} /> Wish
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
