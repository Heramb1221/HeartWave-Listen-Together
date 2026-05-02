import { SignInButton, SignUpButton, useUser, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import "./Home.css";

/* ═══ SVG INLINE COMPONENTS ═══ */
const HeartLogo = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
    <defs><linearGradient id="nlg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF2E88"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
    <path d="M13,21 C13,21 3,15 3,8.5 C3,5 5.7,2.5 9,3 C11,3.3 12.4,4.7 13,6 C13.6,4.7 15,3.3 17,3 C20.3,2.5 23,5 23,8.5 C23,15 13,21 13,21 Z" fill="url(#nlg)"/>
  </svg>
);

const HeroHeadphone = () => (
  <svg className="hero-hp-svg" viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hhg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF2E88"/><stop offset="45%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#22D3EE"/>
      </linearGradient>
      <linearGradient id="hhg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF2E88"/><stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
    <path fill="none" stroke="url(#hhg)" strokeWidth="9" strokeLinecap="round" d="M30,88 C30,40 52,16 85,16 C118,16 140,40 140,88"/>
    <rect x="14" y="80" width="28" height="46" rx="13" fill="url(#hhg)"/>
    <rect x="128" y="80" width="28" height="46" rx="13" fill="url(#hhg)"/>
    <rect x="19" y="87" width="18" height="32" rx="9" fill="#0B0B0F" opacity="0.58"/>
    <rect x="133" y="87" width="18" height="32" rx="9" fill="#0B0B0F" opacity="0.58"/>
    <path fill="url(#hhg2)" opacity="0.92" d="M85,126 C85,126 64,112 64,97 C64,89 70,83 77,84 C80.5,84.5 83,87 85,89.5 C87,87 89.5,84.5 93,84 C100,83 106,89 106,97 C106,112 85,126 85,126 Z"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polygon points="5,3 19,12 5,21"/></svg>
);

/* ═══ DATA ═══ */
const FEATURES = [
  { icon: "🎧", cls: "fi-pink",   title: "Jam Rooms",          desc: "Spin up a room in seconds. Share a link. Everyone hears the same beat at the exact same millisecond — no lag, ever." },
  { icon: "🎤", cls: "fi-red",    title: "Karaoke Mode",       desc: "Scrolling lyrics synced to the beat. Real-time pitch detection. Score your session and challenge your friends to beat it." },
  { icon: "💜", cls: "fi-purple", title: "Heart Reactions",    desc: "Tap to send animated hearts that burst across every screen in the room. Feel the crowd energy ripple in real time." },
  { icon: "🎵", cls: "fi-cyan",   title: "Collaborative Queue", desc: "Anyone in the room can add tracks. Vote songs up, skip together, or hand the DJ controls to the host." },
  { icon: "🌊", cls: "fi-pink",   title: "Live Waveform",      desc: "Watch a shared audio waveform pulse across all devices — a visual heartbeat connecting everyone in the room." },
  { icon: "🔒", cls: "fi-purple", title: "Private Sessions",   desc: "Password-protect your room. Encrypted voice chat keeps your vibe intimate — only the people you invite can join." },
];

const ROOMS = [
  { karaoke: true,  name: "Lo-fi Chill Vibes 🌙",    listeners: "247",  open: true,  avs: ["JK","M","A"],  more: "+244" },
  { karaoke: false, name: "Afrobeats Friday 🌍",      listeners: "891",  open: true,  avs: ["T","SA","N"],  more: "+888" },
  { karaoke: true,  name: "90s Bollywood Night 🎬",   listeners: "1.2K", open: false, avs: ["P","D","R"],   more: "+1197" },
  { karaoke: false, name: "K-Pop Stans Unite 💜",     listeners: "2.1K", open: true,  avs: ["SY","JY","H"], more: "+2097" },
];

const STEPS = [
  { num: "01", title: "Create or Join a Room",   desc: "Hit \"Start a Jam\" to spin up your own room, or paste an invite link to jump straight into a friend's session." },
  { num: "02", title: "Build the Queue Together", desc: "Search from millions of tracks. Add songs, vote on what's next, or let the DJ host take the wheel." },
  { num: "03", title: "Listen in Perfect Sync",   desc: "Everyone hears the same beat at the same millisecond — no matter where on the planet they are." },
  { num: "04", title: "Chat & Sing Together",     desc: "Tap the mic icon to overlay lyrics and scoring. Your room becomes a stage — who's going first?" },
];

const STATS = [
  { num: "4.2M+",  label: "Active Jammers" },
  { num: "180+",   label: "Countries" },
  { num: "<100ms", label: "Sync Latency" },
  { num: "50K",    label: "Karaoke Songs" },
];

