# AquaCare Frontend - Setup & Development Guide

## 🎯 Overview

Fish & Shrimp Disease Detection App - Mobile-first progressive web application built with React, TypeScript, and Vite.

## ✨ Features Implemented

- 📸 **Camera & Gallery Upload** - Capture or select images for disease detection
- 🤖 **AI-Powered Disease Detection** - Real-time analysis with confidence scores
- 📊 **Scan History & Reports** - Track all previous scans with severity filters
- 📚 **Disease Library** - Comprehensive searchable database of diseases
- 👤 **User Profile Management** - Personalized user settings
- 🌐 **Multi-language Support** - English, Hindi (हिंदी), Telugu (తెలుగు)
- 🎨 **Animated UI** - Attractive gradient borders and loading animations
- 💾 **Local Storage** - Persistent data for history and preferences

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # Dashboard with action cards
│   │   ├── Scan.tsx              # Camera/gallery upload screen
│   │   ├── Result.tsx            # Detection results & advisory
│   │   ├── DiseaseLibrary.tsx    # Searchable disease list
│   │   ├── DiseaseDetail.tsx     # Individual disease info page
│   │   ├── History.tsx           # Scan history with filters
│   │   ├── Profile.tsx           # User settings & preferences
│   │   └── NotFound.tsx          # 404 page
│   ├── components/
│   │   └── ui/                   # Shadcn UI components
│   ├── services/
│   │   └── api.ts                # Backend API integration
│   ├── data/
│   │   └── diseaseLibrary.ts     # Disease information database
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles + animations
├── public/
├── .env.example                  # Environment variables template
├── vite.config.ts                # Vite configuration with proxy
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** or **Bun**
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install
# or if using Bun
bun install
```

### Development Server

```bash
# Start development server (http://localhost:8080)
npm run dev
# or
bun run dev
```

The app will automatically proxy API requests from `/api/*` to your backend at `http://localhost:8000`.

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` for production deployment:
```bash
VITE_API_URL=https://your-backend-domain.com
```

### Build for Production

```bash
npm run build
# Output: dist/ folder
```

## 🔌 Backend API Integration

### Endpoint: `/predict/`

**Request:**
```typescript
POST /predict/
Content-Type: multipart/form-data

Body: FormData with 'file' field containing image
```

**Response:**
```json
{
  "type": "Fish 🐟",
  "disease": "Fin Rot / Tail Rot",
  "confidence": 92.5,
  "severity": "High",
  "symptoms": "Damaged fins/tail, frayed edges, discoloration",
  "causes": "Bacteria, poor water, injuries, stress",
  "treatment": "Antibiotics, improve water quality, salt treatment",
  "prevention": "Clean environment, avoid fin damage, proper feeding"
}
```

### API Service (`services/api.ts`)

```typescript
import { predictDisease, checkHealth } from '@/services/api';

// Predict disease from image
const result = await predictDisease(imageFile);

// Check backend health
const health = await checkHealth();
```

## 🎨 Design System

### Color Palette
- **Primary**: Cyan (#06B6D4) and Blue (#0EA5E9)
- **Severity Colors**:
  - High: Red
  - Moderate: Yellow
  - Low: Green

### Animations
- **Animated Card Borders**: Gradient border flow animation
- **Loading State**: Blue/aqua pulse animation with text "Analyzing image…"

### CSS Classes (in `index.css`)
```css
.animated-border          /* Gradient border animation */
.loading-pulse           /* Pulse wave animation */
```

## 📱 App Screens

### 1. Home (Dashboard) - `/`
- App header with logo and profile icon
- Profile summary card with alert count
- Action cards: Scan, Upload, Reports, Library
- Disease library highlights (top 3)
- Recent scans preview
- Bottom navigation bar

### 2. Scan - `/scan`
- Camera capture button
- Gallery upload button
- Image preview
- Scan button with loading state
- Blue/aqua loading animation

### 3. Result - `/result`
- Uploaded image display
- Disease name & type
- Confidence score with progress bar
- Severity badge (color-coded)
- Advisory information:
  - Symptoms
  - Causes
  - Treatment (highlighted in blue)
  - Prevention (highlighted in green)
- Actions: Save, Share, Re-scan

### 4. Disease Library - `/disease-library`
- Search bar for diseases/symptoms
- Filter buttons: All, Fish, Shrimp
- Disease cards with:
  - Disease image placeholder
  - Name and type badge
  - Short description
  - Symptoms preview

### 5. Disease Detail - `/disease-library/:id`
- Disease image
- Full disease information
- Symptoms, causes, treatment, prevention

### 6. History - `/history`
- List of all previous scans
- Filters: All, High, Moderate, Low
- Each item shows:
  - Thumbnail image
  - Disease name
  - Date
  - Severity badge
- Click to view full result

### 7. Profile - `/profile`
- User avatar
- Name input
- Farm location input
- Language selector (English, Hindi, Telugu)
- Notification toggle
- Help & Support button
- Save changes button

## 💾 Local Storage

### Data Stored

1. **Scan History** (`scanHistory`)
```json
[
  {
    "id": "1234567890",
    "disease": "Fin Rot",
    "date": "2/23/2026",
    "severity": "High",
    "thumbnail": "data:image/jpeg;base64,...",
    "result": { /* full prediction result */ }
  }
]
```

2. **User Profile** (`userProfile`)
```json
{
  "name": "Farmer Name",
  "farmLocation": "City, State",
  "language": "english",
  "notifications": true
}
```

## 🔧 Development Tips

### Vite Proxy Configuration
The `vite.config.ts` includes API proxy:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

### Using API Service
```tsx
import { predictDisease } from '@/services/api';

const handleScan = async (file: File) => {
  try {
    const result = await predictDisease(file);
    console.log(result);
  } catch (error) {
    console.error('Scan failed:', error);
  }
};
```

## 📦 Key Dependencies

- `react` & `react-dom` - UI library
- `react-router-dom` - Navigation
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `@radix-ui/*` - Headless UI components (via shadcn)
- `class-variance-authority` - Component variants
- `@capacitor/core` & `@capacitor/android` - Mobile app support

## 🏗️ Build & Deploy

### Web Deployment
1. Build the app: `npm run build`
2. Deploy `dist/` folder to any static host (Vercel, Netlify, etc.)
3. Set environment variable for backend URL

### Android APK
See [BUILD_APK_INSTRUCTIONS.md](BUILD_APK_INSTRUCTIONS.md) for mobile app build steps.

## 🐛 Troubleshooting

### Backend Connection Issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS is enabled in backend
- Verify API endpoint is `/predict/`

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Check `tsconfig.json` for proper configuration

### Build Issues
- Clear cache: `rm -rf node_modules .vite && npm install`
- Check for TypeScript errors: `npm run build`

## 📝 Notes

- Backend is **NOT** modified - only frontend changes
- All data persistence uses localStorage (no database)
- Mobile-first responsive design
- PWA-ready architecture
- Camera API requires HTTPS in production

## 🔮 Future Enhancements

- Real-time WebSocket notifications
- Offline mode support
- Export reports as PDF
- Multi-farm management
- Water quality tracking integration
- Push notifications for alerts

---

**Project**: AquaCare - Fish & Shrimp Disease Detection System  
**Frontend Stack**: React + TypeScript + Vite + TailwindCSS  
**Backend**: FastAPI (Python)
