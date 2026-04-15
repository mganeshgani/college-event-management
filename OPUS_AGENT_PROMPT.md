# EventHub — Production Upgrade Master Prompt
### For: Claude Opus (VS Code Agent Mode)
### Project: Campus Event Management Platform (Full-Stack TypeScript)
### Mission: Audit, fix, clean, and elevate EventHub to a production-grade application

---

## ⚠️ CRITICAL OPERATING RULES — READ BEFORE EVERY ACTION

1. **THINK BEFORE YOU CODE.** Before touching any file, read it fully. Understand the existing logic, imports, and dependencies.
2. **ONE PHASE AT A TIME.** Complete each phase fully and verify it before moving to the next.
3. **TEST AFTER EVERY FEATURE.** After every individual change, run the relevant tests. Do not batch changes and test at the end.
4. **NEVER BREAK EXISTING WORKING FEATURES.** Every fix must be backward compatible unless explicitly replacing broken logic.
5. **END-TO-END TEST AT PHASE COMPLETION.** At the end of each phase, run the full test suite and verify the app runs with `npm run dev` in both frontend and backend simultaneously.
6. **LOG YOUR REASONING.** Before each edit, write a one-line comment explaining what you're changing and why.
7. **HANDLE ALL ERROR STATES.** Every new feature must handle loading, error, and empty states gracefully.
8. **NO ORPHAN CODE.** If you remove a feature or page, also remove its route, navigation link, import, and service call.
9. **TYPESCRIPT STRICT.** All new code must be fully typed with no `any`. Run `npm run typecheck` after each phase.
10. **COMMIT CHECKPOINT.** After each phase completes successfully, note the files changed so work can be reviewed.

---

## 📁 PROJECT CONTEXT SUMMARY

**Stack:** Node.js + Express + MongoDB + Mongoose (backend) | React 18 + Vite + TailwindCSS + Zustand + React Query (frontend)  
**Auth:** JWT access tokens (15min) + refresh tokens (7-day), role-based (student / faculty / admin)  
**Key files:** `backend/src/`, `frontend/src/`  
**Run backend:** `cd backend && npm run dev`  
**Run frontend:** `cd frontend && npm run dev`  
**Run backend tests:** `cd backend && npm test`  
**Run frontend tests:** `cd frontend && npm test`  
**Typecheck:** `npm run typecheck` in both `backend/` and `frontend/`

---

## 🔴 PHASE 1 — CRITICAL BUG FIXES (Do This First)

These are hard logical errors that cause broken behavior in the current app. Fix them before anything else.

### Bug 1.1 — Wrong API endpoint in `activityService.ts`

**File:** `frontend/src/services/activityService.ts`

**Problem:** The `getParticipants(id)` function currently calls `/dashboard/export/:id` which is the **CSV binary download** endpoint, not the JSON participants list. This means any component trying to render a participant list will receive a blob instead of JSON.

**Fix:**
- `getParticipants(id)` → must call `GET /activities/:id/participants` and return JSON `{ activity, participants, pagination }`
- `exportParticipants(id)` → must call `GET /dashboard/export/:id` and return a blob for CSV download (this is correct, keep it as-is)

**Verify:** After fixing, the `ParticipantsList` component should render participant data correctly in the admin and faculty views.

---

### Bug 1.2 — Duplicate data display: Faculty Dashboard vs FacultyActivitiesPage

**Files:** `frontend/src/pages/FacultyDashboard.tsx` and `frontend/src/pages/FacultyActivitiesPage.tsx`

**Problem:** `FacultyDashboard` shows a grid of the faculty's own activities (6 items) at the bottom. `FacultyActivitiesPage` is a dedicated page that shows the same list with more features (edit/delete). This creates a confusing, duplicated experience.

**Fix:**
- Remove the activity grid section from `FacultyDashboard.tsx`. Replace it with a **single "Quick Actions" widget** that has large clickable cards:
  - "My Events" → links to `/faculty/my-activities` (shows count badge with total number of their activities)
  - "Create New Event" → links to `/create-activity`
  - "Participant Reports" → links to `/faculty/my-activities` with a note about accessing participants from there
- Keep only the 4 stat cards and the quick actions section on the faculty dashboard.
- `FacultyActivitiesPage` remains the single source of truth for the activity list.

**Verify:** Navigate to `/faculty/dashboard` — no activity list shown. Navigate to `/faculty/my-activities` — full activity list with edit/delete present.

---

### Bug 1.3 — Duplicate data display: Student Dashboard "discover events"

**Files:** `frontend/src/pages/StudentDashboard.tsx` and `frontend/src/pages/ActivitiesPage.tsx`

**Problem:** `StudentDashboard` has a "Discover New Events" section showing 3 published activities. This duplicates the `/activities` page. The student dashboard should focus on **the student's personal data**, not act as a secondary activities browser.

**Fix:**
- Remove the "Discover New Events" section from `StudentDashboard.tsx`.
- Replace it with a **"Quick Stats" insight row** showing:
  - Days until their next upcoming enrolled event (with date)
  - A motivational nudge if they have no upcoming events: "No upcoming events — [Browse Events →]"