/* ═══ COMPONENT ═══ */
const Home = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  const homeRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (isSignedIn) navigate("/dashboard"); }, [isSignedIn, navigate]);

  /* Loader progress counter */
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(100, p + Math.floor(Math.random() * 4) + 1);
      setPct(p);
      if (p >= 100) clearInterval(t);
    }, 55);
    return () => clearInterval(t);
  }, []);

  /* Loader → Home transition */
  useEffect(() => {
    const timer = setTimeout(() => {
      setPct(100);
      setLoading(false);
    }, 3350);
    return () => clearTimeout(timer);
  }, []);

  /* Scroll reveal via IntersectionObserver */
  const initReveal = useCallback(() => {
    if (!homeRef.current) return;
    const els = homeRef.current.querySelectorAll(".hw-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add("show"), i * 90);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => { if (!loading) { setTimeout(initReveal, 100); } }, [loading, initReveal]);

  return (
    <>
      {/* ════════════ LOADER ════════════ */}
      {loading && (
        <div className={`hw-loader ${pct >= 100 ? "fade-out" : ""}`}>
          <div className="pulse-scene">
            <svg className="ecg-svg" viewBox="0 0 270 100" xmlns="http://www.w3.org/2000/svg">
              <path className="ecg-path" d="M0,50 L28,50 L34,50 L38,18 L44,80 L50,6 L56,88 L62,50 L80,50 L92,50 L96,34 L100,64 L104,50 L122,50 L128,50 L132,28 L136,72 L140,50 L160,50 L165,50 L170,38 L175,62 L180,50 L206,50 L210,50 L215,30 L220,68 L225,50 L252,50 L260,50"/>
            </svg>
            <div className="heart-scene">
              <div className="hw-ring"/><div className="hw-ring"/><div className="hw-ring"/>
              <svg className="heart-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FF2E88"/><stop offset="100%" stopColor="#7C3AED"/></linearGradient></defs>
                <path fill="url(#hg)" d="M50,82 C50,82 11,57 11,33 C11,19 21,11 33,13 C39.5,14.2 45.8,18.5 50,24.5 C54.2,18.5 60.5,14.2 67,13 C79,11 89,19 89,33 C89,57 50,82 50,82 Z"/>
              </svg>
              <svg className="headphone-loader" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="hpg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7C3AED"/><stop offset="100%" stopColor="#3B82F6"/></linearGradient></defs>
                <path fill="none" stroke="url(#hpg)" strokeWidth="5.5" strokeLinecap="round" d="M22,62 C22,30 40,12 60,12 C80,12 98,30 98,62"/>
                <rect x="10" y="56" width="20" height="32" rx="9" fill="url(#hpg)"/><rect x="90" y="56" width="20" height="32" rx="9" fill="url(#hpg)"/>
                <rect x="14" y="62" width="12" height="20" rx="6" fill="#0B0B0F" opacity="0.55"/><rect x="94" y="62" width="12" height="20" rx="6" fill="#0B0B0F" opacity="0.55"/>
              </svg>
            </div>
          </div>
          <div className="loader-brand">
            <div className="loader-title">HeartWave</div>
            <div className="loader-sub" style={{marginTop:6}}>Listen Together · Jam · Karaoke</div>
          </div>
          <div className="progress-wrap">
            <div className="progress-bar-hw"><div className="progress-fill"/></div>
            <div className="progress-label"><span>Syncing your heartbeat…</span><span className="pct">{pct}%</span></div>
          </div>
        </div>
      )}

      {/* ════════════ HOME ════════════ */}
      <div ref={homeRef} className={`hw-home ${loading ? "hw-hidden" : "hw-visible"}`}>

        {/* ── NAV ── */}
        <nav className="hw-nav">
          <div className="hw-nav-logo"><HeartLogo /> HeartWave</div>
          <div className="hw-nav-links">
            <a href="#features">Features</a>
            <a href="#rooms">Jam Rooms</a>
            <a href="#karaoke">Karaoke</a>
            <a href="#how">How It Works</a>
          </div>
          <div className="hw-nav-right">
            {isSignedIn ? (
              <>
                <button className="btn-pill" onClick={() => navigate("/dashboard")}>Create Room</button>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal"><button className="btn-ghost">Sign In</button></SignInButton>
                <SignUpButton mode="modal"><button className="btn-pill">Sign Up</button></SignUpButton>
              </>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hw-hero">
          <div className="mesh"><div className="blob blob1"/><div className="blob blob2"/><div className="blob blob3"/></div>
          <div className="live-badge"><div className="live-dot"/>3,241 sessions live right now</div>
          <div className="hero-hp-wrap"><div className="h-ring"/><div className="h-ring"/><div className="h-ring"/><HeroHeadphone/></div>
          <h1 className="hero-title"><span className="grad-text">Listen Together.</span><br/>Anywhere. In Sync.</h1>
          <p className="hero-sub">Feel the same heartwave — sync the music, share the vibe. Create or join a live Jam Room with friends anywhere in the world.</p>
          <div className="hero-btns">
            {isSignedIn ? (
              <button className="btn-hero-main" onClick={() => navigate("/dashboard")}><PlayIcon/> Create Room</button>
            ) : (
              <SignUpButton mode="modal"><button className="btn-hero-main"><PlayIcon/> Create Room</button></SignUpButton>
            )}
            <SignInButton mode="modal"><button className="btn-outline">Join a Room →</button></SignInButton>
          </div>
          <div style={{marginTop:64,zIndex:1,display:"flex",alignItems:"center",gap:14}}>
            <span style={{color:"#9CA3AF",fontSize:".8rem"}}>Live sync</span>
            <div className="wave-bars">{Array.from({length:7}).map((_,i)=><div key={i} className="wb"/>)}</div>
            <span style={{color:"#9CA3AF",fontSize:".8rem"}}>180+ countries</span>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="hw-section" style={{paddingTop:0,paddingBottom:0}}>
          <div className="stats-row hw-reveal">
            {STATS.map(s=><div key={s.label} className="stat-item"><div className="stat-num">{s.num}</div><div className="stat-lbl">{s.label}</div></div>)}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div className="hw-section" id="features">
          <div className="hw-reveal"><div className="s-label">Why HeartWave</div><div className="s-title">Music is better<br/>together.</div><div className="s-desc">Every feature is designed around one truth: shared music creates moments that solo listening never can.</div></div>
          <div className="features-grid">
            {FEATURES.map(f=><div key={f.title} className="feat-card hw-reveal"><div className={`feat-icon ${f.cls}`}>{f.icon}</div><div className="feat-title">{f.title}</div><div className="feat-desc">{f.desc}</div></div>)}
          </div>
        </div>

        {/* ── LIVE ROOMS ── */}
        <div className="hw-section" style={{paddingTop:0}} id="rooms">
          <div className="hw-reveal"><div className="s-label">Live Now</div><div className="s-title">Jump into a Jam</div><div className="s-desc">Thousands of rooms are live this second. Find your vibe and join instantly — no invite needed for open rooms.</div></div>
          <div className="jam-preview hw-reveal">
            <div className="jp-header"><div className="jp-title">🔥 Trending Rooms</div><button className="btn-pill" style={{fontSize:".82rem",padding:"8px 18px"}}>Browse All</button></div>
            <div className="rooms-grid">
              {ROOMS.map(r=>(
                <div key={r.name} className="room-card">
                  {r.karaoke && <div className="k-badge">Karaoke</div>}
                  <div className="room-name">{r.name}</div>
                  <div className="room-meta"><span>🎵 {r.listeners} listening</span><span>{r.open?"🟢 Open":"🔐 Members"}</span></div>
                  <div className="avatars">{r.avs.map(a=><div key={a} className="av">{a}</div>)}<div className="av more">{r.more}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KARAOKE ── */}
        <div className="hw-section" style={{paddingTop:0}} id="karaoke">
          <div className="karaoke-banner hw-reveal">
            <div className="s-label" style={{marginBottom:14}}>✨ Karaoke Mode</div>
            <h2 className="s-title" style={{marginBottom:16,fontSize:"clamp(2rem,4vw,2.9rem)"}}>Your stage.<br/>Their applause.</h2>
            <p style={{color:"#9CA3AF",fontSize:"1rem",maxWidth:480,margin:"0 auto 36px",lineHeight:1.73}}>50,000+ songs with perfectly timed scrolling lyrics. Real-time pitch detection scores you live. Sing solo, duet, or throw the mic to the room.</p>
            <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-karaoke">🎤 Try Karaoke Now</button>
              <button className="btn-outline">Browse Song Library</button>
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div className="hw-section" style={{paddingTop:0}} id="how">
          <div className="hw-reveal"><div className="s-label">Get Started</div><div className="s-title">Jamming in under<br/>60 seconds.</div></div>
          <div className="steps hw-reveal">
            {STEPS.map(s=><div key={s.num} className="step"><div className="step-num">{s.num}</div><div><div className="step-t">{s.title}</div><div className="step-d">{s.desc}</div></div></div>)}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="cta-banner hw-reveal">
          <div className="s-label" style={{marginBottom:14}}>Free Forever · No Ads · No Downloads</div>
          <h2 className="s-title" style={{marginBottom:16,fontSize:"clamp(1.9rem,4vw,2.8rem)"}}>Your next favourite memory<br/>starts with a Jam.</h2>
          <p style={{color:"#9CA3AF",fontSize:"1rem",maxWidth:420,margin:"0 auto 38px",lineHeight:1.73,position:"relative",zIndex:1}}>Open a room, share the link, and feel the heartwave. No credit card, no install — just music and the people you love.</p>
          {isSignedIn ? (
            <button className="btn-hero-main" style={{margin:"0 auto",fontSize:"1.05rem",padding:"16px 42px",position:"relative",zIndex:1}} onClick={() => navigate("/dashboard")}>🎧 Start Jamming Free</button>
          ) : (
            <SignUpButton mode="modal"><button className="btn-hero-main" style={{margin:"0 auto",fontSize:"1.05rem",padding:"16px 42px",position:"relative",zIndex:1}}>🎧 Start Jamming Free</button></SignUpButton>
          )}
        </div>

        {/* ── FOOTER ── */}
        <footer className="hw-footer">
          <div className="footer-logo">💙 HeartWave</div>
          <p style={{color:"#9CA3AF",fontSize:".82rem"}}>© 2025 HeartWave — Listen Together. Feel Everything.</p>
          <div className="footer-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#">Credits</a>
            <a href="mailto:hello@heartwave.app">Contact</a>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;