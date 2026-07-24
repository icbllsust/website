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
    return String(str || ""); // Removed HTML escaping to allow <strong> tags
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
      if (val && typeof val === "string") el.innerHTML = val;
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
      .map((p, i) => `<p class="leading-relaxed" style="color:var(--ink-light);" data-i18n="about.paragraphs.${i}">${esc(p)}</p>`)
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
        <h3 class="font-display font-bold text-lg leading-snug" style="color:var(--navy);" data-i18n="cfp.tracks.${i}.title">${esc(t.title)}</h3>
        <p class="mt-3 text-sm leading-relaxed" style="color:var(--ink-light);" data-i18n="cfp.tracks.${i}.description">${esc(t.description)}</p>
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
        <p class="text-sm font-bold leading-snug" style="color:var(--navy);" data-i18n="important_dates.${i}.label">${esc(d.label)}</p>
        <span class="block mt-4 rounded-lg px-3 py-2 text-center text-xs font-bold"
              style="${i % 2 === 0
                ? "background:var(--smoke); color:var(--navy); border:1px solid var(--line);"
                : "background:var(--gold-pale); color:#7a5420; border:1px solid rgba(181,134,58,0.25);"}" data-i18n="important_dates.${i}.date">
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
              style="color:var(--navy);" data-i18n="speakers.list.${idx}.name">${esc(s.name)}</h3>
          <p class="text-xs font-semibold mt-1.5" style="color:var(--ink-light);" data-i18n="speakers.list.${idx}.affiliation">${esc(s.affiliation || "")}</p>
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
  function initScheduleTabs(lang) {
    const btnDay1 = document.getElementById("sched-tab-day1");
    const btnDay2 = document.getElementById("sched-tab-day2");
    const container = document.getElementById("schedule-events-container");
    if (!btnDay1 || !btnDay2 || !container) return;

    if (!CONTENT || !CONTENT[lang]) return;
    const scheduleData = CONTENT[lang]?.schedule?.days;
    if (!scheduleData || scheduleData.length < 2) return;

    // Set tab button labels
    if (btnDay1) btnDay1.textContent = scheduleData[0].tab_label || "";
    if (btnDay2) btnDay2.textContent = scheduleData[1].tab_label || "";

    function renderEvents(dayIndex) {
      const events = scheduleData[dayIndex]?.events || [];
      const html = events.map((ev, i) => {
        return `<div class="schedule-row">
          <span class="schedule-time" data-i18n="schedule.days.${dayIndex}.events.${i}.time">${esc(ev.time)}</span>
          <div class="flex-1">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="badge ${esc(ev.badgeClass)}" data-i18n="schedule.days.${dayIndex}.events.${i}.badgeText">${esc(ev.badgeText)}</span>
            </div>
            <h4 class="text-sm font-bold text-slate-900" data-i18n="schedule.days.${dayIndex}.events.${i}.title">${esc(ev.title)}</h4>
            <p class="text-xs mt-1 text-slate-600" data-i18n="schedule.days.${dayIndex}.events.${i}.venue">${esc(ev.venue)}</p>
          </div>
        </div>`;
      }).join("");
      container.innerHTML = html;
    }

    renderEvents(0);

    btnDay1.addEventListener("click", () => {
      btnDay1.classList.add("active");
      btnDay2.classList.remove("active");
      renderEvents(0);
    });

    btnDay2.addEventListener("click", () => {
      btnDay2.classList.add("active");
      btnDay1.classList.remove("active");
      renderEvents(1);
    });
  }

  /* ── Committees ─────────────────────────────────────────── */
  function renderCommittees(lang) {
    const c = CONTENT[lang]?.committees;
    if (!c) return;

    function renderList(containerId, list, isSub = false) {
      const container = document.getElementById(containerId);
      if (!container || !list) return;
      container.innerHTML = list.map((m, idx) => {
        if (isSub) {
          // Subcommittee: m.convenor has the person's name, m.title has the committee name
          return `<div class="committee-member bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] text-center">
            <h4 class="font-bold text-base text-slate-900 leading-tight" data-i18n="committees.subcommittees.${idx}.convenor">${esc(m.convenor)}</h4>
            <p class="text-xs mt-1.5 text-emerald-700 font-semibold" data-i18n="committees.subcommittees.${idx}.title">${esc(m.title)}</p>
          </div>`;
        } else {
          // Standard Member: m.name has the name, m.role/affiliation have the designation
          const pathBase = containerId.replace("-list", "").replace("-", "_");
          return `<div class="committee-member bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.04)] text-center">
            <h4 class="font-bold text-base text-slate-900 leading-tight" data-i18n="committees.${pathBase}.${idx}.name">${esc(m.name)}</h4>
            <p class="text-xs mt-1.5 text-emerald-700 font-semibold" data-i18n="committees.${pathBase}.${idx}.role">${esc(m.role)} &middot; <span data-i18n="committees.${pathBase}.${idx}.affiliation">${esc(m.affiliation)}</span></p>
          </div>`;
        }
      }).join("");
    }

    renderList("chief-patron-list", c.chief_patron);
    renderList("patron-list", c.patrons); // using patron_list as id, but patrons as json key
    renderList("advisory-list", c.advisory);
    renderList("core-list", c.core);
    renderList("subcommittee-list", c.subcommittees, true);
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
    initScheduleTabs(lang);
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

  /* ── Live Visual Inline Editor (Admin Mode) ──────────────── */
  let isAdminMode = false;
  let hasPendingChanges = false;
  const changedPaths = {}; 

  function createSaveButton() {
    const btn = document.createElement('button');
    btn.id = 'live-save-btn';
    btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> পরিবর্তন সেভ করুন';
    document.body.appendChild(btn);
    
    btn.addEventListener('click', async () => {
      btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4"></i> সেভ হচ্ছে...';
      try {
        const res = await fetch("content.json");
        const fullContent = await res.json();
        
        const currentLang = document.documentElement.getAttribute("data-lang") || "bn";
        for (const [path, newVal] of Object.entries(changedPaths)) {
          const parts = path.split('.');
          let ref = fullContent[currentLang];
          for (let i = 0; i < parts.length - 1; i++) {
            if (!ref[parts[i]]) ref[parts[i]] = {};
            ref = ref[parts[i]];
          }
          ref[parts[parts.length - 1]] = newVal;
        }

        const saveRes = await fetch("/api/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fullContent)
        });

        if (saveRes.ok) {
          btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> সেভ সম্পন্ন!';
          setTimeout(() => {
            btn.innerHTML = '<i data-lucide="save" class="w-4 h-4"></i> পরিবর্তন সেভ করুন';
            btn.classList.remove('visible');
            hasPendingChanges = false;
            for (let prop in changedPaths) delete changedPaths[prop];
          }, 2000);
          CONTENT = fullContent; 
        } else {
          throw new Error('Save failed');
        }
      } catch (err) {
        console.error("Save error:", err);
        btn.innerHTML = '<i data-lucide="alert-circle" class="w-4 h-4"></i> সেভ ব্যর্থ';
      }
      renderIcons();
    });
  }

  function initLiveEditor() {
    createSaveButton();
    const saveBtn = document.getElementById('live-save-btn');

    document.addEventListener('keydown', (e) => {
      // Ctrl + Shift + E toggles Admin Mode
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        isAdminMode = !isAdminMode;
        
        document.querySelectorAll("[data-i18n]").forEach((el) => {
          if (isAdminMode) {
            el.setAttribute("contenteditable", "true");
            if (!el.dataset.editorInit) {
              el.dataset.editorInit = "true";
              el.addEventListener('input', (ev) => {
                const path = el.getAttribute("data-i18n");
                // Capture HTML tags so formatting (like bold) is preserved
                changedPaths[path] = el.innerHTML.trim();
                hasPendingChanges = true;
                saveBtn.classList.add('visible');
              });
            }
          } else {
            el.removeAttribute("contenteditable");
          }
        });
        
        if (!isAdminMode && !hasPendingChanges) {
          saveBtn.classList.remove('visible');
        }
      }
    });
  }

  /* ── Bootstrap ──────────────────────────────────────────── */
  async function init() {
    initLangToggle();
    initMobileMenu();
    initCountdown();
    initStickyBar();
    initNavScroll();
    initActiveNav();
    initScrollReveal();
    initLiveEditor();

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
