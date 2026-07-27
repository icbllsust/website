const fs = require('fs');

const indexContent = fs.readFileSync('c:/Users/Lenovo/Downloads/files/index.html', 'utf8');
const subContent = fs.readFileSync('c:/Users/Lenovo/Downloads/files/submission.html', 'utf8');
const regContent = fs.readFileSync('c:/Users/Lenovo/Downloads/files/registration.html', 'utf8');

const footerRegex = /<footer id="site-footer"[\s\S]*?<\/footer>/;
const indexFooterMatch = indexContent.match(footerRegex);

if (indexFooterMatch) {
  const indexFooter = indexFooterMatch[0];
  
  const newSubContent = subContent.replace(footerRegex, indexFooter);
  fs.writeFileSync('c:/Users/Lenovo/Downloads/files/submission.html', newSubContent);
  
  const newRegContent = regContent.replace(footerRegex, indexFooter);
  fs.writeFileSync('c:/Users/Lenovo/Downloads/files/registration.html', newRegContent);
  console.log("Footer synced to submission and registration.");
} else {
  console.log("Footer not found in index.html");
}

// 2. Fix the bkash card color in registration.html
let regContentUpdated = fs.readFileSync('c:/Users/Lenovo/Downloads/files/registration.html', 'utf8');

const oldBkashCard = `<!-- MFS (bKash) -->
      <div class="resource-card border-t-4 border-emerald-600">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-950">বিকাশ (bKash)</h3>
          <span class="badge badge-break">MFS</span>
        </div>
        <div class="rounded-xl p-4 space-y-1.5 text-xs bg-slate-50 border border-slate-200 mb-4">
          <p class="font-bold text-emerald-800 text-lg">01351475668</p>`;

const newBkashCard = `<!-- MFS (bKash) -->
      <div class="resource-card border-t-4 border-pink-600">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-base text-slate-950">বিকাশ (bKash)</h3>
          <span class="badge badge-cultural" style="background-color: #fce7f3; color: #db2777;">MFS</span>
        </div>
        <div class="rounded-xl p-4 space-y-1.5 text-xs bg-pink-50 border border-pink-200 mb-4">
          <p class="font-bold text-pink-700 text-lg">01351475668</p>`;

regContentUpdated = regContentUpdated.replace(oldBkashCard, newBkashCard);
fs.writeFileSync('c:/Users/Lenovo/Downloads/files/registration.html', regContentUpdated);
console.log("bKash styling updated in registration.html");

// 3. Fix '১০00' to '১০০০' in submission.html
let subContentUpdated = fs.readFileSync('c:/Users/Lenovo/Downloads/files/submission.html', 'utf8');
subContentUpdated = subContentUpdated.replace(/১০00/g, '১০০০');
fs.writeFileSync('c:/Users/Lenovo/Downloads/files/submission.html', subContentUpdated);
console.log("1000 spelling fixed in submission.html");
