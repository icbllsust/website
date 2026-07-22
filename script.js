/* ============================================================
   ICBLL-2026 — Premium Conference JavaScript Engine
   Handles: Content loading, i18n, countdown, schedule tabs,
   speaker modals, scroll reveal, sticky bar, nav scroll.
============================================================ */

(function () {
  "use strict";

  const LANG_KEY = "icbllc_lang";
  let CONTENT = null;

  /* ── Utilities ─────────────────────────────────────────── */
  function getPath(obj, path) {
    return path.split(".").reduce(
      (acc, k) => (acc && acc[k] !== undefined ? acc[k] : null),
      obj
    );
  }

  /* ── Simple client-side search highlight ── */
  window.handleSearch = function(query) {
    const q = (query || '').trim().toLowerCase();
    const cards = document.querySelectorAll('.track-card, .speaker-card, .date-card, .schedule-row');
    cards.forEach(el => {
      if (!q) { el.style.opacity = '1'; return; }
      const text = el.textContent.toLowerCase();
      el.style.opacity = text.includes(q) ? '1' : '0.25';
    });
  };

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toBn(numStr) {
    const lang = document.documentElement.getAttribute("data-lang") || "bn";
    if (lang === "bn") {
      return String(numStr).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
    }
    return String(numStr);
  }

  /* ── Static i18n Text ──────────────────────────────────── */
  function renderStaticText(lang) {
    const data = CONTENT[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.getAttribute("data-i18n");
      const val = getPath(data, path);
      if (val && typeof val === "string") el.textContent = val;
    });
  }

  /* ── Dynamic Links ─────────────────────────────────────── */
  function renderDynamicLinks(lang) {
    const data = CONTENT[lang];
    if (!data?.hero) return;
    const url = data.hero.submission_url || "https://cmt3.research.microsoft.com/";
    const ctaPrimary = document.getElementById("hero-cta-primary");
    if (ctaPrimary) ctaPrimary.setAttribute("href", url);
  }

  /* ── About Paragraphs ──────────────────────────────────── */
  function renderAbout(lang) {
    const about = CONTENT[lang]?.about;
    const container = document.getElementById("about-paragraphs");
    if (!container || !about?.paragraphs) return;
    container.innerHTML = about.paragraphs
      .map((p) => `<p class="leading-relaxed" style="color:var(--ink-light);">${esc(p)}</p>`)
      .join("");
  }

  /* ── Track Cards (CFP) ─────────────────────────────────── */
  function renderTracks(lang) {
    const cfp = CONTENT[lang]?.cfp;
    const grid = document.getElementById("tracks-grid");
    if (!grid || !cfp?.tracks) return;

    grid.innerHTML = cfp.tracks
      .map(
        (t, i) => `
      <article class="track-card">
        <p class="text-xs font-bold uppercase tracking-widest mb-5" style="color:var(--gold); letter-spacing:0.18em;">
          Track ${String(i + 1).padStart(2, "0")}
        </p>
        <h3 class="font-display font-bold text-lg leading-snug" style="color:var(--navy);">${esc(t.title)}</h3>
        <p class="mt-3 text-sm leading-relaxed" style="color:var(--ink-light);">${esc(t.description)}</p>
      </article>`
      )
      .join("");
  }

  /* ── Important Dates ────────────────────────────────────── */
  function renderDates(lang) {
    const dates = CONTENT[lang]?.important_dates || [];
    const list = document.getElementById("dates-list");
    if (!list || !dates.length) return;

    list.innerHTML = dates
      .map(
        (d, i) => `
      <article class="date-card">
        <p class="text-sm font-bold leading-snug" style="color:var(--navy);">${esc(d.label)}</p>
        <span class="block mt-4 rounded-lg px-3 py-2 text-center text-xs font-bold"
              style="${i % 2 === 0
                ? "background:var(--smoke); color:var(--navy); border:1px solid var(--line);"
                : "background:var(--gold-pale); color:#7a5420; border:1px solid rgba(181,134,58,0.25);"}">
          ${esc(d.date)}
        </span>
      </article>`
      )
      .join("");
  }

  /* ── Keynote Speakers ──────────────────────────────────── */
  function renderSpeakers(lang) {
    const speakers = CONTENT[lang]?.speakers?.list;
    const grid = document.getElementById("speakers-grid");
    if (!grid || !speakers) return;

    grid.innerHTML = speakers
      .map((s, idx) => {
        const imgMarkup = (s.image_url || "").trim()
          ? `<img src="${esc(s.image_url)}" alt="${esc(s.name)}"
                   class="w-full h-full object-cover"
                   onerror="this.outerHTML='<i data-lucide=\\'user-round\\' style=\\'width:40px;height:40px;color:var(--navy);\\' class=\\'m-auto\\'></i>';if(window.lucide)lucide.createIcons();">`
          : `<i data-lucide="user-round" style="width:40px;height:40px;color:var(--navy);"></i>`;

        return `
        <article class="speaker-card" data-speaker-idx="${idx}" tabindex="0" role="button"
                 aria-label="View bio: ${esc(s.name)}">
          <div class="speaker-avatar">${imgMarkup}</div>
          <h3 class="font-display font-bold text-base mt-4 leading-snug"
              style="color:var(--navy);">${esc(s.name)}</h3>
          <p class="text-xs font-semibold mt-1.5" style="color:var(--ink-light);">${esc(s.affiliation || "")}</p>
          <p class="text-xs mt-2 font-bold" style="color:var(--gold); text-decoration:underline dotted;">
            View Profile
          </p>
        </article>`;
      })
      .join("");

    initSpeakerModal(speakers);
  }

  /* ── Speaker Bio Modal ─────────────────────────────────── */
  function initSpeakerModal(speakers) {
    const modal   = document.getElementById("speaker-bio-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    const nameEl  = document.getElementById("modal-speaker-name");
    const affEl   = document.getElementById("modal-speaker-affiliation");
    const topicEl = document.getElementById("modal-speaker-topic");
    const bioEl   = document.getElementById("modal-speaker-bio");
    if (!modal) return;

    function openModal(idx) {
      const s = speakers[idx];
      if (!s) return;
      if (nameEl)  nameEl.textContent  = s.name || "";
      if (affEl)   affEl.textContent   = s.affiliation || "";
      if (topicEl) topicEl.textContent = s.topic || "বিষয়বস্তু শীঘ্রই ঘোষণা করা হবে।";
      if (bioEl)   bioEl.textContent   = s.bio   || `${s.name} বাংলা সাহিত্য ও সংস্কৃতি বিষয়ের আন্তর্জাতিকভাবে স্বীকৃত গবেষক ও প্রখ্যাত শিক্ষাবিদ।`;
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".speaker-card").forEach((card) => {
      card.addEventListener("click", () => openModal(card.getAttribute("data-speaker-idx")));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card.getAttribute("data-speaker-idx"));
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  }

  /* ── Programme Schedule Tabs ────────────────────────────── */
  function initScheduleTabs() {
    const btnDay1 = document.getElementById("sched-tab-day1");
    const btnDay2 = document.getElementById("sched-tab-day2");
    const container = document.getElementById("schedule-events-container");
    if (!btnDay1 || !btnDay2 || !container) return;

    const lang = document.documentElement.getAttribute("data-lang") || "bn";
    const isBn = lang === "bn";

    if (btnDay1) btnDay1.textContent = isBn ? "১ম দিন — ২৭ নভেম্বর ২০২৬" : "Day 1 — 27 November 2026";
    if (btnDay2) btnDay2.textContent = isBn ? "২য় দিন — ২৮ নভেম্বর ২০২৬" : "Day 2 — 28 November 2026";

    function makeRow(time, badgeClass, badgeText, title, venue) {
      return `<div class="schedule-row">
        <span class="schedule-time">${esc(time)}</span>
        <div class="flex-1">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <h4 class="text-sm font-bold text-slate-900">${esc(title)}</h4>
          <p class="text-xs mt-1 text-slate-600">${esc(venue)}</p>
        </div>
      </div>`;
    }

    const day1 = isBn ? [
      makeRow("০৯:০০ – ১০:৩০", "badge-keynote", "মূল প্রবন্ধ", "উদ্বোধনী অধিবেশন ও মূল প্রবন্ধ উপস্থাপন", "কেন্দ্রীয় অডিটোরিয়াম · শাবিপ্রবি"),
      makeRow("১১:০০ – ১৩:০০", "badge-paper", "গবেষণা সেশন", "প্যারালাল টেকনিক্যাল সেশন ১ (ট্র্যাক ০১–০৩)", "একাডেমিক ভবন · সেমিনার রুম ১, ২ ও ৩"),
      makeRow("১৩:০০ – ১৪:৩০", "badge-break", "বিরতি", "মধ্যাহ্নভোজ ও নামাজের বিরতি", "বিশ্ববিদ্যালয় ক্যাফেটেরিয়া"),
      makeRow("১৪:৩০ – ১৭:০০", "badge-paper", "গবেষণা সেশন", "প্যারালাল টেকনিক্যাল সেশন ২ (ট্র্যাক ০৪–০৬)", "একাডেমিক ভবন · সেমিনার রুম ১, ২ ও ৩"),
      makeRow("১৮:৩০ – ২০:৩০", "badge-cultural", "সাংস্কৃতিক অনুষ্ঠান", "সাংস্কৃতিক সন্ধ্যা — সিলেটে নজরুল ও লোকঐতিহ্য", "মুক্তমঞ্চ · শাবিপ্রবি ক্যাম্পাস"),
    ] : [
      makeRow("09:00 – 10:30", "badge-keynote", "Keynote", "Inaugural Session & Keynote Presentation", "Central Auditorium, SUST"),
      makeRow("11:00 – 13:00", "badge-paper", "Paper Sessions", "Parallel Technical Sessions 1 (Tracks 01–03)", "Academic Building · Seminar Rooms 1, 2 & 3"),
      makeRow("13:00 – 14:30", "badge-break", "Break", "Lunch & Prayer Break", "University Cafeteria"),
      makeRow("14:30 – 17:00", "badge-paper", "Paper Sessions", "Parallel Technical Sessions 2 (Tracks 04–06)", "Academic Building · Seminar Rooms 1, 2 & 3"),
      makeRow("18:30 – 20:30", "badge-cultural", "Cultural", "Cultural Evening — Nazrul in Sylhet & Folk Heritage", "Open Air Stage, SUST Campus"),
    ];

    const day2 = isBn ? [
      makeRow("০৯:৩০ – ১১:৩০", "badge-plenary", "প্লেনারি সেশন", "বিশেষ প্লেনারি সেশন: শতবর্ষে মুসলিম সাহিত্য সমাজ", "কেন্দ্রীয় অডিটোরিয়াম · শাবিপ্রবি"),
      makeRow("১১:৩০ – ১৩:৩০", "badge-keynote", "প্যানেল আলোচনা", "বিশেষজ্ঞ প্যানেল আলোচনা — মুক্তচিন্তা ও দ্রোহ", "মিনি অডিটোরিয়াম · শাবিপ্রবি"),
      makeRow("১৩:৩০ – ১৪:৩০", "badge-break", "বিরতি", "মধ্যাহ্নভোজ ও নামাজের বিরতি", "বিশ্ববিদ্যালয় ক্যাফেটেরিয়া"),
      makeRow("১৫:০০ – ১৭:০০", "badge-paper", "সমাপনী সেশন", "সমাপনী অনুষ্ঠান ও সেরা গবেষণা প্রবন্ধ পুরস্কার বিতরণ", "কেন্দ্রীয় অডিটোরিয়াম · শাবিপ্রবি"),
    ] : [
      makeRow("09:30 – 11:30", "badge-plenary", "Plenary", "Special Plenary Session: Centenary of Muslim Sahitya Samaj", "Central Auditorium, SUST"),
      makeRow("11:30 – 13:30", "badge-keynote", "Panel Discussion", "Expert Panel Discussion — Intellectual Freedom & Resistance", "Mini Auditorium, SUST"),
      makeRow("13:30 – 14:30", "badge-break", "Break", "Lunch & Prayer Break", "University Cafeteria"),
      makeRow("15:00 – 17:00", "badge-paper", "Valedictory", "Valedictory Session & Best Paper Award Ceremony", "Central Auditorium, SUST"),
    ];

    function renderDay(events) {
      container.innerHTML = events.join("");
    }

    renderDay(day1);

    btnDay1.addEventListener("click", () => {
      btnDay1.classList.add("active");
      btnDay2.classList.remove("active");
      renderDay(day1);
    });

    btnDay2.addEventListener("click", () => {
      btnDay2.classList.add("active");
      btnDay1.classList.remove("active");
      renderDay(day2);
    });
  }

  /* ── Committees ─────────────────────────────────────────── */
  function renderCommittees(lang) {
    const c = CONTENT[lang]?.committees;
    const advEl = document.getElementById("advisory-list");
    const locEl = document.getElementById("local-list");
    if (!c) return;

    if (advEl && c.advisory) {
      advEl.innerHTML = c.advisory
        .map(
          (m) => `
        <div class="committee-member">
          <p class="font-bold text-sm" style="color:var(--navy);">${esc(m.name)}</p>
          <p class="text-xs mt-0.5" style="color:var(--ink-light);">${esc(m.role || m.affiliation || "")}</p>
        </div>`
        )
        .join("");
    }

    if (locEl && (c.local || c.convenors)) {
      const list = c.local || c.convenors;
      locEl.innerHTML = list
        .map(
          (m) => `
        <div class="committee-member">
          <p class="font-bold text-sm" style="color:var(--navy);">${esc(m.name)}</p>
          <p class="text-xs mt-0.5" style="color:var(--ink-light);">${esc(m.role || m.affiliation || "")}</p>
        </div>`
        )
        .join("");
    }
  }

  /* ── Registration Fees (legacy) ─────────────────────────── */
  function renderFees(lang) {
    const fees = CONTENT[lang]?.registration_fees;
    const rows = document.getElementById("fees-rows");
    if (!rows || !fees?.rows) return;
    rows.innerHTML = fees.rows
      .map(
        (r) => `
      <tr class="border-b" style="border-color:var(--line);">
        <td class="py-3 pr-4 font-bold text-sm" style="color:var(--navy);">${esc(r.category)}</td>
        <td class="py-3 pr-4 font-bold text-sm" style="color:var(--forest);">${esc(r.early_bird)}</td>
        <td class="py-3 text-sm" style="color:var(--ink-light);">${esc(r.regular)}</td>
      </tr>`
      )
      .join("");
  }

  /* ── Lucide Icons ───────────────────────────────────────── */
  function renderIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  /* ── Master Render ──────────────────────────────────────── */
  function renderAll(lang) {
    if (!CONTENT?.[lang]) return;
    updateLangControls(lang);
    renderStaticText(lang);
    renderDynamicLinks(lang);
    renderAbout(lang);
    renderTracks(lang);
    renderDates(lang);
    renderSpeakers(lang);
    renderCommittees(lang);
    renderFees(lang);
    renderIcons();
    initScrollReveal();
    initScheduleTabs();
  }

  /* ── Language Control ───────────────────────────────────── */
  function updateLangControls(lang) {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("data-lang", lang);
    const enBtn = document.getElementById("lang-en");
    const bnBtn = document.getElementById("lang-bn");
    if (!enBtn || !bnBtn) return;
    const isEn = lang === "en";
    enBtn.setAttribute("aria-pressed", String(isEn));
    bnBtn.setAttribute("aria-pressed", String(!isEn));
    enBtn.classList.toggle("is-active", isEn);
    bnBtn.classList.toggle("is-active", !isEn);
  }

  function initLangToggle() {
    document.getElementById("lang-en")?.addEventListener("click", () => {
      localStorage.setItem(LANG_KEY, "en");
      renderAll("en");
    });
    document.getElementById("lang-bn")?.addEventListener("click", () => {
      localStorage.setItem(LANG_KEY, "bn");
      renderAll("bn");
    });
  }

  /* ── Mobile Menu ────────────────────────────────────────── */
  function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav    = document.getElementById("mobile-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("hidden");
      nav.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", String(!open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.add("hidden"))
    );
  }

  /* ── Countdown Timer ────────────────────────────────────── */
  function initCountdown() {
    const CONF_DATE = new Date("2026-11-27T09:00:00+06:00").getTime();
    const elD = document.getElementById("cd-days");
    const elH = document.getElementById("cd-hours");
    const elM = document.getElementById("cd-mins");
    const elS = document.getElementById("cd-secs");
    if (!elD) return;

    function pad(n) { return String(Math.max(0, n)).padStart(2, "0"); }

    function tick() {
      const diff = CONF_DATE - Date.now();
      if (diff <= 0) {
        [elD, elH, elM, elS].forEach((e) => (e.textContent = toBn("00")));
        return;
      }
      elD.textContent = toBn(pad(Math.floor(diff / 86400000)));
      elH.textContent = toBn(pad(Math.floor((diff % 86400000) / 3600000)));
      elM.textContent = toBn(pad(Math.floor((diff % 3600000) / 60000)));
      elS.textContent = toBn(pad(Math.floor((diff % 60000) / 1000)));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ── Scroll Reveal ──────────────────────────────────────── */
  function initScrollReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.07 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  }

  /* ── Sticky Deadline Bar ────────────────────────────────── */
  function initStickyBar() {
    const bar   = document.getElementById("deadline-sticky-bar");
    const close = document.getElementById("deadline-bar-close");
    if (!bar) return;

    // Only show bar if deadline hasn't passed and user hasn't dismissed
    const DEADLINE = new Date("2026-10-01T23:59:59+06:00").getTime();
    if (Date.now() > DEADLINE) return;
    if (sessionStorage.getItem("icbllc_bar_dismissed") === "1") return;

    setTimeout(() => bar.classList.add("visible"), 2800);

    close?.addEventListener("click", () => {
      bar.classList.remove("visible");
      sessionStorage.setItem("icbllc_bar_dismissed", "1");
    });
  }

  /* ── Nav Scroll Effect ──────────────────────────────────── */
  function initNavScroll() {
    const nav = document.getElementById("site-header");
    if (!nav) return;
    const handler = () => {
      if (window.scrollY > 20) nav.classList.add("scrolled");
      else nav.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
  }

  /* ── Active Nav Highlight ───────────────────────────────── */
  function initActiveNav() {
    const sections = document.querySelectorAll("section[id], header[id]");
    const navLinks = document.querySelectorAll("#site-header .nav-link[href^='#']");
    if (!sections.length || !navLinks.length) return;

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            navLinks.forEach((a) => {
              const match = a.getAttribute("href") === "#" + e.target.id;
              a.classList.toggle("active", match);
            });
          }
        }),
      { rootMargin: "-40% 0px -40% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ── Get Saved Language ─────────────────────────────────── */
  function getInitialLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "bn") return stored;
    } catch (_) {}
    return "bn";
  }

  /* ── Bootstrap ──────────────────────────────────────────── */
  async function init() {
    initLangToggle();
    initMobileMenu();
    initCountdown();
    initStickyBar();
    initNavScroll();
    initActiveNav();
    initScheduleTabs();
    initScrollReveal();

    try {
      const res = await fetch("content.json");
      if (!res.ok) throw new Error(`content.json failed: ${res.status}`);
      CONTENT = await res.json();
      renderAll(getInitialLang());
    } catch (err) {
      console.warn("ICBLLC: content.json not loaded:", err.message);
      // Site remains functional with inline HTML content
      renderIcons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
