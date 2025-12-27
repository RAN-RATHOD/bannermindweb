# BannerMind Landing Page

A modern, professional landing page with 3D effects, smooth transitions, and interactive elements.

## ✨ Features

- 🎨 Professional color scheme with gradients (Indigo/Pink/Amber)
- 🎭 3D elements and animations using Three.js
- ✨ Smooth scroll transitions with GSAP
- 📱 Fully responsive design (mobile & desktop)
- 📧 Contact form with email integration (EmailJS)
- 🎠 Auto-sliding image gallery with smooth transitions
- 🚀 Modern React architecture
- 🎯 Magnetic button effects
- 🌊 Parallax scrolling effects
- 💫 Text reveal animations
- 🎪 3D rotation on scroll

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Set up EmailJS (for contact form):
   - Create an account at [EmailJS](https://www.emailjs.com/)
   - Create a service and template
   - Create a `.env` file in the root directory:
   ```
   REACT_APP_EMAILJS_SERVICE_ID=your_service_id
   REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
   REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
   REACT_APP_TO_EMAIL=your-email@example.com
   ```

3. Start development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## 📁 Project Structure

```
/src
  /components
    - Navbar.js          # Navigation bar
    - Hero.js            # Hero section with 3D sphere
    - Features.js         # Features showcase
    - ExamplesSlider.js   # Auto-sliding examples
    - Download.js         # Download section
    - Building.js         # "We're building" section
    - ContactForm.js      # Contact form with validation
    - Footer.js           # Footer component
  /utils
    - scrollEffects.js    # Scroll-based animations
  /App.js                 # Main app component
  /index.js               # Entry point
```

## 🛠️ Technologies Used

- **React 18** - UI framework
- **Three.js / React Three Fiber** - 3D graphics
- **GSAP (GreenSock)** - Advanced animations
- **@react-three/drei** - Three.js helpers
- **@emailjs/browser** - Email service integration

## 🎨 Color Scheme

- Primary: Indigo (#6366f1)
- Secondary: Pink (#ec4899)
- Accent: Amber (#f59e0b)
- Background: Dark slate (#0f172a)
- Surface: Dark slate light (#1e293b)

## 📝 Notes

- The contact form requires EmailJS setup to function
- Logo can be added to `/public` directory
- All images in examples slider are placeholders - replace with actual images
- The site is fully responsive and optimized for performance

## 🔧 Customization

- Colors can be changed in `/src/index.css` (CSS variables)
- Animation speeds can be adjusted in component files
- 3D sphere properties can be modified in `Hero.js`

