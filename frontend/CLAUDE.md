# CLAUDE.md — FrontEnd Manajemen Stock

## 1. Project Overview

- Name : FrontEnd Manajemen Stock
- Description : Modern inventory and expiry management dashboard for UMKM / small businesses with futuristic glassmorphism operational UI.
- Goal : Build a modern SaaS-style inventory system that helps users manage stock, monitor product expiry, track batches, and analyze restocking needs efficiently with a simple, fast, and immersive UX.
- Target Users: UMKM owners, warehouse admins, and small store operators with non-technical backgrounds.
- Version : v1.0.0
- Status : Active development

---

## 2. Tech Stack

- Language: JavaScript
- Frontend Framework: Next.js 15 App Router
- Styling: Tailwind CSS
- Backend Framework: Node.js + Express.js
- Database: PostgreSQL melalui Supabase
- ORM: Prisma ORM
- Auth: JWT + bcrypt
- API Testing: Thunder Client
- Upload: Cloudinary melalui backend
- Package Manager: npm
- Frontend Deployment: Vercel
- Backend Deployment: Railway

---

## 3. Commands

```bash
# Development
pnpm run dev
pnpm run build
pnpm run start
pnpm run lint
pnpm run format

# Package Management
pnpm add [package]

# Testing
pnpm run test
pnpm run test:unit
pnpm run test:e2e

# Database
pnpm run db:migrate
pnpm run db:seed
pnpm run db:reset
```

Rules:
- Always use pnpm
- Never use npm or yarn

---

## 4. Project Structure

Architecture: feature-based architecture

```bash
root/
  src/
    app/              # Next.js app router pages and layouts
    components/       # Shared reusable UI components
    features/         # Feature-based modules
    services/         # API calls and external services
    lib/              # Utilities, helpers, configs
    hooks/            # Custom hooks
    store/            # Zustand global stores
    types/            # Global TypeScript types
    styles/           # Global styles and design tokens
    constants/        # Static constants
  public/             # Public static assets
  prisma/             # Prisma schema and migrations
```

File placement rules:
- Reusable UI components → `src/components`
- Feature-specific components → `src/features`
- Business logic → `src/services`
- TypeScript types → `src/types`
- Utility/helper functions → `src/lib`
- Global state → `src/store`
- Do not create new folders without confirmation

---

## 5. Naming Conventions

```bash
# Files and Folders
Components      : PascalCase
Non-components  : camelCase
Folders         : kebab-case
Pages           : page.tsx
Layouts         : layout.tsx
Test files      : [name].test.ts

# Inside Code
Variables       : camelCase
Constants       : UPPER_SNAKE_CASE
Functions       : camelCase
Types           : PascalCase
Enums           : PascalCase
CSS Classes     : kebab-case

# Git Branch
feat/[feature-name]
fix/[bug-name]
refactor/[name]
hotfix/[name]
```

---

## 6. Code Conventions

```bash
# Coding Principles
- Use clean code, DRY, and SOLID principles
- Prioritize readability over short code
- Avoid duplicated logic

# TypeScript
- Strict mode enabled
- Never use any
- Explicit return types required
- Use interface for objects
- Use type for unions/intersections

# Import Order
1. External libraries
2. Internal absolute imports
3. Relative imports
4. Types/interfaces
5. Styles/assets

# Export Pattern
- Use named export
- Default export only for page.tsx and layout.tsx

# Error Handling
- Always use try-catch for async logic
- Never ignore errors
- Use clear and meaningful error messages
```

---

## 7. Component Rules

```bash
# Component Structure
1. Imports
2. Types/interfaces
3. Component definition
4. Hooks
5. Handlers/functions
6. JSX
7. Export

# Props Rules
- Explicit prop typing required
- Use default values for optional props
- Maximum 8 props per component

# Next.js Rules
- Default to Server Components
- Use 'use client' only when necessary:
  - hooks
  - event handlers
  - browser APIs
  - unsupported SSR libraries

# Component Splitting
- Extract reusable logic/components
- Keep feature-specific UI local to feature folder
```

---

## 8. Styling Rules

```bash
# Styling Approach
- Use Tailwind CSS
- Avoid inline styles
- Never use !important

# Tailwind Rules
- Use utility classes directly
- Use cn() utility for conditional classNames
- Extract repeated styles into reusable components

# Responsive
- Mobile-first design
- Breakpoints:
  sm: 640px
  md: 768px
  lg: 1024px
  xl: 1280px

# Dark Mode
- Use dark: classes
- Every component must support dark mode

# Design Tokens
- Use CSS variables
- Never hardcode colors
- Use tokens from globals.css
```

