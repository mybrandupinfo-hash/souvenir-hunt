# Souvenir Hunt

React + Vite frontend plus a Node.js/Express backend for Souvenir Hunt.

## Stack

- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Express
- MongoDB / Mongoose
- Stripe
- Nodemailer
- QRCode

## Main app files

- `src/App.jsx` - single-page app flow, content, and demo hunt logic
- `src/main.jsx` - React entry
- `src/index.css` - Tailwind entry and global styles
- `src/lib/gameSessionClient.js` - frontend API helper examples
- `server/app.js` - Express API, Stripe webhook, redeem endpoints
- `server/server.js` - backend entrypoint
- `server/models/GameSession.js` - MongoDB session schema
- `server/public/redeem.html` - mobile-friendly staff redeem page
- `.env.example` - environment variable template
- `tailwind.config.js` - vivid blue brand theme
- `vite.config.js` - Vite React config

## Features

- Apple-style bright UI with vivid blue accents
- Home, hunts, hunt details, checkout, resume, live hunt, and contact views
- Demo purchase flow with local storage persistence
- 24-hour access code logic
- Resume by code
- Seven-step live hunt interface
- Mobile menu and section navigation
- Stripe Checkout session endpoint
- Stripe webhook creates game sessions and emails access links
- MongoDB-backed game session storage
- QR-based pickup redemption with staff PIN protection
- Rate-limited answer endpoint

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

3. Start the frontend:

```bash
npm run dev
```

4. Start the backend:

```bash
npm run dev:server
```

5. Or run both together:

```bash
npm run dev:full
```

## Backend endpoints

- `POST /create-checkout-session`
- `POST /stripe/webhook`
- `POST /resume`
- `POST /answer`
- `GET /slide/:index`
- `GET /redeem`
- `GET /redeem-status?code=XYZ`
- `POST /redeem`
