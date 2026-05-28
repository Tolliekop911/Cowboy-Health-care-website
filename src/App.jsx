import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════ */
const GLOBAL = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', sans-serif;
    background: #06030f;
    color: #fff;
    overflow-x: hidden;
    cursor: none;
    -webkit-font-smoothing: antialiased;
  }

  /* Grain texture */
  body::after {
    content: '';
    position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.028;
    pointer-events: none;
    z-index: 9997;
  }

  /* Custom cursor */
  .c-dot {
    position: fixed; width: 7px; height: 7px;
    background: #7c3aed; border-radius: 50%;
    pointer-events: none; z-index: 10000;
    transform: translate(-50%,-50%);
    transition: background .2s, transform .1s;
    will-change: left, top;
  }
  .c-ring {
    position: fixed; width: 32px; height: 32px;
    border: 1.5px solid rgba(124,58,237,.5);
    border-radius: 50%;
    pointer-events: none; z-index: 10000;
    transform: translate(-50%,-50%);
    transition: width .22s, height .22s, border-color .22s;
    will-change: left, top;
  }
  .c-ring.big { width: 56px; height: 56px; border-color: rgba(124,58,237,.25); }
  body * { cursor: none !important; }

  /* Typography */
  .d { font-family: 'Space Grotesk', sans-serif; font-weight: 700; letter-spacing: -.03em; line-height: 1.0; }

  /* Reveal on scroll */
  .rv { opacity: 0; transform: translateY(44px); transition: opacity .85s cubic-bezier(.22,1,.36,1), transform .85s cubic-bezier(.22,1,.36,1); }
  .rv.in { opacity: 1; transform: none; }
  .rv.lft { transform: translateX(-50px); }  .rv.lft.in { transform: none; }
  .rv.rgt { transform: translateX(50px); }   .rv.rgt.in { transform: none; }
  .rv.scl { transform: scale(.9); }          .rv.scl.in { transform: scale(1); }
  .rv.d1{transition-delay:.08s} .rv.d2{transition-delay:.16s} .rv.d3{transition-delay:.24s}
  .rv.d4{transition-delay:.32s} .rv.d5{transition-delay:.40s} .rv.d6{transition-delay:.48s}

  /* Marquee */
  @keyframes mq { from{transform:translateX(0)} to{transform:translateX(-50%)} }

  /* Shimmer */
  .sh {
    background: linear-gradient(90deg,#c4b5fd 0%,#f59e0b 40%,#a78bfa 70%,#f59e0b 100%);
    background-size: 300% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: shim 5s linear infinite;
  }
  @keyframes shim { to{background-position:300% center} }

  /* Float */
  @keyframes fl0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes fl1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fl2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }

  /* Pulse glow */
  @keyframes pglow { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.5)} 50%{box-shadow:0 0 0 14px rgba(124,58,237,0)} }

  /* Orb blobs */
  @keyframes ob0 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(80px,-60px) scale(1.1)} 70%{transform:translate(-40px,80px) scale(.95)} }
  @keyframes ob1 { 0%,100%{transform:translate(0,0) scale(1)} 35%{transform:translate(-70px,40px) scale(1.08)} 65%{transform:translate(60px,-70px) scale(1.05)} }

  /* Line blink */
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

  /* Responsive */
  @media(max-width:900px){
    .h-grid{flex-direction:column!important}
    .h-3d{width:100%!important;height:55vw!important;min-height:260px!important;margin-top:24px!important}
    .f-row{flex-direction:column!important;gap:48px!important}
    .f-row.rev{flex-direction:column!important}
    .p-grid{flex-direction:column!important}
    .t-grid{grid-template-columns:1fr!important}
    .s-grid{grid-template-columns:1fr 1fr!important}
    body{cursor:auto!important}
    body *{cursor:auto!important}
    .c-dot,.c-ring{display:none!important}
  }
  @media(max-width:580px){
    .s-grid{grid-template-columns:1fr 1fr!important}
    .hide-xs{display:none!important}
  }
