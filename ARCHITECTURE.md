# 🎨 DeepBlue Health - Visual Architecture

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Chat   │  │ Symptom  │  │  Vitals  │  │Emergency │   │
│  │Interface │  │ Checker  │  │Dashboard │  │   SOS    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   Next.js API Routes      │
        │  ┌─────────────────────┐  │
        │  │  /api/chat          │  │ ◄─── AI Conversation
        │  │  /api/analyze       │  │ ◄─── Symptom Analysis
        │  │  /api/iot/vitals    │  │ ◄─── Device Data
        │  │  /api/emergency     │  │ ◄─── Alert System
        │  │  /api/translate     │  │ ◄─── Languages
        │  └─────────────────────┘  │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   AI & Services Layer     │
        │  ┌─────────────────────┐  │
        │  │  Claude AI Engine   │  │ ◄─── Medical Reasoning
        │  │  Knowledge Graph    │  │ ◄─── Disease DB
        │  │  Voice Processing   │  │ ◄─── Speech APIs
        │  │  IoT Integration    │  │ ◄─── Device Streaming
        │  └─────────────────────┘  │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │     Data Storage          │
        │  ┌─────────────────────┐  │
        │  │  MongoDB/Postgres   │  │ ◄─── Health Records
        │  │  Session Store      │  │ ◄─── User Sessions
        │  │  File Storage       │  │ ◄─── Documents
        │  └─────────────────────┘  │
        └───────────────────────────┘
```

## 🔄 Data Flow Diagrams

### Symptom Analysis Flow
```
User Input (Voice/Text)
        │
        ▼
[Voice Recognition] ──► [Text Processing]
        │
        ▼
[Symptom Extraction]
        │
        ▼
[Medical AI Analysis] ◄──── [Knowledge Graph]
        │
        ▼
[Urgency Classification]
        │         ┌──────────────┐
        ├────────►│ Self-Care    │
        ├────────►│ Doctor Visit │
        └────────►│ Emergency!   │
        │         └──────────────┘
        ▼
[Generate Recommendations]
        │
        ▼
[Display Results + TTS]
```

### IoT Vitals Monitoring Flow
```
IoT Device (Smartwatch, BP Monitor, etc.)
        │
        ▼
[MQTT/WebSocket/Bluetooth]
        │
        ▼
[API Endpoint: /api/iot/vitals]
        │
        ▼
[Data Validation & Normalization]
        │
        ▼
[Store in Database] ──► [Historical Trends]
        │
        ▼
[Real-time Update to UI]
        │
        ▼
[Check Thresholds] ──► [Alert if Abnormal]
        │
        ▼
[Display in Dashboard]
```

### Emergency Alert Flow
```
User Clicks SOS Button
        │
        ▼
[Confirm Dialog]
        │
        ▼
[Get Geolocation]
        │
        ▼
[Gather Context]
    ├─► Current Symptoms
    ├─► Recent Vitals
    ├─► Medical History
    └─► Emergency Contacts
        │
        ▼
[Send to /api/emergency]
        │
        ├──────────────────────┐
        │                      │
        ▼                      ▼
[SMS to Contacts]    [Alert Emergency Services]
        │                      │
        ▼                      ▼
