export interface FinancialGoal {
  id: string
  name: string
  icon: string
  targetAmount: number
  currentAmount: number
  deadline: string
  category: string
  instruments: GoalInstrument[]
}

export interface GoalInstrument {
  id: string
  symbol: string
  name: string
  allocation: number // percentage
  currentPrice?: number
  category: string
}

// 10 Finansal Kategori
export const financialCategories = [
  { id: 'retirement', name: 'Emeklilik', icon: '👴', color: '#8b5cf6' },
  { id: 'passive-income', name: 'Pasif Gelir', icon: '💰', color: '#10b981' },
  { id: 'financial-freedom', name: 'Finansal Özgürlük', icon: '🦅', color: '#3b82f6' },
  { id: 'emergency-fund', name: 'Acil Fon', icon: '🛡️', color: '#f59e0b' },
  { id: 'real-estate', name: 'Gayrimenkul', icon: '🏠', color: '#ef4444' },
  { id: 'education', name: 'Eğitim', icon: '📚', color: '#06b6d4' },
  { id: 'travel', name: 'Seyahat', icon: '✈️', color: '#14b8a6' },
  { id: 'health', name: 'Sağlık', icon: '🏥', color: '#ec4899' },
  { id: 'wealth-building', name: 'Servet Biriktirme', icon: '📈', color: '#6366f1' },
  { id: 'early-retirement', name: 'Erken Emeklilik (FIRE)', icon: '🔥', color: '#f97316' }
]

// Her kategori için önerilen yatırım araçları
export const recommendedInstruments: Record<string, GoalInstrument[]> = {
  'retirement': [
    { id: '1', symbol: 'AVR', name: 'AGESA Teknoloji Fonu', allocation: 20, category: 'emk' },
    { id: '2', symbol: 'AFT', name: 'Ak Portföy Yeni Teknolojiler', allocation: 15, category: 'yat' },
    { id: '3', symbol: 'YAC', name: 'Yapı Kredi Portföy', allocation: 15, category: 'yat' },
    { id: '4', symbol: 'BTC', name: 'Bitcoin', allocation: 10, category: 'crypto' },
    { id: '5', symbol: 'ETH', name: 'Ethereum', allocation: 10, category: 'crypto' },
    { id: '6', symbol: 'GLD', name: 'Altın Fonu', allocation: 15, category: 'etf' },
    { id: '7', symbol: 'THYAO', name: 'Türk Hava Yolları', allocation: 15, category: 'stocks' }
  ],
  'passive-income': [
    { id: '8', symbol: 'KIRA', name: 'Gayrimenkul Yatırım Fonu', allocation: 30, category: 'yat' },
    { id: '9', symbol: 'TEMET', name: 'Temettü 25 Fonu', allocation: 25, category: 'yat' },
    { id: '10', symbol: 'FAIZ', name: 'Para Piyasası Fonu', allocation: 20, category: 'etf' },
    { id: '11', symbol: 'REIT', name: 'Gayrimenkul Sertifika', allocation: 15, category: 'etf' },
    { id: '12', symbol: 'BONO', name: 'Devlet Tahvili', allocation: 10, category: 'etf' }
  ],
  'financial-freedom': [
    { id: '13', symbol: 'S&P500', name: 'S&P 500 ETF', allocation: 25, category: 'etf' },
    { id: '14', symbol: 'QQQ', name: 'Nasdaq 100 ETF', allocation: 20, category: 'etf' },
    { id: '15', symbol: 'VTI', name: 'Total World Stock', allocation: 20, category: 'etf' },
    { id: '16', symbol: 'BTC', name: 'Bitcoin', allocation: 15, category: 'crypto' },
    { id: '17', symbol: 'ETH', name: 'Ethereum', allocation: 10, category: 'crypto' },
    { id: '18', symbol: 'GOLD', name: 'Altın', allocation: 10, category: 'etf' }
  ],
  'emergency-fund': [
    { id: '19', symbol: 'TL', name: 'TL Mevduat', allocation: 40, category: 'cash' },
    { id: '20', symbol: 'USD', name: 'Döviz', allocation: 30, category: 'cash' },
    { id: '21', symbol: 'EUR', name: 'Euro', allocation: 20, category: 'cash' },
    { id: '22', symbol: 'ALTIN', name: 'Gram Altın', allocation: 10, category: 'etf' }
  ],
  'real-estate': [
    { id: '23', symbol: 'GYO', name: 'Gayrimenkul Y.O.', allocation: 30, category: 'stocks' },
    { id: '24', symbol: 'REIT', name: 'REIT Fonu', allocation: 25, category: 'etf' },
    { id: '25', symbol: 'KONUT', name: 'Konut Fonu', allocation: 25, category: 'yat' },
    { id: '26', symbol: 'ARSA', name: 'Arsa Yatırımı', allocation: 20, category: 'realestate' }
  ],
  'education': [
    { id: '27', symbol: 'EDU', name: 'Eğitim Fonu', allocation: 40, category: 'yat' },
    { id: '28', symbol: 'TECH', name: 'Teknoloji Hisse', allocation: 30, category: 'stocks' },
    { id: '29', symbol: 'BOND', name: 'Eğitim Tahvili', allocation: 30, category: 'etf' }
  ],
  'travel': [
    { id: '30', symbol: 'USD', name: 'Döviz (USD)', allocation: 40, category: 'cash' },
    { id: '31', symbol: 'EUR', name: 'Döviz (EUR)', allocation: 30, category: 'cash' },
    { id: '32', symbol: 'TRAVEL', name: 'Turizm Fonu', allocation: 30, category: 'yat' }
  ],
  'health': [
    { id: '33', symbol: 'SAĞLIK', name: 'Sağlık Sigortası', allocation: 40, category: 'cash' },
    { id: '34', symbol: 'BIO', name: 'Biyoteknoloji Fonu', allocation: 30, category: 'yat' },
    { id: '35', symbol: 'PHARMA', name: 'İlaç Şirketleri', allocation: 30, category: 'stocks' }
  ],
  'wealth-building': [
    { id: '36', symbol: 'BTC', name: 'Bitcoin', allocation: 20, category: 'crypto' },
    { id: '37', symbol: 'ETH', name: 'Ethereum', allocation: 15, category: 'crypto' },
    { id: '38', symbol: 'NVDA', name: 'NVIDIA', allocation: 15, category: 'stocks' },
    { id: '39', symbol: 'AAPL', name: 'Apple', allocation: 15, category: 'stocks' },
    { id: '40', symbol: 'MSFT', name: 'Microsoft', allocation: 15, category: 'stocks' },
    { id: '41', symbol: 'GOOGL', name: 'Alphabet', allocation: 10, category: 'stocks' },
    { id: '42', symbol: 'AMZN', name: 'Amazon', allocation: 10, category: 'stocks' }
  ],
  'early-retirement': [
    { id: '43', symbol: 'VUAA', name: 'Vanguard S&P 500', allocation: 25, category: 'etf' },
    { id: '44', symbol: 'VFEM', name: 'Vanguard Emerging Markets', allocation: 15, category: 'etf' },
    { id: '45', symbol: 'BTC', name: 'Bitcoin', allocation: 15, category: 'crypto' },
    { id: '46', symbol: 'ETH', name: 'Ethereum', allocation: 10, category: 'crypto' },
    { id: '47', symbol: 'GLD', name: 'Altın ETF', allocation: 15, category: 'etf' },
    { id: '48', symbol: 'VNQ', name: 'Vanguard Real Estate', allocation: 10, category: 'etf' },
    { id: '49', symbol: 'TL', name: 'Nakit (TL)', allocation: 10, category: 'cash' }
  ]
}