---

## 9. API & Data Fetching Rules

```bash
# Fetching Rules
- Server fetch for initial/static data
- Client fetch for interactive data
- Use React Query for client fetching
- Never use useEffect for fetching

# API Response Format
{
  success: boolean,
  data: T | null,
  message: string
}

# API Error Handling
- Use try-catch
- Return proper status codes
- Never expose server errors in production

# Fetch Function Location
- Store API logic in services/
- Never fetch directly inside components

# Environment
- Use env variables for URLs and secrets
- Never hardcode secrets
```

---

## 10. State Management Rules

```bash
# State Hierarchy
1. useState
2. lifted state
3. Zustand global state

# Use Global State For
- auth user
- sidebar state
- theme
- inventory filters
- persisted dashboard preferences

# Zustand Rules
- One store per domain
- Use selectors
- Avoid unnecessary global state
- Do not store derived values

# Context Rules
- Use for theme/config only
- Do not use Context for frequently changing state
```

---

## 11. Performance Rules

```bash
# Code Splitting
- Use dynamic imports for heavy components
- Lazy load rarely used pages

# Image Optimization
- Always use next/image
- Define width and height
- Use WebP or AVIF

# Optimization
- Use useMemo/useCallback when needed
- Avoid premature optimization

# Bundle Size
- Import only required modules

# Next.js
- Prefer Server Components
- Use ISR when needed
- Avoid unnecessary client-side rendering
```

---

## 12. Git Rules

```bash
# IMPORTANT
- Commit every completed change immediately

# Commit Format
feat:
fix:
refactor:
style:
docs:
test:
chore:

# Examples
feat: add expiry priority board UI
fix: resolve mobile sidebar overflow
refactor: extract reusable inventory card

# Rules
- Never commit .env
- One focused commit per task
- Never combine unrelated changes
```

---

## 13. Features

```bash
# Completed
- [x] Basic project setup
- [x] Design system setup

# In Progress — do not modify without confirmation
- [ ] Dashboard UI
- [ ] Expiry Priority Board
- [ ] Product Management
- [ ] Inventory Transactions

# Planned
- [ ] EOQ Analysis
- [ ] Smart Excel Import
- [ ] Shelf Label Generator
- [ ] Inventory Reports
- [ ] Analytics Dashboard
```

---

## 14. Testing

```bash
# Testing Approach
- Unit Testing
- Integration Testing
- Manual Testing

# Framework
- Vitest
- Playwright

# Must Test
- Utilities/helpers
- Inventory calculations
- API routes
- Critical reusable UI

# No Need To Test
- Simple presentational components
- Third-party libraries

# Test Naming
should [expected behavior] when [condition]

# Coverage
Minimum coverage: 80%
Priority:
business logic > API > UI
```

---

## 15. Design Language

### Design Style

The interface uses a futuristic glassmorphism operational dashboard style with dark zinc surfaces and electric lime accents.

Visual direction:
- modern SaaS dashboard
- futuristic operational system
- premium glassmorphism
- immersive dark UI
- compact & dense layout
- floating layered surfaces
- high readability for data-heavy interfaces

Inspirations:
- Linear
- Raycast
- Vercel
- modern analytics dashboards
- futuristic admin systems

Avoid:
- bootstrap/admin-template feeling
- colorful playful UI
- flat enterprise dashboard
- oversized spacing
- old-school tables

---

## 16. Color System

### Primary Accent

```css
#E1FF01
```

Character:
- electric lime
- futuristic
- aggressive
- high visibility

Usage:
- CTA buttons
- active navigation
- focused states
- charts
- highlights
- operational indicators

---

### Background Layers

```css
#18181B
#27272A
#3F3F46
#52525C
```

Characteristics:
- dark zinc
- industrial
- modern
- immersive

Never use navy backgrounds.

---

### Neutral Colors

```css
#F4F4F3
#E4E4E7
```

Usage:
- text contrast
- overlays
- light surfaces
- modal content

---

### Semantic Colors

```css
Success : #22C55E
Warning : #F59E0B
Danger  : #EF4444
Info    : #38BDF8
```

---

### Text Opacity Scale

