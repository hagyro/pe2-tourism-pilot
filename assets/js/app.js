/* ============================================================
   ΛΕΥΚΗ ΒΙΒΛΟΣ ΤΟΥΡΙΣΜΟΥ — App shell
   Navigation, theme, scrollspy, glossary, search
   ============================================================ */

(function () {
  'use strict';

  // ---------- Theme toggle ----------
  const THEME_KEY = 'wb-theme';
  const root = document.documentElement;

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    localStorage.setItem(THEME_KEY, t);
    const btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      btn.innerHTML = t === 'dark' ? sunIcon() : moonIcon();
      btn.setAttribute('aria-label', t === 'dark' ? 'Φωτεινό θέμα' : 'Σκοτεινό θέμα');
    }
  }
  function moonIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }
  function sunIcon() {
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  }

  const stored = localStorage.getItem(THEME_KEY);
  const prefDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefDark ? 'dark' : 'light'));

  document.addEventListener('click', e => {
    const t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    const cur = root.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });

  // ---------- Scrollspy ----------
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = Array.from(tabs).map(t => document.getElementById(t.getAttribute('href').slice(1))).filter(Boolean);

  function onScroll() {
    const top = window.scrollY + 100;
    let active = sections[0];
    for (const s of sections) {
      if (s.offsetTop <= top) active = s;
    }
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('href') === '#' + active?.id));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Glossary tooltips ----------
  const GLOSSARY = {
    'TFI':  'Tourism Function Index (Defert 1967): κλίνες ανά 100 κατοίκους. Μετρά την «τουριστική λειτουργία» του προορισμού.',
    'TII':  'Tourism Intensity Index: διανυκτερεύσεις ανά κάτοικο × 100. Μετρά την ετήσια τουριστική πίεση.',
    'POI':  'Perceived Overtourism Index: σύνθετος ψυχομετρικός δείκτης από Item Response Theory (Graded Response Model, Samejima 1969). Μετρά υποκειμενική αντίληψη πίεσης τουρισμού.',
    'IRT':  'Item Response Theory: στατιστική μέθοδος για polytomous κλίμακες· διορθώνει για διαφορές στη χρήση κλίμακας μεταξύ ερωτηθέντων.',
    'GRM':  'Graded Response Model: παραλλαγή IRT ειδικά για τμηματικές κλίμακες (όπως Likert).',
    'LCA':  'Latent Class Analysis (Lazarsfeld & Henry 1968): στατιστική ομαδοποίηση σε εμπειρικές τυπολογίες.',
    'IPA':  'Importance-Performance Analysis: 2×2 τεταρτημόριο που διασταυρώνει σπουδαιότητα × αξιολόγηση.',
    'STR':  'Short-Term Rental — βραχυχρόνια μίσθωση (τύπου Airbnb/Booking).',
    'NACE': 'Statistical classification of economic activities — ευρωπαϊκή ταξινόμηση κλάδων (NACE Rev. 2).',
    'WEI+': 'Water Exploitation Index Plus (Eurostat): % χρήσης γλυκών υδάτων προς διαθέσιμους πόρους. >20 = έντονη πίεση.',
    'ALoS': 'Average Length of Stay — μέση διάρκεια παραμονής (διανυκτερεύσεις/άφιξη).',
    'GVA':  'Gross Value Added — Ακαθάριστη Προστιθέμενη Αξία (ΑΠΑ).',
    'NUTS2':'Nomenclature of Territorial Units for Statistics, επίπεδο 2: μεγάλες περιφέρειες (Κρήτη EL43).',
    'NUTS3':'NUTS επίπεδο 3: Περιφερειακές Ενότητες / Νομοί (ΠΕ Χανίων EL434).',
    'Doxey':'Doxey Irridex (1975): μοντέλο εξέλιξης στάσης κατοίκων — Ευφορία → Απάθεια → Ενόχληση → Σύγκρουση.',
    'Butler':'Butler TALC (1980): Tourism Area Life Cycle — 6 φάσεις εξέλιξης προορισμού.',
    'IPW':  'Inverse Probability Weighting — αιτιακή μέθοδος για estimation effects από observational data.',
    'CEM':  'Coarsened Exact Matching — αιτιακή μέθοδος matching σε χονδροειδείς κατηγορίες covariates.',
    'DMMO': 'Destination Marketing & Management Organization — οργανισμός διαχείρισης προορισμού.',
  };

  function wireGlossary() {
    document.querySelectorAll('[data-term]').forEach(el => {
      const term = el.getAttribute('data-term');
      const def = GLOSSARY[term];
      if (!def) return;
      el.classList.add('glossary');
      const tip = document.createElement('span');
      tip.className = 'glossary-tip';
      tip.innerHTML = `<strong>${term}</strong><br>${def}`;
      el.appendChild(tip);
    });
  }
  wireGlossary();

  // ---------- Smooth anchor scroll ----------
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const top = target.offsetTop - 70;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', '#' + id);
  });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('fade-in'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ---------- Quote carousel ----------
  document.querySelectorAll('[data-carousel]').forEach(deck => {
    const rail = deck.querySelector('.quotes-rail');
    const next = deck.querySelector('[data-carousel-next]');
    const prev = deck.querySelector('[data-carousel-prev]');
    let pos = 0;
    function advance(d) {
      const card = rail.querySelector('.quote-card');
      if (!card) return;
      const step = card.offsetWidth + 24;
      const max = rail.scrollWidth - deck.offsetWidth + 4;
      pos = Math.min(Math.max(pos + d * step, 0), max);
      rail.style.transform = `translateX(-${pos}px)`;
    }
    next?.addEventListener('click', () => advance(1));
    prev?.addEventListener('click', () => advance(-1));
  });

  // ---------- Number animation on enter ----------
  function animateNumber(el) {
    const target = parseFloat(el.getAttribute('data-num'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(target)) return;
    const start = performance.now();
    const dur = 900;
    function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toLocaleString('el-GR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const numIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        animateNumber(en.target);
        numIO.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-num]').forEach(el => numIO.observe(el));

  // ---------- Tab activation from URL hash ----------
  if (location.hash) {
    setTimeout(() => {
      const t = document.getElementById(location.hash.slice(1));
      if (t) window.scrollTo({ top: t.offsetTop - 70, behavior: 'instant' });
    }, 50);
  }
})();
