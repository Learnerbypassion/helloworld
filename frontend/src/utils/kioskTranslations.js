/**
 * Comprehensive Indian Language Localization for MediKiosk KioskFlow
 * Supports: English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada
 */

export const UI_TRANSLATIONS = {
  English: {
    customDiseasePlaceholder: 'Or type any custom disease / symptom (e.g. Ear pain, Dengue, Dental)...',
    add: 'Add',
    title: 'Dhanvantri',
    subTitle: 'Patient MediKiosk',
    welcomeTitle: 'Welcome to OPD',
    welcomeSubtitle: 'Select your language, then verify your ABHA ID or Mobile number.',
    selectLanguage: 'Select Language / भाषा चुनें',
    abhaPlaceholder: 'ABHA ID or Mobile (e.g. 12-3456-7890-1234)',
    patientFound: 'Patient Found',
    abhaRegistry: 'ABHA Registry',
    hospitalRecords: 'Hospital Records',
    walkinRegister: 'Skip / Walk-in Registration',
    verifyWithOtp: 'Verify with OTP',
    otpSubtitle: 'Enter 6-digit OTP sent to your Aadhaar-linked mobile',
    verifyOtpBtn: 'Verify OTP',
    verifying: 'Verifying...',
    resendOtp: 'Resend OTP',
    resendIn: 'Resend in {0}s',
    consentTitle: 'Patient Consent & Data Privacy',
    consentDesc: 'Please review the terms of digital health data usage before continuing.',
    consentItem1Title: 'ABHA Digital Health Record Linkage',
    consentItem1Desc: 'Your health records will be linked with Ayushman Bharat Digital Mission (ABDM).',
    consentItem2Title: 'AI-Guided Clinical Intake',
    consentItem2Desc: 'AI helps organize your symptoms and clinical history for your physician.',
    consentItem3Title: 'Confidential & Encrypted',
    consentItem3Desc: 'Data is protected under ABDM guidelines and accessible only to your assigned doctor.',
    consentBtn: 'I Consent & Continue',
    dpdpConsentTitle: "Audio-Visual Consent (DPDP Act 2023)",
    dpdpConsentDesc: "We require your consent to collect your symptoms and health records. This data is fully encrypted and will be deleted from this device immediately after your doctor reviews it.",
    iConsent: "I Consent",
    decline: "Decline",
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
    extreme: "Worst",
    scaleGuide: "1 = Mild  •  5 = Moderate  •  10 = Severe",
    showingHospitalDoctors: "Showing All Doctors at this Hospital",
    allDoctorsInHospital: "Available Doctors in Hospital",
    consultationTitle: 'Select Consultation Type',
    consultationSubtitle: 'Choose your medical discipline for today’s consultation.',
    allopathicTitle: 'Allopathic / Modern',
    allopathicDesc: 'Evidence-based modern medicine, clinical triage, and diagnostics.',
    ayushTitle: 'AYUSH (Ayurveda)',
    ayushDesc: 'Holistic traditional Indian medicine, Prakriti assessment, and herbal therapy.',
    symptomsTitle: 'What brings you here today?',
    symptomsSubtitle: 'Tap symptoms or use the mic to speak in {0}.',
    urgent: 'Urgent',
    redFlagAlert: 'Red Flag: Emergency symptoms selected. Priority triage activated.',
    tapToSpeak: 'Tap mic to speak in {0}',
    listening: 'Listening in {0}...',
    voicePlaceholder: 'Voice transcript appears here...',
    aiHistoryTitle: 'AI-Guided History',
    aiHistorySubtitle: 'Answer these questions to help your doctor assess your condition.',
    questionCount: 'Question {0} of {1}',
    answerPlaceholder: 'Type or speak your answer...',
    nextQuestion: 'Next Question',
    done: 'Done',
    skip: 'Skip',
    historyCaptured: 'History Captured',
    allAnswered: 'All {0} questions answered.',
    ayushTitleSection: 'Dashavidha Pariksha',
    uploadTitle: 'Past Medical Records (Optional)',
    uploadSubtitle: 'Upload past prescriptions, lab reports, or discharge summaries.',
    uploadBoxTitle: 'Tap or drop to upload medical document',
    uploadBoxSubtitle: 'Supports PDF, JPG, PNG (max 10MB). Powered by AI OCR.',
    uploadingDoc: 'Analyzing document with AI OCR...',
    ocrDataTitle: 'Extracted Medical Data (AI OCR)',
    skipUpload: 'Skip this Step',
    chooseDoctorTitle: 'Choose a Physician',
    chooseDoctorSubtitle: 'Select your preferred doctor. AI has highlighted its recommendation.',
    aiRecommendation: 'AI Recommendation:',
    aiPick: 'AI Pick',
    noDoctorsFound: 'No doctors found for this consultation mode. You will be auto-assigned.',
    summaryTitle: 'Physician-Ready Summary',
    patientDetails: 'Patient Details',
    chiefComplaints: 'Chief Complaints',
    clinicalHistory: 'Clinical History',
    selectedDoctor: 'Selected Doctor',
    submitToDoctor: 'Submit to Doctor',
    submitting: 'Submitting...',
    intakeCompleteTitle: 'Intake Complete',
    intakeCompleteDesc: 'Your clinical history has been securely transferred to the doctor\'s desk. Please proceed to the waiting area.',
    back: 'Back',
    next: 'Next',
    thinking: 'Thinking...',
    evaluating: 'Evaluating:',
    sarvamBadge: 'Sarvam Indic Voice 🇮🇳',
    bhasiniBadge: 'Bhasini ✓',
  },

  Hindi: {
    customDiseasePlaceholder: 'या कोई अन्य बीमारी / लक्षण लिखें (जैसे कान दर्द, डेंगू, दांत दर्द)...',
    add: 'जोड़ें',
    title: 'धन्वन्तरि',
    subTitle: 'रोगी मेडिकियोस्क',
    welcomeTitle: 'ओपीडी में आपका स्वागत है',
    welcomeSubtitle: 'अपनी भाषा चुनें, फिर अपनी आभा आईडी या मोबाइल नंबर सत्यापित करें।',
    selectLanguage: 'भाषा चुनें / Select Language',
    abhaPlaceholder: 'आभा आईडी या मोबाइल (उदा. 12-3456-7890-1234)',
    patientFound: 'रोगी का विवरण मिला',
    abhaRegistry: 'आभा रजिस्ट्री',
    hospitalRecords: 'अस्पताल रिकॉर्ड',
    walkinRegister: 'छोड़ें / वॉक-इन पंजीकरण',
    verifyWithOtp: 'ओटीपी से सत्यापित करें',
    otpSubtitle: 'अपने आधार से जुड़े मोबाइल पर भेजा गया 6 अंकों का ओटीपी दर्ज करें',
    verifyOtpBtn: 'ओटीपी सत्यापित करें',
    verifying: 'सत्यापन हो रहा है...',
    resendOtp: 'ओटीपी पुनः भेजें',
    resendIn: '{0} सेकंड में पुनः भेजें',
    consentTitle: 'रोगी सहमति और डेटा गोपनीयता',
    consentDesc: 'आगे बढ़ने से पहले कृपया डिजिटल स्वास्थ्य डेटा उपयोग की शर्तों की समीक्षा करें।',
    consentItem1Title: 'आभा डिजिटल स्वास्थ्य रिकॉर्ड लिंकेज',
    consentItem1Desc: 'आपके स्वास्थ्य रिकॉर्ड आयुष्मान भारत डिजिटल मिशन (ABDM) से जुड़े होंगे।',
    consentItem2Title: 'एआई-निर्देशित क्लिनिकल इंटेक',
    consentItem2Desc: 'एआई आपके लक्षणों और इतिहास को डॉक्टर के लिए व्यवस्थित करने में मदद करता है।',
    consentItem3Title: 'गोपनीय और सुरक्षित',
    consentItem3Desc: 'डेटा पूरी तरह सुरक्षित है और केवल आपके डॉक्टर के लिए सुलभ है।',
    consentBtn: 'मैं सहमत हूँ और आगे बढ़ें',
    dpdpConsentTitle: "ऑडियो-विजुअल सहमति (DPDP अधिनियम 2023)",
    dpdpConsentDesc: "आपके लक्षण और स्वास्थ्य रिकॉर्ड एकत्र करने के लिए हमें आपकी सहमति की आवश्यकता है। यह डेटा पूरी तरह से एन्क्रिप्टेड है और डॉक्टर द्वारा समीक्षा के तुरंत बाद इस डिवाइस से हटा दिया जाएगा।",
    iConsent: "मैं सहमत हूँ",
    decline: "अस्वीकार करें",
    mild: "हल्का",
    moderate: "मध्यम",
    severe: "गंभीर",
    extreme: "अत्यधिक",
    scaleGuide: "1 = हल्का  •  5 = मध्यम  •  10 = गंभीर",
    showingHospitalDoctors: "इस अस्पताल के सभी उपस्थित डॉक्टर दिखाए जा रहे हैं",
    allDoctorsInHospital: "अस्पताल में उपलब्ध डॉक्टर",
    consultationTitle: 'परामर्श का प्रकार चुनें',
    consultationSubtitle: 'आज के परामर्श के लिए अपनी चिकित्सा पद्धति चुनें।',
    allopathicTitle: 'एलोपैथिक / आधुनिक चिकित्सा',
    allopathicDesc: 'साक्ष्य-आधारित आधुनिक चिकित्सा, क्लिनिकल ट्राइएज और परीक्षण।',
    ayushTitle: 'आयुष (आयुर्वेद)',
    ayushDesc: 'पारंपरिक भारतीय समग्र चिकित्सा, प्रकृति परीक्षण और प्राकृतिक उपचार।',
    symptomsTitle: 'आज आपको क्या समस्या है?',
    symptomsSubtitle: 'लक्षणों पर टैप करें या {0} में बोलने के लिए माइक का उपयोग करें।',
    urgent: 'आपातकालीन',
    redFlagAlert: 'चेतावनी: आपातकालीन लक्षण चुने गए हैं। प्राथमिकता ट्राइएज सक्रिय किया गया।',
    tapToSpeak: '{0} में बोलने के लिए माइक दबाएं',
    listening: '{0} में सुन रहे हैं...',
    voicePlaceholder: 'आपकी आवाज यहां पाठ रूप में दिखेगी...',
    aiHistoryTitle: 'एआई-निर्देशित क्लिनिकल इतिहास',
    aiHistorySubtitle: 'डॉक्टर की मदद के लिए इन प्रश्नों के उत्तर दें।',
    questionCount: 'प्रश्न {0} / {1}',
    answerPlaceholder: 'अपना उत्तर लिखें या बोलें...',
    nextQuestion: 'अगला प्रश्न',
    done: 'पूर्ण',
    skip: 'छोड़ें',
    historyCaptured: 'इतिहास दर्ज हुआ',
    allAnswered: 'सभी {0} प्रश्नों के उत्तर दे दिए गए हैं।',
    ayushTitleSection: 'दशविध परीक्षा',
    uploadTitle: 'पुराने मेडिकल रिकॉर्ड (वैकल्पिक)',
    uploadSubtitle: 'अपने पुराने पर्चे, लैब रिपोर्ट या डिस्चार्ज समरी अपलोड करें।',
    uploadBoxTitle: 'दस्तावेज़ अपलोड करने के लिए टैप करें',
    uploadBoxSubtitle: 'पीडीएफ, जेपीजी, पीएनजी समर्थित (अधिकतम 10MB)। एआई ओसीआर सक्षम।',
    uploadingDoc: 'एआई द्वारा दस्तावेज़ का विश्लेषण जारी है...',
    ocrDataTitle: 'निकाला गया मेडिकल डेटा (एआई ओसीआर)',
    skipUpload: 'यह चरण छोड़ें',
    chooseDoctorTitle: 'चिकित्सक का चयन करें',
    chooseDoctorSubtitle: 'अपने पसंदीदा डॉक्टर चुनें। एआई ने सबसे उपयुक्त डॉक्टर सुझाया है।',
    aiRecommendation: 'एआई सिफारिश:',
    aiPick: 'एआई चयन',
    noDoctorsFound: 'इस पद्धति के लिए कोई डॉक्टर उपलब्ध नहीं हैं। आपको स्वतः आवंटित किया जाएगा।',
    summaryTitle: 'डॉक्टर हेतु तैयार सारांश',
    patientDetails: 'रोगी का विवरण',
    chiefComplaints: 'मुख्य समस्याएं',
    clinicalHistory: 'क्लिनिकल इतिहास',
    selectedDoctor: 'चयनित डॉक्टर',
    submitToDoctor: 'डॉक्टर को भेजें',
    submitting: 'जमा हो रहा है...',
    intakeCompleteTitle: 'पंजीकरण पूर्ण हुआ',
    intakeCompleteDesc: 'आपका इतिहास सुरक्षित रूप से डॉक्टर की डेस्क पर भेज दिया गया है। कृपया प्रतीक्षा क्षेत्र में जाएं।',
    back: 'पीछे',
    next: 'आगे बढ़ें',
    thinking: 'विचार कर रहा है...',
    evaluating: 'मूल्यांकन:',
    sarvamBadge: 'सर्वम इंडिक वॉइस 🇮🇳',
    bhasiniBadge: 'भाषिणी ✓',
  },

  Bengali: {
    customDiseasePlaceholder: 'বা অন্য কোনো রোগ / উপসর্গ লিখুন (যেমন কান ব্যথা, ডেঙ্গু, দাঁত ব্যথা)...',
    add: 'যোগ করুন',
    title: 'ধন্বন্তরি',
    subTitle: 'রোগী মেডিকিয়স্ক',
    welcomeTitle: 'ওপিডিতে স্বাগতম',
    welcomeSubtitle: 'আপনার ভাষা নির্বাচন করুন, তারপর আভা আইডি বা মোবাইল নম্বর যাচাই করুন।',
    selectLanguage: 'ভাষা নির্বাচন করুন / Select Language',
    abhaPlaceholder: 'আভা আইডি বা মোবাইল নম্বর (যেমন: 12-3456-7890-1234)',
    patientFound: 'রোগীর তথ্য পাওয়া গেছে',
    abhaRegistry: 'আভা রেজিস্ট্রি',
    hospitalRecords: 'হাসপাতাল রেকর্ড',
    walkinRegister: 'এড়িয়ে যান / ওয়াক-ইন নিবন্ধন',
    verifyWithOtp: 'ওটিপি দিয়ে যাচাই করুন',
    otpSubtitle: 'আপনার আধার-সংযুক্ত মোবাইলে পাঠানো ৬ সংখ্যার ওটিপি লিখুন',
    verifyOtpBtn: 'ওটিপি যাচাই করুন',
    verifying: 'যাচাই করা হচ্ছে...',
    resendOtp: 'ওটিপি পুনরায় পাঠান',
    resendIn: '{0} সেকেন্ডে পুনরায় পাঠান',
    consentTitle: 'রোগীর সম্মতি ও ডেটা গোপনীয়তা',
    consentDesc: 'এগিয়ে যাওয়ার আগে ডিজিটাল স্বাস্থ্য ডেটা ব্যবহারের শর্তাবলী পর্যালোচনা করুন।',
    consentItem1Title: 'আভা ডিজিটাল স্বাস্থ্য রেকর্ড সংযুক্তি',
    consentItem1Desc: 'আপনার স্বাস্থ্য রেকর্ড আয়ুষ্মান ভারত ডিজিটাল মিশনের (ABDM) সাথে সংযুক্ত হবে।',
    consentItem2Title: 'এআই-নির্দেশিত ক্লিনিক্যাল ইনটেক',
    consentItem2Desc: 'এআই ডাক্তারের জন্য আপনার উপসর্গ ও পূর্ব ইতিহাস সাজিয়ে দিতে সাহায্য করে।',
    consentItem3Title: 'গোপনীয় এবং সুরক্ষিত',
    consentItem3Desc: 'তথ্য সম্পূর্ণ সুরক্ষিত এবং শুধুমাত্র আপনার নিযুক্ত ডাক্তারের কাছে দৃশ্যমান।',
    consentBtn: 'আমি সম্মতি দিচ্ছি ও এগিয়ে যান',
    dpdpConsentTitle: "অডিও-ভিজ্যুয়াল সম্মতি (DPDP আইন ২০২৩)",
    dpdpConsentDesc: "আপনার উপসর্গ এবং স্বাস্থ্য রেকর্ড সংগ্রহের জন্য আমরা আপনার সম্মতি চাইছি। এই তথ্য সম্পূর্ণ এনক্রিপ্ট করা থাকে এবং ডাক্তার দেখার পরপরই এই ডিভাইস থেকে মুছে ফেলা হবে।",
    iConsent: "আমি সম্মতি দিচ্ছি",
    decline: "প্রত্যাখ্যান করুন",
    mild: "মৃদু",
    moderate: "মাঝারি",
    severe: "তীব্র",
    extreme: "চরম",
    scaleGuide: "১ = মৃদু  •  ৫ = মাঝারি  •  ১০ = তীব্র",
    showingHospitalDoctors: "এই হাসপাতালে উপস্থিত সকল ডাক্তার দেখানো হচ্ছে",
    allDoctorsInHospital: "হাসপাতালে উপলব্ধ চিকিৎসকবৃন্দ",
    consultationTitle: 'পরামর্শের ধরন নির্বাচন করুন',
    consultationSubtitle: 'আজকের পরামর্শের জন্য আপনার চিকিৎসার ধরন বেছে নিন।',
    allopathicTitle: 'অ্যালোপ্যাথিক / আধুনিক চিকিৎসা',
    allopathicDesc: 'প্রমাণ-ভিত্তিক আধুনিক চিকিৎসা, ক্লিনিক্যাল ট্রায়াজ এবং রোগ নির্ণয়।',
    ayushTitle: 'আয়ুশ (আয়ুর্বেদ)',
    ayushDesc: 'ঐতিহ্যবাহী ভারতীয় সামগ্রিক চিকিৎসা, প্রকৃতি মূল্যায়ন এবং ভেষজ প্রতিকার।',
    symptomsTitle: 'আজ আপনার কী সমস্যা হচ্ছে?',
    symptomsSubtitle: 'উপসর্গে চাপুন অথবা {0} ভাষায় বলতে মাইক ব্যবহার করুন।',
    urgent: 'জরুরি',
    redFlagAlert: 'সতর্কতা: জরুরি উপসর্গ নির্বাচিত হয়েছে। অগ্রাধিকার ট্রায়াজ সক্রিয়।',
    tapToSpeak: '{0} ভাষায় কথা বলতে মাইকে চাপুন',
    listening: '{0} ভাষায় শোনা হচ্ছে...',
    voicePlaceholder: 'আপনার কথা এখানে টেক্সট হিসেবে আসবে...',
    aiHistoryTitle: 'এআই-নির্দেশিত ইতিহাস',
    aiHistorySubtitle: 'আপনার ডাক্তারকে সাহায্য করতে এই প্রশ্নগুলির উত্তর দিন।',
    questionCount: 'প্রশ্ন {0} / {1}',
    answerPlaceholder: 'উত্তর লিখুন বা মুখে বলুন...',
    nextQuestion: 'পরবর্তী প্রশ্ন',
    done: 'সম্পন্ন',
    skip: 'এড়িয়ে যান',
    historyCaptured: 'ইতিহাস লিপিবদ্ধ হয়েছে',
    allAnswered: 'সবগুলি {0}টি প্রশ্নের উত্তর দেওয়া হয়েছে।',
    ayushTitleSection: 'দশবিধ পরীক্ষা',
    uploadTitle: 'পূর্ববর্তী মেডিকেল রেকর্ড (ঐচ্ছিক)',
    uploadSubtitle: 'আপনার আগের প্রেসক্রিপশন, ল্যাব রিপোর্ট বা ডিসচার্জ সামারি আপলোড করুন।',
    uploadBoxTitle: 'ডকুমেন্ট আপলোড করতে এখানে চাপুন',
    uploadBoxSubtitle: 'পিডিএফ, জেপিজি, পিএনজি সমর্থিত (সর্বোচ্চ ১০MB)। এআই ওসিআর যুক্ত।',
    uploadingDoc: 'এআই দ্বারা বিশ্লেষণ করা হচ্ছে...',
    ocrDataTitle: 'সংগৃহীত মেডিকেল ডেটা (এআই ওসিআর)',
    skipUpload: 'এই ধাপ এড়িয়ে যান',
    chooseDoctorTitle: 'চিকিৎসক নির্বাচন করুন',
    chooseDoctorSubtitle: 'আপনার পছন্দের ডাক্তার বেছে নিন। এআই সবচেয়ে উপযুক্ত ডাক্তার নির্দেশ করেছে।',
    aiRecommendation: 'এআই সুপারিশ:',
    aiPick: 'এআই পছন্দ',
    noDoctorsFound: 'এই বিভাগের জন্য কোনো ডাক্তার পাওয়া যায়নি। স্বয়ংক্রিয়ভাবে বরাদ্দ করা হবে।',
    summaryTitle: 'ডাক্তারের জন্য প্রস্তুত সারাংশ',
    patientDetails: 'রোগীর বিবরণ',
    chiefComplaints: 'প্রধান সমস্যা',
    clinicalHistory: 'ক্লিনিক্যাল ইতিহাস',
    selectedDoctor: 'নির্বাচিত ডাক্তার',
    submitToDoctor: 'ডাক্তারের কাছে পাঠান',
    submitting: 'জমা দেওয়া হচ্ছে...',
    intakeCompleteTitle: 'ইনটেক সম্পন্ন হয়েছে',
    intakeCompleteDesc: 'আপনার ক্লিনিক্যাল ইতিহাস নিরাপদে ডাক্তারের ডেস্কে স্থানান্তরিত হয়েছে। অনুগ্রহ করে অপেক্ষা স্থানে যান।',
    back: 'পেছনে',
    next: 'পরবর্তী',
    thinking: 'চিন্তা করছে...',
    evaluating: 'বিশ্লেষণ চলছে:',
    sarvamBadge: 'সার্বম ইন্ডিয়া ভয়েস 🇮🇳',
    bhasiniBadge: 'ভাশিনী ✓',
  },

  Tamil: {
    customDiseasePlaceholder: 'அல்லது வேறு நோய் / அறிகுறியை தட்டச்சு செய்க (எ.கா. காது வலி, டெங்கு)...',
    add: 'சேர்',
    title: 'தன்வந்திரி',
    subTitle: 'நோயாளி மெடிகியோஸ்க்',
    welcomeTitle: 'OPD-க்கு நல்வரவு',
    welcomeSubtitle: 'உங்கள் மொழியைத் தேர்ந்தெடுத்து, உங்கள் ABHA ஐடி அல்லது மொபைல் எண்ணை சரிபார்க்கவும்.',
    selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    abhaPlaceholder: 'ABHA ஐடி அல்லது மொபைல் (எ.கா. 12-3456-7890-1234)',
    patientFound: 'நோயாளி விவரம் கிடைத்தது',
    abhaRegistry: 'ABHA பதிவகம்',
    hospitalRecords: 'மருத்துவமனை பதிவுகள்',
    walkinRegister: 'தவிர்க்கவும் / புதிய பதிவு',
    verifyWithOtp: 'OTP மூலம் சரிபார்க்கவும்',
    otpSubtitle: 'உங்கள் மொபைலுக்கு அனுப்பப்பட்ட 6 இலக்க OTP-ஐ உள்ளிடவும்',
    verifyOtpBtn: 'OTP சரிபார்க்கவும்',
    verifying: 'சரிபார்க்கிறது...',
    resendOtp: 'OTP மீண்டும் அனுப்பவும்',
    resendIn: '{0} வினாடிகளில் மீண்டும் அனுப்பவும்',
    consentTitle: 'நோயாளி சம்மதம் மற்றும் தரவு தனியுரிமை',
    consentDesc: 'தொடர்வதற்கு முன் டிஜிட்டல் சுகாதார தரவு பயன்பாட்டு விதிமுறைகளை மதிப்பாய்வு செய்யவும்.',
    consentItem1Title: 'ABHA டிஜிட்டல் சுகாதார இணைப்பு',
    consentItem1Desc: 'உங்கள் சுகாதாரப் பதிவுகள் ABDM திட்டத்துடன் இணைக்கப்படும்.',
    consentItem2Title: 'AI மருத்துவ உதவி',
    consentItem2Desc: 'உங்கள் மருத்துவருக்கு அறிகுறிகளை ஒழுங்கமைக்க AI உதவுகிறது.',
    consentItem3Title: 'ரகசியமானது மற்றும் பாதுகாப்பானது',
    consentItem3Desc: 'தரவு முழுமையாக பாதுகாப்பானது மற்றும் உங்கள் மருத்துவருக்கு மட்டுமே கிடைக்கும்.',
    consentBtn: 'நான் சம்மதிக்கிறேன் & தொடரவும்',
    dpdpConsentTitle: "ஆடியோ-விஷுவல் ஒப்புதல் (DPDP சட்டம் 2023)",
    dpdpConsentDesc: "உங்கள் அறிகுறிகள் மற்றும் மருத்துவப் பதிவுகளைச் சேகரிக்க உங்கள் ஒப்புதல் தேவை. இந்தத் தரவு முழுமையாக என்க்ரிப்ட் செய்யப்பட்டு, மருத்துவர் பார்த்தவுடன் அழிக்கப்படும்.",
    iConsent: "நான் ஒப்புக்கொள்கிறேன்",
    decline: "நிராகரி",
    mild: "லேசானது",
    moderate: "மிதமான",
    severe: "கடுமையான",
    extreme: "மிகக் கடுமையான",
    scaleGuide: "1 = லேசானது  •  5 = மிதமான  •  10 = கடுமையான",
    showingHospitalDoctors: "இந்த மருத்துவமனையில் உள்ள அனைத்து மருத்துவர்களும் காட்டப்படுகிறார்கள்",
    allDoctorsInHospital: "மருத்துவமனையில் கிடைக்கும் மருத்துவர்கள்",
    consultationTitle: 'ஆலோசனை வகையைத் தேர்ந்தெடுக்கவும்',
    consultationSubtitle: 'இன்றைய ஆலோசனைக்கான மருத்துவப் பிரிவைத் தேர்ந்தெடுக்கவும்.',
    allopathicTitle: 'அலோபதி / நவீன மருத்துவம்',
    allopathicDesc: 'நவீன மருத்துவம், மருத்துவ வகைப்பாடு மற்றும் பரிசோதனை.',
    ayushTitle: 'ஆயுஷ் (ஆயுர்வேதம்)',
    ayushDesc: 'பாரம்பரிய இந்திய மருத்துவம் மற்றும் இயற்கை சிகிச்சை.',
    symptomsTitle: 'இன்று உங்களுக்கு என்ன பிரச்சனை?',
    symptomsSubtitle: 'அறிகுறிகளைத் தட்டவும் அல்லது {0} இல் பேச மைக்கைப் பயன்படுத்தவும்.',
    urgent: 'அவசரம்',
    redFlagAlert: 'எச்சரிக்கை: அவசர அறிகுறிகள் தேர்ந்தெடுக்கப்பட்டன. முன்னுரிமை சிகிச்சை செயல்படுத்தப்பட்டது.',
    tapToSpeak: '{0} இல் பேச மைக்கைத் தொடவும்',
    listening: '{0} இல் கேட்கிறது...',
    voicePlaceholder: 'உங்கள் பேச்சு இங்கே உரையாகத் தோன்றும்...',
    aiHistoryTitle: 'AI-வழிகாட்டப்பட்ட வரலாறு',
    aiHistorySubtitle: 'மருத்துவருக்கு உதவ இந்த கேள்விகளுக்கு பதிலளிக்கவும்.',
    questionCount: 'கேள்வி {0} / {1}',
    answerPlaceholder: 'உங்கள் பதிலை தட்டச்சு செய்யவும் அல்லது பேசவும்...',
    nextQuestion: 'அடுத்த கேள்வி',
    done: 'முடிந்தது',
    skip: 'தவிர்க்கவும்',
    historyCaptured: 'வரலாறு பதிவு செய்யப்பட்டது',
    allAnswered: 'அனைத்து {0} கேள்விகளுக்கும் பதிலளிக்கப்பட்டது.',
    ayushTitleSection: 'தசவித பரீட்சை',
    uploadTitle: 'முந்தைய மருத்துவ பதிவுகள் (விருப்பத்திற்குரியது)',
    uploadSubtitle: 'முந்தைய மருந்துச் சீட்டுகள், ஆய்வக அறிக்கைகளை பதிவேற்றவும்.',
    uploadBoxTitle: 'ஆவணத்தைப் பதிவேற்ற தட்டவும்',
    uploadBoxSubtitle: 'PDF, JPG, PNG ஆதரிக்கப்படுகிறது (அதிகபட்சம் 10MB).',
    uploadingDoc: 'AI ஆவணத்தை பகுப்பாய்வு செய்கிறது...',
    ocrDataTitle: 'பிரித்தெடுக்கப்பட்ட மருத்துவ தரவு',
    skipUpload: 'இந்த படியைத் தவிர்க்கவும்',
    chooseDoctorTitle: 'மருத்துவரைத் தேர்ந்தெடுக்கவும்',
    chooseDoctorSubtitle: 'உங்களுக்கு விருப்பமான மருத்துவரைத் தேர்ந்தெடுக்கவும்.',
    aiRecommendation: 'AI பரிந்துரை:',
    aiPick: 'AI தேர்வு',
    noDoctorsFound: 'மருத்துவர்கள் இல்லை. தானாக ஒதுக்கப்படுவீர்கள்.',
    summaryTitle: 'மருத்துவர் சுருக்கம்',
    patientDetails: 'நோயாளி விவரங்கள்',
    chiefComplaints: 'முக்கிய புகார்கள்',
    clinicalHistory: 'மருத்துவ வரலாறு',
    selectedDoctor: 'தேர்ந்தெடுக்கப்பட்ட மருத்துவர்',
    submitToDoctor: 'மருத்துவரிடம் சமர்ப்பிக்கவும்',
    submitting: 'சமர்ப்பிக்கப்படுகிறது...',
    intakeCompleteTitle: 'பதிவு முடிந்தது',
    intakeCompleteDesc: 'உங்கள் விவரங்கள் மருத்துவருக்கு பாதுகாப்பாக அனுப்பப்பட்டன. காத்திருப்பு அறைக்கு செல்லவும்.',
    back: 'பின்னால்',
    next: 'அடுத்து',
    thinking: 'யோசிக்கிறது...',
    evaluating: 'மதிப்பிடுகிறது:',
    sarvamBadge: 'சர்வம் இண்டிக் வாய்ஸ் 🇮🇳',
    bhasiniBadge: 'பாஷிணி ✓',
  },

  Telugu: {
    customDiseasePlaceholder: 'లేదా ఇతర వ్యాధి / లక్షణాన్ని టైప్ చేయండి (ఉదా. చెవి నొప్పి, డెంగ్యూ)...',
    add: 'జోడించు',
    title: 'ధన్వంతరి',
    subTitle: 'పేషెంట్ మెడికియోస్క్',
    welcomeTitle: 'OPDకి స్వాగతం',
    welcomeSubtitle: 'మీ భాషను ఎంచుకోండి, ఆపై మీ ఆభా ID లేదా మొబైల్ నంబర్‌ను ధృవీకరించండి.',
    selectLanguage: 'భాషను ఎంచుకోండి',
    abhaPlaceholder: 'ఆభా ID లేదా మొబైల్ (ఉదా. 12-3456-7890-1234)',
    patientFound: 'రోగి వివరాలు లభించాయి',
    abhaRegistry: 'ఆభా రిజిస్ట్రీ',
    hospitalRecords: 'ఆసుపత్రి రికార్డులు',
    walkinRegister: 'దాటవేయి / వాక్-ఇన్ నమోదు',
    verifyWithOtp: 'OTPతో ధృవీకరించండి',
    otpSubtitle: 'మీ మొబైల్‌కు పంపిన 6 అంకెల OTPని నమోదు చేయండి',
    verifyOtpBtn: 'OTP ధృవీకరించండి',
    verifying: 'ధృవీకరిస్తోంది...',
    resendOtp: 'OTP మళ్లీ పంపండి',
    resendIn: '{0} సెకన్లలో మళ్లీ పంపండి',
    consentTitle: 'రోగి సమ్మతి & డేటా గోప్యత',
    consentDesc: 'ముందుకు వెళ్లే ముందు డిజిటల్ ఆరోగ్య డేటా వినియోగ నిబంధనలను సమీక్షించండి.',
    consentItem1Title: 'ఆభా డిజిటల్ హెల్త్ రికార్డ్ లింకేజ్',
    consentItem1Desc: 'మీ ఆరోగ్య రికార్డులు ABDMతో లింక్ చేయబడతాయి.',
    consentItem2Title: 'AI-గైడెడ్ క్లినికల్ ఇన్‌టేక్',
    consentItem2Desc: 'డాక్టర్ కోసం మీ లక్షణాలను నిర్వహించడంలో AI సహాయపడుతుంది.',
    consentItem3Title: 'గోప్యమైనది మరియు సురక్షితమైనది',
    consentItem3Desc: 'డేటా పూర్తిగా సురక్షితం మరియు మీ డాక్టర్‌కు మాత్రమే అందుబాటులో ఉంటుంది.',
    consentBtn: 'నేను అంగీకరిస్తున్నాను & కొనసాగించండి',
    dpdpConsentTitle: "ఆడియో-విజువల్ సమ్మతి (DPDP చట్టం 2023)",
    dpdpConsentDesc: "మీ లక్షణాలు మరియు ఆరోగ్య రికార్డులను సేకరించడానికి మీ సమ్మతి అవసరం. ఈ డేటా పూర్తిగా ఎన్‌క్రిప్ట్ చేయబడింది మరియు డాక్టర్ చూసిన వెంటనే తొలగించబడుతుంది.",
    iConsent: "నేను అంగీకరిస్తున్నాను",
    decline: "తిరస్కరించండి",
    mild: "తేలికపాటి",
    moderate: "మధ్యస్థ",
    severe: "తీవ్రమైన",
    extreme: "అత్యంత తీవ్రమైన",
    scaleGuide: "1 = తేలికపాటి  •  5 = మధ్యస్థ  •  10 = తీవ్రమైన",
    showingHospitalDoctors: "ఈ ఆసుపత్రిలోని అందుబాటులో ఉన్న వైద్యులందరూ చూపబడుతున్నారు",
    allDoctorsInHospital: "ఆసుపత్రిలో అందుబాటులో ఉన్న వైద్యులు",
    consultationTitle: 'సంప్రదింపుల రకాన్ని ఎంచుకోండి',
    consultationSubtitle: 'నేటి సంప్రదింపుల కోసం మీ వైద్య విభాగాన్ని ఎంచుకోండి.',
    allopathicTitle: 'అల్లోపతి / ఆధునిక వైద్యం',
    allopathicDesc: 'ఆధారణ ఆధారిత ఆధునిక వైద్యం మరియు పరీక్షలు.',
    ayushTitle: 'ఆయుష్ (ఆయుర్వేదం)',
    ayushDesc: 'సాంప్రదాయ భారతీయ వైద్యం మరియు మూలికా చికిత్స.',
    symptomsTitle: 'ఈ రోజు మీకు ఉన్న సమస్య ఏమిటి?',
    symptomsSubtitle: 'లక్షణాలపై నొక్కండి లేదా {0}లో మాట్లాడటానికి మైక్ ఉపయోగించండి.',
    urgent: 'అత్యవసరం',
    redFlagAlert: 'హెచ్చరిక: అత్యవసర లక్షణాలు ఎంపిక చేయబడ్డాయి. ప్రాధాన్యత ట్రయాజ్ సక్రియం చేయబడింది.',
    tapToSpeak: '{0}లో మాట్లాడటానికి మైక్ నొక్కండి',
    listening: '{0}లో వింటోంది...',
    voicePlaceholder: 'మీ మాటలు ఇక్కడ వస్తాయి...',
    aiHistoryTitle: 'AI-గైడెడ్ హిస్టరీ',
    aiHistorySubtitle: 'డాక్టర్‌కు సహాయపడటానికి ఈ ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    questionCount: 'ప్రశ్న {0} / {1}',
    answerPlaceholder: 'సమాధానం టైప్ చేయండి లేదా మాట్లాడండి...',
    nextQuestion: 'తదుపరి ప్రశ్న',
    done: 'పూర్తయింది',
    skip: 'దాటవేయి',
    historyCaptured: 'వివరాలు నమోదు చేయబడ్డాయి',
    allAnswered: 'అన్ని {0} ప్రశ్నలకు సమాధానాలు ఇచ్చారు.',
    ayushTitleSection: 'దశవిధ పరీక్ష',
    uploadTitle: 'గత వైద్య రికార్డులు (ఐచ్ఛికం)',
    uploadSubtitle: 'మునుపటి ప్రిస్క్రిప్షన్‌లు, ల్యాబ్ నివేదికలను అప్‌లోడ్ చేయండి.',
    uploadBoxTitle: 'డాక్యుమెంట్ అప్‌లోడ్ చేయడానికి నొక్కండి',
    uploadBoxSubtitle: 'PDF, JPG, PNG మద్దతు ఉంది (గరిష్టంగా 10MB).',
    uploadingDoc: 'AI పత్రాన్ని విశ్లేషిస్తోంది...',
    ocrDataTitle: 'సేకరించిన వైద్య డేటా',
    skipUpload: 'ఈ దశను దాటవేయి',
    chooseDoctorTitle: 'వైద్యుడిని ఎంచుకోండి',
    chooseDoctorSubtitle: 'మీరు కోరుకున్న వైద్యుడిని ఎంచుకోండి.',
    aiRecommendation: 'AI సిఫార్సు:',
    aiPick: 'AI ఎంపిక',
    noDoctorsFound: 'వైద్యులు అందుబాటులో లేరు.',
    summaryTitle: 'డాక్టర్ సారాంశం',
    patientDetails: 'రోగి వివరాలు',
    chiefComplaints: 'ప్రధాన సమస్యలు',
    clinicalHistory: 'క్లినికల్ చరిత్ర',
    selectedDoctor: 'ఎంచుకున్న డాక్టర్',
    submitToDoctor: 'డాక్టర్‌కు పంపండి',
    submitting: 'సమర్పిస్తోంది...',
    intakeCompleteTitle: 'పూర్తయింది',
    intakeCompleteDesc: 'మీ వివరాలు డాక్టర్‌కు సురక్షితంగా పంపబడ్డాయి. దయచేసి వెయిటింగ్ ఏరియాకు వెళ్లండి.',
    back: 'వెనుకకు',
    next: 'తదుపరి',
    thinking: 'ఆలోచిస్తోంది...',
    evaluating: 'విశ్లేషిస్తోంది:',
    sarvamBadge: 'సర్వం ఇండిక్ వాయిస్ 🇮🇳',
    bhasiniBadge: 'భాషిణి ✓',
  },

  Marathi: {
    customDiseasePlaceholder: 'किंवा इतर आजार / लक्षण लिहा (उदा. कान दुखणे, डेंग्यू)...',
    add: 'जोडा',
    title: 'धन्वन्तरि',
    subTitle: 'रुग्ण मेडिकिओस्क',
    welcomeTitle: 'ओपीडी मध्ये आपले स्वागत आहे',
    welcomeSubtitle: 'आपली भाषा निवडा, नंतर आपला आभा आयडी किंवा मोबाईल नंबर सत्यापित करा.',
    selectLanguage: 'भाषा निवडा',
    abhaPlaceholder: 'आभा आयडी किंवा मोबाईल (उदा. 12-3456-7890-1234)',
    patientFound: 'रुग्णाची माहिती सापडली',
    abhaRegistry: 'आभा नोंदणी',
    hospitalRecords: 'रुग्णालय रेकॉर्ड',
    walkinRegister: 'वगळा / वॉक-इन नोंदणी',
    verifyWithOtp: 'ओटीपी द्वारे सत्यापित करा',
    otpSubtitle: 'आपल्या मोबाईलवर पाठवलेला ६ अंकी ओटीपी टाका',
    verifyOtpBtn: 'ओटीपी सत्यापित करा',
    verifying: 'सत्यापित होत आहे...',
    resendOtp: 'ओटीपी पुन्हा पाठवा',
    resendIn: '{0} सेकंदात पुन्हा पाठवा',
    consentTitle: 'रुग्ण संमती आणि डेटा गोपनीयता',
    consentDesc: 'पुढे जाण्यापूर्वी डिजिटल आरोग्य डेटा वापर अटींचे पुनरावलोकन करा.',
    consentItem1Title: 'आभा डिजिटल हेल्थ रेकॉर्ड जोडणी',
    consentItem1Desc: 'आपले रेकॉर्ड ABDM शी जोडले जातील.',
    consentItem2Title: 'एआय-मार्गदर्शित क्लिनिकल तपासणी',
    consentItem2Desc: 'एआय डॉक्टरांसाठी आपली लक्षणे व्यवस्थित करण्यात मदत करते.',
    consentItem3Title: 'गोपनीय आणि सुरक्षित',
    consentItem3Desc: 'डेटा पूर्णपणे सुरक्षित आहे आणि फक्त आपल्या डॉक्टरांना उपलब्ध आहे.',
    consentBtn: 'मी संमती देतो आणि पुढे जा',
    dpdpConsentTitle: "ऑडिओ-व्हिज्युअल संमती (DPDP कायदा 2023)",
    dpdpConsentDesc: "तुमची लक्षणे आणि आरोग्य नोंदी गोळा करण्यासाठी आम्हाला तुमच्या संमतीची आवश्यकता आहे. हा डेटा पूर्णपणे एन्क्रिप्ट केलेला आहे आणि डॉक्टरांच्या तपासणीनंतर लगेच हटवला जाईल.",
    iConsent: "मी संमती देतो/देते",
    decline: "नकार द्या",
    mild: "सौम्य",
    moderate: "मध्यम",
    severe: "तीव्र",
    extreme: "अत्यंत तीव्र",
    scaleGuide: "1 = सौम्य  •  5 = मध्यम  •  10 = तीव्र",
    showingHospitalDoctors: "या रुग्णालयातील सर्व उपस्थित डॉक्टर दाखवले जात आहेत",
    allDoctorsInHospital: "रुग्णालयात उपलब्ध डॉक्टर",
    consultationTitle: 'सल्लामसलत प्रकार निवडा',
    consultationSubtitle: 'आजच्या सल्ल्यासाठी आपली वैद्यकीय पद्धती निवडा.',
    allopathicTitle: 'अ‍ॅलोपॅथिक / आधुनिक औषधोपचार',
    allopathicDesc: 'पुरावा-आधारित आधुनिक औषधोपचार आणि निदान.',
    ayushTitle: 'आयुष (आयुर्वेद)',
    ayushDesc: 'पारंपारिक भारतीय औषधोपचार आणि नैसर्गिक उपचार.',
    symptomsTitle: 'आज आपल्याला काय त्रास होत आहे?',
    symptomsSubtitle: 'लक्षणांवर टॅप करा किंवा {0} मध्ये बोलण्यासाठी माइक वापरा.',
    urgent: 'तातडीचे',
    redFlagAlert: 'धोका: तातडीची लक्षणे निवडली आहेत. प्राधान्य उपचार सक्रिय.',
    tapToSpeak: '{0} मध्ये बोलण्यासाठी माइक दाबा',
    listening: '{0} मध्ये ऐकत आहे...',
    voicePlaceholder: 'आपले बोलणे येथे दिसेल...',
    aiHistoryTitle: 'एआय-मार्गदर्शित इतिहास',
    aiHistorySubtitle: 'डॉक्टरांच्या मदतीसाठी या प्रश्नांची उत्तरे द्या.',
    questionCount: 'प्रश्न {0} / {1}',
    answerPlaceholder: 'उत्तर टाइप करा किंवा बोला...',
    nextQuestion: 'पुढील प्रश्न',
    done: 'पूर्ण',
    skip: 'वगळा',
    historyCaptured: 'इतिहास नोंदवला गेला',
    allAnswered: 'सर्व {0} प्रश्नांची उत्तरे दिली आहेत.',
    ayushTitleSection: 'दशविध परीक्षा',
    uploadTitle: 'मागील वैद्यकीय रेकॉर्ड (पर्यायी)',
    uploadSubtitle: 'जुने प्रिस्क्रिप्शन किंवा लॅब रिपोर्ट अपलोड करा.',
    uploadBoxTitle: 'दस्तऐवज अपलोड करण्यासाठी टॅप करा',
    uploadBoxSubtitle: 'पीडीएफ, जेपीजी समर्थित (कमाल १०MB).',
    uploadingDoc: 'एआय दस्तऐवजाचे विश्लेषण करत आहे...',
    ocrDataTitle: 'काढलेला वैद्यकीय डेटा',
    skipUpload: 'हा टप्पा वगळा',
    chooseDoctorTitle: 'डॉक्टर निवडा',
    chooseDoctorSubtitle: 'आपले पसंतीचे डॉक्टर निवडा.',
    aiRecommendation: 'एआय शिफारस:',
    aiPick: 'एआय निवड',
    noDoctorsFound: 'या पद्धतीसाठी डॉक्टर उपलब्ध नाहीत.',
    summaryTitle: 'डॉक्टरांसाठी सारांश',
    patientDetails: 'रुग्ण तपशील',
    chiefComplaints: 'मुख्य तक्रारी',
    clinicalHistory: 'क्लिनिकल इतिहास',
    selectedDoctor: 'निवडलेले डॉक्टर',
    submitToDoctor: 'डॉक्टरांकडे पाठवा',
    submitting: 'सादर करत आहे...',
    intakeCompleteTitle: 'नोंदणी पूर्ण झाली',
    intakeCompleteDesc: 'आपला इतिहास सुरक्षितपणे डॉक्टरांकडे पाठवला गेला आहे. कृपया प्रतीक्षा कक्षात जा.',
    back: 'मागे',
    next: 'पुढे',
    thinking: 'विचार करत आहे...',
    evaluating: 'मूल्यमापन:',
    sarvamBadge: 'सर्वम इंडिक व्हॉईस 🇮🇳',
    bhasiniBadge: 'भाषिणी ✓',
  },

  Gujarati: {
    customDiseasePlaceholder: 'અથવા અન્ય રોગ / લક્ષણ લખો (દા.ત. કાનનો દુખાવો, ડેન્ગ્યુ)...',
    add: 'ઉમેરો',
    title: 'ધન્વંતરિ',
    subTitle: 'દર્દી મેડિકિઓસ્ક',
    welcomeTitle: 'OPD માં આપનું સ્વાગત છે',
    welcomeSubtitle: 'તમારી ભાષા પસંદ કરો, પછી તમારો આભા ID અથવા મોબાઇલ નંબર ચકાસો.',
    selectLanguage: 'ભાષા પસંદ કરો',
    abhaPlaceholder: 'આભા ID અથવા મોબાઇલ (દા.ત. 12-3456-7890-1234)',
    patientFound: 'દર્દીની વિગતો મળી',
    abhaRegistry: 'આભા રજિસ્ટ્રી',
    hospitalRecords: 'હોસ્પિટલ રેકોર્ડ્સ',
    walkinRegister: 'છોડો / વૉક-ઇન નોંધણી',
    verifyWithOtp: 'OTP સાથે ચકાસો',
    otpSubtitle: 'મોબાઇલ પર મોકલેલ ૬ અંકનો OTP દાખલ કરો',
    verifyOtpBtn: 'OTP ચકાસો',
    verifying: 'ચકાસી રહ્યું છે...',
    resendOtp: 'OTP ફરીથી મોકલો',
    resendIn: '{0} સેકન્ડમાં ફરીથી મોકલો',
    consentTitle: 'દર્દી સંમતિ અને ડેટા ગોપનીયતા',
    consentDesc: 'આગળ વધતા પહેલા ડિજિટલ હેલ્થ ડેટા વપરાશની શરતોની સમીક્ષા કરો.',
    consentItem1Title: 'આભા ડિજિટલ હેલ્થ રેકોર્ડ જોડાણ',
    consentItem1Desc: 'તમારા રેકોર્ડ્સ ABDM સાથે લિંક થશે.',
    consentItem2Title: 'AI-માર્ગદર્શિત ક્લિનિકલ ઇન્ટેક',
    consentItem2Desc: 'AI ડૉક્ટર માટે તમારા લક્ષણો ગોઠવવામાં મદદ કરે છે.',
    consentItem3Title: 'ગુપ્ત અને સુરક્ષિત',
    consentItem3Desc: 'ડેટા સંપૂર્ણપણે સુરક્ષિત છે અને ફક્ત ડૉક્ટર માટે ઉપલબ્ધ છે.',
    consentBtn: 'હું સંમત છું અને આગળ વધો',
    dpdpConsentTitle: "ઓડિયો-વિઝ્યુઅલ સંમતિ (DPDP એક્ટ 2023)",
    dpdpConsentDesc: "તમારા લક્ષણો અને આરોગ્ય રેકોર્ડ એકત્રિત કરવા માટે તમારી સંમતિ જરૂરી છે. આ ડેટા સંપૂર્ણપણે એન્ક્રિપ્ટેડ છે અને ડૉક્ટર તપાસ્યા પછી તરત જ કાઢી નાખવામાં આવશે.",
    iConsent: "હું સંમત છું",
    decline: "અસ્વીકાર કરો",
    mild: "હળવું",
    moderate: "મધ્યમ",
    severe: "ગંભીર",
    extreme: "અત્યંત ગંભીર",
    scaleGuide: "1 = હળવું  •  5 = મધ્યમ  •  10 = ગંભીર",
    showingHospitalDoctors: "આ હોસ્પિટલના તમામ ઉપલબ્ધ ડૉક્ટરો દર્શાવવામાં આવી રહ્યા છે",
    allDoctorsInHospital: "હોસ્પિટલમાં ઉપલબ્ધ ડૉક્ટર્સ",
    consultationTitle: 'પરામર્શનો પ્રકાર પસંદ કરો',
    consultationSubtitle: 'આજના પરામર્શ માટે તબીબી પદ્ધતિ પસંદ કરો.',
    allopathicTitle: 'એલોપેથિક / આધુનિક દવા',
    allopathicDesc: 'પુરાવા આધારિત આધુનિક દવા અને નિદાન.',
    ayushTitle: 'આયુષ (આયુર્વેદ)',
    ayushDesc: 'પરંપરાગત ભારતીય દવા અને કુદરતી સારવાર.',
    symptomsTitle: 'આજે તમને શું તકલીફ છે?',
    symptomsSubtitle: 'લક્ષણો પર ટેપ કરો અથવા {0} માં બોલવા માટે માઇક વાપરો.',
    urgent: 'તાત્કાલિક',
    redFlagAlert: 'ચેતવણી: કટોકટીના લક્ષણો પસંદ કરેલ છે. અગ્રતા સારવાર સક્રિય.',
    tapToSpeak: '{0} માં બોલવા માટે માઇક દબાવો',
    listening: '{0} માં સાંભળી રહ્યું છે...',
    voicePlaceholder: 'તમારો અવાજ અહીં લખાણમાં દેખાશે...',
    aiHistoryTitle: 'AI-માર્ગદર્શિત ઇતિહાસ',
    aiHistorySubtitle: 'ડૉક્ટરને મદદ કરવા આ પ્રશ્નોના જવાબ આપો.',
    questionCount: 'પ્રશ્ન {0} / {1}',
    answerPlaceholder: 'જવાબ લખો અથવા બોલો...',
    nextQuestion: 'આગળનો પ્રશ્ન',
    done: 'સંપૂર્ણ',
    skip: 'છોડો',
    historyCaptured: 'ઇતિહાસ નોંધાયો',
    allAnswered: 'બધા {0} પ્રશ્નોના જવાબો આપ્યા.',
    ayushTitleSection: 'દશવિધ પરીક્ષા',
    uploadTitle: 'ગત તબીબી રેકોર્ડ્સ (વૈકલ્પિક)',
    uploadSubtitle: 'જૂના પ્રિસ્ક્રિપ્શન અથવા લેબ રિપોર્ટ્સ અપલોડ કરો.',
    uploadBoxTitle: 'દસ્તાવેજ અપલોડ કરવા ટેપ કરો',
    uploadBoxSubtitle: 'PDF, JPG સપોર્ટેડ (મહત્તમ 10MB).',
    uploadingDoc: 'AI દસ્તાવેજનું વિશ્લેષણ કરી રહ્યું છે...',
    ocrDataTitle: 'તારવેલ તબીબી ડેટા',
    skipUpload: 'આ પગલું છોડો',
    chooseDoctorTitle: 'ડૉક્ટર પસંદ કરો',
    chooseDoctorSubtitle: 'તમારા પસંદગીના ડૉક્ટર પસંદ કરો.',
    aiRecommendation: 'AI ભલામણ:',
    aiPick: 'AI પસંદગી',
    noDoctorsFound: 'આ પદ્ધતિ માટે ડૉક્ટર ઉપલબ્ધ નથી.',
    summaryTitle: 'ડૉક્ટર સારાંશ',
    patientDetails: 'દર્દીની વિગતો',
    chiefComplaints: 'મુખ્ય ફરિયાદો',
    clinicalHistory: 'ક્લિનિકલ ઇતિહાસ',
    selectedDoctor: 'પસંદ કરેલ ડૉક્ટર',
    submitToDoctor: 'ડૉક્ટરને મોકલો',
    submitting: 'સબમિટ કરી રહ્યું છે...',
    intakeCompleteTitle: 'પ્રક્રિયા પૂર્ણ થઈ',
    intakeCompleteDesc: 'તમારી વિગતો ડૉક્ટરને સુરક્ષિત રીતે મોકલાઈ ગઈ છે. કૃપા કરીને પ્રતીક્ષા કક્ષમાં જાઓ.',
    back: 'પાછળ',
    next: 'આગળ',
    thinking: 'વિચારી રહ્યું છે...',
    evaluating: 'મૂલ્યાંકન:',
    sarvamBadge: 'સર્વમ ઇન્ડિક વૉઇસ 🇮🇳',
    bhasiniBadge: 'ભાષિણી ✓',
  },

  Kannada: {
    customDiseasePlaceholder: 'ಅಥವಾ ಇತರ ಕಾಯಿಲೆ / ಲಕ್ಷಣವನ್ನು ಟೈಪ್ ಮಾಡಿ (ಉದಾ. ಕಿವಿ ನೋವು, ಡೆಂಗ್ಯೂ)...',
    add: 'ಸೇರಿಸಿ',
    title: 'ಧನ್ವಂತರಿ',
    subTitle: 'ರೋಗಿ ಮೆಡಿಕಿಯೋಸ್ಕ್',
    welcomeTitle: 'OPD ಗೆ ಸ್ವಾಗತ',
    welcomeSubtitle: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ, ನಂತರ ನಿಮ್ಮ ABHA ID ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
    selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    abhaPlaceholder: 'ABHA ID ಅಥವಾ ಮೊಬೈಲ್ (ಉದಾ. 12-3456-7890-1234)',
    patientFound: 'ರೋಗಿಯ ಮಾಹಿತಿ ಸಿಕ್ಕಿದೆ',
    abhaRegistry: 'ABHA ನೋಂದಣಿ',
    hospitalRecords: 'ಆಸ್ಪತ್ರೆ ದಾಖಲೆಗಳು',
    walkinRegister: 'ಬಿಟ್ಟುಬಿಡಿ / ಹೊಸ ನೋಂದಣಿ',
    verifyWithOtp: 'OTP ಮೂಲಕ ಪರಿಶೀಲಿಸಿ',
    otpSubtitle: 'ನಿಮ್ಮ ಮೊಬೈಲ್‌ಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ',
    verifyOtpBtn: 'OTP ಪರಿಶೀಲಿಸಿ',
    verifying: 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    resendOtp: 'OTP ಮರುಕಳುಹಿಸಿ',
    resendIn: '{0} ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮರುಕಳುಹಿಸಿ',
    consentTitle: 'ರೋಗಿಯ ಒಪ್ಪಿಗೆ ಮತ್ತು ಗೌಪ್ಯತೆ',
    consentDesc: 'ಮುಂದುವರಿಯುವ ಮೊದಲು ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಡೇಟಾ ಬಳಕೆಯ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
    consentItem1Title: 'ABHA ಡಿಜಿಟಲ್ ಆರೋಗ್ಯ ಲಿಂಕ್',
    consentItem1Desc: 'ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ABDM ನೊಂದಿಗೆ ಲಿಂಕ್ ಮಾಡಲಾಗುತ್ತದೆ.',
    consentItem2Title: 'AI-ಮಾರ್ಗದರ್ಶಿತ ಚಿಕಿತ್ಸಾ ಮಾಹಿತಿ',
    consentItem2Desc: 'ವೈದ್ಯರಿಗಾಗಿ ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಸಂಘಟಿಸಲು AI ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    consentItem3Title: 'ಗೌಪ್ಯ ಮತ್ತು ಸುರಕ್ಷಿತ',
    consentItem3Desc: 'ಡೇಟಾ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದೆ ಮತ್ತು ನಿಮ್ಮ ವೈದ್ಯರಿಗೆ ಮಾತ್ರ ಲಭ್ಯವಿರುತ್ತದೆ.',
    consentBtn: 'ನಾನು ಒಪ್ಪುತ್ತೇನೆ ಮತ್ತು ಮುಂದುವರಿಯಿರಿ',
    dpdpConsentTitle: "ಆಡಿಯೋ-ವಿಶುವಲ್ ಒಪ್ಪಿಗೆ (DPDP ಕಾಯಿದೆ 2023)",
    dpdpConsentDesc: "ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು ಮತ್ತು ಆರೋಗ್ಯ ದಾಖಲೆಗಳನ್ನು ಸಂಗ್ರಹಿಸಲು ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯ ಅಗತ್ಯವಿದೆ. ಈ ಡೇಟಾವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾಗಿದ್ದು, ವೈದ್ಯರು ಪರಿಶೀಲಿಸಿದ ತಕ್ಷಣ ಅಳಿಸಲಾಗುತ್ತದೆ.",
    iConsent: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ",
    decline: "ನಿರಾಕರಿಸಿ",
    mild: "ಸೌಮ್ಯ",
    moderate: "ಮಧ್ಯಮ",
    severe: "ತೀವ್ರ",
    extreme: "ಅತ್ಯಂತ ತೀವ್ರ",
    scaleGuide: "1 = ಸೌಮ್ಯ  •  5 = ಮಧ್ಯಮ  •  10 = ತೀವ್ರ",
    showingHospitalDoctors: "ಈ ಆಸ್ಪತ್ರೆಯಲ್ಲಿರುವ ಎಲ್ಲಾ ವೈದ್ಯರನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    allDoctorsInHospital: "ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಲಭ್ಯವಿರುವ ವೈದ್ಯರು",
    consultationTitle: 'ಸಮಾಲೋಚನೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    consultationSubtitle: 'ಇಂದಿನ ಸಮಾಲೋಚನೆಗಾಗಿ ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವಿಭಾಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
    allopathicTitle: 'ಅಲೋಪತಿ / ಆಧುನಿಕ ಔಷಧ',
    allopathicDesc: 'ಆಧಾರಿತ ಆಧುನಿಕ ಔಷಧ ಮತ್ತು ರೋಗನಿರ್ಣಯ.',
    ayushTitle: 'ಆಯುಷ್ (ಆಯುರ್ವೇದ)',
    ayushDesc: 'ಸಾಂಪ್ರದಾಯಿಕ ಭಾರತೀಯ ಔಷಧ ಮತ್ತು ಗಿಡಮೂಲಿಕೆ ಚಿಕಿತ್ಸೆ.',
    symptomsTitle: 'ಇಂದು ನಿಮ್ಮ ಸಮಸ್ಯೆ ಏನು?',
    symptomsSubtitle: 'ಲಕ್ಷಣಗಳನ್ನು ಒತ್ತಿರಿ ಅಥವಾ {0} ನಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಬಳಸಿ.',
    urgent: 'ತುರ್ತು',
    redFlagAlert: 'ಎಚ್ಚರಿಕೆ: ತುರ್ತು ಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಆದ್ಯತೆಯ ಚಿಕಿತ್ಸೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ.',
    tapToSpeak: '{0} ನಲ್ಲಿ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ',
    listening: '{0} ನಲ್ಲಿ ಕೇಳಲಾಗುತ್ತಿದೆ...',
    voicePlaceholder: 'ನಿಮ್ಮ ಮಾತುಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ...',
    aiHistoryTitle: 'AI-ಮಾರ್ಗದರ್ಶಿತ ಇತಿಹಾಸ',
    aiHistorySubtitle: 'ವೈದ್ಯರಿಗೆ ಸಹಾಯ ಮಾಡಲು ಈ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
    questionCount: 'ಪ್ರಶ್ನೆ {0} / {1}',
    answerPlaceholder: 'ಉತ್ತರವನ್ನು ಬರೆಯಿರಿ ಅಥವಾ ಮಾತನಾಡಿ...',
    nextQuestion: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ',
    done: 'ಮುಗಿದಿದೆ',
    skip: 'ಬಿಟ್ಟುಬಿಡಿ',
    historyCaptured: 'ಇತಿಹಾಸ ದಾಖಲಾಗಿದೆ',
    allAnswered: 'ಎಲ್ಲಾ {0} ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಲಾಗಿದೆ.',
    ayushTitleSection: 'ದಶವಿಧ ಪರೀಕ್ಷೆ',
    uploadTitle: 'ಹಿಂದಿನ ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು (ಐಚ್ಛಿಕ)',
    uploadSubtitle: 'ಹಿಂದಿನ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು, ಲ್ಯಾಬ್ ವರದಿಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    uploadBoxTitle: 'ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಒತ್ತಿರಿ',
    uploadBoxSubtitle: 'PDF, JPG ಬೆಂಬಲಿತವಾಗಿದೆ (ಗರಿಷ್ಠ 10MB).',
    uploadingDoc: 'AI ದಾಖಲೆಯನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...',
    ocrDataTitle: 'ಹೊರತೆಗೆಯಲಾದ ವೈದ್ಯಕೀಯ ಡೇಟಾ',
    skipUpload: 'ಈ ಹಂತವನ್ನು ಬಿಟ್ಟುಬಿಡಿ',
    chooseDoctorTitle: 'ವೈದ್ಯರನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    chooseDoctorSubtitle: 'ನಿಮ್ಮ ಆಯ್ಕೆಯ ವೈದ್ಯರನ್ನು ಆರಿಸಿ.',
    aiRecommendation: 'AI ಶಿಫಾರಸು:',
    aiPick: 'AI ಆಯ್ಕೆ',
    noDoctorsFound: 'ವೈದ್ಯರು ಲಭ್ಯವಿಲ್ಲ.',
    summaryTitle: 'ವೈದ್ಯರ ಸಾರಾಂಶ',
    patientDetails: 'ರೋಗಿಯ ವಿವರಗಳು',
    chiefComplaints: 'ಪ್ರಮುಖ ಸಮಸ್ಯೆಗಳು',
    clinicalHistory: 'ಕ್ಲಿನಿಕಲ್ ಇತಿಹಾಸ',
    selectedDoctor: 'ಆಯ್ಕೆಮಾಡಿದ ವೈದ್ಯರು',
    submitToDoctor: 'ವೈದ್ಯರಿಗೆ ಕಳುಹಿಸಿ',
    submitting: 'ಸಲ್ಲಿಸಲಾಗುತ್ತಿದೆ...',
    intakeCompleteTitle: 'ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ',
    intakeCompleteDesc: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ವೈದ್ಯರಿಗೆ ಸುರಕ್ಷಿತವಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಕಾಯುವ ಕೋಣೆಗೆ ತೆರಳಿ.',
    back: 'ಹಿಂದೆ',
    next: 'ಮುಂದೆ',
    thinking: 'ಯೋಚಿಸುತ್ತಿದೆ...',
    evaluating: 'ಮೌಲ್ಯಮಾಪನ:',
    sarvamBadge: 'ಸರ್ವಂ ಇಂಡಿಕ್ ಧ್ವನಿ 🇮🇳',
    bhasiniBadge: 'ಭಾಷಿಣಿ ✓',
  },
};

