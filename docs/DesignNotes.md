# Design System & UI/UX Guidelines

## Design Philosophy

The Event Management System employs a **premium, modern design** with emphasis on:
- **Clarity**: Clear information hierarchy and intuitive navigation
- **Elegance**: Subtle animations and glass morphism effects
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Responsiveness**: Fluid layouts adapting to all screen sizes
- **Performance**: Optimized animations and efficient rendering

## Color Palette

### Primary Colors (Purple Gradient)
```css
primary-50:  #f5f3ff  /* Lightest background */
primary-100: #ede9fe  /* Light background */
primary-200: #ddd6fe  /* Subtle accents */
primary-300: #c4b5fd  /* Borders */
primary-400: #a78bfa  /* Interactive elements */
primary-500: #8b5cf6  /* Primary brand color */
primary-600: #7c3aed  /* Hover states */
primary-700: #6d28d9  /* Active states */
primary-800: #5b21b6  /* Deep accents */
primary-900: #4c1d95  /* Dark text */
```

### Secondary Colors (Pink Gradient)
```css
secondary-500: #d946ef  /* Accent highlights */
secondary-600: #c026d3  /* Secondary interactions */
secondary-700: #a21caf  /* Secondary active states */
```

### Neutral Colors
```css
gray-50:  #f9fafb  /* Light mode background */
gray-100: #f3f4f6  /* Card backgrounds */
gray-200: #e5e7eb  /* Borders */
gray-300: #d1d5db  /* Subtle text */
gray-400: #9ca3af  /* Placeholder text */
gray-500: #6b7280  /* Secondary text */
gray-700: #374151  /* Primary text */
gray-800: #1f2937  /* Headings */
gray-900: #111827  /* Dark mode background */
```

### Semantic Colors
```css
success:  #10b981  /* Success states */
warning:  #f59e0b  /* Warning states */
error:    #ef4444  /* Error states */
info:     #3b82f6  /* Information */
```

## Typography

### Font Families
- **Display**: Plus Jakarta Sans (headings, hero text)
- **Body**: Inter (paragraphs, UI elements)

### Type Scale
```css
text-xs:   0.75rem (12px)   /* Captions, labels */
text-sm:   0.875rem (14px)  /* Small text */
text-base: 1rem (16px)      /* Body text */
text-lg:   1.125rem (18px)  /* Emphasized text */
text-xl:   1.25rem (20px)   /* Subheadings */
text-2xl:  1.5rem (24px)    /* Section titles */
text-3xl:  1.875rem (30px)  /* Page titles */
text-4xl:  2.25rem (36px)   /* Hero headings */
text-5xl:  3rem (48px)      /* Large displays */
text-6xl:  3.75rem (60px)   /* Extra large */
```

### Font Weights
- **300**: Light (subtle text)
- **400**: Regular (body text)
- **500**: Medium (emphasized text)
- **600**: Semibold (subheadings)
- **700**: Bold (headings)
- **800**: Extra bold (hero text)

## Spacing System

Based on 4px grid:
```css
0:   0
1:   0.25rem (4px)
2:   0.5rem (8px)
3:   0.75rem (12px)
4:   1rem (16px)
6:   1.5rem (24px)
8:   2rem (32px)
12:  3rem (48px)
16:  4rem (64px)
24:  6rem (96px)
32:  8rem (128px)
```

## Elevation System

### Shadow Levels
```css
/* Level 1: Soft elevation (cards) */
shadow-soft: 
  0 2px 15px -3px rgba(0, 0, 0, 0.07),
  0 10px 20px -2px rgba(0, 0, 0, 0.04)

/* Level 2: Medium elevation (hover states) */
shadow-medium:
  0 4px 20px -2px rgba(0, 0, 0, 0.1),
  0 20px 40px -4px rgba(0, 0, 0, 0.06)

/* Level 3: High elevation (modals, popups) */
shadow-hard:
  0 10px 40px -5px rgba(0, 0, 0, 0.15),
  0 30px 60px -10px rgba(0, 0, 0, 0.1)

/* Glow effects */
shadow-glow: 0 0 20px rgba(139, 92, 246, 0.3)
shadow-glow-lg: 0 0 40px rgba(139, 92, 246, 0.4)
```

## Border Radius

```css
rounded-sm:   0.125rem (2px)   /* Subtle */
rounded:      0.25rem (4px)    /* Standard */
rounded-md:   0.375rem (6px)   /* Medium */
rounded-lg:   0.5rem (8px)     /* Large */
rounded-xl:   0.75rem (12px)   /* Extra large */
rounded-2xl:  1rem (16px)      /* Cards */
rounded-3xl:  1.5rem (24px)    /* Buttons */
rounded-full: 9999px           /* Circles */
```

## Glass Morphism Effect

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.7);  /* Semi-transparent white */
  backdrop-filter: blur(20px);            /* Blur background */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.07);
}

