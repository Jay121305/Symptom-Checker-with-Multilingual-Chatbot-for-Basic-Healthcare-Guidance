# 🏥 DeepBlue Health - AI Healthcare Assistant

<div align="center">

![DeepBlue Health Logo](https://img.shields.io/badge/DeepBlue-Health-blue?style=for-the-badge&logo=heart)

**AI-Powered Multilingual Healthcare Assistant with IoT Integration**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Claude AI](https://img.shields.io/badge/Claude-AI-orange?style=flat-square)](https://www.anthropic.com/)

</div>

---

## 🌟 Overview

DeepBlue Health is a **competition-winning healthcare solution** designed to bridge the healthcare gap in rural and underserved areas. It combines cutting-edge AI, multilingual support, IoT device integration, and voice-first interfaces to provide 24/7 medical guidance.

### 🎯 Problem Statement

Rural populations face delays in diagnosis due to limited medical access and language barriers, often leading to poor health outcomes.

### ✨ Our Solution

A comprehensive AI-powered healthcare assistant that provides:
- **Intelligent symptom analysis** using Claude AI
- **Multilingual support** (10+ Indian languages)
- **Voice & text interaction** for accessibility
- **Real-time IoT vitals monitoring**
- **Emergency SOS system** with geolocation
- **Offline-first PWA** for areas with poor connectivity

---

## 🚀 Key Features

### 🧠 AI-Powered Medical Intelligence
- **Advanced Symptom Analysis**: Claude AI analyzes symptoms with medical knowledge graph
- **Urgency Classification**: Automatic triage into self-care, doctor visit, or emergency
- **Contextual Guidance**: Personalized health advice based on medical history
- **Confidence Scoring**: Transparent AI confidence levels for reliability

### 🗣️ Multilingual Voice Interface
- **10+ Indian Languages**: Hindi, Bengali, Telugu, Tamil, Marathi, Urdu, Gujarati, Kannada, Malayalam, English
- **Speech-to-Text**: Voice input for hands-free interaction
- **Text-to-Speech**: Audio responses for accessibility
- **Real-time Translation**: Seamless language switching

### 📊 IoT Vitals Monitoring
- **Real-time Data Streaming**: Live vital signs from connected devices
- **Smart Device Integration**: Smartwatch, BP monitor, thermometer, oximeter, glucometer
- **Abnormality Detection**: Instant alerts for critical values
- **Historical Trends**: Track health metrics over time

### 🚨 Emergency Response System
- **One-Touch SOS**: Instant emergency alert system
- **Geolocation Tracking**: Automatic location sharing with emergency services
- **Contact Notification**: Alerts sent to registered emergency contacts
- **Quick Dial**: Direct call to emergency services (108)

### 📱 Progressive Web App (PWA)
- **Offline Functionality**: Works without internet connection
- **Installable**: Add to home screen like a native app
- **Fast Loading**: Optimized performance for slow networks
- **Background Sync**: Data syncs when connection restores

### 📈 Health Analytics Dashboard
- **Trend Visualization**: Beautiful charts for health metrics
- **Predictive Insights**: AI-powered health predictions
- **Medical Records**: Secure storage of health history
- **Report Generation**: Downloadable health reports

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Charts**: Recharts

### Backend
- **API**: Next.js API Routes
- **AI Engine**: Claude 3.5 Sonnet (Anthropic)
- **Database**: MongoDB / PostgreSQL (configurable)
- **Authentication**: JWT
- **Real-time**: Socket.io (for IoT streaming)

### Integrations
- **Voice**: Web Speech API (STT/TTS)
- **IoT**: MQTT / WebSocket protocols
- **SMS**: Twilio (optional)
- **Location**: Geolocation API
- **Translation**: Google Translate API (optional)

### DevOps
- **Hosting**: Vercel / Netlify
- **Database**: MongoDB Atlas / Supabase
- **CDN**: Cloudflare
- **Monitoring**: Sentry (error tracking)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB or PostgreSQL
- Anthropic API key (Claude)

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/deepblue-health.git
cd deepblue-health
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration
Create a `.env` file in the root directory:

```env
# Required: Claude AI API Key
ANTHROPIC_API_KEY=your_claude_api_key_here

# Database (choose one)
MONGODB_URI=mongodb://localhost:27017/deepblue-health
# OR
DATABASE_URL=postgresql://user:password@localhost:5432/deepblue

# JWT Secret
JWT_SECRET=your_secure_random_string_here

# Optional: Enhanced Features
OPENAI_API_KEY=your_openai_key_for_translation
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
```

### Step 4: Get Your Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste into `.env` file

### Step 5: Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Build for Production
```bash
npm run build
npm start
# or
yarn build
yarn start
```

---

## 🎮 Usage Guide

### For End Users

#### 1️⃣ **Chat with AI Assistant**
- Click on "Chat" tab
- Type your symptoms or health questions
- Use the microphone icon for voice input
- Get instant AI-powered medical guidance

#### 2️⃣ **Check Symptoms**
- Navigate to "Symptom Checker"
- Select symptoms from common list or add custom ones
- Click "Analyze Symptoms"
- View detailed analysis with urgency level and recommendations

#### 3️⃣ **Monitor Vitals**
- Go to "Live Vitals" tab
- Select your IoT device type
- View real-time health metrics
- Get alerts for abnormal values

#### 4️⃣ **Emergency Situations**
- Click red "SOS EMERGENCY" button
- Confirm emergency alert
- Your location and contacts are automatically notified
- Quick dial to emergency services (108)

#### 5️⃣ **Language Selection**
- Click globe icon in header
- Select your preferred language
- Entire interface switches language
- Voice responses in selected language

### For Healthcare Providers

#### Integration with IoT Devices
```javascript
// Example: Send vitals data from IoT device
const response = await fetch('/api/iot/vitals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'device-001',
    vitals: {
      heartRate: 75,
      bloodPressure: { systolic: 120, diastolic: 80 },
      temperature: 98.6,
      oxygenSaturation: 98,
    },
  }),
});
```

---

## 🎨 Architecture

```
deepblue-health/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── analyze/          # Symptom analysis endpoint
│   │   ├── chat/             # Chat conversation endpoint
│   │   ├── emergency/        # Emergency alert system
│   │   ├── iot/              # IoT device integration
│   │   └── translate/        # Translation service
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ChatInterface.tsx     # AI chat UI with voice
│   ├── SymptomChecker.tsx    # Symptom analysis UI
│   ├── VitalsDashboard.tsx   # IoT vitals display
│   ├── EmergencyButton.tsx   # SOS button
│   └── LanguageSelector.tsx  # Language switcher
├── lib/                      # Utilities & services
│   ├── medicalAI.ts          # Claude AI integration
│   └── constants.ts          # App constants
├── types/                    # TypeScript types
│   └── index.ts              # Type definitions
├── public/                   # Static assets
│   └── manifest.json         # PWA manifest
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind config
└── next.config.js            # Next.js config
```

---

## 🔐 Security & Privacy

### Data Protection
- **End-to-End Encryption**: All health data encrypted in transit (HTTPS)
- **Secure Storage**: Medical records encrypted at rest
- **HIPAA Compliance Ready**: Architecture supports healthcare regulations
- **No Data Selling**: User health data never shared with third parties

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Different permissions for users/providers
- **API Rate Limiting**: Prevents abuse and attacks
- **Input Sanitization**: Protection against injection attacks

### Privacy Features
- **Anonymous Mode**: Use without creating account
- **Data Deletion**: Users can delete their data anytime
- **Minimal Data Collection**: Only essential health information
- **Local Storage**: Sensitive data stored on device when possible

---

## 🏆 Competitive Advantages

### What Makes DeepBlue Health Unique?

1. **Medical Knowledge Graph**: Proprietary disease-symptom relationship database
2. **Hybrid AI Approach**: Combines Claude AI with rule-based medical logic
3. **Voice-First Design**: Optimized for users with low literacy
4. **Offline Functionality**: Works in areas with poor connectivity
5. **IoT Integration**: Seamless connection with medical devices
6. **Emergency Response**: Integrated SOS system with geolocation
7. **Cultural Sensitivity**: Language and cultural context awareness
8. **Scalability**: Architecture supports millions of users
9. **Extensibility**: Easy to add new languages and features
10. **Open Source Potential**: Can be deployed by NGOs and governments

### Hackathon Winning Features

- ✅ **Innovation**: Novel combination of AI, IoT, and multilingual support
- ✅ **Technical Complexity**: Advanced architecture with multiple integrations
- ✅ **Social Impact**: Addresses real healthcare access challenges
- ✅ **Scalability**: Can serve millions in rural areas
- ✅ **User Experience**: Intuitive interface for all literacy levels
- ✅ **Completeness**: Full-featured solution, not just a prototype
- ✅ **Presentation Ready**: Professional UI, documentation, and demo

---

## 📊 Demo Scenarios

### Scenario 1: Rural Patient with Fever
1. Patient opens app in Hindi
2. Uses voice: "Mujhe bukhar hai" (I have fever)
3. AI asks follow-up questions
4. Analyzes symptoms with vitals from connected thermometer
5. Suggests self-care with fever monitoring
6. Alerts if temperature exceeds threshold

### Scenario 2: Emergency Heart Attack
1. Patient feels severe chest pain
2. Clicks SOS Emergency button
3. App detects abnormal heart rate from smartwatch
4. Sends location to emergency services
5. Notifies family members via SMS
6. Provides first-aid instructions while waiting

### Scenario 3: Elderly Care Monitoring
1. Elderly patient wears smartwatch
2. Family monitors vitals remotely
3. App detects blood pressure spike
4. Sends alert to family members
5. AI suggests doctor consultation
6. Tracks health trends over weeks

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Click Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel --prod
```

### Deploy to Other Platforms

**Netlify:**
```bash
npm run build
netlify deploy --prod
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔮 Future Enhancements

### Phase 2 Features (Next 3-6 months)
- [ ] Telemedicine video consultation integration
- [ ] Prescription management system
- [ ] Health insurance integration
- [ ] Appointment scheduling with local doctors
- [ ] Medicine reminder system
- [ ] Vaccine tracking and reminders
- [ ] Pregnancy & maternal health module
- [ ] Mental health support chatbot

### Phase 3 Features (6-12 months)
- [ ] Blockchain-based health records
- [ ] AI-powered diagnosis improvement from feedback
- [ ] Community health worker dashboard
- [ ] Integration with government health schemes
- [ ] Wearable device SDK for manufacturers
- [ ] Machine learning for disease outbreak prediction
- [ ] Augmented reality for first aid guidance
- [ ] Integration with ambulance services

### Research & Innovation
- [ ] Federated learning for privacy-preserving AI training
- [ ] Edge AI for offline symptom analysis
- [ ] Natural language processing for medical reports
- [ ] Computer vision for skin condition detection

---

## 🤝 Contributing

We welcome contributions from the community!

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure responsive design

### Areas Needing Help
- Additional language translations
- IoT device driver development
- Medical knowledge graph expansion
- UI/UX improvements
- Performance optimization
- Security auditing

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

### Medical Disclaimer

⚠️ **IMPORTANT**: DeepBlue Health is an AI-powered health assistant for guidance purposes only. It is **NOT** a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified healthcare providers with any questions regarding a medical condition. In case of emergency, call your local emergency services immediately.

---

## 👥 Team & Contact

**Project Maintainer**: Jay Gautam 
**Email**: jaygaautam@gmail.com 
**GitHub**: [@Jay121305](https://github.com/Jay121305)  
**LinkedIn**: (https://www.linkedin.com/in/jay-gautam/)

### Acknowledgments

- **Anthropic** for Claude AI API
- **Next.js Team** for the amazing framework
- **Open Source Community** for invaluable tools and libraries
- **Healthcare Professionals** who provided medical knowledge consultation

---

## 📞 Support

### Getting Help
- 📖 **Documentation**: [Read the Docs](https://docs.deepbluehealth.com)
- 💬 **Discord Community**: [Join Discussion](https://discord.gg/deepblue)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/deepblue-health/issues)
- 📧 **Email**: support@deepbluehealth.com

### Emergency Contacts (India)
- **Ambulance**: 108 / 102
- **National Health Helpline**: 1800-180-1104
- **Mental Health**: 1800-599-0019

---

## 🌟 Star History

If you find this project helpful, please ⭐ star it on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/deepblue-health&type=Date)](https://star-history.com/#yourusername/deepblue-health&Date)

---

## 🎯 Hackathon Submission Checklist

- [x] Complete working prototype
- [x] AI-powered symptom analysis
- [x] Multilingual support (10+ languages)
- [x] Voice input/output
- [x] IoT device integration
- [x] Emergency SOS system
- [x] Responsive design
- [x] PWA functionality
- [x] Comprehensive documentation
- [x] Clean, maintainable code
- [x] Demo video ready
- [x] Deployment on production URL

---

<div align="center">

**Made with ❤️ for improving healthcare access in rural India**

[Website](https://deepbluehealth.com) • [Documentation](https://docs.deepbluehealth.com) • [Demo](https://demo.deepbluehealth.com)

</div>
