/* Parô · deck com animações por slide e por clique (GSAP). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const stage = $('#stage');
  const slides = $$('.slide');
  const N = slides.length;

  /* ---------- escala do palco ---------- */
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `scale(${s})`;
  }
  addEventListener('resize', fit);
  fit();

  /* ---------- montagem de partes geradas ---------- */
  function buildVChart(el) {
    const bars = JSON.parse(el.dataset.bars);
    let html = '<i class="grid" style="top:100px"></i><i class="grid" style="top:200px"></i><i class="grid" style="top:300px"></i><i class="base"></i>';
    bars.forEach(([cat, pct, hi], i) => {
      const h = pct * 4, top = 400 - h;
      html += `<div class="bar${hi ? ' hi' : ''}" style="left:${37 + i * 130}px;height:${h}px"></div>`;
      html += `<div class="val${hi ? ' hi' : ''}" style="left:${i * 130}px;top:${top - (hi ? 40 : 32)}px"><span class="n" data-to="${pct}">${pct}</span>%</div>`;
      html += `<div class="cat${hi ? ' hi' : ''}" style="left:${i * 130 + 4}px">${cat}</div>`;
    });
    el.innerHTML = html;
  }
  function buildHChart(el) {
    const bars = JSON.parse(el.dataset.bars);
    let html = '<i class="axis"></i>';
    bars.forEach(([lab, pct, hi], i) => {
      const w = Math.round(pct * 9.4), y = i * 88;
      html += `<div class="lab${hi ? ' hi' : ''}" style="top:${y + 8}px">${lab}</div>`;
      html += `<div class="bar${hi ? ' hi' : ''}" style="top:${y}px;width:${w}px"></div>`;
      html += `<div class="val${hi ? ' hi' : ''}" style="left:${314 + w}px;top:${y + 8}px"><span class="n" data-to="${pct}">${pct}</span>%</div>`;
    });
    el.innerHTML = html;
  }
  function buildPRow(el) {
    const [who, n, parts, tot, hi] = JSON.parse(el.dataset.row);
    const cores = [['#c4e2f8', '#191919'], ['#5e9be0', '#191919'], ['#2f5f94', '#e8e7e4']];
    let x = 460, html = `<div class="who">${who}</div><div class="nn">n=${n}</div>`;
    parts.forEach((p, i) => {
      const w = Math.round(p * 10.57);
      const r = i === parts.length - 1 ? 'border-radius:0 8px 8px 0;' : '';
      html += `<div class="seg" style="left:${x}px;width:${w}px;background:${cores[i][0]};color:${cores[i][1]};${r}"><span>${p}%</span></div>`;
      x += w + 2;
    });
    html += `<div class="tot${hi ? ' hi' : ''}"><span class="n" data-to="${tot}">${tot}</span>%</div>`;
    el.innerHTML = html;
  }
  function buildMilestone(el) {
    const x = +el.dataset.x, up = el.dataset.pos === 'up', now = el.dataset.state === 'now';
    el.style.left = x + 'px';
    const txt = el.innerHTML;
    const stemTop = up ? 575 : (now ? 644 : 637);
    const txtTop = up ? 432 : 680;
    el.innerHTML = `<div class="stem" style="top:${stemTop}px"></div>${now ? '<div class="ring"></div>' : ''}<div class="dot"></div><div class="txt" style="top:${txtTop}px">${txt}</div>`;
  }
  $$('.vchart').forEach(buildVChart);
  $$('.hchart').forEach(buildHChart);
  $$('.prow').forEach(buildPRow);
  $$('.ms').forEach(buildMilestone);

  /* ---------- utilitários de animação ---------- */
  function words(el) {
    if (!el) return [];
    if (!el.dataset.split) {
      const walk = (node) => {
        [...node.childNodes].forEach((c) => {
          if (c.nodeType === 3) {
            const parts = c.textContent.split(/(\s+)/);
            const frag = document.createDocumentFragment();
            parts.forEach((p) => {
              if (!p) return;
              if (/^\s+$/.test(p)) frag.appendChild(document.createTextNode(p));
              else { const s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); }
            });
            c.replaceWith(frag);
          } else if (c.nodeType === 1 && c.tagName !== 'BR') walk(c);
        });
      };
      walk(el);
      el.dataset.split = '1';
    }
    return $$('.w', el);
  }
  const fmt = (v) => Math.round(v).toLocaleString('pt-BR');
  function count(tl, els, at, dur = 1.4) {
    els.forEach((el) => {
      const to = +el.dataset.to, o = { v: 0 };
      el.textContent = '0';
      tl.fromTo(o, { v: 0 }, { v: to, duration: dur, ease: 'power3.out', onUpdate: () => { el.textContent = fmt(o.v); } }, at);
    });
  }
  const E = { out: 'expo.out', p3: 'power3.out', io: 'power2.inOut' };

  function head(tl, el, at = 0) {
    const eb = $(':scope > .eyebrow', el);
    const t = $(':scope > .h1, :scope > .display', el);
    const lead = $(':scope > .lead', el);
    const pg = $(':scope > .pg', el);
    if (eb) tl.fromTo(eb, { opacity: 0, letterSpacing: '0.42em' }, { opacity: 1, letterSpacing: '0.14em', duration: 0.9, ease: E.out }, at);
    let end = at + 0.3;
    if (t) {
      const w = words(t);
      tl.fromTo(w, { opacity: 0, filter: 'blur(10px)', y: 14 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.6, stagger: 0.06, ease: E.p3, clearProps: 'filter' }, at + 0.12);
      end = at + 0.12 + w.length * 0.06 + 0.2;
    }
    if (lead) tl.fromTo(words(lead), { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.012, ease: 'none' }, end);
    if (pg) tl.fromTo(pg, { opacity: 0 }, { opacity: 1, duration: 0.6 }, at + 0.4);
    return end;
  }
  function cardsIn(tl, els, at, from = { y: 50 }, stagger = 0.1) {
    tl.fromTo(els, { opacity: 0, scale: 0.96, filter: 'blur(6px)', x: 0, y: 0, ...from },
      { opacity: 1, scale: 1, filter: 'blur(0px)', x: 0, y: 0, duration: 0.9, stagger, ease: E.out, clearProps: 'filter' }, at);
  }
  function fadeUp(tl, els, at, y = 16, stagger = 0.05) {
    tl.fromTo(els, { opacity: 0, y }, { opacity: 1, y: 0, duration: 0.7, stagger, ease: E.p3 }, at);
  }
  function draw(tl, paths, at, dur = 0.6, stagger = 0) {
    paths.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = L; });
    tl.fromTo(paths, { strokeDashoffset: (i, p) => p.getTotalLength() }, { strokeDashoffset: 0, duration: dur, stagger, ease: E.io }, at);
  }
  function logoIn(tl, logo, at) {
    const p = $$('path', logo);
    const blue = p.slice(0, 4), hat = p[4], letters = p.slice(5);
    tl.fromTo(letters, { opacity: 0, y: 40, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.06, ease: E.out }, at);
    tl.fromTo(blue, { opacity: 0, scale: 0, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.7, stagger: 0.05, ease: 'back.out(1.7)' }, at + 0.35);
    tl.fromTo(hat, { opacity: 0, y: -70 }, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(2.2)' }, at + 0.6);
  }
  function vchartIn(tl, chart, at) {
    tl.fromTo($$('.grid, .base', chart), { scaleX: 0, transformOrigin: '0 50%' }, { scaleX: 1, duration: 0.8, stagger: 0.05, ease: E.out }, at);
    const bars = $$('.bar', chart);
    tl.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 1.1, stagger: 0.08, ease: E.out }, at + 0.2);
    tl.fromTo($$('.cat', chart), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05 }, at + 0.2);
    const vals = $$('.val', chart);
    tl.fromTo(vals, { opacity: 0, y: (i, el) => +el.style.top.replace('px', '') > 300 ? 20 : 60 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, ease: E.out }, at + 0.2);
    count(tl, $$('.n', chart), at + 0.2, 1.2);
  }

  /* ---------- definição de cada slide ---------- */
  // enter(tl, el, ctx): animação de chegada. builds: uma função por clique.
  const defs = {
    s1: {
      enter(tl, el) {
        logoIn(tl, $('#s1-logo', el), 0.1);
        tl.fromTo('#s1-eyebrow', { opacity: 0, letterSpacing: '0.5em' }, { opacity: 1, letterSpacing: '0.14em', duration: 1, ease: E.out }, 0.55);
        tl.fromTo(words($('#s1-title', el)), { opacity: 0, filter: 'blur(14px)', y: 24 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, stagger: 0.08, ease: E.p3, clearProps: 'filter' }, 0.7);
        tl.fromTo('#s1-credits', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: E.p3 }, 1.3);
        tl.fromTo('#s1-p1', { opacity: 0, y: 360, rotation: -10 }, { opacity: 1, y: 0, rotation: 0, duration: 1.5, ease: E.out }, 0.45);
        tl.fromTo('#s1-p2', { opacity: 0, y: 460, rotation: 8 }, { opacity: 1, y: 0, rotation: 0, duration: 1.6, ease: E.out }, 0.62);
      },
    },
    s2: {
      enter(tl, el) {
        const t = head(tl, el);
        const stats = $$('.stat', el);
        cardsIn(tl, stats, t - 0.2, { x: 90 }, 0.13);
        count(tl, $$('.n', el), t - 0.05, 1.6);
      },
      builds: [(tl, el) => {
        const q = $('#s2-quote', el);
        cardsIn(tl, q, 0, { y: 80 });
        tl.fromTo(words($('p', q)), { opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.45, stagger: 0.035, ease: E.p3, clearProps: 'filter' }, 0.35);
      }],
    },
    s3: {
      enter(tl, el) {
        const iso = $('.iso', el);
        draw(tl, $$('path', iso), 0, 2.4, 0.12);
        tl.fromTo(iso, { x: 120, opacity: 0 }, { x: 0, opacity: 0.45, duration: 3, ease: 'power2.out' }, 0);
        tl.fromTo($('.section-num .d', el), { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.9, ease: E.out }, 0.1);
        tl.fromTo($('.section-num .col', el), { y: 300, opacity: 0 }, { y: -600, opacity: 1, duration: 1.3, ease: 'power4.inOut' }, 0.2);
        tl.fromTo(words($('.h1', el)), { opacity: 0, filter: 'blur(12px)', x: -20 }, { opacity: 1, filter: 'blur(0px)', x: 0, duration: 0.7, stagger: 0.08, ease: E.p3, clearProps: 'filter' }, 0.9);
        tl.fromTo(words($('.lead', el)), { opacity: 0 }, { opacity: 1, duration: 0.35, stagger: 0.015 }, 1.3);
        tl.fromTo($('.pg', el), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6);
      },
    },
    s4: {
      enter(tl, el) {
        const t = head(tl, el);
        cardsIn(tl, $$('.metric', el), t - 0.25, { y: 60 }, 0.1);
        count(tl, $$('.metric .n', el), t - 0.1, 1.5);
      },
      builds: [(tl, el) => {
        tl.fromTo('#s4-night', { opacity: 0, letterSpacing: '0.42em' }, { opacity: 1, letterSpacing: '0.14em', duration: 0.8, ease: E.out }, 0);
        tl.fromTo('#s4-track', { clipPath: 'inset(0 100% 0 0 round 16px)', opacity: 1 }, { clipPath: 'inset(0 0% 0 0 round 16px)', duration: 1.1, ease: 'power3.inOut' }, 0.05);
        tl.fromTo($$('.hours span', el), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09 }, 0.15);
        tl.fromTo($$('.win', el), { clipPath: 'inset(0 100% 0 0 round 12px)' }, { clipPath: 'inset(0 0% 0 0 round 12px)', duration: 0.8, stagger: 0.35, ease: E.out }, 0.8);
      }],
    },
    s5: {
      enter(tl, el) {
        const t = head(tl, el);
        fadeUp(tl, $('#s5-h1', el), t - 0.2);
        vchartIn(tl, $('#s5-c1', el), t);
      },
      builds: [(tl, el) => {
        fadeUp(tl, $('#s5-h2', el), 0);
        vchartIn(tl, $('#s5-c2', el), 0.1);
      }],
    },
    s6: {
      enter(tl, el) {
        const t = head(tl, el);
        const c = $('#s6-c1', el);
        fadeUp(tl, $(':scope > .chart-head', el), t - 0.2);
        tl.fromTo($('.axis', c), { scaleY: 0, transformOrigin: '50% 0' }, { scaleY: 1, duration: 0.7, ease: E.out }, t);
        tl.fromTo($$('.lab', c), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.07, ease: E.p3 }, t + 0.1);
        tl.fromTo($$('.bar', c), { scaleX: 0 }, { scaleX: 1, duration: 1.1, stagger: 0.08, ease: E.out }, t + 0.25);
        tl.fromTo($$('.val', c), { opacity: 0, x: (i, v) => -parseInt(v.style.left, 10) + 320 }, { opacity: 1, x: 0, duration: 1.1, stagger: 0.08, ease: E.out }, t + 0.25);
        count(tl, $$('.n', c), t + 0.25, 1.2);
      },
      builds: [(tl, el) => {
        fadeUp(tl, $('#s6-h2', el), 0);
        tl.fromTo($$('#s6-stack .seg', el), { scaleX: 0 }, { scaleX: 1, duration: 0.8, stagger: 0.25, ease: E.out }, 0.15);
        fadeUp(tl, $$('.legend-big', el), 0.3, 24, 0.15);
        count(tl, $$('.legend-big .n', el), 0.3, 1.2);
        cardsIn(tl, $('#s6-note', el), 1.0, { y: 40 });
      }],
    },
    s7: {
      enter(tl, el) {
        const t = head(tl, el);
        cardsIn(tl, $$('.flow', el)[0], t - 0.1, { x: -60 });
      },
      builds: [1, 2, 3].map((i) => (tl, el) => {
        const arrow = $$('.arrow', el)[i - 1], card = $$('.flow', el)[i];
        tl.fromTo(arrow, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.5, ease: E.out }, 0);
        draw(tl, $$('path', arrow), 0, 0.45, 0.1);
        cardsIn(tl, card, 0.15, { x: -70 });
        tl.fromTo(words($('p', card)), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.02 }, 0.4);
        if (i === 3) tl.fromTo(card, { boxShadow: '0 0 0px 0px rgba(110,168,255,0)' }, { boxShadow: '0 0 60px 6px rgba(110,168,255,.28)', duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0.8);
      }),
    },
    s8: {
      enter(tl, el) {
        const t = head(tl, el);
        cardsIn(tl, $$('.step', el)[0], t, { x: -80 });
      },
      builds: [1, 2].map((i) => (tl, el) => {
        const c = $$('.step', el)[i];
        cardsIn(tl, c, 0, { x: 80 });
        tl.fromTo($('b', c), { opacity: 0, scale: 0.4, transformOrigin: '50% 60%' }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)' }, 0.25);
      }),
    },
    s9: {
      enter(tl, el) {
        const t = head(tl, el);
        const mac = $('#s9-mac', el);
        tl.fromTo(mac, { opacity: 0, y: 60, scale: 0.94, filter: 'blur(10px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: E.out, clearProps: 'filter' }, t - 0.5);
        const lines = $$('.code .l', mac);
        tl.fromTo(lines, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.38, stagger: 0.11, ease: 'power1.out' }, t + 0.15);
        tl.fromTo($$('.code .ln b', mac), { opacity: 0 }, { opacity: 1, duration: 0.2, stagger: 0.11 }, t + 0.1);
      },
      builds: [(tl, el) => { cardsIn(tl, $$('.rule', el), 0, { x: -60 }, 0.12); }],
    },
    sStack: {
      enter(tl, el) {
        const t = head(tl, el);
        const layers = $$('.layer', el);
        cardsIn(tl, layers, t - 0.3, { y: 70 }, 0.12);
        layers.forEach((layer, i) => {
          const at = t - 0.05 + i * 0.12;
          tl.fromTo($('.eyebrow', layer), { opacity: 0, letterSpacing: '0.42em' }, { opacity: 1, letterSpacing: '0.14em', duration: 0.8, ease: E.out }, at);
          tl.fromTo($$('.tile', layer), { opacity: 0, scale: 0.4, rotation: -14 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.7, stagger: 0.09, ease: 'back.out(2)' }, at + 0.15);
          tl.fromTo($$('.tech > div', layer), { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.09, ease: E.p3 }, at + 0.22);
        });
      },
    },
    s10: {
      enter(tl, el) {
        const t = head(tl, el);
        const phones = $$('.phone', el);
        tl.fromTo(phones, { opacity: 0, y: (i) => [260, 340, 260][i], rotation: (i) => [-6, 0, 6][i] },
          { opacity: 1, y: 0, rotation: 0, duration: 1.4, stagger: 0.12, ease: E.out }, 0.3);
        cardsIn(tl, $$('.row', el), t, { x: -50 }, 0.1);
        tl.fromTo($$('.rowtxt', el), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, stagger: 0.1, ease: E.p3 }, t + 0.15);
      },
    },
    s11: {
      morphFromPrev: true,
      enter(tl, el, ctx) {
        const rows = $$('.row', el), phones = $$('.phone', el), txt = $$('.rowtxt', el);
        if (!ctx.morph) { defs.s10.enter(tl, el); return; }
        head(tl, el, 0.15);
        // Os celulares e cartões do slide 10 continuam embaixo; aqui só as telas e os textos trocam.
        tl.set(rows, { opacity: 0 }, 0);
        tl.set(phones, { opacity: 1, backgroundColor: 'transparent', boxShadow: 'none' }, 0);
        const imgs = $$('.screen img', el);
        tl.fromTo(imgs, { clipPath: 'inset(100% 0 0 0)', scale: 1.08 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.1, stagger: 0.16, ease: 'power3.inOut' }, 0.2);
        tl.fromTo(txt, { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.5, stagger: 0.12, ease: E.p3, clearProps: 'filter' }, 0.35);
        tl.set(rows, { opacity: 1 }, 1.6);
        tl.set(phones, { clearProps: 'backgroundColor,boxShadow' }, 1.6);
        tl.call(() => ctx.hidePrev && ctx.hidePrev(), null, 1.6);
      },
    },
    s12: {
      enter(tl, el) {
        const t = head(tl, el);
        fadeUp(tl, ['#s12-legend', '#s12-sum'], t - 0.2, 10, 0.1);
        $$('.prow', el).forEach((r, i) => {
          const at = t + i * 0.28;
          fadeUp(tl, $$('.who, .nn', r), at, 10, 0.05);
          tl.fromTo($$('.seg', r), { scaleX: 0 }, { scaleX: 1, duration: 0.75, stagger: 0.14, ease: 'power3.out' }, at + 0.1);
          tl.fromTo($$('.seg span', r), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.14 }, at + 0.5);
          tl.fromTo($('.tot', r), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, ease: E.out }, at + 0.55);
          count(tl, [$('.tot .n', r)], at + 0.55, 1.1);
        });
      },
      builds: [(tl, el) => { cardsIn(tl, $('#s12-note', el), 0, { y: 40 }); }],
    },
    s13: {
      enter(tl, el) {
        const t = head(tl, el);
        fadeUp(tl, $$('.thead span', el), t - 0.2, 8, 0.08);
        $$('.trow', el).forEach((r, i) => {
          const at = t + 0.05 + i * 0.13;
          tl.fromTo($('i', r), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: E.out }, at);
          tl.fromTo($$('b, span', r), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: E.p3 }, at + 0.1);
        });
      },
    },
    s14: {
      enter(tl, el) {
        const t = head(tl, el);
        const D = 2.4;
        tl.fromTo($('.tl-line.done', el), { scaleX: 0 }, { scaleX: 1, duration: D, ease: 'power1.inOut' }, t);
        $$('.ms', el).filter((m) => m.dataset.state !== 'todo').forEach((m) => {
          const x = +m.dataset.x, up = m.dataset.pos === 'up';
          const at = t + Math.max(0, (x - 120) / 1120) * D * 0.92;
          tl.fromTo($('.dot', m), { scale: 0 }, { scale: 1, duration: 0.55, ease: 'back.out(2.5)' }, at);
          tl.fromTo($('.stem', m), { scaleY: 0, transformOrigin: up ? '50% 100%' : '50% 0' }, { scaleY: 1, duration: 0.35, ease: E.p3 }, at + 0.1);
          tl.fromTo($('.txt', m), { opacity: 0, y: up ? 18 : -18 }, { opacity: 1, y: 0, duration: 0.7, ease: E.p3 }, at + 0.15);
          if (m.dataset.state === 'now') tl.fromTo($('.ring', m), { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 2.6, duration: 1.1, ease: 'power2.out' }, at + 0.3);
        });
      },
      builds: [(tl, el) => {
        tl.fromTo($('.tl-line.todo', el), { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, 0);
        $$('.ms[data-state="todo"]', el).forEach((m, i) => {
          const up = m.dataset.pos === 'up', at = 0.35 + i * 0.5;
          tl.fromTo($('.dot', m), { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)' }, at);
          tl.fromTo($('.stem', m), { scaleY: 0, transformOrigin: up ? '50% 100%' : '50% 0' }, { scaleY: 1, duration: 0.35 }, at + 0.1);
          tl.fromTo($('.txt', m), { opacity: 0, y: up ? 18 : -18 }, { opacity: 1, y: 0, duration: 0.7, ease: E.p3 }, at + 0.15);
        });
      }],
    },
    s15: {
      enter(tl, el) {
        const t = head(tl, el);
        const ph = $('.phases', el);
        tl.fromTo(ph, { clipPath: 'inset(0 100% 0 0 round 16px)' }, { clipPath: 'inset(0 0% 0 0 round 16px)', duration: 1.1, ease: 'power3.inOut' }, t - 0.2);
        tl.fromTo($$('.ph', ph), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.25 }, t + 0.1);
        cardsIn(tl, $$('.phase-card', el)[0], t + 0.4, { y: 70 });
      },
      builds: [1, 2].map((i) => (tl, el) => {
        const c = $$('.phase-card', el)[i];
        cardsIn(tl, c, 0, { y: 70 });
        fadeUp(tl, $$('li', c), 0.3, 10, 0.08);
      }),
    },
    s16: {
      enter(tl, el) {
        const t = head(tl, el);
        cardsIn(tl, $$('.goal', el), t - 0.25, { y: 60, scale: 0.9 }, 0.1);
        count(tl, $$('.goal .n', el), t - 0.1, 1.6);
      },
      builds: [(tl, el) => {
        tl.fromTo($$('.ch-head span', el), { opacity: 0, letterSpacing: '0.42em' }, { opacity: 1, letterSpacing: '0.14em', duration: 0.8, stagger: 0.1, ease: E.out }, 0);
        $$('.crow', el).forEach((r, i) => {
          const at = 0.1 + i * 0.16;
          tl.fromTo($('i', r), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: E.out }, at);
          tl.fromTo($$('b, p', r), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: E.p3 }, at + 0.1);
        });
      }],
    },
    s17: {
      enter(tl, el) {
        const t = head(tl, el);
        const qr = $('.qr', el);
        tl.fromTo(qr, { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: E.out }, t - 0.2);
        tl.fromTo($('img', qr), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power2.inOut' }, t);
        tl.fromTo($('.scan', qr), { y: 0, opacity: 1 }, { y: 586, duration: 1.3, ease: 'power2.inOut' }, t);
        tl.to($('.scan', qr), { opacity: 0, duration: 0.4 }, t + 1.3);
      },
    },
    s18: {
      enter(tl, el) {
        tl.fromTo($('.radar', el), { opacity: 0, scale: 0.8, transformOrigin: '50% 0%' }, { opacity: 0.25, scale: 1, duration: 2.4, ease: E.out }, 0.1);
        logoIn(tl, $('#s18-logo', el), 0.2);
        tl.fromTo(words($('.closing', el)), { opacity: 0, filter: 'blur(14px)', y: 20 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, stagger: 0.09, ease: E.p3, clearProps: 'filter' }, 1.0);
        tl.fromTo($('.closing-sub', el), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, ease: E.p3 }, 1.9);
      },
    },
  };

  /* ---------- fundo que se move entre slides ---------- */
  const glows = [
    [0, 0, 0, 0], [-120, 80, 80, -60], [-500, 200, 200, -200], [-200, 40, 120, 0], [0, 120, 0, -80], [-80, 160, 60, -120],
    [-260, 60, 160, -40], [-80, 300, 40, -260], [-360, 120, 240, -140], [-280, -120, 180, 60], [-140, 0, 60, -40], [-120, 20, 70, -50], [-40, 140, 0, -100],
    [-220, 80, 140, -60], [-60, 200, 40, -160], [-300, 140, 200, -100], [-120, 60, 100, -20], [-450, 300, 320, -300], [-560, 360, 560, -400],
  ];
  function moveGlow(i, instant) {
    const g = glows[i] || glows[0];
    const vars = { duration: instant ? 0 : 1.8, ease: 'power2.inOut', overwrite: true };
    gsap.to('#glow-a', { x: g[0], y: g[1], ...vars });
    gsap.to('#glow-b', { x: g[2], y: g[3], ...vars });
  }

  /* ---------- navegação ---------- */
  let cur = -1, step = 0, enterTl = null, buildTls = [], outTween = null, morphOut = null;
  const active = new Set();

  function revertSlide(el) {
    (el._tls || []).forEach((t) => t.revert());
    el._tls = [];
    gsap.set(el, { clearProps: 'opacity,filter,scale,transform' });
    $$(':scope > *', el).forEach((k) => gsap.set(k, { clearProps: 'opacity,filter' }));
    el.classList.remove('on');
  }

  function prepare(i, ctx) {
    const el = slides[i], def = defs[el.id] || {};
    const tl = gsap.timeline({ paused: true });
    if (def.enter) def.enter(tl, el, ctx);
    const bs = (def.builds || []).map((fn) => { const t = gsap.timeline({ paused: true }); fn(t, el); return t; });
    el._tls = [tl, ...bs];
    return { tl, bs };
  }

  function updateProgress() {
    const nb = buildTls.length;
    const frac = (cur + (nb ? step / (nb + 1) : 0)) / (N - 1);
    gsap.to('#progress i', { scaleX: Math.min(1, frac), duration: 0.6, ease: E.io });
    history.replaceState(null, '', '#' + (cur + 1));
  }

  function finishAll() {
    let busy = false;
    for (const t of [outTween, morphOut, enterTl, ...buildTls]) {
      if (t && t.isActive && t.isActive()) { t.progress(1); busy = true; }
    }
    return busy;
  }

  function show(i, { full = false, dir = 1 } = {}) {
    if (i < 0 || i >= N || i === cur) return;
    const prevIdx = cur, prev = prevIdx >= 0 ? slides[prevIdx] : null, next = slides[i];
    const def = defs[next.id] || {};
    const morph = !full && dir > 0 && prevIdx === i - 1 && !!def.morphFromPrev;

    // saída
    if (prev) {
      if (morph) {
        const leave = $$(':scope > *:not([data-keep])', prev);
        morphOut = gsap.to(leave, { opacity: 0, filter: 'blur(8px)', duration: 0.35, ease: 'power2.in', overwrite: 'auto' });
      } else {
        const p = prev;
        outTween = gsap.to(p, { opacity: 0, filter: 'blur(12px)', scale: dir > 0 ? 1.02 : 0.98, duration: full ? 0.25 : 0.4, ease: 'power2.in', onComplete: () => revertSlide(p) });
      }
    }

    cur = i; step = 0;
    next.classList.add('on');
    gsap.set(next, { opacity: 1, filter: 'none', scale: 1 });
    const hidePrev = () => { if (prev && prev !== slides[cur] && prev.classList.contains('on')) revertSlide(prev); };
    const { tl, bs } = prepare(i, { morph, hidePrev });
    enterTl = tl; buildTls = bs;
    moveGlow(i, false);

    if (full) {
      tl.progress(1); bs.forEach((b) => b.progress(1)); step = bs.length;
      gsap.fromTo(next, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: 0.15 });
    } else if (morph) {
      const p = prev;
      tl.eventCallback('onComplete', () => { if (p !== slides[cur] && p.classList.contains('on')) revertSlide(p); });
      tl.play(0);
    } else {
      gsap.delayedCall(prev ? 0.28 : 0, () => { if (enterTl === tl) tl.play(0); });
    }
    updateProgress();
  }

  function next() {
    document.body.classList.add('started');
    if (finishAll()) return;
    if (step < buildTls.length) { buildTls[step].play(0); step++; updateProgress(); return; }
    show(cur + 1, { dir: 1 });
  }
  function prev() {
    if (finishAll()) { /* conclui e volta */ }
    show(cur - 1, { full: true, dir: -1 });
  }

  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); prev(); }
    else if (k === 'Home') show(0, { full: false, dir: -1 });
    else if (k === 'End') show(N - 1, { full: true, dir: 1 });
    else if (k === 'f' || k === 'F') {
      if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen();
    }
  });
  addEventListener('click', (e) => { if (e.button === 0) next(); });
  addEventListener('contextmenu', (e) => { e.preventDefault(); prev(); });

  const start = Math.min(N, Math.max(1, parseInt(location.hash.slice(1), 10) || 1)) - 1;
  const go = () => { moveGlow(start, true); show(start, { full: start > 0 }); };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);

  // ganchos para conferência
  window.deck = { show, next, prev, get cur() { return cur; }, get step() { return step; }, get tl() { return enterTl; }, finishAll };
})();
