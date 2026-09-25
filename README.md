# 🚗 CampusRide - College Carpooling & Ride Sharing Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-v5-646CFF.svg)](https://vitejs.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android%2FiOS-119EFF.svg)](https://capacitorjs.com/)

**CampusRide** is a full-stack, mobile-friendly carpool and ride-sharing platform custom-tailored for college students, staff, and faculty across Indian universities. It offers smart route matching, verified student profiles, real-time messaging, split-fare UPI contributions, environmental impact tracking, and cross-platform mobile app support.

---

## ✨ Key Features

- 🚘 **Offer & Request Rides**: Easily publish available seats in your car or bike, or search for upcoming rides matching your campus schedule.
- 🎓 **Verified Student Network**: University email & student ID verification system ensuring safety and security within campus communities.
- ⚡ **Real-Time Match Score**: Intelligent matching algorithm considering route proximity, schedule, vehicle type, and gender preferences.
- 💬 **In-App Live Chat**: Real-time Socket.io-powered messaging between ride drivers and passengers.
- 💳 **Seamless Fare Sharing & UPI Payments**: Automatic fare calculation based on distance/vehicle type with built-in UPI payment QR/Modal and receipt generation.
- 🛡️ **Safety Center & Gender Selection**: Option to filter for female-only/male-only rides, Emergency SOS triggers, and report/feedback systems.
- 🌿 **Environmental Impact Dashboard**: Track collective CO₂ offset, fuel saved, and campus green points earned per ride.
- 📲 **Cross-Platform & Live OTA Updates**: Available as a web app and native Android/iOS mobile apps via Capacitor with instant Live OTA frontend updates.
- 📊 **Admin Moderation Portal**: Dashboard for managing users, approving student verifications, moderating rides, and viewing real-time platform statistics.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Dark Theme (`#0B0F17`)
- **Icons & Animations**: Lucide React, GSAP
- **Real-time Client**: Socket.IO Client
- **Mobile Integration**: Capacitor JS (Android & iOS)

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & Bcrypt password hashing
- **Real-time Server**: Socket.IO
- **Services**: Nodemailer (Email verification & notifications)

---

## 📂 Project Structure

```text
campusride/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & Manifest
│   ├── src/
│   │   ├── components/         # Reusable UI Components & Modals
│   │   ├── context/            # Auth & Notification Context Providers
│   │   ├── hooks/              # Custom React Hooks
│   │   ├── pages/              # App Pages & Admin Dashboard
│   │   ├── services/           # Axios API Client & Endpoints
│   │   └── utils/              # Date & Helper Utilities
│   ├── capacitor.config.json   # Capacitor Configuration
│   └── vite.config.js          # Vite Build Settings
├── server/                     # Backend Application (Node + Express)
│   ├── src/
│   │   ├── config/             # DB & Server Configs
│   │   ├── controllers/        # API Controller Logic
│   │   ├── middleware/         # Auth, Admin & Error Middleware
│   │   ├── models/             # Mongoose Schemas
│   │   ├── routes/             # Express API Routes
│   │   ├── services/           # Email, SMS & Matching Logic
│   │   └── sockets/            # Socket.IO Event Handlers
├── package.json                # Root Concurrently Script Runner
└── README.md                   # Project Documentation
```

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [npm](https://www.npmjs.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/pandey07anu-prog/campusride.git
cd campusride
```

### 2. Configure Environment Variables

#### Backend (`server/.env`)
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/campusride
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

#### Frontend (`client/.env`)
Create a `.env` file in the `client` directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install Dependencies & Run Development Server

Run both client and server concurrently from the root folder:
```bash
# Install root dependencies
npm install

# Install client & server dependencies
cd client && npm install
cd ../server && npm install
cd ..

# Start both Client (Vite) and Server (Nodemailer/Express) simultaneously
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📱 Mobile App Builds (Android / iOS)

CampusRide uses Capacitor to convert the web app into native Android and iOS packages.

### Build Android APK / AAB
```bash
cd client
npm run build
npx cap sync android
npx cap open android
```
*For detailed Android build steps, see [`README-ANDROID.md`](./README-ANDROID.md).*

### Build iOS App
```bash
cd client
npm run build
npx cap sync ios
npx cap open ios
```
*For detailed iOS build steps, see [`README-IOS.md`](./README-IOS.md).*

---

## 🌐 Deployment

- **Frontend**: Configured for instant deployment on [Vercel](https://vercel.com) (see [`vercel.json`](./vercel.json)).
- **Backend**: Pre-configured for deployment on [Render](https://render.com) (see [`render.yaml`](./render.yaml)).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.