[Confirmation]         [Track Response]
```

## 🗂️ File Structure Breakdown

```
deepblue/
│
├── 📱 app/                          # Next.js App Directory
│   ├── 🎨 globals.css              # Global styles & animations
│   ├── 📄 layout.tsx               # Root layout with metadata
│   ├── 🏠 page.tsx                 # Main application page
│   │
│   └── 🔌 api/                     # Backend API Routes
│       ├── 💬 chat/
│       │   └── route.ts            # AI conversation endpoint
│       ├── 🔍 analyze/
│       │   └── route.ts            # Symptom analysis endpoint
│       ├── 🚨 emergency/
│       │   └── route.ts            # SOS alert system
│       ├── 📊 iot/
│       │   └── vitals/
│       │       └── route.ts        # IoT device data
│       └── 🌍 translate/
│           └── route.ts            # Translation service
│
├── 🧩 components/                   # React Components
│   ├── 💬 ChatInterface.tsx        # AI chat UI with voice
│   ├── 🔍 SymptomChecker.tsx       # Symptom analysis interface
│   ├── 📊 VitalsDashboard.tsx      # IoT vitals display
│   ├── 🚨 EmergencyButton.tsx      # SOS button component
│   └── 🌍 LanguageSelector.tsx     # Language switcher
│
├── 🛠️ lib/                         # Utilities & Logic
│   ├── 🤖 medicalAI.ts             # Claude AI integration class
│   └── 📋 constants.ts             # Medical data & configs
│
├── 📘 types/                        # TypeScript Definitions
│   └── index.ts                    # All type interfaces
│
├── 🌐 public/                       # Static Assets
│   └── manifest.json               # PWA configuration
│
├── 📚 Documentation Files
│   ├── README.md                   # Main documentation
│   ├── QUICKSTART.md               # 5-min setup guide
│   ├── INSTALL.md                  # Installation steps
│   ├── PROJECT_SUMMARY.md          # Competition guide
│   ├── CONTRIBUTING.md             # Development guide
│   └── LICENSE                     # MIT license
│
└── ⚙️ Configuration Files
    ├── package.json                # Dependencies
    ├── tsconfig.json               # TypeScript config
    ├── tailwind.config.ts          # Styling config
    ├── next.config.js              # Next.js config
    ├── postcss.config.js           # PostCSS config
    ├── .env.example                # Environment template
    └── .gitignore                  # Git ignore rules
```

## 🎭 Component Hierarchy

```
App (page.tsx)
├── Header
│   ├── Logo
│   ├── Language Selector
│   └── Emergency Button
│
├── Navigation Tabs
│   ├── Chat Tab
│   ├── Symptom Checker Tab
│   ├── Vitals Tab
│   └── Trends Tab
│
├── Main Content (Dynamic)
│   │
│   ├── Chat Interface
│   │   ├── Message List
│   │   │   ├── User Message
│   │   │   └── AI Message
│   │   ├── Voice Input Button
│   │   ├── Text Input
│   │   └── Send Button
│   │
│   ├── Symptom Checker
│   │   ├── Symptom Input
│   │   ├── Common Symptoms Grid
│   │   ├── Selected Symptoms List
│   │   ├── Analyze Button
│   │   └── Results Panel
│   │       ├── Urgency Badge
│   │       ├── Possible Conditions
│   │       ├── Recommendations
│   │       └── Self-Care Advice
│   │
│   ├── Vitals Dashboard
│   │   ├── Device Selector
│   │   ├── Connection Status
│   │   ├── Vitals Cards Grid
│   │   │   ├── Heart Rate Card
│   │   │   ├── Blood Pressure Card
│   │   │   ├── Temperature Card
│   │   │   ├── O2 Saturation Card
│   │   │   └── Respiratory Rate Card
│   │   └── Health Alerts Panel
│   │
│   └── Health Trends
│       ├── Chart Visualizations
│       └── Analytics Dashboard
│
└── Footer
    └── Medical Disclaimer
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────┐
│         User Request                │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      HTTPS/TLS Encryption           │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Rate Limiting Middleware       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      JWT Token Verification         │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Input Sanitization             │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      API Route Handler              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      Encrypted Data Storage         │
└─────────────────────────────────────┘
```

## 📊 Database Schema (Conceptual)

```
Users Collection
├── _id: ObjectId
├── name: string
├── email: string
├── phone: string
├── passwordHash: string
├── preferredLanguage: string
├── emergencyContacts: [Contact]
├── createdAt: Date
└── updatedAt: Date