.glass-panel-dark {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## Animation Guidelines

### Duration
```css
duration-75:   75ms   /* Instant feedback */
duration-100:  100ms  /* Quick transitions */
duration-150:  150ms  /* Standard transitions */
duration-200:  200ms  /* Smooth transitions */
duration-300:  300ms  /* Pronounced effects */
duration-500:  500ms  /* Page transitions */
```

### Easing Functions
```css
ease-in:      cubic-bezier(0.4, 0, 1, 1)
ease-out:     cubic-bezier(0, 0, 0.2, 1)      /* Recommended for exits */
ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)    /* Recommended for enters */
```

### Micro-interactions
1. **Button Hover**: Scale 1.05, shadow increase, duration 200ms
2. **Card Hover**: Scale 1.02, shadow medium, duration 300ms
3. **Link Hover**: Color shift, underline, duration 150ms
4. **Input Focus**: Border color, ring glow, duration 200ms

### Page Transitions
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

## Component Patterns

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Enroll Now
</button>
```
- Gradient background (primary-600 to primary-700)
- White text, font-medium
- Shadow on hover, translate-y on click
- Glow effect on focus

#### Secondary Button
```tsx
<button className="btn-secondary">
  Cancel
</button>
```
- Gray background
- Darker on hover
- No shadow

#### Outline Button
```tsx
<button className="btn-outline">
  Learn More
</button>
```
- Transparent background
- Primary border
- Fill on hover

### Cards

#### Standard Card
```tsx
<div className="card">
  <h3>Title</h3>
  <p>Content</p>
</div>
```
- Glass panel background
- Rounded-2xl corners
- Soft shadow

#### Hover Card (Interactive)
```tsx
<div className="card-hover">
  <h3>Activity Title</h3>
  <p>Description</p>
</div>
```
- Scale 1.02 on hover
- Shadow medium on hover
- Cursor pointer

### Form Inputs

```tsx
<input
  type="text"
  className="input"
  placeholder="Enter your email"
/>
```
- Full width, padding 3
- Border-2, rounded-xl
- Focus: primary border + ring glow
- Error: red border + ring

### Badges

```tsx
<span className="badge-primary">Published</span>
<span className="badge-success">Enrolled</span>
<span className="badge-warning">Waitlisted</span>
<span className="badge-danger">Cancelled</span>
```

## Layout Patterns

### Homepage Hero
```tsx
<section className="min-h-screen flex items-center">
  <div className="container mx-auto px-4">
    <h1 className="text-6xl font-bold gradient-text">
      Discover Amazing Events
    </h1>
    <p className="text-xl text-gray-600 mt-4">
      Join activities, connect with peers, grow together
    </p>
    <button className="btn-primary mt-8">
      Explore Activities
    </button>
  </div>
</section>
```

### Activity Card Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {activities.map(activity => (
    <ActivityCard key={activity.id} {...activity} />
  ))}
</div>
```

### Dashboard Stats
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard title="Total Enrolled" value={stats.enrolled} icon={UsersIcon} />
  <StatCard title="Upcoming" value={stats.upcoming} icon={CalendarIcon} />
  <StatCard title="Completed" value={stats.completed} icon={CheckIcon} />
  <StatCard title="Waitlisted" value={stats.waitlisted} icon={ClockIcon} />
</div>
```

## Accessibility

### Focus States
- Always visible focus ring (ring-2 ring-primary-500)
- Keyboard navigation support (Tab, Enter, Escape)
- Skip to main content link

### ARIA Labels
```tsx
<button aria-label="Close dialog">
  <XMarkIcon />
</button>

<input
  aria-label="Search activities"
  aria-describedby="search-hint"
/>
```

### Semantic HTML
- Use `<main>`, `<nav>`, `<aside>`, `<article>`, `<section>`
- Proper heading hierarchy (h1 → h2 → h3)
- Descriptive link text (avoid "click here")

### Color Contrast
- Text on background: Minimum 4.5:1 ratio (WCAG AA)
- Large text: Minimum 3:1 ratio
- Test with color blindness simulators

## Dark Mode

### Implementation
```tsx
const { theme } = useThemeStore();

<div className={theme === 'dark' ? 'dark' : ''}>
  {/* Content */}
</div>
```

### Color Adjustments
- Background: white → gray-900
- Text: gray-900 → gray-100
- Cards: white/70 → gray-900/70
- Borders: gray-200 → gray-800

## Responsive Breakpoints

```css
sm:  640px   /* Small devices (phones landscape) */
md:  768px   /* Medium devices (tablets) */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

### Mobile-First Approach
```tsx
<div className="text-base md:text-lg lg:text-xl">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

## Performance Optimizations

1. **Lazy Loading**: Load images and components on demand
2. **Code Splitting**: Route-based code splitting with React.lazy
3. **Memoization**: Use React.memo for expensive components
4. **Debouncing**: Debounce search inputs (300ms)
5. **Virtualization**: For long lists (React Virtualized)
6. **Image Optimization**: WebP format, responsive images

## Component Library

Reusable components are located in:
```
src/components/
├── Auth/          # Authentication components
├── Layout/        # Layout components (Navbar, Footer)
├── Activity/      # Activity-related components
├── Dashboard/     # Dashboard components
├── Common/        # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   └── Skeleton.tsx
└── Icons/         # Custom icon components
```

## Testing

### Visual Regression Testing
- Use Chromatic or Percy
- Test across browsers (Chrome, Firefox, Safari, Edge)
- Test dark mode variants

### Accessibility Testing
- Use axe DevTools
- Keyboard-only navigation
- Screen reader testing (NVDA, JAWS)

---

**Design Philosophy**: "Simple, elegant, accessible. Every interaction should feel premium yet effortless."
