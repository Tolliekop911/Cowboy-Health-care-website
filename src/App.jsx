import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════════════════ */
const C = {
  p900:"#3b0764", p800:"#4c1d95", p700:"#5b21b6", p600:"#6d28d9",
  p500:"#7c3aed", p400:"#8b5cf6", p300:"#a78bfa", p200:"#c4b5fd",
  p100:"#ede9fe", p50:"#f5f3ff",
  gold:"#f59e0b", gold2:"#fbbf24", gold3:"#fef3c7",
  w:"#ffffff", bg:"#f8f5ff",
  g900:"#111827", g800:"#1f2937", g700:"#374151", g600:"#4b5563",
  g500:"#6b7280", g400:"#9ca3af", g300:"#d1d5db", g200:"#e5e7eb", g100:"#f3f4f6",
  gr600:"#16a34a", r600:"#dc2626", b600:"#2563eb", teal:"#0d9488",
};

/* ═══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: <FeatureIcon color="#7c3aed" bg="#f5f3ff">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </FeatureIcon>,
    title: "Smart Scheduling",
    desc: "Real-time availability grid. Patients pick from genuinely open slots and book directly — no request limbo, no phone tag.",
  },
  {
    icon: <FeatureIcon color="#e11d48" bg="#fff1f2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="12" y2="16"/>
            </svg>
          </FeatureIcon>,
    title: "Patient Charts",
    desc: "Full SOAP notes, diagnoses, medications, and labs in one place. Fast to document, easy to navigate.",
  },
  {
    icon: <FeatureIcon color="#d97706" bg="#fffbeb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </FeatureIcon>,
    title: "Billing & Claims",
    desc: "CMS-1500 export and Availity-connected claim submission. Track outstanding balances and reduce payment delays.",
  },
  {
    icon: <FeatureIcon color="#0d9488" bg="#f0fdfa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </FeatureIcon>,
    title: "Patient Portal",
    desc: "A beautiful, mobile-friendly portal patients actually use. Appointments, exercises, bills, and messages — all in one place.",
  },
  {
    icon: <FeatureIcon color="#16a34a" bg="#f0fdf4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M6 4v16 M18 4v16 M6 8h2 M16 8h2 M6 16h2 M16 16h2 M8 8h8 M8 16h8"/>
            </svg>
          </FeatureIcon>,
    title: "Home Exercise Programs",
    desc: "Assign personalised HEPs with body-region diagrams and video demos. Patients track daily completion in the portal.",
  },
  {
    icon: <FeatureIcon color="#2563eb" bg="#eff6ff">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </FeatureIcon>,
    title: "Treatment Plans",
    desc: "Phased recovery plans with outcome tracking, PSFS scores, and automatic progress documentation.",
  },
];

const STEPS = [
  {
    n:"01", color:C.p500,
    title:"Create Your Clinic",
    desc:"Sign up, add your staff, configure your schedule. Live in under 10 minutes — no IT required.",
    icon:"⚡",
  },
  {
    n:"02", color:C.gold,
    title:"Onboard Your Patients",
    desc:"Add patients manually or import existing records. They receive a portal invite automatically.",
    icon:"👤",
  },
  {
    n:"03", color:C.gr600,
    title:"Run Your Practice",
    desc:"Book appointments, document visits, assign HEPs, and submit claims — all from one screen.",
    icon:"🏥",
  },
];

const STATS = [
  { n:2400,  suffix:"+",  label:"Appointments Booked" },
  { n:98,    suffix:"%",  label:"Claim Acceptance Rate" },
  { n:12,    suffix:"min", label:"Avg. Booking Time" },
  { n:99.9,  suffix:"%",  label:"Platform Uptime" },
];

const TESTIMONIALS = [
  {
    name:"Dr. Sarah M.",
    role:"Physical Therapist, TX",
    text:"Cowboy EHR replaced three separate tools. The HEP builder alone saves me an hour a day, and patients actually complete their exercises.",
    initials:"SM", color:C.p500,
  },
  {
    name:"Jake T.",
    role:"Clinic Owner, CO",
    text:"Appointment no-shows dropped 40% after we switched. Patients love getting reminders through the portal instead of phone calls.",
    initials:"JT", color:C.gold,
  },
  {
    name:"Dr. Priya K.",
    role:"Sports Medicine, AZ",
    text:"The Availity billing integration was seamless. We're getting reimbursed faster and with far fewer claim rejections.",
    initials:"PK", color:C.r600,
  },
];

const PRICING = [
  {
    name:"Clinic", price:"$199", period:"/month",
    desc:"Everything you need to run a modern physical therapy or sports medicine clinic.",
    popular:true,
    features:[
      "Unlimited patients",
      "5 provider accounts",
      "Smart appointment scheduling",
      "Full patient portal",
      "Home Exercise Program builder",
      "Billing & CMS-1500 export",
      "Availity claim submission",
      "Treatment plan tracking",
      "Real-time data sync",
      "Email support",
    ],
  },
  {
    name:"Enterprise", price:"Custom", period:"",
    desc:"For multi-location groups and health systems that need flexibility.",
    popular:false,
    features:[
      "Everything in Clinic",
      "Unlimited provider accounts",
      "Multi-location management",
      "White-label patient portal",
      "Custom EHR integrations",
      "Dedicated onboarding specialist",
      "Priority SLA (4-hour response)",
      "Advanced audit logs",
      "Custom reporting",
    ],
  },
];

const FAQS = [
  { q:"Is Cowboy EHR HIPAA compliant?", a:"Yes. All data is encrypted at rest and in transit. We operate on SOC 2 certified infrastructure and provide Business Associate Agreements (BAAs) to all clinic customers." },
  { q:"How does the Availity billing integration work?", a:"We connect directly to the Availity REST API. You enter claim data in the standard billing workflow, and we handle EDI 837 submission, status tracking, and ERA/EOB reconciliation." },
  { q:"Can patients book on mobile?", a:"Absolutely. The patient portal is fully responsive and optimised for mobile. Patients can book, view HEPs, check billing, and send messages from any device." },
  { q:"How long does setup take?", a:"Most clinics are fully operational on day one. Signing up, creating providers, and seeing your first patient takes under 30 minutes. No IT department needed." },
  { q:"Can I import existing patient records?", a:"Yes. We support CSV import for patient demographics and can work with your team on structured data migration from most legacy systems." },
  { q:"What happens to my data if I cancel?", a:"You own your data 100%. On cancellation you receive a full export of all patient records, notes, appointments, and billing history in standard formats." },
];

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #fff; color: #1f2937; overflow-x: hidden; line-height: 1.6; }
  a { text-decoration: none; color: inherit; }
  button { font-family: inherit; cursor: pointer; }

  /* ── Scroll-triggered fade-up ── */
  .au { opacity: 0; transform: translateY(28px); transition: opacity .65s cubic-bezier(.22,1,.36,1), transform .65s cubic-bezier(.22,1,.36,1); }
  .au.vis { opacity: 1; transform: none; }
  .au.d1 { transition-delay:.08s; } .au.d2 { transition-delay:.16s; } .au.d3 { transition-delay:.24s; }
  .au.d4 { transition-delay:.32s; } .au.d5 { transition-delay:.40s; } .au.d6 { transition-delay:.48s; }

  /* ── Feature card 3D hover ── */
  .fcard { transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; cursor: default; transform-style: preserve-3d; }
  .fcard:hover { transform: translateY(-8px) perspective(600px) rotateX(3deg); box-shadow: 0 24px 48px rgba(124,58,237,.14), 0 4px 12px rgba(0,0,0,.06); }

  /* ── Gradient text ── */
  .gtext {
    background: linear-gradient(130deg, #c4b5fd 0%, #f59e0b 40%, #8b5cf6 80%);
    background-size: 300% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 5s linear infinite;
  }

  /* ── Animations ── */
  @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:300% center} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes scalePop { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
  @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-30px,60px) scale(.95)} }
  @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-50px,30px) scale(1.05)} 66%{transform:translate(40px,-50px) scale(1.1)} }
  @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,40px) scale(1.08)} }
  @keyframes pulse-ring { 0%{box-shadow:0 0 0 0 rgba(124,58,237,.4)} 70%{box-shadow:0 0 0 14px rgba(124,58,237,0)} 100%{box-shadow:0 0 0 0 rgba(124,58,237,0)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* ── Nav link underline ── */
  .nav-link { position: relative; }
  .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:currentColor; border-radius:2px; transform:scaleX(0); transition:transform .25s ease; transform-origin: left; }
  .nav-link:hover::after { transform:scaleX(1); }

  /* ── FAQ accordion ── */
  .faq-item { border-bottom: 1px solid #e5e7eb; overflow: hidden; }
  .faq-q { width: 100%; background: none; border: none; text-align: left; padding: 18px 0; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 600; color: #1f2937; gap: 12px; cursor: pointer; }
  .faq-a { font-size: 14px; color: #4b5563; line-height: 1.7; padding-bottom: 16px; }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .hero-grid    { grid-template-columns: 1fr !important; }
    .hero-canvas  { height: 300px !important; min-height: 300px !important; display: block !important; }
    .features-grid { grid-template-columns: 1fr 1fr !important; }
    .steps-grid   { grid-template-columns: 1fr !important; gap: 20px !important; }
    .steps-line   { display: none !important; }
    .pricing-grid { grid-template-columns: 1fr !important; }
    .stats-grid   { grid-template-columns: 1fr 1fr !important; }
    .footer-grid  { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
    .testimonials-grid { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 580px) {
    .features-grid { grid-template-columns: 1fr !important; }
    .footer-grid   { grid-template-columns: 1fr !important; }
    .stats-grid    { grid-template-columns: 1fr 1fr !important; }
    .hide-sm       { display: none !important; }
  }
`;

/* ═══════════════════════════════════════════════════════════
   UTILITY HOOKS
═══════════════════════════════════════════════════════════ */
function useScrollAnim(ref) {
  useEffect(() => {
    if (!ref?.current) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    ref.current.querySelectorAll(".au").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════ */
function FeatureIcon({ color, bg, children }) {
  return (
    <div style={{ width:48, height:48, borderRadius:14, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color, flexShrink:0, marginBottom:16 }}>
      {children}
    </div>
  );
}

function StatNumber({ target, suffix }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const isFloat = target % 1 !== 0;
        const dur = 2000, start = performance.now();
        const tick = t => {
          const p = Math.min((t - start) / dur, 1);
          const e2 = 1 - Math.pow(1 - p, 3);
          setVal(isFloat ? +(target * e2).toFixed(1) : Math.round(target * e2));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.6 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ─────────────────────────────── NAVBAR */
function Navbar({ onDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { label:"Features", href:"#features" },
    { label:"How It Works", href:"#how-it-works" },
    { label:"Pricing", href:"#pricing" },
    { label:"FAQ", href:"#faq" },
  ];
  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:1000,
        height:68, padding:"0 clamp(20px,5%,80px)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: scrolled ? "rgba(255,255,255,.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,.07), 0 2px 24px rgba(0,0,0,.06)" : "none",
        transition:"background .3s,box-shadow .3s",
      }}>
        {/* Logo */}
        <a href="#" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="34" height="34" rx="9" fill="#7c3aed"/>
            <path d="M8 20 Q17 9 26 20" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
            <path d="M5 22 Q17 13 29 22" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
            <rect x="15" y="19" width="4" height="9" rx="1.5" fill="white"/>
            <rect x="11.5" y="22" width="11" height="4.5" rx="1.5" fill="white"/>
          </svg>
          <span style={{ fontWeight:800, fontSize:17, color: scrolled ? C.p700 : "#fff", letterSpacing:"-.4px", whiteSpace:"nowrap" }}>
            Cowboy&nbsp;<span style={{ color:C.gold }}>EHR</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hide-sm" style={{ display:"flex", gap:28, alignItems:"center" }}>
          {links.map(l => (
            <a key={l.label} href={l.href} className="nav-link"
              style={{ fontSize:14, fontWeight:500, color: scrolled ? C.g600 : "rgba(255,255,255,.82)", transition:"color .2s" }}
              onMouseEnter={e => e.currentTarget.style.color = scrolled ? C.p600 : "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = scrolled ? C.g600 : "rgba(255,255,255,.82)"}
            >{l.label}</a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <a href="#" className="hide-sm" style={{ padding:"8px 18px", fontSize:13, fontWeight:600, color: scrolled ? C.p600 : "rgba(255,255,255,.9)", border:`1.5px solid ${scrolled?"rgba(109,40,217,.35)":"rgba(255,255,255,.28)"}`, borderRadius:8, transition:"all .2s" }}>
            Log In
          </a>
          <button onClick={onDemo} style={{ padding:"9px 20px", fontSize:13, fontWeight:700, background:C.gold, color:"#1a0845", border:"none", borderRadius:8, boxShadow:"0 2px 14px rgba(245,158,11,.45)", transition:"transform .15s,box-shadow .15s", animation:"pulse-ring 2.5s ease-out infinite" }}
            onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 4px 20px rgba(245,158,11,.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 14px rgba(245,158,11,.45)"; }}
          >
            Get Started →
          </button>
          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)} style={{ display:"none", background:"none", border:"none", padding:6, color: scrolled ? C.g700 : "#fff" }} className="mobile-menu-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {mobileOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position:"fixed", top:68, left:0, right:0, background:"rgba(255,255,255,.97)", backdropFilter:"blur(16px)", zIndex:999, padding:"20px 24px 28px", boxShadow:"0 8px 32px rgba(0,0,0,.12)" }}>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} style={{ display:"block", padding:"12px 0", fontSize:16, fontWeight:600, color:C.g700, borderBottom:`1px solid ${C.g100}` }}>{l.label}</a>
          ))}
          <button onClick={() => { onDemo(); setMobileOpen(false); }} style={{ marginTop:16, width:"100%", padding:"12px", background:C.p500, color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700 }}>
            Get Started →
          </button>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────── THREE.JS HERO CANVAS */
function HeroCanvas() {
  const mountRef = useRef();
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let W = mount.clientWidth, H = mount.clientHeight;
    if (!W || !H) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(58, W / H, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ── Nodes ── */
    const nodes = [];
    const sharedGeom = new THREE.SphereGeometry(0.09, 12, 12);
    const MAT_PURPLE = new THREE.MeshPhongMaterial({ color:0x8b5cf6, emissive:0x5b21b6, emissiveIntensity:.45, shininess:80 });
    const MAT_GOLD   = new THREE.MeshPhongMaterial({ color:0xfbbf24, emissive:0xd97706, emissiveIntensity:.55, shininess:80 });
    const MAT_LIGHT  = new THREE.MeshPhongMaterial({ color:0xc4b5fd, emissive:0x7c3aed, emissiveIntensity:.3,  shininess:60 });

    for (let i = 0; i < 60; i++) {
      const mat = (i % 7 === 0) ? MAT_GOLD.clone() : (i % 4 === 0) ? MAT_LIGHT.clone() : MAT_PURPLE.clone();
      const mesh = new THREE.Mesh(sharedGeom, mat);
      const r = .7 + Math.random() * .9;
      mesh.scale.setScalar(r);
      mesh.position.set(
        (Math.random() - .5) * 11,
        (Math.random() - .5) * 7.5,
        (Math.random() - .5) * 5.5,
      );
      mesh.userData = {
        vx: (Math.random() - .5) * .007,
        vy: (Math.random() - .5) * .005,
        vz: (Math.random() - .5) * .003,
        phase: Math.random() * Math.PI * 2,
        baseScale: r,
      };
      nodes.push(mesh);
    }

    /* ── Lines ── */
    const MAX_LINES = 300;
    const posBuf    = new Float32Array(MAX_LINES * 6);
    const lineGeom  = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.BufferAttribute(posBuf, 3));
    const lineMesh  = new THREE.LineSegments(lineGeom,
      new THREE.LineBasicMaterial({ color:0x8b5cf6, transparent:true, opacity:.22 })
    );

    /* ── Group so we can rotate everything together ── */
    const group = new THREE.Group();
    nodes.forEach(n => group.add(n));
    group.add(lineMesh);
    scene.add(group);

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, .5));
    const dl = new THREE.DirectionalLight(0xffffff, 1.1);
    dl.position.set(6, 5, 6);
    scene.add(dl);
    const pl1 = new THREE.PointLight(0x8b5cf6, 4, 18);
    pl1.position.set(0, 2, 5);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0xf59e0b, 2, 12);
    pl2.position.set(-3, -2, 3);
    scene.add(pl2);

    /* ── Mouse parallax ── */
    let mx = 0, my = 0;
    const onMouse = e => {
      mx = (e.clientX / window.innerWidth  - .5) * 2;
      my = (e.clientY / window.innerHeight - .5) * 2;
    };
    window.addEventListener("mousemove", onMouse, { passive:true });

    /* ── Animate ── */
    let raf;
    const clock = new THREE.Clock();
    const CONN_DIST = 3.0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* drift nodes */
      nodes.forEach(n => {
        n.userData.phase += .012;
        n.position.x += n.userData.vx + Math.sin(n.userData.phase * .8) * .0008;
        n.position.y += n.userData.vy + Math.cos(n.userData.phase * .6) * .0006;
        n.position.z += n.userData.vz;
        if (Math.abs(n.position.x) > 6)   n.userData.vx *= -1;
        if (Math.abs(n.position.y) > 4.2) n.userData.vy *= -1;
        if (Math.abs(n.position.z) > 3.2) n.userData.vz *= -1;
        /* subtle pulse */
        const pulse = 1 + Math.sin(t * 1.8 + n.userData.phase) * 0.06;
        n.scale.setScalar(n.userData.baseScale * pulse);
      });

      /* rebuild connection lines */
      let li = 0;
      outer: for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (li >= MAX_LINES) break outer;
          const d = nodes[i].position.distanceTo(nodes[j].position);
          if (d < CONN_DIST) {
            posBuf.set([nodes[i].position.x, nodes[i].position.y, nodes[i].position.z], li * 6);
            posBuf.set([nodes[j].position.x, nodes[j].position.y, nodes[j].position.z], li * 6 + 3);
            li++;
          }
        }
      }
      for (let i = li; i < MAX_LINES; i++) posBuf.fill(0, i * 6, i * 6 + 6);
      lineGeom.attributes.position.needsUpdate = true;
      lineGeom.setDrawRange(0, li * 2);

      /* gentle auto-rotation + mouse parallax */
      group.rotation.y = Math.sin(t * .08) * .25 + mx * .06;
      group.rotation.x = Math.sin(t * .06) * .10 - my * .04;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ── */
    const onResize = () => {
      W = mount.clientWidth; H = mount.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}/>
  );
}

/* ─────────────────────────────── HERO */
function Hero({ onDemo }) {
  return (
    <section style={{ position:"relative", minHeight:"100vh", background:"linear-gradient(140deg, #0a051e 0%, #1c0847 45%, #0d1338 100%)", overflow:"hidden", display:"flex", alignItems:"center" }}>
      {/* Gradient orbs */}
      <div style={{ position:"absolute", top:"10%", left:"5%",  width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,.28) 0%, transparent 70%)", filter:"blur(40px)", animation:"orb1 18s ease-in-out infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"5%", right:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(245,158,11,.18) 0%, transparent 70%)", filter:"blur(50px)", animation:"orb2 22s ease-in-out infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"50%", left:"55%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,.20) 0%, transparent 70%)", filter:"blur(60px)", animation:"orb3 16s ease-in-out infinite", pointerEvents:"none" }}/>

      {/* Hero grid */}
      <div className="hero-grid" style={{ position:"relative", zIndex:2, display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, width:"100%", maxWidth:1280, margin:"0 auto", padding:"100px clamp(20px,5%,80px) 60px", alignItems:"center" }}>
        {/* Left: copy */}
        <div style={{ paddingRight:"clamp(0px,4vw,48px)" }}>
          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,.18)", border:"1px solid rgba(139,92,246,.35)", borderRadius:99, padding:"6px 14px", marginBottom:28, animation:"fadeUp .6s ease both" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.gold, boxShadow:`0 0 8px ${C.gold}`, animation:"blink 2s ease infinite" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:"rgba(196,181,253,.9)", letterSpacing:.4 }}>Now with Availity billing integration</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize:"clamp(38px,5vw,68px)", fontWeight:900, lineHeight:1.08, letterSpacing:"-1.5px", color:"#fff", marginBottom:20, animation:"fadeUp .7s .1s ease both" }}>
            The EMR Built<br/>
            for <span className="gtext">Real Clinics</span>
          </h1>

          {/* Sub */}
          <p style={{ fontSize:"clamp(16px,1.6vw,19px)", color:"rgba(255,255,255,.65)", lineHeight:1.7, maxWidth:500, marginBottom:36, animation:"fadeUp .7s .2s ease both" }}>
            Smart scheduling, patient portal, HEP builder, and Availity-connected billing — all in one platform built for physical therapy and sports medicine.
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:44, animation:"fadeUp .7s .3s ease both" }}>
            <button onClick={onDemo} style={{ padding:"14px 30px", fontSize:15, fontWeight:700, background:C.gold, color:"#1a0845", border:"none", borderRadius:10, boxShadow:"0 4px 24px rgba(245,158,11,.5)", transition:"transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(245,158,11,.6)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 4px 24px rgba(245,158,11,.5)"; }}
            >
              Start Free Trial →
            </button>
            <a href="#features" style={{ padding:"14px 26px", fontSize:15, fontWeight:600, color:"rgba(255,255,255,.9)", border:"1.5px solid rgba(255,255,255,.2)", borderRadius:10, background:"rgba(255,255,255,.06)", backdropFilter:"blur(8px)", transition:"all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="rgba(255,255,255,.12)"; e.currentTarget.style.borderColor="rgba(255,255,255,.35)"; }}
              onMouseLeave={e => { e.currentTarget.style.background="rgba(255,255,255,.06)"; e.currentTarget.style.borderColor="rgba(255,255,255,.2)"; }}
            >
              See Features
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, animation:"fadeUp .7s .4s ease both" }}>
            {["✓ HIPAA Ready","✓ Availity Connected","✓ No setup fees","✓ Cancel anytime"].map(b => (
              <span key={b} style={{ fontSize:12, fontWeight:500, color:"rgba(196,181,253,.8)", background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.2)", borderRadius:99, padding:"5px 12px" }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Right: 3D canvas */}
        <div className="hero-canvas" style={{ position:"relative", height:"clamp(340px,50vh,580px)", borderRadius:24, overflow:"hidden", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", backdropFilter:"blur(4px)", animation:"scalePop .8s .2s ease both" }}>
          <HeroCanvas/>
          {/* Floating stat cards */}
          <div style={{ position:"absolute", top:24, left:20, background:"rgba(255,255,255,.1)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.15)", borderRadius:12, padding:"10px 16px", animation:"float 3s 0s ease-in-out infinite" }}>
            <div style={{ fontSize:11, color:"rgba(196,181,253,.8)", fontWeight:500, marginBottom:2 }}>Next appointment</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>Today 2:30 PM</div>
          </div>
          <div style={{ position:"absolute", bottom:28, right:20, background:"rgba(255,255,255,.1)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,.15)", borderRadius:12, padding:"10px 16px", animation:"float 3.5s .5s ease-in-out infinite" }}>
            <div style={{ fontSize:11, color:"rgba(196,181,253,.8)", fontWeight:500, marginBottom:2 }}>Claim status</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#4ade80" }}>✓ Accepted</div>
          </div>
          <div style={{ position:"absolute", top:"50%", right:16, transform:"translateY(-50%)", background:"rgba(245,158,11,.15)", backdropFilter:"blur(12px)", border:"1px solid rgba(245,158,11,.25)", borderRadius:12, padding:"10px 16px", animation:"float 4s 1s ease-in-out infinite" }}>
            <div style={{ fontSize:11, color:"rgba(251,191,36,.8)", fontWeight:500, marginBottom:2 }}>HEP completed</div>
            <div style={{ fontSize:14, fontWeight:700, color:"#fbbf24" }}>6 / 6 exercises</div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:6, opacity:.4 }}>
        <span style={{ fontSize:11, color:"#fff", letterSpacing:1.5, textTransform:"uppercase", fontWeight:500 }}>Scroll</span>
        <div style={{ width:1, height:32, background:"linear-gradient(to bottom, rgba(255,255,255,.8), transparent)" }}/>
      </div>
    </section>
  );
}

/* ─────────────────────────────── TRUST BAR */
function TrustBar() {
  const logos = ["Availity","Supabase","HIPAA","React","CMS-1500","ISO 27001"];
  return (
    <div style={{ background:"#fafafa", borderTop:"1px solid #f0edff", borderBottom:"1px solid #f0edff", padding:"18px clamp(20px,5%,80px)" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", alignItems:"center", gap:0, flexWrap:"wrap" }}>
        <span style={{ fontSize:12, fontWeight:600, color:C.g400, letterSpacing:.5, textTransform:"uppercase", whiteSpace:"nowrap", paddingRight:32, borderRight:`1px solid ${C.g200}`, marginRight:32 }}>
          Trusted tech stack
        </span>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"14px 32px", alignItems:"center", flex:1 }}>
          {logos.map(l => (
            <span key={l} style={{ fontSize:13, fontWeight:700, color:C.g400, letterSpacing:.3 }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── FEATURES */
function Features() {
  const ref = useRef();
  useScrollAnim(ref);
  return (
    <section id="features" ref={ref} style={{ padding:"96px clamp(20px,5%,80px)", maxWidth:1280, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:64 }}>
        <div className="au" style={{ display:"inline-block", fontSize:12, fontWeight:700, color:C.p600, letterSpacing:1.5, textTransform:"uppercase", background:C.p50, border:`1px solid ${C.p200}`, borderRadius:99, padding:"6px 16px", marginBottom:16 }}>
          Features
        </div>
        <h2 className="au d1" style={{ fontSize:"clamp(30px,3.5vw,46px)", fontWeight:900, letterSpacing:"-1px", color:C.g900, marginBottom:16 }}>
          Everything your clinic needs.<br/><span style={{ color:C.p500 }}>Nothing it doesn't.</span>
        </h2>
        <p className="au d2" style={{ fontSize:17, color:C.g500, maxWidth:520, margin:"0 auto", lineHeight:1.7 }}>
          Purpose-built for physical therapy and sports medicine — not a watered-down general EHR.
        </p>
      </div>

      <div className="features-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
        {FEATURES.map((f, i) => (
          <div key={f.title} className={`au fcard d${i+1}`} style={{ background:"#fff", border:`1.5px solid ${C.g200}`, borderRadius:20, padding:"28px 26px", perspective:600 }}>
            {f.icon}
            <h3 style={{ fontSize:17, fontWeight:800, color:C.g900, marginBottom:10, letterSpacing:"-.3px" }}>{f.title}</h3>
            <p style={{ fontSize:14, color:C.g500, lineHeight:1.7 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────── DEMO / PRODUCT PREVIEW */
function Demo() {
  return (
    <section style={{ background:"linear-gradient(135deg, #1c0847 0%, #0f0a1e 100%)", padding:"96px clamp(20px,5%,80px)", overflow:"hidden", position:"relative" }}>
      {/* BG glow */}
      <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,.18) 0%, transparent 65%)", filter:"blur(60px)", pointerEvents:"none" }}/>

      <div style={{ maxWidth:1100, margin:"0 auto", position:"relative", zIndex:1 }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ display:"inline-block", fontSize:12, fontWeight:700, color:C.p300, letterSpacing:1.5, textTransform:"uppercase", background:"rgba(124,58,237,.2)", border:"1px solid rgba(124,58,237,.3)", borderRadius:99, padding:"6px 16px", marginBottom:16 }}>
            Live Platform
          </div>
          <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-1px", color:"#fff", marginBottom:14 }}>
            See it in action
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.55)", maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>
            From booking to billing — every workflow runs in a single, beautiful interface.
          </p>
        </div>

        {/* Fake browser chrome with feature tabs */}
        <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:20, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,.6)" }}>
          {/* Browser bar */}
          <div style={{ background:"rgba(0,0,0,.3)", padding:"10px 18px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid rgba(255,255,255,.08)" }}>
            <div style={{ display:"flex", gap:6 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#ff5f57" }}/>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#febc2e" }}/>
              <div style={{ width:10, height:10, borderRadius:"50%", background:"#28c840" }}/>
            </div>
            <div style={{ flex:1, background:"rgba(255,255,255,.08)", borderRadius:6, padding:"5px 14px", fontSize:12, color:"rgba(255,255,255,.4)", fontFamily:"monospace" }}>
              app.cowboyehr.com
            </div>
          </div>

          {/* Dashboard mockup */}
          <div style={{ padding:"28px 24px", display:"grid", gridTemplateColumns:"200px 1fr", gap:20, minHeight:380 }}>
            {/* Sidebar */}
            <div style={{ background:"rgba(0,0,0,.2)", borderRadius:12, padding:"16px 12px", display:"flex", flexDirection:"column", gap:4 }}>
              {["📅 Schedule","👥 Patients","📋 Charts","💊 Medications","🏋️ HEP Builder","💰 Billing","📊 Reports"].map((item, i) => (
                <div key={item} style={{ padding:"9px 12px", borderRadius:8, background: i === 0 ? "rgba(124,58,237,.5)" : "transparent", fontSize:13, fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#fff" : "rgba(255,255,255,.5)", cursor:"default", transition:"background .15s" }}>
                  {item}
                </div>
              ))}
            </div>

            {/* Main area */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Today header */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,.4)", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Today</p>
                  <h3 style={{ fontSize:20, fontWeight:800, color:"#fff" }}>Thursday, May 28</h3>
                </div>
                <div style={{ padding:"8px 16px", background:C.gold, color:"#1a0845", borderRadius:8, fontSize:12, fontWeight:700 }}>+ New Appointment</div>
              </div>

              {/* Appointment cards */}
              {[
                { time:"9:00 AM", name:"Alex R.", type:"Initial Eval", status:"Checked In", color:"#22c55e" },
                { time:"10:30 AM", name:"Maria S.", type:"Follow-Up", status:"Scheduled", color:"#8b5cf6" },
                { time:"2:30 PM", name:"James T.", type:"HEP Review", status:"Scheduled", color:"#8b5cf6" },
              ].map(a => (
                <div key={a.time} style={{ background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.45)", width:60, flexShrink:0 }}>{a.time}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{a.name}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,.45)" }}>{a.type}</div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:a.color, background:`${a.color}22`, borderRadius:6, padding:"4px 10px" }}>{a.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── HOW IT WORKS */
function HowItWorks() {
  const ref = useRef();
  useScrollAnim(ref);
  return (
    <section id="how-it-works" ref={ref} style={{ padding:"96px clamp(20px,5%,80px)", background:C.bg }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div className="au" style={{ display:"inline-block", fontSize:12, fontWeight:700, color:C.p600, letterSpacing:1.5, textTransform:"uppercase", background:C.p50, border:`1px solid ${C.p200}`, borderRadius:99, padding:"6px 16px", marginBottom:16 }}>
            Getting Started
          </div>
          <h2 className="au d1" style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-1px", color:C.g900, marginBottom:14 }}>
            Live in three steps
          </h2>
          <p className="au d2" style={{ fontSize:17, color:C.g500, maxWidth:460, margin:"0 auto", lineHeight:1.7 }}>
            No lengthy onboarding. No IT team. Most clinics see their first patient the same day.
          </p>
        </div>

        <div className="steps-grid" style={{ position:"relative", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32 }}>
          {/* Connector line */}
          <div className="steps-line" style={{ position:"absolute", top:52, left:"calc(16.6% + 40px)", right:"calc(16.6% + 40px)", height:2, background:`linear-gradient(to right, ${C.p300}, ${C.p400})`, zIndex:0 }}/>

          {STEPS.map((s, i) => (
            <div key={s.n} className={`au d${i+1}`} style={{ textAlign:"center", position:"relative", zIndex:1 }}>
              {/* Number circle */}
              <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg, ${s.color}22, ${s.color}44)`, border:`2px solid ${s.color}66`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:`0 8px 32px ${s.color}30` }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                  {s.icon}
                </div>
              </div>
              <div style={{ fontSize:11, fontWeight:800, color:s.color, letterSpacing:1.5, textTransform:"uppercase", marginBottom:10 }}>Step {s.n}</div>
              <h3 style={{ fontSize:20, fontWeight:800, color:C.g900, marginBottom:12, letterSpacing:"-.3px" }}>{s.title}</h3>
              <p style={{ fontSize:15, color:C.g500, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── STATS */
function Stats() {
  return (
    <section style={{ background:"linear-gradient(135deg, #3b0764 0%, #1e0a3c 50%, #0f1535 100%)", padding:"80px clamp(20px,5%,80px)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(139,92,246,.15) 1px, transparent 1px)", backgroundSize:"32px 32px", pointerEvents:"none" }}/>
      <div className="stats-grid" style={{ maxWidth:1000, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:32, position:"relative", zIndex:1 }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:"clamp(36px,4vw,54px)", fontWeight:900, color:"#fff", letterSpacing:"-1px", lineHeight:1, marginBottom:8,
                          textShadow:`0 0 40px ${C.p400}` }}>
              <StatNumber target={s.n} suffix={s.suffix}/>
            </div>
            <div style={{ fontSize:14, color:"rgba(196,181,253,.7)", fontWeight:500, lineHeight:1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────── TESTIMONIALS */
function Testimonials() {
  const ref = useRef();
  useScrollAnim(ref);
  return (
    <section ref={ref} style={{ padding:"96px clamp(20px,5%,80px)", background:"#fff" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div className="au" style={{ fontSize:32, marginBottom:12 }}>⭐⭐⭐⭐⭐</div>
          <h2 className="au d1" style={{ fontSize:"clamp(28px,3vw,40px)", fontWeight:900, letterSpacing:"-.8px", color:C.g900, marginBottom:12 }}>
            Clinics love it
          </h2>
          <p className="au d2" style={{ fontSize:16, color:C.g500, maxWidth:420, margin:"0 auto" }}>
            Real feedback from real providers who switched to Cowboy EHR.
          </p>
        </div>

        <div className="testimonials-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`au d${i+1}`} style={{ background:C.bg, border:`1.5px solid ${C.p100}`, borderRadius:20, padding:"28px 26px", display:"flex", flexDirection:"column", gap:16 }}>
              {/* Stars */}
              <div style={{ display:"flex", gap:3 }}>
                {Array(5).fill(0).map((_, j) => <span key={j} style={{ fontSize:14, color:C.gold }}>★</span>)}
              </div>
              <p style={{ fontSize:15, color:C.g700, lineHeight:1.75, flex:1 }}>"{t.text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:4, borderTop:`1px solid ${C.p100}` }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:t.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.g800 }}>{t.name}</div>
                  <div style={{ fontSize:12, color:C.g400 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── PRICING */
function Pricing({ onDemo }) {
  const ref = useRef();
  useScrollAnim(ref);
  return (
    <section id="pricing" ref={ref} style={{ padding:"96px clamp(20px,5%,80px)", background:C.bg }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div className="au" style={{ display:"inline-block", fontSize:12, fontWeight:700, color:C.p600, letterSpacing:1.5, textTransform:"uppercase", background:C.p50, border:`1px solid ${C.p200}`, borderRadius:99, padding:"6px 16px", marginBottom:16 }}>
            Pricing
          </div>
          <h2 className="au d1" style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-.8px", color:C.g900, marginBottom:14 }}>
            Simple, transparent pricing
          </h2>
          <p className="au d2" style={{ fontSize:16, color:C.g500, maxWidth:420, margin:"0 auto", lineHeight:1.7 }}>
            One plan covers everything. No per-patient fees, no feature gating.
          </p>
        </div>

        <div className="pricing-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }}>
          {PRICING.map((p, i) => (
            <div key={p.name} className={`au d${i+1}`} style={{
              background: p.popular ? "linear-gradient(135deg, #4c1d95, #1e0a3c)" : "#fff",
              border: p.popular ? "none" : `1.5px solid ${C.g200}`,
              borderRadius:24, padding:"36px 32px", position:"relative",
              boxShadow: p.popular ? "0 24px 64px rgba(76,29,149,.4)" : "0 2px 12px rgba(0,0,0,.04)",
            }}>
              {p.popular && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:C.gold, color:"#1a0845", fontSize:11, fontWeight:800, padding:"5px 18px", borderRadius:99, letterSpacing:.5, textTransform:"uppercase", boxShadow:"0 4px 14px rgba(245,158,11,.45)" }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize:13, fontWeight:700, color: p.popular ? C.p300 : C.g400, letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>{p.name}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
                <span style={{ fontSize:48, fontWeight:900, color: p.popular ? "#fff" : C.g900, letterSpacing:"-2px", lineHeight:1 }}>{p.price}</span>
                <span style={{ fontSize:14, color: p.popular ? "rgba(255,255,255,.5)" : C.g400, fontWeight:500 }}>{p.period}</span>
              </div>
              <p style={{ fontSize:14, color: p.popular ? "rgba(255,255,255,.6)" : C.g500, marginBottom:28, lineHeight:1.6 }}>{p.desc}</p>
              <button onClick={onDemo} style={{
                width:"100%", padding:"13px", fontSize:15, fontWeight:700,
                background: p.popular ? C.gold : C.p500, color: p.popular ? "#1a0845" : "#fff",
                border:"none", borderRadius:10, marginBottom:28, transition:"transform .2s, box-shadow .2s",
                boxShadow: p.popular ? "0 4px 20px rgba(245,158,11,.4)" : "0 4px 16px rgba(124,58,237,.3)",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform=""; }}
              >
                {p.cta}
              </button>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:11 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:14, color: p.popular ? "rgba(255,255,255,.8)" : C.g600 }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background: p.popular ? "rgba(74,222,128,.2)" : "#f0fdf4", border:`1.5px solid ${C.gr600}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="au" style={{ textAlign:"center", fontSize:13, color:C.g400, marginTop:24 }}>
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────── FAQ */
function FAQ() {
  const [open, setOpen] = useState(null);
  const ref = useRef();
  useScrollAnim(ref);
  return (
    <section id="faq" ref={ref} style={{ padding:"80px clamp(20px,5%,80px)", background:"#fff" }}>
      <div style={{ maxWidth:720, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h2 className="au" style={{ fontSize:"clamp(26px,3vw,40px)", fontWeight:900, letterSpacing:"-.8px", color:C.g900, marginBottom:12 }}>
            Frequently asked questions
          </h2>
          <p className="au d1" style={{ fontSize:16, color:C.g500 }}>Everything you need to know before getting started.</p>
        </div>
        <div className="au d2">
          {FAQS.map((f, i) => (
            <div key={i} className="faq-item">
              <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <span style={{ fontSize:20, color:C.p500, transform: open===i?"rotate(45deg)":"rotate(0)", transition:"transform .25s", flexShrink:0, fontWeight:300 }}>+</span>
              </button>
              {open === i && (
                <div className="faq-a" style={{ animation:"fadeUp .3s ease" }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────── FINAL CTA */
function FinalCTA({ onDemo }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section style={{ padding:"96px clamp(20px,5%,80px)", background:"linear-gradient(140deg, #0a051e 0%, #1c0847 50%, #0d0e30 100%)", position:"relative", overflow:"hidden", textAlign:"center" }}>
      {/* BG glow */}
      <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,.22) 0%, transparent 65%)", filter:"blur(60px)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:1, maxWidth:580, margin:"0 auto" }}>
        <div style={{ fontSize:13, fontWeight:700, color:C.p300, letterSpacing:1.5, textTransform:"uppercase", marginBottom:20 }}>
          Ready when you are
        </div>
        <h2 style={{ fontSize:"clamp(30px,4vw,52px)", fontWeight:900, color:"#fff", letterSpacing:"-1.2px", marginBottom:18, lineHeight:1.1 }}>
          Your clinic deserves<br/>
          <span className="gtext">better software</span>
        </h2>
        <p style={{ fontSize:17, color:"rgba(255,255,255,.6)", lineHeight:1.7, marginBottom:40 }}>
          Join clinics running on Cowboy EHR. Start your free 14-day trial — no credit card, no commitment.
        </p>
        {sent ? (
          <div style={{ fontSize:16, fontWeight:600, color:"#4ade80" }}>✓ We'll be in touch shortly!</div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); if (email) setSent(true); }} style={{ display:"flex", gap:10, maxWidth:440, margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
            <input
              type="email" required placeholder="Enter your clinic email"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex:1, minWidth:200, padding:"13px 18px", borderRadius:10, border:"1.5px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.08)", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", backdropFilter:"blur(8px)" }}
            />
            <button type="submit" style={{ padding:"13px 26px", background:C.gold, color:"#1a0845", border:"none", borderRadius:10, fontSize:14, fontWeight:700, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(245,158,11,.45)", transition:"transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform=""}
            >
              Start Free Trial →
            </button>
          </form>
        )}
        <p style={{ fontSize:12, color:"rgba(255,255,255,.3)", marginTop:16 }}>
          14-day free trial · No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────── FOOTER */
function Footer() {
  const cols = [
    { title:"Product",  links:["Features","Pricing","Security","Changelog"] },
    { title:"Resources",links:["Documentation","API Reference","Status","Support"] },
    { title:"Legal",    links:["Privacy Policy","Terms of Service","HIPAA BAA","Cookie Policy"] },
  ];
  return (
    <footer style={{ background:C.g900, padding:"60px clamp(20px,5%,80px) 32px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div className="footer-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:48, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="9" fill="#7c3aed"/>
                <path d="M8 20 Q17 9 26 20" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
                <path d="M5 22 Q17 13 29 22" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <rect x="15" y="19" width="4" height="9" rx="1.5" fill="white"/>
                <rect x="11.5" y="22" width="11" height="4.5" rx="1.5" fill="white"/>
              </svg>
              <span style={{ fontWeight:800, fontSize:16, color:"#fff", letterSpacing:"-.3px" }}>Cowboy <span style={{ color:C.gold }}>EHR</span></span>
            </div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", lineHeight:1.8, maxWidth:260 }}>
              Modern electronic health records for physical therapy and sports medicine clinics.
            </p>
            <div style={{ display:"flex", gap:12, marginTop:20 }}>
              {["𝕏","in","📧"].map(s => (
                <div key={s} style={{ width:34, height:34, borderRadius:8, background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:13, color:"rgba(255,255,255,.5)", transition:"background .2s" }}>{s}</div>
              ))}
            </div>
          </div>
          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.3)", letterSpacing:1.2, textTransform:"uppercase", marginBottom:16 }}>{col.title}</div>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                {col.links.map(l => (
                  <li key={l}><a href="#" style={{ fontSize:14, color:"rgba(255,255,255,.5)", transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#fff"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.5)"}
                  >{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontSize:13, color:"rgba(255,255,255,.3)" }}>
            © {new Date().getFullYear()} Cowboy Healthcare, Inc. All rights reserved.
          </span>
          <div style={{ display:"flex", gap:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.2)", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:4, padding:"3px 8px" }}>HIPAA</span>
            <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,.2)", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:4, padding:"3px 8px" }}>SOC 2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   DEMO MODAL
═══════════════════════════════════════════════════════════ */
function DemoModal({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [clinic, setClinic] = useState("");
  const [done, setDone] = useState(false);
  const submit = e => { e.preventDefault(); if (name && email) setDone(true); };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(10,5,30,.7)", backdropFilter:"blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:40, maxWidth:440, width:"100%", boxShadow:"0 40px 100px rgba(0,0,0,.3)", animation:"scalePop .3s ease" }}>
        {done ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <h3 style={{ fontSize:22, fontWeight:800, color:C.g900, marginBottom:10 }}>You're on the list!</h3>
            <p style={{ fontSize:14, color:C.g500, lineHeight:1.7 }}>We'll reach out within 1 business day to set up your demo and free trial.</p>
            <button onClick={onClose} style={{ marginTop:24, padding:"11px 28px", background:C.p500, color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700 }}>Close</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize:22, fontWeight:800, color:C.g900, marginBottom:6 }}>Request a free trial</h3>
            <p style={{ fontSize:14, color:C.g500, marginBottom:28, lineHeight:1.6 }}>We'll get your clinic set up and walk you through the platform live.</p>
            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { label:"Your name", val:name, set:setName, ph:"Dr. Jane Smith", type:"text" },
                { label:"Work email", val:email, set:setEmail, ph:"jane@yourclinic.com", type:"email" },
                { label:"Clinic name", val:clinic, set:setClinic, ph:"Smith Physical Therapy", type:"text" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize:13, fontWeight:600, color:C.g700, display:"block", marginBottom:6 }}>{f.label}</label>
                  <input required={f.type!=="text"||f.label!=="Clinic name"} type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)}
                    style={{ width:"100%", padding:"10px 14px", border:`1.5px solid ${C.g200}`, borderRadius:9, fontSize:14, color:C.g800, fontFamily:"inherit", outline:"none" }}
                    onFocus={e => e.target.style.borderColor=C.p400}
                    onBlur={e => e.target.style.borderColor=C.g200}
                  />
                </div>
              ))}
              <button type="submit" style={{ padding:"12px", background:`linear-gradient(135deg,${C.p600},${C.p500})`, color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, marginTop:4, boxShadow:"0 4px 16px rgba(124,58,237,.3)" }}>
                Get Started Free →
              </button>
            </form>
            <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:"none", border:"none", fontSize:20, color:C.g400, cursor:"pointer", lineHeight:1, padding:4 }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [showDemo, setShowDemo] = useState(false);

  /* Inject global CSS once */
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "cowboy-global";
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { const s = document.getElementById("cowboy-global"); if (s) s.remove(); };
  }, []);

  const openDemo = () => setShowDemo(true);

  return (
    <>
      <Navbar onDemo={openDemo}/>
      <Hero onDemo={openDemo}/>
      <TrustBar/>
      <Features/>
      <Demo/>
      <HowItWorks/>
      <Stats/>
      <Testimonials/>
      <Pricing onDemo={openDemo}/>
      <FAQ/>
      <FinalCTA onDemo={openDemo}/>
      <Footer/>
      {showDemo && <DemoModal onClose={() => setShowDemo(false)}/>}
    </>
  );
}
