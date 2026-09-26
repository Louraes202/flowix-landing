/* Flowix landing — interactions. No dependencies. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const toggle = $(".nav__toggle");
  const menu = $("#menu");
  const onScrollNav = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    menu.hidden = !open;
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Active section in nav
  const navLinks = $$(".nav__links a");
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => sectionObs.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      en.target.dispatchEvent(new CustomEvent("revealed"));
      revealObs.unobserve(en.target);
    });
  }, { threshold: 0.18 });
  $$(".reveal").forEach((el) => revealObs.observe(el));

  /* ---------- Hero background (canvas) ----------
     Back to front:
     1. Stars, as on the current flowix.pt: twinkle, slow drift, a little parallax.
     2. Flow constellation: some stars are square nodes (the Flowix mark), linked
        at 45 degrees like the mark. Pulses hop node to node, in chains, like data in a flow.
     3. Wide screens only: the ribbon of thin lines from the brand posts.
     Now and then a shooting star crosses at 45 degrees. */
  const canvas = $("#flow");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = 1, running = true, visible = true, raf = 0, last = 0;
    let wide = false, nextPulse = 0, nextShooter = 0, speed = 0.16;
    const LINES = 34;
    const stars = [], nodes = [], links = [], pulses = [], shooters = [], ribbonPulses = [];
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const rnd = (a, b) => a + Math.random() * (b - a);

    // Diagonal first, then straight: the 45-degree strokes of the mark.
    const route = (a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.min(Math.abs(dx), Math.abs(dy));
      const c = { x: a.x + Math.sign(dx) * d, y: a.y + Math.sign(dy) * d };
      const l1 = Math.hypot(c.x - a.x, c.y - a.y), l2 = Math.hypot(b.x - c.x, b.y - c.y);
      return { c, l1, len: l1 + l2 };
    };
    const pointOn = (lk, s) => {
      const a = nodes[lk.a], b = nodes[lk.b], { c, l1, len } = lk;
      s = clamp(s, 0, len);
      if (s <= l1) { const k = l1 ? s / l1 : 0; return { x: a.x + (c.x - a.x) * k, y: a.y + (c.y - a.y) * k }; }
      const k = (s - l1) / (len - l1 || 1);
      return { x: c.x + (b.x - c.x) * k, y: c.y + (b.y - c.y) * k };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height; wide = W >= 1000;
      speed = wide ? 0.16 : 0.12;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars.length = 0;
      const ns = Math.round((W * H) / (wide ? 7000 : 5500));
      for (let i = 0; i < ns; i++) {
        const z = Math.random();
        stars.push({ x: Math.random() * W, y: Math.random() * H, z, r: 0.35 + z * z * 1.25, p: rnd(0, 6.28), f: rnd(0.0006, 0.0022) });
      }

      // Keep nodes and links clear of the copy, the card and the partner logos.
      const keepOut = [".hero__copy", ".flowcard", ".partners", ".nav__inner"].map((s) => {
        const b = $(s).getBoundingClientRect();
        return { x0: b.left - r.left - 20, y0: b.top - r.top - 20, x1: b.right - r.left + 20, y1: b.bottom - r.top + 20 };
      });
      const blocked = (x, y) => keepOut.some((k) => x > k.x0 && x < k.x1 && y > k.y0 && y < k.y1);

      nodes.length = 0; links.length = 0; pulses.length = 0; shooters.length = 0;
      const target = clamp(Math.round((W * H) / 90000), 6, 14);
      for (let tries = 0; nodes.length < target && tries < 600; tries++) {
        const n = { x: rnd(12, W - 12), y: rnd(12, H - 12), e: 0 };
        if (blocked(n.x, n.y)) continue;
        if (nodes.some((m) => Math.hypot(m.x - n.x, m.y - n.y) < (wide ? 150 : 90))) continue;
        nodes.push(n);
      }
      const maxD = wide ? 220 : 170;
      nodes.forEach((a, i) => {
        nodes.map((b, j) => ({ j, d: Math.hypot(b.x - a.x, b.y - a.y) }))
          .filter((o) => o.j !== i && o.d < maxD).sort((p, q) => p.d - q.d).slice(0, 2)
          .forEach(({ j }) => {
            if (links.some((l) => (l.a === i && l.b === j) || (l.a === j && l.b === i))) return;
            const lk = { a: i, b: j, e: 0, ...route(a, nodes[j]) };
            for (let s = 0; s <= lk.len; s += 12) { const p = pointOn(lk, s); if (blocked(p.x, p.y)) return; }
            links.push(lk);
          });
      });

      ribbonPulses.length = 0;
      if (wide) for (let i = 0; i < 0; i++) ribbonPulses.push({ line: Math.floor(Math.random() * LINES), x: Math.random(), s: rnd(0.00005, 0.00011) });
    };

    const spawn = (lk, from) => { if (lk) pulses.push({ lk, from, d: 0 }); };
    const linksAt = (ni) => links.filter((l) => l.a === ni || l.b === ni);

    // Ribbon line i at u (0..1). Wide screens only.
    const lineY = (i, u, t) => {
      const k = i / (LINES - 1) - 0.5;
      const base = H * (0.97 - Math.sign(u) * Math.abs(u) ** 1.6 * 0.6); // u < 0 off-screen: pow alone gives NaN
      const drift = Math.sin(u * Math.PI * 1.3 + t * 0.00018) * H * 0.05;
      const width = H * 0.24 * (0.35 + 0.65 * Math.sin(u * Math.PI));
      const twist = Math.cos(u * Math.PI * 2.1 - t * 0.00025 + 0.8);
      return base + drift + k * width * twist + Math.sin(u * 9 + t * 0.0006 + k * 2) * 3;
    };

    const glow = (x, y, rad, a) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(170,205,255,${a})`);
      g.addColorStop(0.3, `rgba(26,110,255,${a * 0.5})`);
      g.addColorStop(1, "rgba(26,110,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    };

    const draw = (t) => {
      const dt = last ? Math.min(t - last, 50) : 16; last = t;
      const moving = !reduceMotion;
      ctx.clearRect(0, 0, W, H);
      ptr.x += (ptr.tx - ptr.x) * 0.04; ptr.y += (ptr.ty - ptr.y) * 0.04;

      // 1. stars
      for (const s of stars) {
        if (moving) { s.y -= s.z * 0.004 * dt; if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; } }
        const a = 0.12 + 0.45 * Math.sin(t * s.f + s.p) ** 2 * (0.4 + s.z * 0.6);
        const x = s.x + ptr.x * s.z * 14, y = s.y + ptr.y * s.z * 10;
        ctx.fillStyle = `rgba(200,218,255,${a})`;
        if (s.r > 1.1) { ctx.beginPath(); ctx.arc(x, y, s.r * 0.75, 0, 6.2832); ctx.fill(); }
        else ctx.fillRect(x, y, s.r, s.r);
      }

      ctx.globalCompositeOperation = "lighter";

      // 3. ribbon, drawn under the constellation
      if (wide) {
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, "rgba(26,110,255,0)");
        grad.addColorStop(0.2, "rgba(26,110,255,0.32)");
        grad.addColorStop(0.7, "rgba(26,110,255,0.42)");
        grad.addColorStop(1, "rgba(80,90,255,0.12)");
        ctx.strokeStyle = grad;
        const step = Math.max(6, W / 180);
        for (let i = 0; i < LINES; i++) {
          const k = Math.abs(i / (LINES - 1) - 0.5) * 2;
          ctx.globalAlpha = 0.25 + (1 - k) * 0.6;
          ctx.lineWidth = i % 6 === 0 ? 1.1 : 0.6;
          ctx.beginPath();
          for (let x = -step; x <= W + step; x += step) {
            const y = lineY(i, x / W, t);
            x === -step ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (const p of ribbonPulses) {
          if (moving) { p.x += p.s * dt; if (p.x > 1.05) { p.x = -0.05; p.line = Math.floor(Math.random() * LINES); } }
          glow(p.x * W, lineY(p.line, p.x, t), 16, 0.8);
        }
      }

      // 2. constellation: links, pulses, nodes
      ctx.save(); ctx.translate(ptr.x * 8, ptr.y * 6); // nodes sit at mid depth
      ctx.lineWidth = 1;
      for (const lk of links) {
        lk.e = Math.max(0, lk.e - dt * 0.0004);
        if (lk.e < 0.01) continue;
        const a = nodes[lk.a], b = nodes[lk.b];
        ctx.strokeStyle = `rgba(26,110,255,${lk.e * 0.4})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(lk.c.x, lk.c.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }

      if (moving && t > nextPulse && links.length) {
        if (pulses.length < 2) spawn(links[Math.floor(Math.random() * links.length)], Math.random() < 0.5 ? 0 : 1);
        nextPulse = t + rnd(1800, 3200);
      }
      ctx.lineCap = "round";
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], lk = p.lk;
        if (moving) p.d += speed * dt;
        lk.e = Math.max(lk.e, 0.9);
        const at = (d) => pointOn(lk, p.from === 0 ? d : lk.len - d);
        for (let j = 0; j < 8; j++) { // trail
          const d0 = p.d - j * 6, d1 = p.d - (j + 1) * 6;
          if (d1 < 0) break;
          const q0 = at(Math.min(d0, lk.len)), q1 = at(d1);
          ctx.strokeStyle = `rgba(150,195,255,${0.55 * (1 - j / 8)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(q0.x, q0.y); ctx.lineTo(q1.x, q1.y); ctx.stroke();
        }
        const h = at(Math.min(p.d, lk.len));
        glow(h.x, h.y, 8, 0.6);
        if (p.d >= lk.len) {
          const ni = p.from === 0 ? lk.b : lk.a;
          nodes[ni].e = 1;
          pulses.splice(i, 1);
          if (Math.random() < 0.6) { // the flow carries on
            const next = linksAt(ni).filter((l) => l !== lk);
            if (next.length) { const l = next[Math.floor(Math.random() * next.length)]; spawn(l, l.a === ni ? 0 : 1); }
          }
        }
      }
      ctx.lineWidth = 1;

      const sq = 2.5;
      for (const n of nodes) {
        n.e = Math.max(0, n.e - dt * 0.0009);
        if (n.e > 0.02) glow(n.x, n.y, 8 + n.e * 10, n.e * 0.55);
        ctx.fillStyle = `rgba(120,165,255,${0.3 + n.e * 0.7})`;
        ctx.fillRect(n.x - sq / 2, n.y - sq / 2, sq, sq);
        if (n.e > 0.3) { ctx.fillStyle = `rgba(255,255,255,${n.e * 0.8})`; ctx.fillRect(n.x - 1, n.y - 1, 2, 2); }
      }
      ctx.restore();

      // shooting stars, at the mark's 45 degrees
      if (moving && t > nextShooter) {
        shooters.push({ x: rnd(W * 0.3, W * 1.1), y: rnd(-40, H * 0.3), d: 0, len: rnd(90, 160) });
        nextShooter = t + rnd(9000, 16000);
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.d += 0.7 * dt;
        const k = Math.SQRT1_2, hx = s.x - s.d * k, hy = s.y + s.d * k;
        const fade = clamp(1 - s.d / 700);
        const g = ctx.createLinearGradient(hx, hy, hx + s.len * k, hy - s.len * k);
        g.addColorStop(0, `rgba(220,235,255,${0.6 * fade})`);
        g.addColorStop(1, "rgba(26,110,255,0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + s.len * k, hy - s.len * k); ctx.stroke();
        if (fade <= 0) shooters.splice(i, 1);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const loop = (t) => {
      draw(t);
      if (running && visible && !reduceMotion) raf = requestAnimationFrame(loop);
    };
    const start = () => { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(loop); };
    const still = () => { // reduced motion: one calm frame with part of the network lit
      links.forEach((l, i) => { l.e = i % 3 === 0 ? 0.8 : 0; });
      nodes.forEach((n, i) => { n.e = i % 4 === 0 ? 0.7 : 0; });
      draw(1);
    };

    resize();
    reduceMotion ? still() : start();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduceMotion) still(); }, 150); });
    if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
      window.addEventListener("pointermove", (e) => { ptr.tx = e.clientX / innerWidth - 0.5; ptr.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    }
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !reduceMotion) start(); }).observe(canvas);
    document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running && !reduceMotion) start(); });
  }

  /* ---------- Hero live flow card ----------
     Cycles three example flows. Steps light up in order; the rail fills blue
     between the square nodes, like the strokes between the mark's squares. */
  const FLOWS = [
    { name: "Atendimento", avg: "tempo médio 2,4 s", steps: [
      ["Nova mensagem · WhatsApp", "“Queria marcar uma consulta…”", "0,0 s"],
      ["IA identifica o pedido", "Marcação · quinta-feira", "0,6 s"],
      ["Agenda verificada", "Quinta, 10:30 disponível", "1,3 s"],
      ["Resposta enviada", "Confirmação por email", "2,4 s"],
    ] },
    { name: "Clientes", avg: "tempo médio 3,1 s", steps: [
      ["Novo contacto · site", "Pedido de orçamento", "0,0 s"],
      ["IA qualifica o contacto", "Potencial alto", "0,9 s"],
      ["CRM atualizado", "Ficha criada e atribuída", "1,6 s"],
      ["Follow-up enviado", "Proposta de reunião", "3,1 s"],
    ] },
    { name: "Faturas", avg: "tempo médio 4,8 s", steps: [
      ["Fatura recebida · email", "PDF anexado", "0,0 s"],
      ["Dados extraídos", "NIF, datas e valores", "1,8 s"],
      ["Validação automática", "Sem divergências", "3,2 s"],
      ["Lançada na contabilidade", "Relatório atualizado", "4,8 s"],
    ] },
  ];
  const stepsEl = $("#flowSteps");
  const nameEl = $("#flowName");
  const idxEl = $("#flowIdx");
  const countEl = $("#flowCount");
  const timeEl = $("#flowTime");
  if (stepsEl) {
    let flowIdx = 0, count = 128, cardVisible = true;
    const pad = (n) => String(n).padStart(2, "0");
    const render = (f) => {
      stepsEl.innerHTML = f.steps.map(([t, s, time]) => `
        <li class="fstep">
          <span class="fstep__node"></span>
          <span><strong>${t}</strong><small>${s}</small></span>
          <span class="fstep__t">${time}</span>
        </li>`).join("");
      nameEl.textContent = `Fluxo — ${f.name}`;
      idxEl.textContent = `${pad(flowIdx + 1)} / ${pad(FLOWS.length)}`;
      timeEl.textContent = f.avg;
      stepsEl.style.setProperty("--fill", "0");
    };
    const run = () => {
      const f = FLOWS[flowIdx];
      render(f);
      const items = $$(".fstep", stepsEl);
      if (reduceMotion) { items.forEach((li) => li.classList.add("is-done")); stepsEl.style.setProperty("--fill", "1"); return; }
      let i = 0;
      const tick = () => {
        if (!cardVisible || document.hidden) { setTimeout(tick, 500); return; }
        items.forEach((li, j) => { li.classList.toggle("is-active", j === i); li.classList.toggle("is-done", j < i); });
        stepsEl.style.setProperty("--fill", String(Math.min(i, items.length - 1) / (items.length - 1)));
        i++;
        if (i <= items.length) { setTimeout(tick, 1050); return; }
        items.forEach((li) => { li.classList.remove("is-active"); li.classList.add("is-done"); });
        countEl.textContent = String(++count);
        setTimeout(() => { flowIdx = (flowIdx + 1) % FLOWS.length; run(); }, 1800);
      };
      setTimeout(tick, 500);
    };
    new IntersectionObserver(([en]) => { cardVisible = en.isIntersecting; }).observe(stepsEl);
    run();
  }

  /* ---------- About: words light up with scroll ---------- */
  const about = $("#aboutText");
  if (about) {
    const words = about.textContent.trim().split(/\s+/);
    about.setAttribute("aria-label", about.textContent.trim());
    about.innerHTML = words.map((w) => `<span class="w${/^Flowix/.test(w) ? " brand" : ""}" aria-hidden="true">${w}</span>`).join(" ");
    const spans = $$(".w", about);
    const update = () => {
      const r = about.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduceMotion ? 1 : clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle("on", i < lit));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Method: line fills with scroll ---------- */
  const steps = $("#steps");
  if (steps) {
    const items = $$(".step", steps);
    const update = () => {
      const r = steps.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduceMotion ? 1 : clamp((vh * 0.75 - r.top) / (r.height * 0.9));
      steps.style.setProperty("--p", p.toFixed(3));
      items.forEach((it, i) => it.classList.toggle("is-lit", p >= (i === 0 ? 0.02 : i / (items.length - 1) - 0.02)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Stats count-up ---------- */
  $$(".count").forEach((el) => {
    const to = Number(el.dataset.to);
    const prefix = el.dataset.prefix || "";
    const host = el.closest(".reveal");
    const go = () => {
      if (reduceMotion) { el.textContent = prefix + to; return; }
      const t0 = performance.now(), dur = 1400;
      const f = (now) => {
        const p = clamp((now - t0) / dur);
        el.textContent = prefix + Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    };
    host ? host.addEventListener("revealed", go, { once: true }) : go();
  });

  /* ---------- Solution demos ---------- */
  // Chat plays when visible, then loops
  const chat = $(".demo--chat");
  if (chat) {
    const bubbles = $$(".bubble", chat);
    let playing = false;
    const play = () => {
      if (reduceMotion) { bubbles.forEach((b) => b.classList.add("show")); return; }
      if (playing) return;
      playing = true;
      bubbles.forEach((b) => b.classList.remove("show"));
      bubbles.forEach((b, i) => setTimeout(() => b.classList.add("show"), 400 + i * 900));
      setTimeout(() => { playing = false; }, 400 + bubbles.length * 900 + 4000);
    };
    new IntersectionObserver(([en]) => { if (en.isIntersecting) play(); }, { threshold: 0.5 }).observe(chat);
    setInterval(() => {
      const r = chat.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0 && !document.hidden) play();
    }, 9000);
  }

  // CRM button
  const crmBtn = $("#crmBtn");
  if (crmBtn) {
    crmBtn.addEventListener("click", () => {
      if (crmBtn.classList.contains("is-sent")) return;
      crmBtn.textContent = "A iniciar…";
      setTimeout(() => {
        crmBtn.classList.add("is-sent");
        crmBtn.textContent = "Fluxo ativo · 2 contactos";
        setTimeout(() => { crmBtn.classList.remove("is-sent"); crmBtn.textContent = "Iniciar fluxo"; }, 4000);
      }, reduceMotion ? 0 : 700);
    });
  }

  // Invoices: fill on click, and once when first seen
  const invBtn = $("#invBtn");
  const invRows = $$("#invList li");
  const runInvoices = () => {
    invRows.forEach((li) => li.classList.remove("done"));
    invRows.forEach((li, i) => setTimeout(() => li.classList.add("done"), reduceMotion ? 0 : 150 + i * 450));
  };
  if (invBtn) {
    invBtn.addEventListener("click", runInvoices);
    const invCard = invBtn.closest(".reveal");
    invCard && invCard.addEventListener("revealed", () => setTimeout(runInvoices, 600), { once: true });
  }

  /* ---------- Contact form ----------
     No backend yet: validates, then opens the visitor's email client.
     Swap `send` for a fetch() to a webhook when there is one. */
  const form = $("#contactForm");
  const note = $("#formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      $$("input, textarea", form).forEach((f) => {
        const valid = f.value.trim() !== "" && (f.type !== "email" || /^\S+@\S+\.\S+$/.test(f.value.trim()));
        f.classList.toggle("is-invalid", !valid);
        f.setAttribute("aria-invalid", String(!valid));
        if (!valid) ok = false;
      });
      if (!ok) { note.textContent = "Preenche os campos assinalados."; return; }
      const d = Object.fromEntries(new FormData(form));
      const body = `${d.mensagem}\n\n— ${d.nome} (${d.email})`;
      window.location.href = `mailto:geral@flowix.pt?subject=${encodeURIComponent("Contacto pelo site — " + d.nome)}&body=${encodeURIComponent(body)}`;
      note.textContent = "A abrir o teu email… Se nada acontecer, escreve-nos para geral@flowix.pt.";
    });
  }
})();
