// Government Health Schemes Database
export const GOVERNMENT_SCHEMES = [
    {
        id: 'ayushman-bharat',
        name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana',
        nameHindi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना',
        shortName: 'PMJAY',
        description: 'Free health insurance up to ₹5 lakhs per family per year for secondary and tertiary care hospitalization',
        benefits: [
            'Free hospitalization up to ₹5 lakhs per year',
            'Covers 1,929 treatment packages',
            'No age or family size limit',
            'Pre and post hospitalization expenses covered',
            'All pre-existing conditions covered from day one'
        ],
        eligibility: [
            'Families identified in SECC 2011 database',
            'Rural: Based on deprivation criteria',
            'Urban: Occupational categories like ragpickers, beggars, domestic workers',
            'No income limit for eligible families'
        ],
        documents: [
            'Aadhaar Card',
            'Ration Card',
            'SECC-2011 inclusion letter',
            'Any government ID proof'
        ],
        link: 'https://pmjay.gov.in/',
        category: 'insurance' as const
    },
    {
        id: 'janani-suraksha',
        name: 'Janani Suraksha Yojana',
        nameHindi: 'जननी सुरक्षा योजना',
        shortName: 'JSY',
        description: 'Cash assistance for pregnant women delivering in government hospitals',
        benefits: [
            'Cash assistance ₹1,400 (rural) / ₹1,000 (urban)',
            'Free antenatal check-ups',
            'Free institutional delivery',
            'Free postnatal care',
            'ASHA worker support'
        ],
        eligibility: [
            'All pregnant women (BPL/SC/ST priority)',
            'Age 19 years and above',
            'Up to 2 live births'
        ],
        documents: [
            'Pregnancy registration card',
            'Aadhaar Card',
            'Bank account details',
            'BPL card (if applicable)'
        ],
        link: 'https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841',
        category: 'maternity' as const
    },
    {
        id: 'pradhan-mantri-suraksha',
        name: 'Pradhan Mantri Suraksha Bima Yojana',
        nameHindi: 'प्रधानमंत्री सुरक्षा बीमा योजना',
        shortName: 'PMSBY',
        description: 'Accident insurance at just ₹20/year with ₹2 lakh coverage',
        benefits: [
            '₹2 lakh for accidental death',
            '₹2 lakh for total permanent disability',
            '₹1 lakh for partial disability',
            'Annual premium only ₹20'
        ],
        eligibility: [
            'Age 18-70 years',
            'Bank account holders',
            'Aadhaar linked to bank account'
        ],
        documents: [
            'Aadhaar Card',
            'Bank account with auto-debit consent',
            'Nomination form'
        ],
        link: 'https://jansuraksha.gov.in/',
        category: 'insurance' as const
    },
    {
        id: 'aam-aadmi-bima',
        name: 'Aam Aadmi Bima Yojana',
        nameHindi: 'आम आदमी बीमा योजना',
        shortName: 'AABY',
        description: 'Life and disability insurance for rural landless households',
        benefits: [
            '₹30,000 natural death benefit',
            '₹75,000 accidental death benefit',
            '₹37,500 partial disability',
            'Scholarship for children (₹100/month)'
        ],
        eligibility: [
            'Rural landless households',
            'Age 18-59 years',
            'Head of family or earning member'
        ],
        documents: [
            'Aadhaar Card',
            'Land document (to prove landless status)',
            'Age proof'
        ],
        link: 'https://www.licindia.in/Bottom-Links/Aam-Aadmi-Bima-Yojana',
        category: 'insurance' as const
    },
    {
        id: 'pmjuy',
        name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
        nameHindi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना',
        shortName: 'PMJJBY',
        description: 'Life insurance at ₹436/year with ₹2 lakh coverage',
        benefits: [
            '₹2 lakh life insurance cover',
            'Low premium: ₹436/year',
            'Covers death due to any cause'
        ],
        eligibility: [
            'Age 18-50 years',
            'Bank account holders'
        ],
        documents: [
            'Aadhaar Card',
            'Bank account'
        ],
        link: 'https://jansuraksha.gov.in/',
        category: 'insurance' as const
    },
    {
        id: 'pmkvy',
        name: 'Rashtriya Swasthya Bima Yojana',
        nameHindi: 'राष्ट्रीय स्वास्थ्य बीमा योजना',
        shortName: 'RSBY',
        description: 'Health insurance for BPL families (now merged with PMJAY in many states)',
        benefits: [
            'Cashless hospitalization up to ₹30,000',
            'Coverage for family of 5',
            'Pre-existing diseases covered'
        ],
        eligibility: [
            'BPL families as per state list',
            'MNREGA workers',
            'Building and construction workers'
        ],
        documents: [
            'BPL card',
            'Aadhaar Card',
            'Ration card'
        ],
        link: 'https://www.rsby.gov.in/',
        category: 'insurance' as const
    }
];

