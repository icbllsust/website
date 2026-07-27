const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

const regex = /<a href="https:\/\/docs\.google\.com\/forms[\s\S]*?গুগল ফর্মে সাবমিট করুন[\s\S]*?<\/a>/;

const replacement = `<a href="mailto:icbll2026bng@gmail.com"
               class="btn btn-sm btn-green flex-1 sm:flex-none justify-center">
              <span class="lang-bn">ইমেইলের মাধ্যমে সাবমিট করুন</span><span class="lang-en">Submit via Email</span>
              <i data-lucide="mail" class="w-3.5 h-3.5 ml-1"></i>
            </a>`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('index.html', content);
    console.log("Successfully replaced Google form link in index.html");
} else {
    console.log("Regex Target not found in index.html.");
}
