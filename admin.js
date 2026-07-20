/* ---------------------------------------------------------
   ICBLLC 2027 — Live Admin Editor Companion
   Integrates seamlessly with script.js and content.json
   Provides a real-time, client-side, visual editing panel
   with support for both English (EN) and Bengali (বাংলা).
   Zero framework dependencies. Full Tailwind styling.
 --------------------------------------------------------- */

(function () {
  "use strict";

  let editLang = "en"; // Language currently being edited in the form
  let activeTab = "hero"; // Active section in the editor panel

  // Helper functions for nested object manipulation
  function getNestedPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), obj);
  }

  function setNestedPath(obj, path, value) {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  // Escape HTML helper
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Core list of tabs grouping the content.json sections logically
  const TABS = [
    { id: "hero", label: "Hero & General", icon: "home" },
    { id: "about", label: "About Section", icon: "info" },
    { id: "cfp", label: "CFP & Tracks", icon: "file-text" },
    { id: "dates", label: "Important Dates", icon: "calendar" },
    { id: "speakers", label: "Keynote Speakers", icon: "mic" },
    { id: "committees", label: "Committees", icon: "users" },
    { id: "fees_logistics", label: "Fees & Travel", icon: "banknote" },
    { id: "downloads_visa", label: "Visa & Files", icon: "download-cloud" },
    { id: "schedule", label: "Schedule Flow", icon: "clock" },
    { id: "contact_footer", label: "Contact & Footer", icon: "mail" }
  ];

  function initAdmin() {
    // Ensure the main app is initialized
    if (!window.ICBLLC || !window.ICBLLC.CONTENT) {
      setTimeout(initAdmin, 100);
      return;
    }

    // Inject Floating Edit Button
    const btn = document.createElement("button");
    btn.id = "admin-panel-toggle";
    btn.className = "fixed bottom-6 right-6 z-[9999] flex items-center gap-2 rounded-full bg-[#102a43] hover:bg-[#182f6f] text-white px-4 py-3 shadow-2xl border border-[#047857]/50 transition-all duration-300 hover:-translate-y-1 active:translate-y-0";
    btn.innerHTML = `<i data-lucide="edit-3" class="w-4 h-4 text-[#34d399]"></i><span class="font-body text-xs font-bold tracking-wider uppercase pr-1">Edit Site</span>`;
    document.body.appendChild(btn);

    // Inject Admin Side Drawer
    const drawer = document.createElement("div");
    drawer.id = "admin-panel-drawer";
    drawer.className = "fixed inset-y-0 right-0 z-[10000] w-full max-w-[620px] bg-[#fcfbf8] shadow-2xl border-l border-slate-300 flex flex-col translate-x-full transition-transform duration-300 ease-in-out font-body";
    drawer.innerHTML = `
      <!-- Header -->
      <div class="bg-[#102a43] text-white px-6 py-4 flex items-center justify-between border-b border-[#047857]/30 shrink-0">
        <div class="flex items-center gap-2">
          <i data-lucide="sliders" class="w-5 h-5 text-[#34d399]"></i>
          <span class="font-heading font-extrabold text-base tracking-wide">Website Content Editor</span>
        </div>
        <button id="admin-panel-close" class="text-slate-300 hover:text-white p-1.5 rounded-md hover:bg-white/10 transition-colors">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Language Selector & Help -->
      <div class="bg-slate-50 px-6 py-3.5 flex items-center justify-between border-b border-slate-200 shrink-0">
        <div class="flex items-center gap-2.5">
          <span class="text-xs font-bold text-slate-800">Editing Language:</span>
          <div role="group" aria-label="Editor language" class="inline-flex rounded-md border border-slate-300 overflow-hidden text-[11px] bg-white">
            <button type="button" id="admin-lang-en" class="px-3 py-1.5 font-extrabold transition-colors">English (EN)</button>
            <button type="button" id="admin-lang-bn" class="px-3 py-1.5 font-extrabold transition-colors">বাংলা (BN)</button>
          </div>
        </div>
        <div class="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#047857] font-extrabold bg-emerald-50 px-2 py-1 rounded border border-emerald-200/50">
          <span class="w-1.5 h-1.5 rounded-full bg-[#047857] animate-pulse"></span>
          <span>Live Editor Panel</span>
        </div>
      </div>

      <!-- Drawer Central Body -->
      <div class="flex-1 overflow-hidden flex">
        <!-- Vertical Tab Navigation (Left Sidebar) -->
        <nav aria-label="Editor sections" class="w-[180px] bg-slate-50 border-r border-slate-200 overflow-y-auto flex flex-col shrink-0 py-2">
          <div id="admin-tab-list" class="flex flex-col gap-1 px-2"></div>
        </nav>

        <!-- Form Elements Container (Right Pane) -->
        <main id="admin-form-container" class="flex-1 p-5 overflow-y-auto bg-white flex flex-col gap-5"></main>
      </div>

      <!-- Footer Actions -->
      <div class="bg-slate-50 p-5 border-t border-slate-200 shrink-0 flex flex-col gap-3">
        <button id="admin-save-disk" class="w-full bg-[#102a43] hover:bg-[#182f6f] text-white py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 hidden">
          <i data-lucide="save" class="w-4 h-4 text-[#34d399]"></i>
          <span>Save Permanently to Disk</span>
        </button>
        <button id="admin-download-json" class="w-full bg-[#047857] hover:bg-[#065f46] text-white py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
          <i data-lucide="download" class="w-4 h-4"></i>
          <span>Export &amp; Download content.json</span>
        </button>
        <p id="admin-save-instructions" class="text-[11.5px] text-slate-500 font-medium text-center leading-relaxed">
          To save changes permanently: download the file and overwrite the <code class="bg-slate-200 px-1 py-0.5 rounded text-navy-900 font-semibold font-mono">content.json</code> in your website folder.
        </p>
      </div>
    `;
    document.body.appendChild(drawer);

    // Initial load of components
    window.lucide.createIcons();

    // Event listeners for open / close
    btn.addEventListener("click", () => {
      drawer.classList.remove("translate-x-full");
    });

    document.getElementById("admin-panel-close").addEventListener("click", () => {
      drawer.classList.add("translate-x-full");
    });

    // Event listeners for editor language toggle
    const enBtn = document.getElementById("admin-lang-en");
    const bnBtn = document.getElementById("admin-lang-bn");

    function updateEditorLangControls() {
      const isEn = editLang === "en";
      enBtn.className = `px-3 py-1.5 font-bold transition-colors ${isEn ? "bg-[#102a43] text-white" : "text-[#102a43] hover:bg-slate-100"}`;
      bnBtn.className = `px-3 py-1.5 font-bold transition-colors ${!isEn ? "bg-[#102a43] text-white" : "text-[#102a43] hover:bg-slate-100"}`;
    }

    enBtn.addEventListener("click", () => {
      editLang = "en";
      updateEditorLangControls();
      renderActiveTabForm();
    });

    bnBtn.addEventListener("click", () => {
      editLang = "bn";
      updateEditorLangControls();
      renderActiveTabForm();
    });

    // Handle Tab clicks
    renderTabList();
    updateEditorLangControls();
    renderActiveTabForm();

    // Check if running on local dev server with save capabilities
    fetch("/api/status")
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "active") {
          const saveBtn = document.getElementById("admin-save-disk");
          if (saveBtn) {
            saveBtn.classList.remove("hidden");
            saveBtn.addEventListener("click", saveContentToDisk);
          }
          const instructions = document.getElementById("admin-save-instructions");
          if (instructions) {
            instructions.innerHTML = `Connected to local server. Click <strong class="text-[#047857]">Save Permanently to Disk</strong> to save directly to <code class="bg-slate-200 px-1 py-0.5 rounded text-navy-900 font-semibold font-mono">content.json</code>.`;
          }
        }
      })
      .catch(() => {
        // Silent catch: not running on local save-enabled server
      });

    // Handle content.json download
    document.getElementById("admin-download-json").addEventListener("click", downloadContentJSON);
  }

  // Draw the Tab list in the left-hand sidebar
  function renderTabList() {
    const list = document.getElementById("admin-tab-list");
    list.innerHTML = TABS.map(t => {
      const active = t.id === activeTab;
      return `
        <button type="button" data-tab-id="${t.id}" class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left text-xs font-semibold tracking-wide transition-all ${
          active 
            ? "bg-white border border-slate-200 text-emerald-900 shadow-sm" 
            : "text-slate-700 hover:bg-slate-200/50 hover:text-slate-900"
        }">
          <i data-lucide="${t.icon}" class="w-4 h-4 shrink-0 ${active ? "text-[#047857]" : "text-slate-400"}"></i>
          <span>${escapeHTML(t.label)}</span>
        </button>
      `;
    }).join("");

    // Add event listeners to the generated buttons
    list.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => {
        activeTab = b.getAttribute("data-tab-id");
        renderTabList();
        renderActiveTabForm();
      });
    });

    window.lucide.createIcons();
  }

  // Reusable Form Generation Helpers
  function createInputGroup(label, path, value, type = "text") {
    const uniqueId = `admin-field-${path.replace(/\./g, "-")}`;
    return `
      <div class="flex flex-col gap-1.5 w-full">
        <label for="${uniqueId}" class="text-[11px] uppercase tracking-wider font-extrabold text-slate-800">${escapeHTML(label)}</label>
        <input 
          id="${uniqueId}" 
          type="${type}" 
          value="${escapeHTML(value || '')}" 
          data-field-path="${path}"
          class="w-full px-3 py-2 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-all font-medium text-slate-900"
        />
      </div>
    `;
  }

  function createTextareaGroup(label, path, value) {
    const uniqueId = `admin-field-${path.replace(/\./g, "-")}`;
    return `
      <div class="flex flex-col gap-1.5 w-full">
        <label for="${uniqueId}" class="text-[11px] uppercase tracking-wider font-extrabold text-slate-800">${escapeHTML(label)}</label>
        <textarea 
          id="${uniqueId}" 
          rows="3"
          data-field-path="${path}"
          class="w-full px-3 py-2 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-all font-medium text-slate-900 leading-relaxed"
        >${escapeHTML(value || '')}</textarea>
      </div>
    `;
  }

  // Attach a unified real-time input event handler to the form container
  function attachLiveListeners() {
    const form = document.getElementById("admin-form-container");
    form.querySelectorAll("input[data-field-path], textarea[data-field-path]").forEach(el => {
      el.addEventListener("input", (e) => {
        const path = e.target.getAttribute("data-field-path");
        const val = e.target.value;
        const fullPath = `${editLang}.${path}`;
        
        // Update the global active memory
        setNestedPath(window.ICBLLC.CONTENT, fullPath, val);
        
        // Instantly push re-render to the website
        window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
      });
    });
  }

  // Render Form based on Active Tab & Selected editLang
  function renderActiveTabForm() {
    const form = document.getElementById("admin-form-container");
    const langData = window.ICBLLC.CONTENT[editLang];
    
    let html = "";

    switch (activeTab) {
      case "hero":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="home" class="w-4 h-4 text-[#047857]"></i><span>Hero Section &amp; Meta Settings</span></h2>
          ${createInputGroup("Site Header Title (meta)", "meta.site_title", langData.meta.site_title)}
          ${createInputGroup("Conference Abbreviation (nav)", "meta.conference_short", langData.meta.conference_short)}
          ${createInputGroup("Hero Tagline Badge", "hero.badge", langData.hero.badge)}
          ${createInputGroup("Department Name Eyebrow", "hero.eyebrow", langData.hero.eyebrow)}
          ${createTextareaGroup("Hero Main Heading Title", "hero.title", langData.hero.title)}
          ${createTextareaGroup("Hero Subtitle Text", "hero.subtitle", langData.hero.subtitle)}
          ${createInputGroup("Event Date Chip Label", "hero.date_label", langData.hero.date_label)}
          ${createInputGroup("Event Venue Chip Label", "hero.venue_label", langData.hero.venue_label)}
          ${createInputGroup("Primary Submission Portal (CMT3)", "hero.submission_url", langData.hero.submission_url, "url")}
          ${createInputGroup("Alternative Submission Mailto Target", "hero.submission_url_alt", langData.hero.submission_url_alt)}
        `;
        form.innerHTML = html;
        attachLiveListeners();
        break;

      case "about":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="info" class="w-4 h-4 text-[#047857]"></i><span>About the Conference</span></h2>
          ${createInputGroup("Section Title Heading", "about.heading", langData.about.heading)}
          <div class="flex flex-col gap-4 mt-2">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide">About Paragraphs</h3>
            <div id="about-paragraphs-list" class="flex flex-col gap-4">
              ${(langData.about.paragraphs || []).map((p, idx) => `
                <div class="flex gap-2 items-start border-l-2 border-slate-300 pl-3">
                  <div class="flex-1">
                    ${createTextareaGroup(`Paragraph ${idx + 1}`, `about.paragraphs.${idx}`, p)}
                  </div>
                  <button type="button" data-delete-para-idx="${idx}" class="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors mt-6">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-about-para" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Paragraph</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Custom list item add/delete listeners
        form.querySelector("#add-about-para").addEventListener("click", () => {
          langData.about.paragraphs.push(editLang === "bn" ? "নতুন অনুচ্ছেদ লিখুন।" : "Write new paragraph here.");
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-para-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-para-idx"));
            langData.about.paragraphs.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "cfp":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="file-text" class="w-4 h-4 text-[#047857]"></i><span>Call For Papers &amp; Tracks</span></h2>
          ${createInputGroup("CFP Heading", "cfp.heading", langData.cfp.heading)}
          ${createTextareaGroup("CFP Introduction Summary", "cfp.intro", langData.cfp.intro)}
          
          <div class="flex flex-col gap-4 mt-4 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1"><i data-lucide="layers" class="w-3.5 h-3.5"></i><span>Research Tracks (Max 6 Recommended)</span></h3>
            <div class="flex flex-col gap-4">
              ${(langData.cfp.tracks || []).map((track, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 relative flex flex-col gap-3">
                  <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-xs font-bold text-slate-600">Track ${idx + 1}</span>
                    <button type="button" data-delete-track-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  ${createInputGroup("Track Title", `cfp.tracks.${idx}.title`, track.title)}
                  ${createTextareaGroup("Track Description", `cfp.tracks.${idx}.description`, track.description)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-cfp-track" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Research Track</span>
            </button>
          </div>

          <div class="flex flex-col gap-4 mt-4 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1"><i data-lucide="list-checks" class="w-3.5 h-3.5"></i><span>Submission Guidelines</span></h3>
            ${createInputGroup("Guidelines Sub-heading", "cfp.guidelines_heading", langData.cfp.guidelines_heading)}
            <div class="flex flex-col gap-3">
              ${(langData.cfp.guidelines || []).map((guide, idx) => `
                <div class="flex gap-2 items-center">
                  <div class="flex-1">
                    <input 
                      type="text" 
                      value="${escapeHTML(guide)}" 
                      data-field-path="cfp.guidelines.${idx}"
                      class="w-full px-3 py-1.5 text-[13px] border border-slate-300 rounded-md focus:outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857] transition-all font-medium text-slate-900"
                    />
                  </div>
                  <button type="button" data-delete-guide-idx="${idx}" class="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-cfp-guide" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Guideline Line</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // CFP Add / Remove Listeners
        form.querySelector("#add-cfp-track").addEventListener("click", () => {
          langData.cfp.tracks.push({
            title: editLang === "bn" ? "নতুন গবেষণা ট্র্যাক" : "New Research Track",
            description: editLang === "bn" ? "ট্র্যাকের বিবরণ এখানে লিখুন।" : "Track scope details write here."
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-track-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-track-idx"));
            langData.cfp.tracks.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });

        form.querySelector("#add-cfp-guide").addEventListener("click", () => {
          langData.cfp.guidelines.push(editLang === "bn" ? "নতুন নির্দেশিকা লাইন লিখুন।" : "Write new submission rule here.");
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-guide-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-guide-idx"));
            langData.cfp.guidelines.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "dates":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="calendar" class="w-4 h-4 text-[#047857]"></i><span>Important Dates Settings</span></h2>
          ${createInputGroup("Important Dates Heading", "dates_meta.heading", langData.dates_meta.heading)}
          ${createTextareaGroup("Important Dates Section Intro", "dates_meta.intro", langData.dates_meta.intro)}
          ${createInputGroup("Milestone Tag Pre-text", "dates_meta.milestone_eyebrow", langData.dates_meta.milestone_eyebrow)}

          <div class="flex flex-col gap-4 mt-4 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i><span>Deadlines List</span></h3>
            <div class="flex flex-col gap-4">
              ${(langData.important_dates || []).map((milestone, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-3 relative">
                  <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-xs font-bold text-slate-600">Milestone ${idx + 1} (${langData.dates_meta.milestones[idx] || ('M' + (idx+1))})</span>
                    <button type="button" data-delete-date-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  ${createInputGroup("Deadline Event Label", `important_dates.${idx}.label`, milestone.label)}
                  ${createInputGroup("Deadline Target Date Text", `important_dates.${idx}.date`, milestone.date)}
                  ${createInputGroup(`Milestone Label Code (e.g. M0${idx+1})`, `dates_meta.milestones.${idx}`, langData.dates_meta.milestones[idx] || '')}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-important-date" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Important Date</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Important Dates Listeners
        form.querySelector("#add-important-date").addEventListener("click", () => {
          langData.important_dates.push({
            label: editLang === "bn" ? "নতুন সময়সীমা" : "New Deadline Event",
            date: editLang === "bn" ? "৩০ অক্টোবর ২০২৬" : "30 October 2026"
          });
          if (!langData.dates_meta.milestones) langData.dates_meta.milestones = [];
          const nextIdx = langData.important_dates.length;
          langData.dates_meta.milestones.push(editLang === "bn" ? `ধাপ ০${nextIdx}` : `M0${nextIdx}`);
          
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-date-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-date-idx"));
            langData.important_dates.splice(idx, 1);
            if (langData.dates_meta.milestones) {
              langData.dates_meta.milestones.splice(idx, 1);
            }
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "speakers":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="mic" class="w-4 h-4 text-[#047857]"></i><span>Keynote Speakers</span></h2>
          ${createInputGroup("Speakers Section Heading", "speakers.heading", langData.speakers.heading)}
          ${createTextareaGroup("Speakers Section Introductory Subtitle", "speakers.intro", langData.speakers.intro)}

          <div class="flex flex-col gap-4 mt-4 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1"><i data-lucide="user-check" class="w-3.5 h-3.5"></i><span>Keynote Speakers List</span></h3>
            <div class="flex flex-col gap-5">
              ${(langData.speakers.list || []).map((spk, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-3 relative">
                  <div class="flex justify-between items-center border-b pb-2">
                    <span class="text-xs font-bold text-slate-600">Keynote Speaker ${idx + 1}</span>
                    <button type="button" data-delete-speaker-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  ${createInputGroup("Full Name", `speakers.list.${idx}.name`, spk.name)}
                  ${createInputGroup("Affiliation / Institution", `speakers.list.${idx}.affiliation`, spk.affiliation)}
                  ${createInputGroup("Plenary Lecture Topic", `speakers.list.${idx}.topic`, spk.topic)}
                  ${createInputGroup("Profile Image URL (leave empty for custom avatar placeholder)", `speakers.list.${idx}.image_url`, spk.image_url)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-speaker" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
              <span>Add Keynote Speaker</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Keynote Speakers Listeners
        form.querySelector("#add-speaker").addEventListener("click", () => {
          langData.speakers.list.push({
            name: editLang === "bn" ? "অধ্যাপক ক খ গ" : "Prof. John Doe",
            affiliation: editLang === "bn" ? "ঢাকা বিশ্ববিদ্যালয়" : "University of Oxford",
            topic: editLang === "bn" ? "বাংলা উপন্যাসের ভবিষ্যৎ" : "The Future of Bengali Corpus Linguistics",
            image_url: ""
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-speaker-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-speaker-idx"));
            langData.speakers.list.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "committees":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="users" class="w-4 h-4 text-[#047857]"></i><span>Conference Committees</span></h2>
          ${createInputGroup("Committees Section Heading", "committees.heading", langData.committees.heading)}
          ${createTextareaGroup("Committees Introductory Description", "committees.lede", langData.committees.lede)}

          <!-- Advisory Committee -->
          <div class="flex flex-col gap-4 mt-4 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="award" class="w-4 h-4 text-[#047857]"></i><span>Advisory Committee</span></h3>
            <div class="flex flex-col gap-4">
              ${(langData.committees.advisory || []).map((m, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-2 relative">
                  <div class="flex justify-between items-center border-b pb-2 mb-1">
                    <span class="text-xs font-bold text-slate-600">Advisor Member ${idx + 1}</span>
                    <button type="button" data-delete-adv-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">${createInputGroup("Code", `committees.advisory.${idx}.code`, m.code)}</div>
                    <div class="col-span-2">${createInputGroup("Full Name", `committees.advisory.${idx}.name`, m.name)}</div>
                  </div>
                  ${createInputGroup("Assigned Role", `committees.advisory.${idx}.role`, m.role)}
                  ${createInputGroup("Institutional Affiliation", `committees.advisory.${idx}.affiliation`, m.affiliation)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-advisor" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Advisory Member</span>
            </button>
          </div>

          <!-- Local Organizing Committee -->
          <div class="flex flex-col gap-4 mt-6 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="landmark" class="w-4 h-4 text-[#047857]"></i><span>Local Organising Committee</span></h3>
            <div class="flex flex-col gap-4">
              ${(langData.committees.local || []).map((m, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-2 relative">
                  <div class="flex justify-between items-center border-b pb-2 mb-1">
                    <span class="text-xs font-bold text-slate-600">Local Member ${idx + 1}</span>
                    <button type="button" data-delete-loc-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">${createInputGroup("Code", `committees.local.${idx}.code`, m.code)}</div>
                    <div class="col-span-2">${createInputGroup("Full Name", `committees.local.${idx}.name`, m.name)}</div>
                  </div>
                  ${createInputGroup("Assigned Role", `committees.local.${idx}.role`, m.role)}
                  ${createInputGroup("Institutional Affiliation", `committees.local.${idx}.affiliation`, m.affiliation)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-local-member" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Local Committee Member</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Committee Event Listeners
        form.querySelector("#add-advisor").addEventListener("click", () => {
          const nextIdx = (langData.committees.advisory || []).length + 1;
          langData.committees.advisory.push({
            code: `A-${String(nextIdx).padStart(2, "0")}`,
            name: editLang === "bn" ? "নতুন উপদেষ্টা" : "New Advisory Member",
            role: editLang === "bn" ? "সদস্য" : "Member",
            affiliation: editLang === "bn" ? "শাবিপ্রবি" : "SUST, Bangladesh"
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-adv-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-adv-idx"));
            langData.committees.advisory.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });

        form.querySelector("#add-local-member").addEventListener("click", () => {
          const nextIdx = (langData.committees.local || []).length + 1;
          langData.committees.local.push({
            code: `L-${String(nextIdx).padStart(2, "0")}`,
            name: editLang === "bn" ? "নতুন স্থানীয় সদস্য" : "New Local Organiser",
            role: editLang === "bn" ? "সদস্য" : "Member",
            affiliation: editLang === "bn" ? "বাংলা বিভাগ, শাবিপ্রবি" : "Department of Bengali, SUST"
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-loc-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-loc-idx"));
            langData.committees.local.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "fees_logistics":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="banknote" class="w-4 h-4 text-[#047857]"></i><span>Fees &amp; Logistics Accommodation</span></h2>
          
          <div class="flex flex-col gap-4">
            <h3 class="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Registration Fees Settings</h3>
            ${createInputGroup("Fees Section Title Heading", "registration_fees.heading", langData.registration_fees.heading)}
            ${createTextareaGroup("Fees Explanatory Note", "registration_fees.note", langData.registration_fees.note)}
            
            <div class="flex flex-col gap-3">
              ${(langData.registration_fees.rows || []).map((fee, idx) => `
                <div class="p-3 border border-slate-200 rounded bg-slate-50 flex flex-col gap-2">
                  <span class="text-[10px] font-bold text-slate-500 uppercase">Category ${idx+1}</span>
                  ${createInputGroup("Category Title Name", `registration_fees.rows.${idx}.category`, fee.category)}
                  <div class="grid grid-cols-2 gap-2">
                    <div>${createInputGroup("Early Bird Fee", `registration_fees.rows.${idx}.early_bird`, fee.early_bird)}</div>
                    <div>${createInputGroup("Regular Fee", `registration_fees.rows.${idx}.regular`, fee.regular)}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="flex flex-col gap-4 mt-6 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="hotel" class="w-4 h-4 text-[#047857]"></i><span>Recommended Hotels</span></h3>
            ${createInputGroup("Logistics Title Heading", "logistics.heading", langData.logistics.heading)}
            ${createTextareaGroup("Logistics Section Subtitle Lede", "logistics.lede", langData.logistics.lede)}
            
            <div class="flex flex-col gap-4">
              ${(langData.logistics.hotels || []).map((hotel, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-2 relative">
                  <div class="flex justify-between items-center border-b pb-2 mb-1">
                    <span class="text-xs font-bold text-slate-600">Hotel ${idx + 1}</span>
                    <button type="button" data-delete-hotel-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  ${createInputGroup("Hotel Name", `logistics.hotels.${idx}.name`, hotel.name)}
                  ${createInputGroup("Tag Rating / Distance (e.g. ★★★ · 2.1 km)", `logistics.hotels.${idx}.tag`, hotel.tag)}
                  ${createInputGroup("Distance Detailed Description", `logistics.hotels.${idx}.distance`, hotel.distance)}
                  ${createInputGroup("Estimated Cost / Night (Tariff)", `logistics.hotels.${idx}.tariff`, hotel.tariff)}
                  ${createInputGroup("Booking Hotline / Telephone", `logistics.hotels.${idx}.contact`, hotel.contact)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-hotel" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Hotel Card</span>
            </button>
          </div>

          <div class="flex flex-col gap-4 mt-6 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="navigation" class="w-4 h-4 text-[#047857]"></i><span>Travel Routes &amp; Directions</span></h3>
            <div class="flex flex-col gap-4">
              ${(langData.logistics.routes || []).map((route, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-2 relative">
                  <div class="flex justify-between items-center border-b pb-2 mb-1">
                    <span class="text-xs font-bold text-slate-600">Route ${idx + 1}</span>
                    <button type="button" data-delete-route-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  ${createInputGroup("Transit Segment Name", `logistics.routes.${idx}.label`, route.label)}
                  ${createTextareaGroup("Transit Pricing & Instructions Details", `logistics.routes.${idx}.detail`, route.detail)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-route" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Travel Route</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Hotel & Route Listeners
        form.querySelector("#add-hotel").addEventListener("click", () => {
          langData.logistics.hotels.push({
            name: editLang === "bn" ? "নতুন হোটেল" : "New Hotel",
            tag: "★★★ · 3.0 km",
            distance: editLang === "bn" ? "শাবিপ্রবি থেকে ৩.০ কিমি" : "3.0 km from SUST",
            tariff: "BDT 2,500 – 4,000 / night",
            contact: "+880-1700-000000"
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-hotel-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-hotel-idx"));
            langData.logistics.hotels.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });

        form.querySelector("#add-route").addEventListener("click", () => {
          langData.logistics.routes.push({
            label: editLang === "bn" ? "সিলেট বাস টার্মিনাল → শাবিপ্রবি" : "Sylhet Bus Terminal → SUST",
            detail: editLang === "bn" ? "৪ কিমি · সিএনজি অটোরিকশা রিজার্ভ ১৫০ টাকা" : "4 km · CNG auto rickshaw BDT 150"
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-route-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-route-idx"));
            langData.logistics.routes.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "downloads_visa":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="download-cloud" class="w-4 h-4 text-[#047857]"></i><span>Visa &amp; Downloads Settings</span></h2>
          
          <div class="flex flex-col gap-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="globe" class="w-4 h-4 text-[#047857]"></i><span>Visa &amp; Travel Assistance</span></h3>
            ${createInputGroup("Visa Section Heading", "visa.heading", langData.visa.heading)}
            ${createTextareaGroup("Visa Introductory Summary", "visa.lede", langData.visa.lede)}
            ${createTextareaGroup("Embassy stamped Regimes Details", "visa.intro", langData.visa.intro)}
            ${createInputGroup("Step 1 Action Instruction", "visa.step1", langData.visa.step1)}
            ${createInputGroup("Step 2 Action Instruction", "visa.step2", langData.visa.step2)}
            ${createInputGroup("Step 3 Action Instruction", "visa.step3", langData.visa.step3)}
            ${createInputGroup("Step 4 Action Instruction", "visa.step4", langData.visa.step4)}
            ${createTextareaGroup("Visa Guidelines Footnote", "visa.foot", langData.visa.foot)}
          </div>

          <div class="flex flex-col gap-4 mt-6 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="folder-down" class="w-4 h-4 text-[#047857]"></i><span>Downloadable Templates Zone</span></h3>
            ${createInputGroup("Downloads Area Heading", "downloads.heading", langData.downloads.heading)}
            ${createTextareaGroup("Downloads Subtitle Description", "downloads.lede", langData.downloads.lede)}
            
            <div class="flex flex-col gap-4">
              ${(langData.downloads.items || []).map((dl, idx) => `
                <div class="p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-2 relative">
                  <div class="flex justify-between items-center border-b pb-2 mb-1">
                    <span class="text-xs font-bold text-slate-600">Downloadable Doc ${idx + 1}</span>
                    <button type="button" data-delete-dl-idx="${idx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">${createInputGroup("Doc Code", `downloads.items.${idx}.code`, dl.code)}</div>
                    <div class="col-span-2">${createInputGroup("Format details (e.g. DOCX · 64 KB)", `downloads.items.${idx}.format`, dl.format)}</div>
                  </div>
                  ${createInputGroup("Document Main Title", `downloads.items.${idx}.title`, dl.title)}
                  ${createTextareaGroup("Document Sub-heading Description", `downloads.items.${idx}.note`, dl.note)}
                  ${createInputGroup("Template Download Path (href)", `downloads.items.${idx}.href`, dl.href)}
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-download-item" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Document Template</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Downloads Item Add / Delete Listeners
        form.querySelector("#add-download-item").addEventListener("click", () => {
          const nextIdx = (langData.downloads.items || []).length + 1;
          langData.downloads.items.push({
            code: `DOC-${String(nextIdx).padStart(2, "0")}`,
            format: "MS Word · .docx · 64 KB",
            title: editLang === "bn" ? "নতুন জমা দেয়ার ফরম" : "New Abstract Format Template",
            note: editLang === "bn" ? "নতুন ওয়ার্ড টেমপ্লেট" : "Word format APA 7th edition rule document.",
            href: "assets/new-template.docx"
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-dl-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-dl-idx"));
            langData.downloads.items.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "schedule":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="clock" class="w-4 h-4 text-[#047857]"></i><span>Parallel Event Schedule Flow</span></h2>
          ${createInputGroup("Schedule Main Heading Title", "schedule.heading", langData.schedule.heading)}
          ${createTextareaGroup("Schedule Section Subtitle Description", "schedule.lede", langData.schedule.lede)}
          
          <div class="flex flex-col gap-6 mt-4 border-t pt-4">
            <h3 class="text-xs font-extrabold text-[#102a43] uppercase tracking-wide flex items-center gap-1.5"><i data-lucide="calendar" class="w-4 h-4 text-[#047857]"></i><span>Conference Days &amp; Sessions</span></h3>
            <div class="flex flex-col gap-6">
              ${(langData.schedule.days || []).map((day, dIdx) => `
                <div class="p-4 border-2 border-slate-300 rounded-lg bg-slate-50 flex flex-col gap-4 relative">
                  <div class="flex justify-between items-center border-b border-slate-300 pb-2 bg-slate-200/50 -m-4 mb-1 p-3 rounded-t-md">
                    <span class="text-xs font-extrabold text-[#102a43] flex items-center gap-1"><i data-lucide="calendar-days" class="w-3.5 h-3.5"></i><span>Day ${dIdx + 1} (${day.code})</span></span>
                    <button type="button" data-delete-day-idx="${dIdx}" class="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </div>
                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">${createInputGroup("Day Code", `schedule.days.${dIdx}.code`, day.code)}</div>
                    <div class="col-span-2">${createInputGroup("Day Title heading", `schedule.days.${dIdx}.day_title`, day.day_title)}</div>
                  </div>
                  ${createInputGroup("Calendar Date Text", `schedule.days.${dIdx}.date`, day.date)}

                  <!-- Sessions List Inside Day -->
                  <div class="flex flex-col gap-3 border-t border-slate-300 pt-3">
                    <h4 class="text-[10px] font-extrabold text-[#047857] uppercase tracking-wider">Parallel Sessions &amp; Time slots</h4>
                    <div class="flex flex-col gap-3">
                      ${(day.sessions || []).map((ses, sIdx) => `
                        <div class="p-3 border border-slate-200 rounded bg-white flex flex-col gap-2 relative">
                          <button type="button" data-delete-session-didx="${dIdx}" data-delete-session-sidx="${sIdx}" class="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-50 transition-colors">
                            <i data-lucide="x" class="w-3 h-3"></i>
                          </button>
                          <div class="grid grid-cols-3 gap-2">
                            <div class="col-span-1">${createInputGroup("Code", `schedule.days.${dIdx}.sessions.${sIdx}.code`, ses.code)}</div>
                            <div class="col-span-2">${createInputGroup("Time duration", `schedule.days.${dIdx}.sessions.${sIdx}.time`, ses.time)}</div>
                          </div>
                          ${createInputGroup("Session Subject Title", `schedule.days.${dIdx}.sessions.${sIdx}.title`, ses.title)}
                          ${createTextareaGroup("Detailed Agenda Summary", `schedule.days.${dIdx}.sessions.${sIdx}.detail`, ses.detail)}
                        </div>
                      `).join("")}
                    </div>
                    <button type="button" data-add-session-day-idx="${dIdx}" class="w-fit inline-flex items-center gap-1.5 px-2 py-1 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded font-bold text-[10px] transition-colors shadow-sm mt-1">
                      <i data-lucide="plus" class="w-3 h-3"></i>
                      <span>Add Session Entry</span>
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
            <button type="button" id="add-schedule-day" class="w-fit inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#047857]/40 text-[#047857] hover:bg-emerald-50 rounded-md font-bold text-xs transition-colors shadow-sm">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add New Conference Day</span>
            </button>
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();

        // Day Add / Remove Listeners
        form.querySelector("#add-schedule-day").addEventListener("click", () => {
          const nextIdx = (langData.schedule.days || []).length + 1;
          langData.schedule.days.push({
            code: `D-${String(nextIdx).padStart(2, "0")}`,
            day_title: editLang === "bn" ? `দিন ${nextIdx} · সমাপনী অধিবেশন` : `Day ${nextIdx} · Plenary Sessions`,
            date: "17 March 2027",
            sessions: [
              {
                time: "09:00 – 10:30",
                code: `S-${String((nextIdx-1)*6 + 1).padStart(2, "0")}`,
                title: editLang === "bn" ? "নতুন বিষয়ভিত্তিক আলোচনা" : "New Parallel Session",
                detail: editLang === "bn" ? "বিস্তারিত বিবরণ এখানে লিখুন।" : "Session moderator details write here."
              }
            ]
          });
          window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
          renderActiveTabForm();
        });

        form.querySelectorAll("button[data-delete-day-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const idx = parseInt(b.getAttribute("data-delete-day-idx"));
            langData.schedule.days.splice(idx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });

        // Session Add / Delete Listeners inside Days
        form.querySelectorAll("button[data-add-session-day-idx]").forEach(b => {
          b.addEventListener("click", () => {
            const dIdx = parseInt(b.getAttribute("data-add-session-day-idx"));
            const sList = langData.schedule.days[dIdx].sessions || [];
            const nextCodeIdx = sList.length + 1;
            sList.push({
              time: "10:30 – 11:30",
              code: `S-0${nextCodeIdx}`,
              title: editLang === "bn" ? "নতুন সেশন বা চা বিরতি" : "New Interactive Session",
              detail: editLang === "bn" ? "বর্ণনা" : "Agenda description details here."
            });
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });

        form.querySelectorAll("button[data-delete-session-didx]").forEach(b => {
          b.addEventListener("click", () => {
            const dIdx = parseInt(b.getAttribute("data-delete-session-didx"));
            const sIdx = parseInt(b.getAttribute("data-delete-session-sidx"));
            langData.schedule.days[dIdx].sessions.splice(sIdx, 1);
            window.ICBLLC.renderAll(window.ICBLLC.getInitialLang());
            renderActiveTabForm();
          });
        });
        break;

      case "contact_footer":
        html = `
          <h2 class="text-sm font-extrabold text-[#102a43] border-b pb-2 mb-2 flex items-center gap-1.5"><i data-lucide="mail" class="w-4 h-4 text-[#047857]"></i><span>Contact &amp; Footer Text Settings</span></h2>
          ${createInputGroup("Contact Title Heading", "contact_info.heading", langData.contact_info.heading)}
          ${createTextareaGroup("Contact Section Description Subtitle", "contact_info.intro", langData.contact_info.intro)}
          ${createInputGroup("Organising Department Name", "contact_info.department", langData.contact_info.department)}
          ${createInputGroup("Host University Title", "contact_info.university", langData.contact_info.university)}
          ${createInputGroup("Postal Address / Location", "contact_info.address", langData.contact_info.address)}
          ${createInputGroup("Conference Email Contact", "contact_info.email", langData.contact_info.email)}
          ${createInputGroup("Secretariat Hotline Telephone", "contact_info.phone", langData.contact_info.phone)}
          
          <div class="flex flex-col gap-4 mt-4 border-t pt-4">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wide">Footer &amp; Copy-right</h3>
            ${createInputGroup("Footer Organized-by Label", "footer.made_for", langData.footer.made_for)}
            ${createInputGroup("Copyright Notice Info", "footer.rights", langData.footer.rights)}
          </div>
        `;
        form.innerHTML = html;
        attachLiveListeners();
        break;

      default:
        form.innerHTML = `<p class="text-slate-500 text-xs italic">Select a section from the left pane to edit content.</p>`;
        break;
    }

    // Refresh Lucide Icons after generating form elements
    window.lucide.createIcons();
  }

  // Generate and download content.json dynamically
  function downloadContentJSON() {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.ICBLLC.CONTENT, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "content.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("ICBLLC Admin Editor: Failed to serialize and download content.json", err);
      alert("Error: could not generate content.json for download. Please inspect browser console logs.");
    }
  }

  // Save updated content JSON to disk via local server API
  function saveContentToDisk() {
    const saveBtn = document.getElementById("admin-save-disk");
    const originalContent = saveBtn.innerHTML;
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = `<i data-lucide="loader" class="w-4 h-4 animate-spin"></i><span>Saving...</span>`;
    window.lucide.createIcons();

    fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(window.ICBLLC.CONTENT)
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          saveBtn.className = "w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2";
          saveBtn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i><span>Saved Successfully!</span>`;
          window.lucide.createIcons();
          setTimeout(() => {
            saveBtn.className = "w-full bg-[#102a43] hover:bg-[#182f6f] text-white py-3 rounded-lg font-bold text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2";
            saveBtn.innerHTML = originalContent;
            saveBtn.disabled = false;
            window.lucide.createIcons();
          }, 2000);
        } else {
          throw new Error(data.message || "Failed to save");
        }
      })
      .catch(err => {
        console.error("Failed to save content", err);
        alert(`Failed to save: ${err.message}`);
        saveBtn.innerHTML = originalContent;
        saveBtn.disabled = false;
        window.lucide.createIcons();
      });
  }

  // Run on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAdmin);
  } else {
    initAdmin();
  }
})();
