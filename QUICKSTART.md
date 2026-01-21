# DeepBlue Health - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Claude API key from Anthropic
- [ ] Code editor (VS Code recommended)

### Installation Steps

#### 1. Install Dependencies
```bash
cd deepblue
npm install
```

#### 2. Configure Environment
```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your Claude API key
# ANTHROPIC_API_KEY=your_key_here
```

#### 3. Run Development Server
```bash
npm run dev
```

#### 4. Open in Browser
Navigate to: http://localhost:3000

## 🎯 Key Features to Demo

### 1. AI Chat Assistant
- Open chat tab
- Try: "I have a fever and headache"
- Click microphone for voice input (works in supported browsers)

### 2. Symptom Checker
- Click "Symptom Checker" tab
- Add symptoms: Fever, Headache, Cough
- Click "Analyze Symptoms"
- View AI-powered analysis with urgency classification

### 3. Live Vitals Monitoring
- Navigate to "Live Vitals" tab
- Select device type (e.g., Smart Watch)
- Watch real-time simulated vitals data
- Observe alerts for abnormal values

### 4. Multilingual Support
- Click globe icon in header
- Select language (हिंदी, বাংলা, తెలుగు, etc.)
- Interface and voice responses change language

### 5. Emergency SOS
- Click red "SOS EMERGENCY" button
- Confirm to test emergency alert system
- Location tracking and contact notification

## 📱 Testing Voice Features

### Enable Microphone Access
1. Browser will request microphone permission
2. Click "Allow" to enable voice input
3. Click microphone icon in chat
4. Speak clearly when listening indicator appears
5. Voice is transcribed and sent to AI

### Text-to-Speech
- AI responses are automatically spoken aloud
- Click speaker icon to stop speech
- Works in 10+ Indian languages

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "API key not configured"
**Solution:** Ensure .env file exists with valid ANTHROPIC_API_KEY

### Issue: Voice input not working
**Solution:** 
- Use Chrome, Edge, or Safari (not Firefox)
- Check microphone permissions in browser settings
- Ensure HTTPS (voice APIs require secure context)

### Issue: Port 3000 already in use
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

## 🎬 Demo Script for Hackathon

### 1-Minute Pitch
"DeepBlue Health solves rural healthcare access by providing 24/7 AI-powered medical guidance in 10+ Indian languages with voice support, real-time IoT vitals monitoring, and emergency SOS - all working offline as a PWA."

### 5-Minute Demo Flow
1. **Introduction** (30s): Show homepage, explain problem statement
2. **Chat Assistant** (1m): Demo voice input in Hindi, show AI response
3. **Symptom Analysis** (1.5m): Add symptoms, show emergency detection
4. **Vitals Monitoring** (1m): Display real-time IoT data, alerts
5. **Emergency SOS** (30s): Demonstrate emergency alert system
6. **Multilingual** (30s): Switch between languages
7. **Conclusion** (30s): Highlight impact and scalability

### Talking Points
- ✅ **10+ Indian languages** for rural accessibility
- ✅ **Claude AI** for accurate medical reasoning
- ✅ **Voice-first interface** for low-literacy users
- ✅ **IoT integration** for real-time health monitoring
- ✅ **Offline PWA** for poor connectivity areas
- ✅ **Emergency system** with geolocation
- ✅ **Production-ready** architecture

## 🏗️ Project Structure Overview

```
deepblue/
├── app/                    # Next.js pages & API routes
│   ├── api/               # Backend endpoints
│   │   ├── analyze/       # Symptom analysis
│   │   ├── chat/          # AI conversation
│   │   ├── emergency/     # SOS alerts
│   │   ├── iot/           # Device data
│   │   └── translate/     # Language service
│   ├── page.tsx           # Main application
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ChatInterface.tsx
│   ├── SymptomChecker.tsx
│   ├── VitalsDashboard.tsx
│   └── EmergencyButton.tsx
├── lib/                   # Core logic
│   ├── medicalAI.ts       # Claude integration
│   └── constants.ts       # Medical data
└── types/                 # TypeScript definitions
```

