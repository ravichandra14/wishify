# 🎂 Wishify

Wishify is a premium, modern, AI-powered birthday wish and greeting card creator & delivery scheduling web application. It helps users manage their contacts, keep track of upcoming birthdays, generate highly personalized AI wishes based on customized tones, design gorgeous interactive greeting cards, and schedule them for timely delivery via Email or messaging channels.

---

## ✨ Key Features

- **📊 Interactive Dashboard**: Get a birds-eye view of upcoming birthdays, delivery queue status, and recent activity at a single glance.
- **👥 Contact Directory**: Store names, emails, relationships, and birth dates. Easily start generating tailored wishes with pre-filled details.
- **🤖 AI Wish Generator**: Craft perfect birthday messages. Select custom tones (e.g., *Heartfelt*, *Humorous*, *Poetic*, *Professional*) and specify custom constraints to generate the perfect message.
- **🎨 Interactive Greeting Card Designer**:
  - Multiple beautifully curated themes (*Classic Crimson*, *Pastel Bloom*, *Midnight Star*, *Forest Mist*).
  - Custom typography choices and layout configurations.
  - Shape decorations and customizable color schemes.
  - One-click canvas generation with download capability as an image (PNG).
- **⏰ Scheduled Delivery Queue**: Schedule generated wishes or greeting cards to be sent automatically at a future date and time via Email or direct messages.
- **📂 Wish History & Archive**: A chronological record of all your generated wishes, cards, and sent logs for easy retrieval and reference.
- **⚙️ Preferences & Settings**: Manage notification schedules (reminder on the day, 1 day before, 3 days before), timezone settings, and personal user profile.

---

## 🛠️ Technology Stack

Wishify is built using modern web technologies to ensure a responsive, premium, and fast user experience:

- **Frontend Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: Modern, responsive Vanilla CSS with custom CSS variables, gradients, glassmorphism, and micro-animations.
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, scalable iconography.
- **Data Persistence**: `LocalStorage` hydration for preserving contacts, settings, schedule queue, and history logs locally.

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18 or higher recommended) and `npm` installed.

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ravichandra14/wishify.git
   cd wishify
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local URL (usually `http://localhost:5173`) to view the application.

4. **Build for Production**:
   To generate a production-ready optimized build:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
wishify/
├── public/              # Static assets
├── src/
│   ├── components/      # UI Components (Dashboard, Contacts, Modals, Card Designer, etc.)
│   │   ├── Contacts.tsx
│   │   ├── CreateWish.tsx
│   │   ├── Dashboard.tsx
│   │   ├── History.tsx
│   │   ├── LandingPage.tsx
│   │   ├── Modals.tsx
│   │   ├── ScheduledWishes.tsx
│   │   └── Settings.tsx
│   ├── utils/           # Helper scripts & generator logic
│   │   └── wishGenerator.ts
│   ├── App.tsx          # Main layout and app state manager
│   ├── index.css        # Core stylesheet and design tokens
│   └── main.tsx         # App entry point
├── package.json         # Project metadata and dependencies
└── tsconfig.json        # TypeScript configuration
```

---

## 📄 License

This project is licensed under the MIT License. Feel free to use, modify, and distribute it.
