import React, { useState, useEffect } from 'react';
import { Sparkles, Play, CheckCircle, ChevronRight, X, ArrowRight, Star, Smile, LogOut } from 'lucide-react';

interface LandingPageProps {
  onLaunchApp: () => void;
  onLaunchCreateWish: () => void;
  isLoggedIn: boolean;
  onLogin: (name: string, email: string) => void;
  onLogout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onLaunchApp, 
  onLaunchCreateWish,
  isLoggedIn,
  onLogin,
  onLogout
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoStep, setDemoStep] = useState(1);
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);

  // Auto-flip card every 4 seconds to catch user attention
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipped(prev => !prev);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const cardThemes = [
    { name: 'Elegant', emoji: '✨', bg: '#FAF6F0', text: '#3E2723', font: 'Playfair Display', border: 'double 8px #D4AF37' },
    { name: 'Party', emoji: '🎉', bg: 'linear-gradient(135deg, #FFF5F5 0%, #FFFBEB 100%)', text: '#1F2937', font: 'Outfit', border: 'solid 4px #FF4F9A' },
    { name: 'Floral', emoji: '🌸', bg: '#FAF5F6', text: '#5C3E35', font: 'Great Vibes', border: 'solid 1px rgba(255, 79, 154, 0.15)' }
  ];

  // Authentication State
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    // Simulated mock authentication delay
    setTimeout(() => {
      setAuthLoading(false);
      setAuthSuccess(true);
      
      setTimeout(() => {
        setAuthSuccess(false);
        setShowAuthModal(false);
        
        const email = authEmail || 'user@wishify.app';
        const name = authTab === 'signup' ? authName : (email.split('@')[0] || 'User Profile');
        
        onLogin(name, email);
        onLaunchApp();
      }, 800);
    }, 1000);
  };

  const handleNextDemoStep = () => {
    if (demoStep < 4) {
      setDemoStep(demoStep + 1);
    } else {
      setShowDemoModal(false);
      setDemoStep(1);
      if (isLoggedIn) {
        onLaunchApp();
      } else {
        setAuthTab('signup');
        setShowAuthModal(true);
      }
    }
  };

  return (
    <div className="landing-container">
      {/* Background Floating Balloons (Simulated with div elements) */}
      <div className="balloon-bg" style={{ backgroundColor: 'rgba(255,79,154,0.3)', left: '10%', animationDelay: '0s' }}></div>
      <div className="balloon-bg" style={{ backgroundColor: 'rgba(255,138,61,0.3)', left: '30%', animationDelay: '3s' }}></div>
      <div className="balloon-bg" style={{ backgroundColor: 'rgba(255,79,154,0.25)', left: '75%', animationDelay: '1.5s' }}></div>
      <div className="balloon-bg" style={{ backgroundColor: 'rgba(255,138,61,0.25)', left: '85%', animationDelay: '5s' }}></div>

      {/* Header */}
      <header className="landing-header">
        <div className="logo" onClick={() => { if (isLoggedIn) onLaunchApp(); }} style={{ cursor: 'pointer' }}>
          <span>Wishify</span> 🎂
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              <button className="btn-header" onClick={onLaunchApp}>
                Go to Dashboard
              </button>
              <button 
                className="btn-header" 
                style={{ padding: '0.6rem', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} 
                onClick={onLogout}
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="btn-header" onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}>
                Log In
              </button>
              <button className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={() => { setAuthTab('signup'); setShowAuthModal(true); }}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero anim-fade-in">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>Powering better birthday moments</span>
          </div>
          <h1 className="hero-headline">
            Never Miss a Birthday Again 🎂
          </h1>
          <p className="hero-subheadline">
            Generate personalized birthday wishes, create beautiful custom greeting cards, share instantly, or schedule them for future delivery with Wishify.
          </p>

          <div className="hero-cta">
            <button 
              className="btn-primary" 
              onClick={() => {
                if (isLoggedIn) {
                  onLaunchCreateWish();
                } else {
                  setAuthTab('signup');
                  setShowAuthModal(true);
                }
              }}
            >
              Create Wish <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => setShowDemoModal(true)}>
              <Play size={18} fill="currentColor" /> Watch Demo
            </button>
          </div>

          <div className="hero-features">
            <div className="feature-tag">
              <CheckCircle size={16} />
              <span>AI Wishes</span>
            </div>
            <div className="feature-tag">
              <CheckCircle size={16} />
              <span>Greeting Cards</span>
            </div>
            <div className="feature-tag">
              <CheckCircle size={16} />
              <span>Share Instantly</span>
            </div>
            <div className="feature-tag">
              <CheckCircle size={16} />
              <span>Schedule Wishes</span>
            </div>
            <div className="feature-tag">
              <CheckCircle size={16} />
              <span>Birthday Reminders</span>
            </div>
          </div>
        </div>

        {/* Hero Right: Interactive 3D Card Preview */}
        <div className="hero-right">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div
              className={`card-container-3d ${isFlipped ? 'flipped' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
              title="Click to flip card!"
            >
              <div className="card-3d-inner">
                {/* Front face */}
                <div
                  className="card-face card-front"
                  style={{
                    background: cardThemes[activeThemeIndex].bg,
                    color: cardThemes[activeThemeIndex].text,
                    border: cardThemes[activeThemeIndex].border,
                    fontFamily: cardThemes[activeThemeIndex].font === 'Great Vibes' ? 'var(--font-body)' : `var(--font-${cardThemes[activeThemeIndex].font.replace(' ', '-')})`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.8 }}>WISHIFY CARD</span>
                    <span style={{ fontSize: '1.5rem' }}>{cardThemes[activeThemeIndex].emoji}</span>
                  </div>
                  <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                    <h3 style={{
                      fontSize: cardThemes[activeThemeIndex].font === 'Great Vibes' ? '2.5rem' : '1.8rem',
                      fontFamily: `var(--font-${cardThemes[activeThemeIndex].font.replace(' ', '-')})`,
                      marginBottom: '1rem',
                      fontWeight: 700
                    }}>
                      Happy Birthday Priya!
                    </h3>
                    <p style={{
                      fontSize: cardThemes[activeThemeIndex].font === 'Great Vibes' ? '1.15rem' : '0.9rem',
                      lineHeight: 1.6,
                      fontFamily: cardThemes[activeThemeIndex].font === 'Great Vibes' ? 'var(--font-body)' : 'inherit',
                      opacity: 0.9
                    }}>
                      May your year be filled with adventures, books, and beautiful photography!
                    </p>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', opacity: 0.7 }}>
                    <span>Made for Sister 💖</span>
                    <span>Flip to View 🔄</span>
                  </div>
                </div>

                {/* Back face */}
                <div className="card-face card-back" style={{ border: '4px solid var(--primary-pink)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎂</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', fontSize: '1.4rem' }}>You're Invited to Celebrate!</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', lineHeight: 1.5, padding: '0 1rem' }}>
                    "Wishify helps you design and schedule greeting cards for everyone who matters."
                  </p>
                  <button 
                    className="btn-primary" 
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', marginTop: '1.5rem' }} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (isLoggedIn) {
                        onLaunchCreateWish();
                      } else {
                        setAuthTab('signup');
                        setShowAuthModal(true);
                      }
                    }}
                  >
                    Design Yours Now
                  </button>
                </div>
              </div>
            </div>

            {/* Quick theme selectors */}
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--white)', padding: '0.35rem', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', zIndex: 10 }}>
              {cardThemes.map((theme, i) => (
                <button
                  key={theme.name}
                  onClick={() => { setActiveThemeIndex(i); setIsFlipped(false); }}
                  style={{
                    background: activeThemeIndex === i ? 'var(--grad-glow)' : 'transparent',
                    border: 'none',
                    color: activeThemeIndex === i ? 'var(--primary-pink)' : 'var(--secondary-text)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '15px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Feature Cards Section */}
      <section className="landing-features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Features Designed to Delight</h2>
            <p className="section-subtitle">
              Everything you need to manage birthdays, craft messages, and send love.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Sparkles size={24} />
              </div>
              <h3 className="feature-card-title">AI Birthday Wishes</h3>
              <p className="feature-card-desc">
                Generate tailored birthday wishes based on relationships, specific interests, and custom tones (funny, romantic, and more).
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ color: 'var(--primary-orange)' }}>
                <Star size={24} />
              </div>
              <h3 className="feature-card-title">Greeting Cards</h3>
              <p className="feature-card-desc">
                Choose template designs and fully customize fonts, messages, stickers, and colors. Download instantly.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Smile size={24} />
              </div>
              <h3 className="feature-card-title">Instant Sharing</h3>
              <p className="feature-card-desc">
                Copy text or share custom wishes directly to popular social messaging channels like WhatsApp, Telegram, or email.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ color: 'var(--primary-orange)' }}>
                <CheckCircle size={24} />
              </div>
              <h3 className="feature-card-title">Smart Scheduling</h3>
              <p className="feature-card-desc">
                Schedule birthday wishes ahead of time. Setup delivery dates, times, and preferred channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WATCH DEMO PRODUCT TOUR MODAL */}
      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Wishify Product Tour</h3>
              <button className="modal-close" onClick={() => setShowDemoModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>

              {demoStep === 1 && (
                <div>
                  <div style={{ background: 'var(--grad-glow)', padding: '2rem', borderRadius: '12px', fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 1: Save Your Contacts</h4>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Keep track of all your friends, family, and colleagues. Wishify displays a clean list with automatic birthday count down timers so you are never caught off guard.
                  </p>
                </div>
              )}

              {demoStep === 2 && (
                <div>
                  <div style={{ background: 'var(--grad-glow)', padding: '2rem', borderRadius: '12px', fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 2: Generate Customized Wishes</h4>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Tell the AI generator the recipient's name, relationship, interests, and desired tone. In seconds, get a custom and thoughtful message created specifically for them.
                  </p>
                </div>
              )}

              {demoStep === 3 && (
                <div>
                  <div style={{ background: 'var(--grad-glow)', padding: '2rem', borderRadius: '12px', fontSize: '3rem', marginBottom: '1rem' }}>🎨</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 3: Design Elegant Greeting Cards</h4>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Transform your message into a beautiful digital greeting card. Pick templates like Elegant, Party, or Minimal, customize themes, and export/download them as images.
                  </p>
                </div>
              )}

              {demoStep === 4 && (
                <div>
                  <div style={{ background: 'var(--grad-glow)', padding: '2rem', borderRadius: '12px', fontSize: '3rem', marginBottom: '1rem' }}>⏰</div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Step 4: Share or Schedule for Later</h4>
                  <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    Share wishes instantly via WhatsApp/Email, or schedule them to be sent automatically at a precise date, time, and timezone. Set it and forget it!
                  </p>
                </div>
              )}

              {/* Progress dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', margin: '2rem 0 1rem' }}>
                {[1, 2, 3, 4].map(idx => (
                  <div
                    key={idx}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: demoStep === idx ? 'var(--primary-pink)' : 'var(--border-color)',
                      transition: 'all 0.2s ease'
                    }}
                  ></div>
                ))}
              </div>

            </div>
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => setShowDemoModal(false)}>Skip Tour</button>
              <button className="btn-primary" onClick={handleNextDemoStep}>
                {demoStep === 4 ? 'Get Started' : 'Next Step'} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content auth-modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{authTab === 'login' ? 'Sign In' : 'Create Account'}</h3>
              <button className="modal-close" onClick={() => setShowAuthModal(false)}><X size={20} /></button>
            </div>
            
            {authSuccess ? (
              <div className="auth-success-badge anim-fade-in" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                <h4 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-pink)' }}>Success!</h4>
                <p style={{ color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
                  {authTab === 'login' ? 'Welcome back to Wishify!' : 'Account created successfully!'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit}>
                <div className="modal-body">
                  <div className="auth-tabs">
                    <button 
                      type="button" 
                      className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                      onClick={() => setAuthTab('login')}
                    >
                      Log In
                    </button>
                    <button 
                      type="button" 
                      className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                      onClick={() => setAuthTab('signup')}
                    >
                      Sign Up
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                    {authTab === 'signup' && (
                      <div className="form-group">
                        <label>Full Name</label>
                        <div style={{ position: 'relative' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Priya Patel"
                            value={authName}
                            onChange={e => setAuthName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        placeholder="priya@example.com"
                        value={authEmail}
                        onChange={e => setAuthEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={e => setAuthPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    type="submit" 
                    className="btn-primary auth-submit-btn" 
                    disabled={authLoading}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {authLoading ? (
                      <>
                        <div className="spinner font-sans"></div>
                        <span style={{ marginLeft: '0.5rem' }}>Authenticating...</span>
                      </>
                    ) : (
                      <span>{authTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    {authTab === 'login' ? (
                      <span style={{ color: 'var(--secondary-text)' }}>
                        Don't have an account?{' '}
                        <strong 
                          style={{ color: 'var(--primary-pink)', cursor: 'pointer' }}
                          onClick={() => setAuthTab('signup')}
                        >
                          Sign Up
                        </strong>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--secondary-text)' }}>
                        Already have an account?{' '}
                        <strong 
                          style={{ color: 'var(--primary-pink)', cursor: 'pointer' }}
                          onClick={() => setAuthTab('login')}
                        >
                          Log In
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