`;

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════════════════════════ */
function Cursor() {
  const dot  = useRef();
  const ring = useRef();
  useEffect(() => {
    let rx = 0, ry = 0;
    const move = e => {
      const x = e.clientX, y = e.clientY;
      if (dot.current)  { dot.current.style.left  = x + "px"; dot.current.style.top  = y + "px"; }
      rx += (x - rx) * 0.12;
      ry += (y - ry) * 0.12;
      if (ring.current) { ring.current.style.left = rx + "px"; ring.current.style.top = ry + "px"; }
    };
    const raf = () => { requestAnimationFrame(raf); };
    // smooth ring via rAF
    let rafId;
    const smooth = () => {
      rafId = requestAnimationFrame(smooth);
      if (ring.current) { ring.current.style.left = rx + "px"; ring.current.style.top = ry + "px"; }
    };
    const mmove = e => {
      const x = e.clientX, y = e.clientY;
      if (dot.current) { dot.current.style.left = x + "px"; dot.current.style.top = y + "px"; }
      rx += (x - rx) * 0.15; ry += (y - ry) * 0.15;
    };
    window.addEventListener("mousemove", mmove, { passive:true });
    smooth();
    const over = () => ring.current?.classList.add("big");
    const out  = () => ring.current?.classList.remove("big");
    document.querySelectorAll("a,button").forEach(el => { el.addEventListener("mouseenter",over); el.addEventListener("mouseleave",out); });
    return () => { window.removeEventListener("mousemove",mmove); cancelAnimationFrame(rafId); };
  }, []);
  return (
    <>
      <div ref={dot}  className="c-dot"  style={{ left:"-100px", top:"-100px" }}/>
      <div ref={ring} className="c-ring" style={{ left:"-100px", top:"-100px" }}/>
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL HOOK
═══════════════════════════════════════════════════════ */
function useReveal(ref) {
  useEffect(() => {
    if (!ref?.current) return;
    const els = ref.current.querySelectorAll(".rv");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); }});
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ═══════════════════════════════════════════════════════
   STAT COUNTER
═══════════════════════════════════════════════════════ */
function Counter({ to, suffix="" }) {
  const [v, setV] = useState(0);
  const ref = useRef(); const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;
      const isFloat = to % 1 !== 0, dur = 2200, t0 = performance.now();
      const tick = t => {
        const p = Math.min((t - t0)/dur, 1), e = 1 - Math.pow(1-p,3);
        setV(isFloat ? +(to*e).toFixed(1) : Math.round(to*e));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold:.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   THREE.JS 3D CENTERPIECE
═══════════════════════════════════════════════════════ */
function GemObject() {
  const mount = useRef();
  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let W = el.clientWidth, H = el.clientHeight;
    if (!W || !H) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(42, W/H, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    /* ── Main gem: icosahedron detail=1 → 80 faces, nice faceted look ── */
    const geoIco = new THREE.IcosahedronGeometry(2.9, 1);
    const matIco = new THREE.MeshPhysicalMaterial({
      color:           0x2e0b6e,
      emissive:        0x16043d,
      emissiveIntensity: 0.6,
      metalness:       0.94,
      roughness:       0.06,
      envMapIntensity: 1.5,
    });
    const gem = new THREE.Mesh(geoIco, matIco);
    scene.add(gem);

    /* Wireframe edges */
    const edgeMat = new THREE.LineBasicMaterial({ color:0x8b5cf6, transparent:true, opacity:.5 });
    gem.add(new THREE.LineSegments(new THREE.EdgesGeometry(geoIco), edgeMat));

    /* Inner glow core */
    const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const coreMat = new THREE.MeshBasicMaterial({ color:0x5b21b6, transparent:true, opacity:.12 });
    gem.add(new THREE.Mesh(coreGeo, coreMat));

    /* Outer glow shell */
    const shellGeo = new THREE.IcosahedronGeometry(3.3, 1);
    const shellMat = new THREE.MeshBasicMaterial({ color:0x6d28d9, transparent:true, opacity:.04, side:THREE.BackSide });
    scene.add(new THREE.Mesh(shellGeo, shellMat));

    /* ── Orbiting particles ── */
    const dots = [];
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(i%3===0 ? .1 : .07, 8, 8),
        new THREE.MeshBasicMaterial({ color: i%3===0 ? 0xf59e0b : i%3===1 ? 0xa78bfa : 0xfbbf24 })
      );
      const r = 3.8 + Math.random() * .7;
      const a = (i/8) * Math.PI * 2;
      m.userData = { r, a, spd: .003+Math.random()*.004, yi: (Math.random()-.5)*2.4 };
      scene.add(m); dots.push(m);
    }

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffffff, .12));

    const goldL  = new THREE.PointLight(0xf59e0b, 7, 22);
    scene.add(goldL);

    const purpL  = new THREE.PointLight(0x7c3aed, 5, 18);
    purpL.position.set(-6, 1, 3);
    scene.add(purpL);

    const rimL   = new THREE.DirectionalLight(0xffffff, .9);
    rimL.position.set(2, 6, -4);
    scene.add(rimL);

    const tealL  = new THREE.PointLight(0x06b6d4, 2, 14);
    tealL.position.set(0, -5, 2);
    scene.add(tealL);

    /* ── Mouse parallax ── */
    let mx = 0, my = 0;
    const onMouse = e => {
      mx = (e.clientX/innerWidth  - .5) * 2;
      my = (e.clientY/innerHeight - .5) * 2;
    };
    window.addEventListener("mousemove", onMouse, { passive:true });

    /* ── Animate ── */
    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      gem.rotation.y += .0035 + Math.abs(mx) * .002;
      gem.rotation.x  = Math.sin(t * .28) * .13 + my * .07;
      gem.rotation.z  = Math.sin(t * .19) * .06;

      /* Orbit gold light → creates moving reflections across gem faces */
      goldL.position.set(
        Math.cos(t * .45) * 8,
        Math.sin(t * .32) * 4,
        Math.sin(t * .45) * 8
      );
      purpL.position.set(
        Math.cos(t * .28 + Math.PI) * 6,
        Math.sin(t * .22) * 3,
        Math.sin(t * .28 + Math.PI) * 6
      );

      /* Orbit dots */
      dots.forEach(d => {
        d.userData.a += d.userData.spd;
        const { r, a, yi } = d.userData;
        d.position.set(
          Math.cos(a) * r,
          yi + Math.sin(a * .9) * .6,
          Math.sin(a) * r
        );
      });

      /* Camera parallax */
      camera.position.x += (mx * .9 - camera.position.x) * .04;
      camera.position.y += (-my * .6 - camera.position.y) * .04;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      W = el.clientWidth; H = el.clientHeight;
      if (!W || !H) return;
      camera.aspect = W/H; camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} style={{ position:"absolute", inset:0 }}/>;
}

/* ═══════════════════════════════════════════════════════
   NAVBAR
═══════════════════════════════════════════════════════ */
function Navbar({ onDemo }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:1000,
      height:66, padding:"0 clamp(20px,5%,80px)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
      background: scrolled ? "rgba(6,3,15,.88)" : "transparent",
      backdropFilter: scrolled ? "blur(18px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,.06)" : "none",
      transition:"all .35s ease",
    }}>
      {/* Logo */}
      <a href="#" style={{ display:"flex", alignItems:"center", gap:10 }}>
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
          <rect width="34" height="34" rx="9" fill="#7c3aed"/>
          <path d="M8 20 Q17 9 26 20" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
          <path d="M5 22 Q17 13 29 22" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <rect x="15" y="19" width="4" height="9" rx="1.5" fill="white"/>
          <rect x="11.5" y="22" width="11" height="4.5" rx="1.5" fill="white"/>
        </svg>
        <span className="d" style={{ fontSize:16, color:"#fff", letterSpacing:"-.02em" }}>Cowboy <span style={{ color:"#f59e0b" }}>EHR</span></span>
      </a>

      {/* Links */}
      <div className="hide-xs" style={{ display:"flex", gap:32 }}>
        {["Features","Pricing","About"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,.6)", transition:"color .2s" }}
            onMouseEnter={e=>e.currentTarget.style.color="#fff"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.6)"}
          >{l}</a>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <a href="#" className="hide-xs" style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,.55)", padding:"7px 16px" }}>Log in</a>
        <button onClick={onDemo} className="btn-gold" style={{ padding:"9px 22px", fontSize:13, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, background:"#f59e0b", color:"#0f0820", border:"none", borderRadius:8, boxShadow:"0 2px 18px rgba(245,158,11,.4)", transition:"transform .15s,box-shadow .15s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow="0 6px 26px rgba(245,158,11,.55)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 18px rgba(245,158,11,.4)";}}
        >Get Started →</button>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════ */
function Hero({ onDemo }) {
  return (
    <section style={{ position:"relative", minHeight:"100vh", background:"#06030f", overflow:"hidden", display:"flex", alignItems:"center", paddingTop:66 }}>
      {/* Ambient blobs */}
      <div style={{ position:"absolute", top:"15%", left:"2%",  width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(109,40,217,.22) 0%,transparent 65%)", filter:"blur(70px)", animation:"ob0 20s ease-in-out infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:"0%", right:"5%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(245,158,11,.13) 0%,transparent 65%)", filter:"blur(80px)", animation:"ob1 25s ease-in-out infinite", pointerEvents:"none" }}/>

      <div className="h-grid" style={{ display:"flex", alignItems:"center", gap:"clamp(32px,4vw,60px)", width:"100%", maxWidth:1340, margin:"0 auto", padding:"80px clamp(20px,5%,80px) 60px" }}>
        {/* LEFT */}
        <div style={{ flex:"0 0 48%", minWidth:0 }}>
          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,.15)", border:"1px solid rgba(139,92,246,.3)", borderRadius:99, padding:"7px 16px", marginBottom:32, animation:"fadeIn .6s ease both" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#f59e0b", boxShadow:"0 0 8px #f59e0b", animation:"blink 2s ease infinite" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:"rgba(196,181,253,.85)", letterSpacing:.5 }}>Availity billing · Live now</span>
          </div>

          {/* Headline */}
          <h1 className="d" style={{ fontSize:"clamp(46px,5.5vw,82px)", color:"#fff", marginBottom:24, animation:"fadeUp .8s .1s ease both" }}>
            Healthcare<br/>Records.<br/><span className="sh">Finally Human.</span>
          </h1>

          <p style={{ fontSize:"clamp(15px,1.5vw,18px)", color:"rgba(255,255,255,.55)", lineHeight:1.75, maxWidth:480, marginBottom:40, fontWeight:400, animation:"fadeUp .8s .2s ease both" }}>
            Scheduling, documentation, home exercise programs, and Availity-connected billing — one platform built for physical therapy and sports medicine clinics.
          </p>

          {/* CTAs */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:14, marginBottom:52, animation:"fadeUp .8s .3s ease both" }}>
            <button onClick={onDemo} style={{ padding:"15px 34px", fontSize:15, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, background:"#f59e0b", color:"#0f0820", border:"none", borderRadius:11, boxShadow:"0 4px 28px rgba(245,158,11,.5)", transition:"transform .2s,box-shadow .2s", animation:"pglow 2.5s ease-out infinite" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 38px rgba(245,158,11,.65)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 28px rgba(245,158,11,.5)";}}
            >Start Free Trial →</button>
            <a href="#features" style={{ padding:"15px 28px", fontSize:15, fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, color:"rgba(255,255,255,.8)", border:"1.5px solid rgba(255,255,255,.18)", borderRadius:11, background:"rgba(255,255,255,.04)", backdropFilter:"blur(8px)", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.4)";e.currentTarget.style.background="rgba(255,255,255,.08)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.18)";e.currentTarget.style.background="rgba(255,255,255,.04)";}}
            >See how it works</a>
          </div>

          {/* Trust row */}
          <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", animation:"fadeUp .8s .4s ease both" }}>
            <div style={{ display:"flex" }}>
              {["#7c3aed","#f59e0b","#e11d48","#16a34a"].map((c,i)=>(
                <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:c, border:"2px solid #06030f", marginLeft:i?-8:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#fff" }}>
                  {["PT","MD","DO","NP"][i]}
                </div>
              ))}
            </div>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.4)" }}>Trusted by <strong style={{ color:"rgba(255,255,255,.7)" }}>200+</strong> providers</span>
            <div style={{ display:"flex", gap:2 }}>{Array(5).fill(0).map((_,i)=><span key={i} style={{ color:"#f59e0b",fontSize:14 }}>★</span>)}</div>
          </div>
        </div>

        {/* RIGHT — 3D GEM */}
        <div className="h-3d" style={{ flex:"0 0 52%", position:"relative", height:"clamp(380px,55vh,620px)", minWidth:0 }}>
          {/* Purple glow behind gem */}
          <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"90%", height:"80%", borderRadius:"50%", background:"radial-gradient(circle,rgba(109,40,217,.35) 0%,transparent 70%)", filter:"blur(50px)", pointerEvents:"none" }}/>
          <GemObject/>
          {/* Floating stat chips */}
          <div style={{ position:"absolute", top:"12%", left:"4%", background:"rgba(255,255,255,.08)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,.12)", borderRadius:12, padding:"11px 18px", animation:"fl0 4s ease-in-out infinite" }}>
            <div style={{ fontSize:10, color:"rgba(196,181,253,.7)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase", marginBottom:3 }}>Next appointment</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#fff", fontFamily:"'Space Grotesk',sans-serif" }}>Today 2:30 PM</div>
          </div>
          <div style={{ position:"absolute", bottom:"16%", right:"3%", background:"rgba(255,255,255,.08)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,.12)", borderRadius:12, padding:"11px 18px", animation:"fl1 3.5s .8s ease-in-out infinite" }}>
            <div style={{ fontSize:10, color:"rgba(74,222,128,.7)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase", marginBottom:3 }}>Claim status</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#4ade80", fontFamily:"'Space Grotesk',sans-serif" }}>✓ Accepted</div>
          </div>
          <div style={{ position:"absolute", top:"52%", right:"1%", transform:"translateY(-50%)", background:"rgba(245,158,11,.12)", backdropFilter:"blur(16px)", border:"1px solid rgba(245,158,11,.22)", borderRadius:12, padding:"11px 18px", animation:"fl2 4.8s .4s ease-in-out infinite" }}>
            <div style={{ fontSize:10, color:"rgba(251,191,36,.7)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase", marginBottom:3 }}>HEP completed</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#fbbf24", fontFamily:"'Space Grotesk',sans-serif" }}>6 / 6 exercises</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:8, opacity:.35 }}>
        <span style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", color:"#fff", fontWeight:600 }}>Scroll</span>
        <div style={{ width:1, height:36, background:"linear-gradient(to bottom,rgba(255,255,255,.9),transparent)" }}/>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   MARQUEE
═══════════════════════════════════════════════════════ */
function Marquee() {
  const items = ["Smart Scheduling","Patient Portal","HEP Builder","Availity Billing","Real-time Sync","Treatment Plans","HIPAA Ready","CMS-1500","Outcome Tracking","Medication Management","Sports Medicine","Physical Therapy"];
  const doubled = [...items, ...items];
  return (
    <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", borderBottom:"1px solid rgba(255,255,255,.07)", background:"#06030f", padding:"18px 0", overflow:"hidden", whiteSpace:"nowrap" }}>
      <div style={{ display:"inline-flex", animation:"mq 28s linear infinite" }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:20, paddingRight:56, fontSize:13, fontWeight:600, color:"rgba(255,255,255,.28)", letterSpacing:.3 }}>
            <span style={{ width:4, height:4, borderRadius:"50%", background: i%3===0?"#f59e0b":"#7c3aed", display:"inline-block", flexShrink:0 }}/>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES (large alternating sections)
═══════════════════════════════════════════════════════ */
function FeatureRow({ n, tag, title, desc, points, mockup, reverse, delay=0 }) {
  const ref = useRef(); useReveal(ref);
  return (
    <div ref={ref} style={{ padding:"100px clamp(20px,5%,80px)", borderBottom:"1px solid rgba(255,255,255,.05)", position:"relative", overflow:"hidden" }}>
      {/* Ghost number */}
      <div className="d" style={{ position:"absolute", top:"50%", [reverse?"right":"left"]:"clamp(10px,3%,48px)", transform:"translateY(-50%)", fontSize:"clamp(120px,15vw,220px)", fontWeight:900, color:"rgba(255,255,255,.025)", lineHeight:1, pointerEvents:"none", userSelect:"none" }}>{n}</div>

      <div className={`f-row ${reverse?"rev":""}`} style={{ display:"flex", flexDirection: reverse?"row-reverse":"row", gap:"clamp(40px,6vw,100px)", alignItems:"center", maxWidth:1200, margin:"0 auto", position:"relative", zIndex:1 }}>
        {/* Text */}
        <div style={{ flex:"0 0 44%" }}>
          <div className={`rv d${delay}`} style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", borderRadius:99, padding:"5px 14px", marginBottom:20 }}>
            <span style={{ fontSize:11, fontWeight:700, color:"#a78bfa", letterSpacing:1, textTransform:"uppercase" }}>{tag}</span>
          </div>
          <h2 className={`d rv d${delay+1}`} style={{ fontSize:"clamp(30px,3.5vw,52px)", color:"#fff", marginBottom:20, lineHeight:1.08 }}>{title}</h2>
          <p className={`rv d${delay+2}`} style={{ fontSize:16, color:"rgba(255,255,255,.5)", lineHeight:1.8, marginBottom:28 }}>{desc}</p>
          <ul className={`rv d${delay+3}`} style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
            {points.map(p => (
              <li key={p} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:14, color:"rgba(255,255,255,.65)" }}>
                <span style={{ width:18, height:18, borderRadius:"50%", background:"rgba(124,58,237,.25)", border:"1.5px solid rgba(139,92,246,.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, fontSize:10, color:"#a78bfa" }}>✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Mockup */}
        <div className={`rv scl d${delay+1}`} style={{ flex:"0 0 52%", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, overflow:"hidden", boxShadow:"0 30px 80px rgba(0,0,0,.5)", backdropFilter:"blur(4px)" }}>
          {/* Browser chrome */}
          <div style={{ background:"rgba(0,0,0,.35)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid rgba(255,255,255,.06)" }}>
            <div style={{ display:"flex", gap:5 }}>
              {["#ff5f57","#febc2e","#28c840"].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:c }}/>)}
            </div>
            <div style={{ flex:1, background:"rgba(255,255,255,.06)", borderRadius:5, padding:"4px 12px", fontSize:11, color:"rgba(255,255,255,.3)", fontFamily:"monospace" }}>app.cowboyehr.com</div>
          </div>
          {mockup}
        </div>
      </div>
    </div>
  );
}

/* Mockup: Scheduling */
const ScheduleMockup = (
  <div style={{ padding:"24px", minHeight:300 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
      <div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:1, textTransform:"uppercase" }}>Thursday</div>
        <div className="d" style={{ fontSize:22, color:"#fff" }}>May 28, 2026</div>
      </div>
      <div style={{ padding:"7px 14px", background:"#f59e0b", color:"#0f0820", borderRadius:7, fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>+ Book Slot</div>
    </div>
    {/* Available slot grid */}
    <div style={{ marginBottom:14 }}>
      <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:.8, textTransform:"uppercase", marginBottom:10 }}>Available today</div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
        {["9:00","9:30","10:00","11:30","1:00","1:30","2:30","3:30","4:00"].map(t=>(
          <div key={t} style={{ padding:"7px 12px", borderRadius:8, background:t==="2:30"?"#7c3aed":"rgba(255,255,255,.06)", border:`1px solid ${t==="2:30"?"#7c3aed":"rgba(255,255,255,.1)"}`, fontSize:12, fontWeight:600, color:t==="2:30"?"#fff":"rgba(255,255,255,.55)" }}>{t}</div>
        ))}
      </div>
    </div>
    {/* Upcoming */}
    {[{t:"2:30 PM",n:"Alex R.",type:"Initial Eval",c:"#4ade80"},{t:"3:30 PM",n:"Maria S.",type:"Follow-Up",c:"#a78bfa"}].map(a=>(
      <div key={a.t} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:10, marginBottom:8 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.4)", width:52, flexShrink:0 }}>{a.t}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{a.n}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{a.type}</div>
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:a.c, background:`${a.c}18`, borderRadius:5, padding:"3px 9px" }}>Confirmed</div>
      </div>
    ))}
  </div>
);

/* Mockup: HEP */
const HEPMockup = (
  <div style={{ padding:"24px", minHeight:300 }}>
    <div style={{ marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <div className="d" style={{ fontSize:18, color:"#fff" }}>Home Exercise Program</div>
      <span style={{ fontSize:11, fontWeight:700, color:"#4ade80", background:"rgba(74,222,128,.12)", borderRadius:6, padding:"3px 10px" }}>4/6 done today</span>
    </div>
    {/* Progress bar */}
    <div style={{ height:5, background:"rgba(255,255,255,.08)", borderRadius:99, marginBottom:20, overflow:"hidden" }}>
      <div style={{ height:"100%", width:"66%", background:"linear-gradient(90deg,#7c3aed,#4ade80)", borderRadius:99 }}/>
    </div>
    {[
      {name:"Quad Sets", region:"Knee", done:true, s:3, r:10},
      {name:"Straight Leg Raises", region:"Hip/Knee", done:true, s:3, r:15},
      {name:"Clamshells", region:"Hip", done:false, s:3, r:15},
    ].map(ex=>(
      <div key={ex.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:ex.done?"rgba(74,222,128,.06)":"rgba(255,255,255,.04)", border:`1px solid ${ex.done?"rgba(74,222,128,.2)":"rgba(255,255,255,.08)"}`, borderRadius:10, marginBottom:8 }}>
        <div style={{ width:22, height:22, borderRadius:"50%", background:ex.done?"#16a34a":"rgba(124,58,237,.3)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {ex.done ? <span style={{ fontSize:11, color:"#fff" }}>✓</span> : <span style={{ fontSize:9, color:"#a78bfa" }}>○</span>}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#fff", textDecoration:ex.done?"line-through":"none", opacity:ex.done?.65:1 }}>{ex.name}</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>🎯 {ex.region} · {ex.s} sets × {ex.r} reps</div>
        </div>
        <a href="#" style={{ fontSize:10, fontWeight:700, color:"#a78bfa", background:"rgba(124,58,237,.12)", borderRadius:5, padding:"3px 8px", textDecoration:"none" }}>▶ Demo</a>
      </div>
    ))}
    <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:"rgba(255,255,255,.2)", fontWeight:500 }}>2 more exercises below</div>
  </div>
);

/* Mockup: Billing */
const BillingMockup = (
  <div style={{ padding:"24px", minHeight:300 }}>
    <div className="d" style={{ fontSize:18, color:"#fff", marginBottom:16 }}>Billing Dashboard</div>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:18 }}>
      {[{label:"This Month",val:"$12,480",c:"#fff"},{label:"Outstanding",val:"$1,820",c:"#f59e0b"},{label:"Claim Rate",val:"98%",c:"#4ade80"}].map(s=>(
        <div key={s.label} style={{ background:"rgba(255,255,255,.05)", borderRadius:10, padding:"12px" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", fontWeight:600, letterSpacing:.5, textTransform:"uppercase", marginBottom:5 }}>{s.label}</div>
          <div className="d" style={{ fontSize:20, color:s.c }}>{s.val}</div>
        </div>
      ))}
    </div>
    {[
      {name:"Alex R.", ins:"BlueCross", amt:"$180", status:"Accepted", c:"#4ade80"},
      {name:"Maria S.", ins:"Aetna", amt:"$240", status:"Pending", c:"#f59e0b"},
      {name:"James T.", ins:"Medicare", amt:"$120", status:"Accepted", c:"#4ade80"},
    ].map(r=>(
      <div key={r.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.07)", borderRadius:9, marginBottom:7 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#fff", flex:1 }}>{r.name}</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>{r.ins}</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginLeft:"auto" }}>{r.amt}</div>
        <div style={{ fontSize:10, fontWeight:700, color:r.c, background:`${r.c}18`, borderRadius:5, padding:"3px 9px" }}>{r.status}</div>
      </div>
    ))}
    <div style={{ marginTop:12, padding:"9px 14px", background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:9, fontSize:12, color:"rgba(245,158,11,.8)", fontWeight:500 }}>
      ⚡ Availity connected · Claims submit automatically
    </div>
  </div>
);

function Features() {
  return (
    <section id="features" style={{ background:"#06030f" }}>
      <div style={{ padding:"80px clamp(20px,5%,80px) 40px", maxWidth:1200, margin:"0 auto", textAlign:"center" }}>
        <p style={{ fontSize:12, fontWeight:700, color:"#7c3aed", letterSpacing:2, textTransform:"uppercase", marginBottom:16 }}>Platform</p>
        <h2 className="d" style={{ fontSize:"clamp(32px,4vw,58px)", color:"#fff", marginBottom:16 }}>Built end-to-end.<br/><span className="sh">Nothing bolted on.</span></h2>
        <p style={{ fontSize:17, color:"rgba(255,255,255,.45)", maxWidth:520, margin:"0 auto" }}>
          Every feature was built specifically for physical therapy and sports medicine — not adapted from a general EHR.
        </p>
      </div>
      <FeatureRow n="01" tag="Scheduling" title="Real slots. Real availability." desc="Patients choose from genuinely open time slots and book directly — no request forms, no phone calls, no confirmation limbo." points={["Live availability grid","No double-booking, ever","Patients get instant confirmation","Reminders sent automatically"]} mockup={ScheduleMockup} reverse={false} delay={1}/>
      <FeatureRow n="02" tag="Home Exercise Programs" title="HEPs patients actually follow." desc="Assign personalised exercise programs with body-region diagrams and demo video links. Patients track daily completion in their portal — you see it in real time." points={["100+ exercises with body diagrams","Video demo links per exercise","Daily completion tracking","Auto-adjusts as patient progresses"]} mockup={HEPMockup} reverse={true} delay={1}/>
      <FeatureRow n="03" tag="Billing & Claims" title="Connected to Availity. Done." desc="CMS-1500 generation and direct Availity claim submission. Track outstanding balances, monitor acceptance rates, and get paid faster." points={["Direct Availity REST API integration","CMS-1500 PDF export","Real-time claim status tracking","Outstanding balance dashboard"]} mockup={BillingMockup} reverse={false} delay={1}/>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   STATS
═══════════════════════════════════════════════════════ */
function Stats() {
  const ref = useRef(); useReveal(ref);
  const data = [
    { n:2400, suf:"+", label:"Appointments booked" },
    { n:98,   suf:"%", label:"Claim acceptance rate" },
    { n:14,   suf:" days", label:"Average setup time" },
    { n:99.9, suf:"%", label:"Platform uptime" },
  ];
  return (
    <section ref={ref} style={{ padding:"100px clamp(20px,5%,80px)", background:"linear-gradient(135deg,#0f0522 0%,#06030f 60%,#0a0820 100%)", borderTop:"1px solid rgba(255,255,255,.06)", borderBottom:"1px solid rgba(255,255,255,.06)" }}>
      {/* Dot grid */}
      <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(124,58,237,.12) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none" }}/>
      <div className="s-grid" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:40, position:"relative", zIndex:1 }}>
        {data.map((d,i) => (
          <div key={d.label} className={`rv d${i+1}`} style={{ textAlign:"center" }}>
            <div className="d" style={{ fontSize:"clamp(44px,5vw,68px)", color:"#fff", marginBottom:10, letterSpacing:"-2px", textShadow:"0 0 50px rgba(124,58,237,.6)" }}>
              <Counter to={d.n} suffix={d.suf}/>
            </div>
            <div style={{ fontSize:14, color:"rgba(255,255,255,.4)", fontWeight:500, lineHeight:1.4 }}>{d.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════ */
function Testimonials() {
  const ref = useRef(); useReveal(ref);
  const tms = [
    { initials:"SM", color:"#7c3aed", name:"Dr. Sarah M.", role:"Physical Therapist, TX",
      text:"Cowboy EHR replaced three separate apps. The HEP builder alone saves me an hour a day, and patients actually complete their exercises because the portal is so easy to use." },
    { initials:"JT", color:"#f59e0b", name:"Jake T.", role:"Clinic Owner, CO",
      text:"Appointment no-shows dropped 40% in our first month. Patients genuinely prefer getting a portal notification over a phone call from reception." },
    { initials:"PK", color:"#e11d48", name:"Dr. Priya K.", role:"Sports Medicine, AZ",
      text:"The Availity integration was seamless. We went from a 12% rejection rate to under 2%. The billing dashboard alone paid for the subscription in week one." },
  ];
  return (
    <section ref={ref} style={{ padding:"100px clamp(20px,5%,80px)", background:"#06030f" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <div className="rv" style={{ fontSize:32, marginBottom:14 }}>⭐⭐⭐⭐⭐</div>
          <h2 className={`d rv d1`} style={{ fontSize:"clamp(28px,3.5vw,48px)", color:"#fff", marginBottom:14 }}>Clinics love it</h2>
          <p className="rv d2" style={{ fontSize:16, color:"rgba(255,255,255,.4)", maxWidth:400, margin:"0 auto" }}>Real providers. Real results.</p>
        </div>
        <div className="t-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
          {tms.map((t,i) => (
            <div key={t.name} className={`rv d${i+1}`} style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:"30px 26px", display:"flex", flexDirection:"column", gap:18, transition:"transform .3s ease, border-color .3s ease" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.borderColor="rgba(124,58,237,.3)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor="rgba(255,255,255,.08)";}}
            >
              <div style={{ display:"flex", gap:3 }}>{Array(5).fill(0).map((_,j)=><span key={j} style={{ color:"#f59e0b",fontSize:13 }}>★</span>)}</div>
              <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", lineHeight:1.8, flex:1 }}>"{t.text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:12, borderTop:"1px solid rgba(255,255,255,.07)" }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background:t.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", flexShrink:0 }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#fff" }}>{t.name}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   PRICING
═══════════════════════════════════════════════════════ */
function Pricing({ onDemo }) {
  const ref = useRef(); useReveal(ref);
  return (
    <section id="pricing" ref={ref} style={{ padding:"100px clamp(20px,5%,80px)", background:"#06030f", borderTop:"1px solid rgba(255,255,255,.06)" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <p className="rv" style={{ fontSize:12, fontWeight:700, color:"#7c3aed", letterSpacing:2, textTransform:"uppercase", marginBottom:14 }}>Pricing</p>
          <h2 className="d rv d1" style={{ fontSize:"clamp(30px,4vw,54px)", color:"#fff", marginBottom:14 }}>One price. Everything included.</h2>
          <p className="rv d2" style={{ fontSize:16, color:"rgba(255,255,255,.4)", maxWidth:420, margin:"0 auto" }}>No per-patient fees. No feature gating. No surprises.</p>
        </div>
        <div className="p-grid rv d2" style={{ display:"flex", gap:20, alignItems:"start" }}>
          {/* CLINIC */}
          <div style={{ flex:1, background:"linear-gradient(145deg,#1e0a3c,#0d0920)", border:"1px solid rgba(124,58,237,.35)", borderRadius:24, padding:"40px 36px", position:"relative", boxShadow:"0 30px 80px rgba(76,29,149,.35)" }}>
            <div style={{ position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)", background:"#f59e0b", color:"#0f0820", fontSize:11, fontWeight:800, padding:"5px 20px", borderRadius:99, letterSpacing:.5, textTransform:"uppercase", boxShadow:"0 4px 18px rgba(245,158,11,.5)" }}>Most Popular</div>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(196,181,253,.7)", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>Clinic</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
              <span className="d" style={{ fontSize:58, color:"#fff", letterSpacing:"-2px", lineHeight:1 }}>$199</span>
              <span style={{ fontSize:14, color:"rgba(255,255,255,.4)" }}>/month</span>
            </div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.5)", marginBottom:28, lineHeight:1.6 }}>Everything a modern clinic needs. Up and running in under an hour.</p>
            <button onClick={onDemo} style={{ width:"100%", padding:"14px", fontSize:15, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, background:"#f59e0b", color:"#0f0820", border:"none", borderRadius:11, marginBottom:28, boxShadow:"0 4px 22px rgba(245,158,11,.4)", transition:"transform .2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e=>e.currentTarget.style.transform=""}
            >Start 14-Day Free Trial →</button>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:11 }}>
              {["Unlimited patients","5 provider accounts","Smart scheduling + patient portal","Home Exercise Program builder","Billing + Availity submission","Treatment plan tracking","Real-time sync across all devices","Email + chat support"].map(f=>(
                <li key={f} style={{ display:"flex", gap:10, fontSize:14, color:"rgba(255,255,255,.75)", alignItems:"flex-start" }}>
                  <span style={{ color:"#a78bfa", flexShrink:0, marginTop:2 }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
          {/* ENTERPRISE */}
          <div style={{ flex:1, background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.1)", borderRadius:24, padding:"40px 36px" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,.4)", letterSpacing:.5, textTransform:"uppercase", marginBottom:10 }}>Enterprise</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
              <span className="d" style={{ fontSize:48, color:"#fff", letterSpacing:"-1px", lineHeight:1 }}>Custom</span>
            </div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,.4)", marginBottom:28, lineHeight:1.6 }}>Multi-location groups and health systems with custom integration needs.</p>
            <button onClick={onDemo} style={{ width:"100%", padding:"14px", fontSize:15, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, background:"rgba(255,255,255,.08)", color:"#fff", border:"1.5px solid rgba(255,255,255,.2)", borderRadius:11, marginBottom:28, transition:"background .2s" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.14)"}
              onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
            >Contact Sales</button>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:11 }}>
              {["Everything in Clinic","Unlimited provider accounts","Multi-location management","White-label patient portal","Custom API integrations","Dedicated onboarding specialist","Priority SLA · 4hr response time","Custom reporting & analytics"].map(f=>(
                <li key={f} style={{ display:"flex", gap:10, fontSize:14, color:"rgba(255,255,255,.5)", alignItems:"flex-start" }}>
                  <span style={{ color:"rgba(255,255,255,.3)", flexShrink:0, marginTop:2 }}>✓</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="rv" style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,.25)", marginTop:22 }}>14-day free trial · No credit card required · Cancel anytime</p>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   CTA
═══════════════════════════════════════════════════════ */
function CTA({ onDemo }) {
  const [email, setEmail] = useState(""); const [sent, setSent] = useState(false);
  const ref = useRef(); useReveal(ref);
  return (
    <section ref={ref} style={{ padding:"120px clamp(20px,5%,80px)", background:"linear-gradient(160deg,#0f0522 0%,#06030f 100%)", textAlign:"center", position:"relative", overflow:"hidden", borderTop:"1px solid rgba(255,255,255,.06)" }}>
      <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 65%)", filter:"blur(80px)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", zIndex:1, maxWidth:620, margin:"0 auto" }}>
        <p className="rv" style={{ fontSize:12, fontWeight:700, color:"#a78bfa", letterSpacing:2, textTransform:"uppercase", marginBottom:20 }}>Get started today</p>
        <h2 className="d rv d1" style={{ fontSize:"clamp(34px,5vw,64px)", color:"#fff", marginBottom:18, lineHeight:1.0 }}>
          Your clinic deserves<br/><span className="sh">better software.</span>
        </h2>
        <p className="rv d2" style={{ fontSize:17, color:"rgba(255,255,255,.5)", lineHeight:1.75, marginBottom:42 }}>
          Join hundreds of providers on Cowboy EHR. Start your free trial — up and running the same day, no IT required.
        </p>
        {sent ? (
          <div className="rv d3" style={{ fontSize:18, fontWeight:700, color:"#4ade80" }}>🎉 We'll be in touch shortly!</div>
        ) : (
          <form className="rv d3" onSubmit={e=>{e.preventDefault();if(email)setSent(true);}} style={{ display:"flex", gap:10, maxWidth:480, margin:"0 auto", flexWrap:"wrap", justifyContent:"center" }}>
            <input type="email" required placeholder="Enter your clinic email" value={email} onChange={e=>setEmail(e.target.value)}
              style={{ flex:1, minWidth:200, padding:"14px 18px", borderRadius:10, border:"1.5px solid rgba(255,255,255,.15)", background:"rgba(255,255,255,.07)", color:"#fff", fontSize:14, outline:"none", fontFamily:"inherit", backdropFilter:"blur(8px)", transition:"border-color .2s" }}
              onFocus={e=>e.target.style.borderColor="rgba(124,58,237,.5)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.15)"}
            />
            <button type="submit" style={{ padding:"14px 28px", background:"#f59e0b", color:"#0f0820", border:"none", borderRadius:10, fontSize:14, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, whiteSpace:"nowrap", boxShadow:"0 4px 22px rgba(245,158,11,.45)", transition:"transform .2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
              onMouseLeave={e=>e.currentTarget.style.transform=""}
            >Start Free Trial →</button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer style={{ padding:"60px clamp(20px,5%,80px) 32px", background:"#030108", borderTop:"1px solid rgba(255,255,255,.06)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:40, marginBottom:48 }}>
          {/* Brand */}
          <div style={{ maxWidth:260 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <svg width="32" height="32" viewBox="0 0 34 34" fill="none">
                <rect width="34" height="34" rx="9" fill="#7c3aed"/>
                <path d="M8 20 Q17 9 26 20" stroke="white" strokeWidth="2.8" strokeLinecap="round" fill="none"/>
                <path d="M5 22 Q17 13 29 22" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <rect x="15" y="19" width="4" height="9" rx="1.5" fill="white"/>
                <rect x="11.5" y="22" width="11" height="4.5" rx="1.5" fill="white"/>
              </svg>
              <span className="d" style={{ fontSize:15, color:"#fff", letterSpacing:"-.02em" }}>Cowboy <span style={{ color:"#f59e0b" }}>EHR</span></span>
            </div>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.3)", lineHeight:1.8 }}>Modern electronic health records for physical therapy and sports medicine clinics.</p>
          </div>
          {/* Links */}
          {[
            { title:"Product",  links:["Features","Pricing","Security","Changelog"] },
            { title:"Resources",links:["Documentation","API Reference","Status","Support"] },
            { title:"Legal",    links:["Privacy Policy","Terms of Service","HIPAA BAA","Cookie Policy"] },
          ].map(col=>(
            <div key={col.title}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,.25)", letterSpacing:1.5, textTransform:"uppercase", marginBottom:16 }}>{col.title}</div>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
                {col.links.map(l=>(
                  <li key={l}><a href="#" style={{ fontSize:13, color:"rgba(255,255,255,.4)", transition:"color .2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                    onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.4)"}
                  >{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.06)", paddingTop:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>© {new Date().getFullYear()} Cowboy Healthcare, Inc. All rights reserved.</span>
          <div style={{ display:"flex", gap:8 }}>
            {["HIPAA","SOC 2","256-bit"].map(b=>(
              <span key={b} style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,.2)", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:4, padding:"3px 8px" }}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   DEMO MODAL
═══════════════════════════════════════════════════════ */
function DemoModal({ onClose }) {
  const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [clinic,setClinic]=useState(""); const [done,setDone]=useState(false);
  const submit=e=>{e.preventDefault();if(name&&email)setDone(true);};
  useEffect(()=>{ const k=e=>{if(e.key==="Escape")onClose();}; document.addEventListener("keydown",k); return()=>document.removeEventListener("keydown",k); },[onClose]);
  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,background:"rgba(3,1,8,.8)",backdropFilter:"blur(10px)" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#0e0820",border:"1px solid rgba(124,58,237,.3)",borderRadius:24,padding:42,maxWidth:440,width:"100%",boxShadow:"0 40px 100px rgba(0,0,0,.6)",position:"relative",animation:"scaleIn .3s ease" }}>
        {done ? (
          <div style={{ textAlign:"center",padding:"20px 0" }}>
            <div style={{ fontSize:52,marginBottom:18 }}>🎉</div>
            <h3 className="d" style={{ fontSize:24,color:"#fff",marginBottom:10 }}>You're on the list!</h3>
            <p style={{ fontSize:14,color:"rgba(255,255,255,.5)",lineHeight:1.7 }}>We'll reach out within 1 business day to set up your free trial.</p>
            <button onClick={onClose} style={{ marginTop:24,padding:"11px 28px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700 }}>Close</button>
          </div>
        ) : (
          <>
            <h3 className="d" style={{ fontSize:24,color:"#fff",marginBottom:6 }}>Start your free trial</h3>
            <p style={{ fontSize:14,color:"rgba(255,255,255,.45)",marginBottom:28,lineHeight:1.6 }}>14 days free. No credit card. Up and running the same day.</p>
            <form onSubmit={submit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {[[name,setName,"Your name","Dr. Jane Smith","text"],[email,setEmail,"Work email","jane@yourclinic.com","email"],[clinic,setClinic,"Clinic name","Smith Physical Therapy","text"]].map(([v,s,l,p,t])=>(
                <div key={l}>
                  <label style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,.5)",display:"block",marginBottom:6,letterSpacing:.3 }}>{l}</label>
                  <input type={t} placeholder={p} value={v} onChange={e=>s(e.target.value)} required={l!=="Clinic name"}
                    style={{ width:"100%",padding:"11px 14px",background:"rgba(255,255,255,.07)",border:"1.5px solid rgba(255,255,255,.12)",borderRadius:9,fontSize:14,color:"#fff",fontFamily:"inherit",outline:"none",transition:"border-color .2s" }}
                    onFocus={e=>e.target.style.borderColor="rgba(124,58,237,.5)"}
                    onBlur={e=>e.target.style.borderColor="rgba(255,255,255,.12)"}
                  />
                </div>
              ))}
              <button type="submit" style={{ padding:"13px",background:"linear-gradient(135deg,#6d28d9,#7c3aed)",color:"#fff",border:"none",borderRadius:10,fontSize:15,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,marginTop:4,boxShadow:"0 4px 18px rgba(124,58,237,.4)",transition:"transform .15s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                onMouseLeave={e=>e.currentTarget.style.transform=""}
              >Get Started Free →</button>
            </form>
            <button onClick={onClose} style={{ position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:20,color:"rgba(255,255,255,.3)",padding:6,lineHeight:1,transition:"color .2s" }}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.3)"}
            >✕</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════ */
export default function App() {
  const [showDemo, setShowDemo] = useState(false);

  /* Inject CSS once */
  useEffect(() => {
    const base = `
      @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes scaleIn { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
    `;
    const el = document.createElement("style");
    el.id = "ceh-global";
    el.textContent = GLOBAL + base;
    document.head.appendChild(el);
    return () => document.getElementById("ceh-global")?.remove();
  }, []);

  const open  = () => setShowDemo(true);
  const close = () => setShowDemo(false);

  return (
    <>
      <Cursor/>
      <Navbar  onDemo={open}/>
      <Hero    onDemo={open}/>
      <Marquee/>
      <Features/>
      <Stats/>
      <Testimonials/>
      <Pricing onDemo={open}/>
      <CTA     onDemo={open}/>
      <Footer/>
      {showDemo && <DemoModal onClose={close}/>}
    </>
  );
}