## 📊 Testing Data

### Sample Symptoms to Try
- **Low urgency**: "runny nose, mild headache"
- **Medium urgency**: "high fever, body aches, persistent cough"
- **Emergency**: "severe chest pain, difficulty breathing"

### Simulated IoT Devices
- Smart Watch: Heart rate, steps, calories
- BP Monitor: Blood pressure readings
- Thermometer: Body temperature
- Oximeter: O2 saturation, pulse
- Glucometer: Blood sugar levels

## 🌐 Deployment Checklist

### Before Deploying
- [ ] Add real Claude API key to .env
- [ ] Test all features locally
- [ ] Check responsive design on mobile
- [ ] Verify voice input/output works
- [ ] Test emergency alert system
- [ ] Confirm all 10 languages work

### Deploy to Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy and test production URL

### Environment Variables for Production
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
JWT_SECRET=<generate-strong-secret>
MONGODB_URI=<your-mongo-atlas-url>
NODE_ENV=production
```

## 📈 Monitoring & Analytics

### Key Metrics to Track
- User engagement (chat sessions, symptom checks)
- Emergency SOS usage
- Language distribution
- Response times
- Error rates
- Device connectivity

### Recommended Tools
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Google Analytics**: User behavior
- **LogRocket**: Session replay

## 🎓 Learning Resources

### Technologies Used
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Anthropic Claude API](https://docs.anthropic.com/)

### Healthcare Tech Resources
- FHIR Standards for health data
- HIPAA compliance guidelines
- IoT medical device protocols
- Telemedicine regulations in India

## 💡 Customization Ideas

### Add New Language
1. Add language config to `lib/constants.ts`
2. Update voice code mapping
3. Add translations for UI elements
4. Test voice input/output

### Integrate Real IoT Device
1. Implement device-specific protocol (MQTT/BLE)
2. Add device driver in `app/api/iot/`
3. Update data parsing logic
4. Add device to UI selector

### Extend Medical Knowledge
1. Update `MEDICAL_KNOWLEDGE_GRAPH` in constants
2. Add new conditions and symptoms
3. Update urgency classifications
4. Test with Claude AI integration

## 🤝 Support & Community

### Getting Help
- GitHub Issues: Bug reports and feature requests
- Discord: Real-time community support
- Email: Technical support

### Contributing
- Fork repository
- Create feature branch
- Submit pull request
- Follow contribution guidelines

---

## 🏆 Hackathon Success Tips

### Technical Excellence
1. **Demo video**: Record 2-3 minute walkthrough
2. **Live demo**: Practice demo script 5+ times
3. **Backup plan**: Have recorded demo if wifi fails
4. **Mobile ready**: Test on actual mobile devices
5. **Error handling**: Graceful fallbacks for API failures

### Presentation
1. **Problem first**: Start with rural healthcare challenges
2. **Show impact**: Emphasize lives potentially saved
3. **Technical depth**: Highlight AI, IoT, multilingual complexity
4. **Scalability**: Discuss millions of users potential
5. **Future vision**: Roadmap for sustainable growth

### Judges Look For
- ✅ Innovation and originality
- ✅ Technical complexity
- ✅ Social impact
- ✅ Completeness and polish
- ✅ Scalability
- ✅ Presentation clarity

---

## 📞 Quick Reference

### Emergency Numbers (India)
- Ambulance: 108 / 102
- Police: 100
- Fire: 101
- Women Helpline: 1091
- National Health Helpline: 1800-180-1104

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Check code quality
npm run type-check   # TypeScript validation
```

### Useful URLs
- Local: http://localhost:3000
- API Docs: http://localhost:3000/api
- Health Check: http://localhost:3000/api/health

---

**Ready to revolutionize rural healthcare! 🚀**

For detailed documentation, see [README.md](README.md)
