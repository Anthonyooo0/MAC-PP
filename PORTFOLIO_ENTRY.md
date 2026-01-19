# MAC Project Command Center
## Technical Portfolio Entry

---

## Project Overview

**MAC Project Command Center** is a full-stack enterprise project management application built for MAC Products, specializing in high-voltage electrical equipment manufacturing. The system manages the complete lifecycle of industrial projects—from design through Factory Acceptance Testing (FAT) to shipment—providing real-time tracking, milestone management, and comprehensive audit logging for regulatory compliance.

### Core Problem Solved
Manufacturing companies in the high-voltage equipment sector require precise project tracking with built-in accountability. This application replaces fragmented spreadsheets and manual tracking with a centralized, auditable system that multiple team members can access simultaneously.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend Framework** | React 19.2 | Latest React with concurrent features |
| **Language** | TypeScript 5.8 | Type-safe development |
| **Build Tool** | Vite 6.2 | Lightning-fast HMR and builds |
| **Styling** | Tailwind CSS 3.x | Utility-first responsive design |
| **Backend/Database** | Supabase (PostgreSQL) | Real-time database with REST API |
| **State Management** | React Hooks + useMemo | Optimized reactive state |
| **Authentication** | Custom implementation | Domain-restricted access control |

---

## Architecture Pattern

**Single-Page Application (SPA)** with a **serverless backend** architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (React SPA)                      │
├─────────────────────────────────────────────────────────────┤
│  App.tsx (1,079 LOC)                                        │
│  ├── State Management Layer (useState, useMemo)             │
│  ├── Data Transformation Layer (camelCase ↔ snake_case)    │
│  ├── 5 View Controllers (Dashboard, List, Calendar, etc.)  │
│  └── Modal System (Edit, Create, Delete Confirm)           │
├─────────────────────────────────────────────────────────────┤
│                    COMPONENT LIBRARY                         │
│  ├── Login.tsx          (87 LOC) - Authentication           │
│  ├── MilestoneStepper   (62 LOC) - Progress visualization   │
│  ├── ProjectEditModal   (259 LOC) - CRUD operations         │
│  └── NewProjectModal    (252 LOC) - Project creation        │
├─────────────────────────────────────────────────────────────┤
│                    SUPABASE BACKEND                          │
│  ├── PostgreSQL Database (2 tables)                         │
│  ├── REST API (auto-generated)                              │
│  └── Real-time subscriptions (available)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Highlights

### 1. Comprehensive Audit Logging System

Built a **granular change tracking system** that captures every modification for regulatory compliance:

```typescript
// Tracks 7 project fields + 5 milestone states + unlimited punch list items
const fieldsToTrack: (keyof Project)[] = [
  'status', 'progress', 'lead', 'fatDate', 'landing', 'description', 'comments'
];

// Generates human-readable diffs
diffs.push(`${label}: "${original[field]}" -> "${updated[field]}"`);
```

**Key Features:**
- Before/after value comparisons stored as strings
- Tracks project creation, updates, deletions, and punch list changes
- Timestamps with user attribution for accountability
- Reverse-chronological audit log view with filtering

### 2. Multi-Format Date Parsing Engine

Implemented a **flexible date parser** that handles various industry date formats:

```typescript
const parseDate = (dateStr: string): Date | null => {
  // Handles: "Dec. 2025", "Mar-26", "12/16/2025", "02/19/25"
  const formats = [
    /^([A-Za-z]{3})\.?\s*(\d{4})$/,   // Month-Year
    /^([A-Za-z]{3})-(\d{2})$/,         // Month-YY
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/ // MM/DD/YYYY or MM/DD/YY
  ];
  // Graceful fallback for "N/A" and "TBD" values
};
```

### 3. Five-Phase Milestone Stepper Component

Created a **reusable visual progress tracker** for manufacturing stages:

```
  DESIGN → MAT → FAB → FAT → SHIP
    ●───────●───────●───────○───────○
```

- Dual-mode operation: read-only display vs. interactive toggle
- Visual state indicators with connecting lines
- Integrated with audit logging for milestone changes

### 4. Smart Punch List Feature

Engineered a **context-aware punch list system** that only appears when FAT (Factory Acceptance Test) milestone is reached:

