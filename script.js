/* ============================================================
   BOOK MORE JOBS — script.js
   ============================================================ */

'use strict';

/* ─── Nav scroll behavior ─────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const mobile = document.getElementById('nav-mobile');
  let isOpen   = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    mobile.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      isOpen = false;
      mobile.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
      const spans = toggle.querySelectorAll('span');
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();


/* ─── Scroll reveal ───────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll(
    '.reveal, .reveal-up, .reveal-left, .reveal-right'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();


/* ─── Floating CTA visibility ─────────────────────────────── */
(function initFloatCta() {
  const floatCta = document.getElementById('float-cta');
  const hero     = document.getElementById('hero');
  if (!floatCta || !hero) return;

  const observer = new IntersectionObserver(([e]) => {
    floatCta.classList.toggle('visible', !e.isIntersecting);
  }, { threshold: 0.1 });

  observer.observe(hero);
})();


/* ─── How It Works — Tab System ───────────────────────────── */
(function initTabs() {
  const tabsWrap  = document.getElementById('system-tabs');
  const panelsWrap = document.getElementById('system-panels');
  if (!tabsWrap || !panelsWrap) return;

  const tabs   = Array.from(tabsWrap.querySelectorAll('.system-tab'));
  const panels = Array.from(panelsWrap.querySelectorAll('.system-panel'));
  let current  = 0;
  let autoTimer = null;

  function goTo(idx) {
    current = idx;

    // Update tabs
    tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
      // Reset progress animation
      const prog = tab.querySelector('.system-tab-progress');
      if (prog) {
        prog.style.animation = 'none';
        prog.offsetHeight; // force reflow
        prog.style.animation = '';
      }
    });

    // Update panels
    panels.forEach((panel, i) => {
      panel.classList.toggle('active', i === idx);
    });

    resetAuto();
  }

  function next() {
    goTo((current + 1) % tabs.length);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 8000);
  }

  // Tab click
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goTo(i));
  });

  // Start auto-cycle
  resetAuto();
})();