- Keep: 4 stat cards + recent enrolled activities (3 items, showing name/date/status).

**Verify:** Student dashboard shows personal data only, not a duplicate event browser.

---

### Bug 1.4 — AdminDashboard duplicates AdminActivitiesPage and AdminUsersPage

**File:** `frontend/src/pages/AdminDashboard.tsx`

**Problem:** `AdminDashboard` shows "Recent Users" (8 items) and "Recent Activities" (8 items) which are just subsets of what `AdminUsersPage` and `AdminActivitiesPage` already show in full. This makes the admin dashboard feel redundant.

**Fix — Transform Admin Dashboard into a true control center:**
- Keep: 6 stat cards (total users, students, faculty, total activities, published activities, total enrollments)
- Replace "recent users list" with: **Department Breakdown** (horizontal bar chart using pure CSS/Tailwind — bar widths as percentage of max, no external chart library)
- Replace "recent activities list" with: **Category Distribution** (grid of category chips with count badges)
- Add: **System Health Summary** — 3 inline status indicators: Database (always "Connected ✓"), API (always "Operational ✓"), Last Seed (show `createdAt` of most recent activity)
- The "View All" links to `AdminActivitiesPage` and `AdminUsersPage` remain as action buttons.

**Verify:** Admin dashboard is a true overview. Users and Activities pages remain the detail tables.

---

### Bug 1.5 — Missing Forgot Password flow

**Problem:** The backend has a full email utility (`email.ts`) and the auth system supports clearing refresh tokens, but there is **no forgot password / password reset flow**. Users who forget their password cannot recover their account.

**Fix — Backend:**
1. Add to `User` model: `passwordResetToken: String` (select: false), `passwordResetExpires: Date` (select: false)
2. Add two new endpoints in `authRoutes.ts`:
   - `POST /api/auth/forgot-password` — accepts `{ email }`, generates a cryptographically random 6-digit OTP using `crypto.randomInt`, stores its bcrypt hash + expiry (15 min) on the user, sends OTP email via `sendEmail()` utility (console.log the OTP in dev), returns `{ message: "OTP sent if email exists" }` (never reveal if email exists or not)
   - `POST /api/auth/reset-password` — accepts `{ email, otp, newPassword }`, verifies OTP against stored hash, verifies expiry, updates password, clears all refresh tokens, clears reset fields, returns success
3. Add `sendPasswordResetOTP(email, userName, otp)` to `email.ts`
4. Add controller methods `forgotPassword` and `resetPassword` to `authController.ts`
5. Add validation: `newPassword` must meet the existing password policy (8+ chars, uppercase, lowercase, number)

**Fix — Frontend:**
1. On `LoginPage.tsx`, add a "Forgot password?" link below the password field
2. Create `ForgotPasswordPage.tsx` at route `/forgot-password`:
   - Step 1: Enter email → POST `/auth/forgot-password` → shows success message regardless of whether email exists
   - Step 2 (same page, conditional render): Enter 6-digit OTP + new password + confirm password → POST `/auth/reset-password` → on success toast + redirect to `/login`
   - Use a stepper UI (Step 1 / Step 2) with smooth Framer Motion transition
3. Register route in `App.tsx`: `/forgot-password` → `ForgotPasswordPage` (public, no auth required)

**Test after this bug fix:**
- Write a test in `backend/tests/auth.test.ts`: `POST /auth/forgot-password` with valid email → 200; `POST /auth/reset-password` with correct OTP → 200 + can log in with new password; expired OTP → 400
- Run `npm test` — all 13 existing tests + new tests must pass

---

### Bug 1.6 — Waitlist feature is built in the backend model but never activated

**Problem:** `Participation` model has `status: enum ['enrolled', 'waitlisted', 'cancelled']` and `email.ts` has `sendWaitlistNotification()`, but the enrollment controller never sets `waitlisted` status. It just returns 400 "Activity is full" and that's it.

**Fix — Backend:**
In `activityController.ts` `enrollInActivity`:
- After Step 4 fails (availableSlots === 0), instead of just returning 400:
  - Check if a `waitlistEnabled` field is true on the activity (add this field to the Activity model)
  - If waitlist is enabled: Create `Participation` with `status: 'waitlisted'`, call `sendWaitlistNotification()`, return `{ status: 'waitlisted', position: <their position in waitlist> }`
  - If waitlist is not enabled: return the existing 400 "Activity is full"
- When a student **cancels** enrollment (`cancelEnrollment`): 
  - After cancellation, check if there are waitlisted participants
  - If yes: find the oldest waitlisted participation, update it to `enrolled`, increment the slot back (or keep at 0 since one cancelled one enrolled), send `sendEnrollmentConfirmation()` to the newly enrolled student
  - This slot promotion must also be done inside a MongoDB transaction

**Fix — Activity Model:**
- Add `waitlistEnabled: { type: Boolean, default: false }` to `Activity` schema

