<div align="center">

<img src="app/public/icon-192x192.png" alt="Upwards icon" width="64" height="64" />

# Upwards - Habit & Task Tracker

**A modern, full-featured habit tracking and time management application**

Built with Vite, Supabase, TypeScript, and Tailwind CSS

[Features](#-features) • [Quick Start](#-quick-start) • [Screenshots](#-app-structure) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 **Activity Management**
- **Activity Groups** - Organize habits into categories (Health, Work, Personal, etc.)
- **Custom Activities** - Create habits with flexible routines (daily, weekly, monthly, custom)
- **Color Coding** - Visual distinction with custom colors for groups and activities

### ✅ **Daily Task Tracking**
- **Interactive Checklist** - Check off completed tasks with a single click
- **Date Navigation** - View and manage tasks for any date (past, present, future)
- **Completion Stats** - Automatic calculation of daily completion percentage
- **Persistent Data** - All task completions saved to database

### ⏱️ **Time Tracking**
- **Live Timer** - Real-time tracking with HH:MM:SS display
- **One-Click Start/Stop** - Simple interface to track time on activities
- **Recent History** - View your last 5 time entries
- **Visual Indicators** - Pulsing dot shows active timer status

### 🔒 **Security & Privacy**
- **User Authentication** - Secure login/signup with Supabase Auth
- **Row Level Security** - Your data is isolated and protected
- **Password Reset** - Forgot password functionality included

### 🎨 **Modern UI**
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Compatible** - Follows system preferences
- **Clean Interface** - Built with shadcn/ui components
- **Smooth Animations** - Polished user experience

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Supabase account and local CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd upwards
   ```

2. **Apply database migrations**
   ```bash
   cd backend
   supabase db reset
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../app
   pnpm install
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

📖 **Detailed setup instructions:** See [SETUP.md](SETUP.md)

---

## 🏗️ App Structure

### Main Dashboard
The app features a clean two-column layout:

**Left Column:**
- 📁 Activity Groups Manager
- 🎯 Activities/Habits Manager

**Right Column:**
- ⏱️ Time Tracker
- ✅ Daily Tasks List

### User Flow
```
1. Sign Up/Login
   ↓
2. Create Activity Groups (e.g., "Health", "Work")
   ↓
3. Add Activities to Groups (e.g., "Morning Exercise", "Read 30 min")
   ↓
4. Track Daily: Check off completed tasks
   ↓
5. Track Time: Start/stop timer for activities
   ↓
6. View Progress: See completion rates and time spent
```

---

## 🗄️ Database Schema

```
┌─────────────────┐
│ activity_groups │
├─────────────────┤
│ • id            │
│ • user_id       │
│ • name          │
│ • color         │
│ • is_archived   │
└────────┬────────┘
         │
         │ 1:N
         ↓
┌─────────────────┐         ┌──────────────┐
│   activities    │────────→│ time_entries │
├─────────────────┤  1:N    ├──────────────┤
│ • id            │         │ • id         │
│ • user_id       │         │ • user_id    │
│ • group_id      │         │ • activity_id│
│ • name          │         │ • time_start │
│ • color         │         │ • time_end   │
│ • routine       │         └──────────────┘
│ • is_completed  │
└─────────────────┘
         
┌─────────────────┐
│ daily_entries   │
├─────────────────┤
│ • id            │
│ • user_id       │
│ • date          │
│ • completed[]   │
└─────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Vite** - Lightning-fast build tool and dev server
- **React** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **Lucide Icons** - Beautiful icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication
  - Real-time subscriptions (ready to use)

### Development
- **pnpm** - Fast, efficient package manager
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 📂 Project Structure

```
upwards/
├── backend/
│   └── supabase/
│       ├── migrations/          # Database migrations
│       ├── config.toml          # Supabase config
│       └── seed.sql             # Seed data
│
└── app/                         # Vite + React frontend
    ├── src/
    │   ├── main.tsx             # Entry point
    │   ├── App.tsx              # Root component
    │   ├── pages/               # Route pages
    │   ├── components/          # UI components
    │   │   ├── activities/
    │   │   ├── journal/
    │   │   ├── tasks/
    │   │   ├── timer/
    │   │   └── ui/              # shadcn/ui components
    │   └── lib/
    │       ├── utils.ts
    │       └── db/              # Supabase client & queries
    └── public/                  # Static assets
```

---

## 📖 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup and configuration guide
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Complete implementation details
- Component docs available in each component file

---

## 🎯 Usage Examples

### Creating Your First Habit

1. **Create a Group**
   ```
   Click "New Group" → Name: "Health" → Color: Green → Create
   ```

2. **Add an Activity**
   ```
   Click "New Activity" → Name: "Morning Run"
   → Group: "Health" → Routine: "daily" → Create
   ```

3. **Track It**
   ```
   ✓ Check it off daily in the Daily Tasks list
   ⏱️ Click Play to track time spent
   ```

### Viewing Past Progress

1. Use the date navigation in Daily Tasks
2. Click ← or → to navigate dates
3. Click "Today" to return to current date
4. Check off tasks for any date

---

## 🔮 Future Enhancements

Potential features for future development:

- [ ] Habit streak tracking and visualization
- [ ] Statistics dashboard with charts
- [ ] Calendar heatmap view (GitHub-style)
- [ ] Weekly/monthly aggregations
- [ ] Push notifications for reminders
- [ ] Data export (CSV/JSON)
- [ ] Recurring task templates
- [ ] Tags and advanced filtering
- [ ] Daily notes/journal
- [ ] Achievement badges
- [ ] Social features (optional sharing)

---

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

[Your chosen license]

---

## 🙏 Acknowledgments

- **Supabase** - Excellent backend platform
- **Vite** - Blazing fast dev tooling
- **shadcn** - Beautiful UI components
- **Tailwind Labs** - CSS framework

---

<div align="center">

**Built with ❤️ for better habits and productivity**

[Report Bug](https://github.com/andre-koga/okhabit/issues) • [Request Feature](https://github.com/andre-koga/okhabit/issues)

</div>