export const SYMPTOM_TRANSLATIONS = {
  fever: {
    English: 'Fever', Hindi: 'बुखार', Bengali: 'জ্বর', Tamil: 'காய்ச்சல்', Telugu: 'జ్వరం', Marathi: 'ताप', Gujarati: 'તાવ', Kannada: 'ಜ್ವರ'
  },
  cough: {
    English: 'Cough', Hindi: 'खांसी', Bengali: 'কাশি', Tamil: 'இருமல்', Telugu: 'దగ్గు', Marathi: 'खोकला', Gujarati: 'ઉધરસ', Kannada: 'ಕೆಮ್ಮು'
  },
  headache: {
    English: 'Headache', Hindi: 'सिरदर्द', Bengali: 'মাথাব্যথা', Tamil: 'தலைவலி', Telugu: 'తలనొప్పి', Marathi: 'डोकेदुखी', Gujarati: 'માથાનો દુખાવો', Kannada: 'ತಲೆನೋವು'
  },
  stomach: {
    English: 'Stomach Pain', Hindi: 'पेट दर्द', Bengali: 'পেট ব্যথা', Tamil: 'வயிற்று வலி', Telugu: 'కడుపు నొప్పి', Marathi: 'पोटदुखी', Gujarati: 'પેટનો દુખાવો', Kannada: 'ಹೊಟ್ಟೆ ನೋವು'
  },
  chest: {
    English: 'Chest Pain', Hindi: 'सीने में दर्द', Bengali: 'বুকে ব্যথা', Tamil: 'நெஞ்சு வலி', Telugu: 'ఛాతీ నొప్పి', Marathi: 'छातीत दुखणे', Gujarati: 'છાતીમાં દુખાવો', Kannada: 'ಎದೆ ನೋವು'
  },
  weakness: {
    English: 'Weakness / Fatigue', Hindi: 'कमजोरी / थकान', Bengali: 'দুর্বলতা / ক্লান্তি', Tamil: 'சோர்வு / பலவீனம்', Telugu: 'నీరసం / అలసట', Marathi: 'अशक्तपणा / थकवा', Gujarati: 'નબળાઈ / થાક', Kannada: 'ದೌರ್ಬಲ್ಯ / ಆಯಾಸ'
  },
  breathless: {
    English: 'Breathlessness', Hindi: 'सांस फूलना', Bengali: 'শ্বাসকষ্ট', Tamil: 'மூச்சுத்திணறல்', Telugu: 'శ్వాస ఆడకపోవడం', Marathi: 'श्वास लागणे', Gujarati: 'શ્વાસ લેવામાં તકલીફ', Kannada: 'ಉಸಿರಾಟದ ತೊಂದರೆ'
  },
  vomiting: {
    English: 'Vomiting / Nausea', Hindi: 'उल्टी / मतली', Bengali: 'বমি / বমি ভাব', Tamil: 'வாந்தி / குமட்டல்', Telugu: 'వాంతులు / వికారం', Marathi: 'उलटी / मळमळ', Gujarati: 'ઉલ્ટી / ઉબકા', Kannada: 'ವಾಂತಿ / ವಾಕರಿಕೆ'
  },
  joint_pain: {
    English: 'Joint Pain', Hindi: 'जोड़ों का दर्द', Bengali: 'জয়েন্টে ব্যথা', Tamil: 'மூட்டு வலி', Telugu: 'కీళ్ల నొప్పులు', Marathi: 'सांधेदुखी', Gujarati: 'સાંધાનો દુખાવો', Kannada: 'ಕೀಲು ನೋವು'
  },
  skin: {
    English: 'Skin Rash', Hindi: 'त्वचा पर चकत्ते', Bengali: 'ত্বকের ফুসকুড়ি', Tamil: 'தோல் தடிப்பு', Telugu: 'చర్మ దద్దుర్లు', Marathi: 'त्वचेवर पुरळ', Gujarati: 'ત્વચા પર ફોલ્લીઓ', Kannada: 'ಚರ್ಮದ ದದ್ದು'
  },
  urinary: {
    English: 'Urinary Issues', Hindi: 'मूत्र संबंधी समस्याएं', Bengali: 'প্রস্রাবের সমস্যা', Tamil: 'சிறுநீர் பிரச்சினைகள்', Telugu: 'మూత్ర సమస్యలు', Marathi: 'लघवीचा त्रास', Gujarati: 'પેશાબની સમસ્યાઓ', Kannada: 'ಮೂತ್ರದ ಸಮಸ್ಯೆಗಳು'
  },
  eye: {
    English: 'Eye Problems', Hindi: 'आंखों की समस्या', Bengali: 'চোখের সমস্যা', Tamil: 'கண் பிரச்சினைகள்', Telugu: 'కంటి సమస్యలు', Marathi: 'डोळ्यांच्या समस्या', Gujarati: 'આંખની સમસ્યાઓ', Kannada: 'ಕಣ್ಣಿನ ಸಮಸ್ಯೆಗಳು'
  }
};