**Fix — Frontend:**
- In `CreateActivityPage.tsx` and `EditActivityPage.tsx`: Add a toggle/checkbox for "Enable Waitlist"
- In `ActivityDetailPage.tsx`: When `isEnrolled` response has `status: 'waitlisted'`, show a yellow "You're on the waitlist (Position #N)" badge instead of the green enrollment badge
- In `MyActivitiesPage.tsx`: Waitlisted activities already have a badge — ensure position number is shown if available in the participation data

**Test after this fix:**
- Add test to `enrollment.test.ts`: Enroll student A in a 1-slot activity → success. Enroll student B when full with waitlist enabled → waitlisted. Student A cancels → student B is promoted to enrolled.

---

## 🟠 PHASE 2 — UI DEDUPLICATION & PAGE RESTRUCTURING

Complete Phase 1 bugs first. Then do this phase.

### 2.1 — Consolidate and clarify page purposes

After Phase 1 fixes, ensure each page has one clear, distinct purpose. Audit the navigation in `Navbar.tsx` and verify:

**Student nav links:** Events | Dashboard | My Activities | Profile  
**Faculty nav links:** Events | Dashboard | My Events | Create Event | Profile  
**Admin nav links:** Dashboard | Activities | Users | Create Event | Profile  

Remove any nav link that goes to a page now considered redundant after Phase 1 changes.

---

### 2.2 — Remove duplicate "My Activities" rendering in ActivityDetailPage

**Problem:** When a student visits an activity and is already enrolled, the enrollment button changes. However, the enrollment state is sometimes stale due to React Query cache not being invalidated properly.

**Fix in `ActivityDetailPage.tsx`:**
- After a successful enrollment or cancellation, call `queryClient.invalidateQueries({ queryKey: ['activity', id] })` AND `queryClient.invalidateQueries({ queryKey: ['myEnrollments'] })` AND `queryClient.invalidateQueries({ queryKey: ['studentStats'] })`
- Ensure the `isEnrolled` flag returned from `GET /activities/:id` is used to show the correct button state on page load (no flash of wrong state)

---

### 2.3 — Fix the ProfilePage to be more useful

**File:** `frontend/src/pages/ProfilePage.tsx`

**Current state:** Shows profile info and a password change form (collapsible).

**Enhancement:**
- Add an **Account Statistics section** for students: total events enrolled, upcoming events, completed events
- Add an **Account Statistics section** for faculty: total events created, total participants, published events
- Add **Profile Edit** capability inline: clicking a pencil icon on the name or department allows inline editing. `PUT /api/auth/profile` (add this endpoint — see Phase 3).
- Password change form should remain but be a separate card below, always visible (not collapsible — simplify the UX).

---

### 2.4 — Eliminate redundant Skeleton use

Audit every page. Any page that loads data and shows a spinner or blank state before data arrives must use the existing `Skeleton` component. Ensure consistent loading UX across:
- `ActivitiesPage` — already has skeleton, verify it works
- `StudentDashboard`, `FacultyDashboard`, `AdminDashboard` — add skeleton for each stat card
- `AdminUsersPage`, `AdminActivitiesPage` — add skeleton for table rows (5 skeleton rows during load)
- `ActivityDetailPage` — verify skeleton for entire page content while fetching

---

## 🟡 PHASE 3 — MISSING CORE FEATURES

### 3.1 — Add Profile Update Endpoint

**Backend — `authController.ts`:**
Add `updateProfile` method:
- `PATCH /api/auth/profile`
- Authenticated (any role)
- Allowed fields: `name` (2-100 chars), `department` (max 100 chars), `rollNumber` (students only, max 50 chars)
- Disallowed: `email`, `role`, `password` (these have dedicated endpoints)
- Returns updated user object

**Backend — `authRoutes.ts`:**
- Add `PATCH /profile` route with `authenticate` middleware and validation

**Frontend — `authService.ts`:**
Add `updateProfile(data: { name?: string; department?: string; rollNumber?: string })` function

**Frontend — `authStore.ts`:**
Add `updateUser(data)` action that calls `updateProfile()` and updates the `user` field in state

**Frontend — `ProfilePage.tsx`:**
Implement inline edit with React Hook Form for the name and department fields.

---

### 3.2 — Add Activity Analytics Page (frontend)

The backend already has `GET /dashboard/analytics/:id` which returns detailed analytics. There is currently **no frontend page that uses this endpoint.**

**Create `frontend/src/pages/ActivityAnalyticsPage.tsx`:**
- Route: `/activity/:id/analytics` (protected: faculty + admin)
- Fetch data from `GET /dashboard/analytics/:id`
- Display using **pure CSS/Tailwind charts** (no external chart library needed):

**Sections to render:**
1. **Overview Cards Row:** Total enrolled, waitlisted, cancelled, fill rate percentage (enrolled / capacity × 100)
2. **Enrollment Over Time:** A horizontal timeline bar — each enrollment date is a tick mark. Use a CSS flex row with dots and dates. Show "enrollment velocity" (how fast it filled).
3. **Department Breakdown:** Horizontal stacked bar for enrolled students by department — pure CSS with Tailwind `w-[X%]` set dynamically via inline style.
4. **Participation Status Pie-like Chart:** A circular progress indicator using SVG `<circle>` stroke-dasharray technique showing enrolled vs. capacity as a ring chart (pure SVG, no library).
5. **Quick Info:** Activity title, faculty name, dates, location, created date.

