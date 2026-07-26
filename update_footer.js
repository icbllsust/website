const fs = require('fs');

// 1. Update index.html footer
let indexHtmlPath = 'c:/Users/Lenovo/Downloads/files/index.html';
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

const emailSectionRegexIndex = /<p class="flex items-center gap-2">\s*<i data-lucide="mail"[\s\S]*?<\/p>/;
const newEmailAndPhoneIndex = `<p class="flex items-center gap-2">
          <i data-lucide="mail" class="w-4 h-4 text-slate-900 shrink-0"></i>
          <a href="mailto:icbll2026bng@gmail.com" class="hover:underline text-slate-900 font-bold">icbll2026bng@gmail.com</a>
        </p>
        <p class="flex items-center gap-2 mt-1">
          <i data-lucide="phone" class="w-4 h-4 text-slate-900 shrink-0"></i>
          <a href="tel:01351475668" class="hover:underline text-slate-900 font-bold">01351475668 <span class="font-normal text-[11px]">(Helpline)</span></a>
        </p>`;

indexContent = indexContent.replace(emailSectionRegexIndex, newEmailAndPhoneIndex);
fs.writeFileSync(indexHtmlPath, indexContent);

// 2. Update registration.html footer
let regHtmlPath = 'c:/Users/Lenovo/Downloads/files/registration.html';
let regContent = fs.readFileSync(regHtmlPath, 'utf8');

const emailSectionRegexReg = /<p class="flex items-center gap-2 text-xs font-medium text-slate-900 mt-2">\s*<i data-lucide="mail"[\s\S]*?<\/p>/;
const newEmailAndPhoneReg = `<p class="flex items-center gap-2 text-xs font-medium text-slate-900 mt-2">
            <i data-lucide="mail" class="w-4 h-4 text-emerald-700 shrink-0"></i>
            <a href="mailto:icbll2026bng@gmail.com" class="hover:underline text-emerald-800 font-bold">icbll2026bng@gmail.com</a>
          </p>
          <p class="flex items-center gap-2 text-xs font-medium text-slate-900 mt-2">
            <i data-lucide="phone" class="w-4 h-4 text-emerald-700 shrink-0"></i>
            <a href="tel:01351475668" class="hover:underline text-emerald-800 font-bold">01351475668 <span class="font-normal text-[11px]">(Helpline)</span></a>
          </p>`;

// Let's actually check how registration.html footer is laid out first, wait, let me just do a generic replacement if possible, or I'll just use Regex. 
// Let's look at the actual registration.html footer mail tag.
// From previous search:
// {"File":"c:\\Users\\Lenovo\\Downloads\\files\\registration.html","LineNumber":499,"LineContent":"          <a href=\"mailto:icbll2026bng@gmail.com\" class=\"hover:underline text-emerald-800 font-bold\">icbll2026bng@gmail.com</a>"}

regContent = regContent.replace(
  /<p class="flex items-center gap-2 text-xs font-medium text-slate-900 mt-2">\s*<i data-lucide="mail" class="w-4 h-4 text-emerald-700 shrink-0"><\/i>\s*<a href="mailto:icbll2026bng@gmail.com".*?<\/a>\s*<\/p>/,
  newEmailAndPhoneReg
);

// 3. Update registration.html Google Form card to Submission Links card
const oldGoogleFormCard = `<!-- Google Form (Replaces CMT3) -->
      <div class="resource-card border-t-4 border-amber-500">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-950">গুগল ফর্ম (সারসংক্ষেপ জমা)</h3>
          <span class="badge badge-keynote">Online Form</span>
        </div>
        <p class="text-sm font-medium leading-relaxed text-slate-700 mb-4">
          শুধুমাত্র অ্যাবস্ট্রাক্ট বা সারসংক্ষেপ জমা দিতে নিচের লিংকে ক্লিক করুন।
        </p>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSdQtKEGDDVI4JACXwc8_UuNVYEIvnmnLODzmjoPBUkG7FN7TA/viewform?usp=dialog" target="_blank" rel="noopener noreferrer"
           class="btn btn-md btn-gold w-full flex items-center justify-center gap-2 mt-auto" style="border-radius:var(--radius-md);">
          <i data-lucide="external-link" class="w-4 h-4"></i>
          গুগল ফর্মে জমা দিন
        </a>
      </div>`;

const newSubmissionCard = `<!-- Submission Links -->
      <div class="resource-card border-t-4 border-emerald-500">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-950">সারসংক্ষেপ জমা</h3>
          <span class="badge badge-cultural">Submission</span>
        </div>
        <p class="text-sm font-medium leading-relaxed text-slate-700 mb-4">
          সারসংক্ষেপ ইমেইলে জমা দিতে অথবা সাবমিশন গাইডলাইন পড়তে নিচের বাটন ব্যবহার করুন।
        </p>
        <div class="flex flex-col gap-2 mt-auto">
          <a href="submission.html" class="btn btn-md btn-outline w-full flex items-center justify-center gap-2" style="border-radius:var(--radius-md);">
            <i data-lucide="file-text" class="w-4 h-4"></i> সাবমিশন পেজ ও গাইডলাইন
          </a>
          <a href="mailto:icbll2026bng@gmail.com" class="btn btn-md btn-green w-full flex items-center justify-center gap-2" style="border-radius:var(--radius-md);">
            <i data-lucide="mail" class="w-4 h-4"></i> ইমেইলে জমা দিন
          </a>
        </div>
      </div>`;

regContent = regContent.replace(oldGoogleFormCard, newSubmissionCard);
fs.writeFileSync(regHtmlPath, regContent);

console.log('Successfully updated registration and index pages.');
