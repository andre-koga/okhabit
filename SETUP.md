# OKHabit - Setup Instructions

## 🚀 Quick Start

### 1. Apply Database Migration

First, apply the new database migration to fix the schema:

```bash
cd backend
supabase db reset
```

Or if you want to apply just the new migration:

```bash
cd backend
supabase migration up
```

### 2. Start Development Server

```bash
cd frontend
pnpm install  # If dependencies aren't installed yet
pnpm dev
```

### 3. Access the App

Open [http://localhost:3000](http://localhost:3000) in your browser.

## ✅ What's Implemented

### Core Features
- ✅ **Activity Groups** - Organize your habits into groups (Work, Health, Personal, etc.)
- ✅ **Activities/Habits** - Create and manage individual habits with routines (daily, weekly, etc.)
- ✅ **Daily Task Checklist** - Check off completed tasks each day with date navigation
- ✅ **Time Tracker** - Track time spent on activities with start/stop timer
- ✅ **User Authentication** - Secure login and signup with Supabase Auth
- ✅ **Row Level Security** - All data is isolated per user

### Database Improvements
- ✅ Fixed BIT → BOOLEAN types for better compatibility
- ✅ Added indexes for improved query performance
- ✅ Unique constraint for daily entries per user per date
- ✅ TypeScript types generated for type safety

## 📖 How to Use

### Create Your First Group
1. Click "New Group" in the Activity Groups section
2. Enter a name (e.g., "Health", "Work", "Personal")
3. Choose a color to identify your group
4. Click "Create"

### Add Activities/Habits
1. After creating groups, click "New Activity"
2. Enter the activity name (e.g., "Morning Exercise", "Read 30 minutes")
3. Select which group it belongs to
4. Choose a routine (daily, weekly, monthly, custom)
5. Pick a color (optional)
6. Click "Create"

### Track Daily Tasks
1. The Daily Tasks panel shows all your daily activities
2. Check off tasks as you complete them
3. Use the date navigation to view past days or plan ahead
4. Completion percentage is automatically calculated

### Track Time
1. Click the play button on any activity to start tracking time
2. The timer will show elapsed time in real-time
3. Click "Stop" when you're done
4. Recent time entries are shown below the timer

## 🎯 Next Steps (Optional Enhancements)

- Add habit streak tracking (e.g., "5 days in a row")
- Create statistics dashboard with charts
- Add weekly/monthly views
- Implement notifications for daily tasks
- Export data to CSV
- Add recurring task scheduling logic
- Dark mode improvements
- Mobile app version (PWA support already included)

## 🔧 Troubleshooting

### Database Issues
If you encounter database errors, reset the database:
```bash
cd backend
supabase db reset
```

### Type Errors
If TypeScript shows errors, the types might be out of sync:
```bash
cd frontend
# Types are already generated in lib/supabase/types.ts
```

### Migration Not Applied
Check migration status:
```bash
cd backend
supabase migration list
```

## 📝 File Structure

```
frontend/
├── app/
│   ├── page.tsx                    # Main landing page (dashboard)
│   ├── protected/page.tsx          # Protected dashboard page
│   └── auth/                       # Authentication pages
├── components/
│   ├── habit-tracker-dashboard.tsx # Main dashboard component
│   ├── activity-groups-manager.tsx # Group CRUD UI
│   ├── activities-manager.tsx      # Activities CRUD UI
│   ├── daily-tasks-list.tsx       # Daily checklist UI
│   ├── time-tracker.tsx           # Time tracking UI
│   └── ui/                        # Shadcn UI components
└── lib/
    └── supabase/
        ├── types.ts               # Database types
        ├── client.ts              # Client-side Supabase
        └── server.ts              # Server-side Supabase

backend/
└── supabase/
    ├── migrations/                # Database migrations
    ├── seed.sql                   # Seed data
    └── config.toml               # Supabase config
```

## 🎨 Customization

All components use Tailwind CSS and shadcn/ui for styling. You can:
- Modify colors in `tailwind.config.ts`
- Adjust component layouts in individual component files
- Add new UI components from shadcn/ui library

Enjoy tracking your habits! 🎉
