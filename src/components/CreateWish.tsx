import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Share2, Copy, Download, RefreshCw, Save, Edit3, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { generateMockWish } from '../utils/wishGenerator';
import type { Contact } from '../utils/wishGenerator';

interface CreateWishProps {
  contacts: Contact[];
  preFilledContact: Contact | null;
  onClearPreFill: () => void;
  onSaveHistory: (recipientName: string, content: string, wishType: 'AI Wish' | 'Greeting Card' | 'Written', cardConfig?: any) => void;
  onOpenShareModal: (text: string, name: string) => void;
  onOpenScheduleModal: (name: string, id: string, type: 'AI Wish' | 'Greeting Card' | 'Written', content: string, config?: any) => void;
  triggerToast: (msg: string) => void;
}

export const CreateWish: React.FC<CreateWishProps> = ({
  contacts,
  preFilledContact,
  onClearPreFill,
  onSaveHistory,
  onOpenShareModal,
  onOpenScheduleModal,
  triggerToast
}) => {
  // Navigation wizard steps: 1 = Recipient, 2 = Type & Options, 3 = Result & Edit
  const [step, setStep] = useState(1);
  
  // Step 1 State: Recipient
  const [recipientSource, setRecipientSource] = useState<'contact' | 'manual'>('manual');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [interests, setInterests] = useState('');

  // Step 2 State: Wish Type
  const [wishType, setWishType] = useState<'Written' | 'AI Wish' | 'Greeting Card'>('AI Wish');
  
  // Custom Written Text state
  const [writtenText, setWrittenText] = useState('');

  // AI Wish Options
  const [tone, setTone] = useState<'Funny' | 'Emotional' | 'Professional' | 'Romantic'>('Funny');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');

  // Greeting Card Design Customization
  const [cardTemplate, setCardTemplate] = useState<'Elegant' | 'Party' | 'Minimal' | 'Professional' | 'Floral'>('Party');
  const [cardHeading, setCardHeading] = useState('Happy Birthday!');
  const [cardBody, setCardBody] = useState('Wishing you a day filled with laughter and cake!');
  const [cardSticker, setCardSticker] = useState('🎉');
  const [cardBgColor, setCardBgColor] = useState('#FFF5F5');
  const [cardTextColor, setCardTextColor] = useState('#FF4F9A');
  const [isGeneratingCardText, setIsGeneratingCardText] = useState(false);

  const handleGenerateCardText = () => {
    if (!name) {
      triggerToast('Please provide a recipient name first.');
      return;
    }
    setIsGeneratingCardText(true);
    setTimeout(() => {
      const wish = generateMockWish(name, relationship, interests, tone, length);
      setCardBody(wish);
      setIsGeneratingCardText(false);
      triggerToast('AI card text generated successfully! ✨');
    }, 1000);
  };

  // Generator engine state
  const [isGenerating, setIsGenerating] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  
  // Toggle editing of result
  const [isEditingResult, setIsEditingResult] = useState(false);
  const [editedResultText, setEditedResultText] = useState('');

  // Hidden Canvas Ref for download
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-fill fields if requested from dashboard or contacts list
  useEffect(() => {
    if (preFilledContact) {
      setRecipientSource('contact');
      setSelectedContactId(preFilledContact.id);
      setName(preFilledContact.name);
      setRelationship(preFilledContact.relationship);
      setInterests(preFilledContact.interests);
      
      // Clear pre-fill trigger once ingested
      onClearPreFill();
    }
  }, [preFilledContact]);

  // Sync manual name if contact is selected
  useEffect(() => {
    if (recipientSource === 'contact' && selectedContactId) {
      const match = contacts.find(c => c.id === selectedContactId);
      if (match) {
        setName(match.name);
        setRelationship(match.relationship);
        setInterests(match.interests);
      }
    }
  }, [selectedContactId, recipientSource, contacts]);

  // Automatically update greeting card text when AI wish changes or when recipient changes
  useEffect(() => {
    if (name) {
      setCardHeading(`Happy Birthday ${name.split(' ')[0]}!`);
    } else {
      setCardHeading('Happy Birthday!');
    }
  }, [name]);

  // Set card templates defaults when template changes
  useEffect(() => {
    switch (cardTemplate) {
      case 'Elegant':
        setCardBgColor('#FAF6F0');
        setCardTextColor('#3E2723');
        setCardSticker('✨');
        break;
      case 'Party':
        setCardBgColor('#FFF5F5');
        setCardTextColor('#FF4F9A');
        setCardSticker('🎉');
        break;
      case 'Minimal':
        setCardBgColor('#FFFFFF');
        setCardTextColor('#1F2937');
        setCardSticker('🎂');
        break;
      case 'Professional':
        setCardBgColor('#F8FAFC');
        setCardTextColor('#0F172A');
        setCardSticker('👔');
        break;
      case 'Floral':
        setCardBgColor('#FAF5F6');
        setCardTextColor('#5C3E35');
        setCardSticker('🌸');
        break;
    }
  }, [cardTemplate]);

  // Simulated AI Generator
  const handleGenerate = () => {
    if (!name) {
      triggerToast('Please provide a recipient name first.');
      return;
    }

    setIsGenerating(true);
    setStep(3); // Navigate to result screen
    
    // Cycle simulated AI messages
    const loadingStates = [
      'Analyzing recipient profile...',
      'Reviewing relationship metrics...',
      `Consulting tones for "${tone}" style...`,
      `Incorporating interests: "${interests || 'birthday party'}"...`,
      'Polishing greeting phrasing...'
    ];

    let currentIdx = 0;
    setLoaderMessage(loadingStates[0]);
    
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < loadingStates.length) {
        setLoaderMessage(loadingStates[currentIdx]);
      }
    }, 400);

    setTimeout(() => {
      clearInterval(interval);
      let wish = '';
      if (wishType === 'Written') {
        wish = writtenText || `Happy Birthday, ${name}! Wishing you all the best!`;
      } else if (wishType === 'AI Wish') {
        wish = generateMockWish(name, relationship, interests, tone, length);
      } else {
        // Greeting Card text generation
        wish = cardBody || generateMockWish(name, relationship, interests, tone, length);
        setCardBody(wish);
      }

      setGeneratedResult(wish);
      setEditedResultText(wish);
      setIsGenerating(false);
      triggerToast('Generation complete! Sparked with AI ✨');
    }, 2000);
  };

  // Trigger download of greeting card as PNG using Hidden Canvas
  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas dimensions
    canvas.width = 600;
    canvas.height = 800;

    // Draw background
    if (cardTemplate === 'Party') {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#FFF5F5');
      grad.addColorStop(1, '#FFFBEB');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = cardBgColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Border
    ctx.strokeStyle = cardTextColor;
    if (cardTemplate === 'Elegant') {
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    } else if (cardTemplate === 'Party') {
      ctx.lineWidth = 12;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    } else if (cardTemplate === 'Minimal') {
      ctx.lineWidth = 3;
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
    } else if (cardTemplate === 'Professional') {
      ctx.lineWidth = 1;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(20, 20, canvas.width - 40, 30); // Dark header bar
    } else if (cardTemplate === 'Floral') {
      ctx.lineWidth = 2;
      ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
      ctx.strokeStyle = 'rgba(255, 79, 154, 0.15)';
      ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);
    }

    // Draw Emoji Sticker
    ctx.font = '80px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cardSticker, canvas.width / 2, 180);

    // Draw Heading
    ctx.fillStyle = cardTemplate === 'Professional' ? '#0F172A' : cardTextColor;
    let headingFont = 'bold 36px Outfit';
    if (cardTemplate === 'Elegant') headingFont = 'italic bold 38px Georgia';
    if (cardTemplate === 'Floral') headingFont = '60px "Great Vibes", cursive';
    if (cardTemplate === 'Minimal') headingFont = 'bold 32px Courier New';
    ctx.font = headingFont;
    ctx.fillText(cardHeading, canvas.width / 2, 300);

    // Draw Body Text (Wrapped)
    let bodyFont = '22px Outfit';
    if (cardTemplate === 'Elegant') bodyFont = 'italic 20px Georgia';
    if (cardTemplate === 'Minimal') bodyFont = '18px Courier New';
    ctx.font = bodyFont;
    ctx.fillStyle = cardTemplate === 'Floral' ? '#7A5B51' : cardTextColor;

    const words = cardBody.split(' ');
    let line = '';
    let y = 380;
    const maxWidth = 450;
    const lineHeight = 35;

    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);

    // Draw Branding Footer
    ctx.font = 'bold 12px Montserrat';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillText('MADE WITH WISHIFY.APP 🎂', canvas.width / 2, canvas.height - 60);

    // Trigger download link
    const link = document.createElement('a');
    link.download = `wishify_${name.toLowerCase().replace(' ', '_')}_card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    triggerToast('Greeting card exported and downloaded successfully!');
  };

  const handleSaveResult = () => {
    const finalContent = wishType === 'Greeting Card' ? cardBody : editedResultText;
    const currentCardConfig = wishType === 'Greeting Card' ? {
      template: cardTemplate,
      bgColor: cardBgColor,
      textColor: cardTextColor,
      sticker: cardSticker,
      fontFamily: cardTemplate === 'Elegant' ? 'Playfair Display' : cardTemplate === 'Floral' ? 'Great Vibes' : 'Outfit',
      heading: cardHeading,
      body: cardBody
    } : undefined;

    onSaveHistory(name, finalContent, wishType, currentCardConfig);
    triggerToast('Wish saved successfully to History log!');
  };

  const handleCreateCardFromAI = () => {
    // Converts the current AI generated text into a greeting card body text
    setWishType('Greeting Card');
    setCardBody(generatedResult);
    setStep(2);
    triggerToast('Wish converted into card body! Customize your template now.');
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Title */}
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <div className="page-title">
          <h1>Wish Center</h1>
          <p style={{ color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
            Generate greetings and design premium celebration cards.
          </p>
        </div>
      </div>

      {/* Split Screen Creator Layout */}
      <div className="creator-layout">
        
        {/* Left Side: Inputs Panel */}
        <div className="creator-panel">
          
          {/* Wizard step nodes tracker */}
          <div className="wizard-steps">
            <div className={`wizard-step-node ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)} style={{ cursor: 'pointer' }}>
              <div className="wizard-step-number">1</div>
              <span>Recipient</span>
            </div>
            <div className={`wizard-step-line ${step >= 2 ? 'active' : ''}`}></div>
            <div className={`wizard-step-node ${step >= 2 ? 'active' : ''}`} onClick={() => name ? setStep(2) : triggerToast('Name required')} style={{ cursor: 'pointer' }}>
              <div className="wizard-step-number">2</div>
              <span>Wish Type</span>
            </div>
            <div className={`wizard-step-line ${step >= 3 ? 'active' : ''}`}></div>
            <div className={`wizard-step-node ${step >= 3 ? 'active' : ''}`}>
              <div className="wizard-step-number">3</div>
              <span>Result</span>
            </div>
          </div>

          {/* STEP 1 PANEL: RECIPIENT INFORMATION */}
          {step === 1 && (
            <div className="form-section anim-fade-in">
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Step 1: Recipient Information</h3>

              <div className="form-group">
                <label>Add method</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label className="checkbox-label">
                    <input 
                      type="radio" 
                      name="recipientSource" 
                      checked={recipientSource === 'manual'}
                      onChange={() => setRecipientSource('manual')} 
                    />
                    <span>Type Info Manually</span>
                  </label>
                  <label className="checkbox-label">
                    <input 
                      type="radio" 
                      name="recipientSource" 
                      checked={recipientSource === 'contact'} 
                      onChange={() => {
                        setRecipientSource('contact');
                        if (contacts.length > 0 && !selectedContactId) {
                          setSelectedContactId(contacts[0].id);
                        }
                      }}
                    />
                    <span>Select From Directory</span>
                  </label>
                </div>
              </div>

              {recipientSource === 'contact' ? (
                <div className="form-group">
                  <label>Select Contact Profile</label>
                  {contacts.length === 0 ? (
                    <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
                      No contacts saved. Please write manually or add contacts in the Directory first.
                    </div>
                  ) : (
                    <select 
                      className="form-select" 
                      value={selectedContactId} 
                      onChange={e => setSelectedContactId(e.target.value)}
                    >
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.relationship})</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Recipient Name *</label>
                    <input 
                      type="text" 
                      placeholder="Rahul Sharma" 
                      className="form-input" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
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
                </>
              )}

              <div className="form-group">
                <label>Interests & Hobbies (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Football, Gardening, Chess (helps personalize the AI wish)" 
                  className="form-input" 
                  value={interests} 
                  onChange={e => setInterests(e.target.value)} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    if (!name.trim()) {
                      triggerToast('Please provide a recipient name.');
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Choose Wish Type <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 PANEL: CHOOSE WISH TYPE */}
          {step === 2 && (
            <div className="form-section anim-fade-in">
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Step 2: Choose Wish Type</h3>
              
              <div className="form-group">
                <label>Select Format</label>
                <div className="form-radio-group">
                  <div 
                    className={`form-radio-card ${wishType === 'AI Wish' ? 'active' : ''}`}
                    onClick={() => setWishType('AI Wish')}
                  >
                    <Sparkles size={20} />
                    <span>AI Wish</span>
                  </div>
                  <div 
                    className={`form-radio-card ${wishType === 'Greeting Card' ? 'active' : ''}`}
                    onClick={() => setWishType('Greeting Card')}
                  >
                    <Star size={20} />
                    <span>Greeting Card</span>
                  </div>
                  <div 
                    className={`form-radio-card ${wishType === 'Written' ? 'active' : ''}`}
                    onClick={() => setWishType('Written')}
                  >
                    <Edit3 size={20} />
                    <span>Write Myself</span>
                  </div>
                </div>
              </div>

              {/* WRITE MYSELF FLOW */}
              {wishType === 'Written' && (
                <div className="form-group anim-fade-in" style={{ marginTop: '0.5rem' }}>
                  <label>Type Custom Message</label>
                  <textarea 
                    className="form-textarea" 
                    rows={6} 
                    placeholder={`Type your custom birthday wish for ${name} here...`}
                    value={writtenText}
                    onChange={e => setWrittenText(e.target.value)}
                  />
                </div>
              )}

              {/* AI WISH FLOW */}
              {wishType === 'AI Wish' && (
                <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label>Tone</label>
                    <select 
                      className="form-select" 
                      value={tone} 
                      onChange={e => setTone(e.target.value as any)}
                    >
                      <option value="Funny">Funny 😂</option>
                      <option value="Emotional">Emotional ❤️</option>
                      <option value="Professional">Professional 💼</option>
                      <option value="Romantic">Romantic 🌹</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Length</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {(['Short', 'Medium', 'Long'] as const).map(len => (
                        <button
                          key={len}
                          type="button"
                          className="btn-secondary"
                          style={{
                            flex: 1,
                            padding: '0.6rem',
                            fontSize: '0.85rem',
                            border: length === len ? '1.5px solid var(--primary-pink)' : '1px solid var(--border-color)',
                            background: length === len ? 'var(--grad-glow)' : 'var(--white)',
                            color: length === len ? 'var(--primary-pink)' : 'var(--dark-text)',
                            fontWeight: 700
                          }}
                          onClick={() => setLength(len)}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* GREETING CARD FLOW */}
              {wishType === 'Greeting Card' && (
                <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  <div className="form-group">
                    <label>Choose Template Theme</label>
                    <div className="template-selector-grid">
                      {(['Elegant', 'Party', 'Minimal', 'Professional', 'Floral'] as const).map(temp => (
                        <div 
                          key={temp}
                          className={`template-option ${cardTemplate === temp ? 'active' : ''}`}
                          onClick={() => setCardTemplate(temp)}
                        >
                          <span>{temp}</span>
                          <div 
                            className="template-preview-dot"
                            style={{
                              background: 
                                temp === 'Elegant' ? '#FAF6F0' :
                                temp === 'Party' ? '#FF4F9A' :
                                temp === 'Minimal' ? '#1F2937' :
                                temp === 'Professional' ? '#0F172A' : '#FAF5F6'
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Sticker Emoji</label>
                      <input 
                        type="text" 
                        maxLength={2} 
                        className="form-input" 
                        value={cardSticker} 
                        onChange={e => setCardSticker(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Bg Color</label>
                      <input 
                        type="color" 
                        className="form-input" 
                        style={{ height: '42px', padding: '2px', cursor: 'pointer' }}
                        value={cardBgColor} 
                        onChange={e => setCardBgColor(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Heading</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={cardHeading} 
                      onChange={e => setCardHeading(e.target.value)} 
                    />
                  </div>

                  {/* AI Card Text Generator Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div className="form-group">
                      <label>AI Text Tone</label>
                      <select 
                        className="form-select" 
                        value={tone} 
                        onChange={e => setTone(e.target.value as any)}
                      >
                        <option value="Funny">Funny 😂</option>
                        <option value="Emotional">Emotional ❤️</option>
                        <option value="Professional">Professional 💼</option>
                        <option value="Romantic">Romantic 🌹</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>AI Text Length</label>
                      <select 
                        className="form-select" 
                        value={length} 
                        onChange={e => setLength(e.target.value as any)}
                      >
                        <option value="Short">Short (Card Friendly)</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{
                        width: '100%',
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'var(--grad-glow)',
                        color: 'var(--primary-pink)',
                        border: '1.5px dashed var(--primary-pink)',
                        fontWeight: 700,
                        padding: '0.6rem'
                      }}
                      onClick={handleGenerateCardText}
                      disabled={isGeneratingCardText}
                    >
                      {isGeneratingCardText ? (
                        <>
                          <div className="spinner font-sans" style={{ borderTopColor: 'var(--primary-pink)', borderColor: 'rgba(255, 79, 154, 0.2)', width: '14px', height: '14px' }}></div>
                          <span>Sparking card text...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Generate Message with AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <label>Message text</label>
                    <textarea 
                      className="form-textarea" 
                      rows={3} 
                      value={cardBody} 
                      onChange={e => setCardBody(e.target.value)} 
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn-primary" onClick={handleGenerate}>
                  {wishType === 'Greeting Card' ? 'Generate Card' : 'Generate Wish'} <Sparkles size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 PANEL: RESULTS & EDIT ACTIONS */}
          {step === 3 && (
            <div className="form-section anim-fade-in">
              <h3 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Step 3: Review Results</h3>

              {isGenerating ? (
                <div className="ai-loader-container">
                  <Sparkles size={40} className="sparkle-icon" />
                  <h4 style={{ fontWeight: 700 }}>AI Engine Thinking...</h4>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>{loaderMessage}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Results Text Editor (For wishes) */}
                  {wishType !== 'Greeting Card' && (
                    <div className="form-group">
                      <label>Generated Message</label>
                      {isEditingResult ? (
                        <textarea
                          className="form-textarea"
                          rows={6}
                          value={editedResultText}
                          onChange={e => setEditedResultText(e.target.value)}
                        />
                      ) : (
                        <div style={{
                          padding: '1rem',
                          background: 'var(--bg-color)',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.95rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-line'
                        }}>
                          {editedResultText}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700 }}
                          onClick={() => setIsEditingResult(!isEditingResult)}
                        >
                          {isEditingResult ? 'Done Editing' : 'Edit Message'}
                        </button>
                        {wishType === 'AI Wish' && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 700 }}
                            onClick={handleGenerate}
                          >
                            <RefreshCw size={12} /> Regenerate
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Results Editor (For cards) */}
                  {wishType === 'Greeting Card' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Customize Body Message</label>
                        <textarea
                          className="form-textarea"
                          rows={3}
                          value={cardBody}
                          onChange={e => setCardBody(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Quick Tools</label>
                        <button className="btn-secondary" style={{ fontSize: '0.8rem', fontWeight: 700 }} onClick={handleGenerate}>
                          <RefreshCw size={12} /> Regenerate Card Body Text
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1.25rem'
                  }}>
                    {wishType === 'Written' ? (
                      <button 
                        className="btn-primary" 
                        style={{ gridColumn: 'span 2' }}
                        onClick={() => onOpenScheduleModal(name, selectedContactId || 'm1', wishType, editedResultText)}
                      >
                        ⏰ Schedule Delivery
                      </button>
                    ) : wishType === 'AI Wish' ? (
                      <>
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            navigator.clipboard.writeText(editedResultText);
                            triggerToast('Copied to clipboard!');
                          }}
                        >
                          <Copy size={16} /> Copy Text
                        </button>
                        
                        <button 
                          className="btn-secondary"
                          onClick={() => onOpenShareModal(editedResultText, name)}
                        >
                          <Share2 size={16} /> Share Direct
                        </button>
                        
                        <button className="btn-secondary" onClick={handleCreateCardFromAI}>
                          🎨 Design Card
                        </button>

                        <button className="btn-secondary" onClick={handleSaveResult}>
                          <Save size={16} /> Save History
                        </button>

                        <button 
                          className="btn-primary" 
                          style={{ gridColumn: 'span 2' }}
                          onClick={() => onOpenScheduleModal(name, selectedContactId || 'm1', wishType, editedResultText)}
                        >
                          ⏰ Schedule Delivery
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn-secondary" onClick={handleDownloadCard}>
                          <Download size={16} /> Download PNG
                        </button>

                        <button 
                          className="btn-secondary"
                          onClick={() => onOpenShareModal(`Greeting Card for ${name}: "${cardHeading} - ${cardBody}"`, name)}
                        >
                          <Share2 size={16} /> Share Link
                        </button>

                        <button className="btn-secondary" onClick={handleSaveResult}>
                          <Save size={16} /> Save History
                        </button>

                        <button className="btn-secondary" onClick={() => setStep(2)}>
                          ✏️ Edit Templates
                        </button>

                        <button 
                          className="btn-primary" 
                          style={{ gridColumn: 'span 2' }}
                          onClick={() => onOpenScheduleModal(name, selectedContactId || 'm1', wishType, cardBody, {
                            template: cardTemplate,
                            bgColor: cardBgColor,
                            textColor: cardTextColor,
                            sticker: cardSticker,
                            fontFamily: cardTemplate === 'Elegant' ? 'Playfair Display' : cardTemplate === 'Floral' ? 'Great Vibes' : 'Outfit',
                            heading: cardHeading,
                            body: cardBody
                          })}
                        >
                          ⏰ Schedule Card Delivery
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  <ArrowLeft size={16} /> Back to Setup
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Live Preview Panel */}
        <div className="creator-preview-panel">
          <div className="live-preview-container">
            <span className="preview-title">Live Preview</span>
            
            {isGenerating ? (
              <div className="ai-loader-container">
                <Sparkles size={30} className="sparkle-icon" />
                <span style={{ color: 'var(--secondary-text)', fontSize: '0.85rem' }}>Generating preview...</span>
              </div>
            ) : wishType === 'Greeting Card' ? (
              /* Greeting Card Preview Mode */
              <div className="card-wrapper-export">
                <div 
                  className={`gcard template-${cardTemplate}`}
                  style={{
                    backgroundColor: cardBgColor,
                    borderColor: cardTextColor,
                    color: cardTextColor
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em' }}>WISHIFY CARD</span>
                    <span className="card-sticker">{cardSticker}</span>
                  </div>
                  
                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    <h3 className="card-heading" style={{ color: cardTextColor }}>{cardHeading}</h3>
                    <p className="card-body" style={{ color: cardTemplate === 'Floral' ? '#7A5B51' : cardTextColor }}>{cardBody}</p>
                  </div>

                  <div className="card-footer-branding">
                    Made with Wishify 🎂
                  </div>
                </div>
              </div>
            ) : (
              /* Text Preview Mode */
              <div style={{
                width: '100%',
                background: '#FAF6F8',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                minHeight: '320px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--primary-pink)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <Sparkles size={16} />
                  <span>Personalized Birthday Text</span>
                </div>
                <div style={{ 
                  flex: 1, 
                  fontSize: '1rem', 
                  lineHeight: 1.6, 
                  color: 'var(--dark-text)', 
                  whiteSpace: 'pre-line',
                  fontStyle: 'italic'
                }}>
                  "{editedResultText || 'Your generated wish will appear here...'}"
                </div>
                <div style={{ 
                  marginTop: '1.5rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--secondary-text)', 
                  borderTop: '1px solid var(--border-color)', 
                  paddingTop: '0.8rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>To: {name || '[Name]'}</span>
                  <span>Tone: {tone}</span>
                </div>
              </div>
            )}
            
          </div>
        </div>

      </div>

      {/* Hidden canvas for downloading cards as png */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

    </div>
  );
};
