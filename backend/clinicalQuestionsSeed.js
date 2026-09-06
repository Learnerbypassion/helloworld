/**
 * Pre-defined Clinical Questions for MediKiosk
 * Stored in MongoDB and rendered directly without latency for known complaints.
 * Custom symptoms or voice inputs engage the Clinical AI generator dynamically.
 */

const SEED_QUESTIONS = [
  // ===================== FEVER =====================
  {
    symptom_key: "fever",
    question_order: 1,
    type: "duration",
    english: "When did your fever start?",
    translations: {
      Bengali: "আপনার জ্বর কখন শুরু হয়েছিল?",
      Hindi: "आपका बुखार कब शुरू हुआ?",
      Tamil: "உங்கள் காய்ச்சல் எப்போது தொடங்கியது?",
      Telugu: "మీ జ్వరం ఎప్పుడు ప్రారంభమైంది?",
      Marathi: "तुमचा ताप कधी सुरू झाला?",
      Gujarati: "તમારો તાવ ક્યારે શરૂ થયો?",
      Kannada: "ನಿಮ್ಮ ಜ್ವರ ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?",
    },
    options: {
      English: [
        { label: "Today / This morning", tone: "blue" },
        { label: "1–2 days before", tone: "blue" },
        { label: "3–4 days before", tone: "amber" },
        { label: "5–6 days before", tone: "amber" },
        { label: "More than 1 week ago", tone: "red" },
      ],
      Bengali: [
        { label: "আজ / আজ সকালে", tone: "blue" },
        { label: "১-২ দিন আগে", tone: "blue" },
        { label: "৩-৪ দিন আগে", tone: "amber" },
        { label: "৫-৬ দিন আগে", tone: "amber" },
        { label: "১ সপ্তাহের বেশি আগে", tone: "red" },
      ],
      Hindi: [
        { label: "आज / आज सुबह से", tone: "blue" },
        { label: "१-२ दिन पहले", tone: "blue" },
        { label: "३-४ दिन पहले", tone: "amber" },
        { label: "५-६ दिन पहले", tone: "amber" },
        { label: "१ सप्ताह से अधिक पहले", tone: "red" },
      ],
    }
  },
  {
    symptom_key: "fever",
    question_order: 2,
    type: "scale",
    english: "On a scale of 1-10, how high or severe is your fever discomfort?",
    translations: {
      Bengali: "1 থেকে 10 স্কেলে আপনার জ্বরের তীব্রতা বা কষ্ট কতটা?",
      Hindi: "1 से 10 के पैमाने पर आपके बुखार की तीव्रता या परेशानी कितनी है?",
      Tamil: "1 முதல் 10 வரையிலான அளவில் உங்கள் காய்ச்சலின் தீவிரம் எவ்வளவு?",
      Telugu: "1 నుండి 10 స్కేల్‌లో మీ జ్వరం తీవ్రత ఎంత?",
      Marathi: "1 ते 10 च्या प्रमाणात तुमच्या तापाची तीव्रता किती आहे?",
      Gujarati: "1 થી 10 ના સ્કેલ પર તમારા તાવની તીવ્રતા કેટલી છે?",
      Kannada: "1 ರಿಂದ 10 ರ ಪ್ರಮಾಣದಲ್ಲಿ ನಿಮ್ಮ ಜ್ವರದ ತೀವ್ರತೆ ಎಷ್ಟು?",
    }
  },
  {
    symptom_key: "fever",
    question_order: 3,
    type: "trigger",
    english: "Does resting or taking medicine bring down your fever?",
    translations: {
      Bengali: "ওষুধ খেলে বা বিশ্রাম নিলে কি জ্বর কমে?",
      Hindi: "क्या दवा लेने या आराम करने से बुखार कम होता है?",
    },
    options: {
      English: [
        { label: "Reduces with medication", tone: "green" },
        { label: "Worsens in evening/night", tone: "red" },
        { label: "Relieved by rest", tone: "green" },
        { label: "Comes with shivering", tone: "orange" },
        { label: "Constant high fever", tone: "red" },
      ],
      Bengali: [
        { label: "ওষুধ খেলে কমে", tone: "green" },
        { label: "সন্ধ্যা বা রাতে বাড়ে", tone: "red" },
        { label: "বিশ্রাম নিলে ভালো লাগে", tone: "green" },
        { label: "কাঁপুনি দিয়ে জ্বর আসে", tone: "orange" },
        { label: "সবসময় জ্বর থাকে", tone: "red" },
      ],
      Hindi: [
        { label: "दवा लेने से कम होता है", tone: "green" },
        { label: "शाम या रात को बढ़ता है", tone: "red" },
        { label: "आराम करने से राहत मिलती है", tone: "green" },
        { label: "कपकपी के साथ आता है", tone: "orange" },
        { label: "लगातार तेज बुखार रहता है", tone: "red" },
      ],
    }
  },
  {
    symptom_key: "fever",
    question_order: 4,
    type: "symptoms",
    english: "Do you have any chills, vomiting, headache, or cough along with fever?",
    translations: {
      Bengali: "জ্বরের সাথে কি কাঁপুনি, বমি ভাব, মাথাব্যথা বা কাশি আছে?",
      Hindi: "क्या बुखार के साथ ठंड, मतली, सिरदर्द या खांसी है?",
    },
    options: {
      English: [
        { label: "Yes, chills or shivering", tone: "red", icon: "🥶" },
        { label: "Yes, vomiting / nausea", tone: "red", icon: "🤮" },
        { label: "Severe headache / body ache", tone: "orange", icon: "🤕" },
        { label: "No other symptoms", tone: "green", icon: "✓" },
      ],
      Bengali: [
        { label: "হ্যাঁ, কাঁপুনি বা শীতভাব আছে", tone: "red", icon: "🥶" },
        { label: "হ্যাঁ, বমি বা বমি ভাব আছে", tone: "red", icon: "🤮" },
        { label: "তীব্র মাথাব্যথা / গায়ে ব্যথা", tone: "orange", icon: "🤕" },
        { label: "না, অন্য কোনো উপসর্গ নেই", tone: "green", icon: "✓" },
      ],
      Hindi: [
        { label: "हाँ, ठंड या कपकपी है", tone: "red", icon: "🥶" },
        { label: "हाँ, उल्टी या मतली है", tone: "red", icon: "🤮" },
        { label: "तेज सिरदर्द / बदन दर्द है", tone: "orange", icon: "🤕" },
        { label: "नहीं, कोई अन्य लक्षण नहीं", tone: "green", icon: "✓" },
      ],
    }
  },
  {
    symptom_key: "fever",
    question_order: 5,
    type: "medication",
    english: "Have you taken paracetamol or any other fever medication?",
    translations: {
      Bengali: "আপনি কি প্যারাসিটামল বা অন্য কোনো জ্বরের ওষুধ খেয়েছেন?",
      Hindi: "क्या आपने पैरासिटामोल या कोई अन्य बुखार की दवा ली है?",
    },
    options: {
      English: [
        { label: "Yes, took Paracetamol", tone: "blue", icon: "💊" },
        { label: "No medicine taken", tone: "red", icon: "✕" },
        { label: "Tried home remedies", tone: "amber", icon: "🍵" },
        { label: "Doctor prescribed medicine", tone: "green", icon: "🩺" },
      ],
      Bengali: [
        { label: "হ্যাঁ, প্যারাসিটামল খেয়েছি", tone: "blue", icon: "💊" },
        { label: "না, কোনো ওষুধ খাইনি", tone: "red", icon: "✕" },
        { label: "ঘরোয়া প্রতিকার করেছি", tone: "amber", icon: "🍵" },
        { label: "ডাক্তারের প্রেসক্রিপশন ওষুধ নিয়েছি", tone: "green", icon: "🩺" },
      ],
      Hindi: [
        { label: "हाँ, पैरासिटामोल ली है", tone: "blue", icon: "💊" },
        { label: "नहीं, कोई दवा नहीं ली", tone: "red", icon: "✕" },
        { label: "घरेलू उपचार किया", tone: "amber", icon: "🍵" },
        { label: "डॉक्टर द्वारा दी गई दवा ली", tone: "green", icon: "🩺" },
      ],
    }
  },

  // ===================== COUGH =====================
  {
    symptom_key: "cough",
    question_order: 1,
    type: "duration",
    english: "When did your cough start?",
    translations: {
      Bengali: "আপনার কাশি কখন শুরু হয়েছিল?",
      Hindi: "आपकी खांसी कब शुरू हुई थी?",
    },
    options: {
      English: [
        { label: "Today / This morning", tone: "blue" },
        { label: "1–2 days before", tone: "blue" },
        { label: "3–4 days before", tone: "amber" },
        { label: "5–6 days before", tone: "amber" },
        { label: "More than 1 week ago", tone: "red" },
      ],
      Bengali: [
        { label: "আজ / আজ সকালে", tone: "blue" },
        { label: "১-২ দিন আগে", tone: "blue" },
        { label: "৩-৪ দিন আগে", tone: "amber" },
        { label: "৫-৬ দিন আগে", tone: "amber" },
        { label: "১ সপ্তাহের বেশি আগে", tone: "red" },
      ],
      Hindi: [
        { label: "आज / आज सुबह से", tone: "blue" },
        { label: "१-२ दिन पहले", tone: "blue" },
        { label: "३-४ दिन पहले", tone: "amber" },
        { label: "५-६ दिन पहले", tone: "amber" },
        { label: "१ सप्ताह से अधिक पहले", tone: "red" },
      ],
    }
  },
  {
    symptom_key: "cough",
    question_order: 2,
    type: "scale",
    english: "On a scale of 1-10, how severe or frequent is your cough?",
    translations: {
      Bengali: "1 থেকে 10 স্কেলে আপনার কাশির তীব্রতা কেমন?",
      Hindi: "1 से 10 के पैमाने पर आपकी खांसी कितनी गंभीर है?",
    }
  },
  {
    symptom_key: "cough",
    question_order: 3,
    type: "trigger",
    english: "Is your cough dry or with mucus/phlegm?",
    translations: {
      Bengali: "আপনার কাশি কি শুকনো নাকি কফ বা শ্লেষ্মা আছে?",
      Hindi: "क्या आपकी खांसी सूखी है या बलगम वाली है?",
    },
    options: {
      English: [
        { label: "Dry cough", tone: "blue" },
        { label: "Wet cough with phlegm", tone: "amber" },
        { label: "Worsens at night", tone: "red" },
        { label: "Worsens in cold air", tone: "orange" },
        { label: "Relieved by warm fluids", tone: "green" },
      ],
      Bengali: [
        { label: "শুকনো কাশি", tone: "blue" },
        { label: "কফযুক্ত কাশি", tone: "amber" },
        { label: "রাতে কাশি বাড়ে", tone: "red" },
        { label: "ঠান্ডা লাগলে বাড়ে", tone: "orange" },
        { label: "গরম জল বা চা খেলে কমে", tone: "green" },
      ],
      Hindi: [
        { label: "सूखी खांसी", tone: "blue" },
        { label: "बलगम वाली खांसी", tone: "amber" },
        { label: "रात में खांसी बढ़ती है", tone: "red" },
        { label: "ठंडी हवा में बढ़ती है", tone: "orange" },
        { label: "गरम पानी/चाय से आराम मिलता है", tone: "green" },
      ],
    }
  },
  {
    symptom_key: "cough",
    question_order: 4,
    type: "symptoms",
    english: "Do you have any chest congestion, sore throat, or breathlessness?",
    translations: {
      Bengali: "বুকে চাপ, গলা ব্যথা বা শ্বাসকষ্ট আছে কি?",
      Hindi: "क्या सीने में जकड़न, गले में खराश या सांस फूलती है?",
    },
    options: {
      English: [
        { label: "Yes, sore throat present", tone: "amber" },
        { label: "Yes, mild breathlessness", tone: "red" },
        { label: "Chest tightness/wheezing", tone: "red" },
        { label: "No other symptoms", tone: "green" },
      ],
      Bengali: [
        { label: "হ্যাঁ, গলা ব্যথা আছে", tone: "amber" },
        { label: "হ্যাঁ, কিছুটা শ্বাসকষ্ট হয়", tone: "red" },
        { label: "বুকে সাঁই-সাঁই শব্দ / চাপ", tone: "red" },
        { label: "না, অন্য কোনো উপসর্গ নেই", tone: "green" },
      ],
      Hindi: [
        { label: "हाँ, गले में खराश है", tone: "amber" },
        { label: "हाँ, हल्की सांस फूलती है", tone: "red" },
        { label: "सीने में जकड़न महसूस होती है", tone: "red" },
        { label: "नहीं, कोई अन्य लक्षण नहीं", tone: "green" },
      ],
    }
  },
  {
    symptom_key: "cough",
    question_order: 5,
    type: "medication",
    english: "Have you taken any cough syrup, tablet, or steam inhalation?",
    translations: {
      Bengali: "আপনি কি কোনো কাশির সিরাপ, ওষুধ খেয়েছেন বা ভাপ নিয়েছেন?",
      Hindi: "क्या आपने कोई कफ सिरप, दवा ली है या भाप ली है?",
    },
    options: {
      English: [
        { label: "Took cough syrup", tone: "blue", icon: "🧴" },
        { label: "Taking steam / gargle", tone: "green", icon: "💨" },
        { label: "No medication taken", tone: "red", icon: "✕" },
        { label: "Doctor prescribed antibiotics", tone: "amber", icon: "💊" },
      ],
      Bengali: [
        { label: "কাশির সিরাপ খেয়েছি", tone: "blue", icon: "🧴" },
        { label: "ভাপ নিচ্ছি / গার্গল করছি", tone: "green", icon: "💨" },
        { label: "কোনো ওষুধ খাইনি", tone: "red", icon: "✕" },
        { label: "ডাক্তারের অ্যান্টিবায়োটিক খাচ্ছি", tone: "amber", icon: "💊" },
      ],
      Hindi: [
        { label: "कफ सिरप ली है", tone: "blue", icon: "🧴" },
        { label: "भाप ली / गरारे किए हैं", tone: "green", icon: "💨" },
        { label: "कोई दवा नहीं ली", tone: "red", icon: "✕" },
        { label: "डॉक्टर द्वारा दी गई दवा ली है", tone: "amber", icon: "💊" },
      ],
    }
  },

  // ===================== GENERAL =====================
  {
    symptom_key: "general",
    question_order: 1,
    type: "duration",
    english: "When did your symptoms start?",
    translations: {
      Bengali: "আপনার সমস্যা কখন শুরু হয়েছিল?",
      Hindi: "आपकी समस्या कब शुरू हुई थी?",
    },
    options: {
      English: [
        { label: "Today / This morning", tone: "blue" },
        { label: "1–2 days before", tone: "blue" },
        { label: "3–4 days before", tone: "amber" },
        { label: "5–6 days before", tone: "amber" },
        { label: "More than 1 week ago", tone: "red" },
      ],
      Bengali: [
        { label: "আজ / আজ সকালে", tone: "blue" },
        { label: "১-২ দিন আগে", tone: "blue" },
        { label: "৩-৪ দিন আগে", tone: "amber" },
        { label: "৫-৬ দিন আগে", tone: "amber" },
        { label: "১ সপ্তাহের বেশি আগে", tone: "red" },
      ],
      Hindi: [
        { label: "आज / आज सुबह से", tone: "blue" },
        { label: "१-२ दिन पहले", tone: "blue" },
        { label: "३-४ दिन पहले", tone: "amber" },
        { label: "५-६ दिन पहले", tone: "amber" },
        { label: "१ सप्ताह से अधिक पहले", tone: "red" },
      ],
    }
  },
  {
    symptom_key: "general",
    question_order: 2,
    type: "scale",
    english: "On a scale of 1-10, how severe is your discomfort?",
    translations: {
      Bengali: "1 থেকে 10 পর্যন্ত স্কেলে আপনার অস্বস্তি কতটা তীব্র?",
      Hindi: "1 से 10 के पैमाने पर आपकी तकलीफ कितनी गंभीर है?",
    }
  },
  {
    symptom_key: "general",
    question_order: 3,
    type: "trigger",
    english: "Does anything make your symptoms better or worse?",
    translations: {
      Bengali: "আপনার সমস্যা কি কোনো কারণে বাড়ে বা কোনো কিছুতে কমে?",
      Hindi: "क्या किसी चीज़ से आपके लक्षण बेहतर या बदतर हो जाते हैं?",
    },
    options: {
      English: [
        { label: "Reduces with medication", tone: "green" },
        { label: "Worsens after eating", tone: "red" },
        { label: "Relieved by rest", tone: "green" },
        { label: "Worsens with exertion", tone: "orange" },
        { label: "No specific trigger", tone: "slate" },
      ],
      Bengali: [
        { label: "ওষুধ খেলে কমে", tone: "green" },
        { label: "খাওয়ার পর বাড়ে", tone: "red" },
        { label: "বিশ্রাম নিলে ভালো লাগে", tone: "green" },
        { label: "হাঁটাচলা করলে বাড়ে", tone: "orange" },
        { label: "নির্দিষ্ট কোনো কারণ নেই", tone: "slate" },
      ],
      Hindi: [
        { label: "दवा लेने से कम होता है", tone: "green" },
        { label: "खाने के बाद बढ़ता है", tone: "red" },
        { label: "आराम करने से राहत मिलती है", tone: "green" },
        { label: "चलने-फिरने से बढ़ता है", tone: "orange" },
        { label: "कोई विशेष कारण नहीं", tone: "slate" },
      ],
    }
  },
  {
    symptom_key: "general",
    question_order: 4,
    type: "symptoms",
    english: "Do you have fever, nausea, or any other associated symptoms?",
    translations: {
      Bengali: "আপনার কি জ্বর, বমি ভাব বা অন্য কোনো সংশ্লিষ্ট উপসর্গ আছে?",
      Hindi: "क्या आपको बुखार, मतली या कोई अन्य संबंधित लक्षण है?",
    },
    options: {
      English: [
        { label: "Yes, fever or nausea present", tone: "red", icon: "🌡️" },
        { label: "No other symptoms", tone: "green", icon: "✓" },
        { label: "Only mild fatigue / weakness", tone: "amber", icon: "🥱" },
        { label: "Body ache or headache", tone: "orange", icon: "🤕" },
      ],
      Bengali: [
        { label: "হ্যাঁ, জ্বর বা বমি ভাব আছে", tone: "red", icon: "🌡️" },
        { label: "না, অন্য কোনো উপসর্গ নেই", tone: "green", icon: "✓" },
        { label: "শুধু দুর্বলতা বা ক্লান্তি আছে", tone: "amber", icon: "🥱" },
        { label: "গা-হাত-পা বা মাথা ব্যথা আছে", tone: "orange", icon: "🤕" },
      ],
      Hindi: [
        { label: "हाँ, बुखार या मतली है", tone: "red", icon: "🌡️" },
        { label: "नहीं, कोई अन्य लक्षण नहीं", tone: "green", icon: "✓" },
        { label: "केवल थकान या कमजोरी है", tone: "amber", icon: "🥱" },
        { label: "शरीर या सिर में दर्द है", tone: "orange", icon: "🤕" },
      ],
    }
  },
  {
    symptom_key: "general",
    question_order: 5,
    type: "medication",
    english: "Have you taken any medication for this? If yes, which one?",
    translations: {
      Bengali: "আপনি কি এর জন্য কোনো ওষুধ খেয়েছেন? যদি হ্যাঁ, তবে কোনটি?",
      Hindi: "क्या आपने इसके लिए कोई दवा ली है? यदि हाँ, तो कौन सी?",
    },
    options: {
      English: [
        { label: "Yes, took medication", tone: "green", icon: "✓" },
        { label: "No medicine taken", tone: "red", icon: "✕" },
        { label: "Took Paracetamol / Antacid", tone: "blue", icon: "💊" },
        { label: "Tried home remedies", tone: "amber", icon: "🍵" },
      ],
      Bengali: [
        { label: "হ্যাঁ, ওষুধ খেয়েছি", tone: "green", icon: "✓" },
        { label: "না, কোনো ওষুধ খাইনি", tone: "red", icon: "✕" },
        { label: "প্যারাসিটামল / অ্যান্টাসিড খেয়েছি", tone: "blue", icon: "💊" },
        { label: "ঘরোয়া প্রতিকার করেছি", tone: "amber", icon: "🍵" },
      ],
      Hindi: [
        { label: "हाँ, दवा ली है", tone: "green", icon: "✓" },
        { label: "नहीं, कोई दवा नहीं ली", tone: "red", icon: "✕" },
        { label: "पैरासिटामोल / एंटासिड ली", tone: "blue", icon: "💊" },
        { label: "घरेलू उपचार किया", tone: "amber", icon: "🍵" },
      ],
    }
  }
];

module.exports = { SEED_QUESTIONS };