```css
text-primary   : rgba(255,255,255,0.96)
text-secondary : rgba(255,255,255,0.72)
text-muted     : rgba(255,255,255,0.48)
text-disabled  : rgba(255,255,255,0.28)
```

---

## 17. Typography Rules

### Font Stack

Heading:
- Sora

Body:
- DM Sans

Technical / Labels:
- JetBrains Mono

---

### Typography Feel

The typography should feel:
- modern
- geometric
- compact
- readable
- premium

Use:
- bold large KPI numbers
- compact operational labels
- strong hierarchy

Avoid:
- decorative typography
- thin unreadable text
- excessive font sizes

---

## 18. Glassmorphism Rules

### Glass Style

Glass surfaces must use:
- backdrop blur
- low transparency
- soft border
- subtle glow
- floating elevation

Example:

```css
background: rgba(255,255,255,0.04);
backdrop-filter: blur(18px);
border: 1px solid rgba(255,255,255,0.08);
```

---

### Important Rules

Glassmorphism is used as:
- depth system
- hierarchy enhancement
- premium visual layer

NOT as excessive decoration.

Avoid:
- too much transparency
- unreadable text
- excessive blur
- heavy glow everywhere

Readability is always the highest priority.

---

## 19. Component Design Rules

### Cards

Cards should feel:
- floating
- layered
- premium
- compact

Use:
- glass surface
- subtle glow
- rounded corners
- soft shadow

---

### Buttons

Primary buttons:
- electric lime background
- dark text
- subtle glow

Secondary buttons:
- dark glass surface
- muted border

Ghost buttons:
- transparent
- hover overlay

---

### Inputs

Inputs should use:
- dark elevated surfaces
- lime focus ring
- compact spacing
- clean typography

Avoid:
- bright white inputs
- heavy borders
- sharp corners

---

### Dashboard

Dashboard should feel like:
> a futuristic inventory command center

Characteristics:
- floating stat cards
- layered sections
- immersive depth
- compact information layout
- operational readability

Priority visibility:
1. Expired products
2. Expiring soon
3. Low stock
4. Inventory health
5. Analytics

Users must understand inventory condition within seconds.

---

## 20. Motion Rules

Animations should feel:
- smooth
- lightweight
- responsive
- elegant

Use:
- hover lift
- glow transition
- fade blur
- smooth slide

Avoid:
- flashy motion
- aggressive bounce
- long animations

---

## 21. UX Principles

The UI must prioritize:
- fast readability
- operational efficiency
- low cognitive load
- mobile-first usability
- compact but breathable layout

The interface should help non-technical users:
- understand stock conditions quickly
- identify urgent inventory problems
- perform actions with minimal clicks

---

## 22. CSS Design Tokens

```css
:root {

/* Background */
--bg-base: #18181B;
--bg-surface: #27272A;
--bg-elevated: #3F3F46;
--bg-overlay: #52525C;

/* Primary */
--primary-300: #F0FF73;
--primary-400: #E9FF3D;
--primary-500: #E1FF01;
--primary-600: #C7E600;

/* Neutral */
--neutral-100: #F4F4F3;
--neutral-200: #E4E4E7;

/* Semantic */
--success-500: #22C55E;
--warning-500: #F59E0B;
--danger-500: #EF4444;
--info-500: #38BDF8;

/* Text */
--text-primary: rgba(255,255,255,0.96);
--text-secondary: rgba(255,255,255,0.72);
--text-muted: rgba(255,255,255,0.48);
--text-disabled: rgba(255,255,255,0.28);

/* Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 20px;
--radius-full: 9999px;

}
```

---

## 23. Do Not

```bash
# IMPORTANT
- If requirements are unclear, ASK FIRST before coding

# Structure
- Do not create folders without confirmation
- Do not remove files
- Do not move files
- Do not restructure the project

# Code
- Never use any
- Never hardcode secrets
- Never install packages without confirmation
- Never modify working features without clear instruction

# Forbidden Patterns
- No useEffect for data fetching
- No inline styles unless dynamic
- No Bootstrap
- No Material UI
- No jQuery

# Database
- Never modify production data
- Never create migrations without confirmation
- Never expose DB credentials

# Security
- Never expose API keys
- Never skip validation
- Never skip API error handling
```

---

## 24. Environment Variables

```bash
# Setup
- Copy .env.example to .env.local
- Never commit .env files

# Public Variables
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_URL

# Server Variables
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL

# Optional Services
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```