# 📦 Components Reference

Quick reference guide for all components in the ZQTION portfolio.

---

## 🎬 ScrollyCanvas

**Location**: `components/ScrollyCanvas.tsx`

**Purpose**: Renders 117-frame image sequence on HTML5 Canvas, driven by scroll position.

### Props
None (self-contained)

### Key Features
- Preloads all 117 frames before animation starts
- Maps scroll progress (0-1) to frame index (0-116)
- Handles device pixel ratio for retina displays
- Responsive canvas sizing (`object-fit: cover` logic)
- Loading progress indicator

### Customization
```typescript
const FRAME_COUNT = 117  // Change frame count
const FRAME_PATH = '/sequence/frame_'  // Change path

// In JSX
style={{ height: '500vh' }}  // Adjust scroll duration
```

### Performance Notes
- Uses `useRef` to avoid re-renders
- Canvas rendering is GPU-accelerated
- Images cached in browser after first load

---

## 🎭 ScrollOverlay

**Location**: `components/ScrollOverlay.tsx`

**Purpose**: Parallax text layers that fade in/out over the canvas animation.

### Props
None (self-contained)

### Key Features
- 4 text sections with different fade timings
- Parallax Y-axis movement
- Framer Motion `useTransform` for smooth animations
- Scroll-triggered opacity changes

### Sections
```typescript
Section 1 (0-25%):   Hero - "ZQTION" + tagline
Section 2 (25-50%):  Philosophy - Left aligned
Section 3 (50-75%):  Approach - Right aligned
Section 4 (75-100%): Call to Action - Center
```

### Customization
```typescript
// Adjust fade timings
const section1Opacity = useTransform(
  scrollYProgress,
  [0, 0.15, 0.25],  // Change these values
  [1, 1, 0]
)

// Update text content
<h1>YOUR NAME</h1>
<p>Your tagline</p>
```

---

## 💎 ProjectsGrid

**Location**: `components/ProjectsGrid.tsx`

**Purpose**: Showcases featured projects in glassmorphic cards.

### Props
None (uses internal data array)

### Key Features
- 2-column responsive grid (1 col mobile)
- Glassmorphism design with backdrop blur
- Gradient orb backgrounds
- Hover scale animations
- Tech stack badges
- External link buttons

### Data Structure
```typescript
const projects = [
  {
    id: number
    title: string
    category: string
    description: string
    tech: string[]
    gradient: string  // Tailwind gradient classes
  }
]
```

### Customization
```typescript
// Add your projects
{
  id: 5,
  title: 'My Project',
  category: 'Web App',
  description: 'Description here',
  tech: ['React', 'Node.js'],
  gradient: 'from-indigo-500/20 to-purple-500/20',
}
```

### Gradient Options
```typescript
'from-purple-500/20 to-pink-500/20'    // Purple/Pink
'from-blue-500/20 to-cyan-500/20'      // Blue/Cyan
'from-orange-500/20 to-red-500/20'     // Orange/Red
'from-green-500/20 to-emerald-500/20'  // Green/Emerald
'from-yellow-500/20 to-amber-500/20'   // Yellow/Amber
'from-indigo-500/20 to-purple-500/20'  // Indigo/Purple
```

---

## 📊 ScrollIndicator

**Location**: `components/ScrollIndicator.tsx`

**Purpose**: Shows scroll progress bar and animated scroll hint.

### Props
None (self-contained)

### Key Features
- Fixed progress bar at top (full-width)
- Gradient progress fill (purple → pink → orange)
- Scroll hint at bottom (fades out when scrolling)
- Animated mouse icon with scroll indicator

### Customization
```typescript
// Change gradient colors
className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"

// Adjust fade timing
style={{
  opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0])
}}
```

---

## 🌊 SmoothScroll

**Location**: `components/SmoothScroll.tsx`

**Purpose**: Wrapper component for smooth scroll behavior.

### Props
```typescript
{
  children: ReactNode
}
```

### Usage
```tsx
<SmoothScroll>
  <YourComponents />
</SmoothScroll>
```

### Notes
- Sets `scroll-behavior: auto` to prevent conflicts
- Framer Motion handles smoothness

---

## 👣 Footer

**Location**: `components/Footer.tsx`

**Purpose**: Site footer with brand, links, and social icons.