**Navigation to this page:**
- In `FacultyActivitiesPage.tsx`: Add a "📊 Analytics" icon button for each activity (alongside edit/delete)
- In `AdminActivitiesPage.tsx`: Add same analytics icon button

**Add to `dashboardService.ts`:**
```ts
getActivityAnalytics(id: string): Promise<AnalyticsData>
```

---

### 3.3 — Add Admin: Promote / Demote User Roles

**Backend — `dashboardController.ts`:**
Add `updateUserRole` controller:
- `PATCH /api/dashboard/admin/users/:id/role`
- Admin only
- Accepts `{ role: 'student' | 'faculty' | 'admin' }`
- Validates: Cannot demote yourself (req.user.userId !== targetId)
- Updates user role, clears all refresh tokens (forces re-login)

**Backend — `dashboardRoutes.ts`:**
Add route: `PATCH /admin/users/:id/role` → authorize('admin') → updateUserRole

**Frontend — `AdminUsersPage.tsx`:**
- In the user table, in the "Role" column, replace the static badge with a dropdown `<Select>` component showing current role
- On change: show a confirmation modal ("Change role from X to Y?") → on confirm call the PATCH endpoint
- On success: invalidate users query, show toast "Role updated"
- Disable dropdown for the currently logged-in admin (cannot demote yourself)

---

### 3.4 — Add Admin: Bulk Activity Status Change

**Backend — `activityController.ts`:**
Add `bulkUpdateActivityStatus` controller:
- `PATCH /api/activities/bulk/status`
- Admin only
- Accepts `{ activityIds: string[], status: 'published' | 'cancelled' | 'completed' }`
- Validates all IDs are valid ObjectIds
- Runs `Activity.updateMany({ _id: { $in: activityIds } }, { status })`
- Returns `{ modifiedCount }`

**Backend — `activityRoutes.ts`:**
Add route: `PATCH /bulk/status` → authorize('admin') → bulkUpdateActivityStatus  
**Important:** Place this route BEFORE `/:id` routes to avoid ID parsing conflicts.

**Frontend — `AdminActivitiesPage.tsx`:**
- Add a checkbox column to the left of the table
- "Select all" checkbox in the header
- When 1+ activities are selected, show a floating action bar at the bottom:
  - "X activities selected" counter
  - Dropdown: "Set status to..." with options: Published, Cancelled, Completed
  - "Apply" button → confirmation modal → PATCH call → invalidate query → toast
  - "Clear selection" button
- Use a `Set<string>` in component state to track selected IDs

---

### 3.5 — Add Activity Clone Feature for Faculty

**Backend — `activityController.ts`:**
Add `cloneActivity` controller:
- `POST /api/activities/:id/clone`
- Faculty + Admin
- Faculty can only clone their own activities; Admin can clone any
- Creates a new activity with all same fields EXCEPT:
  - `title`: Prefixed with "Copy of "
  - `status`: Always set to `'draft'`
  - `availableSlots`: Reset to equal `capacity`
  - `createdBy`: Set to `req.user.userId` (the cloner)
  - `startDate` / `endDate`: Cleared (set to null or removed) — faculty must set new dates
- Returns the new activity

**Backend — `activityRoutes.ts`:**
Add: `POST /:id/clone` → authenticate → authorize('faculty', 'admin') → cloneActivity

**Frontend — `FacultyActivitiesPage.tsx`:**
- Add a "Clone" icon button (duplicate/copy icon) for each activity
- On click: show a small modal: "Clone this activity? A draft copy will be created for you to edit."
- On confirm: call the clone endpoint → on success: toast "Draft copy created!" + `queryClient.invalidateQueries` → navigate to `/edit-activity/:newId`

---

### 3.6 — Add Real-time Slot Count with Auto-refresh

**Problem:** When a popular activity fills up, other students on the page still see the old slot count until they refresh manually.

**Fix — Frontend — `ActivityDetailPage.tsx`:**
- Use React Query's `refetchInterval` option: `{ refetchInterval: 30000 }` (30 seconds) on the activity detail query when the activity is NOT completed/cancelled
- Add a small "Last updated Xs ago" indicator near the slot count using a `useEffect` timer
- When `availableSlots` changes between fetches, briefly animate the slot count with a Framer Motion scale pulse

---

## 🟢 PHASE 4 — UX POLISH & MISSING UI

### 4.1 — Add Breadcrumb Navigation

**Create `frontend/src/components/Layout/Breadcrumb.tsx`:**
```tsx
// Renders breadcrumb based on current route path
// Example: Home > Activities > AI Workshop
// Uses React Router's useLocation and useMatches
```

Props: `items: Array<{ label: string; href?: string }>`  
Style: Subtle gray text, `/` separator, last item bold, first item always "Home" linking to `/`

