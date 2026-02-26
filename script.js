/* ============================================================
   CATCH / CLOSE — script.js
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
    // Animate burger → ✕
    const spans = toggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close mobile nav on link click
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


/* ─── Hero phone notification sequence ────────────────────── */
(function initPhoneNotifs() {
  const notif1 = document.getElementById('notif1');
  const notif2 = document.getElementById('notif2');
  if (!notif1 || !notif2) return;

  function runSequence() {
    notif1.classList.remove('show');
    notif2.classList.remove('show');

    setTimeout(() => notif1.classList.add('show'), 800);
    setTimeout(() => notif2.classList.add('show'), 2800);
    setTimeout(runSequence, 7000);
  }

  setTimeout(runSequence, 600);
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


/* ─── Calculator ──────────────────────────────────────────── */
(function initCalculator() {
  const ticketSlider  = document.getElementById('ticket-slider');
  const callsSlider   = document.getElementById('calls-slider');
  const revenueSlider = document.getElementById('revenue-slider');
  const ticketVal     = document.getElementById('ticket-val');
  const callsVal      = document.getElementById('calls-val');
  const revenueVal    = document.getElementById('revenue-val');
  if (!ticketSlider) return;

  const addonEl        = document.getElementById('addon-rejuv');
  const pkgClose       = document.getElementById('pkg-close');
  const pkgCatchClose  = document.getElementById('pkg-catchclose');

  const calcMonthly    = document.getElementById('calc-monthly');
  const calcMonthlyRng = document.getElementById('calc-monthly-range');
  const calcAnnual     = document.getElementById('calc-annual');
  const calcJobs       = document.getElementById('calc-jobs');
  const calcCost       = document.getElementById('calc-cost');
  const calcRoi        = document.getElementById('calc-roi');
  const calcRoiInline  = document.getElementById('calc-roi-inline');

  const condRejuv      = document.getElementById('cond-rejuv');
  const condVoice      = document.getElementById('cond-voice');
  const condHighticket = document.getElementById('cond-highticket');
  const condTicketMath = document.getElementById('cond-ticket-math');

  let useRejuv   = false;
  let useAiVoice = true;  // Catch/Close selected by default

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

    // Conversion rates
    const convRate = useAiVoice ? 0.70 : 0.40;
    const missedPM = callsPW * 4.33;
    const jobsPM   = Math.round(missedPM * convRate);

    // Base revenue added
    const baseMonthly = Math.round(jobsPM * ticket);

    // Range: ±25%
    const lo = Math.round(baseMonthly * 0.75);
    const hi = Math.round(baseMonthly * 1.25);

    // Rejuvenation bonus
    const rejuvBonus = useRejuv ? Math.round(1800 + Math.random() * 200) : 0;

    const totalMonthly = baseMonthly + rejuvBonus;
    const totalAnnual  = totalMonthly * 12;

    // Cost
    const cost = useAiVoice ? 497 : 297;

    // ROI (rounded)
    const roi = Math.max(1, Math.round(totalMonthly / cost));

    // Update display
    calcMonthly.textContent    = fmtFull(totalMonthly);
    calcMonthlyRng.textContent = `Estimated ${fmtFull(lo)} – ${fmtFull(hi)}/mo`;
    calcAnnual.textContent     = fmt(totalAnnual);
    calcJobs.textContent       = jobsPM;
    calcCost.textContent       = '$' + cost + '/mo';
    calcRoi.textContent        = roi + 'x';
    calcRoiInline.textContent  = '$' + roi;

    // Conditional messages
    condRejuv.classList.toggle('visible', useRejuv);
    condVoice.classList.toggle('visible', useAiVoice);
    condHighticket.classList.toggle('visible', ticket >= 700);

    if (condTicketMath && ticket >= 700) {
      condTicketMath.textContent = fmtFull(ticket * 4) + '/mo';
    }

    // Update slider fill gradient
    updateSliderFill(ticketSlider, 150, 2000);
    updateSliderFill(callsSlider, 1, 30);
    updateSliderFill(revenueSlider, 3000, 80000);
  }

  function updateSliderFill(slider, min, max) {
    const pct = ((slider.value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, #4393F9 0%, #4393F9 ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`;
  }

  // Slider events
  ticketSlider.addEventListener('input', () => {
    const v = parseInt(ticketSlider.value);
    ticketVal.textContent = '$' + v.toLocaleString();
    recalculate();
  });

  callsSlider.addEventListener('input', () => {
    callsVal.textContent = callsSlider.value;
    recalculate();
  });

  revenueSlider.addEventListener('input', () => {
    const v = parseInt(revenueSlider.value);
    revenueVal.textContent = fmt(v);
    recalculate();
  });

  // Add-on toggle
  function toggleAddon() {
    useRejuv = !useRejuv;
    addonEl.classList.toggle('active', useRejuv);
    addonEl.setAttribute('aria-checked', useRejuv);
    recalculate();
  }
  addonEl.addEventListener('click', toggleAddon);
  addonEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAddon(); }
  });

  // Package toggle
  function selectClose() {
    useAiVoice = false;
    pkgClose.classList.add('selected');
    pkgCatchClose.classList.remove('selected');
    recalculate();
  }
  function selectCatchClose() {
    useAiVoice = true;
    pkgCatchClose.classList.add('selected');
    pkgClose.classList.remove('selected');
    recalculate();
  }

  pkgClose.addEventListener('click', selectClose);
  pkgClose.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectClose(); }
  });
  pkgCatchClose.addEventListener('click', selectCatchClose);
  pkgCatchClose.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectCatchClose(); }
  });

  // Initial run
  recalculate();
})();


