/* ============================================================
   DENTAL BAR — motion + interaction  (no preloader)
   ============================================================ */
(() => {
  'use strict';
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOVER = window.matchMedia('(hover:hover)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- year ---------- */
  const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- header scroll state ---------- */
  const hdr = $('#hdr');
  const onScroll = () => hdr.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (typeof window.Lenis !== 'undefined' && !RM) {
    lenis = new window.Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    if (hasGSAP && window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
  }
  const scrollTo = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -70 });
    else el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  };

  /* ---------- anchor links ---------- */
  $$('a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', e => {
      const el = $(id); if (!el) return;
      e.preventDefault(); closeMenu(); scrollTo(el);
    });
  });

  /* ---------- mobile menu ---------- */
  const burger = $('#burger');
  const openMenu = () => { document.body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true'); };
  function closeMenu() { document.body.classList.remove('menu-open'); if (burger) burger.setAttribute('aria-expanded', 'false'); }
  if (burger) burger.addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu() : openMenu());

  /* ---------- city selector ---------- */
  const city = $('#city');
  if (city) {
    const btn = $('#cityBtn'), cur = $('#cityCur');
    btn.addEventListener('click', e => { e.stopPropagation(); city.classList.toggle('is-open'); btn.setAttribute('aria-expanded', city.classList.contains('is-open')); });
    $$('#cityMenu li').forEach(li => li.addEventListener('click', () => {
      cur.textContent = li.dataset.city;
      $$('#cityMenu li').forEach(x => x.classList.remove('is-active'));
      li.classList.add('is-active'); city.classList.remove('is-open');
    }));
    document.addEventListener('click', () => city.classList.remove('is-open'));
  }

  /* ---------- prices accordion ---------- */
  const setAcc = (item, open) => {
    const body = $('.acc__body', item);
    item.classList.toggle('is-open', open);
    body.style.maxHeight = open ? body.scrollHeight + 'px' : '0px';
  };
  $$('#acc .acc__item').forEach(item => {
    if (item.classList.contains('is-open')) setAcc(item, true);
    $('.acc__head', item).addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      $$('#acc .acc__item').forEach(i => setAcc(i, false));
      setAcc(item, open);
    });
  });

  /* ---------- services: horizontal auto-swipe (drag + arrows + autoplay) ---------- */
  const svcScroll = $('#svcScroll');
  if (svcScroll) {
    const track = $('#svcTrack', svcScroll) || svcScroll.firstElementChild;
    // duplicate cards once for a seamless loop
    let half = 0;
    const setupLoop = () => {
      if (track.dataset.cloned !== '1') {
        track.innerHTML += track.innerHTML;
        track.dataset.cloned = '1';
      }
      half = track.scrollWidth / 2;
    };
    setupLoop(); window.addEventListener('load', setupLoop);

    const step = () => Math.min(svcScroll.clientWidth * .85, 640);
    const prev = $('[data-svc-prev]'), next = $('[data-svc-next]');
    if (prev) prev.addEventListener('click', () => { paused = true; svcScroll.scrollBy({ left: -step(), behavior: 'smooth' }); resumeSoon(); });
    if (next) next.addEventListener('click', () => { paused = true; svcScroll.scrollBy({ left: step(), behavior: 'smooth' }); resumeSoon(); });

    // wrap seamlessly
    const wrap = () => {
      if (!half) return;
      if (svcScroll.scrollLeft >= half) svcScroll.scrollLeft -= half;
      else if (svcScroll.scrollLeft < 0) svcScroll.scrollLeft += half;
    };
    svcScroll.addEventListener('scroll', wrap, { passive: true });

    // autoplay (continuous), paused on hover / drag
    let paused = false, resumeT;
    const resumeSoon = () => { clearTimeout(resumeT); resumeT = setTimeout(() => paused = false, 2000); };
    svcScroll.addEventListener('pointerenter', () => paused = true);
    svcScroll.addEventListener('pointerleave', () => { if (!down) paused = false; });
    if (!RM) {
      const tick = () => {
        if (!paused && half) { svcScroll.scrollLeft += 0.5; wrap(); }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    // drag to scroll
    let down = false, sx = 0, sl = 0, moved = 0;
    svcScroll.addEventListener('pointerdown', e => { down = true; paused = true; moved = 0; sx = e.clientX; sl = svcScroll.scrollLeft; svcScroll.classList.add('is-drag'); });
    svcScroll.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved += Math.abs(dx); svcScroll.scrollLeft = sl - dx; });
    const endDrag = () => { if (!down) return; down = false; svcScroll.classList.remove('is-drag'); resumeSoon(); };
    svcScroll.addEventListener('pointerup', endDrag);
    svcScroll.addEventListener('pointercancel', endDrag);
    svcScroll.addEventListener('click', e => { if (moved > 6) e.preventDefault(); }, true);
  }

  /* ---------- booking modal ---------- */
  const modal = $('#modal');
  const openModal = () => { modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); };
  const closeModal = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); };
  $$('[data-book]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); closeMenu(); openModal(); }));
  $$('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeMenu(); } });

  /* ---------- forms (TODO: wire to CRM endpoint) ---------- */
  const handleForm = (form, okId) => {
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      console.log('[Dental Bar] booking request:', data);
      const ok = $('#' + okId); if (ok) ok.hidden = false;
      form.querySelector('button[type=submit]').textContent = 'Відправлено ✓';
    });
  };
  handleForm($('#bform'), 'bformOk');
  handleForm($('#bformModal'), 'bformModalOk');

  /* ---------- "open now" indicator ---------- */
  const hoursEl = $('#hoursNow');
  if (hoursEl) {
    const h = new Date().getHours();
    const open = h >= 9 && h < 20;
    hoursEl.innerHTML = 'Пн–Нд · 09:00–20:00 &nbsp;<span style="color:' + (open ? 'var(--lav)' : 'var(--muted)') + '">• ' + (open ? 'Відкрито зараз' : 'Зачинено') + '</span>';
  }

  /* ---------- lazy map ---------- */
  const map = $('.contacts__map iframe');
  if (map) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { map.src = map.dataset.src; io.disconnect(); } }), { rootMargin: '200px' });
    io.observe(map);
  }

  /* ============================================================
     MOTION (GSAP) — one language: reveal · stagger · parallax
     ============================================================ */
  if (!hasGSAP || RM) { document.body.classList.add('no-motion'); return; }
  const { gsap } = window; gsap.registerPlugin(window.ScrollTrigger);

  // wrap hero title lines for masked reveal
  $$('[data-reveal-line]').forEach(line => {
    const inner = document.createElement('span');
    inner.className = 'inner'; inner.style.display = 'block';
    inner.innerHTML = line.innerHTML; line.innerHTML = ''; line.appendChild(inner);
  });
  gsap.set('[data-reveal-line] .inner', { yPercent: 115 });

  // hero intro — runs immediately (no preloader gate)
  const heroIn = () => {
    gsap.to('[data-reveal-line] .inner', { yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: .09, delay: .05 });
    gsap.from('.hero .kicker', { opacity: 0, y: 16, duration: .7, ease: 'power3.out' });
    gsap.from('.hero__lead,.hero__actions,.hero__trust', { y: 24, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08, delay: .4 });
    gsap.from('.hero__media', { y: 36, opacity: 0, duration: 1.1, ease: 'power3.out', delay: .25 });
    const heroFig = $('.hero__media .reveal-img');
    if (heroFig) gsap.fromTo(heroFig, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.3, ease: 'power4.out', delay: .35 });
  };
  requestAnimationFrame(heroIn);

  // generic reveal on scroll
  $$('.sec-head, .svc-head, .about__lead, .about__pillars li, .doc, .stat, .band__head, .prices__aside, .acc, .contacts__left, .bform').forEach(el => {
    gsap.from(el, { y: 46, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // manifesto word stagger
  const man = $('[data-reveal-words]');
  if (man) {
    man.innerHTML = man.innerHTML.replace(/(<em>|<\/em>)/g, '\u0000$1\u0000');
    man.innerHTML = man.innerHTML.split(/(\s+|\u0000)/).map(t => {
      if (t === '\u0000' || /^\s+$/.test(t) || t === '') return t.replace('\u0000', '');
      if (t === '<em>' || t === '</em>') return t;
      return '<span class="w">' + t + '</span>';
    }).join('');
    gsap.from(man.querySelectorAll('.w'), { opacity: .12, duration: .6, ease: 'none', stagger: .045,
      scrollTrigger: { trigger: man, start: 'top 80%', end: 'bottom 60%', scrub: .6 } });
  }

  // hero image parallax
  $$('[data-parallax] img').forEach(img => {
    gsap.to(img, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // marquee
  const mq = $('.marquee__track');
  if (mq) { const w = mq.scrollWidth / 2; gsap.to(mq, { x: -w, duration: 22, ease: 'none', repeat: -1 }); }

  // lifestyle band → continuous auto-swipe marquee
  const band = $('#bandTrack');
  if (band) {
    band.innerHTML += band.innerHTML; // duplicate for seamless loop
    const half = band.scrollWidth / 2;
    const bandTween = gsap.to(band, { x: -half, duration: half / 40, ease: 'none', repeat: -1 });
    band.parentElement.addEventListener('pointerenter', () => bandTween.pause());
    band.parentElement.addEventListener('pointerleave', () => bandTween.resume());
  }

  // stat count-up
  $$('.stat__num').forEach(el => {
    const target = parseFloat(el.dataset.count); if (isNaN(target)) return;
    const dec = (target % 1 !== 0) ? 1 : 0; const obj = { v: 0 };
    gsap.to(obj, { v: target, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => { el.textContent = obj.v.toFixed(dec); } });
  });

  // recalc accordion height on resize
  window.addEventListener('resize', () => {
    const open = $('#acc .acc__item.is-open');
    if (open) $('.acc__body', open).style.maxHeight = $('.acc__body', open).scrollHeight + 'px';
  });
})();
