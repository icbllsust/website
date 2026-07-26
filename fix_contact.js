const fs = require('fs');

let indexHtmlPath = 'c:/Users/Lenovo/Downloads/files/index.html';
let content = fs.readFileSync(indexHtmlPath, 'utf8');

// The block to replace:
const regex = /<div class="mt-10 rounded-2xl border border-slate-300 p-8 text-center space-y-5 bg-white shadow-md">[\s\S]*?<div class="flex flex-wrap justify-center gap-3 pt-2">/g;

const newBlock = `<div class="mt-10 rounded-2xl border border-slate-300 p-8 text-center space-y-5 bg-white shadow-md">
        <div class="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-white border border-slate-100 shadow-sm">
          <img src="assets/sust-logo.png" alt="SUST Logo" class="w-12 h-12 object-contain">
        </div>
        <h3 class="font-display font-bold text-2xl text-slate-950"><span class="lang-bn">বাংলা বিভাগ, শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়</span><span class="lang-en">Department of Bengali, Shahjalal University of Science and Technology</span></h3>
        <p class="text-sm font-medium text-slate-700"><span class="lang-bn">শাহজালাল বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়, সিলেট-৩১১৪, বাংলাদেশ</span><span class="lang-en">Shahjalal University of Science and Technology, Sylhet-3114, Bangladesh</span></p>
        <div class="mt-4 flex flex-col gap-2 text-slate-900 items-center">
          <a href="mailto:icbll2026bng@gmail.com"
             class="font-extrabold hover:underline flex items-center justify-center gap-1.5">
             <i data-lucide="mail" class="w-4 h-4 text-emerald-700"></i> icbll2026bng@gmail.com
          </a>
          <a href="tel:01351475668"
             class="font-extrabold hover:underline flex items-center justify-center gap-1.5">
             <i data-lucide="phone" class="w-4 h-4 text-emerald-700"></i> 01351475668
          </a>
        </div>
        <div class="flex flex-wrap justify-center gap-3 pt-2">`;

content = content.replace(regex, newBlock);

fs.writeFileSync(indexHtmlPath, content);
console.log('Successfully updated index.html contact section via Regex');