/* ─── Calculator V2 ──────────────────────────────────────── */
(function initCalculator() {
  const ticketSlider   = document.getElementById('ticket-slider');
  const callsSlider    = document.getElementById('calls-slider');
  const adBudgetSlider = document.getElementById('ad-budget-slider');
  const ticketVal      = document.getElementById('ticket-val');
  const callsVal       = document.getElementById('calls-val');
  const adBudgetVal    = document.getElementById('ad-budget-val');
  if (!ticketSlider) return;

  // Close rate toggle
  const closeRateToggle = document.getElementById('close-rate-toggle');
  const rateButtons     = closeRateToggle ? Array.from(closeRateToggle.querySelectorAll('.calc-rate-btn')) : [];

  // iOS toggles
  const toggleRejuv = document.getElementById('toggle-rejuv');
  const toggleAds   = document.getElementById('toggle-ads');
  const adBudgetWrap = document.getElementById('ad-budget-wrap');

  // Plan pills
  const planPills = document.getElementById('plan-pills');
  const pills     = planPills ? Array.from(planPills.querySelectorAll('.calc-plan-pill')) : [];

  // Output elements
  const calcMonthly   = document.getElementById('calc-monthly');
  const calcAnnual    = document.getElementById('calc-annual');
  const calcJobs      = document.getElementById('calc-jobs');
  const calcCost      = document.getElementById('calc-cost');
  const calcRoi       = document.getElementById('calc-roi');
  const calcRoiInline = document.getElementById('calc-roi-inline');
  const calcAdBonus   = document.getElementById('calc-ad-bonus');
  const calcAdValue   = document.getElementById('calc-ad-value');

  // State
  let closeRate  = 0.25;  // Typical
  let useRejuv   = false;
  let useAds     = false;
  let useAiVoice = true;  // Catch/Close selected by default
  let planCost   = 497;

  function fmt(n) {
    if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return '$' + Math.round(n).toLocaleString();
  }

  function fmtFull(n) {
    return '$' + Math.round(n).toLocaleString();
  }

  function recalculate() {
    const ticket  = parseInt(ticketSlider.value);
    const callsPW = parseInt(callsSlider.value);
    const adBudget = adBudgetSlider ? parseInt(adBudgetSlider.value) : 1500;

    // Response rate (how many missed callers engage)
    const responseRate = useAiVoice ? 0.55 : 0.35;

    // Monthly missed calls
    const missedPM = callsPW * 4.33;

    // Leads that respond/engage
    const respondedLeads = missedPM * responseRate;

    // Jobs booked (close rate applied)
    const jobsPM = Math.round(respondedLeads * closeRate);

    // Base revenue from missed call recovery
    const baseRevenue = jobsPM * ticket;

    // Rejuvenation bonus
    const rejuvBonus = useRejuv ? 1500 : 0;

    // Ad spend bonus: leads from ads at ~$80 CPL
    const adLeads = useAds ? Math.floor(adBudget / 80) : 0;
    const adJobs  = Math.round(adLeads * closeRate);
    const adBonus = adJobs * ticket;

    // Total
    const totalMonthly = Math.round(baseRevenue + rejuvBonus + adBonus);
    const totalAnnual  = totalMonthly * 12;
    const roi = Math.max(1, Math.round(totalMonthly / planCost));

    // Update display
    if (calcMonthly)   calcMonthly.textContent   = fmtFull(totalMonthly);
    if (calcAnnual)    calcAnnual.textContent     = fmtFull(totalAnnual);
    if (calcJobs)      calcJobs.textContent       = '~' + jobsPM;
    if (calcCost)      calcCost.textContent       = '$' + planCost + '/mo';
    if (calcRoi)       calcRoi.textContent        = roi + 'x';
    if (calcRoiInline) calcRoiInline.textContent  = '$' + roi;

    // Ad bonus display
    if (calcAdBonus) {
      calcAdBonus.classList.toggle('visible', useAds && adBonus > 0);
    }
    if (calcAdValue) {
      calcAdValue.textContent = fmtFull(adBonus);
    }

    // Update slider fills
    updateSliderFill(ticketSlider, 150, 2000);
    updateSliderFill(callsSlider, 1, 30);
    if (adBudgetSlider && useAds) {
      updateSliderFill(adBudgetSlider, 500, 10000);
    }
  }

  function updateSliderFill(slider, min, max) {
    const pct = ((slider.value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #4393F9 0%, #4393F9 ${pct}%, #E8E8ED ${pct}%, #E8E8ED 100%)`;
  }

  // Slider events
  ticketSlider.addEventListener('input', () => {
    ticketVal.textContent = '$' + parseInt(ticketSlider.value).toLocaleString();
    recalculate();
  });

  callsSlider.addEventListener('input', () => {
    callsVal.textContent = callsSlider.value;
    recalculate();
  });

  if (adBudgetSlider) {
    adBudgetSlider.addEventListener('input', () => {
      adBudgetVal.textContent = '$' + parseInt(adBudgetSlider.value).toLocaleString();
      recalculate();
    });
  }

  // Close rate toggle
  rateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      rateButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      closeRate = parseFloat(btn.dataset.rate);
      recalculate();
    });
  });

  // iOS toggle: Lead Rejuvenation
  if (toggleRejuv) {
    toggleRejuv.addEventListener('click', () => {
      useRejuv = !useRejuv;
      toggleRejuv.classList.toggle('active', useRejuv);
      toggleRejuv.setAttribute('aria-checked', useRejuv);
      recalculate();
    });
  }

  // iOS toggle: Ads
  if (toggleAds) {
    toggleAds.addEventListener('click', () => {
      useAds = !useAds;
      toggleAds.classList.toggle('active', useAds);
      toggleAds.setAttribute('aria-checked', useAds);
      if (adBudgetWrap) {
        adBudgetWrap.style.display = useAds ? 'block' : 'none';
      }
      recalculate();
    });
  }

  // Plan pills
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      planCost   = parseInt(pill.dataset.cost);
      useAiVoice = pill.dataset.plan === 'catchclose';
      recalculate();
    });
  });

  // Initial calculation
  recalculate();
})();


/* ─── Roadmap table (more conservative numbers) ──────────── */
(function initRoadmap() {
  const btnNational = document.getElementById('btn-national');
  const btnCali     = document.getElementById('btn-cali');
  const tbody       = document.getElementById('roadmap-body');
  if (!tbody) return;

  const national = [
    { mo: 'Month 1',  desc: 'Missed-call catch only (3–4 jobs × $450)',              mo_rev: 1575,  cum: 1575   },
    { mo: 'Month 3',  desc: 'Missed calls + early review bump (1 organic job)',       mo_rev: 2100,  cum: 5775   },
    { mo: 'Month 6',  desc: 'Missed calls + solid review ranking (2 organic jobs)',   mo_rev: 2800,  cum: 13125  },
    { mo: 'Month 12', desc: 'Missed calls + 60+ reviews + reactivation blast',       mo_rev: 3900,  cum: 30825  },
    { mo: 'Month 18', desc: 'Missed calls + strong local SEO (4 organic jobs)',       mo_rev: 4800,  cum: 57825  },
    { mo: 'Month 24', desc: 'Missed calls + 100+ reviews + seasonal text blast',     mo_rev: 6200,  cum: 90825  },
  ];

  const california = national.map(r => ({
    mo:     r.mo,
    desc:   r.desc.replace(/\$450/g, '$750'),
    mo_rev: Math.round(r.mo_rev * (750 / 450)),
    cum:    Math.round(r.cum    * (750 / 450)),
  }));

  function fmt(n) {
    return '$' + n.toLocaleString();
  }

  function render(data) {
    tbody.innerHTML = data.map(row => `
      <tr>
        <td class="month-col">${row.mo}</td>
        <td>${row.desc}</td>
        <td class="revenue-col">${fmt(row.mo_rev)}/mo</td>
        <td class="cumulative-col">${fmt(row.cum)}</td>
      </tr>
    `).join('');
  }

  render(national);

  btnNational.addEventListener('click', () => {
    btnNational.classList.add('active');
    btnCali.classList.remove('active');
    btnNational.setAttribute('aria-pressed', 'true');
    btnCali.setAttribute('aria-pressed', 'false');
    render(national);
  });

  btnCali.addEventListener('click', () => {
    btnCali.classList.add('active');
    btnNational.classList.remove('active');
    btnCali.setAttribute('aria-pressed', 'true');
    btnNational.setAttribute('aria-pressed', 'false');
    render(california);
  });
})();