### Props
None (self-contained)

### Key Features
- 3-column grid (1 col mobile)
- Brand section with logo
- Quick navigation links
- Social media icons
- Email contact
- Copyright notice

### Customization
```typescript
// Update email
href="mailto:your-email@example.com"

// Update social links
{ Icon: Twitter, href: 'https://twitter.com/yourhandle' }

// Update navigation
['Work', 'About', 'Services', 'Lab', 'Contact']
```

### Social Icons Available
- Twitter
- GitHub
- LinkedIn
- YouTube
- Mail

---

## 🛠 Utility Components

### Canvas Utils (`lib/canvas-utils.ts`)

```typescript
// Get frame URL
getFrameUrl(frameNumber: number): string

// Map scroll to frame
progressToFrame(progress: number, totalFrames: number): number

// Preload with callback
preloadImages(frameCount: number, onProgress?: Function): Promise<HTMLImageElement[]>
```

### Performance Utils (`lib/performance.ts`)

```typescript
// Log performance metrics
logPerformance(): void

// Monitor memory usage
logMemoryUsage(): void
```

---

## 🎨 Styling Conventions

### Glassmorphism Classes
```css
/* Light glass */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Heavy glass */
.glass-heavy {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

### Common Patterns
```tsx
// Gradient backgrounds
className="bg-gradient-to-br from-purple-500/20 to-pink-500/20"

// Gradient text
className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"

// Hover glow
className="hover:shadow-2xl hover:shadow-white/10"

// Smooth transitions
className="transition-all duration-300"
```

---

## 🔧 Common Modifications

### Change Animation Speed
**File**: `components/ScrollyCanvas.tsx`
```typescript
// Line ~101
style={{ height: '500vh' }}
// Change to: '400vh' (faster) or '600vh' (slower)
```

### Adjust Text Fade Timing
**File**: `components/ScrollOverlay.tsx`
```typescript
const section1Opacity = useTransform(
  scrollYProgress,
  [0, 0.15, 0.25],  // Start, peak, end
  [1, 1, 0]         // Opacity values
)
```

### Add New Project
**File**: `components/ProjectsGrid.tsx`
```typescript
const projects = [
  // ... existing projects
  {
    id: 5,
    title: 'New Project',
    category: 'Type',
    description: 'Description',
    tech: ['Tech1', 'Tech2'],
    gradient: 'from-color/20 to-color/20',
  }
]
```

### Update Footer Links
**File**: `components/Footer.tsx`
```typescript
// Email (line ~51)
href="mailto:your-email@example.com"

// Social (line ~54)
{ Icon: Twitter, href: 'https://twitter.com/you' }
```

---

## 📱 Responsive Behavior

All components are responsive using Tailwind breakpoints:

```
sm:  640px   (small mobile)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

### Common Patterns
```tsx
// Text sizing
className="text-4xl md:text-6xl"

// Grid columns
className="grid-cols-1 md:grid-cols-2"

// Padding
className="px-6 md:px-12"

// Positioning
className="left-8 md:left-20"
```

---

## 🎯 Performance Tips

1. **Images**: Keep frames under 200KB (WebP recommended)
2. **Frame Count**: 60-120 is optimal
3. **Scroll Height**: 400-600vh for smooth scrubbing
4. **Mobile**: Consider reducing frames on mobile
5. **Preloading**: Always preload before animation

---

## 🔗 Component Dependencies

```
ScrollyCanvas
├─ framer-motion (useScroll)
├─ React (useRef, useState, useEffect)
└─ /public/sequence/* (image assets)

ScrollOverlay
├─ framer-motion (useScroll, useTransform, motion)
└─ React (useRef)

ProjectsGrid
├─ framer-motion (motion variants)
└─ lucide-react (icons)

ScrollIndicator
├─ framer-motion (useScroll, useTransform, motion)
└─ React

Footer
├─ framer-motion (motion)
└─ lucide-react (icons)
```

---

## 📚 Related Files

- **Styles**: `app/globals.css`
- **Layout**: `app/layout.tsx`
- **Main Page**: `app/page.tsx`
- **Config**: `next.config.js`, `tailwind.config.ts`

---

**Quick Links:**
- [QUICKSTART.md](QUICKSTART.md) - Customization guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - System overview
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - What was built

---

**Last Updated**: February 2026