/* ─── Roadmap table ───────────────────────────────────────── */
(function initRoadmap() {
  const btnNational = document.getElementById('btn-national');
  const btnCali     = document.getElementById('btn-cali');
  const tbody       = document.getElementById('roadmap-body');
  if (!tbody) return;

  const national = [
    { mo: 'Month 1',  desc: 'Missed-call catch only (8 jobs × $450)',              mo_rev: 3600,  cum: 3600   },
    { mo: 'Month 3',  desc: 'Missed calls + early review bump (1 organic job)',     mo_rev: 4050,  cum: 11700  },
    { mo: 'Month 6',  desc: 'Missed calls + solid review ranking (3 organic jobs)', mo_rev: 4950,  cum: 25200  },
    { mo: 'Month 12', desc: 'Missed calls + 100+ reviews + reactivation blast',     mo_rev: 8100,  cum: 58500  },
    { mo: 'Month 18', desc: 'Missed calls + dominant local SEO (8 organic jobs)',   mo_rev: 7200,  cum: 104400 },
    { mo: 'Month 24', desc: 'Missed calls + 200+ reviews + seasonal text blast',    mo_rev: 12600, cum: 163800 },
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
    render(national);
  });

  btnCali.addEventListener('click', () => {
    btnCali.classList.add('active');
    btnNational.classList.remove('active');
    render(california);
  });
})();


/* ─── Day in Life Slider ──────────────────────────────────── */
(function initDilSlider() {
  const slider   = document.getElementById('dil-slider');
  const dotsWrap = document.getElementById('dil-dots');
  const prevBtn  = document.getElementById('dil-prev');
  const nextBtn  = document.getElementById('dil-next');
  if (!slider) return;

  const slides  = Array.from(slider.querySelectorAll('.dil-slide'));
  const total   = slides.length;
  let current   = 0;
  let autoTimer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dil-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getVisibleCount() {
    return window.innerWidth <= 768 ? 1 : 3;
  }

  function goTo(idx) {
    const vis    = getVisibleCount();
    const maxIdx = Math.max(0, total - vis);
    current = Math.max(0, Math.min(idx, maxIdx));

    const slideW  = slides[0].offsetWidth + 20; // gap = 20px
    slider.style.transform = `translateX(-${current * slideW}px)`;

    // Active class
    slides.forEach((s, i) => {
      s.classList.toggle('active', i >= current && i < current + vis);
    });

    // Update dots
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
    goTo(current <= 0 ? Math.max(0, total - getVisibleCount()) : current - 1);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 4500);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  // Touch swipe
  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
  }, { passive: true });

  resetAuto();
})();


/* ─── FAQ accordion ───────────────────────────────────────── */
(function initFaq() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      // Toggle clicked
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
    submit.textContent = '📞 Calling you now…';
    submit.disabled = true;
    input.disabled  = true;

    setTimeout(() => {
      submit.textContent = '✅ Call initiated!';
      submit.style.background = 'var(--success)';
    }, 1500);
  });
})();


/* ─── Trial form ───────────────────────────────────────────── */
function handleTrialSubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');

  btn.textContent  = 'Sending…';
  btn.disabled     = true;

  setTimeout(() => {
    btn.textContent = '✅ We\'ll be in touch soon!';
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
    const offset = 72; // nav height
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ─── Animate number counters on scroll ─────────────────────── */
(function initCounters() {
  const items = document.querySelectorAll('.sbar-item strong, .prob-stat-num');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const raw = el.textContent.trim();

      // Only animate pure number-like strings
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
        const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
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
