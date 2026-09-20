import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const [pauseRemaining, setPauseRemaining] = useState(0);
  const pauseTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Bidirectional Scroll Animations (Enter & Reverse on Scroll Up/Down)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          } else {
            // Remove on exit so animations trigger in reverse when scrolling back up
            entry.target.classList.remove('is-visible');
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    const animatedElements = document.querySelectorAll(
      '.reveal, .reveal-scale, .reveal-left, .reveal-right'
    );
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Handle Pause Marquee for exactly 10 seconds on Click
  const handleCardClick = () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setIsMarqueePaused(true);
    setPauseRemaining(10);

    countdownIntervalRef.current = setInterval(() => {
      setPauseRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    pauseTimerRef.current = setTimeout(() => {
      setIsMarqueePaused(false);
      setPauseRemaining(0);
    }, 10000);
  };

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const useCases = [
    {
      id: 'biz',
      tag: '💼 BUSINESS & TRAVEL',
      title: 'Client Meetings, Travel & Expenses',
      desc: 'Organize client conferences, flight itineraries, travel passes, and expense receipts under each event. Present complete documentation in seconds whenever details or agendas are requested.'
    },
    {
      id: 'acad',
      tag: '🎓 ACADEMICS & RESEARCH',
      title: 'Workshops, Seminars & Certificates',
      desc: 'Keep participation certificates, symposium badges, and workshop documents structured and accessible anytime. Maintain a clear verifiable record of every academic session on your device.'
    },
    {
      id: 'summit',
      tag: '🌐 SUMMITS & CONVENTIONS',
      title: 'Speaker Agendas, Badges & Venue Maps',
      desc: 'Store multi-day keynote schedules, booth passes, hall floorplans, and speaker materials in a consolidated offline view without requiring venue WiFi.'
    },
    {
      id: 'ops',
      tag: '📋 OPERATIONS & MILESTONES',
      title: 'Field Inspections, Audits & Signoffs',
      desc: 'Capture on-site audit logs, inspection photos, equipment check records, and signed client handovers directly tied to each milestone date.'
    }
  ];

  const guideSteps = [
    {
      id: 'create',
      title: '1. Create & Schedule Events',
      stepNum: 'STEP 01',
      desc: 'Quickly organize your meetings, trips, or milestones. Fill in the event title, select your exact start and end dates with the custom date picker, and add the venue or location.',
      bullets: [
        'Mandatory fields: Event Title, Start Date, End Date, and Location',
        'Optional remarks/notes for agendas or contact info',
        'Smart validation prevents backwards date ranges'
      ],
      previewTitle: 'Annual Developer Summit 2026',
      previewLoc: 'Convention Center, Main Hall',
      previewDate: 'FROM: 20 Sep 2026 • TO: 24 Sep 2026'
    },
    {
      id: 'attach',
      title: '2. Attach Files & Proofs',
      stepNum: 'STEP 02',
      desc: 'Keep all your tickets, slide decks, receipts, and photos bundled right with the event. Supports up to 10 files per event, under 10 MB each.',
      bullets: [
        'Supports Images (JPG, PNG, WebP), PDFs, Videos (MP4), Audios, and Docs',
        'Safe deletion: Confirmation prompt prevents accidental file removals',
        'PDFs & documents displayed in complete, clean full-width rows'
      ],
      previewTitle: 'Flight Tickets & Conference Pass',
      previewLoc: 'Attached: 3 files (boarding_pass.pdf, badge.png)',
      previewDate: 'DOCUMENTS / EVENTSCHEDULE'
    },
    {
      id: 'filter',
      title: '3. Filter by All, Month, or Year',
      stepNum: 'STEP 03',
      desc: 'By default, the app displays all your events in one seamless list. Use the top calendar filter to narrow down by a specific Month or Year whenever you need.',
      bullets: [
        'Defaults to "All Events" view on startup',
        'Interactive calendar popover with 12-year window chunk pagination',
        'Instant real-time search bar across titles, locations, and file names'
      ],
      previewTitle: 'Filter Mode: All Events (Default)',
      previewLoc: 'Showing all active scheduled records',
      previewDate: 'ALL EVENTS'
    },
    {
      id: 'view',
      title: '4. View Everything In-App & Native',
      stepNum: 'STEP 04',
      desc: 'Inspect photos and images in the built-in reader with the clean red close button, or launch PDFs directly in your device\'s favorite viewer with seamless Back button return.',
      bullets: [
        'Full-screen image & media preview modal',
        'Native device PDF app launch with instant return on Back press',
        'Hierarchical back button stack ensures zero accidental exits'
      ],
      previewTitle: 'In-App Document & Media Viewer',
      previewLoc: 'Direct high-fidelity local rendering',
      previewDate: 'ZERO LATENCY'
    }
  ];

  const faqs = [
    {
      q: 'Where are my uploaded files stored on the device?',
      a: 'All files attached to your events are stored in your device\'s Documents directory inside a dedicated folder named "EventSchedule" (/Internal Storage/Documents/EventSchedule/). You can view, back up, or access them in your file manager at any time.'
    },
    {
      q: 'Why is this better than cloud calendar apps?',
      a: 'Most calendar apps demand account registrations, sync your private itineraries to distant cloud servers, bombard you with ads, or fail when you lose internet connection. Event Scheduler stores proof right inside your phone so you can produce verified evidence in seconds without worrying about internet or privacy leaks.'
    },
    {
      q: 'Does this app require internet or send data to servers?',
      a: 'No. The Event Scheduler app operates 100% offline. No telemetry, no cloud servers, and no accounts required. All event metadata is stored locally in device IndexedDB, and all files remain on your phone.'
    },
    {
      q: 'What happens if I delete the "EventSchedule" folder by accident?',
      a: 'The app has self-healing storage detection. If the folder is missing or deleted from your file manager, the app detects it, marks missing files with a "Deleted from storage" status, and automatically recreates the folder when new files are saved.'
    },
    {
      q: 'How do I install the app on my Android phone?',
      a: 'Click the "Download APK for Android" button. Once downloaded, open the APK on your Android device and tap "Install". If prompted, enable "Install unknown apps" in your Android Settings.'
    },
    {
      q: 'Can I delete an event or attachment safely?',
      a: 'Yes. Every file deletion and event deletion requires explicit user confirmation. When you delete an event, the app automatically cleans up the corresponding files from your EventSchedule folder to prevent storage leaks.'
    }
  ];

  return (
    <div className="site-wrapper">
      <div className="bg-grid-pattern"></div>
      <div className="bg-radial-glow"></div>

      {/* Navigation Bar */}
      <nav className="site-nav">
        <div className="container nav-container">
          <a href="#" className="brand-logo">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Event Scheduler</span>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#a1a1aa', textTransform: 'uppercase' }}>By IMMORTAL</span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            <a href="#story" className="nav-link">Why I Built This</a>
            <a href="#usecases" className="nav-link">Use Cases</a>
            <a href="#storage" className="nav-link">Storage Architecture</a>
            <a href="#how-to-use" className="nav-link">How to Use</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a
              href="/app/app.apk"
              download="EventScheduler.apk"
              className="nav-cta-btn"
              onClick={() => setDownloadModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1557-.2698.0633-.6144-.2065-.7702-.2698-.1558-.6144-.0634-.7702.2065l-2.0234 3.5047C15.3045 8.1633 13.7027 7.7816 12 7.7816c-1.7027 0-3.3045.3817-4.8824 1.0237L5.0942 5.3005c-.1558-.2699-.5004-.3623-.7702-.2065-.2698.1558-.3622.5004-.2065.7702l1.996 3.4572C2.6849 11.2335.3478 14.8698 0 19.1677h24c-.3478-4.2979-2.6849-7.9342-6.1185-9.8463"/>
              </svg>
              <span>Download APK</span>
            </a>
          </div>

          {/* Mobile Hamburger Button (3 lines) */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open Navigation Menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-header" onClick={(e) => e.stopPropagation()}>
            <div className="brand-logo">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span>Event Scheduler</span>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.12em', color: '#a1a1aa', textTransform: 'uppercase' }}>By IMMORTAL</span>
              </div>
            </div>
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="mobile-nav-list" onClick={(e) => e.stopPropagation()}>
            <a href="#story" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Why I Built This</a>
            <a href="#usecases" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Use Cases</a>
            <a href="#storage" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Storage Architecture</a>
            <a href="#how-to-use" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>How to Use</a>
            <a href="#faq" className="mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
          </div>

          <div className="mobile-menu-cta" onClick={(e) => e.stopPropagation()}>
            <a
              href="/app/app.apk"
              download="EventScheduler.apk"
              className="btn-hero-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {
                setMobileMenuOpen(false);
                setDownloadModalOpen(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1557-.2698.0633-.6144-.2065-.7702-.2698-.1558-.6144-.0634-.7702.2065l-2.0234 3.5047C15.3045 8.1633 13.7027 7.7816 12 7.7816c-1.7027 0-3.3045.3817-4.8824 1.0237L5.0942 5.3005c-.1558-.2699-.5004-.3623-.7702-.2065-.2698.1558-.3622.5004-.2065.7702l1.996 3.4572C2.6849 11.2335.3478 14.8698 0 19.1677h24c-.3478-4.2979-2.6849-7.9342-6.1185-9.8463"/>
              </svg>
              <span>Download EventScheduler.apk</span>
            </a>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <header className="hero-section">
        <div className="container">
          <h1 className="hero-headline reveal">
            Manage Your Schedule. <span>Keep Your Proofs.</span>
          </h1>

          <p className="hero-subhead reveal delay-1">
            A fast, distraction-free Android event scheduler built so that finding past events and keeping their attachments organized is completely effortless.
          </p>

          <div className="hero-cta-group reveal delay-2" style={{ justifyContent: 'center' }}>
            <a
              href="/app/app.apk"
              download="EventScheduler.apk"
              className="btn-hero-primary"
              onClick={() => setDownloadModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1557-.2698.0633-.6144-.2065-.7702-.2698-.1558-.6144-.0634-.7702.2065l-2.0234 3.5047C15.3045 8.1633 13.7027 7.7816 12 7.7816c-1.7027 0-3.3045.3817-4.8824 1.0237L5.0942 5.3005c-.1558-.2699-.5004-.3623-.7702-.2065-.2698.1558-.3622.5004-.2065.7702l1.996 3.4572C2.6849 11.2335.3478 14.8698 0 19.1677h24c-.3478-4.2979-2.6849-7.9342-6.1185-9.8463"/>
              </svg>
              <span>Download APK for Android</span>
            </a>
          </div>

          {/* Interactive Live App Phone Mockup */}
          <div className="hero-mockup-wrapper reveal-scale delay-2">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="mock-app-header">
                  <div className="mock-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>Events Manager</span>
                      <span style={{ fontSize: '0.55rem', color: '#ffffff', fontWeight: 800 }}>BY IMMORTAL</span>
                    </div>
                  </div>
                  <div className="mock-filter-btn">
                    <span>All Events</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>

                {/* Mock Event Item 1 */}
                <div className="mock-event-card">
                  <div className="mock-date-badge">
                    <span className="m-month">SEP</span>
                    <span className="m-days-range">22→25</span>
                    <span className="m-year">2026</span>
                  </div>
                  <div className="mock-left-info">
                    <div className="mock-event-title">Client Review & Onsite Meeting</div>
                    <div className="mock-event-loc">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>Tech City Campus, Tower 3</span>
                    </div>
                    <div className="mock-event-pill">📎 2 files (ticket.pdf, pass.jpg)</div>
                  </div>
                  <div className="mock-card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>

                {/* Mock Event Item 2 */}
                <div className="mock-event-card">
                  <div className="mock-date-badge">
                    <span className="m-month">SEP</span>
                    <span className="m-days">28</span>
                    <span className="m-year">2026</span>
                  </div>
                  <div className="mock-left-info">
                    <div className="mock-event-title">National Tech Symposium 2026</div>
                    <div className="mock-event-loc">
                      <svg viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>Auditorium A, Campus</span>
                    </div>
                    <div className="mock-event-pill">📄 1 PDF (certificate.pdf)</div>
                  </div>
                  <div className="mock-card-arrow">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* SECTION: Why I Built This App */}
      <section id="story" className="section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">THE PROBLEM & PHILOSOPHY</span>
            <h2 className="section-title">Why I Built Event Scheduler</h2>
            <p className="section-desc">
              Finding past events and organizing their proper attachments as proof is often complicated and deeply frustrating when you are asked about what happened or where the proof is. Event Scheduler makes tracking events and accessing documentation completely effortless.
            </p>
          </div>

          <div className="grid-3">
            <div className="feature-card reveal-left delay-1">
              <div className="card-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="card-title">Instant Organization</h3>
              <p className="card-text">
                No more scrambling through cluttered chat apps or buried email threads. Every ticket, invoice, certificate, and document is tied directly to its event record.
              </p>
            </div>

            <div className="feature-card reveal delay-2">
              <div className="card-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h3 className="card-title">100% Privacy & Zero Tracking</h3>
              <p className="card-text">
                Your schedule and confidential files belong strictly to you. No logins, no third-party cloud servers, and no tracking scripts ever touch your data.
              </p>
            </div>

            <div className="feature-card reveal-right delay-3">
              <div className="card-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h3 className="card-title">Instant Startup & Zero Latency</h3>
              <p className="card-text">
                Since all data lives directly in local device storage, the app opens immediately without spinner freezes or waiting for server roundtrips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Continuous Horizontal Moving Use-Cases Marquee */}
      <section id="usecases" className="section" style={{ background: 'rgba(255, 255, 255, 0.015)', overflow: 'hidden' }}>
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Designed for Everyday Scenarios</h2>
            <p className="section-desc">
              From corporate summits to academic achievements, explore how Event Scheduler keeps your schedule and evidence structured.
            </p>
            {isMarqueePaused && (
              <div className="marquee-pause-indicator">
                <span>⏸ Paused ({pauseRemaining}s) — Resuming automatically</span>
              </div>
            )}
          </div>
        </div>

        {/* Continuous Horizontal Scrolling Track */}
        <div className="marquee-wrapper" onClick={handleCardClick}>
          <div className={`marquee-track ${isMarqueePaused ? 'is-paused' : ''}`}>
            {/* Duplicated 3 times to ensure infinite smooth seamless looping across ultra-wide monitors */}
            {[...useCases, ...useCases, ...useCases].map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="marquee-card">
                <div className="usecase-pill">
                  <span>{item.tag}</span>
                </div>
                <h3 className="card-title" style={{ fontSize: '1.25rem', marginTop: '12px', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p className="card-text" style={{ fontSize: '0.94rem', lineHeight: '1.65' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Storage Architecture Deep Dive */}
      <section id="storage" className="section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">DEVICE ARCHITECTURE</span>
            <h2 className="section-title">Where & How Your Files Are Stored</h2>
            <p className="section-desc">
              Transparency first. Here is how your phone handles schedules, attachments, and disk storage without data leakage.
            </p>
          </div>

          <div className="storage-box-container reveal-scale delay-1">
            <div className="folder-path-display">
              <div className="path-code">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>/Internal Storage/Documents/EventSchedule/</span>
              </div>
              <span className="badge-tag">DEVICE DOCUMENTS DIRECTORY</span>
            </div>

            <div className="storage-features-grid">
              <div className="storage-feature-item">
                <h4>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Multi-Format Support
                </h4>
                <p>Attach Images, PDFs, Videos, Audios, and Docs up to 10 MB per file (max 10 attachments per event).</p>
              </div>

              <div className="storage-feature-item">
                <h4>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Automatic Disk Cleanup
                </h4>
                <p>When an event is deleted, all its linked physical files are safely removed from disk to prevent storage leaks.</p>
              </div>

              <div className="storage-feature-item">
                <h4>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                  Self-Healing Detection
                </h4>
                <p>If the EventSchedule folder is deleted from file manager, the app automatically regenerates it on the next save.</p>
              </div>

              <div className="storage-feature-item">
                <h4>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  In-App & Native Viewer
                </h4>
                <p>Images preview instantly inside the app while PDFs open with your favorite native PDF reader.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Interactive How to Use Guide */}
      <section id="how-to-use" className="section" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">USER GUIDE</span>
            <h2 className="section-title">How to Use the App</h2>
            <p className="section-desc">
              Designed for simplicity and speed. Explore the core workflows below.
            </p>
          </div>

          <div className="guide-tabs reveal delay-1">
            {guideSteps.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                className={`guide-tab-btn ${activeTab === idx ? 'active' : ''}`}
                onClick={() => setActiveTab(idx)}
              >
                {step.title}
              </button>
            ))}
          </div>

          <div className="guide-card-content reveal delay-2">
            <div>
              <span className="guide-step-num">{guideSteps[activeTab].stepNum}</span>
              <h3 className="guide-step-title">{guideSteps[activeTab].title}</h3>
              <p className="guide-step-desc">{guideSteps[activeTab].desc}</p>
              <ul className="guide-bullets">
                {guideSteps[activeTab].bullets.map((b, i) => (
                  <li key={i} className="guide-bullet-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="guide-preview-box">
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '12px' }}>
                LIVE PREVIEW STATE
              </div>
              <div className="mock-event-card" style={{ marginBottom: 0 }}>
                <div className="mock-left-info">
                  <div className="mock-event-title">{guideSteps[activeTab].previewTitle}</div>
                  <div className="mock-event-loc">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>{guideSteps[activeTab].previewLoc}</span>
                  </div>
                </div>
                <div className="mock-right-date">
                  <span className="mock-date-val" style={{ fontSize: '0.75rem' }}>{guideSteps[activeTab].previewDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Frequently Asked Questions */}
      <section id="faq" className="section" style={{ background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="container">
          <div className="section-header reveal">
            <span className="section-tag">QUESTIONS & ANSWERS</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-desc">
              Have questions regarding permissions, APK installation, or storage safety?
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className={`faq-item reveal delay-${(idx % 3) + 1} ${openFaq === idx ? 'open' : ''}`}>
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  <svg className="faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA: Direct Download Banner */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="download-banner reveal-scale">
            <h2 className="download-banner-title">Experience Offline Simplicity</h2>
            <p className="download-banner-desc">
              Download the standalone Android APK now and manage your schedule with total speed and security.
            </p>
            <a
              href="/app/app.apk"
              download="EventScheduler.apk"
              className="btn-hero-primary"
              style={{ display: 'inline-flex' }}
              onClick={() => setDownloadModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.1557-.2698.0633-.6144-.2065-.7702-.2698-.1558-.6144-.0634-.7702.2065l-2.0234 3.5047C15.3045 8.1633 13.7027 7.7816 12 7.7816c-1.7027 0-3.3045.3817-4.8824 1.0237L5.0942 5.3005c-.1558-.2699-.5004-.3623-.7702-.2065-.2698.1558-.3622.5004-.2065.7702l1.996 3.4572C2.6849 11.2335.3478 14.8698 0 19.1677h24c-.3478-4.2979-2.6849-7.9342-6.1185-9.8463"/>
              </svg>
              <span>Download EventScheduler.apk</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-container" style={{ justifyContent: 'center' }}>
          <div className="footer-credits" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.02em' }}>Event Scheduler</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', color: '#a1a1aa', textTransform: 'uppercase' }}>By IMMORTAL</span>
          </div>
        </div>
      </footer>

      {/* Download Thank You Modal Dialog */}
      {downloadModalOpen && (
        <div className="thankyou-modal-overlay" onClick={() => setDownloadModalOpen(false)}>
          <div className="thankyou-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="thankyou-close-btn"
              onClick={() => setDownloadModalOpen(false)}
              aria-label="Close dialog"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="thankyou-icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: '30px', height: '30px' }}>
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>

            <h3 className="thankyou-title">Thank You!</h3>
            <p className="thankyou-desc">
              Thank you for downloading the app and showing interest in <strong>Event Scheduler</strong>.
            </p>

            <div className="thankyou-actions">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setDownloadModalOpen(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