// Örnek hedefler
export const sampleGoals: FinancialGoal[] = [
  {
    id: 'goal-1',
    name: 'Emeklilik Fonu',
    icon: '👴',
    targetAmount: 500000,
    currentAmount: 125750,
    deadline: '2045-12-31',
    category: 'retirement',
    instruments: recommendedInstruments['retirement']
  },
  {
    id: 'goal-2',
    name: 'Pasif Gelir',
    icon: '💰',
    targetAmount: 100000,
    currentAmount: 25000,
    deadline: '2030-12-31',
    category: 'passive-income',
    instruments: recommendedInstruments['passive-income']
  },
  {
    id: 'goal-3',
    name: 'Finansal Özgürlük',
    icon: '🦅',
    targetAmount: 1000000,
    currentAmount: 125750,
    deadline: '2035-12-31',
    category: 'financial-freedom',
    instruments: recommendedInstruments['financial-freedom']
  },
  {
    id: 'goal-4',
    name: 'Acil Durum Fonu',
    icon: '🛡️',
    targetAmount: 30000,
    currentAmount: 12000,
    deadline: '2026-12-31',
    category: 'emergency-fund',
    instruments: recommendedInstruments['emergency-fund']
  },
  {
    id: 'goal-5',
    name: 'Erken Emeklilik (FIRE)',
    icon: '🔥',
    targetAmount: 750000,
    currentAmount: 125750,
    deadline: '2032-12-31',
    category: 'early-retirement',
    instruments: recommendedInstruments['early-retirement']
  }
]