// First Aid Guides Database
export const FIRST_AID_GUIDES = [
    {
        id: 'cpr',
        title: 'CPR (Cardiopulmonary Resuscitation)',
        titleHindi: 'सीपीआर (कार्डियोपल्मोनरी रिससिटेशन)',
        category: 'cardiac' as const,
        severity: 'critical' as const,
        steps: [
            { step: 1, instruction: 'Check if the person is responsive - tap shoulders and shout "Are you okay?"', instructionHindi: 'जांचें कि व्यक्ति सचेत है - कंधों को थपथपाएं और पूछें "क्या आप ठीक हैं?"' },
            { step: 2, instruction: 'Call 108 (ambulance) immediately or ask someone to call', instructionHindi: '108 (एम्बुलेंस) को तुरंत कॉल करें या किसी से कॉल करवाएं' },
            { step: 3, instruction: 'Place the person on their back on a firm surface', instructionHindi: 'व्यक्ति को कठोर सतह पर पीठ के बल लिटाएं' },
            { step: 4, instruction: 'Place heel of your hand on center of chest between nipples', instructionHindi: 'अपने हाथ की हथेली को छाती के बीच में दोनों निप्पल के बीच रखें' },
            { step: 5, instruction: 'Push hard and fast - at least 2 inches deep, 100-120 compressions per minute', instructionHindi: 'जोर से और तेज़ दबाएं - कम से कम 2 इंच गहरा, 100-120 बार प्रति मिनट', warning: 'Let chest rise completely between compressions' },
            { step: 6, instruction: 'Continue until help arrives or person starts breathing', instructionHindi: 'मदद आने तक या व्यक्ति सांस लेने तक जारी रखें' }
        ],
        doNot: ['Do not stop compressions for more than 10 seconds', 'Do not press on ribs or stomach', 'Do not give up even if tired - ask someone to take over'],
        callEmergency: true
    },
    {
        id: 'choking',
        title: 'Choking - Heimlich Maneuver',
        titleHindi: 'गले में कुछ फंसना - हेम्लिक मैन्यूवर',
        category: 'choking' as const,
        severity: 'high' as const,
        steps: [
            { step: 1, instruction: 'Ask "Are you choking?" - if they cannot speak or cough, they need help', instructionHindi: 'पूछें "क्या आपके गले में कुछ फंसा है?" - अगर वे बोल या खांस नहीं पा रहे, उन्हें मदद चाहिए' },
            { step: 2, instruction: 'Stand behind the person and wrap your arms around their waist', instructionHindi: 'व्यक्ति के पीछे खड़े हों और अपनी बाहों को उनकी कमर के चारों ओर लपेटें' },
            { step: 3, instruction: 'Make a fist with one hand and place it above the navel', instructionHindi: 'एक हाथ की मुट्ठी बनाएं और इसे नाभि के ऊपर रखें' },
            { step: 4, instruction: 'Grasp the fist with other hand and push inward and upward', instructionHindi: 'दूसरे हाथ से मुट्ठी पकड़ें और अंदर और ऊपर की ओर धक्का दें' },
            { step: 5, instruction: 'Repeat until object is expelled or person can breathe', instructionHindi: 'तब तक दोहराएं जब तक वस्तु बाहर न निकल जाए या व्यक्ति सांस न ले सके' }
        ],
        doNot: ['Do not slap the back while person is upright', 'Do not give water', 'For pregnant women, do chest thrusts instead'],
        callEmergency: true
    },
    {
        id: 'burns',
        title: 'Burns Treatment',
        titleHindi: 'जलने का इलाज',
        category: 'burn' as const,
        severity: 'medium' as const,
        steps: [
            { step: 1, instruction: 'Remove the person from the source of burn', instructionHindi: 'व्यक्ति को जलने के स्रोत से दूर करें' },
            { step: 2, instruction: 'Cool the burn under cool (not cold) running water for 10-20 minutes', instructionHindi: 'जले हुए हिस्से को 10-20 मिनट तक ठंडे (बर्फीले नहीं) पानी के नीचे रखें' },
            { step: 3, instruction: 'Remove jewelry or tight clothing before swelling starts', instructionHindi: 'सूजन शुरू होने से पहले गहने या तंग कपड़े हटा दें' },
            { step: 4, instruction: 'Cover with a clean, non-fluffy bandage or cling film', instructionHindi: 'साफ, गैर-रोएंदार पट्टी या प्लास्टिक रैप से ढकें' },
            { step: 5, instruction: 'Take pain relievers if needed (paracetamol)', instructionHindi: 'यदि आवश्यक हो तो दर्द निवारक लें (पैरासिटामोल)' }
        ],
        doNot: ['Do not use ice or butter', 'Do not break blisters', 'Do not remove stuck clothing', 'Do not apply toothpaste or home remedies'],
        callEmergency: false
    },
    {
        id: 'bleeding',
        title: 'Severe Bleeding Control',
        titleHindi: 'गंभीर रक्तस्राव नियंत्रण',
        category: 'injury' as const,
        severity: 'high' as const,
        steps: [
            { step: 1, instruction: 'Apply direct pressure with a clean cloth or bandage', instructionHindi: 'साफ कपड़े या पट्टी से सीधा दबाव डालें' },
            { step: 2, instruction: 'Do not remove the cloth - add more layers if blood soaks through', instructionHindi: 'कपड़ा न हटाएं - अगर खून रिस जाए तो और परतें जोड़ें' },
            { step: 3, instruction: 'Elevate the injured area above heart level if possible', instructionHindi: 'यदि संभव हो तो घायल हिस्से को दिल के स्तर से ऊपर उठाएं' },
            { step: 4, instruction: 'Apply a pressure bandage if bleeding continues', instructionHindi: 'अगर रक्तस्राव जारी रहे तो प्रेशर बैंडेज लगाएं' },
            { step: 5, instruction: 'Keep the person warm and calm', instructionHindi: 'व्यक्ति को गर्म और शांत रखें' }
        ],
        doNot: ['Do not use tourniquet unless trained', 'Do not remove embedded objects', 'Do not clean deep wounds'],
        callEmergency: true
    },
    {
        id: 'fever',
        title: 'High Fever Management',
        titleHindi: 'तेज बुखार प्रबंधन',
        category: 'general' as const,
        severity: 'medium' as const,
        steps: [
            { step: 1, instruction: 'Check temperature with thermometer - fever is above 100.4°F (38°C)', instructionHindi: 'थर्मामीटर से तापमान जांचें - बुखार 100.4°F (38°C) से ऊपर है' },
            { step: 2, instruction: 'Give paracetamol as per dosage instructions', instructionHindi: 'खुराक निर्देशों के अनुसार पैरासिटामोल दें' },
            { step: 3, instruction: 'Sponge body with lukewarm water (not cold)', instructionHindi: 'गुनगुने पानी (ठंडा नहीं) से शरीर पोंछें' },
            { step: 4, instruction: 'Keep hydrated - give ORS, water, or coconut water', instructionHindi: 'हाइड्रेटेड रखें - ORS, पानी, या नारियल पानी दें' },
            { step: 5, instruction: 'Wear light, loose clothing', instructionHindi: 'हल्के, ढीले कपड़े पहनें' }
        ],
        doNot: ['Do not overdose on fever medicine', 'Do not use ice bath', 'Do not ignore fever above 103°F in children'],
        callEmergency: false
    },
    {
        id: 'snakebite',
        title: 'Snake Bite Emergency',
        titleHindi: 'सांप के काटने पर आपातकालीन',
        category: 'emergency' as const,
        severity: 'critical' as const,
        steps: [
            { step: 1, instruction: 'Keep the person calm and still - movement spreads venom faster', instructionHindi: 'व्यक्ति को शांत और स्थिर रखें - हिलने-डुलने से जहर तेज़ी से फैलता है' },
            { step: 2, instruction: 'Remove jewelry and tight clothing near the bite', instructionHindi: 'काटने के पास के गहने और तंग कपड़े हटा दें' },
            { step: 3, instruction: 'Keep the bitten area below heart level', instructionHindi: 'काटे गए हिस्से को दिल के स्तर से नीचे रखें' },
            { step: 4, instruction: 'Note the time of bite and snake appearance if possible', instructionHindi: 'काटने का समय और सांप का रूप याद रखें अगर संभव हो' },
            { step: 5, instruction: 'Get to hospital immediately - anti-venom is the only treatment', instructionHindi: 'तुरंत अस्पताल जाएं - एंटी-वेनम एकमात्र इलाज है', warning: 'Time is critical!' }
        ],
        doNot: ['Do not cut the wound', 'Do not suck out venom', 'Do not apply ice or tourniquet', 'Do not give alcohol or aspirin', 'Do not try to catch the snake'],
        callEmergency: true
    }
];