**Add breadcrumbs to these pages:**
- `ActivityDetailPage`: `Home > Events > {activity.title}`
- `FacultyActivitiesPage`: `Dashboard > My Events`
- `CreateActivityPage`: `Dashboard > My Events > Create Event`
- `EditActivityPage`: `Dashboard > My Events > Edit: {activity.title}`
- `AdminActivitiesPage`: `Dashboard > Activities`
- `AdminUsersPage`: `Dashboard > Users`
- `ActivityAnalyticsPage`: `Dashboard > My Events > {activity.title} > Analytics`
- `ProfilePage`: `Home > Profile`

---

### 4.2 — Add Proper Empty States

Every list or table that can be empty must have a dedicated empty state component — **not just nothing or generic text.**

**Create `frontend/src/components/Common/EmptyState.tsx`:**
```tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void; };
}
```
Style: Centered, subtle gray, icon at top (64px), title + description text, optional primary button

**Apply to:**
- `ActivitiesPage`: No results for search/filter → "No events found — Try adjusting your search or filters" + "Clear Filters" button
- `StudentDashboard` recent enrollments: No enrollments → "You haven't joined any events yet" + "Browse Events →"
- `FacultyActivitiesPage`: No activities → "You haven't created any events yet" + "Create Your First Event →"
- `AdminActivitiesPage`: No results for filters → "No activities match your filters" + "Clear Filters"
- `AdminUsersPage`: No results for search → "No users match your search"
- `MyActivitiesPage`: No activities → "You haven't enrolled in any events yet" + "Explore Events →"

---

### 4.3 — Add Sort Options to ActivitiesPage

**File:** `frontend/src/pages/ActivitiesPage.tsx`

Add a **"Sort By" dropdown** in the filter bar with options:
- Newest First (default — sort by `createdAt DESC`)
- Oldest First
- Date: Soonest First (sort by `startDate ASC`)
- Date: Latest First
- Most Popular (sort by `capacity - availableSlots DESC` i.e. most enrolled)
- Alphabetical (A-Z)

**Backend — `activityController.ts` `getActivities`:**
Add `sortBy` query param handling:
- `newest` → `{ createdAt: -1 }`
- `oldest` → `{ createdAt: 1 }`
- `soonest` → `{ startDate: 1 }`
- `latest` → `{ startDate: -1 }`
- `popular` → sort pipeline stage: `{ $sort: { enrolledCount: -1 } }` (add computed field)
- `az` → `{ title: 1 }`

Pass `sortBy` param from frontend to `activityService.getActivities()`.

---

### 4.4 — Improve the CreateActivity and EditActivity forms

**Files:** `CreateActivityPage.tsx`, `EditActivityPage.tsx`

**Current issues:**
- The poster image field is just a plain URL string input — there's no preview
- The form doesn't show a live preview of the activity as a card
- No character count on description
- No inline date validation (end date must be after start date)
- Status field in create has only 2 options (draft/published) but this is intentional — keep it

**Fixes:**
1. **Image URL preview:** Below the poster URL input, add a `<img>` preview that loads when a valid URL is entered (use `onLoad`/`onError` to handle invalid URLs gracefully — show a placeholder on error)
2. **Description character count:** Show `"X / 2000 characters"` below the textarea, turn red when over 1800
3. **Date validation:** On the `endDate` field, set `min` attribute equal to the current `startDate` value dynamically. If `endDate` is before `startDate`, show inline error "End date must be after start date" and prevent submission
4. **Capacity and availableSlots:** When creating, `availableSlots` should automatically be set equal to `capacity` (the backend should handle this, but also set it on the frontend when the user types capacity so they can see the relationship)
5. **Add the "Enable Waitlist" toggle** (from Bug 1.6) as a labeled checkbox with a helper text: "When the event is full, students can join the waitlist"

---

### 4.5 — Improve Activity Detail Page

**File:** `frontend/src/pages/ActivityDetailPage.tsx`

1. **Social share:** Add a "Share" button that copies the current URL to clipboard with `navigator.clipboard.writeText(window.location.href)` → show toast "Link copied!"
2. **Add to Calendar:** When a student is enrolled, show an "Add to Calendar" button that generates an `.ics` file download — create a pure JS ICS generator function (no library) that creates the RFC 5545 calendar event with the activity title, dates, location, and description
3. **Back navigation:** Add a `← Back to Events` link at the top-left using `useNavigate(-1)` from React Router (falls back to `/activities`)
4. **Organizer card improvement:** If the organizer's department is available, show it below their name

---

### 4.6 — Add a Notifications Bell (Frontend-only, Persistent State)

This is a frontend-only notification system using Zustand. No backend changes needed.

**Create `frontend/src/store/notificationStore.ts`:**
```ts
interface Notification {
  id: string;
  type: 'enrollment' | 'waitlist' | 'promoted' | 'cancelled' | 'info';
  title: string;
  message: string;
  activityId?: string;
  createdAt: Date;
  read: boolean;
}
```
State: `notifications: Notification[]`, `unreadCount: number`  
Actions: `addNotification(n)`, `markAsRead(id)`, `markAllAsRead()`, `clearAll()`  
Persistence: localStorage via Zustand persist  

