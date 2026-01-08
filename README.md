# BannerMind 🎨

A modern, professional landing page for an AI-powered banner creation platform. Features stunning 3D effects, smooth animations, dark/light theme support, and a full backend API.

![BannerMind](https://img.shields.io/badge/BannerMind-AI%20Banner%20Creator-8b5cf6)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)

## 🌐 Live Demo

- **Website**: [bannermind.onrender.com](https://bannermind.onrender.com)
- **API**: [bannermind1.onrender.com](https://bannermind1.onrender.com)

---

## ✨ Features

### Frontend
- 🎨 Professional color scheme with gradients (Purple/Pink)
- 🌓 **Dark/Light theme** with system preference detection
- 🎭 3D elements and animations using Three.js
- ✨ Smooth scroll transitions with GSAP
- 📱 Fully responsive design (mobile & desktop)
- 🎠 Auto-sliding image gallery
- 🚀 Modern React architecture
- 🎯 Magnetic button effects
- 🌊 Parallax scrolling effects

### Backend
- 📧 **Contact Form** with email notifications (Resend API)
- 🔔 **Launch Notifications** - Email-based subscriber list
- 🗄️ MongoDB database for data persistence
- 🔒 Rate limiting and security headers
- ✉️ Beautiful HTML email templates

---

## 🏗️ Project Structure

```
bannerMind1/
├── src/                          # React Frontend
│   ├── components/
│   │   ├── Navbar.js             # Navigation with theme toggle
│   │   ├── Hero.js               # Hero section with 3D sphere
│   │   ├── Features.js           # Features showcase
│   │   ├── ExamplesSlider.js     # Auto-sliding examples
│   │   ├── ContactForm.js        # Contact form
│   │   ├── NotifyModal.js        # Email notification signup
│   │   └── Footer.js             # Footer component
│   ├── utils/
│   │   └── scrollEffects.js      # Scroll-based animations
│   ├── App.js
│   └── index.css                 # CSS variables & themes
│
├── backend/                      # Node.js Backend
│   ├── models/
│   │   ├── Contact.js            # Contact form submissions
│   │   └── LaunchSubscriber.js   # Email subscribers
│   ├── routes/
│   │   ├── contact.js            # POST /api/contact
│   │   └── launchNotify.js       # POST /api/launch-notify
│   ├── services/
│   │   └── emailService.js       # Resend email integration
│   ├── scripts/
│   │   └── sendLaunchEmails.js   # Bulk launch email sender
│   └── server.js                 # Express server
│
├── package.json                  # Frontend dependencies
└── render.yaml                   # Render deployment config
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Resend account (for emails)

### 1. Clone & Install

```bash
git clone https://github.com/gayatrimundada/bannermind.git
cd bannerMind1

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Setup

**Frontend** (`.env` in root):
```env
REACT_APP_API_URL=http://localhost:5000
```

**Backend** (`backend/.env`):
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bannermind

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM_NAME=BannerMind
EMAIL_FROM_ADDRESS=onboarding@resend.dev

# Admin
ADMIN_EMAIL=contact@bannermind.in
ADMIN_API_KEY=your-secret-admin-key
```

### 3. Run Development

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm start
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

## 📧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/contact` | POST | Submit contact form |
| `/api/launch-notify` | POST | Subscribe email for launch |
| `/api/launch-notify/stats` | GET | Subscription stats (admin) |
| `/api/launch-notify/subscribers` | GET | List subscribers (admin) |

### Example: Subscribe for launch notification

```bash
curl -X POST https://bannermind1.onrender.com/api/launch-notify \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## 🚀 Deployment (Render)

### Backend (Web Service)

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (see above)

### Frontend (Static Site)

1. Create new **Static Site** on Render
2. Connect your GitHub repo
3. Settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add redirect rule: `/* → /index.html` (Rewrite)

---

## 📨 Sending Launch Emails

When you're ready to launch, send "We are live!" emails to all subscribers:

```bash
cd backend

# Preview (dry run)
node scripts/sendLaunchEmails.js

# Actually send emails
node scripts/sendLaunchEmails.js --send

# Check stats
node scripts/sendLaunchEmails.js --stats
```

---

## 🎨 Theme Customization

CSS variables in `src/index.css`:

```css
:root {
  /* Dark theme (default) */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f8fafc;
  --primary-color: #8b5cf6;
  --secondary-color: #ec4899;
}

[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
}
```

---

## 🛠️ Technologies

### Frontend
- **React 18** - UI framework
- **Three.js / React Three Fiber** - 3D graphics
- **GSAP** - Advanced animations
- **@react-three/drei** - Three.js helpers

### Backend
- **Express.js** - Web framework
- **MongoDB / Mongoose** - Database
- **Resend** - Email API
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting

---

## 📝 Environment Variables Reference

### Frontend
| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API URL |

### Backend
| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM_NAME` | Sender name |
| `EMAIL_FROM_ADDRESS` | Sender email |
| `ADMIN_EMAIL` | Admin notification email |
| `ADMIN_API_KEY` | Admin API authentication |

---

## 📄 License

MIT © BannerMind

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request
