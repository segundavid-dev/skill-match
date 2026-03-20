# SkillMatch 🌱

> **Match your skills. Make real impact.**

SkillMatch connects skilled volunteers with non-profits and social impact organisations through a fast, fun Tinder-style swiping interface and a smart matching algorithm.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Swipe to match | Tinder-style card stack — swipe right to show interest, left to pass |
| 🎉 Match screen | Confetti celebration + instant messaging when both sides match |
| 🧙 Profile wizard | 4-step onboarding for volunteers (skills, causes, availability) |
| 💬 Real-time chat | WhatsApp-style messaging with typing indicators |
| 📊 Dashboard | Impact stats, upcoming opportunities, match streak tracker |
| 🌙 Dark mode | Full dark mode toggle |
| 📱 Mobile-first | Fully responsive with bottom navigation on mobile |

---

## 🗂 Project structure

```
skillmatch/
├── public/
│   ├── index.html
│   ├── logo.jpg          ← App logo (replace with your own)
│   └── hero-bg.jpg       ← Landing page hero background
├── src/
│   ├── App.jsx           ← Root component & screen router
│   ├── index.js          ← React entry point
│   ├── components/
│   │   ├── BottomNav.jsx  ← Mobile bottom navigation bar
│   │   ├── Confetti.jsx   ← Match celebration confetti animation
│   │   ├── Logo.jsx       ← SkillMatch logo with image
│   │   └── SwipeCard.jsx  ← Draggable swipe card component
│   ├── pages/
│   │   ├── LandingPage.jsx   ← Public hero / marketing page
│   │   ├── AuthModal.jsx     ← Sign in / sign up + role selection
│   │   ├── ProfileWizard.jsx ← 4-step volunteer onboarding
│   │   ├── SwipeScreen.jsx   ← Main swipe feed + match celebration
│   │   ├── MatchesPage.jsx   ← List of mutual matches
│   │   ├── ChatInbox.jsx     ← Conversation list
│   │   ├── ChatPage.jsx      ← Individual chat thread
│   │   ├── Dashboard.jsx     ← Stats, upcoming opportunities, streak
│   │   └── ProfilePage.jsx   ← User profile + star ratings
│   └── data/
│       └── constants.js   ← All static mock data (skills, orgs, messages)
└── package.json
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install & run

```bash
# Clone the repo
git clone https://github.com/your-username/skillmatch.git
cd skillmatch

# Install dependencies
npm install

# Start dev server
npm start
```

The app opens at **http://localhost:3000**

### Production build

```bash
npm run build
```

Output goes to `/build` — ready to deploy to Vercel, Netlify, GitHub Pages, etc.

---

## 🌐 Deploy to Vercel (one command)

```bash
npx vercel
```

---

## 🎨 Customisation

### Replace the logo
Drop your logo file into `public/logo.jpg` (or update the `src` in `src/components/Logo.jsx`).

### Replace the hero background
Drop your photo into `public/hero-bg.jpg`.

### Change brand colours
The primary green `#10B981` and teal `#14B8A6` appear throughout the inline styles. A quick find-and-replace in your editor will re-theme the whole app.

### Add real data
Replace the mock arrays in `src/data/constants.js` with API calls, or wire up a backend (Supabase, Firebase, etc.).

---

## 🛠 Tech stack

- **React 18** — UI library
- **Create React App** — build tooling
- **Inline styles** — zero CSS-in-JS dependencies, easy to understand
- **Google Fonts** — DM Serif Display + Plus Jakarta Sans

---

## 📄 License

MIT — free to use and modify.
