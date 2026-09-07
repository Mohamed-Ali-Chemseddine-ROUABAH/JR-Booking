# AI SYSTEM DIRECTIVE
**CRITICAL INSTRUCTION FOR AI AGENT:** You (the AI) MUST always reference the design tokens, CSS variables, HTML classes, and visual direction contained in this file when building the user interface. You are strictly prohibited from inventing new colors, changing the layout structure, or deviating from this provided "instrument-grade monochrome glass" design system.

**STRICT STIPULATION ON ICONS:** NEVER use emojis in the UI. They are considered tacky for this project. Always use sleek, professional SVG icons instead.

**MOCKUP INTERACTION REFERENCE:** `docs/mockups/jr-booking-premium-mockup.html` is the approved interactive prototype. Before implementing any user-facing surface, read `docs/mockups/IMPLEMENTATION_REFERENCE.md` together with this file and `docs/requirements/MASTER_SPECIFICATION.md`. This file remains the binding source for visual tokens, typography, glass treatments, status language, and restrained composition. The mockup is the binding reference for currently approved interaction flows, role-specific visibility, responsive behavior, modals, menus, and local mock-data states. Do not copy its monolithic code into production: extract each behavior into the module ownership defined in the implementation reference and the master specification.

---

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>JR Booking premium â€” Visual Direction</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css">
<style>

/* ============================================================
   JR BOOKING premium â€” DESIGN TOKENS
   Direction: instrument-grade monochrome glass.
   Every hue is neutral graphite; the only "colour" move is
   contrast inversion on primary actions. Status is communicated
   through glass treatment (solid / dashed / hatched / dotted),
   never hue â€” this doubles as a colour-blind-safe system.
   ============================================================ */
:root{
  --void:       #07080a;
  --canvas:     #0c0e11;
  --panel:      rgba(244,245,247,0.055);
  --panel-brd:  rgba(244,245,247,0.14);
  --panel-brd-strong: rgba(244,245,247,0.24);
  --ghost:      rgba(244,245,247,0.022);
  --ghost-brd:  rgba(244,245,247,0.28);

  --ink-100:#F4F5F7;
  --ink-300:#C7CBD1;
  --ink-500:#8B909A;
  --ink-700:#4B505A;
  --hair:   rgba(244,245,247,0.09);

  --r-lg:20px;
  --r-md:13px;
  --r-sm:8px;
  --blur:20px;

  --font-display:'Space Grotesk',sans-serif;
  --font-body:'IBM Plex Sans',sans-serif;
  --font-mono:'IBM Plex Mono',monospace;
}

*{box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{
  margin:0;
  background:
    repeating-linear-gradient(180deg, rgba(244,245,247,0.035) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(90deg, rgba(244,245,247,0.022) 0 1px, transparent 1px 64px),
    radial-gradient(circle at 15% -10%, rgba(244,245,247,0.06), transparent 42%),
    radial-gradient(circle at 100% 0%, rgba(244,245,247,0.035), transparent 38%),
    linear-gradient(180deg,var(--void),var(--canvas) 60%);
  background-attachment:fixed;
  color:var(--ink-300);
  font-family:var(--font-body);
  -webkit-font-smoothing:antialiased;
  min-height:100vh;
}
::selection{background:var(--ink-100);color:var(--void);}
a{color:inherit;text-decoration:none;}
button{font-family:inherit;cursor:pointer;}
:focus-visible{outline:1.5px solid var(--ink-100);outline-offset:3px;border-radius:4px;}

.eyebrow{
  font-family:var(--font-mono);
  font-size:.68rem;
  letter-spacing:.18em;
  text-transform:uppercase;
  color:var(--ink-500);
}

/* ---------- glass primitives ---------- */
.glass{
  position:relative;
  background:var(--panel);
  border:1px solid var(--panel-brd);
  border-radius:var(--r-lg);
  backdrop-filter:blur(var(--blur)) saturate(140%);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(140%);
  box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 30px 60px -30px rgba(0,0,0,.7);
}
.glass::before{
  content:"";
  position:absolute; inset:0;
  border-radius:inherit;
  padding:1px;
  background:linear-gradient(135deg, rgba(255,255,255,.35), transparent 30%, transparent 70%, rgba(255,255,255,.08));
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;
  pointer-events:none;
}
.glass-ghost{
  background:var(--ghost);
  border:1px dashed var(--ghost-brd);
  border-radius:var(--r-md);
  backdrop-filter:blur(10px);
  -webkit-backdrop-filter:blur(10px);
}
.glass-ghost::before{content:none;}

/* ---------- preview switcher (mockup meta-nav, not product UI) ---------- */
.previewbar{
  position:fixed; top:16px; left:50%; transform:translateX(-50%);
  z-index:500;
  display:flex; align-items:center; gap:2px;
  padding:5px; border-radius:999px;
  background:rgba(12,14,17,.85);
  border:1px solid var(--panel-brd);
  backdrop-filter:blur(16px);
  box-shadow:0 20px 40px -20px rgba(0,0,0,.8);
}
.previewbar span.pb-label{
  font-family:var(--font-mono); font-size:.62rem; letter-spacing:.14em;
  color:var(--ink-700); text-transform:uppercase; padding:0 10px;
  border-right:1px solid var(--hair); margin-right:2px;
}
.pb-btn{
  border:none; background:transparent; color:var(--ink-500);
  font-family:var(--font-mono); font-size:.7rem; letter-spacing:.03em;
  padding:7px 14px; border-radius:999px; transition:.2s;
}
.pb-btn:hover{color:var(--ink-100);}
.pb-btn.is-active{background:var(--ink-100); color:var(--void); font-weight:600;}

/* ---------- screens ---------- */
.screen{display:none; min-height:100vh; padding:110px 0 80px;}
.screen.is-active{display:block; animation:riseIn .5s cubic-bezier(.16,.9,.3,1);}
@keyframes riseIn{from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);}}
@media (prefers-reduced-motion:reduce){.screen.is-active{animation:none;}}

