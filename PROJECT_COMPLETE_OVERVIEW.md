# EventHub — Complete Project Overview (A to Z)

> **Campus Event Management Platform**
> A full-stack web application for managing college events — create, discover, enroll, and track campus activities with role-based access for students, faculty, and administrators.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure — Complete File Map](#3-project-structure--complete-file-map)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Design](#5-database-design)
6. [Backend — Complete Breakdown](#6-backend--complete-breakdown)
   - 6.1 [Configuration & Setup](#61-configuration--setup)
   - 6.2 [Models (Mongoose Schemas)](#62-models-mongoose-schemas)
   - 6.3 [Middleware](#63-middleware)
   - 6.4 [Controllers](#64-controllers)
   - 6.5 [Routes (API Endpoints)](#65-routes-api-endpoints)
   - 6.6 [Utilities](#66-utilities)
   - 6.7 [Scripts](#67-scripts)
   - 6.8 [Tests](#68-tests)
7. [Frontend — Complete Breakdown](#7-frontend--complete-breakdown)
   - 7.1 [Configuration & Setup](#71-configuration--setup)
   - 7.2 [State Management (Zustand Stores)](#72-state-management-zustand-stores)
   - 7.3 [Services (API Layer)](#73-services-api-layer)
   - 7.4 [Reusable Components](#74-reusable-components)
   - 7.5 [Layout Components](#75-layout-components)
   - 7.6 [Pages — All 17 Pages](#76-pages--all-17-pages)
   - 7.7 [Styling System](#77-styling-system)
8. [Authentication & Authorization System](#8-authentication--authorization-system)
9. [Role-Based Access Control (RBAC)](#9-role-based-access-control-rbac)
10. [Complete API Reference](#10-complete-api-reference)
11. [Critical Feature: Atomic Enrollment](#11-critical-feature-atomic-enrollment)
12. [Security Measures](#12-security-measures)
13. [User Interface & Design System](#13-user-interface--design-system)
14. [Route Map — All Frontend URLs](#14-route-map--all-frontend-urls)
15. [Environment Variables](#15-environment-variables)
16. [How to Run the Project](#16-how-to-run-the-project)
17. [Seed Data (Test Users & Activities)](#17-seed-data-test-users--activities)
18. [Testing](#18-testing)
19. [Documentation Files](#19-documentation-files)
20. [Complete File-by-File Summary Table](#20-complete-file-by-file-summary-table)

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | EventHub — Campus Event Management Platform |
| **Type** | Full-Stack Web Application |
| **Purpose** | End-to-end event management system for educational institutions — allows students to discover and enroll in events, faculty to create and manage events, and admins to oversee the entire system |
| **License** | MIT (Copyright 2026) |
| **Target Users** | College students, faculty, administrators |
| **Primary Language** | TypeScript (both frontend and backend) |

---

## 2. Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | ≥ 18 | JavaScript runtime |
| TypeScript | 5.3.3 | Static typing |
| Express.js | 4.18.2 | Web framework |
| MongoDB | — | NoSQL database |
| Mongoose | 8.0.3 | MongoDB ODM |
| JSON Web Token | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing |
| Helmet | 7.1.0 | HTTP security headers |
| express-rate-limit | 7.1.5 | Rate limiting |
| express-validator | 7.0.1 | Input validation |
| express-mongo-sanitize | 2.2.0 | NoSQL injection prevention |
| Winston | 3.11.0 | Logging |
| Morgan | 1.10.0 | HTTP request logging |
| Compression | 1.7.4 | Response compression |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Swagger | 6.2.8 / 5.0.0 | API documentation |
| Joi | 17.11.0 | Schema validation |
| Jest | 29.7 | Testing framework |
| mongodb-memory-server | — | In-memory MongoDB for tests |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI library |
| TypeScript | 5.3.3 | Static typing |
| Vite | 5.0.10 | Build tool & dev server |
| React Router DOM | 6.21.1 | Client-side routing |
| TanStack React Query | 5.17.9 | Server state management |
| Zustand | 4.4.7 | Client state management |
| Axios | 1.6.5 | HTTP client |
| Tailwind CSS | 3.4.0 | Utility-first CSS |
| Framer Motion | 10.18.0 | Animations |
| React Hook Form | 7.49.3 | Form management |
| react-hot-toast | 2.4.1 | Toast notifications |
| Headless UI | 1.7.19 | Accessible UI primitives |
| Heroicons | 2.1.1 | Icon library |
| date-fns | 3.0.6 | Date utilities |
| clsx + tailwind-merge | — | Class name utilities |

---

## 3. Project Structure — Complete File Map

```
Event-Management/
│
├── README.md                              # Project overview & setup guide
├── LICENSE                                # MIT License
├── .gitignore                             # Git ignore rules
├── start.sh                               # One-click Mac/Linux startup script
│
├── docs/
│   ├── Architecture.md                    # System architecture documentation
│   ├── Privacy.md                         # DPDP 2023 privacy policy
│   └── DesignNotes.md                     # Design decisions
│
├── backend/
│   ├── package.json                       # Dependencies & scripts
│   ├── tsconfig.json                      # TypeScript config
│   ├── jest.config.js                     # Test configuration
│   ├── .env                               # Environment variables (secrets)
│   │
│   ├── src/
│   │   ├── server.ts                      # Server startup & DB connection
│   │   ├── app.ts                         # Express app & middleware setup
│   │   │
│   │   ├── config/
│   │   │   └── index.ts                   # Centralized configuration (dotenv)
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces (IUser, IActivity, IParticipation, JWTPayload, AuthRequest)
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts                    # User schema (email, password, name, role, department, rollNumber)
│   │   │   ├── Activity.ts                # Activity schema (title, desc, dates, capacity, status, category)
│   │   │   └── Participation.ts           # Enrollment schema (activityId, userId, status) — compound unique index
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts                    # JWT authenticate, role authorize, optionalAuth
│   │   │   ├── errorHandler.ts            # Global error handler (duplicate key, validation, JWT errors)
│   │   │   └── validate.ts                # Express-validator result checker
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.ts          # Register, login, refresh, logout, profile, changePassword
│   │   │   ├── activityController.ts      # CRUD, enrollment (atomic), cancellation, participants list
│   │   │   └── dashboardController.ts     # Faculty/Student/Admin dashboards, analytics, CSV export, admin user/activity management
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.ts              # /api/auth/* (6 endpoints)
│   │   │   ├── activityRoutes.ts          # /api/activities/* (9 endpoints)
│   │   │   └── dashboardRoutes.ts         # /api/dashboard/* (7 endpoints)
│   │   │
│   │   └── utils/
│   │       ├── email.ts                   # Email templates (enrollment confirmation, waitlist)
│   │       └── logger.ts                  # Winston logger (console + file)
│   │
│   ├── scripts/
│   │   ├── seed.ts                        # Database seeder (21 users, 25 activities, 20 enrollments)
│   │   ├── checkUser.ts                   # User verification utility
│   │   └── fixIndexes.ts                  # Index repair utility
│   │
│   └── tests/
│       ├── setup.ts                       # MongoDB Memory Server test environment
│       ├── auth.test.ts                   # Auth tests (register, login, profile)
│       ├── enrollment.test.ts             # Race condition & atomic enrollment tests
│       └── participants-access.test.ts    # Access control tests
│
├── frontend/
│   ├── package.json                       # Dependencies & scripts
│   ├── tsconfig.json                      # TypeScript config (strict, path aliases)
│   ├── tsconfig.node.json                 # Node-specific TS config
│   ├── vite.config.ts                     # Vite dev server + API proxy
│   ├── tailwind.config.js                 # Custom theme (colors, fonts, shadows, animations)
│   ├── postcss.config.js                  # PostCSS plugins
│   ├── index.html                         # SPA entry point
│   ├── .env                               # Frontend env (API URL, app name)
│   │
│   └── src/
│       ├── main.tsx                       # React 18 entry, QueryClient setup
│       ├── App.tsx                        # Router, route definitions, theme, toaster
│       ├── index.css                      # Global styles, Tailwind layers, custom CSS classes
│       ├── vite-env.d.ts                  # Vite environment type definitions
│       │
│       ├── store/
│       │   ├── authStore.ts               # Authentication state (Zustand + persist)
│       │   └── themeStore.ts              # Theme toggle (Zustand + persist)
│       │
│       ├── services/
│       │   ├── api.ts                     # Axios instance, interceptors, token refresh
│       │   ├── authService.ts             # Auth API calls (register, login, refresh, logout, profile, changePassword)
│       │   ├── activityService.ts         # Activity API calls (CRUD, enrollment, participants)
│       │   ├── dashboardService.ts        # Dashboard API calls (stats, admin users/activities)
│       │   └── index.ts                   # Barrel export
│       │
│       ├── utils/
│       │   └── cn.ts                      # Tailwind class merge utility (clsx + tailwind-merge)
│       │
│       ├── components/
│       │   ├── Auth/
│       │   │   └── ProtectedRoute.tsx     # Route guard (auth check + role check)
│       │   │
│       │   ├── Layout/
│       │   │   ├── Layout.tsx             # Page layout (Navbar + Outlet + Footer)
│       │   │   └── Navbar.tsx             # Navigation bar (role-based links, mobile menu, theme toggle)
│       │   │
│       │   ├── Common/
│       │   │   ├── Button.tsx             # Button (5 variants, 3 sizes, loading state, icons)
│       │   │   ├── Card.tsx               # Card container (hover, glass variants)
│       │   │   ├── Input.tsx              # Text input (label, error, icons, password toggle)
│       │   │   ├── Badge.tsx              # Status badge (6 color variants, 3 sizes)
│       │   │   ├── Modal.tsx              # Dialog modal (5 sizes, backdrop blur, animations)
│       │   │   ├── Skeleton.tsx           # Loading placeholder (text, circular, rectangular)
│       │   │   └── index.ts              # Barrel export
│       │   │
│       │   ├── UI/
│       │   │   ├── Select.tsx             # Select dropdown (label, error, options)
│       │   │   └── TextArea.tsx           # Multi-line input (label, error)
│       │   │
│       │   └── Activity/
│       │       ├── ActivityCard.tsx        # Activity preview card (image, badges, progress bar)
│       │       └── ParticipantsList.tsx    # Participants table (status filter, pagination, avatars)
│       │
│       └── pages/
│           ├── HomePage.tsx               # Landing page (hero, features, activity preview, CTA)
│           ├── LoginPage.tsx              # Login form (email, password, role-based redirect)
│           ├── RegisterPage.tsx           # Registration form (7 fields, role selection, validation)
│           ├── ActivitiesPage.tsx         # Browse all activities (search, filters, pagination)
│           ├── ActivityDetailPage.tsx     # Single activity view (enrollment, organizer info)
│           ├── StudentDashboard.tsx       # Student hub (stats, enrolled, discover)
│           ├── FacultyDashboard.tsx       # Faculty hub (stats, quick actions, my activities)
│           ├── FacultyActivitiesPage.tsx  # Faculty activity management (edit, delete)
│           ├── CreateActivityPage.tsx     # New activity form (11 fields)
│           ├── EditActivityPage.tsx       # Edit activity form (pre-filled, 4 status options)
│           ├── MyActivitiesPage.tsx       # User's enrolled/created activities
│           ├── ProfilePage.tsx            # Profile view + password change
│           ├── AdminDashboard.tsx         # Admin hub (stats, department/category breakdown, recent items)
│           ├── AdminActivitiesPage.tsx    # Admin activity management (table, 5 filters, CRUD)
│           ├── AdminUsersPage.tsx         # Admin user management (table, search, role filter)
│           ├── NotFoundPage.tsx           # 404 error page
│           └── UnauthorizedPage.tsx       # 403 access denied page
```

**Total Files: ~75 source files**

---

## 4. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                               │
│  React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion       │
├────────────────────────────────────────────────────────────────────┤
│                      ↕ HTTP (Axios)                                │
├────────────────────────────────────────────────────────────────────┤
│                     BACKEND (Express.js)                           │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Security  │→ │ Validation│→ │  Controllers │→ │  Response   │  │
│  │ Helmet    │  │ express-  │  │  Auth        │  │  JSON + CSV │  │
│  │ CORS      │  │ validator │  │  Activity    │  │             │  │
│  │ Rate Limit│  │ Joi       │  │  Dashboard   │  │             │  │
│  │ Sanitize  │  │           │  │              │  │             │  │
│  └──────────┘  └───────────┘  └──────┬───────┘  └─────────────┘  │
│                                       │                            │
│                               ┌───────▼───────┐                   │
│                               │   Mongoose     │                   │
│                               │   Models       │                   │
│                               └───────┬───────┘                   │
├───────────────────────────────────────┼────────────────────────────┤
│                               ┌───────▼───────┐                   │
│                               │   MongoDB      │                   │
│                               │   Atlas Cluster│                   │
│                               └───────────────┘                   │
└────────────────────────────────────────────────────────────────────┘
```

### Data Flow for a Typical Request

```
Browser → Axios Interceptor (adds JWT) → Express → Helmet → CORS → Rate Limiter
→ Body Parser → MongoDB Sanitize → Router → authenticate middleware → authorize middleware
→ express-validator → Controller → Mongoose Model → MongoDB → Response → Axios Interceptor
(handles 401 refresh) → React Query Cache → UI Update
```

---

## 5. Database Design

### 5.1 Collections & Fields

#### Users Collection
| Field | Type | Required | Unique | Notes |
|-------|------|----------|--------|-------|
| email | String | Yes | Yes | Lowercase, validated regex |
| password | String | Yes | — | Bcrypt hashed (12 rounds), select: false |
| name | String | Yes | — | 2-100 characters |
| role | String | Yes | — | Enum: student, faculty, admin |
| department | String | No | — | Max 100 chars |
| rollNumber | String | No | Sparse | Max 50 chars, students only |
| refreshTokens | [String] | — | — | Array of active refresh tokens |
| createdAt | Date | Auto | — | Timestamp |
| updatedAt | Date | Auto | — | Timestamp |

**Indexes:** email (unique), role, department, rollNumber (unique + sparse)

**Methods:**
- `comparePassword(candidate)` → Boolean (bcrypt comparison)
- `toJSON()` → Strips password, refreshTokens, __v

**Hooks:**
- `pre('save')` → Hash password if modified

#### Activities Collection
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | String | Yes | 3-200 characters |
| description | String | Yes | 10-2000 characters |
| startDate | Date | Yes | Must be in the future (for enrollment) |
| endDate | Date | Yes | Must be after startDate |
| location | String | Yes | Max 200 characters |
| capacity | Number | Yes | Range: 1-10,000 |
| availableSlots | Number | Yes | ≤ capacity, atomically decremented |
| department | String | Yes | Max 100 characters |
| category | String | Yes | Enum: Academic, Cultural, Sports, Technical, Social, Workshop, Seminar, Competition, Other |
| posterImage | String | No | URL format |
| createdBy | ObjectId | Yes | References User |
| status | String | Yes | Enum: draft, published, cancelled, completed |
| createdAt | Date | Auto | |
| updatedAt | Date | Auto | |

**Indexes:** {status, startDate}, department, category, createdBy, {title: text, description: text}

**Virtual:** `enrolledCount` = capacity - availableSlots

#### Participations Collection
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| activityId | ObjectId | Yes | References Activity |
| userId | ObjectId | Yes | References User |
| enrolledAt | Date | Auto | Default: Date.now |
| status | String | Yes | Enum: enrolled, waitlisted, cancelled |
| createdAt | Date | Auto | |
| updatedAt | Date | Auto | |

**CRITICAL INDEX:** `{ activityId: 1, userId: 1 }` — **UNIQUE compound index** — prevents duplicate enrollment at the database level

**Other Indexes:** {userId, status}, {activityId, status}, enrolledAt (descending)

### 5.2 Relationships

```
User (1) ──── createdBy ────→ (Many) Activity
  │
  └── (1) ── userId ──→ (Many) Participation ←── activityId ── (1) Activity

• One faculty creates many activities
• One student has many participations
• One activity has many participations
• Each (user, activity) pair has at most ONE participation record (enforced by unique index)
```

---

## 6. Backend — Complete Breakdown

### 6.1 Configuration & Setup

#### `backend/package.json` (49 lines)
- Project name: `event-management-backend`
- Scripts: `dev` (tsx watch), `build` (tsc), `test` (jest --coverage), `seed` (ts-node seed.ts), `lint` (eslint)
- 16 production dependencies, 14 dev dependencies

#### `backend/tsconfig.json` (27 lines)
- Target ES2022, CommonJS module
- Strict mode with noUnusedLocals, noUnusedParameters, noImplicitReturns
- Path alias: `@/*` → `src/*`
- Source maps and declarations enabled

#### `backend/src/server.ts` (87 lines)
- **connectDB():** Connects to MongoDB using URI from config, creates indexes
- **startServer():** Starts Express on configured port
- **Graceful shutdown:** SIGTERM/SIGINT handlers with 10-second timeout
- **Error handlers:** Uncaught exceptions and unhandled rejections

#### `backend/src/app.ts` (123 lines)
- **Middleware chain (in order):**
  1. Helmet (security headers)
  2. CORS (origin from config.frontend.url)
  3. express-mongo-sanitize (NoSQL injection prevention)
  4. Compression (gzip responses)
  5. JSON body parser (10MB limit)
  6. URL-encoded parser (10MB limit)
  7. Morgan logging (skipped in test environment)
  8. Rate limiting (100 requests per 60 seconds per IP)
- **Routes:** /api/auth, /api/activities, /api/dashboard
- **Swagger:** OpenAPI 3.0 docs at /api-docs
- **Health check:** GET /health returns status, environment, uptime
- **Error handlers:** 404 notFound, global errorHandler

#### `backend/src/config/index.ts` (60 lines)
Centralized dotenv-based configuration object:

| Setting | Env Variable | Default |
|---------|-------------|---------|
| Environment | NODE_ENV | development |
| Port | PORT | 3000 |
| MongoDB URI | MONGODB_URI | localhost:27017/event-management |
| JWT Secret | JWT_SECRET | (required in prod, min 32 chars) |
| JWT Expiry | JWT_EXPIRES_IN | 15m |
| JWT Refresh Secret | JWT_REFRESH_SECRET | (required in prod) |
| JWT Refresh Expiry | JWT_REFRESH_EXPIRES_IN | 7d |
| Rate Limit Window | RATE_LIMIT_WINDOW_MS | 60000 |
| Rate Limit Max | RATE_LIMIT_MAX_REQUESTS | 100 |
| Enrollment Rate Limit | RATE_LIMIT_ENROLL_MAX | 10 |
| Bcrypt Rounds | BCRYPT_ROUNDS | 12 |
| Data Retention | DATA_RETENTION_DAYS | 730 |
| Frontend URL | FRONTEND_URL | http://localhost:5173 |
| Sentry DSN | SENTRY_DSN | (optional) |

#### `backend/src/types/index.ts` (53 lines)
TypeScript interfaces: `IUser`, `IActivity`, `IParticipation`, `JWTPayload`, `AuthRequest`

---

### 6.2 Models (Mongoose Schemas)

#### `User.ts` (104 lines)
- Fields: email, password (bcrypt hashed), name, role (student/faculty/admin), department, rollNumber, refreshTokens
- Pre-save hook: Hashes password using bcrypt with configurable rounds
- Method: `comparePassword()` for login verification
- toJSON: Strips sensitive fields (password, refreshTokens, __v)

#### `Activity.ts` (111 lines)
- Fields: title, description, dates, location, capacity, availableSlots, department, category (9 types), posterImage, createdBy (ref: User), status (4 states)
- Custom validators: endDate > startDate, availableSlots ≤ capacity
- Text index on title + description for full-text search
- Virtual: enrolledCount computed from capacity - availableSlots

#### `Participation.ts` (43 lines)
- Fields: activityId (ref: Activity), userId (ref: User), enrolledAt, status (enrolled/waitlisted/cancelled)
- **UNIQUE compound index** on {activityId, userId} — the database-level guard against duplicate enrollment
- Additional indexes for querying by user, activity, and date

---

### 6.3 Middleware

#### `auth.ts` (107 lines) — Authentication & Authorization
Three middleware functions:

1. **`authenticate`** — Verifies JWT from Authorization header
   - Extracts Bearer token
   - Verifies JWT signature
   - Checks user still exists in database
   - Attaches `req.user` = { userId, email, role }
   - Handles: TokenExpiredError (401), JsonWebTokenError (401)

2. **`authorize(...roles)`** — Role-based access control (RBAC)
   - Factory function accepting allowed roles array
   - Checks if `req.user.role` is in the allowed roles
   - Returns 403 with required roles if unauthorized

3. **`optionalAuth`** — Non-blocking authentication
   - Same as authenticate but doesn't fail on missing/invalid token
   - Used for public endpoints where auth is optional (activities listing)

#### `errorHandler.ts` (65 lines) — Global Error Handler
Catches and normalizes all errors:
- MongoDB duplicate key (11000) → 409 Conflict
- Mongoose ValidationError → 400 Bad Request with field details
- JWT errors → 401 Unauthorized
- Default → 500 with stack trace in development only

#### `validate.ts` (20 lines) — Validation Result Handler
Collects express-validator errors and returns 400 with structured error details: `{ field, message }[]`

---

### 6.4 Controllers

#### `authController.ts` (~385 lines) — Authentication

| Function | Method | Purpose |
|----------|--------|---------|
| `register` | POST | Create new user account (student/faculty only) |
| `login` | POST | Authenticate with email + password |
| `refresh` | POST | Exchange refresh token for new access token |
| `logout` | POST | Invalidate refresh token |
| `getProfile` | GET | Get current authenticated user's profile |
| `changePassword` | POST | Update password (requires current password) |

**Validation Rules:**
- Email: valid format, normalized
- Password: min 8 chars, must have uppercase + lowercase + number
- Name: 2-100 chars
- Role: only student or faculty (no self-registration as admin)

**Token Strategy:**
- Access token: 15 minutes expiry — used for API authentication
- Refresh token: 7 days expiry — stored server-side in user's refreshTokens array
- On login/register: Both tokens issued
- On refresh: Only new access token issued
- On logout: Specific refresh token removed from array
- On password change: ALL refresh tokens cleared (force re-login on all devices)

#### `activityController.ts` (~850 lines) — Activities & Enrollment

| Function | Method | Purpose |
|----------|--------|---------|
| `createActivity` | POST | Create new activity (faculty/admin) |
| `getActivities` | GET | List activities with filters & pagination |
| `getActivityById` | GET | Get single activity detail |
| `updateActivity` | PUT | Edit activity (creator or admin) |
| `deleteActivity` | DELETE | Remove activity (creator or admin, no active enrollments) |
| `enrollInActivity` | POST | Atomic enrollment with transaction |
| `cancelEnrollment` | POST | Cancel enrollment and restore slot |
| `getMyEnrollments` | GET | Student's enrollment list |
| `getActivityParticipants` | GET | Participant list for an activity (faculty/admin) |

**Key Business Rules:**
- Students can only see published activities
- Faculty can only edit/delete their own activities
- Admin can edit/delete ANY activity
- Enrollment only for published activities with future start dates
- Capacity tracking: availableSlots atomically decremented
- Delete blocked if activity has active (enrolled) participants

**Enrollment — Atomic Transaction (see Section 11 for details):**
Uses MongoDB session with 6 steps: lock activity → check duplicate → atomic decrement → create participation → commit → send email

#### `dashboardController.ts` (~650 lines) — Dashboards & Analytics

| Function | Method | Purpose |
|----------|--------|---------|
| `getFacultyDashboard` | GET | Faculty-specific stats & recent data |
| `getStudentDashboard` | GET | Student enrollment stats & recommendations |
| `getAdminDashboard` | GET | System-wide overview |
| `exportParticipants` | GET | CSV download of activity participants |
| `getActivityAnalytics` | GET | Detailed analytics for one activity |
| `getAllUsers` | GET | Paginated user list with search/filter (admin) |
| `getAllActivitiesAdmin` | GET | Paginated activity list across all faculty (admin) |

**Faculty Dashboard Returns:**
- Activity counts (published, draft, completed)
- Total enrollments and unique participants
- Recent enrollments (last 10)
- Upcoming activities (next 5)

**Student Dashboard Returns:**
- Enrollment counts (enrolled, waitlisted, cancelled, completed)
- Upcoming enrolled activities
- Available activities count
- Recommended activities (same department, max 5)

**Admin Dashboard Returns:**
- User counts (total, students, faculty)
- Activity counts (total, published)
- Total enrollments
- Department-wise & category-wise breakdowns (aggregation pipelines)
- Recent users and recent activities (last 10 each)

**Admin User Management (getAllUsers):**
- Filters: role, search (name/email/department)
- Pagination: page, limit
- Excludes: password, refreshTokens
- Sorted by createdAt descending

**Admin Activity Management (getAllActivitiesAdmin):**
- Filters: status, category, department, faculty (creator ID), search (title/description/location)
- Pagination: page, limit
- Enriched: enrollment count per activity
- Includes: faculty dropdown list for filter UI

**CSV Export:**
- Generates downloadable CSV with: Name, Email, Department, Roll Number, Enrolled At, Status
- Headers: Content-Type text/csv, Content-Disposition attachment

**Activity Analytics:**
- Occupancy rate percentage
- Enrollment breakdown by status (enrolled/waitlisted/cancelled)
- Department-wise participant distribution
- Daily enrollment timeline

---

### 6.5 Routes (API Endpoints)

#### Auth Routes (`/api/auth/*`) — 6 endpoints
| Method | Path | Auth | Validation | Handler |
|--------|------|------|-----------|---------|
| POST | /register | No | registerValidation | register |
| POST | /login | No | loginValidation | login |
| POST | /refresh | No | — | refresh |
| POST | /logout | Yes | — | logout |
| GET | /profile | Yes | — | getProfile |
| POST | /change-password | Yes | — | changePassword |

#### Activity Routes (`/api/activities/*`) — 9 endpoints
| Method | Path | Auth | Roles | Middleware | Handler |
|--------|------|------|-------|-----------|---------|
| POST | / | Yes | faculty, admin | createValidation | createActivity |
| GET | / | Optional | any | searchValidation | getActivities |
| GET | /my/enrollments | Yes | student | — | getMyEnrollments |
| GET | /:id | Optional | any | — | getActivityById |
| PUT | /:id | Yes | faculty, admin | updateValidation | updateActivity |
| DELETE | /:id | Yes | faculty, admin | — | deleteActivity |
| POST | /:id/enroll | Yes | student | enrollRateLimiter | enrollInActivity |
| POST | /:id/cancel | Yes | student | — | cancelEnrollment |
| GET | /:id/participants | Yes | faculty, admin | — | getActivityParticipants |

**Note:** Enrollment endpoint has its own rate limiter: 10 requests per 60 seconds

#### Dashboard Routes (`/api/dashboard/*`) — 7 endpoints
| Method | Path | Auth | Roles | Handler |
|--------|------|------|-------|---------|
| GET | /faculty | Yes | faculty, admin | getFacultyDashboard |
| GET | /student | Yes | student | getStudentDashboard |
| GET | /admin | Yes | admin | getAdminDashboard |
| GET | /export/:id | Yes | faculty, admin | exportParticipants |
| GET | /analytics/:id | Yes | faculty, admin | getActivityAnalytics |
| GET | /admin/users | Yes | admin | getAllUsers |
| GET | /admin/activities | Yes | admin | getAllActivitiesAdmin |

**Total: 22 API Endpoints**

---

### 6.6 Utilities

#### `email.ts` (127 lines) — Email Templates
- `sendEmail(options)` — Base email sender (currently logs to console; SendGrid integration prepared)
- `sendEnrollmentConfirmation(email, userName, activityTitle, date, location)` — HTML email with styled template, gradient header, enrollment details, "View My Activities" button
- `sendWaitlistNotification(email, userName, activityTitle)` — Waitlist notification template (prepared for future use)

#### `logger.ts` (45 lines) — Winston Logger
- **Log levels:** error (0), warn (1), info (2), http (3), debug (4)
- **Transports:** Console (colored), File (logs/error.log — errors only), File (logs/all.log — all levels)
- **Format:** `YYYY-MM-DD HH:mm:ss:ms LEVEL message`
- **Level selection:** debug in development, info in production

---

### 6.7 Scripts

#### `seed.ts` (~600 lines) — Database Seeder
Creates a complete test dataset:
- **1 Admin:** admin@eventmanagement.edu / Admin@123
- **8 Faculty** across departments (CS, Electronics, Mechanical, Physics, Math, Civil)
- **12 Students** with realistic names and roll numbers
- **25 Activities** across categories: Technical (5), Seminars (5), Cultural (3), Sports (3), Competitions (5), Academic (1), Social (2), Other (1)
- **20 Sample Enrollments** linking students to activities

#### `checkUser.ts` (29 lines) — User Verification
Fetches a user by email and verifies password hashing is working correctly (bcrypt format check)

#### `fixIndexes.ts` (21 lines) — Index Repair
Drops and recreates all User collection indexes to fix corruption issues

---

### 6.8 Tests

#### `setup.ts` (23 lines) — Test Environment
- Creates MongoDB Memory Server with replica set support (required for transactions)
- Clears all collections between tests
- Disconnects and stops server after all tests

#### `auth.test.ts` (111 lines) — Authentication Tests
**8 test cases:**
- Register with valid data → 201 + tokens
- Duplicate email → 409
- Weak password → 400
- Login with correct credentials → 200 + tokens
- Login with wrong password → 401
- Login with non-existent email → 401
- Get profile with valid token → 200 + user data (no password)
- Get profile without token → 401

#### `enrollment.test.ts` (195 lines) — Enrollment Race Condition Tests
**4 test cases:**
- Single enrollment → success, slots decremented
- Duplicate enrollment attempt → 409 (unique index prevents it)
- Enrollment to full activity → 400 ("full")
- **Concurrent enrollment test:** 2 students enroll simultaneously for 1 slot → exactly 1 succeeds, 1 fails, availableSlots = 0

#### `participants-access.test.ts` (98 lines) — Access Control Tests
- Both the activity creator AND other faculty can view participant details
- Admin can view any activity's participants

---

## 7. Frontend — Complete Breakdown

### 7.1 Configuration & Setup

#### `package.json` (60 lines)
- 18 production dependencies, 20+ dev dependencies
- Scripts: dev (vite), build (tsc + vite build), preview, lint, test (vitest), typecheck

#### `vite.config.ts` (18 lines)
- React plugin for Fast Refresh
- Path alias: `@` → `./src`
- Dev server: port 5173
- API proxy: `/api` → `http://localhost:3000` (no CORS issues in dev)
- Build: dist output, source maps enabled

#### `tsconfig.json` (24 lines)
- Target ES2020, module ESNext (bundler mode)
- Strict mode, react-jsx transform
- Path alias: `@/*` → `./src/*`

#### `tailwind.config.js` (~80 lines)
Custom design system:
- **Colors:** primary (Indigo), secondary (Cyan), accent (Fuchsia)
- **Fonts:** DM Sans (body), Space Grotesk (display), JetBrains Mono (code)
- **Shadows:** soft, medium, hard, glow, glow-lg, glow-cyan, elevated
- **Animations:** fade-in, fade-in-up, scale-in, slide-in-right, pulse-soft, float, shimmer
- **Dark mode:** class-based switching

#### `index.html` (16 lines)
- Title: "EventHub — Campus Event Platform"
- Meta: description, theme-color (#4f46e5)
- Root div + main.tsx module script

#### `main.tsx` (26 lines)
- React 18 createRoot
- StrictMode wrapper
- QueryClient with: refetchOnWindowFocus, retry: 1, staleTime: 60 seconds
- QueryClientProvider wraps App

---

### 7.2 State Management (Zustand Stores)

#### `authStore.ts` (170 lines) — Authentication State

**State:**
| Property | Type | Purpose |
|----------|------|---------|
| user | User \| null | Current logged-in user |
| accessToken | string \| null | JWT access token |
| refreshToken | string \| null | JWT refresh token |
| isAuthenticated | boolean | Auth status flag |
| isLoading | boolean | Loading state for auth operations |
| isInitialized | boolean | Hydration complete flag |

**Actions:**
| Method | Purpose |
|--------|---------|
| `login(email, password)` | POST /auth/login, store tokens + user, toast "Welcome back!" |
| `register(data)` | POST /auth/register, store tokens + user, toast "Welcome to Event Hub!" |
| `logout()` | POST /auth/logout, clear all auth state |
| `refreshAccessToken()` | POST /auth/refresh with refreshToken, get new accessToken |
| `initialize()` | Mark store as initialized (for hydration check) |
| `getRedirectPath()` | Return role-based dashboard URL |

**Persistence:** Zustand persist middleware → localStorage key `auth-storage` (stores user, tokens, isAuthenticated)

**Role-Based Redirects:**
- admin → /admin/dashboard
- faculty → /faculty/dashboard
- student → /dashboard

#### `themeStore.ts` (22 lines) — Theme State
- `theme`: 'light' | 'dark' (default: light)
- `toggleTheme()`: Switches between light and dark
- Persisted in localStorage key `theme-storage`

---

### 7.3 Services (API Layer)

#### `api.ts` (140 lines) — Axios Instance & Interceptors
- **Base URL:** VITE_API_URL or `/api` fallback
- **Timeout:** 30 seconds
- **Request interceptor:** Reads accessToken from auth-storage in localStorage, adds `Authorization: Bearer <token>` header
- **Response interceptor (Token Refresh):**
  - On 401 error (not already retried, not auth endpoint):
    1. Queue all failed requests
    2. Call POST /auth/refresh with refresh token
    3. Update accessToken in localStorage
    4. Retry all queued requests with new token
    5. If refresh fails: clear storage, redirect to /login
  - Prevents infinite loops with `_retry` flag
  - Handles concurrent 401s with request queue

#### `authService.ts` (58 lines) — Auth API
- `register(data)` → POST /auth/register
- `login(credentials)` → POST /auth/login
- `refresh(refreshToken)` → POST /auth/refresh
- `logout(refreshToken)` → POST /auth/logout
- `getProfile()` → GET /auth/profile
- `changePassword(currentPassword, newPassword)` → POST /auth/change-password

#### `activityService.ts` (137 lines) — Activity API
- `createActivity(data)` → POST /activities
- `getActivities(filters?)` → GET /activities?params
- `getActivity(id)` → GET /activities/:id (returns {activity, isEnrolled})
- `getActivityById(id)` → GET /activities/:id (returns Activity only)
- `updateActivity(id, data)` → PUT /activities/:id
- `deleteActivity(id)` → DELETE /activities/:id
- `enrollActivity(id)` → POST /activities/:id/enroll
- `cancelEnrollment(id)` → POST /activities/:id/cancel
- `getParticipants(id)` → GET /dashboard/export/:id
- `exportParticipants(id)` → GET /dashboard/export/:id (blob)
- `getActivityParticipants(id, status?, page?, limit?)` → GET /activities/:id/participants

#### `dashboardService.ts` (95 lines) — Dashboard API
- `getStudentStats()` → GET /dashboard/student
- `getFacultyStats()` → GET /dashboard/faculty
- `getAdminStats()` → GET /dashboard/admin
- `getMyActivities()` → GET /activities/my/enrollments
- `getAdminUsers(filters?)` → GET /dashboard/admin/users?params
- `getAdminActivities(filters?)` → GET /dashboard/admin/activities?params

---

### 7.4 Reusable Components

#### Common Components (7 files)

| Component | Props | Key Features |
|-----------|-------|-------------|
| **Button** | variant (primary/secondary/outline/ghost/danger), size (sm/md/lg), isLoading, leftIcon, rightIcon | Framer Motion whileHover/whileTap, loading spinner SVG, forwardRef |
| **Card** | hover, glass, className | motion hover (scale 1.02, y: -4), card or glass-panel CSS class |
| **Input** | label, error, helperText, leftIcon, rightIcon | Password visibility toggle (eye icon), red error state, forwardRef |
| **Badge** | variant (primary/secondary/success/warning/danger/info), size (sm/md/lg) | Rounded-full, color-coded backgrounds |
| **Modal** | isOpen, onClose, title, size (sm/md/lg/xl/full), showCloseButton | Headless UI Dialog + Transition, Framer Motion, backdrop blur, 5 sizes |
| **Skeleton** | variant (text/circular/rectangular), width, height, lines | Shimmer animation with gradient, multiple line support |

#### UI Components (2 files)
| Component | Props | Key Features |
|-----------|-------|-------------|
| **Select** | label, error, options (array or children) | Dropdown with styled borders, error state, forwardRef |
| **TextArea** | label, error | Multi-line input with resize-vertical, error state, forwardRef |

#### Activity Components (2 files)
| Component | Props | Key Features |
|-----------|-------|-------------|
| **ActivityCard** | activity (Activity object) | Image with gradient overlay, category/status badges, availability progress bar (animated, color-coded: red <20%, green/blue otherwise), organizer info, link to detail page |
| **ParticipantsList** | activityId, activityTitle | Full table with avatars, status filter (enrolled/waitlisted/cancelled), pagination (page numbers), enrolled/available stats header, skeleton loading, error handling |

---

### 7.5 Layout Components

#### `Layout.tsx` (46 lines)
- Navbar at top
- `<Outlet />` for route content (React Router)
- Footer with logo SVG, links (Browse Events, Create Account), copyright year

#### `Navbar.tsx` (~350 lines)
- **Logo:** SVG gradient calendar icon + "EventHub" text
- **Desktop navigation:** Links with active indicator animation (motion.div layoutId spring animation)
- **Theme toggle:** Sun/Moon icons
- **Auth section:** Profile avatar with initial + name, logout button
- **Mobile menu:** AnimatePresence hamburger/X toggle, slide-in menu
- **Role-based navigation:**
  - **Always:** Events
  - **Student:** Dashboard, My Activities
  - **Faculty:** Dashboard, My Events, Create Event
  - **Admin:** Dashboard, Activities, Users, Create Event
  - **Unauthenticated:** Sign In, Get Started buttons

---

### 7.6 Pages — All 17 Pages

#### Public Pages

| # | Page | Lines | Route | Purpose |
|---|------|-------|-------|---------|
| 1 | **HomePage** | 470 | `/` | Landing page with hero section, "How It Works" 3-step guide, features grid (6 cards), upcoming events preview (fetches 4 published activities), CTA banner. Trust indicators, animated sections with whileInView |
| 2 | **LoginPage** | 119 | `/login` | Email + password form, branded card with logo, error handling, role-based redirect after login (admin→/admin/dashboard, faculty→/faculty/dashboard, student→/dashboard) |
| 3 | **RegisterPage** | 237 | `/register` | 7-field form: role selection toggle (Student/Faculty), full name, email, password, confirm password, department, conditional roll number (students only). Password strength validation (8+ chars, upper, lower, number) |
| 4 | **ActivitiesPage** | 190 | `/activities` | Browse all published activities. Search with 500ms debounce, collapsible filter panel (date range, 10 categories), 3-column grid of ActivityCards, smart pagination with page numbers |
| 5 | **ActivityDetailPage** | 288 | `/activities/:id` | Full activity view: hero poster image with badges, description card, organizer card (avatar + name + email), sidebar with quick info (date, time, location, capacity), animated availability bar, enrollment modal with confirmation, success alert. Students can enroll; faculty/admin see read-only; guests see login prompt |

#### Student Pages

| # | Page | Lines | Route | Access | Purpose |
|---|------|-------|-------|--------|---------|
| 6 | **StudentDashboard** | 189 | `/dashboard` | student | 4 stat cards (enrolled, upcoming, completed, available), recent enrolled activities (3), discover new events (3 published), view all links |
| 7 | **MyActivitiesPage** | 215 | `/my-activities` | student | Full list of enrolled activities with poster thumbnails, status badges (enrolled/waitlisted/cancelled), date/time/location details, summary stats (4 counters), view details links |

#### Faculty Pages

| # | Page | Lines | Route | Access | Purpose |
|---|------|-------|-------|--------|---------|
| 8 | **FacultyDashboard** | 176 | `/faculty/dashboard` | faculty, admin | 4 stat cards (total, published, participants, enrollments), 3 quick action cards (create/view all/reports), own activities grid (6 items) |
| 9 | **FacultyActivitiesPage** | 176 | `/faculty/my-activities` | faculty, admin | List of own activities with image thumbnails, status badges, metadata (date, location, slots, category), edit/delete buttons, delete confirmation modal |
| 10 | **CreateActivityPage** | 262 | `/create-activity` | faculty, admin | 11-field form: title, description (textarea), category (9 options select), department, start/end datetime, location, capacity (number), poster image URL, status (draft/published). Submit validation + toast |
| 11 | **EditActivityPage** | 214 | `/edit-activity/:id` | faculty, admin | Same form as create but pre-filled with existing data. Status has 4 options (draft/published/cancelled/completed). Date conversion for datetime-local inputs. Redirects to /faculty/my-activities |

#### Admin Pages

| # | Page | Lines | Route | Access | Purpose |
|---|------|-------|-------|--------|---------|
| 12 | **AdminDashboard** | 292 | `/admin/dashboard` | admin | Clickable stat cards linking to detail pages, quick action buttons (All Activities, All Users, Create), department breakdown with bar chart, category distribution grid, recent users list (8, with "View all" link), recent activities list (8, with "View all" link) |
| 13 | **AdminActivitiesPage** | 349 | `/admin/activities` | admin | Data table of ALL activities across ALL faculty. Search bar, 5 filter dropdowns (status, category, department, faculty from API, clear all). 7-column table: Activity (image+title), Faculty name, Category badge, Date, Enrollment progress bar, Status badge, Actions (4 icons: view, participants, edit, delete). Participants modal with ParticipantsList component. Delete confirmation modal. Pagination |
| 14 | **AdminUsersPage** | 209 | `/admin/users` | admin | Data table of ALL users. Search (name/email/department), role filter dropdown. 5-column table: User (avatar+name+rollNumber), Email, Department, Role (color-coded badge), Joined date. Pagination (20 per page) |

#### Utility Pages

| # | Page | Lines | Route | Purpose |
|---|------|-------|-------|---------|
| 15 | **ProfilePage** | 261 | `/profile` | Profile hero card (banner + avatar + name + role badge), account info grid (email, role, department, rollNumber), security section with collapsible password change form (current + new + confirm, validation) |
| 16 | **NotFoundPage** | 18 | `/*` | Large "404" gradient text, "Page Not Found" message, "Back to Home" link |
| 17 | **UnauthorizedPage** | 50 | `/unauthorized` | Animated ShieldExclamation icon, "Access Denied" heading, "Go Back" + "Home" buttons |

---

### 7.7 Styling System

#### Global CSS (`index.css` — 250+ lines)

**Fonts (Google Fonts):**
- DM Sans (300-800) — body text
- Space Grotesk (400-700) — display/headings
- JetBrains Mono (400-600) — monospace/code

**CSS Component Classes:**
| Class | Purpose |
|-------|---------|
| `.glass-panel` | Backdrop-blur-xl, white/80 bg, subtle border, shadow-soft |
| `.card` | White bg, rounded-2xl, p-6, shadow-soft, border |
| `.card-hover` | + cursor-pointer, hover:shadow-elevated, border transition |
| `.btn` | Base button (rounded-xl, font-semibold, focus-ring, disabled state) |
| `.btn-primary` | Primary-600 bg, hover:primary-700, shadow, hover:-translate-y-0.5 |
| `.btn-secondary` | Gray-100 bg, hover:gray-200 |
| `.btn-outline` | Bordered primary-600, hover:primary-50 bg |
| `.input` | Full-width, rounded-xl, border-2, focus:primary-500 ring |
| `.input-error` | Red-500 border/focus/ring |
| `.badge` | Inline-flex, rounded-full, font-medium |
| `.badge-primary/success/warning/danger` | Color-coded badge variants |
| `.skeleton` | Animate-pulse, gray gradient bg |
| `.gradient-text` | Primary-600 to secondary-500 clip-text |
| `.scrollbar-thin` | Custom thin scrollbar with 6px width |

**Dark Mode:** Every class has `dark:` variant, controlled by class on `<html>`

**Selection Styling:** Primary-500/20 bg, primary-900 text

---

## 8. Authentication & Authorization System

### Token Flow

```
REGISTRATION / LOGIN:
  Client → POST /auth/register or /auth/login
  Server → Validates credentials → Generates access + refresh tokens
  Server → Stores refresh token in user.refreshTokens array
  Server → Returns { user, accessToken, refreshToken }
  Client → Stores in Zustand (persisted to localStorage)

AUTHENTICATED REQUEST:
  Client → Axios interceptor reads token from localStorage
  Client → Adds "Authorization: Bearer <accessToken>" header
  Server → auth.ts authenticate middleware verifies JWT
  Server → Checks user still exists in database
  Server → Sets req.user = { userId, email, role }
  Server → Passes to authorize(...roles) middleware (if applicable)

TOKEN REFRESH:
  Client → Gets 401 response on any request
  Client → Axios interceptor queues all failed requests
  Client → POST /auth/refresh with refreshToken
  Server → Verifies refresh token against user.refreshTokens
  Server → Returns new accessToken
  Client → Updates localStorage
  Client → Retries all queued requests with new token

LOGOUT:
  Client → POST /auth/logout with refreshToken
  Server → Removes specific refresh token from user.refreshTokens array
  Client → Clears all auth state from Zustand/localStorage

PASSWORD CHANGE:
  Server → Clears ALL refresh tokens from user (force re-login on all devices)
```

---

## 9. Role-Based Access Control (RBAC)

### Three Roles

| Role | Permissions |
|------|------------|
| **student** | Browse published activities, enroll/cancel enrollment, view own enrollments, view profile, student dashboard |
| **faculty** | All student permissions + create activities, edit/delete own activities, view participants & analytics, export CSV, faculty dashboard |
| **admin** | All faculty permissions + edit/delete ANY activity, view all users, admin dashboard, system-wide analytics, admin activities management, admin users management |

### Permission Matrix

| Feature | Student | Faculty | Admin |
|---------|---------|---------|-------|
| Browse published activities | ✅ | ✅ | ✅ |
| View activity detail | ✅ Published only | ✅ All | ✅ All |
| Enroll in activity | ✅ | ❌ | ❌ |
| Cancel enrollment | ✅ | ❌ | ❌ |
| Create activity | ❌ | ✅ | ✅ |
| Edit own activity | ❌ | ✅ | ✅ |
| Edit ANY activity | ❌ | ❌ | ✅ |
| Delete own activity | ❌ | ✅ | ✅ |
| Delete ANY activity | ❌ | ❌ | ✅ |
| View participants | ❌ | ✅ All activities | ✅ All activities |
| Export participants CSV | ❌ | ✅ Own activities | ✅ Any activity |
| Activity analytics | ❌ | ✅ Own activities | ✅ Any activity |
| Student dashboard | ✅ | ❌ | ❌ |
| Faculty dashboard | ❌ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Manage all activities | ❌ | ❌ | ✅ |
| Change own password | ✅ | ✅ | ✅ |
| Register as admin | ❌ | ❌ | ❌ (no self-registration) |

---

## 10. Complete API Reference

### Authentication (`/api/auth`)
| # | Method | Endpoint | Auth | Body/Params | Response |
|---|--------|----------|------|-------------|----------|
| 1 | POST | /register | No | email, password, name, role, department?, rollNumber? | 201: user + tokens |
| 2 | POST | /login | No | email, password | 200: user + tokens |
| 3 | POST | /refresh | No | refreshToken | 200: accessToken |
| 4 | POST | /logout | Yes | refreshToken | 200: success |
| 5 | GET | /profile | Yes | — | 200: user object |
| 6 | POST | /change-password | Yes | currentPassword, newPassword | 200: success |

### Activities (`/api/activities`)
| # | Method | Endpoint | Auth | Roles | Body/Params | Response |
|---|--------|----------|------|-------|-------------|----------|
| 7 | POST | / | Yes | faculty, admin | title, description, dates, location, capacity, department, category, posterImage?, status | 201: activity |
| 8 | GET | / | Optional | any | ?search, ?category, ?department, ?status, ?startDate, ?endDate, ?page, ?limit | 200: { data, pagination } |
| 9 | GET | /my/enrollments | Yes | student | ?status | 200: enrollments array |
| 10 | GET | /:id | Optional | any | — | 200: { activity, isEnrolled } |
| 11 | PUT | /:id | Yes | faculty, admin | (partial activity fields) | 200: updated activity |
| 12 | DELETE | /:id | Yes | faculty, admin | — | 200: success |
| 13 | POST | /:id/enroll | Yes | student | — | 200: participation + remaining slots |
| 14 | POST | /:id/cancel | Yes | student | — | 200: success |
| 15 | GET | /:id/participants | Yes | faculty, admin | ?status, ?page, ?limit | 200: { activity, participants, pagination } |

### Dashboard (`/api/dashboard`)
| # | Method | Endpoint | Auth | Roles | Params | Response |
|---|--------|----------|------|-------|--------|----------|
| 16 | GET | /faculty | Yes | faculty, admin | — | 200: stats + activities + enrollments |
| 17 | GET | /student | Yes | student | — | 200: stats + enrolled + upcoming + recommended |
| 18 | GET | /admin | Yes | admin | — | 200: stats + dept/category breakdown + recent |
| 19 | GET | /export/:id | Yes | faculty, admin | — | CSV file download |
| 20 | GET | /analytics/:id | Yes | faculty, admin | — | 200: analytics data |
| 21 | GET | /admin/users | Yes | admin | ?role, ?search, ?page, ?limit | 200: { users, pagination } |
| 22 | GET | /admin/activities | Yes | admin | ?status, ?category, ?department, ?faculty, ?search, ?page, ?limit | 200: { activities, facultyList, pagination } |

### Other
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | / | API information |
| GET | /health | Health check (status, uptime, environment) |
| GET | /api-docs | Swagger UI documentation |

---

## 11. Critical Feature: Atomic Enrollment

The enrollment system uses a **6-step MongoDB transaction** to prevent race conditions when multiple students try to enroll in limited-capacity events simultaneously:

```
STEP 1: Start MongoDB Session & Transaction
  → db.startSession() and session.startTransaction()

STEP 2: Lock the Activity Document
  → Activity.findById(id).session(session)
  → Verify: status is 'published'
  → Verify: startDate is in the future

STEP 3: Duplicate Check
  → Participation.findOne({ activityId, userId }).session(session)
  → If found: abort transaction, return 409

STEP 4: Atomic Slot Decrement (THE CRITICAL STEP)
  → Activity.updateOne(
      { _id: activityId, availableSlots: { $gt: 0 } },
      { $inc: { availableSlots: -1 } }
    ).session(session)
  → If modifiedCount === 0: slots were taken by another concurrent request → abort → return 400 "full"

STEP 5: Create Participation Record
  → Participation.create([{ activityId, userId, status: 'enrolled' }], { session })
  → Protected by unique compound index {activityId, userId}

STEP 6: Commit Transaction
  → session.commitTransaction()
  → If any step failed: automatic rollback

POST-COMMIT: Send enrollment confirmation email (async, non-blocking)
```

### Triple-Layer Duplicate Protection:
1. **Application layer:** Check existing participation before enrollment
2. **Database layer:** Unique compound index on {activityId, userId} → 11000 error
3. **Transaction layer:** All operations atomic → rollback on any failure

### Tested Scenarios:
- Single enrollment → success
- Duplicate enrollment → 409
- Full activity enrollment → 400
- **Concurrent enrollment** (2 students, 1 slot) → exactly 1 succeeds, 1 fails

---

## 12. Security Measures

### 1. Authentication Security
- JWT access tokens (15-minute expiry)
- Refresh tokens stored server-side (7-day expiry)
- Password hashing: bcrypt with 12 rounds
- Password policy: min 8 chars + uppercase + lowercase + number
- Token invalidation on logout and password change
- `select: false` on password field (never returned unless explicitly requested)

### 2. Input Validation & Sanitization
- express-validator on all endpoints (type checks, length limits, format validation)
- Mongoose schema validation (enum, min/max, regex)
- express-mongo-sanitize (prevents NoSQL injection: strips `$` and `.` from input)
- ObjectId format validation on all ID parameters
- Field whitelisting on updates (prevents mass assignment)

### 3. HTTP Security
- Helmet middleware (Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, etc.)
- CORS with origin whitelist (only frontend URL allowed)
- Response compression (gzip)
- ETag disabled (prevents caching-related attacks)

### 4. Rate Limiting
- Global: 100 requests per 60 seconds per IP
- Enrollment: 10 requests per 60 seconds per IP
- Trust proxy enabled for reverse proxy environments

### 5. Database Security
- Atomic transactions for state-changing operations
- Unique compound indexes for data integrity
- Sparse indexes for optional unique fields
- No raw query exposure (Mongoose models only)

### 6. Error Handling
- Global error handler catches all unhandled errors
- Stack traces only shown in development environment
- Generic messages in production (no information leakage)
- Specific error codes: 400, 401, 403, 404, 409, 500

### 7. DPDP 2023 Compliance (Indian Privacy Law)
- Minimal data collection (no sensitive personal data)
- Data retention: 2 years for active accounts
- User rights: access, correction, erasure, portability
- No third-party data sharing
- Essential cookies only (auth token, theme preference)
- 72-hour breach notification protocol

---

## 13. User Interface & Design System

### Color Palette
| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| primary | Indigo | #4f46e5 (600) | Buttons, links, accents, active states |
| secondary | Cyan | #06b6d4 (500) | Gradients, secondary accents |
| accent | Fuchsia | #d946ef (500) | Highlights |

### Typography
| Font | Family | Usage |
|------|--------|-------|
| DM Sans | Sans-serif | Body text, UI labels, descriptions |
| Space Grotesk | Sans-serif | Headings, display text, titles |
| JetBrains Mono | Monospace | Roll numbers, code, technical data |

### Component Design Patterns
| Pattern | Implementation |
|---------|---------------|
| **Glass morphism** | Backdrop-blur-xl + translucent white bg + subtle border |
| **Gradient accents** | Primary-to-secondary gradients on icons, buttons, badges |
| **Hover animations** | Framer Motion scale (1.02) + Y shift (-2 to -4px) |
| **Active indicators** | layoutId spring animation on nav items |
| **Status colors** | Green=published/enrolled, Yellow=draft/waitlisted, Blue=completed, Red=cancelled |
| **Rounded corners** | xl (buttons), 2xl (cards), full (badges, avatars) |
| **Shadows** | soft (default), elevated (hover), glow (special) |
| **Loading states** | Shimmer skeleton with gradient animation |
| **Dark mode** | Full support via Tailwind dark: modifier on every element |

### Responsive Breakpoints
| Screen | Width | Grid Behavior |
|--------|-------|--------------|
| Mobile | < 768px | Single column, stacked layouts, hamburger menu |
| Tablet | 768px+ | 2-column grids, expanded filter panels |
| Desktop | 1024px+ | 3-4 column grids, sidebar layouts, full navigation |

---

## 14. Route Map — All Frontend URLs

```
PUBLIC ROUTES (No authentication required):
  /                        → HomePage (landing page)
  /login                   → LoginPage
  /register                → RegisterPage
  /activities              → ActivitiesPage (browse all)
  /activities/:id          → ActivityDetailPage
  /unauthorized            → UnauthorizedPage
  /*                       → NotFoundPage (404)

AUTHENTICATED ROUTES (Any logged-in user):
  /profile                 → ProfilePage

STUDENT ROUTES (role: student):
  /dashboard               → StudentDashboard
  /my-activities            → MyActivitiesPage

FACULTY ROUTES (role: faculty or admin):
  /faculty/dashboard        → FacultyDashboard
  /faculty/my-activities    → FacultyActivitiesPage
  /create-activity          → CreateActivityPage
  /edit-activity/:id        → EditActivityPage

ADMIN ROUTES (role: admin only):
  /admin/dashboard          → AdminDashboard
  /admin/activities         → AdminActivitiesPage
  /admin/users              → AdminUsersPage

TOTAL: 16 routes (5 public + 1 auth + 2 student + 4 faculty + 3 admin + 1 catch-all)
```

---

## 15. Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | No | development | Environment mode |
| PORT | No | 3000 | Server port |
| MONGODB_URI | Yes (prod) | mongodb://localhost:27017/event-management | MongoDB connection string |
| JWT_SECRET | Yes (prod) | — | JWT signing secret (min 32 chars in production) |
| JWT_EXPIRES_IN | No | 15m | Access token expiry |
| JWT_REFRESH_SECRET | Yes (prod) | — | Refresh token signing secret |
| JWT_REFRESH_EXPIRES_IN | No | 7d | Refresh token expiry |
| BCRYPT_ROUNDS | No | 12 | Password hashing rounds |
| RATE_LIMIT_WINDOW_MS | No | 60000 | Rate limit window (ms) |
| RATE_LIMIT_MAX_REQUESTS | No | 100 | Max requests per window |
| RATE_LIMIT_ENROLL_MAX | No | 10 | Max enrollment attempts per window |
| DATA_RETENTION_DAYS | No | 730 | Data retention period in days |
| FRONTEND_URL | No | http://localhost:5173 | Allowed CORS origin |
| SENTRY_DSN | No | — | Sentry error tracking DSN |
| SENDGRID_API_KEY | No | — | SendGrid API key for emails |
| SENDGRID_FROM_EMAIL | No | — | Sender email address |

### Frontend (`frontend/.env`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| VITE_API_URL | Yes | http://localhost:3000/api | Backend API base URL |
| VITE_APP_NAME | No | EventHub | Application name |
| VITE_ENABLE_DARK_MODE | No | true | Enable dark mode toggle |

---

## 16. How to Run the Project

### Prerequisites
- Node.js ≥ 18
- npm (bundled with Node.js)
- MongoDB Atlas account (connection string in .env) OR local MongoDB

### One-Command Start (Mac/Linux)
```bash
chmod +x start.sh
./start.sh
```
The script automatically:
1. Checks Node.js version (≥ 18)
2. Verifies backend/.env exists
3. Creates frontend/.env if missing
4. Installs all dependencies
5. Starts both backend and frontend
6. Provides URLs
7. Handles graceful shutdown on Ctrl+C

### Manual Start (Any OS)

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access URLs
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api-docs |
| Health Check | http://localhost:3000/health |

### Seed Test Data
```bash
cd backend
npm run seed
```

---

## 17. Seed Data (Test Users & Activities)

### Test User Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@eventmanagement.edu | Admin@123 |
| **Faculty** | john.doe@college.edu | Faculty@123 |
| **Faculty** | jane.smith@college.edu | Faculty@123 |
| **Faculty** | robert.wilson@college.edu | Faculty@123 |
| **Faculty** | alice.johnson@college.edu | Faculty@123 |
| **Faculty** | michael.brown@college.edu | Faculty@123 |
| **Faculty** | emily.davis@college.edu | Faculty@123 |
| **Faculty** | david.martinez@college.edu | Faculty@123 |
| **Faculty** | sarah.taylor@college.edu | Faculty@123 |
| **Student** | student1@college.edu | Student@123 |
| **Student** | student2@college.edu | Student@123 |
| **Student** | student3@college.edu | Student@123 |
| ... (12 students total) | ... | Student@123 |

### Test Activities (25 total)
- **Technical (5):** AI/ML Workshop, Web Dev Bootcamp, Cloud Computing Summit, Cybersecurity Workshop, Python Coding Marathon
- **Seminars (5):** IoT Seminar, Career Counseling, Entrepreneurship Summit, Quantum Computing Lecture, Research Paper Writing
- **Cultural (3):** Dance Night, Dance Workshop, Photography Festival
- **Sports (3):** Cricket Tournament, Basketball Championship, Marathon
- **Competitions (5):** CAD Design, RoboWars, National Coding Competition, Bridge Building Challenge
- **Academic (1):** Academic Excellence Awards
- **Social (2):** Blood Donation Camp, Clean-up Drive
- **Other (1):** Yoga & Meditation Retreat

---

## 18. Testing

### Backend Tests
```bash
cd backend
npm test
```

**Test framework:** Jest + Supertest
**Test database:** MongoDB Memory Server (in-memory, with replica set for transactions)

**Test Suites (3):**
1. **Authentication (8 tests):** Register (3), Login (3), Profile (2)
2. **Enrollment Race Conditions (4 tests):** Atomic decrement, duplicate prevention, full activity, concurrent enrollment
3. **Participants Access (1 test):** Multi-role access verification

**Total: 13 test cases**

Each test runs in isolation (collections cleared between tests).

### Frontend Tests
```bash
cd frontend
npm test
```
Framework: Vitest (configured, no test files currently written)

---

## 19. Documentation Files

| File | Lines | Content |
|------|-------|---------|
| **README.md** | 162 | Project overview, tech stack, setup guide, API table, troubleshooting |
| **LICENSE** | 20 | MIT License, Copyright 2026 |
| **docs/Architecture.md** | 327 | 7-layer architecture, ER diagram, data flow, race condition handling, scalability, deployment options |
| **docs/Privacy.md** | 206 | DPDP 2023 compliance, data collection/storage/retention, user rights, security measures, cookie policy, breach protocol |
| **start.sh** | 92 | One-click startup script for Mac/Linux |

---

## 20. Complete File-by-File Summary Table

| # | File | Lines | Category | Purpose |
|---|------|-------|----------|---------|
| 1 | README.md | 162 | Docs | Project overview & setup |
| 2 | LICENSE | 20 | Legal | MIT License |
| 3 | .gitignore | 31 | Config | Git ignore rules |
| 4 | start.sh | 92 | Script | One-click Mac/Linux startup |
| 5 | docs/Architecture.md | 327 | Docs | System architecture |
| 6 | docs/Privacy.md | 206 | Docs | Privacy policy |
| 7 | backend/package.json | 49 | Config | Backend dependencies |
| 8 | backend/tsconfig.json | 27 | Config | TypeScript config |
| 9 | backend/jest.config.js | 19 | Config | Test config |
| 10 | backend/src/server.ts | 87 | Backend | Server startup & DB |
| 11 | backend/src/app.ts | 123 | Backend | Express app & middleware |
| 12 | backend/src/config/index.ts | 60 | Backend | Centralized config |
| 13 | backend/src/types/index.ts | 53 | Backend | TypeScript interfaces |
| 14 | backend/src/models/User.ts | 104 | Model | User schema + auth methods |
| 15 | backend/src/models/Activity.ts | 111 | Model | Activity schema + validators |
| 16 | backend/src/models/Participation.ts | 43 | Model | Enrollment schema + unique index |
| 17 | backend/src/middleware/auth.ts | 107 | Middleware | JWT auth + RBAC |
| 18 | backend/src/middleware/errorHandler.ts | 65 | Middleware | Global error handler |
| 19 | backend/src/middleware/validate.ts | 20 | Middleware | Validation result handler |
| 20 | backend/src/controllers/authController.ts | 385 | Controller | Auth (register/login/refresh/logout/profile/password) |
| 21 | backend/src/controllers/activityController.ts | 850 | Controller | Activities CRUD + atomic enrollment |
| 22 | backend/src/controllers/dashboardController.ts | 650 | Controller | Dashboards + analytics + admin management |
| 23 | backend/src/routes/authRoutes.ts | 74 | Routes | 6 auth endpoints |
| 24 | backend/src/routes/activityRoutes.ts | 165 | Routes | 9 activity endpoints |
| 25 | backend/src/routes/dashboardRoutes.ts | 92 | Routes | 7 dashboard endpoints |
| 26 | backend/src/utils/email.ts | 127 | Utility | Email templates |
| 27 | backend/src/utils/logger.ts | 45 | Utility | Winston logger config |
| 28 | backend/scripts/seed.ts | 600 | Script | Database seeder |
| 29 | backend/scripts/checkUser.ts | 29 | Script | User verification |
| 30 | backend/scripts/fixIndexes.ts | 21 | Script | Index repair |
| 31 | backend/tests/setup.ts | 23 | Test | MongoDB Memory Server setup |
| 32 | backend/tests/auth.test.ts | 111 | Test | Auth tests (8 cases) |
| 33 | backend/tests/enrollment.test.ts | 195 | Test | Race condition tests (4 cases) |
| 34 | backend/tests/participants-access.test.ts | 98 | Test | Access control tests (1 case) |
| 35 | frontend/package.json | 60 | Config | Frontend dependencies |
| 36 | frontend/tsconfig.json | 24 | Config | TypeScript config |
| 37 | frontend/tsconfig.node.json | 9 | Config | Node TS config |
| 38 | frontend/vite.config.ts | 18 | Config | Vite dev server + proxy |
| 39 | frontend/tailwind.config.js | 80 | Config | Custom design system |
| 40 | frontend/postcss.config.js | 5 | Config | PostCSS plugins |
| 41 | frontend/index.html | 16 | Frontend | SPA entry point |
| 42 | frontend/src/main.tsx | 26 | Frontend | React entry + QueryClient |
| 43 | frontend/src/App.tsx | 191 | Frontend | Router + 16 routes |
| 44 | frontend/src/index.css | 250 | Frontend | Global styles + Tailwind |
| 45 | frontend/src/vite-env.d.ts | 9 | Frontend | Env type definitions |
| 46 | frontend/src/store/authStore.ts | 170 | Store | Auth state (Zustand) |
| 47 | frontend/src/store/themeStore.ts | 22 | Store | Theme state (Zustand) |
| 48 | frontend/src/services/api.ts | 140 | Service | Axios + token refresh interceptor |
| 49 | frontend/src/services/authService.ts | 58 | Service | Auth API calls |
| 50 | frontend/src/services/activityService.ts | 137 | Service | Activity API calls |
| 51 | frontend/src/services/dashboardService.ts | 95 | Service | Dashboard API calls |
| 52 | frontend/src/services/index.ts | 11 | Service | Barrel export |
| 53 | frontend/src/utils/cn.ts | 5 | Utility | Tailwind class merge |
| 54 | frontend/src/components/Auth/ProtectedRoute.tsx | 32 | Component | Route guard (auth + roles) |
| 55 | frontend/src/components/Layout/Layout.tsx | 46 | Component | Page layout + footer |
| 56 | frontend/src/components/Layout/Navbar.tsx | 350 | Component | Navigation (role-based, responsive) |
| 57 | frontend/src/components/Common/Button.tsx | 70 | Component | Button (5 variants, icons, loading) |
| 58 | frontend/src/components/Common/Card.tsx | 28 | Component | Card container (hover, glass) |
| 59 | frontend/src/components/Common/Input.tsx | 110 | Component | Input (label, error, password toggle) |
| 60 | frontend/src/components/Common/Badge.tsx | 40 | Component | Status badge (6 variants) |
| 61 | frontend/src/components/Common/Modal.tsx | 95 | Component | Dialog modal (5 sizes, animated) |
| 62 | frontend/src/components/Common/Skeleton.tsx | 70 | Component | Loading placeholder (shimmer) |
| 63 | frontend/src/components/Common/index.ts | 6 | Component | Barrel export |
| 64 | frontend/src/components/UI/Select.tsx | 55 | Component | Select dropdown |
| 65 | frontend/src/components/UI/TextArea.tsx | 50 | Component | Textarea input |
| 66 | frontend/src/components/Activity/ActivityCard.tsx | 195 | Component | Activity preview card |
| 67 | frontend/src/components/Activity/ParticipantsList.tsx | 280 | Component | Participants table |
| 68 | frontend/src/pages/HomePage.tsx | 470 | Page | Landing page |
| 69 | frontend/src/pages/LoginPage.tsx | 119 | Page | Login form |
| 70 | frontend/src/pages/RegisterPage.tsx | 237 | Page | Registration form |
| 71 | frontend/src/pages/ActivitiesPage.tsx | 190 | Page | Browse activities |
| 72 | frontend/src/pages/ActivityDetailPage.tsx | 288 | Page | Single activity view + enrollment |
| 73 | frontend/src/pages/StudentDashboard.tsx | 189 | Page | Student hub |
| 74 | frontend/src/pages/FacultyDashboard.tsx | 176 | Page | Faculty hub |
| 75 | frontend/src/pages/FacultyActivitiesPage.tsx | 176 | Page | Faculty activity management |
| 76 | frontend/src/pages/CreateActivityPage.tsx | 262 | Page | New activity form |
| 77 | frontend/src/pages/EditActivityPage.tsx | 214 | Page | Edit activity form |
| 78 | frontend/src/pages/MyActivitiesPage.tsx | 215 | Page | User's activities |
| 79 | frontend/src/pages/ProfilePage.tsx | 261 | Page | Profile + password change |
| 80 | frontend/src/pages/AdminDashboard.tsx | 292 | Page | Admin hub |
| 81 | frontend/src/pages/AdminActivitiesPage.tsx | 349 | Page | Admin activity management |
| 82 | frontend/src/pages/AdminUsersPage.tsx | 209 | Page | Admin user management |
| 83 | frontend/src/pages/NotFoundPage.tsx | 18 | Page | 404 page |
| 84 | frontend/src/pages/UnauthorizedPage.tsx | 50 | Page | 403 page |

**Total: ~84 source files, ~8,500+ lines of code**

---

> **This document covers every file, every function, every route, every component, every model field, every security measure, every environment variable, and every user interaction in the entire EventHub project from A to Z.**
