# Pepo Marketing Website

Modern, responsive marketing website for Pepo platform built with React + Vite + Tailwind CSS.

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Fast Performance**: Vite for instant HMR and optimized builds
- **React 18**: Latest React features and hooks
- **Client-side Routing**: React Router for seamless navigation
- **Beautiful UI**: Gradient accents, smooth animations, accessible components

## Pages

- **Home**: Hero section with feature highlights and CTA
- **About**: Mission, values, and team information
- **How It Works**: Step-by-step guide to using Pepo
- **NGO Registration**: Signup form for organizations

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd website
npm install
```

### Development

```bash
npm run dev
```

Starts dev server at `http://localhost:5173`

### Build

```bash
npm run build
```

Creates optimized production build in `dist/`

### Preview

```bash
npm run preview
```

Preview production build locally

## File Structure

```
website/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   ├── HeroSection.jsx
│   │   └── FeaturesSection.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── HowItWorksPage.jsx
│   │   └── NGORegistrationPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Styling

Uses Tailwind CSS with custom theme colors:
- Primary: Pepo Honey (#FDB927)
- Secondary: Pepo Nature (#7BC043)
- Trust: #2E7D32
- Engage: #1976D2

Custom animations:
- `fade-in`: Smooth opacity transition
- `slide-up`: Bottom-to-top entrance
- `float`: Subtle vertical bounce

## Deployment

Ready to deploy to:
- Vercel: `vercel deploy`
- Netlify: Connect GitHub repo
- Traditional hosting: Upload `dist/` folder contents

## Technologies

- React 18.2.0
- Vite 5.0.0
- Tailwind CSS 3.4.0
- React Router 6.20.0
- Lucide React (icons)
- PostCSS & Autoprefixer

## License

MIT
