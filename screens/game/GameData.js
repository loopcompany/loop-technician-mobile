// GameData.js - داده‌های بازی کامپیوتر و تکنولوژی برای کودکان

export const GAME_DEVICES = [
  {
    id: 1,
    name: 'لپ‌تاپ',
    nameKey: 'Laptop',
    emoji: '💻',
    color: '#4A90E2',
    sound: 'کلیک کلیک',
    soundKey: 'Click click',
  },
  {
    id: 2,
    name: 'کامپیوتر',
    nameKey: 'Computer',
    emoji: '🖥',
    color: '#2C3E50',
    sound: 'بوت بوت',
    soundKey: 'Boot boot',
  },
  {
    id: 3,
    name: 'موس',
    nameKey: 'Mouse',
    emoji: '🖱',
    color: '#E74C3C',
    sound: 'کلیک',
    soundKey: 'Click',
  },
  {
    id: 4,
    name: 'کیبورد',
    nameKey: 'Keyboard',
    emoji: '⌨',
    color: '#34495E',
    sound: 'تاپ تاپ',
    soundKey: 'Tap tap',
  },
  {
    id: 5,
    name: 'تلفن همراه',
    nameKey: 'Mobile phone',
    emoji: '📱',
    color: '#50C878',
    sound: 'زنگ زنگ',
    soundKey: 'Ring ring',
  },
  {
    id: 6,
    name: 'تبلت',
    nameKey: 'Tablet',
    emoji: '📱',
    color: '#1ABC9C',
    sound: 'سوییش',
    soundKey: 'Swish',
  },
  {
    id: 7,
    name: 'پرینتر',
    nameKey: 'Printer',
    emoji: '🖨',
    color: '#95A5A6',
    sound: 'ویز ویز',
    soundKey: 'Whirr',
  },
  {
    id: 8,
    name: 'هدفون',
    nameKey: 'Headphones',
    emoji: '🎧',
    color: '#9B59B6',
    sound: 'موزیک',
    soundKey: 'Music',
  },
  {
    id: 9,
    name: 'دوربین',
    nameKey: 'Camera',
    emoji: '📷',
    color: '#E67E22',
    sound: 'کلیک کچ',
    soundKey: 'Click snap',
  },
  {
    id: 10,
    name: 'اسپیکر',
    nameKey: 'Speaker',
    emoji: '🔊',
    color: '#F39C12',
    sound: 'بوق بوق',
    soundKey: 'Beep beep',
  },
  {
    id: 11,
    name: 'فلش مموری',
    nameKey: 'Flash drive',
    emoji: '💾',
    color: '#16A085',
    sound: 'کلیک',
    soundKey: 'Click',
  },
  {
    id: 12,
    name: 'آنتن وای‌فای',
    nameKey: 'Wi-Fi antenna',
    emoji: '📡',
    color: '#3498DB',
    sound: 'وای فای',
    soundKey: 'Wi-Fi',
  },
];

// سطوح بازی
export const GAME_LEVELS = {
  EASY: {
    id: 'easy',
    name: 'آسان',
    nameKey: 'Easy',
    emoji: '😊',
    options: 2,
    questions: 5,
    timePerQuestion: 0,
  },
  MEDIUM: {
    id: 'medium',
    name: 'متوسط',
    nameKey: 'Medium',
    emoji: '🤔',
    options: 3,
    questions: 8,
    timePerQuestion: 0,
  },
  HARD: {
    id: 'hard',
    name: 'سخت',
    nameKey: 'Hard',
    emoji: '🧠',
    options: 4,
    questions: 10,
    timePerQuestion: 0,
  },
};

// پیام‌های تشویقی
export const ENCOURAGEMENT_MESSAGES = [
  { emoji: '🎉', text: 'آفرین!', textKey: 'Well done!', color: '#4CAF50' },
  { emoji: '⭐', text: 'عالی!', textKey: 'Great!', color: '#FFC107' },
  { emoji: '🌟', text: 'دمت گرم!', textKey: 'Nice!', color: '#FF9800' },
  { emoji: '👏', text: 'حرف نداری!', textKey: "You're amazing!", color: '#2196F3' },
  { emoji: '💪', text: 'قوی هستی!', textKey: 'You are strong!', color: '#9C27B0' },
  { emoji: '🏆', text: 'قهرمان!', textKey: 'Champion!', color: '#FFD700' },
  { emoji: '✨', text: 'فوق‌العاده!', textKey: 'Excellent!', color: '#E91E63' },
  { emoji: '🎯', text: 'درست!', textKey: 'Correct!', color: '#00BCD4' },
];

// پیام‌های نتیجه نهایی
export const RESULT_MESSAGES = [
  {
    minScore: 90,
    emoji: '🏆',
    title: 'قهرمان!',
    titleKey: 'Champion!',
    message: 'تو خیلی باهوشی! همه جواب‌ها را درست دادی!',
    messageKey: 'You are very smart! You got all the answers right!',
    color: '#FFD700',
    stars: 3,
  },
  {
    minScore: 70,
    emoji: '⭐',
    title: 'عالی!',
    titleKey: 'Great!',
    message: 'خیلی خوب بود! تقریباً همه را درست گفتی!',
    messageKey: 'Well done! You got almost all of them right!',
    color: '#4CAF50',
    stars: 3,
  },
  {
    minScore: 50,
    emoji: '👍',
    title: 'خوب بود!',
    titleKey: 'Good job!',
    message: 'خیلی خوب پیش رفتی! بیشتر تمرین کن!',
    messageKey: 'You did well! Practice more!',
    color: '#2196F3',
    stars: 2,
  },
  {
    minScore: 0,
    emoji: '💪',
    title: 'تلاش کردی!',
    titleKey: 'You tried!',
    message: 'خوب بود! دفعه بعد بهتر می‌شی!',
    messageKey: "Good job! You'll do better next time!",
    color: '#FF9800',
    stars: 1,
  },
];

// تابع انتخاب تصادفی دستگاه‌ها
export const getRandomDevices = (count) => {
  const shuffled = [...GAME_DEVICES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// تابع ایجاد سوال
export const generateQuestion = (level) => {
  const { options } = GAME_LEVELS[level.toUpperCase()];
  const allDevices = getRandomDevices(options);
  const correctAnswer = allDevices[Math.floor(Math.random() * allDevices.length)];
  
  return {
    question: `${correctAnswer.name} کجاست؟`,
    correctAnswer,
    options: allDevices,
  };
};

// تابع دریافت پیام تشویقی تصادفی
export const getRandomEncouragement = () => {
  return ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)];
};

// تابع دریافت پیام نتیجه بر اساس امتیاز
export const getResultMessage = (score) => {
  const sortedResults = [...RESULT_MESSAGES].sort((a, b) => b.minScore - a.minScore);
  return sortedResults.find(result => score >= result.minScore) || RESULT_MESSAGES[RESULT_MESSAGES.length - 1];
};
