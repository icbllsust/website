/* ---------------------------------------------------------
   ICBLLC 2027 — site script
   Loads content.json, renders EN/বাংলা content, and persists
   the chosen language in localStorage. No frameworks.
--------------------------------------------------------- */

(function () {
  "use strict";

  const LANG_KEY = "icbllc_lang";
  let CONTENT = null;

  /** Safely resolve a dotted path like "hero.title" against an object. */
  function getPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Render every element carrying a data-i18n="path.to.value" attribute. */
  function renderStaticText(lang) {
    const data = CONTENT[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.getAttribute("data-i18n");
      const value = getPath(data, path);
      if (value !== null && typeof value === "string") {
        el.textContent = value;
      }
    });
  }

  /** Inject dynamic href targets (e.g. Hero CTA submission link) from content.
   *  - #hero-cta-primary  : "Submit an Abstract" mailto fallback (preserved).
   *  - #hero-cta-tertiary : "Submit Now" → Microsoft CMT3 portal (frictionless). */
  function renderDynamicLinks(lang) {
    const data = CONTENT[lang];
    const url = data && data.hero ? data.hero.submission_url : null;
    const urlAlt = data && data.hero ? data.hero.submission_url_alt : null;
    if (typeof url !== "string") return;

    const primary = document.getElementById("hero-cta-primary");
    if (primary) {
      // Primary CTA always points at the CMT3 portal (primary submission path)
      primary.setAttribute("href", url);
      primary.setAttribute("target", "_blank");
      primary.setAttribute("rel", "noopener noreferrer");
    }

    const tertiary = document.getElementById("hero-cta-tertiary");
    if (tertiary) {
      tertiary.setAttribute("href", url);
    }
  }

  /** Sleek light-gray SVG placeholder for speakers without an image_url. */
  function speakerPlaceholderDataURI(initials) {
    // Calibrated to the new tonal palette: light gray background, navy accent, serif glyph.
    const initialsSafe = escapeHTML(initials || "");
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>` +
      `<rect width='64' height='64' rx='32' fill='#eef2fb'/>` +
      `<circle cx='32' cy='25' r='10' fill='none' stroke='#1e3a8a' stroke-width='1.5'/>` +
      `<path d='M14 56c0-10 8-16 18-16s18 6 18 16' fill='none' stroke='#1e3a8a' stroke-width='1.5'/>` +
      `<text x='32' y='58' text-anchor='middle' font-family='Playfair Display, Noto Serif Bengali, serif' font-size='14' fill='#1e3a8a' font-weight='600'>${initialsSafe}</text>` +
      `</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  function renderAbout(lang) {
    const about = CONTENT[lang].about;
    const container = document.getElementById("about-paragraphs");
    container.innerHTML = about.paragraphs
      .map(
        (p, i) =>
          `<div class="relative rounded-md ${
            i === 0
              ? "border border-slate-200/60 bg-white px-5 py-4 border-l-4 border-l-amber-600 shadow-card"
              : "border border-slate-200/60 bg-white px-5 py-4 border-l-2 border-l-gold-400/60 shadow-card"
          }">
            <p class="relative ${
              i === 0
                ? "text-navy-800 font-medium text-[17px] leading-[1.75]"
                : "text-navy-700/90 text-[15.5px] leading-relaxed"
            }">${escapeHTML(p)}</p>
          </div>`
      )
      .join("");
  }

  // One icon per track, matched by position to the fixed order of tracks in content.json
  const TRACK_ICONS = ["languages", "book-open", "drama", "footprints", "repeat", "database"];

  function renderTracks(lang) {
    const tracks = CONTENT[lang].cfp.tracks;
    const grid = document.getElementById("tracks-grid");
    grid.innerHTML = tracks
      .map((t, i) => {
        const icon = TRACK_ICONS[i % TRACK_ICONS.length];
        return `
      <article class="group relative rounded-xl border border-slate-200/60 border-t-2 border-t-emerald-700 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden">
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/60 bg-cream">
          <span class="label-tag">TRACK · ${String(i + 1).padStart(2, "0")}</span>
          <span class="w-7 h-7 rounded-md bg-amber-50 border border-amber-plateDeep flex items-center justify-center">
            <i data-lucide="${icon}" class="w-3.5 h-3.5 text-emerald-900"></i>
          </span>
        </div>
        <div class="px-5 py-4">
          <h3 class="font-heading text-navy-900 text-[1.05rem] font-semibold leading-snug">${escapeHTML(t.title)}</h3>
          <p class="track-desc font-body text-[14px] text-slate-800 mt-2.5 leading-relaxed">${escapeHTML(t.description)}</p>
        </div>
      </article>`;
      })
      .join("");
  }

  function renderGuidelines(lang) {
    const guidelines = CONTENT[lang].cfp.guidelines;
    const list = document.getElementById("guidelines-list");
    list.innerHTML = guidelines
      .map(
        (g) => `
      <li class="flex items-start gap-2.5">
        <i data-lucide="check-circle-2" class="w-[18px] h-[18px] text-gold-600 mt-0.5 shrink-0"></i>
        <span>${escapeHTML(g)}</span>
      </li>`
      )
      .join("");
  }

  // One icon per milestone, matched by position to the fixed order in content.json
  const DATE_ICONS = ["file-text", "mail-check", "ticket", "file-check-2", "calendar-check"];

  function renderDates(lang) {
    const dates = CONTENT[lang].important_dates;
    const list = document.getElementById("dates-list");
    const lastIndex = dates.length - 1;

    list.innerHTML = dates
      .map((d, i) => {
        const icon = DATE_ICONS[i % DATE_ICONS.length];
        const isLast = i === lastIndex;
        return `
      <li class="relative flex items-start gap-5 pb-7 ${isLast ? "" : "timeline-connector"}">
        <span class="relative z-10 shrink-0 w-12 h-12 rounded-xl bg-white/10 border border-gold-400/40 flex items-center justify-center shadow-sm backdrop-blur-sm">
          <i data-lucide="${icon}" class="w-[18px] h-[18px]" style="color:#e7c27f;"></i>
        </span>
        <div class="flex-1 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:border-gold-400/40 transition-colors duration-200">
          <div class="flex items-center gap-2">
            <span class="label-tag bg-white/10 text-gold-400 border-gold-400/40">M${String(i + 1).padStart(2, "0")}</span>
            <span class="text-white/90 text-[15px] font-medium">${escapeHTML(d.label)}</span>
          </div>
          <span class="font-heading text-[15px] tracking-wide px-3 py-1 rounded-md bg-white/10 border border-gold-400/30 self-start sm:self-auto" style="color:#e7c27f;">${escapeHTML(d.date)}</span>
        </div>
      </li>`;
      })
      .join("");
  }

  function renderSpeakers(lang) {
    const speakers = CONTENT[lang].speakers.list;
    const grid = document.getElementById("speakers-grid");
    grid.innerHTML = speakers
      .map((s) => {
        const safeName = escapeHTML(s.name);
        const initials = (s.name || "").trim().charAt(0) || "•";
        const fallback = speakerPlaceholderDataURI(initials);
        const imageUrl = (s.image_url || "").trim() || fallback;
        return `
      <article class="group relative rounded-xl border border-slate-200/60 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover overflow-hidden text-center">
        <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-200/60 bg-cream">
          <span class="label-tag">KEYNOTE</span>
          <span class="w-7 h-7 rounded-full bg-gold-600 text-white flex items-center justify-center shadow-sm" title="Keynote Speaker">
            <i data-lucide="mic-2" class="w-3.5 h-3.5"></i>
          </span>
        </div>
        <div class="px-5 py-5">
          <div class="relative inline-block">
            <img
              src="${escapeHTML(imageUrl)}"
              alt="${safeName}"
              loading="lazy"
              width="72"
              height="72"
              class="speaker-avatar w-[72px] h-[72px] rounded-full object-cover mx-auto bg-navy-50 ring-4 ring-amber-plate"
              onerror="this.onerror=null;this.src='${fallback}';"
            />
          </div>
          <h3 class="font-heading text-navy-900 text-[1.05rem] font-semibold mt-4 leading-snug">${safeName}</h3>
          <p class="font-body text-[13px] text-gold-600 mt-1.5 flex items-baseline justify-center gap-1.5 font-medium">
            <i data-lucide="building-2" class="w-3.5 h-3.5 self-baseline"></i>
            ${escapeHTML(s.affiliation)}
          </p>
          <p class="font-body text-[13.5px] text-slate-800 mt-3 leading-relaxed border-t border-slate-200/60 pt-3 text-left">${escapeHTML(s.topic)}</p>
        </div>
        <span class="absolute top-0 left-0 w-full h-1 bg-gold-600" aria-hidden="true"></span>
      </article>`;
      })
      .join("");
  }

  // One icon per fee category, matched by position to the fixed order in content.json
  const FEE_ICONS = ["briefcase", "graduation-cap", "globe", "users"];

  function renderFees(lang) {
    const fees = CONTENT[lang].registration_fees;
    const rows = document.getElementById("fees-rows");
    rows.innerHTML = fees.rows
      .map((r, i) => {
        const icon = FEE_ICONS[i % FEE_ICONS.length];
        const isFeatured = i === 0;
        return `
      <tr class="hover:bg-amber-50/70 transition-colors duration-200 ${isFeatured ? "bg-amber-50" : ""}">
        <td class="fee-cell py-4 px-5 text-neutral-800 align-middle">
          <span class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-md bg-amber-50 text-emerald-900 border border-amber-plateDeep flex items-center justify-center shrink-0 shadow-sm">
              <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
            </span>
            <span class="flex flex-col leading-tight">
              ${isFeatured ? '<span class="label-tag self-start mb-1">FEATURED</span>' : ""}
              <span class="font-semibold text-navy-900 text-[14px]">${escapeHTML(r.category)}</span>
            </span>
          </span>
        </td>
        <td class="fee-cell py-4 px-5 align-middle">
          <span class="inline-flex flex-col items-start leading-tight">
            <span class="text-[10px] tracking-[0.18em] uppercase text-emerald-900 font-semibold font-body">Early</span>
            <span class="font-heading text-navy-900 text-[15px] font-semibold">${escapeHTML(r.early_bird)}</span>
          </span>
        </td>
        <td class="fee-cell py-4 px-5 align-middle">
          <span class="inline-flex flex-col items-start leading-tight">
            <span class="text-[10px] tracking-[0.18em] uppercase text-navy-900 font-semibold font-body">Regular</span>
            <span class="font-heading text-navy-900 text-[15px] font-semibold">${escapeHTML(r.regular)}</span>
          </span>
        </td>
      </tr>`;
      })
      .join("");
  }

  // One icon per contact line, matched by position to the fixed order in content.json
  const CONTACT_ICONS = ["building-2", "graduation-cap", "map-pin", "mail", "phone"];

  function renderContact(lang) {
    const c = CONTENT[lang].contact_info;
    document.getElementById("contact-department").textContent = c.department;
    document.getElementById("contact-university").textContent = c.university;
    document.getElementById("contact-address").textContent = c.address;

    const emailEl = document.getElementById("contact-email");
    emailEl.href = `mailto:${c.email}`;
    const emailLabel = emailEl.querySelector("span");
    if (emailLabel) emailLabel.textContent = c.email;

    const phoneEl = document.getElementById("contact-phone");
    phoneEl.textContent = c.phone;

    // Tag every contact line with its matching Lucide icon (in declaration order)
    const lineIds = ["contact-department", "contact-university", "contact-address", "contact-email", "contact-phone"];
    lineIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const icon = el.querySelector("i[data-lucide]");
      if (!icon) return;
      icon.setAttribute("data-lucide", CONTACT_ICONS[i] || "circle");
    });
  }

  function renderFooter(lang) {
    const f = CONTENT[lang].footer;
    document.getElementById("footer-made-for").textContent = f.made_for;
    document.getElementById("footer-rights").textContent = `© 2026 ${f.rights}`;
  }

  function renderMeta(lang) {
    const meta = CONTENT[lang].meta;
    document.getElementById("doc-title").textContent = meta.site_title;
    document.title = meta.site_title;
  }

  function updateLangControls(lang) {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("data-lang", lang);

    const enBtn = document.getElementById("lang-en");
    const bnBtn = document.getElementById("lang-bn");
    const isEn = lang === "en";

    enBtn.setAttribute("aria-pressed", String(isEn));
    bnBtn.setAttribute("aria-pressed", String(!isEn));

    enBtn.classList.toggle("bg-navy-700", isEn);
    enBtn.classList.toggle("text-white", isEn);
    enBtn.classList.toggle("text-navy-700", !isEn);

    bnBtn.classList.toggle("bg-navy-700", !isEn);
    bnBtn.classList.toggle("text-white", !isEn);
    bnBtn.classList.toggle("text-navy-700", isEn);
  }

  /** Convert every <i data-lucide="..."> placeholder into an inline SVG icon. */
  function renderIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function renderAll(lang) {
    if (!CONTENT || !CONTENT[lang]) return;
    updateLangControls(lang);
    renderMeta(lang);
    renderStaticText(lang);
    renderDynamicLinks(lang);
    renderAbout(lang);
    renderTracks(lang);
    renderGuidelines(lang);
    renderDates(lang);
    renderSpeakers(lang);
    renderFees(lang);
    renderContact(lang);
    renderFooter(lang);
    // Trust block + stats are bound via data-i18n in markup, so the static-text
    // pass above already populates them. Only dynamic piece is the alt-lang
    // bound heading + the lucide-icon rehydration after DOM mutation.
    renderIcons();
  }

  function setLang(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {
      /* localStorage unavailable — fail silently, language just won't persist */
    }
    renderAll(lang);
  }

  function initLangToggle() {
    document.getElementById("lang-en").addEventListener("click", () => setLang("en"));
    document.getElementById("lang-bn").addEventListener("click", () => setLang("bn"));
  }

  function initMobileMenu() {
    const toggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("mobile-nav");
    const iconOpen = document.getElementById("menu-icon-open");
    const iconClose = document.getElementById("menu-icon-close");

    toggle.addEventListener("click", () => {
      const isOpen = !nav.classList.contains("hidden");
      nav.classList.toggle("hidden");
      toggle.setAttribute("aria-expanded", String(!isOpen));
      iconOpen.classList.toggle("hidden");
      iconClose.classList.toggle("hidden");
    });

    // Close mobile menu after choosing a link
    nav.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        nav.classList.add("hidden");
        toggle.setAttribute("aria-expanded", "false");
        iconOpen.classList.remove("hidden");
        iconClose.classList.add("hidden");
      })
    );
  }

  function initHeaderShadow() {
    const header = document.getElementById("site-header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function getInitialLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "bn") return stored;
    } catch (e) {
      /* localStorage unavailable */
    }
    return "en";
  }

  async function init() {
    initLangToggle();
    initMobileMenu();
    initHeaderShadow();

    try {
      const res = await fetch("content.json");
      if (!res.ok) throw new Error(`Failed to load content.json (${res.status})`);
      CONTENT = await res.json();
      renderAll(getInitialLang());
    } catch (err) {
      console.error("ICBLLC site: could not load content.json", err);
      const main = document.getElementById("main");
      if (main) {
        main.innerHTML =
          '<p style="padding:4rem 1.5rem;text-align:center;font-family:sans-serif;color:#7a2323;">Content could not be loaded. Please make sure content.json is in the same folder as index.html and that you are viewing this over a local server (not a bare file:// path).</p>';
      }
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
