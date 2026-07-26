/* ============================================================
   ICBLL-2026 — Clean Static JavaScript Engine
   Handles: Language toggling, countdown, mobile menu, sticky bar.
============================================================ */

(function () {
  "use strict";

  const LANG_KEY = "icbllc_lang";

  /* ── Language Control ───────────────────────────────────── */
  function initLangToggle() {
    document.getElementById("lang-en")?.addEventListener("click", () => {
      localStorage.setItem(LANG_KEY, "en");
      updateLangControls("en");
    });
    document.getElementById("lang-bn")?.addEventListener("click", () => {
      localStorage.setItem(LANG_KEY, "bn");
      updateLangControls("bn");
    });
  }

  function updateLangControls(lang) {
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("data-lang", lang);
    
    // Toggle body class for CSS visibility
    document.body.classList.toggle("lang-en-active", lang === "en");

    const enBtn = document.getElementById("lang-en");
    const bnBtn = document.getElementById("lang-bn");
    if (!enBtn || !bnBtn) return;
    const isEn = lang === "en";
    enBtn.setAttribute("aria-pressed", String(isEn));
    bnBtn.setAttribute("aria-pressed", String(!isEn));
    enBtn.classList.toggle("is-active", isEn);
    bnBtn.classList.toggle("is-active", !isEn);
  }

  function getInitialLang() {
    // 1. Check URL query param (?lang=en or ?lang=bn)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'en' || urlLang === 'bn') {
      localStorage.setItem(LANG_KEY, urlLang);
      return urlLang;
    }
    
    // 2. Check URL hash (#en or #bn)
    const hashLang = window.location.hash.substring(1);
    if (hashLang === 'en' || hashLang === 'bn') {
      localStorage.setItem(LANG_KEY, hashLang);
      return hashLang;
    }

    // 3. Fallback to LocalStorage
    try {
      const stored = localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "bn") return stored;
    } catch (_) {}
    
    // 4. Default to Bengali
    return "bn";
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
  function toBn(numStr) {
    const lang = document.documentElement.getAttribute("data-lang") || "bn";
    if (lang === "bn") {
      return String(numStr).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[d]);
    }
    return String(numStr);
  }

  function initCountdown() {
    const dEl = document.getElementById("cd-days");
    const hEl = document.getElementById("cd-hours");
    const mEl = document.getElementById("cd-mins");
    const sEl = document.getElementById("cd-secs");
    if (!dEl || !hEl || !mEl || !sEl) return;

    const target = new Date("2026-11-27T09:00:00+06:00").getTime();

    function update() {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        dEl.textContent = toBn("00");
        hEl.textContent = toBn("00");
        mEl.textContent = toBn("00");
        sEl.textContent = toBn("00");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      dEl.textContent = toBn(String(days).padStart(2, "0"));
      hEl.textContent = toBn(String(hours).padStart(2, "0"));
      mEl.textContent = toBn(String(mins).padStart(2, "0"));
      sEl.textContent = toBn(String(secs).padStart(2, "0"));
    }
    update();
    setInterval(update, 1000);
  }

  /* ── Scroll Reveal ──────────────────────────────────────── */
  function initScrollReveal() {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  }

  /* ── Sticky Deadline Bar ────────────────────────────────── */
  function initStickyBar() {
    const bar   = document.getElementById("deadline-sticky-bar");
    const close = document.getElementById("deadline-bar-close");
    if (!bar) return;

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

  /* ── Bootstrap ──────────────────────────────────────────── */
  function init() {
    initMobileMenu();
    initCountdown();
    initStickyBar();
    initNavScroll();
    initActiveNav();
    initScrollReveal();
    
    // Set initial language from storage
    const currentLang = getInitialLang();
    updateLangControls(currentLang);
    initLangToggle();
    
    // Initialize icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