```typescript
// Auto-scroll to punch list when FAT is newly checked
useEffect(() => {
  if (form.milestones.fat && !project.milestones.fat) {
    setTimeout(() => {
      punchListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
}, [form.milestones.fat]);
```

**UX Features:**
- Conditional rendering based on project phase
- Smooth scroll animation on activation
- One-click toggle with visual feedback
- Enter key support for rapid item entry

### 5. Performance-Optimized Filtering

Implemented **memoized computed values** for efficient re-renders:

```typescript
// Filtered projects recalculate only when dependencies change
const filteredProjects = useMemo(() => {
  return projects.filter(p => {
    const matchesTab = p.category === activeTab;
    const matchesSearch = /* multi-field search */;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesTab && matchesSearch && matchesStatus;
  });
}, [projects, activeTab, searchTerm, filterStatus, viewMode]);

// Statistics computed once per project array update
const stats = useMemo(() => ({
  critical: projects.filter(p => p.status === 'Critical').length,
  fatReady: projects.filter(p => p.milestones.fab && !p.milestones.fat).length,
  // ...
}), [projects]);
```

### 6. Database Layer Abstraction

Built a **bi-directional data transformation layer** between app and database:

```typescript
// Database → App (snake_case → camelCase)
const transformedProjects = projectsData.map(p => ({
  id: p.id,
  dateCreated: p.date_created,
  fatDate: p.fat_date || 'N/A',
  punchList: p.punch_list || []
}));

// App → Database (camelCase → snake_case)
const updateData = {
  date_created: updated.dateCreated,
  fat_date: updated.fatDate,
  punch_list: updated.punchList || []
};
```

### 7. Nested Modal System

Implemented a **layered modal architecture** with proper z-index management:

```
z-index: 60 → Edit Modal (backdrop-blur-sm)
z-index: 70 → Delete Confirmation (nested overlay)
```

Features:
- Sticky header with scrollable content
- Ref-based scroll management
- Confirmation dialogs for destructive actions

---

## Key Features Built

### Dashboard / Pipeline View
- **KPI Cards**: Real-time statistics (Critical, FAT Pending, Ready to Ship, Completed)
- **Project Timeline**: All projects with milestone indicators and status badges
- **Quick Actions**: One-click project creation and editing

### Project List View
- **Category Tabs**: Pumping / Field Service / EHV equipment separation
- **Multi-field Search**: Utility name, substation, order number
- **Status Filtering**: All / Active / Critical / Late / Done
- **Progress Visualization**: Percentage bars with live updates

### Interactive Calendar
- **Dynamic Month Navigation**: Previous/Next with Today button
- **Project Mapping**: Plots FAT and Landing dates on calendar
- **Color-coded Events**: Red (Critical), Blue (Active), Green (Complete)
- **Event Legend**: Visual key for date types and statuses

### FAT Punch List Management
- **Vertical Stepper UI**: Numbered items with connecting lines
- **Completion Tracking**: Visual progress indicator (X/Y Complete)
- **Audit Trail**: All changes logged with timestamps
- **Click-to-Toggle**: Instant status updates with database sync

### System Audit Log
- **Tabular Display**: Timestamp, User, Project, Action, Details
- **Comprehensive Tracking**: Captures all CRUD operations
- **User Attribution**: Email-based accountability

---

## Technical Challenges Solved

### Challenge 1: Flexible Date Handling
**Problem**: Manufacturing projects use inconsistent date formats ("Dec. 2025", "Mar-26", "12/16/25")

**Solution**: Built a regex-based parser with fallback chains and null handling for TBD/N/A values

### Challenge 2: Punch List State Synchronization
**Problem**: Punch list changes weren't persisting to database consistently

**Solution**: Implemented explicit JSON column updates with console logging for debugging, plus local state fallback on network errors

### Challenge 3: Modal Scroll Management
**Problem**: When FAT milestone was checked, users couldn't find the newly-visible punch list section

**Solution**: Added useRef + useEffect combination with smooth scroll animation triggered on milestone state change

### Challenge 4: Data Transformation Layer
**Problem**: Supabase uses snake_case, React app uses camelCase

**Solution**: Created bidirectional mapping functions at the API boundary, keeping internal code consistent

---

## Code Quality Indicators

### Design Patterns Used
- **Component Composition**: Reusable modals and stepper components
- **Controlled Components**: All form inputs with React state
- **Memoization Pattern**: useMemo for expensive computations
- **Ref Pattern**: DOM manipulation for scroll behavior