export const STEP_PROMPTS_BY_LANG = {
  English: {
    0: 'Welcome to Dhanvantri. Please select your language and enter your ABHA ID or mobile number.',
    1: 'Please review the consent information and tap I Consent to continue.',
    2: 'Please select your consultation type: Allopathic or AYUSH.',
    3: 'Please select your symptoms or speak to describe your condition.',
    4: 'Please answer a few questions to help your doctor.',
    4.5: 'Please answer the Dashavidha Pariksha questions to assess your Ayurvedic constitution.',
    5: 'You may upload your past prescriptions or lab reports.',
    6: 'Please choose your preferred doctor. Our AI has highlighted a recommendation.',
    7: 'Please review your intake summary before submitting.',
    8: 'Your intake is complete. Please proceed to the waiting area.'
  },
  Hindi: {
    0: 'धन्वन्तरि में आपका स्वागत है। कृपया अपनी भाषा चुनें और अपनी आभा आईडी या मोबाइल नंबर दर्ज करें।',
    1: 'कृपया सहमति जानकारी की समीक्षा करें और आगे बढ़ने के लिए सहमति दें।',
    2: 'कृपया अपने परामर्श का प्रकार चुनें: एलोपैथिक या आयुष।',
    3: 'कृपया अपने लक्षण चुनें या अपनी स्थिति बताने के लिए बोलें।',
    4: 'कृपया अपने डॉक्टर की मदद के लिए कुछ प्रश्नों के उत्तर दें।',
    4.5: 'अपनी आयुर्वेदिक प्रकृति और स्वास्थ्य के आकलन के लिए दशविध परीक्षा प्रश्नों के उत्तर दें।',
    5: 'आप अपने पुराने पर्चे या लैब रिपोर्ट अपलोड कर सकते हैं।',
    6: 'कृपया अपने पसंदीदा डॉक्टर चुनें। हमारे एआई ने एक सिफारिश चुनी है।',
    7: 'जमा करने से पहले कृपया अपने सारांश की समीक्षा करें।',
    8: 'आपकी प्रक्रिया पूरी हो गई है। कृपया प्रतीक्षा क्षेत्र में जाएं।'
  },
  Bengali: {
    0: 'ধন্বন্তরিতে স্বাগতম। অনুগ্রহ করে আপনার ভাষা নির্বাচন করুন এবং আপনার আভা আইডি বা মোবাইল নম্বর দিন।',
    1: 'অনুগ্রহ করে সম্মতির তথ্য পর্যালোচনা করুন এবং এগিয়ে যেতে "আমি সম্মতি দিচ্ছি"-তে চাপুন।',
    2: 'অনুগ্রহ করে আপনার পরামর্শের ধরন নির্বাচন করুন: অ্যালোপ্যাথিক নাকি আয়ুশ।',
    3: 'অনুগ্রহ করে আপনার উপসর্গগুলি বেছে নিন অথবা আপনার সমস্যার কথা মুখে বলুন।',
    4: 'আপনার ডাক্তারকে সাহায্য করার জন্য কয়েকটি প্রশ্নের উত্তর দিন।',
    4.5: 'আপনার আয়ুর্বেদিক প্রকৃতি ও স্বাস্থ্য পর্যালোচনার জন্য দশবিধ পরীক্ষা সংক্রান্ত প্রশ্নগুলির উত্তর দিন।',
    5: 'আপনি আপনার পূর্ববর্তী প্রেসক্রিপশন বা ল্যাব রিপোর্ট আপলোড করতে পারেন।',
    6: 'অনুগ্রহ করে আপনার পছন্দের ডাক্তার বেছে নিন। আমাদের এআই একটি সুপারিশ চিহ্নিত করেছে।',
    7: 'জমা দেওয়ার আগে অনুগ্রহ করে আপনার সারাংশ পর্যালোচনা করুন।',
    8: 'আপনার কাজ সম্পন্ন হয়েছে। অনুগ্রহ করে অপেক্ষা করার স্থানে যান।'
  },
  Tamil: {
    0: 'தன்வந்திரிக்கு நல்வரவு. உங்கள் மொழியைத் தேர்ந்தெடுத்து, உங்கள் ABHA ஐடி அல்லது மொபைல் எண்ணை உள்ளிடவும்.',
    1: 'தயவுசெய்து சம்மதத் தகவலை மதிப்பாய்வு செய்து தொடரவும்.',
    2: 'தயவுசெய்து உங்கள் ஆலோசனை வகையைத் தேர்ந்தெடுக்கவும்: அலோபதி அல்லது ஆயுஷ்.',
    3: 'உங்கள் அறிகுறிகளைத் தேர்ந்தெடுக்கவும் அல்லது உங்கள் நிலையை விவரிக்க பேசவும்.',
    4: 'உங்கள் மருத்துவருக்கு உதவ சில கேள்விகளுக்கு பதிலளிக்கவும்.',
    4.5: 'உங்கள் ஆயுர்வேத உடல்நிலையை மதிப்பிட தசவித பரீக்ஷா கேள்விகளுக்கு பதிலளிக்கவும்.',
    5: 'உங்கள் முந்தைய மருத்துவ அறிக்கைகளை பதிவேற்றலாம்.',
    6: 'உங்களுக்கு விருப்பமான மருத்துவரைத் தேர்ந்தெடுக்கவும்.',
    7: 'சமர்ப்பிக்கும் முன் உங்கள் சுருக்கத்தை மதிப்பாய்வு செய்யவும்.',
    8: 'உங்கள் பதிவு முடிந்தது. தயவுசெய்து காத்திருப்பு அறைக்கு செல்லவும்.'
  },
  Telugu: {
    0: 'ధన్వంతరికి స్వాగతం. దయచేసి మీ భాషను ఎంచుకోండి మరియు మీ ఆభా ID లేదా మొబైల్ నంబర్‌ను నమోదు చేయండి.',
    1: 'దయచేసి సమ్మతి సమాచారాన్ని సమీక్షించి కొనసాగించండి.',
    2: 'దయచేసి మీ సంప్రదింపుల రకాన్ని ఎంచుకోండి: అల్లోపతి లేదా ఆయుష్.',
    3: 'దయచేసి మీ లక్షణాలను ఎంచుకోండి లేదా మాట్లాడండి.',
    4: 'మీ వైద్యుడికి సహాయపడటానికి కొన్ని ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    4.5: 'మీ ఆయుర్వేద శరీర తత్వాన్ని అంచనా వేయడానికి దశవిధ పరీక్ష ప్రశ్నలకు సమాధానం ఇవ్వండి.',
    5: 'మీరు గత ప్రిస్క్రిప్షన్‌లు లేదా ల్యాబ్ నివేదికలను అప్‌లోడ్ చేయవచ్చు.',
    6: 'దయచేసి మీ ప్రాధాన్య వైద్యుడిని ఎంచుకోండి.',
    7: 'సమర్పించే ముందు దయచేసి మీ సారాంశాన్ని సమీక్షించండి.',
    8: 'మీ ప్రక్రియ పూర్తయింది. దయచేసి వెయిటింగ్ ఏరియాకు వెళ్లండి.'
  },
  Marathi: {
    0: 'धन्वन्तरि मध्ये आपले स्वागत आहे. कृपया आपली भाषा निवडा आणि आपला आभा आयडी किंवा मोबाईल नंबर टाका.',
    1: 'कृपया संमती माहितीचे पुनरावलोकन करा आणि पुढे जाण्यासाठी संमती द्या.',
    2: 'कृपया आपल्या सल्लामसलतीचा प्रकार निवडा: अ‍ॅलोपॅथिक किंवा आयुष.',
    3: 'कृपया आपली लक्षणे निवडा किंवा सांगण्यासाठी बोला.',
    4: 'आपल्या डॉक्टरांच्या मदतीसाठी काही प्रश्नांची उत्तरे द्या.',
    4.5: 'आपल्या आयुर्वेदिक प्रकृतीचे मूल्यांकन करण्यासाठी दशविध परीक्षेच्या प्रश्नांची उत्तरे द्या.',
    5: 'आपण आपले जुने प्रिस्क्रिप्शन किंवा लॅब रिपोर्ट अपलोड करू शकता.',
    6: 'कृपया आपले पसंतीचे डॉक्टर निवडा.',
    7: 'सादर करण्यापूर्वी कृपया आपल्या सारांशाचे पुनरावलोकन करा.',
    8: 'आपली नोंदणी पूर्ण झाली आहे. कृपया प्रतीक्षा कक्षात जा.'
  },
  Gujarati: {
    0: 'ધન્વંતરિમાં આપનું સ્વાગત છે. કૃપા કરીને તમારી ભાષા પસંદ કરો અને તમારો આભા ID દાખલ કરો.',
    1: 'કૃપા કરીને સંમતિ માહિતીની સમીક્ષા કરો અને આગળ વધો.',
    2: 'કૃપા કરીને તમારા પરામર્શનો પ્રકાર પસંદ કરો: એલોપેથિક અથવા આયુષ.',
    3: 'કૃપા કરીને તમારા લક્ષણો પસંદ કરો અથવા બોલો.',
    4: 'તમારા ડૉક્ટરને મદદ કરવા માટે કેટલાક પ્રશ્નોના જવાબ આપો.',
    4.5: 'તમારી આયુર્વેદિક પ્રકૃતિનું મૂલ્યાંકન કરવા માટે દશવિધ પરીક્ષાના પ્રશ્નોના જવાબ આપો.',
    5: 'તમે જૂના પ્રિસ્ક્રિપ્શન અથવા રિપોર્ટ્સ અપલોડ કરી શકો છો.',
    6: 'કૃપા કરીને તમારા પસંદગીના ડૉક્ટર પસંદ કરો.',
    7: 'સબમિટ કરતા પહેલા તમારા સારાંશની સમીક્ષા કરો.',
    8: 'પ્રક્રિયા પૂર્ણ થઈ ગઈ છે. કૃપા કરીને પ્રતીક્ષા કક્ષમાં જાઓ.'
  },
  Kannada: {
    0: 'ಧನ್ವಂತರಿಗೆ ಸ್ವಾಗತ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ABHA ID ನಮೂದಿಸಿ.',
    1: 'ದಯವಿಟ್ಟು ಒಪ್ಪಿಗೆ ಮಾಹಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ.',
    2: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಮಾಲೋಚನೆ ಪ್ರಕಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ: ಅಲೋಪತಿ ಅಥವಾ ಆಯುಷ್.',
    3: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಮಾತನಾಡಿ.',
    4: 'ನಿಮ್ಮ ವೈದ್ಯರಿಗೆ ಸಹಾಯ ಮಾಡಲು ಕೆಲವು ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
    4.5: 'ನಿಮ್ಮ ಆಯುರ್ವೇದ ದೇಹ ಪ್ರಕೃತಿಯನ್ನು ತಿಳಿಯಲು ದಶವಿಧ ಪರೀಕ್ಷಾ ಪ್ರಶ್ನೆಗಳಿಗೆ ಉತ್ತರಿಸಿ.',
    5: 'ನಿಮ್ಮ ಹಿಂದಿನ ವರದಿಗಳನ್ನು ನೀವು ಅಪ್‌ಲೋಡ್ ಮಾಡಬಹುದು.',
    6: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆಯ್ಕೆಯ ವೈದ್ಯರನ್ನು ಆರಿಸಿ.',
    7: 'ಸಲ್ಲಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಸಾರಾಂಶವನ್ನು ಪರಿಶೀಲಿಸಿ.',
    8: 'ನಿಮ್ಮ ನೋಂದಣಿ ಪೂರ್ಣಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಕಾಯುವ ಕೋಣೆಗೆ ತೆರಳಿ.'
  }
};

