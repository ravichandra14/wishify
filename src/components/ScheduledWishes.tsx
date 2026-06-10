import React from 'react';
import { Trash2, Edit2, Clock } from 'lucide-react';
import type { ScheduledWish } from '../utils/wishGenerator';

interface ScheduledWishesProps {
  scheduledWishes: ScheduledWish[];
  onDeleteSchedule: (id: string) => void;
  onOpenReschedule: (wish: ScheduledWish) => void;
  triggerToast: (msg: string) => void;
}

export const ScheduledWishes: React.FC<ScheduledWishesProps> = ({
  scheduledWishes,
  onDeleteSchedule,
  onOpenReschedule,
  triggerToast
}) => {

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'status-pill scheduled';
      case 'sent': return 'status-pill sent';
      case 'failed': return 'status-pill failed';
      default: return 'status-pill';
    }
  };

  const handleSendImmediately = (id: string) => {
    // Simulated instant send action
    onDeleteSchedule(id); // remove or update
    triggerToast('Wish sent instantly and logged in History!');
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>Scheduled Delivery Queue</h1>
          <p style={{ color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
            Monitor and manage wishes queued up for auto-delivery.
          </p>
        </div>
      </div>

      {/* Table Section */}
      {scheduledWishes.length === 0 ? (
        <div style={{
          background: 'var(--white)',
          padding: '4rem 2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          color: 'var(--secondary-text)'
        }}>
          <Clock size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>Delivery Queue is Empty</h3>
          <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
            No birthday greetings are currently scheduled. Build a wish in the Wish Center to schedule a delivery!
          </p>
        </div>
      ) : (
        <div className="table-card">
          <div className="responsive-table-wrapper">
            <table className="wish-table">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Wish Type</th>
                  <th>Scheduled Date</th>
                  <th>Scheduled Time</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledWishes.map(wish => (
                  <tr key={wish.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{wish.recipientName}</div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        background: 'var(--bg-color)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        {wish.wishType}
                      </span>
                    </td>
                    <td>{new Date(wish.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td>{wish.time} <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>({wish.timezone.split(' ')[0]})</span></td>
                    <td>
                      <span className={getStatusClass(wish.status)}>
                        {wish.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon-only"
                          title="Edit Delivery Schedule"
                          onClick={() => onOpenReschedule(wish)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-icon-only delete"
                          title="Cancel Schedule"
                          onClick={() => {
                            onDeleteSchedule(wish.id);
                            triggerToast('Scheduled delivery cancelled.');
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        {wish.status === 'Scheduled' && (
                          <button
                            className="btn-secondary"
                            style={{
                              padding: '0.35rem 0.75rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            onClick={() => handleSendImmediately(wish.id)}
                          >
                            Send Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