// Cost Estimates Database
export const COST_ESTIMATES: Record<string, {
    governmentHospital: { consultation: number; tests: number; treatment: number; medicines: number; total: number };
    privateHospital: { consultation: number; tests: number; treatment: number; medicines: number; total: number };
    insuranceCoverage: string;
    genericAlternatives?: { brand: string; generic: string; savings: number }[];
}> = {
    'common-cold': {
        governmentHospital: { consultation: 0, tests: 50, treatment: 0, medicines: 50, total: 100 },
        privateHospital: { consultation: 300, tests: 200, treatment: 0, medicines: 200, total: 700 },
        insuranceCoverage: 'Not covered (OPD)',
    },
    'flu': {
        governmentHospital: { consultation: 0, tests: 100, treatment: 0, medicines: 100, total: 200 },
        privateHospital: { consultation: 500, tests: 500, treatment: 0, medicines: 400, total: 1400 },
        insuranceCoverage: 'Covered if hospitalized',
    },
    'covid-19': {
        governmentHospital: { consultation: 0, tests: 0, treatment: 0, medicines: 0, total: 0 },
        privateHospital: { consultation: 500, tests: 1500, treatment: 5000, medicines: 3000, total: 10000 },
        insuranceCoverage: 'Fully covered under PMJAY if eligible',
    },
    'hypertension': {
        governmentHospital: { consultation: 0, tests: 200, treatment: 0, medicines: 100, total: 300 },
        privateHospital: { consultation: 600, tests: 1500, treatment: 0, medicines: 800, total: 2900 },
        insuranceCoverage: 'OPD not covered; hospitalization covered',
        genericAlternatives: [
            { brand: 'Telma 40', generic: 'Telmisartan 40mg', savings: 200 },
            { brand: 'Amlong 5', generic: 'Amlodipine 5mg', savings: 150 },
        ]
    },
    'diabetes': {
        governmentHospital: { consultation: 0, tests: 300, treatment: 0, medicines: 200, total: 500 },
        privateHospital: { consultation: 800, tests: 2000, treatment: 0, medicines: 1500, total: 4300 },
        insuranceCoverage: 'Covered if complications arise',
        genericAlternatives: [
            { brand: 'Glycomet 500', generic: 'Metformin 500mg', savings: 100 },
            { brand: 'Januvia 100', generic: 'Sitagliptin 100mg', savings: 1500 },
        ]
    },
    'heart-attack': {
        governmentHospital: { consultation: 0, tests: 5000, treatment: 100000, medicines: 10000, total: 115000 },
        privateHospital: { consultation: 2000, tests: 25000, treatment: 500000, medicines: 50000, total: 577000 },
        insuranceCoverage: 'Fully covered up to ₹5 lakh under PMJAY',
    },
    'stroke': {
        governmentHospital: { consultation: 0, tests: 8000, treatment: 80000, medicines: 15000, total: 103000 },
        privateHospital: { consultation: 2000, tests: 40000, treatment: 400000, medicines: 60000, total: 502000 },
        insuranceCoverage: 'Fully covered under PMJAY',
    },
    'gastroenteritis': {
        governmentHospital: { consultation: 0, tests: 100, treatment: 500, medicines: 100, total: 700 },
        privateHospital: { consultation: 500, tests: 800, treatment: 3000, medicines: 500, total: 4800 },
        insuranceCoverage: 'Covered if hospitalized',
    },
};