.wrap{max-width:1200px; margin:0 auto; padding:0 28px;}

/* ============================================================
   PRODUCT NAVBAR
   ============================================================ */
.pnav{
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 22px; margin-bottom:0;
}
.brand{display:flex; align-items:center; gap:10px;}
.brand-mark{
  width:34px; height:34px; border-radius:9px;
  background:var(--ink-100); color:var(--void);
  display:flex; align-items:center; justify-content:center;
  font-family:var(--font-display); font-weight:700; font-size:.95rem;
}
.brand-word{font-family:var(--font-display); font-size:1.02rem; color:var(--ink-100); font-weight:600; letter-spacing:-.01em;}
.brand-word small{display:block; font-family:var(--font-mono); font-size:.6rem; letter-spacing:.16em; color:var(--ink-500); font-weight:400; margin-top:1px;}

.nav-right{display:flex; align-items:center; gap:10px; position:relative;}
.nav-user{
  display:flex; align-items:center; gap:9px;
  padding:8px 14px; border-radius:999px;
  font-family:var(--font-mono); font-size:.78rem; color:var(--ink-300);
}
.nav-user .dot{width:6px;height:6px;border-radius:50%;background:var(--ink-100);}
.nav-user svg{width:13px;transition:.2s; opacity:.6;}
.nav-user.open svg{transform:rotate(180deg);}
.nav-logout{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--ink-500);}
.nav-logout:hover{color:var(--ink-100);}

.dropdown-glass{
  position:absolute; top:52px; right:0; width:268px;
  padding:8px; z-index:80;
  display:none; flex-direction:column; gap:1px;
}
.dropdown-glass.open{display:flex;}
.ddi{
  display:flex; align-items:center; justify-content:space-between;
  padding:11px 13px; border-radius:var(--r-sm);
  font-size:.86rem; color:var(--ink-300);
}
.ddi:hover{background:rgba(244,245,247,.06); color:var(--ink-100);}
.ddi .tag-mini{font-family:var(--font-mono); font-size:.62rem; color:var(--ink-700);}

/* ============================================================
   LANDING â€” deliberately near-empty. Search + one quiet link.
   ============================================================ */
.hero{
  min-height:78vh; display:flex; flex-direction:column;
  align-items:center; justify-content:center; text-align:center;
  gap:26px; padding:0 20px;
}
.hero .eyebrow{margin-bottom:-8px;}
.hero h1{
  font-family:var(--font-display); font-weight:600;
  font-size:clamp(1.9rem,4.2vw,3.1rem);
  color:var(--ink-100); letter-spacing:-.02em; line-height:1.15;
  max-width:16ch; margin:0;
}
.search-pill{
  width:min(560px,88vw); display:flex; align-items:center; gap:12px;
  padding:17px 22px; border-radius:999px; margin-top:6px;
}
.search-pill svg{width:17px; opacity:.55; flex-shrink:0;}
.search-pill input{
  border:none; background:transparent; outline:none; width:100%;
  color:var(--ink-100); font-family:var(--font-body); font-size:.95rem;
}
.search-pill input::placeholder{color:var(--ink-700);}
.hero-foot{display:flex; align-items:center; gap:8px; font-size:.85rem; color:var(--ink-700); margin-top:2px;}
.hero-foot a{color:var(--ink-500); border-bottom:1px dashed var(--ink-700); padding-bottom:1px; transition:.2s;}
.hero-foot a:hover{color:var(--ink-100); border-color:var(--ink-100);}

