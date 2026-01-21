# 🚀 Installation Commands

Run these commands in order to set up DeepBlue Health:

## Step 1: Navigate to Project Directory
```powershell
cd c:\Users\jayga\OneDrive\Desktop\deepblue
```

## Step 2: Install Dependencies
```powershell
npm install
```

This will install all required packages (~300MB, takes 2-3 minutes).

## Step 3: Create Environment File
```powershell
copy .env.example .env
```

## Step 4: Edit .env File
Open `.env` in your editor and add your Claude API key:
```env
ANTHROPIC_API_KEY=your_actual_api_key_here
```

**Get your Claude API key:**
1. Visit: https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create Key"
5. Copy the key and paste it in .env

## Step 5: Run Development Server
```powershell
npm run dev
```

## Step 6: Open in Browser
Navigate to: http://localhost:3000

---

## 🎯 Quick Test

Once the app is running, test these features:

### 1. Chat Interface
- Type: "I have a fever and headache"
- Watch AI respond with guidance

### 2. Symptom Checker
- Click "Symptom Checker" tab
- Add symptoms: Fever, Headache, Cough
- Click "Analyze Symptoms"

### 3. Voice Input (if supported in your browser)
- Click microphone icon in chat
- Allow microphone permission
- Say: "What should I do for a headache?"

### 4. Live Vitals
- Click "Live Vitals" tab
- Select "Smart Watch" from dropdown
- Watch real-time data update every 5 seconds

### 5. Language Switching
- Click globe icon in header
- Select "हिंदी (Hindi)"
- Interface switches to Hindi

### 6. Emergency Button
- Click red "SOS EMERGENCY" button
- See how emergency alert system works
- (Don't worry, it's simulated in development)

---

## 🐛 Troubleshooting

### Problem: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: "Cannot find module..."
**Solution:**
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Problem: "Port 3000 is already in use"
**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or run on different port
npm run dev -- -p 3001
```

### Problem: "API key not configured"
**Solution:** Make sure `.env` file exists with valid ANTHROPIC_API_KEY

### Problem: Voice input not working
**Solution:** 
- Use Chrome or Edge browser (Firefox doesn't support Web Speech API)
- Allow microphone permissions when prompted
- Check if running on HTTPS (required for voice APIs)

---

## ✅ Verification Checklist

After installation, verify:
- [ ] App opens at http://localhost:3000
- [ ] No console errors (press F12 to check)
- [ ] Chat interface loads
- [ ] Can type messages and get AI responses
- [ ] Symptom checker works
- [ ] Vitals dashboard shows data
- [ ] Language selector works
- [ ] Emergency button responds
- [ ] UI is responsive on mobile (use browser dev tools)

---

## 📦 What Gets Installed

Key packages (300+ total):
- **next** - React framework
- **react** & **react-dom** - UI library
- **@anthropic-ai/sdk** - Claude AI integration
- **typescript** - Type safety
- **tailwindcss** - Styling
- **framer-motion** - Animations
- **recharts** - Charts
- **zustand** - State management
- **axios** - HTTP client
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication
- **react-hot-toast** - Notifications
- **lucide-react** - Icons

---

## 🔧 Development Commands

```powershell
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check (verify TypeScript)
npm run type-check

# Lint code (check code quality)
npm run lint
```

---

## 🚀 Next Steps

1. **Customize your solution**
   - Add more languages in lib/constants.ts
   - Expand medical knowledge graph
   - Add your branding/logo

2. **Prepare demo**
   - Practice demo script (see PROJECT_SUMMARY.md)
   - Record backup video
   - Prepare talking points

3. **Deploy to production**
   - Push to GitHub
   - Deploy to Vercel (see README.md)
   - Share public URL

4. **Create presentation**
   - Use screenshots from your running app
   - Prepare slides highlighting features
   - Record demo video

---

## 📞 Need Help?

- Check **QUICKSTART.md** for detailed setup guide
- Read **README.md** for full documentation
- See **PROJECT_SUMMARY.md** for demo guide
- Check **CONTRIBUTING.md** for development info

---

**Ready to revolutionize rural healthcare! 🏥💙**