export function getTranslation(key, lang = 'English', ...args) {
  const langDict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.English;
  let text = langDict[key] || UI_TRANSLATIONS.English[key] || key;
  if (args.length > 0) {
    args.forEach((val, idx) => {
      text = text.replace(new RegExp(`\\{${idx}\\}`, 'g'), val);
    });
  }
  return text;
}


export function getQuestionOptions(questionText = "", lang = "English", englishText = "") {
  const combined = ((englishText || "") + " " + (questionText || "")).toLowerCase();

  // 1. Scale / Rating Question (1 to 10 or 0 to 9) - ALWAYS universal digits
  const isScale = /(1\s*(to|-|থেকে|সে|వరకు|முதல்|ते|थी|ವರೆಗೆ)\s*10)|(0\s*(to|-|থেকে|সে|వరకు|முதல்|ते|थी|ವರೆಗೆ)\s*(9|10))|scale|rating|severity|rate your|স্কেল|স্কেলে|স্কেলের|তীব্রতা|तीव्रता|पैमाने/i.test(combined);
  if (isScale) {
    const isZeroToNine = /(0\s*(to|-|থেকে|সে|వరకు|முதல்|ते|थी|ವರೆಗೆ)\s*9)/i.test(combined);
    const nums = isZeroToNine ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return {
      type: "scale",
      options: nums.map(n => {
        let tone = "green";
        if (n >= 4 && n <= 6) tone = "amber";
        else if (n >= 7 && n <= 8) tone = "orange";
        else if (n >= 9) tone = "red";
        return { label: String(n), value: String(n), tone };
      })
    };
  }

  // 2. Duration / Onset / Start Timing Question (MUST be checked before symptoms/medication)
  // e.g. "When did your fever start?", "How long have you had this?", "কখন শুরু হয়েছিল?", "কবে থেকে?"
  const isExplicitYesNoStart = /^(did|does|is|are|was|were|have|has)\b/i.test((englishText || questionText).trim());
  const isDuration = (/when did|when was|how long|since when|duration|onset|কবে|কখন|কয়দিন|কত দিন|কতদিন|কবে থেকে|কখন থেকে|কখন শুরু|কবে শুরু|कब से|कितने दिन|कितने समय|कब शुरू/i.test(combined) || (/start|started|begin|began/i.test(combined) && !isExplicitYesNoStart));
  if (isDuration) {
    const durationMap = {
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
      Tamil: [
        { label: "இன்று / இன்று காலை", tone: "blue" },
        { label: "1–2 நாட்களுக்கு முன்பு", tone: "blue" },
        { label: "3–4 நாட்களுக்கு முன்பு", tone: "amber" },
        { label: "5–6 நாட்களுக்கு முன்பு", tone: "amber" },
        { label: "1 வாரத்திற்கு மேல்", tone: "red" },
      ],
      Telugu: [
        { label: "ఈ రోజు / ఈ ఉదయం", tone: "blue" },
        { label: "1–2 రోజుల క్రితం", tone: "blue" },
        { label: "3–4 రోజుల క్రితం", tone: "amber" },
        { label: "5–6 రోజుల క్రితం", tone: "amber" },
        { label: "1 వారం కంటే ఎక్కువ", tone: "red" },
      ],
      Marathi: [
        { label: "आज / आज सकाळपासून", tone: "blue" },
        { label: "१-२ दिवसांपूर्वी", tone: "blue" },
        { label: "३-४ दिवसांपूर्वी", tone: "amber" },
        { label: "५-६ दिवसांपूर्वी", tone: "amber" },
        { label: "१ आठवड्यापेक्षा जास्त", tone: "red" },
      ],
      Gujarati: [
        { label: "આજ / આજે સવારથી", tone: "blue" },
        { label: "૧-૨ દિવસ પહેલાં", tone: "blue" },
        { label: "૩-૪ દિવસ પહેલાં", tone: "amber" },
        { label: "૫-૬ દિવસ પહેલાં", tone: "amber" },
        { label: "૧ અઠવાડિયાથી વધુ", tone: "red" },
      ],
      Kannada: [
        { label: "ಇಂದು / ಇಂದು ಬೆಳಗ್ಗೆ", tone: "blue" },
        { label: "1–2 ದಿನಗಳ ಹಿಂದೆ", tone: "blue" },
        { label: "3–4 ದಿನಗಳ ಹಿಂದೆ", tone: "amber" },
        { label: "5–6 ದಿನಗಳ ಹಿಂದೆ", tone: "amber" },
        { label: "1 ವಾರಕ್ಕಿಂತ ಹೆಚ್ಚು", tone: "red" },
      ],
      English: [
        { label: "Today / This morning", tone: "blue" },
        { label: "1–2 days before", tone: "blue" },
        { label: "3–4 days before", tone: "amber" },
        { label: "5–6 days before", tone: "amber" },
        { label: "More than 1 week ago", tone: "red" },
      ],
    };
    return {
      type: "chips",
      options: durationMap[lang] || durationMap.English
    };
  }

  // 3. Trigger / Worsening / Relieving Factors
  const isTrigger = /worse|better|relieve|relieves|trigger|triggers|aggravat|mitigat|খারাপ|কমাতে|সাহায্য|বাড়ে|কমে|बढ़ता|घटता|कम|आराम/i.test(combined);
  if (isTrigger) {
    const triggerMap = {
      Hindi: [
        { label: "दवा लेने से कम होता है", tone: "green" },
        { label: "खाने के बाद बढ़ता है", tone: "red" },
        { label: "आराम करने से राहत मिलती है", tone: "green" },
        { label: "चलने-फिरने से बढ़ता है", tone: "orange" },
        { label: "कोई विशेष कारण नहीं", tone: "slate" },
      ],
      Bengali: [
        { label: "ওষুধ খেলে কমে", tone: "green" },
        { label: "খাওয়ার পর বাড়ে", tone: "red" },
        { label: "বিশ্রাম নিলে ভালো লাগে", tone: "green" },
        { label: "হাঁটাচলা করলে বাড়ে", tone: "orange" },
        { label: "নির্দিষ্ট কোনো কারণ নেই", tone: "slate" },
      ],
      Tamil: [
        { label: "மருந்து சாப்பிட்டால் குறைகிறது", tone: "green" },
        { label: "சாப்பிட்ட பிறகு கூடுகிறது", tone: "red" },
        { label: "ஓய்வெடுத்தால் நிம்மதி", tone: "green" },
        { label: "குறிப்பிட்ட காரணமில்லை", tone: "slate" },
      ],
      Telugu: [
        { label: "మందులతో తగ్గుతుంది", tone: "green" },
        { label: "తిన్న తర్వాత పెరుగుతుంది", tone: "red" },
        { label: "విశ్రాంతితో ఉపశమనం", tone: "green" },
        { label: "ప్రత్యేక కారణం లేదు", tone: "slate" },
      ],
      Marathi: [
        { label: "औषधाने कमी होते", tone: "green" },
        { label: "जेवणानंतर वाढते", tone: "red" },
        { label: "विश्रांतीने आराम मिळतो", tone: "green" },
        { label: "विशिष्ट कारण नाही", tone: "slate" },
      ],
      Gujarati: [
        { label: "દવાથી ઓછું થાય છે", tone: "green" },
        { label: "જમ્યા પછી વધે છે", tone: "red" },
        { label: "આરામ કરવાથી સારું લાગે છે", tone: "green" },
        { label: "કોઈ ચોક્કસ કારણ નથી", tone: "slate" },
      ],
      Kannada: [
        { label: "ಔಷಧಿಯಿಂದ ಕಡಿಮೆಯಾಗುತ್ತದೆ", tone: "green" },
        { label: "ಊಟದ ನಂತರ ಹೆಚ್ಚಾಗುತ್ತದೆ", tone: "red" },
        { label: "ವಿಶ್ರಾಂತಿಯಿಂದ ಆರಾಮ", tone: "green" },
        { label: "ಯಾವುದೇ ನಿರ್ದಿಷ್ಟ ಕಾರಣವಿಲ್ಲ", tone: "slate" },
      ],
      English: [
        { label: "Reduces with medication", tone: "green" },
        { label: "Worsens after eating", tone: "red" },
        { label: "Relieved by rest", tone: "green" },
        { label: "Worsens with exertion", tone: "orange" },
        { label: "No specific trigger", tone: "slate" },
      ],
    };
    return {
      type: "chips",
      options: triggerMap[lang] || triggerMap.English
    };
  }

  // 4. Medication Question (Has the patient taken any medicine/tablets/remedies)
  const isMedication = /medicat|medicine|tablet|drug|prescrib|remed|ওষুধ|ঔষধ|দवा|दवाई|மருந்து|మందు|औषध|દવા|ಔಷಧ/i.test(combined);
  if (isMedication) {
    const medMap = {
      Hindi: [
        { label: "हाँ, दवा ली है", tone: "green", icon: "✓" },
        { label: "नहीं, कोई दवा नहीं ली", tone: "red", icon: "✕" },
        { label: "पैरासिटामोल / एंटासिड ली", tone: "blue", icon: "💊" },
        { label: "घरेलू उपचार किया", tone: "amber", icon: "🍵" },
      ],
      Bengali: [
        { label: "হ্যাঁ, ওষুধ খেয়েছি", tone: "green", icon: "✓" },
        { label: "না, কোনো ওষুধ খাইনি", tone: "red", icon: "✕" },
        { label: "প্যারাসিটামল / অ্যান্টাসিড খেয়েছি", tone: "blue", icon: "💊" },
        { label: "ঘরোয়া প্রতিকার করেছি", tone: "amber", icon: "🍵" },
      ],
      Tamil: [
        { label: "ஆம், மருந்து சாப்பிட்டேன்", tone: "green", icon: "✓" },
        { label: "எந்த மருந்தும் எடுக்கவில்லை", tone: "red", icon: "✕" },
        { label: "பாராசிட்டமால் / ஆன்டாசிட் எடுத்தேன்", tone: "blue", icon: "💊" },
        { label: "வீட்டு வைத்தியம் செய்தேன்", tone: "amber", icon: "🍵" },
      ],
      Telugu: [
        { label: "అవును, మందులు తీసుకున్నాను", tone: "green", icon: "✓" },
        { label: "ఏ మందులూ తీసుకోలేదు", tone: "red", icon: "✕" },
        { label: "పారాసిటమాల్ / యాంటాసిడ్ తీసుకున్నాను", tone: "blue", icon: "💊" },
        { label: "ఇంటి చిట్కాలు చేశాను", tone: "amber", icon: "🍵" },
      ],
      Marathi: [
        { label: "होय, औषध घेतले आहे", tone: "green", icon: "✓" },
        { label: "कोणतेही औषध घेतले नाही", tone: "red", icon: "✕" },
        { label: "पॅरासिटामॉल / अँटासिड घेतले", tone: "blue", icon: "💊" },
        { label: "घरगुती उपाय केले", tone: "amber", icon: "🍵" },
      ],
      Gujarati: [
        { label: "હા, દવા લીધી છે", tone: "green", icon: "✓" },
        { label: "કોઈ દવા નથી લીધી", tone: "red", icon: "✕" },
        { label: "પેરાસિટામોલ / એન્ટાસિડ લીધી", tone: "blue", icon: "💊" },
        { label: "ઘરેલુ ઉપચાર કર્યા", tone: "amber", icon: "🍵" },
      ],
      Kannada: [
        { label: "ಹೌದು, ಔಷಧಿ ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ", tone: "green", icon: "✓" },
        { label: "ಯಾವುದೇ ಔಷಧಿ ತೆಗೆದುಕೊಂಡಿಲ್ಲ", tone: "red", icon: "✕" },
        { label: "ಪ್ಯಾರಸಿಟಮಾಲ್ / ಆಂಟಾಸಿಡ್ ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ", tone: "blue", icon: "💊" },
        { label: "ಮನೆಮದ್ದು ಮಾಡಿದ್ದೇನೆ", tone: "amber", icon: "🍵" },
      ],
      English: [
        { label: "Yes, took medication", tone: "green", icon: "✓" },
        { label: "No medicine taken", tone: "red", icon: "✕" },
        { label: "Took Paracetamol / Antacid", tone: "blue", icon: "💊" },
        { label: "Tried home remedies", tone: "amber", icon: "🍵" },
      ],
    };
    return {
      type: "chips",
      options: medMap[lang] || medMap.English
    };
  }

  // 5. Associated / Other Accompanying Symptoms (checks for "other" or "associated" symptoms)
  const isSymptoms = /any other symptom|associated symptom|other associated|also have|along with|do you also|अन्य लक्षण|और कोई लक्षण|অন্যান্য লক্ষণ|অন্য কোনো উপসর্গ|অন্য উপসর্গ/i.test(combined);
  if (isSymptoms) {
    const sympMap = {
      Hindi: [
        { label: "हाँ, बुखार या मतली है", tone: "red", icon: "🌡️" },
        { label: "नहीं, कोई अन्य लक्षण नहीं", tone: "green", icon: "✓" },
        { label: "केवल थकान या कमजोरी है", tone: "amber", icon: "🥱" },
        { label: "शरीर या सिर में दर्द है", tone: "orange", icon: "🤕" },
      ],
      Bengali: [
        { label: "হ্যাঁ, জ্বর বা বমি ভাব আছে", tone: "red", icon: "🌡️" },
        { label: "না, অন্য কোনো উপসর্গ নেই", tone: "green", icon: "✓" },
        { label: "শুধু দুর্বলতা বা ক্লান্তি আছে", tone: "amber", icon: "🥱" },
        { label: "গা-হাত-পা বা মাথা ব্যথা আছে", tone: "orange", icon: "🤕" },
      ],
      Tamil: [
        { label: "ஆம், காய்ச்சல் அல்லது குமட்டல் உள்ளது", tone: "red", icon: "🌡️" },
        { label: "வேறு எந்த அறிகுறிகளும் இல்லை", tone: "green", icon: "✓" },
        { label: "சோர்வு மட்டுமே உள்ளது", tone: "amber", icon: "🥱" },
        { label: "உடல் வலி உள்ளது", tone: "orange", icon: "🤕" },
      ],
      Telugu: [
        { label: "అవును, జ్వరం లేదా వికారం ఉంది", tone: "red", icon: "🌡️" },
        { label: "ఇతర లక్షణాలు ఏవీ లేవు", tone: "green", icon: "✓" },
        { label: "కేవలం నీరసం మాత్రమే ఉంది", tone: "amber", icon: "🥱" },
        { label: "ఒళ్లు నొప్పులు ఉన్నాయి", tone: "orange", icon: "🤕" },
      ],
      Marathi: [
        { label: "होय, ताप किंवा मळमळ आहे", tone: "red", icon: "🌡️" },
        { label: "इतर कोणतीही लक्षणे नाहीत", tone: "green", icon: "✓" },
        { label: "फक्त थकवा आहे", tone: "amber", icon: "🥱" },
        { label: "अंगदुखी आहे", tone: "orange", icon: "🤕" },
      ],
      Gujarati: [
        { label: "હા, તાવ અથવા ઉબકા છે", tone: "red", icon: "🌡️" },
        { label: "કોઈ અન્ય લક્ષણો નથી", tone: "green", icon: "✓" },
        { label: "માત્ર થાક લાગે છે", tone: "amber", icon: "🥱" },
        { label: "શરીરમાં દુખાવો છે", tone: "orange", icon: "🤕" },
      ],
      Kannada: [
        { label: "ಹೌದು, ಜ್ವರ ಅಥವಾ ವಾಕರಿಕೆ ಇದೆ", tone: "red", icon: "🌡️" },
        { label: "ಇತರ ಯಾವುದೇ ಲಕ್ಷಣಗಳಿಲ್ಲ", tone: "green", icon: "✓" },
        { label: "ಕೇವಲ ಆಯಾಸವಿದೆ", tone: "amber", icon: "🥱" },
        { label: "ಮೈಕೈ ನೋವಿದೆ", tone: "orange", icon: "🤕" },
      ],
      English: [
        { label: "Yes, fever or nausea present", tone: "red", icon: "🌡️" },
        { label: "No other symptoms", tone: "green", icon: "✓" },
        { label: "Only fatigue or weakness", tone: "amber", icon: "🥱" },
        { label: "Body ache or headache", tone: "orange", icon: "🤕" },
      ],
    };
    return {
      type: "chips",
      options: sympMap[lang] || sympMap.English
    };
  }

  // 6. Yes / No or Binary Verification
  const isYesNo = /is there|have you|did you|do you|any|কি|কিনা|হ্যাঁ|না|नাকি|क्या|हाँ|नहीं/i.test(combined);
  if (isYesNo) {
    const ynMap = {
      Hindi: [
        { label: "हाँ", tone: "green", icon: "✓" },
        { label: "नहीं", tone: "red", icon: "✕" },
        { label: "कभी-कभी", tone: "amber", icon: "⚡" },
        { label: "पक्का नहीं पता", tone: "slate", icon: "?" },
      ],
      Bengali: [
        { label: "হ্যাঁ", tone: "green", icon: "✓" },
        { label: "না", tone: "red", icon: "✕" },
        { label: "মাঝে মাঝে হয়", tone: "amber", icon: "⚡" },
        { label: "নিশ্চিত নই", tone: "slate", icon: "?" },
      ],
      Tamil: [
        { label: "ஆம்", tone: "green", icon: "✓" },
        { label: "இல்லை", tone: "red", icon: "✕" },
        { label: "சில நேரங்களில்", tone: "amber", icon: "⚡" },
        { label: "தெரியவில்லை", tone: "slate", icon: "?" },
      ],
      Telugu: [
        { label: "అవును", tone: "green", icon: "✓" },
        { label: "కాదు", tone: "red", icon: "✕" },
        { label: "అప్పుడప్పుడు", tone: "amber", icon: "⚡" },
        { label: "ఖచ్చితంగా తెలియదు", tone: "slate", icon: "?" },
      ],
      Marathi: [
        { label: "होय", tone: "green", icon: "✓" },
        { label: "नाही", tone: "red", icon: "✕" },
        { label: "कधीकधी", tone: "amber", icon: "⚡" },
        { label: "माहित नाही", tone: "slate", icon: "?" },
      ],
      Gujarati: [
        { label: "હા", tone: "green", icon: "✓" },
        { label: "ના", tone: "red", icon: "✕" },
        { label: "ક્યારેક", tone: "amber", icon: "⚡" },
        { label: "ખાતરી નથી", tone: "slate", icon: "?" },
      ],
      Kannada: [
        { label: "ಹೌದು", tone: "green", icon: "✓" },
        { label: "ಇಲ್ಲ", tone: "red", icon: "✕" },
        { label: "ಕೆಲವೊಮ್ಮೆ", tone: "amber", icon: "⚡" },
        { label: "ಖಚಿತವಿಲ್ಲ", tone: "slate", icon: "?" },
      ],
      English: [
        { label: "Yes", tone: "green", icon: "✓" },
        { label: "No", tone: "red", icon: "✕" },
        { label: "Sometimes", tone: "amber", icon: "⚡" },
        { label: "Not sure", tone: "slate", icon: "?" },
      ],
    };
    return {
      type: "chips",
      options: ynMap[lang] || ynMap.English
    };
  }

  // 7. Universal Fallback
  const defaultMap = {
    Hindi: [
      { label: "हाँ", tone: "green", icon: "✓" },
      { label: "नहीं", tone: "red", icon: "✕" },
      { label: "कभी-कभी", tone: "amber", icon: "⚡" },
      { label: "पता नहीं", tone: "slate", icon: "?" },
    ],
    Bengali: [
      { label: "হ্যাঁ", tone: "green", icon: "✓" },
      { label: "না", tone: "red", icon: "✕" },
      { label: "মাঝে মাঝে", tone: "amber", icon: "⚡" },
      { label: "জানা নেই", tone: "slate", icon: "?" },
    ],
    English: [
      { label: "Yes", tone: "green", icon: "✓" },
      { label: "No", tone: "red", icon: "✕" },
      { label: "Sometimes", tone: "amber", icon: "⚡" },
      { label: "Not sure", tone: "slate", icon: "?" },
    ],
  };
  return {
    type: "chips",
    options: defaultMap[lang] || defaultMap.English
  };
}