/* ============================================================
   BUTTONS
   ============================================================ */
.btn{
  font-family:var(--font-body); font-weight:600; font-size:.85rem;
  padding:11px 20px; border-radius:999px; border:none;
  display:inline-flex; align-items:center; gap:8px;
  transition:.2s; position:relative; overflow:hidden;
}
.btn-solid{background:var(--ink-100); color:var(--void);}
.btn-solid:hover{transform:translateY(-1px); box-shadow:0 12px 24px -10px rgba(244,245,247,.35);}
.btn-solid::after{
  content:""; position:absolute; inset:0; border-radius:inherit;
  background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,.65) 45%, transparent 60%);
  transform:translateX(-120%); transition:transform .6s ease;
}
.btn-solid:hover::after{transform:translateX(120%);}
.btn-ghost{background:transparent; color:var(--ink-300); border:1px dashed var(--panel-brd-strong);}
.btn-ghost:hover{color:var(--ink-100); border-color:var(--ink-100);}
.btn-icon{width:36px;height:36px;padding:0;justify-content:center;border-radius:10px;background:var(--panel);border:1px solid var(--panel-brd); color:var(--ink-500);}
.btn-icon:hover{color:var(--ink-100); border-color:var(--panel-brd-strong);}
.btn-icon svg{width:15px;}
.btn-sm{padding:7px 13px; font-size:.75rem;}

/* ============================================================
   DASHBOARD SHELL
   ============================================================ */
.dash-shell{display:grid; grid-template-columns:340px 1fr; gap:18px; align-items:start;}
.dash-shell.collapsed{grid-template-columns:0px 1fr;}
@media (max-width:980px){.dash-shell{grid-template-columns:1fr;}}

/* ---- sidebar / feed ---- */
.sidebar{padding:18px; display:flex; flex-direction:column; gap:14px; max-height:calc(100vh - 150px); overflow:auto;}
.sidebar-head{display:flex; align-items:center; justify-content:space-between;}
.sidebar-head h2{font-family:var(--font-display); font-size:1rem; color:var(--ink-100); margin:0; font-weight:600;}
.segmented{display:flex; gap:2px; padding:3px; border-radius:999px; background:rgba(0,0,0,.25); border:1px solid var(--hair);}
.seg-opt{border:none; background:transparent; color:var(--ink-500); font-family:var(--font-mono); font-size:.63rem; letter-spacing:.05em; padding:6px 11px; border-radius:999px;}
.seg-opt.is-active{background:var(--panel-brd-strong); color:var(--ink-100);}

.legend-mini{display:flex; flex-wrap:wrap; gap:10px; font-family:var(--font-mono); font-size:.62rem; color:var(--ink-700); padding-bottom:8px; border-bottom:1px solid var(--hair);}
.legend-mini span{display:flex; align-items:center; gap:5px;}
.legend-swatch{width:10px;height:10px;border-radius:3px;display:inline-block;}
.legend-swatch.acc{background:var(--panel); border:1px solid var(--panel-brd-strong);}
.legend-swatch.pen{background:var(--ghost); border:1px dashed var(--ghost-brd);}
.legend-swatch.rej{background:repeating-linear-gradient(135deg, rgba(244,245,247,.16) 0 2px, transparent 2px 6px); border:1px solid var(--ink-700);}
.legend-swatch.ext{background:transparent; border:1px dotted var(--ink-500);}