// Body Parts for Visual Symptom Selection
export const BODY_PARTS = [
    {
        id: 'head',
        name: 'Head',
        nameHindi: 'सिर',
        symptoms: ['Headache', 'Dizziness', 'Confusion', 'Blurred Vision', 'Memory Problems'],
    },
    {
        id: 'eyes',
        name: 'Eyes',
        nameHindi: 'आंखें',
        symptoms: ['Eye Pain', 'Blurred Vision', 'Redness', 'Watery Eyes', 'Light Sensitivity'],
    },
    {
        id: 'throat',
        name: 'Throat',
        nameHindi: 'गला',
        symptoms: ['Sore Throat', 'Difficulty Swallowing', 'Hoarse Voice', 'Throat Swelling'],
    },
    {
        id: 'chest',
        name: 'Chest',
        nameHindi: 'छाती',
        symptoms: ['Chest Pain', 'Shortness of Breath', 'Heart Palpitations', 'Cough', 'Wheezing'],
    },
    {
        id: 'stomach',
        name: 'Stomach/Abdomen',
        nameHindi: 'पेट',
        symptoms: ['Abdominal Pain', 'Nausea', 'Vomiting', 'Bloating', 'Indigestion', 'Diarrhea'],
    },
    {
        id: 'back',
        name: 'Back',
        nameHindi: 'पीठ',
        symptoms: ['Back Pain', 'Stiffness', 'Numbness', 'Muscle Spasm'],
    },
    {
        id: 'arms',
        name: 'Arms/Hands',
        nameHindi: 'बाहें/हाथ',
        symptoms: ['Arm Pain', 'Numbness', 'Weakness', 'Swelling', 'Joint Pain'],
    },
    {
        id: 'legs',
        name: 'Legs/Feet',
        nameHindi: 'पैर',
        symptoms: ['Leg Pain', 'Swelling', 'Cramping', 'Numbness', 'Difficulty Walking'],
    },
    {
        id: 'skin',
        name: 'Skin',
        nameHindi: 'त्वचा',
        symptoms: ['Rash', 'Itching', 'Redness', 'Swelling', 'Bruising', 'Dry Skin'],
    },
    {
        id: 'general',
        name: 'Whole Body/General',
        nameHindi: 'पूरा शरीर',
        symptoms: ['Fever', 'Fatigue', 'Weakness', 'Weight Loss', 'Night Sweats', 'Body Aches'],
    },
];

