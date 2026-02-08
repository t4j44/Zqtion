# ZQTION - Awwwards-Level Scrollytelling Portfolio

A high-performance, cinematic portfolio website featuring scroll-linked canvas animations, parallax text overlays, and glassmorphic UI elements.

## ✨ Features

- **Scrollytelling Animation**: 117-frame image sequence scrubbed via scroll using HTML5 Canvas
- **Parallax Text Overlays**: Multi-layered text animations with Framer Motion
- **Glassmorphism Design**: Modern glass-effect UI cards with subtle hover animations
- **High Performance**: Canvas-based rendering with optimized image preloading
- **Responsive**: Mobile-first design that scales beautifully across all devices
- **Dark Aesthetic**: Professional dark theme with gradient accents

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Rendering**: HTML5 Canvas
- **Icons**: Lucide React
- **Deployment**: Vercel + Supabase

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Project Structure

```
├── app/
│   ├── globals.css          # Global styles & custom scrollbar
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page with scrollytelling
├── components/
│   ├── ScrollyCanvas.tsx    # Canvas-based image sequence scrubber
│   ├── ScrollOverlay.tsx    # Parallax text overlays
│   ├── ProjectsGrid.tsx     # Featured projects grid
│   ├── Footer.tsx           # Enhanced footer
│   └── SmoothScroll.tsx     # Smooth scroll wrapper
├── public/
│   └── sequence/            # 117 WebP animation frames
└── lib/
    └── supabase/            # Supabase client utilities
```

## 🎨 Key Components

### ScrollyCanvas
High-performance canvas renderer that:
- Preloads all 117 frames on mount
- Maps scroll progress (0-1) to frame index
- Uses `object-fit: cover` logic for responsive sizing
- Handles window resize and device pixel ratio

### ScrollOverlay
Parallax text sections that:
- Fade in/out at specific scroll positions
- Move at different speeds relative to scroll
- Create depth and narrative flow

### ProjectsGrid
Modern project showcase with:
- Glassmorphic card design
- Gradient orb effects
- Hover animations
- Tech stack badges

## 🎯 Optimization Features

1. **Image Preloading**: All frames loaded before animation starts
2. **Canvas Rendering**: Faster than DOM-based solutions
3. **Device Pixel Ratio**: Sharp rendering on retina displays
4. **Lazy Loading**: Content below fold loads on demand
5. **Vercel-Optimized**: ISR, Edge Functions, Analytics ready

## 🌐 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or push to GitHub and import in Vercel dashboard.

### Supabase Setup

1. Create project at [supabase.com](https://supabase.com)
2. Copy credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🎬 Animation Details

- **Total Frames**: 117 WebP images
- **Frame Rate**: ~15fps (0.067s delay)
- **Scroll Height**: 500vh (5x viewport height)
- **Trigger**: `useScroll` from Framer Motion
- **Rendering**: Canvas 2D context

## 🎨 Design System

### Colors
- Background: `#0a0a0a`
- Text: `#ffffff` with opacity variants
- Accents: Gradient overlays (purple, blue, orange, green)

### Typography
- Font: Inter (Google Fonts)
- Weights: 100-900
- Tracking: Tight for headers, wide for labels

### Effects
- Glassmorphism: `backdrop-blur` + low opacity backgrounds
- Gradient Orbs: Large blurred radial gradients
- Smooth Transitions: 300-500ms cubic-bezier

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🔧 Customization

### Update Animation Frames

Replace files in `/public/sequence/` with your own sequence. Update `FRAME_COUNT` in `ScrollyCanvas.tsx`.

### Modify Scroll Speed

Change `height: 500vh` in `ScrollyCanvas.tsx` to adjust scroll duration.

### Customize Text Overlays

Edit fade/position timings in `ScrollOverlay.tsx` via `useTransform` ranges.

### Add Projects

Update the `projects` array in `ProjectsGrid.tsx` with your work.

## 🐛 Troubleshooting

**White flashes during scroll**: Images not preloaded. Check browser console for 404s.

**Slow performance**: Reduce frame count or image dimensions.

**Canvas not rendering**: Check browser DevTools for canvas size and image loading.

## 📄 License

MIT License - feel free to use this for your portfolio!

## 🤝 Credits

Built with modern web technologies and inspired by Awwwards-winning sites.

---

**Made by ZQTION** | Creative Developer | Execution, Automated