.b-card{border-radius:var(--r-md); padding:14px; cursor:pointer;}
.b-card.st-accepted{background:var(--panel); border:1px solid var(--panel-brd-strong);}
.b-card.st-pending{background:var(--ghost); border:1px dashed var(--ghost-brd);}
.b-card.st-rejected{background:repeating-linear-gradient(135deg, rgba(244,245,247,.035) 0 2px, transparent 2px 9px); border:1px solid var(--ink-700); opacity:.7;}
.b-top{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.b-name{color:var(--ink-100); font-size:.88rem; font-weight:500;}
.st-rejected .b-name{text-decoration:line-through; text-decoration-color:var(--ink-700); color:var(--ink-500);}
.b-time{font-family:var(--font-mono); font-size:.72rem; color:var(--ink-500); margin-top:3px;}
.b-tag{font-family:var(--font-mono); font-size:.6rem; letter-spacing:.08em; padding:3px 8px; border-radius:5px; white-space:nowrap;}
.b-tag.accepted{background:var(--ink-100); color:var(--void);}
.b-tag.pending{border:1px dashed var(--ink-500); color:var(--ink-300);}
.b-tag.rejected{border:1px solid var(--ink-700); color:var(--ink-700);}
.b-actions{display:flex; gap:6px; margin-top:10px;}
.b-actions .btn-icon{width:28px;height:28px; border-radius:8px;}
.b-actions svg{width:12px;}

.b-expand{margin-top:12px; padding-top:12px; border-top:1px solid var(--hair); display:flex; flex-direction:column; gap:8px; font-size:.8rem;}
.b-row{display:flex; justify-content:space-between; gap:10px; color:var(--ink-500);}
.b-row b{color:var(--ink-300); font-weight:500; font-family:var(--font-mono); font-size:.78rem;}
.b-check{display:flex; align-items:center; gap:8px; font-size:.78rem; color:var(--ink-300); margin-top:2px;}
.b-check input{accent-color:var(--ink-100);}

.overlap-note{display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:var(--r-sm); background:rgba(0,0,0,.2); border:1px solid var(--hair);}
.overlap-chip{width:22px;height:22px;border-radius:6px;background:var(--panel);border:1px solid var(--panel-brd-strong);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:.68rem;color:var(--ink-100);}
.overlap-note p{margin:0; font-size:.72rem; color:var(--ink-700);}

/* ---- schedule ---- */
.sched{padding:18px;}
.sched-toolbar{display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; padding-bottom:16px; margin-bottom:14px; border-bottom:1px solid var(--hair);}
.sched-nav{display:flex; align-items:center; gap:10px;}
.sched-nav .date{font-family:var(--font-display); color:var(--ink-100); font-size:.95rem; font-weight:600;}
.sched-tools{display:flex; align-items:center; gap:14px;}

.switch{display:flex; align-items:center; gap:9px;}
.switch-label{font-family:var(--font-mono); font-size:.68rem; color:var(--ink-500); letter-spacing:.03em;}
.switch-track{width:34px; height:19px; border-radius:999px; background:rgba(0,0,0,.35); border:1px solid var(--panel-brd-strong); position:relative; transition:.2s;}
.switch-track.on{background:var(--ink-100);}
.switch-dot{position:absolute; top:2px; left:2px; width:13px; height:13px; border-radius:50%; background:var(--ink-500); transition:.2s;}
.switch-track.on .switch-dot{left:17px; background:var(--void);}

.grid-day{display:grid; grid-template-columns:52px 1fr;}
.hour-ruler{display:flex; flex-direction:column;}
.hour-cell{height:64px; display:flex; align-items:flex-start; justify-content:flex-end; padding-right:12px; font-family:var(--font-mono); font-size:.68rem; color:var(--ink-700); transform:translateY(-6px);}
.day-col{position:relative; border-left:1px solid var(--hair);}
.hour-line{height:64px; border-top:1px solid var(--hair);}
.hour-line:first-child{border-top:none;}

.slot{position:absolute; left:10px; right:10px; border-radius:var(--r-sm); padding:8px 12px; overflow:hidden;}
.slot .s-name{font-size:.8rem; color:var(--ink-100); font-weight:500; display:block;}
.slot .s-time{font-family:var(--font-mono); font-size:.66rem; color:var(--ink-500); display:block; margin-top:2px;}
.slot.confirmed{background:var(--panel); border:1px solid var(--panel-brd-strong);}
.slot.pending{background:var(--ghost); border:1px dashed var(--ghost-brd);}
.slot.pending .b-actions{margin-top:6px;}
.slot.rejected{background:repeating-linear-gradient(135deg, rgba(244,245,247,.04) 0 2px, transparent 2px 9px); border:1px solid var(--ink-700);}
.slot.rejected .s-name{text-decoration:line-through; color:var(--ink-500);}
.slot.gcal{background:transparent; border:1px dotted var(--ink-500); cursor:default;}
.slot.gcal .s-name{color:var(--ink-500);}
.slot.brk{background:radial-gradient(circle,rgba(244,245,247,.14) 1px,transparent 1.4px); background-size:6px 6px; border:1px solid var(--hair); display:flex; align-items:center; justify-content:center;}
.slot.brk .s-name{color:var(--ink-700); font-family:var(--font-mono); font-size:.66rem; letter-spacing:.08em;}

/* ============================================================
   CLIENT VIEW
   ============================================================ */
.profile-card{padding:26px;}
.pc-top{display:flex; align-items:flex-start; justify-content:space-between; gap:20px; flex-wrap:wrap;}
.pc-id{font-family:var(--font-mono); font-size:.7rem; color:var(--ink-500);}
.pc-name{font-family:var(--font-display); font-size:1.5rem; color:var(--ink-100); margin:4px 0 10px; font-weight:600;}
.pc-tags{display:flex; gap:7px; flex-wrap:wrap; margin-bottom:14px;}
.tag-pill{font-family:var(--font-mono); font-size:.66rem; padding:5px 11px; border-radius:999px; border:1px solid var(--panel-brd-strong); color:var(--ink-300);}
.pc-bio{font-size:.88rem; color:var(--ink-500); max-width:52ch; line-height:1.6;}
.pc-meta{display:flex; gap:26px; margin-top:16px; flex-wrap:wrap;}
.pc-meta div span{display:block;}
.pc-meta .k{font-family:var(--font-mono); font-size:.62rem; color:var(--ink-700); letter-spacing:.1em; text-transform:uppercase;}
.pc-meta .v{font-family:var(--font-mono); font-size:.85rem; color:var(--ink-100); margin-top:4px;}
.pc-cta{display:flex; flex-direction:column; align-items:flex-end; gap:8px;}
.pc-cta small{font-family:var(--font-mono); font-size:.62rem; color:var(--ink-700);}

.section-label{font-family:var(--font-display); color:var(--ink-100); font-size:1.05rem; font-weight:600; margin:34px 0 14px;}

/* ============================================================
   STYLE GUIDE
   ============================================================ */
.sg-row{display:flex; gap:14px; flex-wrap:wrap; margin-bottom:34px;}
.sw{width:150px;}
.sw-block{height:84px; border-radius:var(--r-md); margin-bottom:8px; border:1px solid var(--hair);}
.sw-name{font-size:.78rem; color:var(--ink-300);}
.sw-hex{font-family:var(--font-mono); font-size:.68rem; color:var(--ink-700);}

.type-row{padding:22px 0; border-bottom:1px solid var(--hair); display:flex; align-items:baseline; gap:24px; flex-wrap:wrap;}
.type-row:last-child{border-bottom:none;}
.type-row .tr-label{width:150px; font-family:var(--font-mono); font-size:.66rem; color:var(--ink-700); letter-spacing:.08em; text-transform:uppercase; flex-shrink:0;}
.t-display{font-family:var(--font-display); color:var(--ink-100); font-size:2rem; font-weight:600; letter-spacing:-.02em;}
.t-body{font-family:var(--font-body); color:var(--ink-300); font-size:1.05rem; max-width:46ch; line-height:1.6;}
.t-mono{font-family:var(--font-mono); color:var(--ink-100); font-size:1rem;}

.btn-row{display:flex; align-items:center; gap:14px; flex-wrap:wrap; margin-bottom:10px;}

.legend-card{padding:16px 18px; display:flex; align-items:center; gap:14px;}
.legend-card .legend-swatch{width:34px; height:34px; border-radius:8px;}
.legend-txt b{display:block; color:var(--ink-100); font-size:.82rem; font-family:var(--font-mono);}
.legend-txt span{font-size:.76rem; color:var(--ink-500);}

hr.hair{border:none; border-top:1px solid var(--hair); margin:36px 0;}
</style>
</head>
<body>

<!-- meta preview switcher â€” not part of the product itself -->
<div class="previewbar">
  <span class="pb-label">Preview</span>
  <button class="pb-btn is-active" data-screen="landing">Landing</button>
  <button class="pb-btn" data-screen="pro">Professional</button>
  <button class="pb-btn" data-screen="client">Client</button>
  <button class="pb-btn" data-screen="guide">Style guide</button>
</div>

<!-- ============================================================
     LANDING
     ============================================================ -->
<section class="screen is-active" id="screen-landing">
  <div class="wrap">
    <div class="hero">
      <span class="eyebrow">JR Booking Premium</span>
      <h1>Every open slot, in plain sight.</h1>
      <div class="glass search-pill">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search a name or a specialty â€” e.g. â€œCamille R.â€ or â€œPhysiotherapyâ€">
      </div>
      <div class="hero-foot">
        <span>Looking for work, not a slot?</span>
        <a href="#" onclick="showScreen('pro'); return false;">I'm a professional â€” sign in</a>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     PROFESSIONAL DASHBOARD
     ============================================================ -->
<section class="screen" id="screen-pro">
  <div class="wrap">
    <div class="glass pnav" style="margin-bottom:18px;">
      <div class="brand">
        <div class="brand-mark">JR</div>
        <div class="brand-word">Booking Premium<small>Professional dashboard</small></div>
      </div>
      <div class="nav-right">
        <button class="nav-user" id="userTrigger" onclick="toggleDropdown()">
          <span class="dot"></span> camille.roussel@jrbooking-premium.com
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button class="nav-logout" title="Log out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
        <div class="glass dropdown-glass" id="userDropdown">
          <div class="ddi">Hours &amp; time off <span class="tag-mini">1/3</span></div>
          <div class="ddi">Payment details <span class="tag-mini">2/3</span></div>
          <div class="ddi">Work type &amp; travel <span class="tag-mini">1/3</span></div>
          <div class="ddi">Schedule style <span class="tag-mini">1/2</span></div>
          <div class="ddi">Your profile</div>
          <div class="ddi">Clients</div>
          <div class="ddi">Statistics</div>
        </div>
      </div>
    </div>

    <div class="dash-shell">
      <!-- sidebar / booking feed -->
      <div class="glass sidebar">
        <div class="sidebar-head">
          <h2>Bookings</h2>
          <div class="segmented">
            <button class="seg-opt is-active">All</button>
            <button class="seg-opt">Pending</button>
            <button class="seg-opt">Rejected</button>
          </div>
        </div>

        <div class="legend-mini">
          <span><i class="legend-swatch acc"></i>Confirmed</span>
          <span><i class="legend-swatch pen"></i>Pending</span>
          <span><i class="legend-swatch rej"></i>Rejected</span>
        </div>

        <div class="b-card st-pending" onclick="this.classList.toggle('is-open')">
          <div class="b-top">
            <div>
              <div class="b-name">Yanis Kader</div>
              <div class="b-time">Tue 1 Sep Â· 11:00â€“12:30</div>
            </div>
            <span class="b-tag pending">PENDING</span>
          </div>
          <div class="b-actions">
            <button class="btn-icon" title="Accept"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"/></svg></button>
            <button class="btn-icon" title="Reject"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
          </div>
          <div class="b-expand" style="display:none;">
            <div class="b-row">Email <b>yanis.kader@mail.com</b></div>
            <div class="b-row">Recurs <b>Weekly Â· 6 left</b></div>
            <div class="b-row">Link <b>meet.jr/yk-followup</b></div>
            <label class="b-check"><input type="checkbox"> Mark as done</label>
          </div>
        </div>

        <div class="b-card st-accepted">
          <div class="b-top">
            <div>
              <div class="b-name">Ã‰lise Marchand</div>
              <div class="b-time">Tue 1 Sep Â· 09:00â€“10:00</div>
            </div>
            <span class="b-tag accepted">CONFIRMED</span>
          </div>
        </div>

        <div class="b-card st-accepted">
          <div class="b-top">
            <div>
              <div class="b-name">Marc Dupuis</div>
              <div class="b-time">Tue 1 Sep Â· 14:00â€“15:00</div>
            </div>
            <span class="b-tag accepted">CONFIRMED</span>
          </div>
        </div>

        <div class="overlap-note">
          <div class="overlap-chip">1</div><div class="overlap-chip">2</div>
          <p>Overlapping requests at 17:00 â€” numbered by order of arrival, stack on the schedule for comparison.</p>
        </div>

        <div class="b-card st-rejected">
          <div class="b-top">
            <div>
              <div class="b-name">Sacha Bellamy</div>
              <div class="b-time">Tue 1 Sep Â· 16:00â€“17:00</div>
            </div>
            <span class="b-tag rejected">REJECTED</span>
          </div>
        </div>
      </div>

      <!-- schedule -->
      <div class="glass sched">
        <div class="sched-toolbar">
          <div class="sched-nav">
            <button class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><polyline points="15 18 9 12 15 6"/></svg></button>
            <span class="date">Tuesday, 1 September</span>
            <button class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
          <div class="sched-tools">
            <div class="switch">
              <span class="switch-label">SYNC Â· GOOGLE CAL</span>
              <div class="switch-track on" onclick="this.classList.toggle('on')"><div class="switch-dot"></div></div>
            </div>
            <button class="btn btn-ghost btn-sm">+ New booking</button>
          </div>
        </div>

        <div class="grid-day">
          <div class="hour-ruler">
            <div class="hour-cell">08</div><div class="hour-cell">09</div><div class="hour-cell">10</div>
            <div class="hour-cell">11</div><div class="hour-cell">12</div><div class="hour-cell">13</div>
            <div class="hour-cell">14</div><div class="hour-cell">15</div><div class="hour-cell">16</div>
            <div class="hour-cell">17</div>
          </div>
          <div class="day-col" style="height:640px;">
            <div class="hour-line"></div><div class="hour-line"></div><div class="hour-line"></div>
            <div class="hour-line"></div><div class="hour-line"></div><div class="hour-line"></div>
            <div class="hour-line"></div><div class="hour-line"></div><div class="hour-line"></div>
            <div class="hour-line"></div>

            <div class="slot confirmed" style="top:64px; height:64px;">
              <span class="s-name">Ã‰lise Marchand â€” Initial consult</span>
              <span class="s-time">09:00 â€“ 10:00</span>
            </div>
            <div class="slot pending" style="top:192px; height:96px;">
              <span class="s-name">Yanis Kader â€” Follow-up</span>
              <span class="s-time">11:00 â€“ 12:30 Â· pending</span>
            </div>
            <div class="slot brk" style="top:288px; height:32px;">
              <span class="s-name">BREAK</span>
            </div>
            <div class="slot confirmed" style="top:384px; height:64px;">
              <span class="s-name">Marc Dupuis â€” Deep tissue</span>
              <span class="s-time">14:00 â€“ 15:00</span>
            </div>
            <div class="slot gcal" style="top:448px; height:64px;">
              <span class="s-name">Dentist â€” Dr. Faure</span>
              <span class="s-time">15:00 â€“ 16:00 Â· Google Cal, read only</span>
            </div>
            <div class="slot rejected" style="top:512px; height:64px;">
              <span class="s-name">Sacha Bellamy â€” Cancelled</span>
              <span class="s-time">16:00 â€“ 17:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     CLIENT VIEW
     ============================================================ -->
<section class="screen" id="screen-client">
  <div class="wrap">
    <div class="glass pnav" style="margin-bottom:18px;">
      <div class="brand">
        <div class="brand-mark">JR</div>
        <div class="brand-word">Booking Premium<small>Client dashboard</small></div>
      </div>
      <div class="nav-right">
        <div class="nav-user"><span class="dot"></span> a.tremblay@mail.com</div>
        <button class="nav-logout" title="Log out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>

    <div class="glass profile-card">
      <div class="pc-top">
        <div>
          <span class="pc-id">#CR-4821</span>
          <div class="pc-name">Camille Roussel</div>
          <div class="pc-tags">
            <span class="tag-pill">Physiotherapy</span>
            <span class="tag-pill">Sports rehab</span>
            <span class="tag-pill">On-site &amp; travels</span>
          </div>
          <p class="pc-bio">Fourteen years treating sports injuries and post-op recovery. Sessions run in-clinic or at home within zone 1â€“2.</p>
          <div class="pc-meta">
            <div><span class="k">Rate</span><span class="v">â‚¬65 / 45 min</span></div>
            <div><span class="k">Travel</span><span class="v">+â‚¬5 zone 2</span></div>
            <div><span class="k">Timezone</span><span class="v">Europe/Paris</span></div>
          </div>
        </div>
        <div class="pc-cta">
          <button class="btn btn-solid">Reserve a slot</button>
          <small>Next opening: Wed 2 Sep, 10:00</small>
        </div>
      </div>
    </div>

    <div class="section-label">Your bookings</div>
    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
      <div class="b-card st-accepted">
        <div class="b-top">
          <div><div class="b-name">Camille Roussel</div><div class="b-time">Wed 2 Sep Â· 10:00â€“11:00</div></div>
          <span class="b-tag accepted">CONFIRMED</span>
        </div>
      </div>
      <div class="b-card st-pending">
        <div class="b-top">
          <div><div class="b-name">Camille Roussel</div><div class="b-time">Wed 9 Sep Â· 10:00â€“11:00</div></div>
          <span class="b-tag pending">PENDING</span>
        </div>
      </div>
      <div class="b-card st-rejected">
        <div class="b-top">
          <div><div class="b-name">Camille Roussel</div><div class="b-time">Wed 16 Sep Â· 10:00â€“11:00</div></div>
          <span class="b-tag rejected">REJECTED</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     STYLE GUIDE
     ============================================================ -->
<section class="screen" id="screen-guide">
  <div class="wrap">
    <span class="eyebrow">Design system</span>
    <h2 style="font-family:var(--font-display); color:var(--ink-100); font-size:1.8rem; margin:8px 0 0;">JR Booking premium â€” visual tokens</h2>

    <div class="section-label">Colour â€” monochrome graphite</div>
    <div class="sg-row">
      <div class="sw"><div class="sw-block" style="background:var(--void);"></div><div class="sw-name">Void</div><div class="sw-hex">#07080A</div></div>
      <div class="sw"><div class="sw-block" style="background:var(--canvas);"></div><div class="sw-name">Canvas</div><div class="sw-hex">#0C0E11</div></div>
      <div class="sw"><div class="sw-block" style="background:var(--ink-100);"></div><div class="sw-name">Ink 100</div><div class="sw-hex">#F4F5F7</div></div>
      <div class="sw"><div class="sw-block" style="background:var(--ink-300);"></div><div class="sw-name">Ink 300</div><div class="sw-hex">#C7CBD1</div></div>
      <div class="sw"><div class="sw-block" style="background:var(--ink-500);"></div><div class="sw-name">Ink 500</div><div class="sw-hex">#8B909A</div></div>
      <div class="sw"><div class="sw-block" style="background:var(--ink-700);"></div><div class="sw-name">Ink 700 / hairline</div><div class="sw-hex">#4B505A</div></div>
    </div>

    <div class="section-label">Type â€” Space Grotesk / IBM Plex Sans / IBM Plex Mono</div>
    <div class="glass" style="padding:6px 22px;">
      <div class="type-row"><span class="tr-label">Display Â· 32</span><span class="t-display">Every open slot, in plain sight.</span></div>
      <div class="type-row"><span class="tr-label">Body Â· 17</span><span class="t-body">Search a professional, see their real availability, and book straight into their calendar â€” no back-and-forth, no double-booking.</span></div>
      <div class="type-row"><span class="tr-label">Mono Â· data</span><span class="t-mono">#CR-4821 Â· 09:00â€“10:00 Â· â‚¬65,00</span></div>
    </div>

    <div class="section-label">Buttons</div>
    <div class="glass" style="padding:22px;">
      <div class="btn-row">
        <button class="btn btn-solid">Reserve a slot</button>
        <button class="btn btn-ghost">+ New booking</button>
        <button class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></button>
        <button class="btn btn-solid" style="opacity:.35; pointer-events:none;">Disabled</button>
      </div>
    </div>

    <div class="section-label">Status language â€” glass treatment, not colour</div>
    <div class="sg-row">
      <div class="glass-ghost legend-card" style="background:var(--panel); border:1px solid var(--panel-brd-strong);">
        <i class="legend-swatch acc"></i>
        <div class="legend-txt"><b>Confirmed</b><span>Solid glass, solid border</span></div>
      </div>
      <div class="glass-ghost legend-card">
        <i class="legend-swatch pen"></i>
        <div class="legend-txt"><b>Pending</b><span>Dashed border, faint fill</span></div>
      </div>
      <div class="glass-ghost legend-card" style="border-style:solid; opacity:.8;">
        <i class="legend-swatch rej"></i>
        <div class="legend-txt"><b>Rejected</b><span>Hatched fill, struck text</span></div>
      </div>
      <div class="glass-ghost legend-card" style="border-style:dotted;">
        <i class="legend-swatch ext"></i>
        <div class="legend-txt"><b>External Â· Ghost mode</b><span>Dotted outline, no fill, read-only</span></div>
      </div>
    </div>

    <hr class="hair">
    <p style="font-family:var(--font-mono); font-size:.7rem; color:var(--ink-700);">JR BOOKING premium â€” visual direction v1 Â· monochrome glass, instrument-grade scheduling</p>
  </div>
</section>

<script>
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('is-active'));
  document.getElementById('screen-' + id).classList.add('is-active');
  document.querySelectorAll('.pb-btn').forEach(b => b.classList.toggle('is-active', b.dataset.screen === id));
  window.scrollTo({top:0, behavior:'smooth'});
}
document.querySelectorAll('.pb-btn').forEach(b => b.addEventListener('click', () => showScreen(b.dataset.screen)));

function toggleDropdown(){
  document.getElementById('userDropdown').classList.toggle('open');
  document.getElementById('userTrigger').classList.toggle('open');
}
document.addEventListener('click', function(e){
  if(!e.target.closest('.nav-right')){
    document.getElementById('userDropdown')?.classList.remove('open');
    document.getElementById('userTrigger')?.classList.remove('open');
  }
});

document.querySelectorAll('.b-card[onclick]').forEach(card => {
  card.addEventListener('click', function(){
    const exp = this.querySelector('.b-expand');
    if(exp) exp.style.display = exp.style.display === 'none' ? 'flex' : 'none';
  });
});

document.querySelectorAll('.seg-opt').forEach(btn => {
  btn.addEventListener('click', function(){
    this.parentElement.querySelectorAll('.seg-opt').forEach(b => b.classList.remove('is-active'));
    this.classList.add('is-active');
  });
});
</script>
</body>
</html>
```