### Type Safety
```typescript
// Union types for constrained values
export type ProjectStatus = 'Active' | 'Critical' | 'Late' | 'Done';
export type ProjectCategory = 'Pumping' | 'Field Service' | 'EHV';
export type ViewMode = 'dashboard' | 'list' | 'calendar' | 'punchlist' | 'changelog';

// Strongly typed interfaces
export interface Project {
  id: number;
  category: ProjectCategory;
  status: ProjectStatus;
  milestones: Milestones;
  punchList?: PunchListItem[];
  // ...
}
```

### Error Handling
- Try-catch blocks around all database operations
- User-facing alerts for failed saves
- Local state fallback when network fails
- Console logging for debugging

### Code Organization
```
/MAC-PP
├── App.tsx              # Main application (1,079 LOC)
├── types.ts             # TypeScript interfaces (47 LOC)
├── constants.tsx        # Icons and seed data (40 LOC)
├── supabase.ts          # Database client config (6 LOC)
├── index.css            # Custom styles + animations (86 LOC)
└── components/
    ├── Login.tsx        # Authentication (87 LOC)
    ├── MilestoneStepper.tsx  # Progress visualization (62 LOC)
    ├── ProjectEditModal.tsx  # Edit + punch list (259 LOC)
    └── NewProjectModal.tsx   # Project creation (252 LOC)
```

---

## Metrics & Scale

| Metric | Value |
|--------|-------|
| **Total Lines of Code** | 1,957 |
| **Primary Component (App.tsx)** | 1,079 lines |
| **React Components** | 6 |
| **TypeScript Interfaces** | 5 |
| **View Modes** | 5 |
| **Database Tables** | 2 (projects, changelog) |
| **Tracked Fields** | 15+ per project |
| **Date Formats Supported** | 4 |
| **Git Commits** | 22 |
| **Status Types** | 4 |
| **Milestone Phases** | 5 |

---

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id              BIGINT PRIMARY KEY,
  category        TEXT,            -- 'Pumping' | 'Field Service' | 'EHV'
  utility         TEXT,            -- Power company name
  substation      TEXT,            -- Location identifier
  date_created    TEXT,
  order_number    TEXT,            -- PO number
  fat_date        TEXT,
  landing         TEXT,            -- Delivery date
  status          TEXT,            -- 'Active' | 'Critical' | 'Late' | 'Done'
  progress        INTEGER,         -- 0-100
  lead            TEXT,            -- Project manager
  description     TEXT,
  comments        TEXT,
  milestones      JSONB,           -- {design, mat, fab, fat, ship}
  punch_list      JSONB,           -- Array of punch list items
  created_at      TIMESTAMP
);
```

### Changelog Table
```sql
CREATE TABLE changelog (
  id           UUID PRIMARY KEY,
  timestamp    TEXT,
  user_email   TEXT,
  project_id   BIGINT,
  project_info TEXT,               -- "Utility - Substation"
  action       TEXT,               -- 'Created' | 'Updated' | 'Deleted' | etc.
  changes      TEXT,               -- Human-readable diff string
  created_at   TIMESTAMP
);
```

---

## What Makes This Project Stand Out

1. **Domain-Specific Design**: Built specifically for manufacturing project lifecycle management, not a generic template

2. **Audit-First Architecture**: Every change is tracked from day one, enabling regulatory compliance and accountability

3. **Intuitive UX Decisions**: Smart features like auto-scroll to punch list, conditional component rendering, and visual milestone steppers

4. **Modern Stack**: React 19, TypeScript 5.8, Vite 6—using latest stable versions

5. **Production-Ready Features**: Error handling, loading states, responsive design, session persistence

6. **Clean Data Layer**: Proper separation between database format and application format

7. **Scalable Component Design**: Modular architecture allows easy addition of new views and features

---

## Future Enhancement Opportunities

- Real-time collaboration via Supabase subscriptions
- PDF export for audit reports
- Email notifications for milestone changes
- Role-based access control (RBAC)
- Mobile-native app (React Native)
- Dashboard analytics and charts
- API integration with ERP systems

---

*Built with React 19 + TypeScript + Supabase + Tailwind CSS*
*Version 2.1.0 | 22 commits | ~2,000 lines of code*