// Sample Hospitals Database
export const SAMPLE_HOSPITALS = [
    {
        id: '1',
        name: 'District Government Hospital',
        type: 'government' as const,
        address: 'Civil Lines, Near Bus Stand',
        phone: '108',
        latitude: 28.6139,
        longitude: 77.2090,
        specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics'],
        emergencyAvailable: true,
        ayushmanEmpaneled: true,
    },
    {
        id: '2',
        name: 'Primary Health Centre (PHC)',
        type: 'phc' as const,
        address: 'Village Main Road',
        phone: '102',
        latitude: 28.6100,
        longitude: 77.2050,
        specialties: ['General Medicine', 'Vaccination', 'Maternal Care'],
        emergencyAvailable: false,
        ayushmanEmpaneled: true,
    },
    {
        id: '3',
        name: 'Community Health Centre',
        type: 'government' as const,
        address: 'Block Headquarters',
        phone: '102',
        latitude: 28.6200,
        longitude: 77.2150,
        specialties: ['General Medicine', 'Emergency Care', 'Lab Services'],
        emergencyAvailable: true,
        ayushmanEmpaneled: true,
    },
];

// Health Education Articles
export const HEALTH_ARTICLES = [
    {
        id: 'diabetes-prevention',
        title: 'Preventing Diabetes - Lifestyle Changes',
        titleHindi: 'मधुमेह रोकथाम - जीवनशैली में बदलाव',
        category: 'Chronic Disease',
        content: `Diabetes can be prevented with simple lifestyle changes:

**1. Healthy Eating**
- Reduce sugar and refined carbohydrates
- Eat more vegetables, fruits, and whole grains
- Control portion sizes
- Avoid sugary drinks

**2. Regular Exercise**
- Walk for 30 minutes daily
- Take stairs instead of lift
- Do yoga or stretching
- Any physical activity counts

**3. Maintain Healthy Weight**
- Losing 5-7% of body weight reduces diabetes risk by 58%
- Measure your waist - should be less than 35 inches for women, 40 for men

**4. Regular Checkups**
- Check blood sugar yearly after age 45
- Earlier if family history exists`,
        contentHindi: `सरल जीवनशैली में बदलाव से मधुमेह को रोका जा सकता है:

**1. स्वस्थ आहार**
- चीनी और रिफाइंड कार्बोहाइड्रेट कम करें
- अधिक सब्जियां, फल और साबुत अनाज खाएं

**2. नियमित व्यायाम**
- रोजाना 30 मिनट पैदल चलें
- लिफ्ट की जगह सीढ़ियों का उपयोग करें

**3. स्वस्थ वजन बनाए रखें**
- 5-7% वजन कम करने से मधुमेह का खतरा 58% कम होता है`,
        readTime: 5,
    },
    {
        id: 'monsoon-diseases',
        title: 'Monsoon Diseases: Prevention and Care',
        titleHindi: 'मानसून की बीमारियां: रोकथाम और देखभाल',
        category: 'Seasonal',
        content: `Stay healthy during monsoon season:

**Common Monsoon Diseases:**
- Dengue & Malaria (mosquito-borne)
- Typhoid & Cholera (water-borne)
- Viral Fever
- Leptospirosis

**Prevention Tips:**
1. Don't allow water to stagnate
2. Use mosquito nets and repellents
3. Drink only boiled or filtered water
4. Eat freshly cooked food
5. Wash hands frequently
6. Avoid street food during monsoon
7. Keep surroundings clean
8. Cover water storage containers

**When to See Doctor:**
- Fever lasting more than 2 days
- Severe headache with fever
- Rash or bleeding spots
- Vomiting or diarrhea`,
        contentHindi: `मानसून के मौसम में स्वस्थ रहें`,
        readTime: 4,
    },
    {
        id: 'child-vaccination',
        title: 'Complete Child Vaccination Guide',
        titleHindi: 'बच्चों का टीकाकरण गाइड',
        category: 'Child Health',
        content: `Universal Immunization Programme Schedule:

**At Birth:**
- BCG
- OPV-0 (Oral Polio)
- Hepatitis B (birth dose)

**6 Weeks:**
- OPV-1, Pentavalent-1, Rotavirus-1, PCV-1

**10 Weeks:**
- OPV-2, Pentavalent-2, Rotavirus-2

**14 Weeks:**
- OPV-3, Pentavalent-3, Rotavirus-3, PCV-2

**9-12 Months:**
- MR-1 (Measles-Rubella)
- Vitamin A

**16-24 Months:**
- DPT Booster, MR-2, OPV Booster

**All vaccines are FREE at government hospitals!**`,
        contentHindi: `यूनिवर्सल इम्यूनाइजेशन प्रोग्राम`,
        readTime: 3,
    },
];

