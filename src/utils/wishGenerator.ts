export interface Contact {
  id: string;
  name: string;
  birthday: string; // MM-DD or YYYY-MM-DD
  relationship: string;
  email?: string;
  phone?: string;
  interests: string;
  notes?: string;
}

export interface ScheduledWish {
  id: string;
  recipientId: string;
  recipientName: string;
  wishType: 'AI Wish' | 'Greeting Card' | 'Written';
  channel: 'Email' | 'Message';
  date: string;
  time: string;
  timezone: string;
  status: 'Scheduled' | 'Sent' | 'Failed';
  messageContent: string;
  cardConfig?: {
    template: string;
    bgColor: string;
    textColor: string;
    sticker: string;
    fontFamily: string;
    heading: string;
    body: string;
  };
}

export interface HistoryItem {
  id: string;
  recipientName: string;
  wishType: 'AI Wish' | 'Greeting Card' | 'Written';
  channel?: 'Email' | 'Message';
  date: string;
  content: string;
  cardConfig?: any;
}

export const DEFAULT_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    birthday: '2026-06-15',
    relationship: 'Friend',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    interests: 'Football, Gaming, Coffee',
    notes: 'Met at college, loves FIFA and dark roast coffee.'
  },
  {
    id: '2',
    name: 'Priya Patel',
    birthday: '2026-06-18',
    relationship: 'Sister',
    email: 'priya.patel@example.com',
    phone: '+91 87654 32109',
    interests: 'Photography, Traveling, Reading',
    notes: 'Loves capturing sunsets and reading fantasy novels.'
  },
  {
    id: '3',
    name: 'Amit Verma',
    birthday: '2026-06-25',
    relationship: 'Colleague',
    email: 'amit.verma@company.com',
    phone: '+91 76543 21098',
    interests: 'Coding, Stock Market, Cycling',
    notes: 'Senior tech lead, avid morning cyclist.'
  }
];

export const DEFAULT_SCHEDULED: ScheduledWish[] = [
  {
    id: 's1',
    recipientId: '1',
    recipientName: 'Rahul Sharma',
    wishType: 'AI Wish',
    channel: 'Message',
    date: '2026-06-15',
    time: '09:00',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    status: 'Scheduled',
    messageContent: 'Happy Birthday Rahul! 🎂 Hope you score some amazing goals today both in FIFA and real life. Let\'s catch up soon for some coffee!'
  },
  {
    id: 's2',
    recipientId: '2',
    recipientName: 'Priya Patel',
    wishType: 'Greeting Card',
    channel: 'Email',
    date: '2026-06-18',
    time: '00:00',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    status: 'Scheduled',
    messageContent: 'Happy Birthday, Sis! 🌸 Hope you capture many beautiful sunsets this year. Love you!',
    cardConfig: {
      template: 'Floral',
      bgColor: '#FFF5F7',
      textColor: '#FF4F9A',
      sticker: '🌸',
      fontFamily: 'Playfair Display',
      heading: 'Happy Birthday Sis!',
      body: 'May your year be filled with adventures, books, and beautiful photography!'
    }
  },
  {
    id: 's3',
    recipientId: '3',
    recipientName: 'Amit Verma',
    wishType: 'AI Wish',
    channel: 'Message',
    date: '2026-06-25',
    time: '11:00',
    timezone: 'Asia/Kolkata (GMT+5:30)',
    status: 'Scheduled',
    messageContent: 'Happy Birthday Amit! 🚀 Wishing you massive success in the stock market and coding this year. Have a great ride!'
  }
];

export const DEFAULT_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    recipientName: 'Suresh Kumar',
    wishType: 'AI Wish',
    channel: 'Message',
    date: '2026-06-05',
    content: 'Wishing you a very happy birthday, Suresh! May your year be filled with prosperity, good health, and success.'
  },
  {
    id: 'h2',
    recipientName: 'Neha Sen',
    wishType: 'Greeting Card',
    channel: 'Email',
    date: '2026-06-08',
    content: 'Happy Birthday Neha! 🥳 Cheers to another wonderful year of growth and laughter.',
    cardConfig: {
      template: 'Party',
      bgColor: '#FFFBEB',
      textColor: '#FF8A3D',
      sticker: '🎉',
      fontFamily: 'Outfit',
      heading: 'Cheers to Neha!',
      body: 'Wishing you a day as bright and beautiful as you are!'
    }
  }
];

