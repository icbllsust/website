# ICBLL-2026: First International Conference on Bengali Language and Literature

![SUST Logo](images/sust_logo.png)

Welcome to the official website repository for the **First International Conference on Bengali Language and Literature (ICBLL-2026)**.

**Live Website:** [icbll.sust.edu](https://icbll.sust.edu)

---

## About the Conference
Historically, the Sylhet region has been a fertile ground for the practice of literature, culture, and free-thinking. To continue this legacy, the **Department of Bangla at Shahjalal University of Science and Technology (SUST)** warmly invites researchers, academicians, and scholars from around the globe to the **First International Conference on Bengali Language and Literature (ICBLL-2026)**.

The conference will feature research paper presentations in six specific areas including language, literature, culture, social transformation, and the environment. This two-day event will serve as a unique platform for intensive knowledge sharing and the exchange of innovative ideas.

### Event Details
- **Date:** 27-28 November 2026
- **Location:** Central Auditorium, Shahjalal University of Science and Technology (SUST), Sylhet, Bangladesh
- **Host:** Department of Bangla, SUST

---

## Key Tracks & Scope
Original research papers are invited on the following topics:
1. **Language, Literature, and Culture**
2. **Comparative and Postcolonial Literature**
3. **Progress and Women's Emancipation**
4. **Religion, Philosophy, and Science**
5. **Society, State, and Economy**
6. **Nature and Environment**

---

## Core Features
We have built and integrated a highly robust, modern, and user-friendly experience:

- **Bilingual Engine with Routing:** Custom Vanilla JS script for seamless Bengali/English toggling without page reloads. Includes URL parameter support (?lang=en or #en) for direct language routing.
- **Automated Email Integration:** Abstract submission and payment confirmation workflows are seamlessly integrated with the user's email client, auto-filling subjects and body templates.
- **Dynamic Countdown Timer:** A fully bilingual countdown timer leading up to the conference date.
- **Sticky Deadline Bar:** A non-intrusive sticky bar for mobile and desktop to keep users aware of submission deadlines and quick-actions.
- **Responsive Grid System:** A 100% mobile and tablet-portrait friendly layout built with Tailwind CSS, ensuring pixel-perfect proportions across all devices.
- **High-Contrast Academic Typography:** Beautiful, eye-comfort typography utilizing Noto Serif Bengali and Merriweather for authoritative headings, and Noto Sans Bengali for highly legible body text.
- **Glassmorphism UI:** Soft shadows, rounded cards, and elegant borders that give a premium and modern aesthetic.
- **Vercel Edge Optimization:** Heavily optimized 'vercel.json' configuration for aggressive asset caching (1 year immutable), clean URLs, and strict security headers.

---

## Tech Stack
This website is built with a modern, static architecture optimized for performance, accessibility, and AI-readability.

- **Frontend:** Vanilla HTML5, CSS3, JavaScript
- **Styling:** Tailwind CSS (via CDN for rapid prototyping & utility classes)
- **Icons:** Lucide Icons
- **Deployment:** Vercel (Optimized Static Edge Network)
- **SEO & AI:** Fully optimized with Open Graph (OG) tags, Twitter Cards, and Schema.org JSON-LD structured data for AI bots and Search Engines.

---

## Design & Development
This website was designed and developed by:

**Md Golam Mubasshir Rafi**  
[Website](https://gmrafi.com.bd) | [GitHub](https://github.com/gmrafi)

---

## License
**© 2026 Department of Bangla, Shahjalal University of Science and Technology (SUST). All rights reserved.**

This repository is **NOT** open-source. The code, design, and assets are strictly protected under copyright law. Unauthorized copying, modification, distribution, or reuse of this codebase is strictly prohibited without explicit written permission from the Department of Bangla, SUST. 

For full details, please read the [LICENSE.md](LICENSE.md) file.

---

## Developer Setup & Handover Guide
If you are taking over this project, here is everything you need to know:

### 1. Project Structure
This is a pure static site (Vanilla JS/HTML/CSS) with no build tools or heavy node modules required. 
- **HTML Files:** index.html, submission.html, registration.html
- **Styling:** style.css (Tailwind is loaded via CDN, so no postCSS/build step needed)
- **JavaScript:** script.js (Handles bilingual toggling, mobile menu, and sticky bars)
- **Configuration:** vercel.json (Handles advanced caching, clean URLs, and security headers)

### 2. Running Locally
You don't need npm install. Just run a local web server to prevent CORS issues with local assets:
- **Using VS Code:** Install the "Live Server" extension and click "Go Live".
- **Using Python:** Run 'python -m http.server 3000' in the terminal.
- **Using Node:** Run 'npx serve .' in the terminal.

### 3. Making Changes
- **Bilingual Text:** The site uses a custom JS class toggler. Text is wrapped in <span class="lang-bn">Bengali</span><span class="lang-en">English</span>. Edit both languages simultaneously.
- **Language Routing:** You can force a language on load by appending ?lang=en or #en to the URL.
- **Deployment:** Commits to the main branch are automatically deployed via Vercel.
