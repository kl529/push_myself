# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Push Myself" (나를 넘어라) is a Korean Progressive Web App (PWA) for personal development tracking. It combines goal management, journaling, thoughts organization, and statistical analysis to help users track their daily growth and development.

## Key Commands

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run supabase:setup  # Display Supabase setup instructions
```

### Supabase Integration
- Environment variables are optional - app automatically falls back to localStorage if Supabase is unavailable
- If using Supabase, create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database schema located in `supabase/schema.sql`
- Data migration from localStorage to Supabase handled automatically

## Architecture Overview

### Data Management Strategy
The app uses a dual-storage approach:
1. **Primary**: Supabase for persistent cloud storage
2. **Fallback**: Browser localStorage for offline/local-only usage
3. **Automatic Migration**: localStorage → Supabase on first run with environment variables

### Core Data Structure
- **DayData**: Main interface containing todos, thoughts, dailyReport, diary, and completedItems
- **Legacy Support**: LegacyDayData interface maintained for backward compatibility
- **Type Safety**: Comprehensive TypeScript interfaces in `data/types.ts`

### Component Architecture
- **MainPage.tsx**: Central orchestrator managing state and data flow
- **Tab Components**: Modular tabs in `components/tabs/` for different features
  - DashboardTab: Self-affirmation and daily quotes
  - TodoTab: Task management with drag-and-drop
  - ThoughtsTab: Morning thoughts and daily ideas
  - DiaryTab: Completed items and daily summaries
  - StatsTab: Analytics and progress visualization

### Data Flow Pattern
```
User Action → MainPage Handler → updateCurrentDayData → Supabase Service → Local State Update
                                                    ↓
                                             Fallback to localStorage on error
```

### State Management
- No external state management library used
- React useState for local component state
- Date-based data organization with current date navigation
- Real-time data persistence on every change

## Key Features Implementation

### Multi-Language Support
- Korean language interface with Korean date formatting
- Korean mood states: '좋음', '보통', '나쁨', '매우나쁨'
- Korean day names and month formatting

### PWA Features
- Service worker registration in layout.tsx
- Progressive enhancement with PWAInstall component
- Manifest file for app installation
- Comprehensive metadata for mobile optimization

### Drag & Drop
- Uses @dnd-kit for todo reordering
- Order field maintained for consistent sorting
- Immediate state updates with async persistence

### Data Resilience
- Graceful error handling with localStorage fallback
- Missing field initialization for backward compatibility
- Automatic data structure migration

## Testing and Development

- Use Chrome DevTools Application tab to test PWA features
- Test both online (Supabase) and offline (localStorage) modes
- Use date navigation to test data persistence across different dates
- Verify drag-and-drop functionality in TodoTab

## Important Notes

- Always maintain backward compatibility with existing localStorage data
- Test both Supabase and localStorage code paths
- Korean text content should be preserved exactly as written
- Date strings use ISO format (YYYY-MM-DD) consistently
- PWA features require HTTPS in production