**Create `frontend/src/components/Layout/NotificationBell.tsx`:**
- Bell icon (Heroicons `BellIcon`) in the Navbar, right of the theme toggle
- Red badge with unread count (hidden if 0)
- Click → dropdown panel showing last 10 notifications (newest first)
- Each notification: icon (by type), title, message, time ago, link to activity if `activityId` present
- "Mark all as read" button
- "Clear all" button
- Click any notification → mark as read + navigate to activity

**Wire up notifications:** In `authStore.ts`, `activityStore` or within relevant components:
- After successful enrollment: `addNotification({ type: 'enrollment', title: 'Enrolled!', message: 'You joined {activityTitle}', activityId })`
- After waitlist join: `addNotification({ type: 'waitlist', title: 'Added to waitlist', ... })`
- After cancellation: `addNotification({ type: 'cancelled', title: 'Enrollment cancelled', ... })`

**Add `NotificationBell` to `Navbar.tsx`** (only shown when authenticated).

---

### 4.7 — Admin Dashboard: Add Proper CSS Bar Charts

Following the fix from Phase 1 (Bug 1.4), implement the CSS bar charts properly:

**Department Breakdown Chart:**
```
CS Department        ████████████████████  45
Electronics          ██████████████        32
Mechanical           ██████████            23
...
```
Implementation: `<div style={{ width: `${(count/max)*100}%` }}>` inside a fixed-width container. Animate with Framer Motion `initial={{ width: 0 }} animate={{ width: ... }}` on mount.

**Category Distribution Grid:**
A responsive grid of cards, each showing: Category icon emoji, category name, event count, a small colored accent bar at the bottom. Use different Tailwind colors per category.

---

## 🔵 PHASE 5 — TEST COVERAGE

After all features are implemented, write tests. This phase should not be skipped.

### 5.1 — Backend: Expand existing test suite

**File:** `backend/tests/auth.test.ts`

Add the following test cases:
1. `POST /auth/forgot-password` with registered email → 200 with success message
2. `POST /auth/forgot-password` with unregistered email → 200 (same message, don't leak if email exists)
3. `POST /auth/reset-password` with valid OTP → 200, old password no longer works, new password works
4. `POST /auth/reset-password` with expired OTP → 400
5. `POST /auth/reset-password` with invalid OTP → 400
6. `PATCH /auth/profile` — update name → 200, user.name updated
7. `PATCH /auth/profile` — attempt to change email → field ignored (email unchanged)

**File:** `backend/tests/enrollment.test.ts`

Add:
8. Enroll in full activity with waitlist enabled → `{ status: 'waitlisted' }` 
9. Cancel enrollment from waitlisted activity → user removed from waitlist
10. Cancel enrollment → waitlisted user is promoted to enrolled

**File:** `backend/tests/activity.test.ts` (NEW FILE)

Create a new test file for activity CRUD:
11. Create activity (faculty) → 201
12. Create activity (student) → 403
13. Update own activity (faculty) → 200
14. Update another faculty's activity (faculty) → 403
15. Admin updates any activity → 200
16. Clone activity → 201, title prefixed "Copy of", status = 'draft'
17. `GET /activities?sortBy=soonest` → activities ordered by startDate ASC
18. Bulk status update (admin) → 200, modifiedCount matches

**File:** `backend/tests/admin.test.ts` (NEW FILE)
19. Admin update user role → 200, user role changed
20. Admin attempt to demote self → 400
21. Non-admin attempt to update role → 403

Run `npm test` after this phase. **All tests must pass.** Fix any failures before proceeding.

---

### 5.2 — Frontend: Write Vitest tests

**File:** `frontend/src/tests/auth.test.tsx` (NEW)

Using `@testing-library/react` and `vitest`:

1. `LoginPage` renders email + password fields
2. `LoginPage` shows error on wrong credentials (mock the API to return 401)
3. `RegisterPage` shows roll number field only when "Student" role is selected
4. `ProtectedRoute` redirects to `/login` when unauthenticated

**File:** `frontend/src/tests/components.test.tsx` (NEW)

5. `Button` renders with correct variant className
6. `Badge` renders with correct color for each variant
7. `Modal` renders children when `isOpen=true`, renders nothing when `isOpen=false`
8. `EmptyState` renders title, description, and action button

**File:** `frontend/src/tests/activityCard.test.tsx` (NEW)

9. `ActivityCard` shows activity title
10. `ActivityCard` shows "Full" when `availableSlots === 0`
11. `ActivityCard` shows green progress bar when slots > 20% available

Run `cd frontend && npm test` — all tests must pass.

---

## ⚫ PHASE 6 — PRODUCTION HARDENING

### 6.1 — Environment & Config

1. In `backend/.env.example` (create if not existing): List ALL required env variables with placeholder values and comments explaining each
2. In `frontend/.env.example` (create if not existing): Same for frontend vars
3. In `backend/src/config/index.ts`: Add validation that throws a startup error if required env vars are missing (check: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV`, `PORT`)
4. In `backend/src/server.ts`: Handle `SIGTERM` and `SIGINT` signals for graceful shutdown (close MongoDB connection + HTTP server)

### 6.2 — API Response Consistency

Audit ALL backend endpoints and ensure every response follows this exact shape:
```json
// Success
{ "success": true, "data": { ... }, "message": "Optional success message" }

// Error (already handled by global error handler, verify format)
{ "success": false, "error": "Error message", "details": [] }

// Paginated
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 10, "total": 50, "totalPages": 5 } }
```
Update `errorHandler.ts` and all controllers to match this shape exactly. Update all frontend services to destructure `data.data` properly.

### 6.3 — Security Headers Audit

In `backend/src/app.ts`, review the `helmet()` configuration:
1. Add explicit Content-Security-Policy that allows only the frontend origin
2. Add `X-Content-Type-Options: nosniff` (Helmet includes this by default — verify it's active)
3. Add `Referrer-Policy: strict-origin-when-cross-origin`
4. In the CORS config: ensure the origin whitelist reads from `config.frontendUrl` (not hardcoded)

### 6.4 — Frontend Performance

1. In `frontend/src/App.tsx`: Wrap every non-critical page component in `React.lazy()` + wrap the Router in `<Suspense fallback={<PageSkeleton />}>` for code splitting
2. Create `frontend/src/components/Common/PageSkeleton.tsx`: A full-page loading skeleton with a shimmer navbar + content placeholder
3. In `vite.config.ts`: Add `build.rollupOptions.output.manualChunks` to split vendor chunks: `react-router`, `framer-motion`, `@tanstack/react-query` into separate chunks

### 6.5 — Error Boundary

**Create `frontend/src/components/Common/ErrorBoundary.tsx`:**
A React class component `ErrorBoundary` that catches render errors:
- Shows a friendly "Something went wrong" screen with a "Reload Page" button
- Logs error to console (in production, would send to error tracking service)
- Wrap the entire `<App />` in `main.tsx` with this error boundary

### 6.6 — Accessibility Audit

Go through every interactive element and ensure:
1. All buttons have either text or `aria-label`
2. All form inputs have associated `<label>` elements (via `htmlFor` + `id`)
3. Modal dialogs use `role="dialog"` and `aria-labelledby` (Headless UI handles this — verify)
4. Images have `alt` text (activity poster images: `alt={activity.title}`)
5. Color is never the only means of conveying information (badges have text labels, not just colors)
6. Focus is trapped in modals when open (Headless UI handles — verify)
7. Navigation landmark: `<nav>` element wraps the Navbar, `<main>` wraps the page content in `Layout.tsx`

### 6.7 — Add a Health Check page (Frontend)

**Create `frontend/src/pages/StatusPage.tsx`** at route `/status` (public):
- Makes a real `GET /health` API call
- Displays: API status, environment, uptime (formatted as "X hours Y minutes"), server timestamp
- Auto-refreshes every 30 seconds
- Shows green "Operational" or red "Down" based on API response
- Add a small "Status" link in the footer

---

## 🏁 FINAL END-TO-END VERIFICATION CHECKLIST

After completing all 6 phases, perform the following manual verification AND automated checks:

### Automated Checks (run all commands):
```bash
# 1. Backend tests (must show 0 failures)
cd backend && npm test