export function getDaysRemaining(birthdayStr: string): number {
  if (!birthdayStr) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bdate = new Date(birthdayStr);
  const birthMonth = bdate.getMonth();
  const birthDay = bdate.getDate();

  let targetYear = today.getFullYear();
  let nextBirthday = new Date(targetYear, birthMonth, birthDay);

  if (nextBirthday.getTime() < today.getTime()) {
    nextBirthday.setFullYear(targetYear + 1);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function generateMockWish(
  name: string,
  relationship: string,
  interestsStr: string,
  tone: 'Funny' | 'Emotional' | 'Professional' | 'Romantic',
  length: 'Short' | 'Medium' | 'Long'
): string {
  const interests = interestsStr ? interestsStr.split(',').map(i => i.trim()).filter(Boolean) : [];
  const primaryInterest = interests.length > 0 ? interests[0] : 'celebrations';
  const secondInterest = interests.length > 1 ? interests[1] : '';

  const cleanRel = (relationship || 'friend').toLowerCase();

  const funnyTemplates = {
    Short: [
      `Happy birthday, ${name}! 🎉 You're not getting older, you're just getting closer to senior discounts. Let's celebrate!`,
      `Happy birthday! 🎂 Here's to another year of avoiding responsibilities and playing more ${primaryInterest}!`,
      `HBD ${name}! Let's eat cake, drink coffee, and pretend we know how to do taxes.`
    ],
    Medium: [
      `Happy Birthday to my favorite ${cleanRel}, ${name}! 🥳 I was going to write you a long emotional speech, but then I remembered how much you love ${primaryInterest}. So instead, let's just make sure there's enough cake for both of us. Have a blast!`,
      `Happy birthday, ${name}! 🎉 Another year of surviving together. May your day be filled with doing absolutely nothing productive, playing some ${primaryInterest}, and eating your weight in sweets. Cheers!`,
      `HBD to a legendary ${cleanRel}! 🎂 You've officially reached the age where you enjoy sleeping more than partying. May your day be full of coffee and zero adulting.`
    ],
    Long: [
      `Happy Birthday, ${name}! 🎁 They say wisdom comes with age, but don't worry, you haven't aged a bit! I hope your day is absolutely fantastic, packed with your favorite things—especially ${primaryInterest}${secondInterest ? ' and ' + secondInterest : ''}. Remember: age is just a number, but cake is a solid food groups, so eat up and enjoy your special day to the fullest!`,
      `Huge Happy Birthday to you, ${name}! 🎂 I'm so glad we get to celebrate another year of your awesome existence. Let's make this year all about mastering ${primaryInterest} and less about getting grey hairs. Wishing you an incredible day full of love, laughter, and a very mild hangover tomorrow!`
    ]
  };

  const emotionalTemplates = {
    Short: [
      `Happy birthday, ${name}. ❤️ I am so incredibly grateful to have you in my life. Wishing you all the love today.`,
      `Happy birthday to a wonderful ${cleanRel}! 🌟 Your kindness and warmth make the world a better place.`,
      `To ${name}: Wishing you a day as beautiful and special as your soul. Happy birthday! 🎂`
    ],
    Medium: [
      `Happy Birthday, ${name}! 🌸 Having you as my ${cleanRel} has been one of the greatest blessings in my life. Your support, love for ${primaryInterest}, and beautiful energy always inspire me. I hope this year brings you all the happiness and peace you deserve.`,
      `Wishing a very special birthday to you, ${name}. ❤️ Thank you for always being there, through the good times and the bad. I hope your day is filled with warmth, reflection, and everything that makes you smile. Have a beautiful day!`,
      `Happy birthday, my dear ${cleanRel}! 🎉 Your kindness is a constant source of joy to everyone around you. May this new chapter of your life be filled with love, laughter, and endless beautiful memories.`
    ],
    Long: [
      `Dearest ${name}, Happy Birthday! 🌟 Words cannot fully express how much your presence in my life means to me. From our chats about ${primaryInterest} to the quiet moments of support, you have been an anchor. I wish for you a year of deep happiness, good health, and the fulfillment of all your dreams. May you always know how loved and appreciated you are. Have a truly wonderful and blessed birthday!`,
      `Happy Birthday, ${name}! ❤️ Today we celebrate the incredible person you are. You bring so much light and joy to those around you, and I feel so lucky to share this journey with you. May this year bring you closer to your passions, like ${primaryInterest}, and fill your heart with content. Here's to making more precious memories together.`
    ]
  };

  const professionalTemplates = {
    Short: [
      `Happy Birthday, ${name}! 💼 Wishing you a successful and rewarding year ahead. Enjoy your day!`,
      `Wishing you a very happy birthday, ${name}. 📈 May this year bring you professional success and personal joy.`,
      `Happy Birthday, ${name}! Best wishes from the entire team for a great year ahead.`
    ],
    Medium: [
      `Happy Birthday, ${name}! 🌟 It is a pleasure working with you. Wishing you a wonderful celebration today, and a year filled with exciting opportunities and achievements. Hopefully, you get a break from ${primaryInterest} and work today!`,
      `Wishing you a very happy birthday, ${name}! 🎂 Thank you for your leadership and dedication. May this new year of life bring you continued success, good health, and a perfect work-life balance.`,
      `Happy Birthday! 🚀 May your day be filled with joy and your year with accomplishments. It's great to have a colleague like you who brings so much energy to the team.`
    ],
    Long: [
      `Dear ${name}, on behalf of the team, I want to wish you a very Happy Birthday! 💼 We truly appreciate your hard work, dedication, and the positive energy you bring to the workplace. May this upcoming year be your most successful yet, bringing you exciting challenges, professional growth, and personal happiness. Enjoy your well-deserved celebrations today!`,
      `Wishing you a wonderful birthday, ${name}! 🎂 Thank you for your excellent contributions and for always pushing us forward. I hope this year brings you closer to your personal goals (including your interest in ${primaryInterest}!) and yields massive rewards in all your endeavors. Have a fantastic day!`
    ]
  };

  const romanticTemplates = {
    Short: [
      `Happy birthday, my love. ❤️ You make every single day feel like a celebration.`,
      `Happy birthday, gorgeous! 🌹 You have my whole heart, today and always.`,
      `To the one who makes my heart skip a beat: Happy Birthday! 🎂 I love you.`
    ],
    Medium: [
      `Happy Birthday, my love! 💕 Today is all about celebrating the most beautiful person I know. Thank you for filling my life with so much happiness, laughter, and shared moments of ${primaryInterest}. I can't wait to make today incredibly special for you.`,
      `Happy birthday to my favorite person in the world! 🌹 Every day with you is a gift, but today is extra special because it's the day you were born. I love you more than words can say, and I hope your day is as perfect as you are to me.`,
      `Happy Birthday, sweetheart! 🥰 Here's to another beautiful year of loving you, learning from you, and building our future together. May your day be filled with all the sweet things in life.`
    ],
    Long: [
      `Happy Birthday to my soulmate, my partner, and my best friend, ${name}. ❤️ From the moment you walked into my life, everything changed for the better. I cherish all our memories, from sharing ${primaryInterest} to just holding your hand. You deserve all the love, magic, and happiness in the world today. I promise to spend today and all the days after making sure you feel loved and adored. Happy birthday, my sweet love!`,
      `To the one who holds my heart, Happy Birthday! 🌹 Today, I celebrate the day you came into this world and made it a million times brighter. You inspire me every day with your love and passion. I hope this year brings you endless joy, peace, and that all your dreams come true. I am so blessed to stand by your side. Forever and always, happy birthday!`
    ]
  };

  let pool: string[] = [];
  if (tone === 'Funny') {
    pool = funnyTemplates[length];
  } else if (tone === 'Emotional') {
    pool = emotionalTemplates[length];
  } else if (tone === 'Professional') {
    pool = professionalTemplates[length];
  } else {
    pool = romanticTemplates[length];
  }

  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] || pool[0];
}
