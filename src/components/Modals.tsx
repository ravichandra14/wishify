import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageCircle, Mail, Clock, User } from 'lucide-react';
import type { Contact, ScheduledWish } from '../utils/wishGenerator';

// --- SHARE MODAL ---
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareText: string;
  recipientName: string;
  triggerToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareText, recipientName, triggerToast }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const encodedText = encodeURIComponent(shareText);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const telegramUrl = `https://t.me/share/url?url=https://wishify.app&text=${encodedText}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Happy Birthday ${recipientName}! 🎂`)}&body=${encodedText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://wishify.app/wish/shared-bday-card`);
    setCopiedLink(true);
    triggerToast('Shareable card link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    triggerToast('Wish text copied to clipboard!');
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share Wish to {recipientName}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Choose a platform to send this personalized wish instantly:
          </p>
          <div className="share-grid">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="share-option-btn" style={{ textDecoration: 'none' }}>
              <MessageCircle size={24} style={{ color: '#25D366' }} />
              <span>WhatsApp</span>
            </a>
            <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="share-option-btn" style={{ textDecoration: 'none' }}>
              <Send size={24} style={{ color: '#0088cc' }} />
              <span>Telegram</span>
            </a>
            <a href={emailUrl} className="share-option-btn" style={{ textDecoration: 'none' }}>
              <Mail size={24} style={{ color: 'var(--primary-pink)' }} />
              <span>Email</span>
            </a>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Direct Card Link</label>
              <div className="copy-input-group">
                <input
                  type="text"
                  readOnly
                  value="https://wishify.app/wish/shared-bday-card"
                  className="copy-input"
                />
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={handleCopyLink}>
                  {copiedLink ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Wish Message Content</label>
              <div className="copy-input-group">
                <input
                  type="text"
                  readOnly
                  value={shareText}
                  className="copy-input"
                />
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={handleCopyText}>
                  {copiedText ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};


// --- SCHEDULE MODAL ---
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  recipientId: string;
  wishType: 'AI Wish' | 'Greeting Card' | 'Written';
  messageContent: string;
  cardConfig?: any;
  onSchedule: (wish: Omit<ScheduledWish, 'id' | 'status'>) => void;
  triggerToast: (msg: string) => void;
  editWishId?: string;
  initialChannel?: 'Email' | 'Message';
  initialDate?: string;
  initialTime?: string;
  initialTimezone?: string;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  recipientName,
  recipientId,
  wishType,
  messageContent,
  cardConfig,
  onSchedule,
  triggerToast,
  editWishId,
  initialChannel,
  initialDate,
  initialTime,
  initialTimezone
}) => {
  const [date, setDate] = useState(initialDate || '');
  const [time, setTime] = useState(initialTime || '09:00');
  const [timezone, setTimezone] = useState(initialTimezone || 'Asia/Kolkata (GMT+5:30)');
  const [channel, setChannel] = useState<'Email' | 'Message'>(initialChannel || 'Email');

  useEffect(() => {
    if (isOpen) {
      if (editWishId) {
        setDate(initialDate || '');
        setTime(initialTime || '09:00');
        setTimezone(initialTimezone || 'Asia/Kolkata (GMT+5:30)');
        setChannel(initialChannel || 'Email');
      } else {
        // Set default date to tomorrow or contact's bday if possible
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setDate(tomorrow.toISOString().split('T')[0]);
        setTime('09:00');
        setTimezone('Asia/Kolkata (GMT+5:30)');
        setChannel('Email');
      }
    }
  }, [isOpen, editWishId, initialDate, initialTime, initialTimezone, initialChannel]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      triggerToast('Please select a date.');
      return;
    }
    onSchedule({
      recipientId,
      recipientName,
      wishType,
      channel,
      date,
      time,
      timezone,
      messageContent,
      cardConfig
    });
    triggerToast(`Wish successfully scheduled via ${channel}!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>Schedule Birthday Wish</h3>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
          </div>
          <div className="modal-body">
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Schedule this wish for <strong>{recipientName}</strong>. Wishify will automatically queue and send it.
            </p>

            <div className="form-group">
              <label>Delivery Channel</label>
              <div className="form-radio-group">
                {(['Email', 'Message'] as const).map(ch => (
                  <div
                    key={ch}
                    className={`form-radio-card ${channel === ch ? 'active' : ''}`}
                    onClick={() => setChannel(ch)}
                  >
                    {ch === 'Email' && <Mail size={18} />}
                    {ch === 'Message' && <MessageCircle size={18} />}
                    <span>{ch}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Scheduled Date</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Timezone</label>
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

          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <Clock size={16} /> Schedule Wish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- ADD/EDIT CONTACT MODAL ---
interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact; // If provided, we are editing
  onSave: (contact: Omit<Contact, 'id'> & { id?: string }) => void;
  triggerToast: (msg: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSave,
  triggerToast
}) => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [interests, setInterests] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setBirthday(contact.birthday);
      setRelationship(contact.relationship);
      setEmail(contact.email || '');
      setPhone(contact.phone || '');
      setInterests(contact.interests);
      setNotes(contact.notes || '');
    } else {
      setName('');
      setBirthday('');
      setRelationship('Friend');
      setEmail('');
      setPhone('');
      setInterests('');
      setNotes('');
    }
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthday) {
      triggerToast('Please fill in Name and Birthday.');
      return;
    }
    onSave({
      id: contact?.id,
      name,
      birthday,
      relationship,
      email,
      phone,
      interests,
      notes
    });
    triggerToast(contact ? 'Contact updated!' : 'New contact added!');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3>{contact ? 'Edit Contact' : 'Add New Contact'}</h3>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
          </div>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label>Name *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Birthday *</label>
                <input
                  type="date"
                  className="form-input"
                  value={birthday}
                  onChange={e => setBirthday(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <select
                  className="form-select"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                >
                  <option value="Friend">Friend</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Parent">Parent</option>
                  <option value="Partner">Partner</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Family">Family Member</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Email (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Interests / Hobbies</label>
              <input
                type="text"
                className="form-input"
                placeholder="Football, Gaming, Coffee (comma separated)"
                value={interests}
                onChange={e => setInterests(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Met in college. Prefers WhatsApp wishes."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              <User size={16} /> {contact ? 'Save Changes' : 'Add Contact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