export const AYUSH_TRANSLATIONS = {
  prakriti: {
    label: {
      English: "Prakriti (Body Constitution)",
      Hindi: "प्रकृति (शारीरिक प्रकृति)",
      Bengali: "প্রকৃতি (শারীরিক গঠন ও স্বভাব)",
      Tamil: "பிரகிருதி (உடல் அமைப்பு)",
      Telugu: "ప్రకృతి (శరీర స్వభావం)",
      Marathi: "प्रकृती (शारीरिक प्रकृती)",
      Gujarati: "પ્રકૃતિ (શારીરિક બંધારણ)",
      Kannada: "ಪ್ರಕೃತಿ (ದೇಹ ಪ್ರಕೃತಿ)"
    },
    question: {
      English: "What best describes your natural body type and temperament?",
      Hindi: "आपके स्वाभाविक शारीरिक गठन और स्वभाव का सबसे अच्छा वर्णन क्या है?",
      Bengali: "আপনার স্বাভাবিক শারীরিক গঠন ও স্বভাব কোনটি সবচেয়ে ভালোভাবে বর্ণনা করে?",
      Tamil: "உங்கள் இயல்பான உடல் வகை மற்றும் மனநிலையை எது சிறப்பாக விவரிக்கிறது?",
      Telugu: "మీ సహజ శరీర రకం మరియు స్వభావాన్ని ఏది బాగా వివరిస్తుంది?",
      Marathi: "तुमचा नैसर्गिक शरीराचा प्रकार आणि स्वभावाचे सर्वोत्तम वर्णन कोणते आहे?",
      Gujarati: "તમારો કુદરતી શરીરનો પ્રકાર અને સ્વભાવ કયો શ્રેષ્ઠ વર્ણવે છે?",
      Kannada: "ನಿಮ್ಮ ನೈಸರ್ಗಿಕ ದೇಹದ ಪ್ರಕಾರ ಮತ್ತು ಸ್ವಭಾವವನ್ನು ಯಾವುದು ಉತ್ತಮವಾಗಿ ವಿವರಿಸುತ್ತದೆ?"
    },
    options: {
      "Vata (Thin, energetic, anxious)": {
        English: "Vata (Thin, energetic, anxious)",
        Hindi: "वात (दुबला, ऊर्जावान, चंचल)",
        Bengali: "বাত (রোগা, কর্মচঞ্চল, চিন্তাশীল)",
        Tamil: "வாதம் (மெலிந்த, சுறுசுறுப்பான, பதற்றமான)",
        Telugu: "వాతం (సన్నని, ఉత్సాహవంతమైన, ఆందోళన)",
        Marathi: "वात (बारीक, उत्साही, चंचल)",
        Gujarati: "વાત (પાતળા, ઊર્જાવાન, ચિંતિત)",
        Kannada: "ವಾತ (ತೆಳ್ಳನೆಯ, ಚಟುವಟಿಕೆಯ, ಆತಂಕ)"
      },
      "Pitta (Medium, intense, sharp)": {
        English: "Pitta (Medium, intense, sharp)",
        Hindi: "पित्त (मध्यम, तेजस्वी, तीक्ष्ण)",
        Bengali: "পিত্ত (মাঝারি গড়ন, তেজস্বী, প্রখর)",
        Tamil: "பித்தம் (நடுத்தர, கூர்மையான, தீவிரமான)",
        Telugu: "పిత్తం (మధ్యస్థ, తీవ్రమైన, చురుకైన)",
        Marathi: "पित्त (मध्यम, तेजस्वी, तीक्ष्ण)",
        Gujarati: "પિત્ત (મધ્યમ, તેજસ્વી, તીક્ષ્ણ)",
        Kannada: "ಪಿತ್ತ (ಮಧ್ಯಮ, ತೀಕ್ಷ್ಣ, ಚುರುಕು)"
      },
      "Kapha (Heavy, calm, steady)": {
        English: "Kapha (Heavy, calm, steady)",
        Hindi: "कफ (भारी, शांत, स्थिर)",
        Bengali: "কফ (ভারী গড়ন, শান্ত, ধীরস্থির)",
        Tamil: "கபம் (கனமான, அமைதியான, நிலையான)",
        Telugu: "కఫం (బరువైన, ప్రశాంతమైన, స్థిరమైన)",
        Marathi: "कफ (भारी, शांत, स्थिर)",
        Gujarati: "કફ (ભારે, શાંત, સ્થિર)",
        Kannada: "ಕಫ (ಭಾರವಾದ, ಶಾಂತ, ಸ್ಥಿರ)"
      },
      "Vata-Pitta": {
        English: "Vata-Pitta",
        Hindi: "वात-पित्त",
        Bengali: "বাত-পিত্ত",
        Tamil: "வாத-பித்தம்",
        Telugu: "వాత-పిత్తం",
        Marathi: "वात-पित्त",
        Gujarati: "વાત-પિત્ત",
        Kannada: "ವಾತ-ಪಿತ್ತ"
      },
      "Pitta-Kapha": {
        English: "Pitta-Kapha",
        Hindi: "पित्त-कफ",
        Bengali: "পিত্ত-কফ",
        Tamil: "பித்த-கபம்",
        Telugu: "పిత్త-కఫం",
        Marathi: "पित्त-कफ",
        Gujarati: "પિત્ત-કફ",
        Kannada: "ಪಿತ್ತ-ಕಫ"
      },
      "Vata-Kapha": {
        English: "Vata-Kapha",
        Hindi: "वात-कफ",
        Bengali: "বাত-কফ",
        Tamil: "வாத-கபம்",
        Telugu: "వాత-కఫం",
        Marathi: "वात-कफ",
        Gujarati: "વાત-કફ",
        Kannada: "ವಾತ-ಕಫ"
      },
      "Tridoshic / Don't Know": {
        English: "Tridoshic / Don't Know",
        Hindi: "त्रिदोष / पता नहीं",
        Bengali: "ত্রিদোষ / জানা নেই",
        Tamil: "முத்தோஷம் / தெரியாது",
        Telugu: "త్రిదోషం / తెలియదు",
        Marathi: "त्रिदोष / माहीत नाही",
        Gujarati: "ત્રિદોષ / ખબર નથી",
        Kannada: "ತ್ರಿದೋಷ / ಗೊತ್ತಿಲ್ಲ"
      }
    }
  },
  vikriti: {
    label: {
      English: "Vikriti (Current Imbalance)",
      Hindi: "विकृति (वर्तमान असंतुलन)",
      Bengali: "বিকৃতি (বর্তমান ভারসাম্যহীনতা)",
      Tamil: "விக்ருதி (தற்போதைய சமநிலையின்மை)",
      Telugu: "వికృతి (ప్రస్తుత అసమతుల్యత)",
      Marathi: "विकृती (सध्याचे असंतुलन)",
      Gujarati: "વિકૃતિ (વર્તમાન અસંતુલન)",
      Kannada: "ವಿಕೃತಿ (ಪ್ರಸ್ತುತ ಅಸಮತೋಲನ)"
    },
    question: {
      English: "Have you noticed recent changes from your usual state?",
      Hindi: "क्या आपने अपनी सामान्य स्थिति में हाल ही में कोई बदलाव देखा है?",
      Bengali: "আপনি কি আপনার স্বাভাবিক অবস্থা থেকে সম্প্রতি কোনো পরিবর্তন লক্ষ্য করেছেন?",
      Tamil: "உங்கள் வழக்கமான நிலையிலிருந்து சமீபத்திய மாற்றங்களை கவனித்துள்ளீர்களா?",
      Telugu: "మీ సాధారణ స్థితి నుండి ఇటీవలి మార్పులను మీరు గమనించారా?",
      Marathi: "तुम्हाला तुमच्या नेहमीच्या स्थितीत काही अलीकडील बदल जाणवले आहेत का?",
      Gujarati: "શું તમે તમારી સામાન્ય સ્થિતિમાંથી તાજેતરમાં કોઈ ફેરફાર જોયો છે?",
      Kannada: "ನಿಮ್ಮ ಸಾಮಾನ್ಯ ಸ್ಥಿತಿಯಿಂದ ಇತ್ತೀಚಿನ ಬದಲಾವಣೆಗಳನ್ನು ನೀವು ಗಮನಿಸಿದ್ದೀರಾ?"
    },
    options: {
      "Restlessness / Dryness / Anxiety (Vata)": {
        English: "Restlessness / Dryness / Anxiety (Vata)",
        Hindi: "बेचैनी / सूखापन / चिंता (वात)",
        Bengali: "অস্থিরতা / ত্বকের শুষ্কতা / উদ্বেগ (বাত)",
        Tamil: "அமைதியின்மை / வறட்சி / பதற்றம் (வாதம்)",
        Telugu: "అశాంతి / పొడిబారడం / ఆందోళన (వాతం)",
        Marathi: "अस्वस्थता / कोरडेपणा / चिंता (वात)",
        Gujarati: "બેચેની / શુષ્કતા / ચિંતા (વાત)",
        Kannada: "ಅಶಾಂತಿ / ಶುಷ್ಕತೆ / ಆತಂಕ (ವಾತ)"
      },
      "Inflammation / Irritability / Heat (Pitta)": {
        English: "Inflammation / Irritability / Heat (Pitta)",
        Hindi: "सूजन व जलन / चिड़चिड़ापन / शरीर में गर्मी (पित्त)",
        Bengali: "প্রদাহ / খিটখিটে ভাব / শরীরে অতিরিক্ত গরম লাগা (পিত্ত)",
        Tamil: "அழற்சி / எரிச்சல் / அதிக வெப்பம் (பித்தம்)",
        Telugu: "మంట / చిరాకు / శరీర వేడి (పిత్తం)",
        Marathi: "दाह व जळजळ / चिडचिड / शरीरात उष्णता (पित्त)",
        Gujarati: "બળતરા / ચીડિયાપણું / ગરમી (પિત્ત)",
        Kannada: "ಉರಿಯೂತ / ಕಿರಿಕಿರಿ / ದೇಹದ ಶಾಖ (ಪಿತ್ತ)"
      },
      "Heaviness / Congestion / Fatigue (Kapha)": {
        English: "Heaviness / Congestion / Fatigue (Kapha)",
        Hindi: "भारीपन / कफ व जमाव / थकान (कफ)",
        Bengali: "ভারী ভাব / শ্লেষ্মা বা বুকে কফ / ক্লান্তি (কফ)",
        Tamil: "பளுவான உணர்வு / நெரிசல் / சோர்வு (கபம்)",
        Telugu: "బరువుగా అనిపించడం / కఫం / అలసట (కఫం)",
        Marathi: "जडपणा / कफ / थकवा (कफ)",
        Gujarati: "ભારેપણું / કફનો ભરાવો / થાક (કફ)",
        Kannada: "ಭಾರವಾದ ಭಾವನೆ / ಕಫ / ಆಯಾಸ (ಕಫ)"
      },
      "Multiple changes": {
        English: "Multiple changes",
        Hindi: "एक से अधिक बदलाव",
        Bengali: "একাধিক পরিবর্তন লক্ষ্য করছি",
        Tamil: "பல மாற்றங்கள்",
        Telugu: "అనేక మార్పులు",
        Marathi: "अनेक बदल",
        Gujarati: "ઘણા ફેરફારો",
        Kannada: "ಹಲವಾರು ಬದಲಾವಣೆಗಳು"
      },
      "No noticeable change": {
        English: "No noticeable change",
        Hindi: "कोई विशेष बदलाव नहीं",
        Bengali: "কোনো বিশেষ পরিবর্তন নেই",
        Tamil: "குறிப்பிடத்தக்க மாற்றம் இல்லை",
        Telugu: "ఎలాంటి మార్పు లేదు",
        Marathi: "काही विशेष बदल नाही",
        Gujarati: "કોઈ ખાસ ફેરફાર નથી",
        Kannada: "ಯಾವುದೇ ಗಮನಾರ್ಹ ಬದಲಾವಣೆ ಇಲ್ಲ"
      }
    }
  },
  agni: {
    label: {
      English: "Agni (Digestive Fire)",
      Hindi: "अग्नि (पाचन शक्ति)",
      Bengali: "অগ্নি (হজম শক্তি)",
      Tamil: "அக்னி (செரிமான தீ)",
      Telugu: "అగ్ని (జీర్ణ శక్తి)",
      Marathi: "अग्नी (पचनशक्ती)",
      Gujarati: "અગ્નિ (પાચન શક્તિ)",
      Kannada: "ಅಗ್ನಿ (ಜೀರ್ಣ ಶಕ್ತಿ)"
    },
    question: {
      English: "How is your digestion currently?",
      Hindi: "वर्तमान में आपका पाचन कैसा है?",
      Bengali: "বর্তমানে আপনার হজম কেমন হচ্ছে?",
      Tamil: "தற்போது உங்கள் செரிமானம் எப்படி உள்ளது?",
      Telugu: "ప్రస్తుతం మీ జీర్ణక్రియ ఎలా ఉంది?",
      Marathi: "सध्या तुमचे पचन कसे आहे?",
      Gujarati: "હાલમાં તમારું પાચન કેવું છે?",
      Kannada: "ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜೀರ್ಣಕ್ರಿಯೆ ಹೇಗಿದೆ?"
    },
    options: {
      "Normal -- digests well, no discomfort": {
        English: "Normal -- digests well, no discomfort",
        Hindi: "सामान्य — अच्छा पचता है, कोई परेशानी नहीं",
        Bengali: "স্বাভাবিক — ভালো হজম হয়, কোনো অস্বস্তি নেই",
        Tamil: "இயல்பானது — நன்றாக செரிக்கிறது, அசௌகரியம் இல்லை",
        Telugu: "సాధారణం — బాగా జీర్ణమవుతుంది, అసౌకర్యం లేదు",
        Marathi: "सामान्य — व्यवस्थित पचते, कोणताही त्रास नाही",
        Gujarati: "સામાન્ય — સારું પચે છે, કોઈ તકલીફ નથી",
        Kannada: "ಸಾಮಾನ್ಯ — ಚೆನ್ನಾಗಿ ಜೀರ್ಣವಾಗುತ್ತದೆ, ಯಾವುದೇ ತೊಂದರೆ ಇಲ್ಲ"
      },
      "Irregular -- sometimes strong, sometimes weak": {
        English: "Irregular -- sometimes strong, sometimes weak",
        Hindi: "अनियमित — कभी तेज भूख, कभी बिल्कुल नहीं",
        Bengali: "অনিয়মিত — কখনো ভালো ক্ষুধা, কখনো দুর্বল",
        Tamil: "ஒழுங்கற்றது — சில நேரங்களில் அதிகம், சில நேரங்களில் குறைவு",
        Telugu: "సక్రమంగా లేదు — కొన్నిసార్లు ఎక్కువ, కొన్నిసార్లు తక్కువ",
        Marathi: "अनियमित — कधी खूप भूक, कधी मंद",
        Gujarati: "અનિયમિત — ક્યારેક વધુ, ક્યારેક ઓછું",
        Kannada: "ಅನಿಯಮಿತ — ಕೆಲವೊಮ್ಮೆ ಹೆಚ್ಚು, ಕೆಲವೊಮ್ಮೆ ಕಡಿಮೆ"
      },
      "Weak -- heavy after meals, bloating": {
        English: "Weak -- heavy after meals, bloating",
        Hindi: "कमजोर — खाने के बाद भारीपन, पेट फूलना",
        Bengali: "দুর্বল — খাওয়ার পর পেট ভারী লাগে, পেট ফাঁপা",
        Tamil: "பலவீனமானது — சாப்பிட்ட பிறகு கனம், உப்புசம்",
        Telugu: "బలహీనం — భోజనం తర్వాత బరువుగా, కడుపుబ్బరం",
        Marathi: "मंद — जेवणानंतर जडपणा, गॅस होणे",
        Gujarati: "નબળું — જમ્યા પછી ભારેપણું, પેટ ફૂલવું",
        Kannada: "ದುರ್ಬಲ — ಊಟದ ನಂತರ ಭಾರ, ಹೊಟ್ಟೆ ಉಬ್ಬರ"
      },
      "Sharp -- very hungry, acid reflux": {
        English: "Sharp -- very hungry, acid reflux",
        Hindi: "तीक्ष्ण — बहुत ज्यादा भूख, एसिडिटी व जलन",
        Bengali: "তীব্র — অতিরিক্ত ক্ষুধা, বুকজ্বালা ও টক ঢেকুর",
        Tamil: "கடுமையானது — அதிக பசி, நெஞ்செரிச்சல்",
        Telugu: "తీవ్రమైనది — విపరీతమైన ఆకలి, ఎసిడిటీ",
        Marathi: "तीक्ष्ण — खूप भूक लागणे, ॲसिडिटी",
        Gujarati: "તીક્ષ્ણ — ખૂબ ભૂખ લાગવી, એસિડિટી",
        Kannada: "ತೀಕ್ಷ್ಣ — ಅತಿಯಾದ ಹಸಿವು, ಎದೆಯುರಿ"
      }
    }
  },
  koshtha: {
    label: {
      English: "Koshtha (Bowel Habit)",
      Hindi: "कोष्ठ (पेट साफ होने की स्थिति)",
      Bengali: "কোষ্ঠ (মলত্যাগের স্বভাব)",
      Tamil: "கோஷ்டம் (குடல் பழக்கம்)",
      Telugu: "కోష్ఠం (మల విసర్జన)",
      Marathi: "कोष्ठ (पोट साफ होण्याची सवय)",
      Gujarati: "કોષ્ઠ (મળ પ્રવૃત્તિ)",
      Kannada: "ಕೋಷ್ಟ (ಮಲವಿಸರ್ಜನೆ)"
    },
    question: {
      English: "How are your bowel movements?",
      Hindi: "आपका पेट साफ और मल त्याग कैसा रहता है?",
      Bengali: "আপনার পেট পরিষ্কার ও মলত্যাগ কেমন হয়?",
      Tamil: "உங்கள் குடல் இயக்கம் எப்படி உள்ளது?",
      Telugu: "మీ మల విసర్జన ఎలా ఉంటుంది?",
      Marathi: "तुमचे पोट कसे साफ होते?",
      Gujarati: "તમારું પેટ સાફ થવાની સ્થિતિ કેવી છે?",
      Kannada: "ನಿಮ್ಮ ಮಲವಿಸರ್ಜನೆ ಹೇಗಿದೆ?"
    },
    options: {
      "Regular once daily": {
        English: "Regular once daily",
        Hindi: "नियमित दिन में एक बार",
        Bengali: "নিয়মিত দিনে একবার স্বাভাবিক",
        Tamil: "வழக்கமாக தினமும் ஒரு முறை",
        Telugu: "రోజూ ఒకసారి క్రమం తప్పకుండా",
        Marathi: "दररोज नियमित एकदा",
        Gujarati: "દરરોજ નિયમિત એક વાર",
        Kannada: "ದಿನಕ್ಕೆ ಒಮ್ಮೆ ನಿಯಮಿತವಾಗಿ"
      },
      "Irregular / Sometimes constipated": {
        English: "Irregular / Sometimes constipated",
        Hindi: "अनियमित / कभी-कभी कब्ज",
        Bengali: "অনিয়মিত / মাঝে মাঝে কোষ্ঠকাঠিন্য",
        Tamil: "ஒழுங்கற்றது / சில நேரங்களில் மலச்சிக்கல்",
        Telugu: "సక్రమంగా లేదు / అప్పుడప్పుడు మలబద్ధకం",
        Marathi: "अनियमित / कधीकधी बद्धकोष्ठता",
        Gujarati: "અનિયમિત / ક્યારેક કબજિયાત",
        Kannada: "ಅನಿಯಮಿತ / ಕೆಲವೊಮ್ಮೆ ಮಲಬದ್ಧತೆ"
      },
      "Loose / Frequent": {
        English: "Loose / Frequent",
        Hindi: "पतला मल / बार-बार जाना",
        Bengali: "পাতলা মল / ঘন ঘন মলত্যাগ",
        Tamil: "தளர்வான / அடிக்கடி மலம் கழித்தல்",
        Telugu: "వదులుగా / తరచుగా",
        Marathi: "पातळ संडास / वारंवार जाणे",
        Gujarati: "પાતળા મળ / વારંવાર જવું",
        Kannada: "ತೆಳುವಾದ / ಪದೇ ಪದೇ"
      },
      "Hard stool / Chronic constipation": {
        English: "Hard stool / Chronic constipation",
        Hindi: "कड़ा मल / पुरानी कब्ज की समस्या",
        Bengali: "কঠিন মল / দীর্ঘস্থায়ী কোষ্ঠকাঠিন্য",
        Tamil: "கடினமான மலம் / நாள்பட்ட மலச்சிக்கல்",
        Telugu: "గట్టి మలం / దీర్ఘకాలిక మలబద్ధకం",
        Marathi: "कडक संडास / जुनाट बद्धकोष्ठता",
        Gujarati: "કઠણ મળ / જૂની કબજિયાત",
        Kannada: "ಗಟ್ಟಿಯಾದ ಮಲ / ದೀರ್ಘಕಾಲದ ಮಲಬದ್ಧತೆ"
      }
    }
  },
  satmya: {
    label: {
      English: "Satmya (Habitual Diet / Adaptability)",
      Hindi: "सात्म्य (आहार अनुकूलता)",
      Bengali: "সাত্ম্য (খাদ্য সহ্যক্ষমতা ও খাদ্যাভ্যাস)",
      Tamil: "சாத்மியா (உணவு ஏற்புத்தன்மை)",
      Telugu: "సాత్మ్య (ఆహార అలవాట్లు)",
      Marathi: "सात्म्य (आहार सहनशीलता)",
      Gujarati: "સાત્મ્ય (આહાર અનુકૂળતા)",
      Kannada: "ಸಾತ್ಮ್ಯ (ಆಹಾರ ಹೊಂದಾಣಿಕೆ)"
    },
    question: {
      English: "Which foods do you regularly eat and tolerate well?",
      Hindi: "आप नियमित रूप से कौन सा भोजन खाते हैं और आसानी से पचा लेते हैं?",
      Bengali: "কোন ধরনের খাবার আপনি নিয়মিত খান এবং সহজে সহ্য করতে পারেন?",
      Tamil: "எந்த உணவுகளை நீங்கள் வழக்கமாக சாப்பிட்டு நன்றாக ஜீரணிக்கிறீர்கள்?",
      Telugu: "మీరు క్రమం తప్పకుండా ఏ ఆహారాన్ని తింటారు మరియు సులభంగా జీర్ణించుకుంటారు?",
      Marathi: "तुम्ही कोणते अन्न नियमित खाता आणि सहज पचवू शकता?",
      Gujarati: "તમે નિયમિત કયો ખોરાક ખાઓ છો અને તે સારી રીતે પચે છે?",
      Kannada: "ಯಾವ ಆಹಾರಗಳನ್ನು ನೀವು ನಿಯಮಿತವಾಗಿ ತಿನ್ನುತ್ತೀರಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಜೀರ್ಣಿಸಿಕೊಳ್ಳುತ್ತೀರಿ?"
    },
    options: {
      "Vegetarian -- light foods": {
        English: "Vegetarian -- light foods",
        Hindi: "शाकाहारी — सुपाच्य हल्का भोजन",
        Bengali: "নিরামিষ — সহজপাচ্য হালকা খাবার",
        Tamil: "சைவ உணவு — எளிய லேசான உணவுகள்",
        Telugu: "శాఖాహారం — తేలికపాటి ఆహారం",
        Marathi: "शाकाहारी — हलके व साधे अन्न",
        Gujarati: "શાકાહારી — હલકો ખોરાક",
        Kannada: "ಸಸ್ಯಾಹಾರಿ — ಹಗುರವಾದ ಆಹಾರ"
      },
      "Non-vegetarian -- mixed diet": {
        English: "Non-vegetarian -- mixed diet",
        Hindi: "मांसाहारी — मिश्रित आहार",
        Bengali: "আমিষ — মিশ্র খাদ্যাভ্যাস",
        Tamil: "அசைவ உணவு — கலவையான உணவுமுறை",
        Telugu: "మాంసాహారం — మిశ్రమ ఆహారం",
        Marathi: "मांसाहारी — मिश्र आहार",
        Gujarati: "માંસાહારી — મિશ્ર આહાર",
        Kannada: "ಮಾಂಸಾಹಾರಿ — ಮಿಶ್ರ ಆಹಾರ"
      },
      "Spicy / Oily foods": {
        English: "Spicy / Oily foods",
        Hindi: "मसालेदार / तला-भुना तैलीय भोजन",
        Bengali: "ঝাল ও মশলাদার / তৈলাক্ত খাবার",
        Tamil: "காரமான / எண்ணெய் உணவுகள்",
        Telugu: "కారంగా / నూనెతో కూడిన ఆహారం",
        Marathi: "तिखट / तेलकट अन्न",
        Gujarati: "મસાલેદાર / તેલી ખોરાક",
        Kannada: "ಖಾರ / ಎಣ್ಣೆಯುಕ್ತ ಆಹಾರ"
      },
      "Raw / Cold foods": {
        English: "Raw / Cold foods",
        Hindi: "कच्चा सलाद / ठंडा भोजन",
        Bengali: "কাঁচা সালাদ / ঠান্ডা খাবার",
        Tamil: "பச்சை உணவுகள் / குளிர்ந்த உணவுகள்",
        Telugu: "పచ్చి ఆహారాలు / చల్లని ఆహారాలు",
        Marathi: "कच्चे अन्न / थंड पदार्थ",
        Gujarati: "કાચો ખોરાક / ઠંડો ખોરાક",
        Kannada: "ಹಸಿ ಆಹಾರ / ತಣ್ಣನೆಯ ಆಹಾರ"
      },
      "Multiple intolerances": {
        English: "Multiple intolerances",
        Hindi: "कई चीजों से अपच या एलर्जी",
        Bengali: "একাধিক খাবারে বদহজম বা এলার্জি",
        Tamil: "பல உணவுகள் ஒத்துக்கொள்வதில்லை",
        Telugu: "అనేక ఆహారాలు పడకపోవడం",
        Marathi: "अनेक पदार्थांचा त्रास होतो",
        Gujarati: "ઘણી વસ્તુઓ પચતી નથી",
        Kannada: "ಹಲವು ಆಹಾರಗಳು ಒಗ್ಗುವುದಿಲ್ಲ"
      }
    }
  },
  sara: {
    label: {
      English: "Sara (Tissue Quality)",
      Hindi: "सार (धातु व शारीरिक पुष्टि)",
      Bengali: "সার (শারীরিক পুষ্টি ও ধাতু শক্তি)",
      Tamil: "சாரம் (திசு தரம் மற்றும் வலிமை)",
      Telugu: "సారం (ధాతు బలం)",
      Marathi: "सार (शरीराचे पोषण व ताकद)",
      Gujarati: "સાર (શારીરિક પૃષ્ટિ)",
      Kannada: "ಸಾರ (ಧಾತು ಶಕ್ತಿ)"
    },
    question: {
      English: "How would you describe your physical build and tissue quality?",
      Hindi: "आप अपनी शारीरिक बनावट और शक्ति का वर्णन कैसे करेंगे?",
      Bengali: "আপনি আপনার শারীরিক গঠন ও শক্তি কীভাবে বর্ণনা করবেন?",
      Tamil: "உங்கள் உடல் அமைப்பையும் வலிமையையும் எவ்வாறு விவரிப்பீர்கள்?",
      Telugu: "మీ శరీర నిర్మాణాన్ని మరియు బలాన్ని మీరు ఎలా వివరిస్తారు?",
      Marathi: "तुम्ही तुमच्या शरीराची ताकद आणि बांध्याचे वर्णन कसे कराल?",
      Gujarati: "તમે તમારા શરીરની મજબૂતી અને શક્તિનું વર્ણન કેવી રીતે કરશો?",
      Kannada: "ನಿಮ್ಮ ದೇಹದ ನಿರ್ಮಾಣ ಮತ್ತು ಶಕ್ತಿಯನ್ನು ಹೇಗೆ ವಿವರಿಸುತ್ತೀರಿ?"
    },
    options: {
      "Excellent -- strong, well-nourished": {
        English: "Excellent -- strong, well-nourished",
        Hindi: "उत्कृष्ट — मजबूत, सुपोषित व ऊर्जावान",
        Bengali: "খুব ভালো — বলিষ্ঠ, সুপুষ্ট ও কর্মক্ষম",
        Tamil: "மிகச் சிறந்தது — பலமான, நல்ல ஊட்டச்சத்து",
        Telugu: "అద్భుతం — బలమైన, మంచి పోషణ",
        Marathi: "उत्तम — मजबूत, सुदृढ व ताकदवान",
        Gujarati: "ઉત્તમ — મજબૂત, પોષણયુક્ત",
        Kannada: "ಉತ್ತಮ — ಬಲವಾದ, ಉತ್ತಮ ಪೋಷಣೆ"
      },
      "Average -- moderate strength": {
        English: "Average -- moderate strength",
        Hindi: "मध्यम — सामान्य शक्ति व बनावट",
        Bengali: "মাঝারি — পরিমিত শক্তি ও গড়ন",
        Tamil: "நடுத்தரம் — சராசரி வலிமை",
        Telugu: "మధ్యస్థం — సాధారణ బలం",
        Marathi: "मध्यम — सामान्य ताकद",
        Gujarati: "મધ્યમ — સામાન્ય શક્તિ",
        Kannada: "ಮಧ್ಯಮ — ಸಾಧಾರಣ ಶಕ್ತಿ"
      },
      "Poor -- easily fatigued, thin": {
        English: "Poor -- easily fatigued, thin",
        Hindi: "कमजोर — दुबला, जल्दी थकान होना",
        Bengali: "দুর্বল — রোগা, অল্পতেই ক্লান্তি আসে",
        Tamil: "குறைவு — மெலிந்த, எளிதில் சோர்வு",
        Telugu: "తక్కువ — సన్నగా, త్వరగా అలసట",
        Marathi: "कमी — बारीक, लवकर थकवा येणे",
        Gujarati: "નબળું — પાતળા, જલ્દી થાકી જવું",
        Kannada: "ಕಡಿಮೆ — ತೆಳ್ಳಗೆ, ಸುಲಭವಾಗಿ ಆಯಾಸ"
      }
    }
  },
  samhanana: {
    label: {
      English: "Samhanana (Body Compactness)",
      Hindi: "संहनन (शारीरिक कसावट व सुदृढ़ता)",
      Bengali: "সংহনন (দেহের দৃঢ়তা ও পেশির বাঁধন)",
      Tamil: "சம்ஹனனம் (உடல் உறுதி மற்றும் கட்டுக்கோப்பு)",
      Telugu: "సంహననం (శరీర దృఢత్వం)",
      Marathi: "संहनन (शरीराचा घट्टपणा)",
      Gujarati: "સંહનન (શરીરની સુગઠિતતા)",
      Kannada: "ಸಂಹನನ (ದೇಹದ ಕಟ್ಟುಮಸ್ತುತನ)"
    },
    question: {
      English: "How is your body frame / muscle compactness?",
      Hindi: "आपकी शारीरिक बनावट और मांसपेशियों की कसावट कैसी है?",
      Bengali: "আপনার শরীরের কাঠামো এবং পেশির দৃঢ়তা কেমন?",
      Tamil: "உங்கள் உடல் கட்டமைப்பு மற்றும் தசை உறுதி எப்படி உள்ளது?",
      Telugu: "మీ శరీర ఆకృతి మరియు కండరాల దృఢత్వం ఎలా ఉంది?",
      Marathi: "तुमच्या शरीराचा बांधा आणि स्नायूंची ताकद कशी आहे?",
      Gujarati: "તમારું શરીર અને સ્નાયુઓની મજબૂતી કેવી છે?",
      Kannada: "ನಿಮ್ಮ ದೇಹದ ಚೌಕಟ್ಟು ಮತ್ತು ಸ್ನಾಯುಗಳ ದೃಢತೆ ಹೇಗಿದೆ?"
    },
    options: {
      "Well-built / Compact": {
        English: "Well-built / Compact",
        Hindi: "सुगठित / मजबूत व कसा हुआ",
        Bengali: "সুগঠিত / আঁটোসাঁটো ও বলিষ্ঠ",
        Tamil: "நல்ல கட்டுக்கோப்பான / உறுதியான",
        Telugu: "బాగా నిర్మించబడిన / దృఢమైన",
        Marathi: "सुदृढ / मजबूत बांधा",
        Gujarati: "સુગઠિત / મજબૂત",
        Kannada: "ಉತ್ತಮ ರಚನೆ / ದೃಢವಾದ"
      },
      "Average": {
        English: "Average",
        Hindi: "सामान्य",
        Bengali: "মাঝারি ধরনের গঠন",
        Tamil: "சராசரி",
        Telugu: "సాధారణం",
        Marathi: "साधारण",
        Gujarati: "સામાન્ય",
        Kannada: "ಸಾಧಾರಣ"
      },
      "Loose / Frail": {
        English: "Loose / Frail",
        Hindi: "ढीला / दुर्बल व नाजुक",
        Bengali: "শিথিল / দুর্বল ও নরম",
        Tamil: "தளர்வான / பலவீனமான",
        Telugu: "వదులుగా / బలహీనంగా",
        Marathi: "सैल / अशक्त",
        Gujarati: "ઢીલું / કમજોર",
        Kannada: "ಸಡಿಲ / ದುರ್ಬಲ"
      }
    }
  },
  ahara_shakti: {
    label: {
      English: "Ahara Shakti (Appetite)",
      Hindi: "आहार शक्ति (भूख व भोजन क्षमता)",
      Bengali: "আহার শক্তি (ক্ষুধা ও খাওয়ার পরিমাণ)",
      Tamil: "ஆஹார சக்தி (உணவு உட்கொள்ளும் திறன்)",
      Telugu: "ఆహార శక్తి (ఆకలి మరియు తినే సామర్థ్యం)",
      Marathi: "आहार शक्ती (भूक आणि खाण्याची क्षमता)",
      Gujarati: "આહાર શક્તિ (ભૂખ અને ખોરાક લેવાની ક્ષમતા)",
      Kannada: "ಆಹಾರ ಶಕ್ತಿ (ಹಸಿವು ಮತ್ತು ಊಟದ ಸಾಮರ್ಥ್ಯ)"
    },
    question: {
      English: "How would you describe your appetite?",
      Hindi: "आप अपनी भूख और खाने की इच्छा का वर्णन कैसे करेंगे?",
      Bengali: "আপনার ক্ষুধা ও খাওয়ার ইচ্ছা কেমন?",
      Tamil: "உங்கள் பசி உணர்வை எவ்வாறு விவரிப்பீர்கள்?",
      Telugu: "మీ ఆకలిని మీరు ఎలా వివరిస్తారు?",
      Marathi: "तुमची भूक कशी असते?",
      Gujarati: "તમારી ભૂખ કેવી છે?",
      Kannada: "ನಿಮ್ಮ ಹಸಿವು ಹೇಗಿದೆ?"
    },
    options: {
      "Strong -- large portions": {
        English: "Strong -- large portions",
        Hindi: "अधिक भूख — भरपूर मात्रा में खाना पचना",
        Bengali: "তীব্র — ভালো ক্ষুধা পায়, বেশি পরিমাণে খেতে পারি",
        Tamil: "அதிக பசி — தாராளமாக சாப்பிட முடிகிறது",
        Telugu: "ఎక్కువ ఆకలి — ఎక్కువ పరిమాణంలో తింటాను",
        Marathi: "चांगली भूक — भरपूर जेवण जाते",
        Gujarati: "સારી ભૂખ — પુષ્કળ જમી શકાય છે",
        Kannada: "ಉತ್ತಮ ಹಸಿವು — ಹೆಚ್ಚು ಪ್ರಮಾಣದಲ್ಲಿ ಊಟ"
      },
      "Moderate -- average portions": {
        English: "Moderate -- average portions",
        Hindi: "मध्यम — सामान्य मात्रा में भोजन",
        Bengali: "মাঝারি — পরিমিত পরিমাণে খাই",
        Tamil: "மிதமான பசி — இயல்பான அளவு",
        Telugu: "మధ్యస్థ ఆకలి — సాధారణ పరిమాణం",
        Marathi: "मध्यम भूक — योग्य प्रमाणात जेवण",
        Gujarati: "સામાન્ય ભૂખ — મધ્યમ માત્રા",
        Kannada: "ಮಧ್ಯಮ ಹಸಿವು — ಸಾಧಾರಣ ಪ್ರಮಾಣ"
      },
      "Weak -- small portions, easily full": {
        English: "Weak -- small portions, easily full",
        Hindi: "कम भूख — थोड़ा खाने पर ही पेट भर जाना",
        Bengali: "কম ক্ষুধা — অল্প খেলেই পেট ভরে যায়",
        Tamil: "குறைந்த பசி — சிறிது சாப்பிட்டாலே வயிறு நிரம்பிவிடும்",
        Telugu: "తక్కువ ఆకలి — కొద్దిగా తిన్నా కడుపు నిండుతుంది",
        Marathi: "कमी भूक — थोडे खाल्ले तरी पोट भरते",
        Gujarati: "ઓછી ભૂખ — થોડું ખાતા જ પેટ ભરાઈ જાય છે",
        Kannada: "ಕಡಿಮೆ ಹಸಿವು — ಸ್ವಲ್ಪ ತಿಂದರೂ ಹೊಟ್ಟೆ ತುಂಬುತ್ತದೆ"
      }
    }
  },
  vyayama_shakti: {
    label: {
      English: "Vyayama Shakti (Exercise Tolerance)",
      Hindi: "व्यायाम शक्ति (शारीरिक परिश्रम क्षमता)",
      Bengali: "ব্যায়াম শক্তি (শারীরিক পরিশ্রম সহ্যক্ষমতা)",
      Tamil: "வியாயாம சக்தி (உடற்பயிற்சி தாங்கும் திறன்)",
      Telugu: "వ్యాయామ శక్తి (శారీరక శ్రమ సామర్థ్యం)",
      Marathi: "व्यायाम शक्ती (शारीरिक कष्टाची क्षमता)",
      Gujarati: "વ્યાયામ શક્તિ (કસરત અને શ્રમ સહન કરવાની ક્ષમતા)",
      Kannada: "ವ್ಯಾಯಾಮ ಶಕ್ತಿ (ದೈಹಿಕ ಶ್ರಮ ಸಹಿಷ್ಣುತೆ)"
    },
    question: {
      English: "How much physical activity can you comfortably perform?",
      Hindi: "आप बिना ज्यादा थके कितना शारीरिक परिश्रम कर सकते हैं?",
      Bengali: "আপনি স্বাচ্ছন্দ্যে কতটা শারীরিক পরিশ্রম করতে পারেন?",
      Tamil: "சிரமமின்றி உங்களால் எவ்வளவு உடற்பயிற்சி அல்லது வேலை செய்ய முடியும்?",
      Telugu: "మీరు ఎలాంటి ఇబ్బంది లేకుండా ఎంత శారీరక శ్రమ చేయగలరు?",
      Marathi: "तुम्ही न थकता किती शारीरिक हालचाल करू शकता?",
      Gujarati: "તમે થાક્યા વિના કેટલી શારીરિક પ્રવૃત્તિ કરી શકો છો?",
      Kannada: "ನೀವು ಆಯಾಸವಿಲ್ಲದೆ ಎಷ್ಟು ದೈಹಿಕ ಚಟುವಟಿಕೆಯನ್ನು ಮಾಡಬಹುದು?"
    },
    options: {
      "High -- vigorous exercise daily": {
        English: "High -- vigorous exercise daily",
        Hindi: "अधिक — प्रतिदिन भारी व्यायाम या कड़ी मेहनत",
        Bengali: "বেশি — প্রতিদিন ভারী পরিশ্রম বা ব্যায়াম করতে পারি",
        Tamil: "அதிகம் — தினமும் தீவிர உடற்பயிற்சி செய்ய முடியும்",
        Telugu: "ఎక్కువ — రోజూ తీవ్రమైన వ్యాయామం చేయగలను",
        Marathi: "उत्तम — दररोज भरपूर व्यायाम किंवा मेहनत",
        Gujarati: "વધુ — રોજ ભારે કસરત કે પરિશ્રમ",
        Kannada: "ಹೆಚ್ಚು — ಪ್ರತಿದಿನ ತೀವ್ರ ವ್ಯಾಯಾಮ ಮಾಡಲು ಸಾಧ್ಯ"
      },
      "Moderate -- light activity": {
        English: "Moderate -- light activity",
        Hindi: "मध्यम — हल्की गतिविधि या सामान्य चलना-फिरना",
        Bengali: "মাঝারি — হালকা চলাফেরা বা সাধারণ কাজ",
        Tamil: "மிதமானது — லேசான உடற்பயிற்சி அல்லது நடைபயிற்சி",
        Telugu: "మధ్యస్థం — తేలికపాటి వ్యాయామం",
        Marathi: "मध्यम — थोडे चालणे व हलकी कामे",
        Gujarati: "મધ્યમ — સામાન્ય હલનચલન",
        Kannada: "ಮಧ್ಯಮ — ಲಘು ಚಟುವಟಿಕೆ"
      },
      "Low -- tires quickly with minimal exertion": {
        English: "Low -- tires quickly with minimal exertion",
        Hindi: "कम — थोड़ा चलने या काम करने पर ही सांस फूलना",
        Bengali: "কম — সামান্য পরিশ্রমে দ্রুত হাঁপিয়ে যাই",
        Tamil: "குறைவு — சிறிது வேலை செய்தாலே சோர்வடைந்துவிடுவேன்",
        Telugu: "తక్కువ — కొద్దిపాటి శ్రమకే త్వరగా అలసిపోతాను",
        Marathi: "कमी — थोड्याशा श्रमाने लगेच थकवा येतो",
        Gujarati: "ઓછું — થોડા પરિશ્રમથી તરત થાક લાગે છે",
        Kannada: "ಕಡಿಮೆ — ಸ್ವಲ್ಪ ಕೆಲಸಕ್ಕೂ ಬೇಗನೆ ಆಯಾಸವಾಗುತ್ತದೆ"
      }
    }
  },
  vaya: {
    label: {
      English: "Vaya (Life Stage)",
      Hindi: "वय (आयु / जीवन अवस्था)",
      Bengali: "বয়স (জীবনের পর্যায়)",
      Tamil: "வயது (வாழ்க்கை நிலை)",
      Telugu: "వయస్సు (జీవిత దశ)",
      Marathi: "वय (वयाचा टप्पा)",
      Gujarati: "વય (જીવનનો તબક્કો)",
      Kannada: "ವಯಸ್ಸು (ಜೀವನ ಹಂತ)"
    },
    question: {
      English: "Which life stage applies to you?",
      Hindi: "आपके लिए कौन सा जीवन चरण लागू होता है?",
      Bengali: "আপনার জন্য কোন জীবন পর্যায় প্রযোজ্য?",
      Tamil: "உங்களுக்கு எந்த வாழ்க்கை நிலை பொருந்தும்?",
      Telugu: "మీకు ఏ జీవిత దశ వర్తిస్తుంది?",
      Marathi: "तुमच्यासाठी कोणता जीवन टप्पा लागू होतो?",
      Gujarati: "તમને કયો જીવન તબક્કો લાગુ પડે છે?",
      Kannada: "ನಿಮಗೆ ಯಾವ ಜೀವನ ಹಂತ ಅನ್ವಯಿಸುತ್ತದೆ?"
    },
    options: {
      "Bala (Child / Adolescent up to 16)": {
        English: "Bala (Child / Adolescent up to 16)",
        Hindi: "बाल (बच्चा / १६ वर्ष तक का किशोर)",
        Bengali: "বাল্য (শিশু / ১৬ বছর পর্যন্ত কিশোর)",
        Tamil: "பால பருவம் (குழந்தை / 16 வயது வரை)",
        Telugu: "బాల్యం (పిల్లలు / 16 సంవత్సరాల వరకు)",
        Marathi: "बाल्य (मूल / १६ वर्षांपर्यंत)",
        Gujarati: "બાલ્ય (બાળક / ૧૬ વર્ષ સુધી)",
        Kannada: "ಬಾಲ್ಯ (ಮಗು / ೧೬ ವರ್ಷದವರೆಗೆ)"
      },
      "Madhya (Adult / Middle age 16-60)": {
        English: "Madhya (Adult / Middle age 16-60)",
        Hindi: "मध्य (वयस्क / मध्यम आयु १६-६०)",
        Bengali: "মধ্য (প্রাপ্তবয়স্ক / মধ্যবয়সী ১৬–৬০ বছর)",
        Tamil: "மத்திய பருவம் (வயது வந்தோர் 16-60)",
        Telugu: "మధ్య వయస్సు (యువకులు / పెద్దలు 16-60)",
        Marathi: "मध्यम वय (प्रौढ १६-६० वर्षे)",
        Gujarati: "મધ્યમ વય (પુખ્ત ૧૬-૬૦ વર્ષ)",
        Kannada: "ಮಧ್ಯ ವಯಸ್ಸು (ವಯಸ್ಕರು ೧೬-೬೦ ವರ್ಷ)"
      },
      "Vriddha (Senior / Elderly 60+)": {
        English: "Vriddha (Senior / Elderly 60+)",
        Hindi: "वृद्ध (वरिष्ठ / बुजुर्ग ६०+)",
        Bengali: "বৃদ্ধ (প্রবীণ / প্রৌঢ় ৬০+ বছর)",
        Tamil: "முதியோர் பருவம் (மூத்த குடிமக்கள் 60+)",
        Telugu: "వృద్ధాప్యం (వృద్ధులు 60+)",
        Marathi: "वृद्ध (ज्येष्ठ नागरिक ६०+ वर्षे)",
        Gujarati: "વૃદ્ધ (વરિષ્ઠ નાગરિક ૬૦+)",
        Kannada: "ವೃದ್ಧಾಪ್ಯ (ಹಿರಿಯ ನಾಗರಿಕರು ೬೦+)"
      }
    }
  }
};

export function getAyushLabelTrans(field, lang = "English", fallback = "") {
  return AYUSH_TRANSLATIONS[field]?.label?.[lang] || AYUSH_TRANSLATIONS[field]?.label?.English || fallback || field;
}

export function getAyushQuestionTrans(fieldOrQ, lang = "English") {
  const field = typeof fieldOrQ === "object" ? fieldOrQ.field : fieldOrQ;
  const fallback = typeof fieldOrQ === "object" ? fieldOrQ.question : "";
  return AYUSH_TRANSLATIONS[field]?.question?.[lang] || AYUSH_TRANSLATIONS[field]?.question?.English || fallback;
}

export function getAyushOptionTrans(field, optionEng, lang = "English") {
  return AYUSH_TRANSLATIONS[field]?.options?.[optionEng]?.[lang] || optionEng;
}
