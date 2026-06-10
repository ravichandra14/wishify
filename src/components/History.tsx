import React, { useState } from 'react';
import { Search, Copy, FileText } from 'lucide-react';
import type { HistoryItem } from '../utils/wishGenerator';

interface HistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  triggerToast: (msg: string) => void;
}

export const History: React.FC<HistoryProps> = ({ history, onClearHistory, triggerToast }) => {
  const [filterType, setFilterType] = useState<'All' | 'AI Wish' | 'Greeting Card' | 'Written'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history based on type and query
  const filteredHistory = history.filter(item => {
    const matchesType = filterType === 'All' || item.wishType === filterType;
    const matchesQuery = 
      item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('Wish text copied to clipboard!');
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div className="page-title">
          <h1>Creation Archive</h1>
          <p style={{ color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
            Review past generated text wishes and exported greeting card layouts.
          </p>
        </div>
        {history.length > 0 && (
          <button 
            className="btn-secondary" 
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
            onClick={onClearHistory}
          >
            Clear Archive
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', width: '100%' }}>
        <div className="search-input-wrapper" style={{ flex: 1, minWidth: '260px' }}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search archive content..." 
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select 
          className="filter-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value as any)}
        >
          <option value="All">All Formats</option>
          <option value="AI Wish">AI Wish Text</option>
          <option value="Greeting Card">Greeting Cards</option>
          <option value="Written">Custom Written</option>
        </select>
      </div>

      {/* History Grid */}
      {filteredHistory.length === 0 ? (
        <div style={{
          background: 'var(--white)',
          padding: '4rem 2rem',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid var(--border-color)',
          color: 'var(--secondary-text)'
        }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <h3>No Records Found</h3>
          <p style={{ fontSize: '0.95rem', marginTop: '0.5rem', maxWidth: '400px', margin: '0.5rem auto' }}>
            {history.length === 0
              ? 'You haven\'t created any birthday wishes yet. Visit the Wish Center to write or generate one!'
              : 'No results found matching your search filter.'
            }
          </p>
        </div>
      ) : (
        <div className="history-grid">
          {filteredHistory.map(item => (
            <div key={item.id} className="history-card">
              <div>
                
                {/* Header */}
                <div className="history-card-header">
                  <span className="history-recipient">{item.recipientName}</span>
                  <span className="history-date">
                    {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                {/* Badge Type */}
                <div style={{ margin: '0.5rem 0' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: item.wishType === 'Greeting Card' ? 'var(--primary-orange)' : 'var(--primary-pink)',
                    background: item.wishType === 'Greeting Card' ? '#FFFBEB' : '#FFF0F5',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {item.wishType}
                  </span>
                </div>

                {/* Snippet body text */}
                <div className="history-body-content">
                  {item.content}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="history-card-footer">
                <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                  {item.cardConfig ? `Template: ${item.cardConfig.template}` : 'Text only'}
                </span>
                
                <button 
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  onClick={() => handleCopyText(item.content)}
                >
                  <Copy size={12} /> Copy Text
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