HealthRecords Collection
├── _id: ObjectId
├── userId: ObjectId → Users
├── date: Date
├── symptoms: [string]
├── diagnosis: string
├── severity: enum
├── vitals: VitalsObject
├── recommendations: [string]
└── doctorNotes: string

VitalsData Collection (Time-Series)
├── _id: ObjectId
├── userId: ObjectId → Users
├── deviceId: string
├── timestamp: Date
├── heartRate: number
├── bloodPressure: { systolic, diastolic }
├── temperature: number
├── oxygenSaturation: number
└── metadata: object

ChatHistory Collection
├── _id: ObjectId
├── userId: ObjectId → Users
├── sessionId: string
├── messages: [Message]
├── language: string
├── startTime: Date
└── endTime: Date
```

## 🌊 State Management Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Zustand Store Update (if needed)
    │
    ▼
API Call (if needed)
    │
    ▼
Update Local State
    │
    ▼
React Re-render
    │
    ▼
UI Update
```

## 🎨 UI Component Patterns

### Card Pattern
```
┌───────────────────────────────┐
│  Icon    Title           ...  │ ← Header
├───────────────────────────────┤
│                               │
│    Main Content Area          │ ← Content
│                               │
├───────────────────────────────┤
│  Additional Info | Actions    │ ← Footer
└───────────────────────────────┘
```

### Chat Message Pattern
```
User Message (Right Aligned):
                    ┌─────────────┐
                    │ User text   │
                    │ 10:30 AM    │
                    └─────────────┘

AI Message (Left Aligned):
┌─────────────┐
│ AI response │
│ 10:31 AM    │
└─────────────┘
```

### Vitals Card Pattern
```
┌─────────────────────────┐
│ 💓 Heart Rate      [✓]  │
├─────────────────────────┤
│                         │
│      72 bpm             │
│                         │
├─────────────────────────┤
│ Normal: 60-100 bpm      │
│ ▄▄▅▆▇▆▅▄▃▄▅▆ Chart     │
└─────────────────────────┘
```

## 🚀 Deployment Pipeline

```
Local Development
    │
    ├─► npm run dev
    │   └─► http://localhost:3000
    │
    ▼
Git Commit & Push
    │
    ▼
GitHub Repository
    │
    ▼
Vercel/Netlify Detect Changes
    │
    ▼
Automatic Build
    │
    ├─► npm run build
    ├─► Next.js Optimization
    ├─► Static Export
    └─► Edge Functions Setup
    │
    ▼
Deploy to CDN
    │
    ├─► Edge Nodes Worldwide
    ├─► SSL Certificate
    └─► Custom Domain
    │
    ▼
Production URL Live! 🎉
```

## 📱 Progressive Web App Flow

```
First Visit
    │
    ▼
Load Web App
    │
    ▼
Service Worker Registration
    │
    ▼
Cache Core Assets
    │
    ▼
Install Prompt
    │
    ├─► User Installs
    │   └─► Add to Home Screen
    │
    └─► User Continues
        └─► Bookmark in Browser
    │
    ▼
Offline Capability Enabled
    │
    ├─► Network Available
    │   └─► Full Functionality
    │
    └─► Network Unavailable
        └─► Cached Content + Queue Actions
```

## 🎯 Feature Integration Map

```
                    CORE FEATURES
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    AI Chat          Symptom           IoT Vitals
   Assistant          Checker          Monitoring
        │                 │                 │
        ├──►Voice I/O◄────┤                 │
        ├──►Claude AI◄────┤                 │
        ├───────►Medical Knowledge Graph◄───┤
        │                 │                 │
        └────►Emergency System◄─────────────┘
                    │
            Multilingual Support
                    │
              ┌─────┴─────┐
        Translation     Voice
          Service      Synthesis
```

---

This visual guide helps you understand how everything fits together!

For hands-on setup, see: **INSTALL.md**
For detailed docs, see: **README.md**
For quick demo, see: **PROJECT_SUMMARY.md**