# 2. Frontend tests (must show 0 failures)  
cd frontend && npm test

# 3. TypeScript checks (must show 0 errors)
cd backend && npm run typecheck
cd frontend && npm run typecheck

# 4. Frontend build (must succeed with no errors)
cd frontend && npm run build

# 5. Lint (must show 0 errors, warnings acceptable)
cd frontend && npm run lint
```

### Manual Verification Flow — Student Role:
1. Register as student → should redirect to `/dashboard`
2. Dashboard shows 4 stat cards, recent enrollments, next-event widget
3. Browse `/activities` → search works, filter works, sort works
4. Click activity → enrollment works, slot count decrements
5. `Add to Calendar` button downloads `.ics` file
6. `Share` button copies link to clipboard
7. Go to `/my-activities` → enrolled activity appears with correct status
8. Cancel enrollment → activity removed from list, notifications bell shows cancellation notification
9. Profile update → change name, see updated name in navbar immediately
10. Forgot password flow → OTP email logged in console → reset works → login with new password

### Manual Verification Flow — Faculty Role:
1. Login as faculty → redirect to `/faculty/dashboard`
2. Dashboard shows stat cards only + quick action cards (no activity list)
3. Go to `/faculty/my-activities` → see activity list with clone, analytics, edit, delete buttons
4. Clone an activity → redirected to edit page with prefilled "Copy of..." title
5. View analytics for an activity → see charts for enrollment breakdown
6. Create new activity with waitlist enabled → verify toggle appears
7. Edit activity → date validation prevents end before start, image URL preview works

### Manual Verification Flow — Admin Role:
1. Login as admin → redirect to `/admin/dashboard`
2. Dashboard shows stat cards, CSS bar charts, category grid — NO raw user/activity lists
3. Go to `/admin/activities` → checkbox column visible, bulk status change works
4. Go to `/admin/users` → role dropdown works, confirmation modal appears on change
5. `/status` page shows API health

### Manual Verification Flow — Auth:
1. Forgot password → OTP in console → reset works
2. After password reset, old session tokens are rejected (logout everywhere)
3. Token refresh works: wait for access token to expire (or manipulate expiry in test), make a request, verify it auto-refreshes

---

## 📋 FILES THAT WILL BE MODIFIED (Expected)

**Backend (modified):**
- `src/models/User.ts` — add passwordResetToken, passwordResetExpires
- `src/models/Activity.ts` — add waitlistEnabled
- `src/models/Participation.ts` — no changes
- `src/controllers/authController.ts` — add forgotPassword, resetPassword, updateProfile
- `src/controllers/activityController.ts` — add cloneActivity, bulkUpdateActivityStatus; fix waitlist in enrollInActivity and cancelEnrollment
- `src/controllers/dashboardController.ts` — add updateUserRole; update analytics data shape
- `src/routes/authRoutes.ts` — add 3 new routes
- `src/routes/activityRoutes.ts` — add clone and bulk routes
- `src/routes/dashboardRoutes.ts` — add role update route
- `src/utils/email.ts` — add sendPasswordResetOTP
- `tests/auth.test.ts` — expand with 7 new tests
- `tests/enrollment.test.ts` — expand with 3 new tests
- `tests/activity.test.ts` — NEW FILE (8 tests)
- `tests/admin.test.ts` — NEW FILE (3 tests)

**Frontend (modified/created):**
- `src/services/activityService.ts` — fix getParticipants bug, add clone, bulkUpdateStatus, addSortBy param
- `src/services/authService.ts` — add forgotPassword, resetPassword, updateProfile
- `src/services/dashboardService.ts` — add getActivityAnalytics, updateUserRole
- `src/store/authStore.ts` — add updateUser action
- `src/store/notificationStore.ts` — NEW FILE
- `src/components/Layout/Navbar.tsx` — add NotificationBell
- `src/components/Layout/Breadcrumb.tsx` — NEW FILE
- `src/components/Layout/NotificationBell.tsx` — NEW FILE
- `src/components/Common/EmptyState.tsx` — NEW FILE
- `src/components/Common/ErrorBoundary.tsx` — NEW FILE
- `src/components/Common/PageSkeleton.tsx` — NEW FILE
- `src/pages/StudentDashboard.tsx` — remove discover section, add next-event widget
- `src/pages/FacultyDashboard.tsx` — remove activity grid, add quick action cards
- `src/pages/FacultyActivitiesPage.tsx` — add clone button + analytics button
- `src/pages/AdminDashboard.tsx` — replace raw lists with CSS charts
- `src/pages/AdminActivitiesPage.tsx` — add bulk select, analytics button
- `src/pages/AdminUsersPage.tsx` — add role change dropdown
- `src/pages/ProfilePage.tsx` — add inline edit, add stats section
- `src/pages/ActivityDetailPage.tsx` — add share, ICS download, back nav, real-time refresh
- `src/pages/CreateActivityPage.tsx` — add image preview, char count, date validation, waitlist toggle
- `src/pages/EditActivityPage.tsx` — same improvements as create
- `src/pages/ActivitiesPage.tsx` — add sort dropdown, empty state
- `src/pages/MyActivitiesPage.tsx` — empty state, waitlist position
- `src/pages/ForgotPasswordPage.tsx` — NEW FILE
- `src/pages/ActivityAnalyticsPage.tsx` — NEW FILE
- `src/pages/StatusPage.tsx` — NEW FILE
- `src/App.tsx` — add new routes, React.lazy for all pages, Suspense, ErrorBoundary
- `src/tests/auth.test.tsx` — NEW FILE (4 tests)
- `src/tests/components.test.tsx` — NEW FILE (4 tests)
- `src/tests/activityCard.test.tsx` — NEW FILE (3 tests)
- `backend/.env.example` — NEW FILE
- `frontend/.env.example` — NEW FILE

---

## 🚫 DO NOT DO THESE THINGS

1. **Do NOT install any new chart libraries** (recharts, chart.js, d3, etc.). Use pure CSS/Tailwind + SVG for all data visualization.
2. **Do NOT change the database schema in a way that would require dropping existing indexes** without running `fixIndexes.ts` first.
3. **Do NOT change the JWT token format, payload structure, or signing keys** — this would invalidate all existing sessions.
4. **Do NOT remove the atomic enrollment transaction** — this is a critical concurrency safety feature.
5. **Do NOT add new pages to the admin nav** without also adding them to the RBAC `ProtectedRoute`.
6. **Do NOT use `any` in TypeScript**. If you're unsure of a type, use `unknown` and narrow it.
7. **Do NOT use `console.log` for debugging** in production paths — use the existing Winston `logger` utility in backend, and `import.meta.env.DEV` conditional logs in frontend.
8. **Do NOT skip the empty state or loading state** for any new list/table component.
9. **Do NOT change the API base URL structure** — all paths must remain under `/api/`.
10. **Do NOT break mobile responsiveness** — test each new component at 375px, 768px, and 1440px widths.

---

*This prompt was engineered for Claude Opus operating as a VS Code agent with full filesystem and terminal access. Execute phases in strict order. Do not parallelize across phases. Validate each phase before advancing.*
