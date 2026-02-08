# 🚀 Quick Start Guide - ZQTION Scrollytelling Portfolio

## What You Just Built

An **Awwwards-level** portfolio website featuring:
- ✨ 117-frame scroll-driven canvas animation
- 🎭 Parallax text overlays with Framer Motion
- 💎 Glassmorphic project cards
- 🌊 Smooth scroll interactions
- 📱 Fully responsive design

## 🎬 How It Works

### The Magic Stack
1. **Canvas Rendering**: 117 WebP frames in `public/sequence/`
2. **Scroll Trigger**: Framer Motion's `useScroll` maps scroll → frame
3. **Parallax Layers**: Multiple text layers fade/move at different speeds
4. **Performance**: Images preloaded before animation starts

### Key Files

```
components/
├── ScrollyCanvas.tsx     ← Canvas renderer (the engine)
├── ScrollOverlay.tsx     ← Parallax text layers
├── ProjectsGrid.tsx      ← Your project showcase
├── ScrollIndicator.tsx   ← Progress bar & scroll hint
└── Footer.tsx            ← Contact section
```

## 🎨 Customization Guide

### 1. Update Your Content

**Projects** - Edit [components/ProjectsGrid.tsx](components/ProjectsGrid.tsx):
```typescript
const projects = [
  {
    title: 'Your Project',
    category: 'Your Category',
    description: 'Your description',
    tech: ['Tech', 'Stack'],
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  // Add more...
]
```

**Text Overlays** - Edit [components/ScrollOverlay.tsx](components/ScrollOverlay.tsx):
```typescript
// Change the text in each section
<h1>YOUR NAME</h1>
<p>Your tagline</p>
```

**Footer Links** - Edit [components/Footer.tsx](components/Footer.tsx):
```typescript
href="mailto:your-email@example.com"
```

### 2. Adjust Animation Speed

In [components/ScrollyCanvas.tsx](components/ScrollyCanvas.tsx):
```typescript
// Make scroll longer (slower)
style={{ height: '600vh' }} // from 500vh

// Make scroll shorter (faster)
style={{ height: '400vh' }}
```

### 3. Change Colors

In [app/globals.css](app/globals.css):
```css
:root {
  --background: #0a0a0a; /* Change this */
}
```

In [components/ProjectsGrid.tsx](components/ProjectsGrid.tsx):
```typescript
gradient: 'from-your-color/20 to-another-color/20'
```

### 4. Replace Animation Frames

1. Export your video as image sequence (WebP or PNG)
2. Place in `public/sequence/`
3. Update frame count in `ScrollyCanvas.tsx`:
```typescript
const FRAME_COUNT = 117 // Your frame count
```

## 🌐 Deployment Checklist

- [ ] Create `.env.local` from `.env.example`
- [ ] Add Supabase credentials (if using database)
- [ ] Test locally: `npm run dev`
- [ ] Build: `npm run build`
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Add custom domain in Vercel dashboard
- [ ] Test on mobile devices

## 🎯 Performance Tips

1. **Images**: Keep frames under 200KB each (use WebP)
2. **Frame Count**: 60-120 frames is the sweet spot
3. **Scroll Height**: 400vh-600vh for smooth scrubbing
4. **Mobile**: Consider loading fewer frames on mobile
5. **Lazy Load**: Projects grid loads when visible

## 🐛 Common Issues

**Problem**: White flashes during scroll
- **Fix**: Check browser console - frames may not be loading
- **Verify**: All 117 files exist in `public/sequence/`

**Problem**: Animation too fast/slow
- **Fix**: Adjust `height: 500vh` in ScrollyCanvas.tsx

**Problem**: Canvas not rendering
- **Fix**: Check browser DevTools → Canvas element size
- **Verify**: Images loaded successfully (Network tab)

**Problem**: Build errors
- **Fix**: Run `npm install` again
- **Check**: All imports are correct

## 📱 Mobile Optimization

The site is mobile-responsive, but you can optimize further:

```typescript
// In ScrollyCanvas.tsx, reduce frames on mobile
const FRAME_COUNT = typeof window !== 'undefined' && window.innerWidth < 768 
  ? 60  // Mobile: every other frame
  : 117 // Desktop: all frames
```

## 🎨 Design Resources

- **Fonts**: Inter (Google Fonts) - already included
- **Icons**: Lucide React - already installed
- **Colors**: Use [uicolors.app](https://uicolors.app) for gradients
- **Inspiration**: [Awwwards.com](https://awwwards.com), [CodePen.io](https://codepen.io)

## 🚀 Next Steps

1. **Add Your Projects**: Update ProjectsGrid with real work
2. **Customize Text**: Change name, tagline, bio
3. **Add Contact Form**: Use Supabase or email service
4. **Analytics**: Add Vercel Analytics or Google Analytics
5. **SEO**: Update metadata in `layout.tsx`
6. **Social**: Add Open Graph images

## 💡 Pro Tips

- Use **Loom** or **screen recording** → export as sequence
- Try **Blender** or **After Effects** for 3D sequences
- Add **WebGL shaders** for even more wow factor
- Experiment with **different scroll speeds** per section
- Consider **sound effects** on scroll milestones

## 🤝 Support

- 📚 [README_SCROLLYTELLING.md](README_SCROLLYTELLING.md) - Full documentation
- 🚀 [DEPLOYMENT.md](DEPLOYMENT.md) - Vercel + Supabase guide
- 💬 Issues? Check browser console for errors

---

**You're ready to launch!** 🎉

Run `npm run dev` and scroll to see your masterpiece in action.

Built with ❤️ by ZQTION