// Regional Dialect Phrases
export const DIALECT_PHRASES: Record<string, Record<string, string>> = {
    en: {
        welcome: 'Welcome to DeepBlue Health',
        howAreYou: 'How are you feeling today?',
        symptoms: 'What symptoms are you experiencing?',
        emergency: 'This is an emergency!',
        callDoctor: 'Please consult a doctor',
    },
    hi: {
        welcome: 'डीपब्लू हेल्थ में आपका स्वागत है',
        howAreYou: 'आज आप कैसा महसूस कर रहे हैं?',
        symptoms: 'आपको क्या तकलीफ है?',
        emergency: 'यह आपातकाल है!',
        callDoctor: 'कृपया डॉक्टर से मिलें',
    },
    // Bhojpuri influenced Hindi (common in UP/Bihar)
    'hi-bhoj': {
        welcome: 'डीपब्लू हेल्थ में रउआ के स्वागत बा',
        howAreYou: 'आज तबियत कइसन बा?',
        symptoms: 'का तकलीफ बा?',
        emergency: 'जल्दी से मदद चाहीं!',
        callDoctor: 'डाक्टर के देखावा',
    },
    // Rajasthani influenced Hindi
    'hi-raj': {
        welcome: 'डीपब्लू हेल्थ मं थारो स्वागत है',
        howAreYou: 'आज थे कियां छो?',
        symptoms: 'के तकलीफ है?',
        emergency: 'फटाफट मदद चाहिजे!',
        callDoctor: 'डॉक्टर नै दिखाओ',
    },
};
