const fs = require('fs');

let htmlPath = 'c:/Users/Lenovo/Downloads/files/submission.html';
let content = fs.readFileSync(htmlPath, 'utf8');

const oldSection = `<!-- TEMPLATE DOWNLOADS  -->
  <section class="space-y-6 border-b-2 border-slate-200 pb-12">
    <div class="flex items-center gap-3.5">
      <div class="resource-icon bg-emerald-50 text-emerald-800 w-12 h-12">
        <i data-lucide="download" class="w-6 h-6"></i>
      </div>
      <div>
        <h2 class="font-display text-2xl font-bold text-slate-950">৪. অফিশিয়াল টেমপ্লেট ও নির্দেশিকা ডাউনলোড</h2>
        <p class="text-xs font-semibold mt-0.5 text-slate-600">আপনার সারসংক্ষেপ সাজাতে রেডিমেড টেমপ্লেট ব্যবহার করুন</p>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-3">
      <div class="resource-card">
        <div class="resource-icon bg-emerald-50 text-emerald-800">
          <i data-lucide="file-text" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-950">Abstract Template (.docx)</h3>
          <p class="text-xs mt-1 font-medium text-slate-600">বাংলা ও ইংরেজি সারসংক্ষেপের রেডিমেড ওয়ার্ড টেমপ্লেট।</p>
        </div>
        <a href="downloads/abstract_template.docx" download="abstract_template.docx"
           class="btn btn-md btn-green mt-auto" style="justify-content:center;">
          <i data-lucide="download" class="w-4 h-4"></i> ডাউনলোড DOCX
        </a>
      </div>

      <div class="resource-card">
        <div class="resource-icon bg-amber-50 text-amber-700">
          <i data-lucide="file-down" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-950">CFP Circular (PDF)</h3>
          <p class="text-xs mt-1 font-medium text-slate-600">পূর্ণাঙ্গ সারসংক্ষেপ আহ্বান বিজ্ঞপ্তি ও নিয়মাবলী।</p>
        </div>
        <a href="downloads/cfp_notice.pdf" download="cfp_notice.pdf"
           class="btn btn-md btn-gold mt-auto" style="justify-content:center;">
          <i data-lucide="download" class="w-4 h-4"></i> ডাউনলোড PDF
        </a>
      </div>

      <div class="resource-card">
        <div class="resource-icon bg-slate-100 text-slate-900">
          <i data-lucide="book-open" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-950">Conference Brochure</h3>
          <p class="text-xs mt-1 font-medium text-slate-600">সম্মেলনের বিস্তারিত তথ্যপুস্তিকা ও সময়সূচি।</p>
        </div>
        <a href="downloads/conference_brochure.pdf" download="conference_brochure.pdf"
           class="btn btn-md btn-navy mt-auto" style="justify-content:center;">
          <i data-lucide="download" class="w-4 h-4"></i> ব্রোশিওর ডাউনলোড
        </a>
      </div>
    </div>
  </section>`;

const newSection = `<!-- TEMPLATE DOWNLOADS  -->
  <section class="space-y-6 border-b-2 border-slate-200 pb-12">
    <div class="flex items-center gap-3.5">
      <div class="resource-icon bg-emerald-50 text-emerald-800 w-12 h-12">
        <i data-lucide="download" class="w-6 h-6"></i>
      </div>
      <div>
        <h2 class="font-display text-2xl font-bold text-slate-950">৪. প্রয়োজনীয় ফাইল ও ডাউনলোড হাব</h2>
        <p class="text-xs font-semibold mt-0.5 text-slate-600">সম্মেলনে অংশগ্রহণকারী গবেষকদের সুবিধার্থে প্রয়োজনীয় টেমপ্লেট ও নির্দেশিকা</p>
      </div>
    </div>

    <div class="grid gap-5 md:grid-cols-3">
      <div class="resource-card">
        <div class="resource-icon bg-emerald-50 text-emerald-800">
          <i data-lucide="file-text" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-950">সারসংক্ষেপ টেমপ্লেট (.docx)</h3>
          <p class="text-xs mt-1 font-medium text-slate-600">বাংলা ও ইংরেজি সারসংক্ষেপ রচনার অফিশিয়াল টেমপ্লেট ও ফন্ট নির্দেশিকা।</p>
        </div>
        <a href="downloads/abstract_template.docx" download="abstract_template.docx"
           class="btn btn-md btn-green mt-auto" style="justify-content:center;">
          <i data-lucide="download" class="w-4 h-4"></i> ডাউনলোড DOCX
        </a>
      </div>

      <div class="resource-card">
        <div class="resource-icon bg-amber-50 text-amber-700">
          <i data-lucide="file-down" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-950">সারসংক্ষেপ আহ্বান বিজ্ঞপ্তি (PDF)</h3>
          <p class="text-xs mt-1 font-medium text-slate-600">পূর্ণাঙ্গ সারসংক্ষেপ আহ্বান বিজ্ঞপ্তি ও নিয়মাবলি সংক্রান্ত অফিশিয়াল নির্দেশিকা।</p>
        </div>
        <a href="downloads/cfp_notice.pdf" download="cfp_notice.pdf"
           class="btn btn-md btn-gold mt-auto" style="justify-content:center;">
          <i data-lucide="download" class="w-4 h-4"></i> ডাউনলোড PDF
        </a>
      </div>

      <div class="resource-card">
        <div class="resource-icon bg-slate-100 text-slate-900">
          <i data-lucide="book-open" class="w-6 h-6"></i>
        </div>
        <div>
          <h3 class="font-bold text-base text-slate-950">সম্মেলন ব্রোশিয়ার (Brochure)</h3>
          <p class="text-xs mt-1 font-medium text-slate-600">সম্মেলনের উদ্দেশ্য, কমিটি, ভেন্যু ও বিষয়বস্তু সমৃদ্ধ তথ্যপুস্তিকা।</p>
        </div>
        <a href="downloads/conference_brochure.pdf" download="conference_brochure.pdf"
           class="btn btn-md btn-navy mt-auto" style="justify-content:center;">
          <i data-lucide="download" class="w-4 h-4"></i> ব্রোশিওর ডাউনলোড
        </a>
      </div>
    </div>
  </section>`;

// Replace carefully since whitespace might differ slightly.
// Use Regex.
const regex = /<!-- TEMPLATE DOWNLOADS  -->[\s\S]*?<\/section>/;
content = content.replace(regex, newSection);

fs.writeFileSync(htmlPath, content);
console.log('Successfully updated template downloads in submission.html');