/* ─── Reviews Carousel ───────────────────────────────────── */
(function initReviewsCarousel() {
  const carousel = document.getElementById('reviews-carousel');
  const dotsWrap = document.getElementById('reviews-dots');
  const prevBtn  = document.getElementById('reviews-prev');
  const nextBtn  = document.getElementById('reviews-next');
  if (!carousel) return;

  const cards   = Array.from(carousel.querySelectorAll('.review-card'));
  const total   = cards.length;
  let current   = 0;
  let autoTimer = null;

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const vis    = getVisibleCount();
    const maxIdx = Math.max(0, total - vis);
    const dotCount = maxIdx + 1;
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement('button');
      dot.className = 'review-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(idx) {
    const vis    = getVisibleCount();
    const maxIdx = Math.max(0, total - vis);
    current = Math.max(0, Math.min(idx, maxIdx));

    const cardW  = cards[0].offsetWidth + 20;
    carousel.style.transform = `translateX(-${current * cardW}px)`;

    Array.from(dotsWrap.children).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });

    resetAuto();
  }

  function next() {
    const vis    = getVisibleCount();
    const maxIdx = Math.max(0, total - vis);
    goTo(current >= maxIdx ? 0 : current + 1);
  }

  function prev() {
    const vis    = getVisibleCount();
    const maxIdx = Math.max(0, total - vis);
    goTo(current <= 0 ? maxIdx : current - 1);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 5000);
  }

  buildDots();

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Touch swipe
  let touchX = 0;
  carousel.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  }, { passive: true });

  // Rebuild dots on resize
  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, Math.max(0, total - getVisibleCount())));
  });

  resetAuto();
})();


/* ─── FAQ accordion ───────────────────────────────────────── */
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ─── Demo form ────────────────────────────────────────────── */
(function initDemoForm() {
  const form   = document.getElementById('demo-form');
  const input  = document.getElementById('demo-phone');
  const submit = document.getElementById('demo-submit');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--red)';
      input.focus();
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
      return;
    }
    submit.textContent = 'Calling you now...';
    submit.disabled = true;
    input.disabled  = true;

    setTimeout(() => {
      submit.textContent = 'Call initiated!';
      submit.style.background = 'var(--success)';
    }, 1500);
  });
})();


/* ─── Hero Voice Demo form ─────────────────────────────────── */
(function initHeroVoiceForm() {
  const form   = document.getElementById('hero-voice-form');
  const input  = document.getElementById('hero-voice-phone');
  const submit = document.getElementById('hero-voice-submit');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      input.style.borderColor = 'var(--red)';
      input.focus();
      setTimeout(() => { input.style.borderColor = ''; }, 2000);
      return;
    }
    submit.textContent = 'Calling you now...';
    submit.disabled = true;
    input.disabled  = true;

    setTimeout(() => {
      submit.textContent = 'Call initiated!';
      submit.style.background = 'var(--success)';
    }, 1500);
  });
})();


/* ─── Trial form ───────────────────────────────────────────── */
function handleTrialSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');

  btn.textContent  = 'Sending...';
  btn.disabled     = true;

  setTimeout(() => {
    btn.textContent = 'We\'ll be in touch soon!';
    btn.style.background = 'var(--success)';
    btn.style.color      = '#fff';
    btn.style.boxShadow  = '0 4px 20px rgba(52,199,89,0.4)';
  }, 1200);

  return false;
}


/* ─── Smooth anchor scrolling (with nav offset) ────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 72;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─── Animate number counters on scroll ─────────────────────── */
(function initCounters() {
  const items = document.querySelectorAll('.sbar-item strong, .prob-stat-num, .proof-bar-item strong');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();

      const match = raw.match(/^(\$?)(\d+)([\+K%]*)$/);
      if (!match) return;

      const prefix = match[1] || '';
      const target = parseInt(match[2]);
      const suffix = match[3] || '';
      const duration = 1000;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const val = Math.round(ease * target);
        el.textContent = prefix + val.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  items.forEach(el => observer.observe(el));
})();
