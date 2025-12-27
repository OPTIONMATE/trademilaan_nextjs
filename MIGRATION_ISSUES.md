# Next.js Migration Issues Report

## Critical Issues Found (Must Fix)

### 1. **React Router Dependencies** ❌
**Files Affected:**
- `src/app/components/Navbar.jsx` (line 3)
- `src/app/components/ui/Navbar-menu.jsx` (line 3)
- `src/app/components/Footer.jsx` (line 2)
- `src/app/components/Cards.jsx` (line 2)
- `src/app/components/BackgroundRipple.jsx` (line 3)

**Issue:** Using `react-router-dom` imports (`NavLink`, `Link`, `useLocation`)

**Why it's a problem:** Next.js has its own routing system. React Router is incompatible with Next.js App Router.

**Fix Required:**
- Replace `import { Link } from 'react-router-dom'` with `import Link from 'next/link'`
- Replace `import { NavLink } from 'react-router-dom'` with `import Link from 'next/link'`
- Replace `import { useLocation } from 'react-router-dom'` with `import { usePathname } from 'next/navigation'`
- Update component syntax from `<Link to="/path">` to `<Link href="/path">`
- Update `NavLink` logic to use `usePathname()` for active state

**Missing Dependency:** Need to install `react-router-dom` first OR remove it (recommended)

---

### 2. **Inconsistent Animation Library Imports** ⚠️
**Issue:** Using both `framer-motion` AND `motion/react`

**Files using `framer-motion`:**
- `src/app/components/Footer.jsx`
- `src/app/components/Cards.jsx`
- `src/app/components/BackgroundRipple.jsx`
- `src/app/components/TextPara.jsx`
- `src/app/components/StaggeredText.jsx`
- `src/app/components/StaggeredLines.jsx`
- `src/app/components/investor/RightsOfInvestors.jsx`

**Files using `motion/react`:**
- `src/app/components/ui/Navbar-menu.jsx`

**Why it's a problem:** Inconsistent imports can cause bundling issues and confusion. Need to standardize on one.

**Fix Required:** Choose either `framer-motion` or `motion/react` (likely `framer-motion`) and update all files to use the same import. Also ensure the package is installed in package.json.

---

### 3. **Incorrect Page Structure** ❌
**Issue:** Page components in `src/app/pages/` folder

**Files:**
- `src/app/pages/Home.jsx`
- `src/app/pages/ContactPage.jsx`
- `src/app/pages/DisclaimerPage.jsx`
- `src/app/pages/InvestorCharterPage.jsx`
- `src/app/pages/MITCPage.jsx`

**Why it's a problem:** In Next.js App Router, pages should be in route folders as `page.js/jsx`, not in a `pages/` subdirectory.

**Current Structure (Wrong):**
```
src/app/
  pages/
    Home.jsx
    ContactPage.jsx
```

**Expected Next.js Structure:**
```
src/app/
  page.jsx              (Home page - root)
  contact/
    page.jsx            (Contact page)
  disclaimer-disclosure/
    page.jsx
  investor-charter/
    page.jsx
  mitc/
    page.jsx
```

**Fix Required:** Restructure routing to follow Next.js App Router conventions.

---

### 4. **Navbar Placement Issue** ❌
**File:** `src/app/layout.js`

**Issue:** Navbar is placed inside `<html>` but outside `<body>`
```jsx
<html lang="en">
  <Navbar />  {/* ← Wrong position */}
  <body>
    {children}
  </body>
</html>
```

**Why it's a problem:** HTML specification requires all visible content to be inside `<body>`. This will cause hydration errors and invalid HTML.

**Fix Required:** Move `<Navbar />` inside `<body>`

---

### 5. **Missing Dependencies** ❌
**Not in package.json:**
- `react-router-dom` (currently imported but not installed - will cause build failure)
- `framer-motion` or `motion` package (currently imported but not installed)
- `clsx` or similar utility (used in `@/lib/utils.js` - need to verify)

**Fix Required:** Either:
1. Remove react-router-dom imports and replace with Next.js equivalents (recommended)
2. Install missing animation library packages

---

### 6. **Client Component Directives Missing** ⚠️
**Files that likely need `"use client"`:**
- All components using hooks (`useState`, `useEffect`, `useRef`)
- Components with event handlers (`onClick`, etc.)
- Components using animations

**Currently marked correctly:**
- ✅ `src/app/components/Navbar.jsx` (has "use client")
- ✅ `src/app/components/BackgroundRipple.jsx` (has "use client")

**Missing "use client" (likely needed):**
- `src/app/components/ui/Navbar-menu.jsx` (uses hooks)
- `src/app/components/ContactForm.jsx` (uses useState)
- `src/app/components/ui/background-ripple-effect.jsx` (uses hooks)
- Most components using framer-motion

**Fix Required:** Add `"use client"` directive at the top of all interactive components.

---

### 7. **Incorrect Import Paths** ⚠️
**File:** `src/app/pages/Home.jsx`

**Issue:** Using `@/components/` alias
```jsx
import TextPara from '@/components/TextPara'
import { BackgroundRipple } from '@/components/BackgroundRipple'
```

**Why it's a problem:** Components are in `src/app/components/`, not `src/components/`. The alias might not resolve correctly.

**Fix Required:** Either:
1. Update import paths to `@/app/components/` OR
2. Move components to `src/components/` (more conventional for shared components)

---

## Moderate Issues

### 8. **Using Regular `<img>` Instead of `next/image`** ℹ️
**File:** `src/app/components/Navbar.jsx` (line 21)

```jsx
<img src="/trademilaan.png" alt="Trademilaan Logo" className="h-6 w-6 md:h-8 md:w-8" />
```

**Why it's an issue:** Next.js `Image` component provides automatic optimization, lazy loading, and better performance.

**Recommendation:** Replace with:
```jsx
import Image from 'next/image'
<Image src="/trademilaan.png" alt="Trademilaan Logo" width={32} height={32} className="h-6 w-6 md:h-8 md:w-8" />
```

---

### 9. **Unnecessary React Imports** ℹ️
In React 19 and Next.js, you don't need `import React from 'react'` anymore.

**Files with unnecessary imports:**
- Most component files

**Fix:** Can be removed for cleaner code (optional).

---

### 10. **Layout Metadata Issue** ℹ️
**File:** `src/app/layout.js`

```jsx
export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};
```

**Issue:** Generic placeholder metadata should be updated with actual project info.

**Recommendation:** Update to project-specific metadata.

---

## Summary of Required Actions

### Immediate (Breaking Issues):
1. ✅ **Remove/Replace react-router-dom** - Replace with Next.js routing
2. ✅ **Fix Navbar position in layout** - Move inside `<body>`
3. ✅ **Restructure pages folder** - Follow App Router conventions
4. ✅ **Install missing packages** - framer-motion, etc.
5. ✅ **Fix import paths** - Ensure @ alias works correctly

### High Priority:
6. ✅ **Add "use client" directives** - For all interactive components
7. ✅ **Standardize animation library** - Use consistent framer-motion imports

### Recommended:
8. ⚪ Replace `<img>` with `<Image>` for optimization
9. ⚪ Update metadata in layout.js
10. ⚪ Remove unnecessary React imports

---

## Testing Checklist

After fixes:
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Run `npm run dev` to check for build errors
- [ ] Test all navigation links work correctly
- [ ] Verify no hydration errors in console
- [ ] Check all animations work
- [ ] Test mobile menu functionality
- [ ] Verify all routes load correctly

---

**Note:** This migration requires careful testing. Start with the critical issues first, then test thoroughly before moving to moderate issues.
