// Temettü ve Pasif Gelir Hesaplama Araçları

export interface DividendProjection {
  currentAnnualIncome: number
  projectedIncome: {
    year1: number
    year3: number
    year5: number
    year10: number
  }
  monthlyIncome: number
  dailyIncome: number
  reinvestmentProjection: {
    year5: number
    year10: number
    year20: number
  }
  fireNumber: number // 4% kuralına göre gereken toplam
  yearsToFire: number
}

export interface AssetWithDividend {
  symbol: string
  name: string
  amount: number
  price: number
  value: number
  dividendPerShare: number
  dividendYield: number
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly'
  dividendGrowthRate?: number // Yıllık temettü artış oranı
}

// Yıllık temettü gelirini hesapla
export const calculateAnnualDividend = (asset: AssetWithDividend): number => {
  const freqMultiplier = 
    asset.paymentFrequency === 'monthly' ? 12 :
    asset.paymentFrequency === 'quarterly' ? 4 : 1
  return asset.dividendPerShare * asset.amount * freqMultiplier
}

// Toplam yıllık temettü geliri
export const calculateTotalAnnualDividend = (assets: AssetWithDividend[]): number => {
  return assets
    .filter(a => a.dividendPerShare > 0)
    .reduce((sum, asset) => sum + calculateAnnualDividend(asset), 0)
}

// Ortalama temettü getirisi (ağırlıklı)
export const calculateWeightedAverageYield = (assets: AssetWithDividend[]): number => {
  const dividendAssets = assets.filter(a => a.dividendPerShare > 0)
  if (dividendAssets.length === 0) return 0
  
  const totalValue = dividendAssets.reduce((sum, a) => sum + a.value, 0)
  if (totalValue === 0) return 0
  
  const weightedSum = dividendAssets.reduce((sum, a) => {
    return sum + (a.dividendYield * a.value)
  }, 0)
  
  return weightedSum / totalValue
}

// Temettü projeksiyonu (yıllık artış ile)
export const projectDividendGrowth = (
  currentIncome: number,
  growthRate: number, // % olarak (örn: 5 = %5)
  years: number
): number => {
  return currentIncome * Math.pow(1 + growthRate / 100, years)
}

// DRIP (Dividend Reinvestment Plan) projeksiyonu
export const projectWithDRIP = (
  currentPortfolio: number,
  annualDividend: number,
  annualContribution: number,
  growthRate: number,
  dividendYield: number,
  years: number
): number => {
  let portfolio = currentPortfolio
  let yearlyDividend = annualDividend
  
  for (let year = 0; year < years; year++) {
    // Yıllık katkı
    portfolio += annualContribution
    
    // Temettü gelirini yeniden yatır
    portfolio += yearlyDividend
    
    // Portföy büyümesi
    portfolio *= (1 + growthRate / 100)
    
    // Yeni temettü geliri (artan portföy ile)
    yearlyDividend = portfolio * (dividendYield / 100)
  }
  
  return portfolio
}

// FIRE sayısı (4% kuralı)
export const calculateFIRENumber = (annualExpenses: number): number => {
  return annualExpenses * 25 // Yıllık gider × 25
}

// FIRE'a kaç yıl kaldı
export const calculateYearsToFire = (
  currentPortfolio: number,
  annualContribution: number,
  annualDividend: number,
  growthRate: number,
  fireNumber: number
): number => {
  let portfolio = currentPortfolio
  let years = 0
  
  while (portfolio < fireNumber && years < 50) {
    portfolio += annualContribution + annualDividend
    portfolio *= (1 + growthRate / 100)
    years++
  }
  
  return years
}

// Kapsamlı projeksiyon
export const createDividendProjection = (
  assets: AssetWithDividend[],
  options: {
    dividendGrowthRate?: number
    portfolioGrowthRate?: number
    annualContribution?: number
    annualExpenses?: number
  } = {}
): DividendProjection => {
  const {
    dividendGrowthRate = 5,
    portfolioGrowthRate = 7,
    annualContribution = 0,
    annualExpenses = 0
  } = options
  
  const currentAnnualIncome = calculateTotalAnnualDividend(assets)
  const currentPortfolio = assets.reduce((sum, a) => sum + a.value, 0)
  const avgYield = calculateWeightedAverageYield(assets)
  
  // Projeksiyonlar
  const year1Income = projectDividendGrowth(currentAnnualIncome, dividendGrowthRate, 1)
  const year3Income = projectDividendGrowth(currentAnnualIncome, dividendGrowthRate, 3)
  const year5Income = projectDividendGrowth(currentAnnualIncome, dividendGrowthRate, 5)
  const year10Income = projectDividendGrowth(currentAnnualIncome, dividendGrowthRate, 10)
  
  // DRIP ile portföy projeksiyonu
  const year5Portfolio = projectWithDRIP(
    currentPortfolio,
    currentAnnualIncome,
    annualContribution,
    portfolioGrowthRate,
    avgYield,
    5
  )
  
  const year10Portfolio = projectWithDRIP(
    currentPortfolio,
    currentAnnualIncome,
    annualContribution,
    portfolioGrowthRate,
    avgYield,
    10
  )
  
  const year20Portfolio = projectWithDRIP(
    currentPortfolio,
    currentAnnualIncome,
    annualContribution,
    portfolioGrowthRate,
    avgYield,
    20
  )
  
  // FIRE hesaplamaları
  const fireNumber = annualExpenses > 0 ? calculateFIRENumber(annualExpenses) : currentPortfolio * 25
  const yearsToFire = calculateYearsToFire(
    currentPortfolio,
    annualContribution,
    currentAnnualIncome,
    portfolioGrowthRate,
    fireNumber
  )
  
  return {
    currentAnnualIncome,
    projectedIncome: {
      year1: year1Income,
      year3: year3Income,
      year5: year5Income,
      year10: year10Income
    },
    monthlyIncome: currentAnnualIncome / 12,
    dailyIncome: currentAnnualIncome / 365,
    reinvestmentProjection: {
      year5: year5Portfolio,
      year10: year10Portfolio,
      year20: year20Portfolio
    },
    fireNumber,
    yearsToFire
  }
}

// Temettü takvimi (hangi ayda ödeme)
export const generateDividendCalendar = (assets: AssetWithDividend[]) => {
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const calendar: Record<number, { symbol: string, amount: number }[]> = {
    0: [], 1: [], 2: [], 3: [], 4: [], 5: [],
    6: [], 7: [], 8: [], 9: [], 10: [], 11: []
  }
  
  assets.filter(a => a.dividendPerShare > 0).forEach(asset => {
    const annualDividend = calculateAnnualDividend(asset)
    const paymentCount = asset.paymentFrequency === 'monthly' ? 12 : asset.paymentFrequency === 'quarterly' ? 4 : 1
    
    // Basit dağılım (gerçek ödeme ayları için API'den veri çekilmeli)
    for (let i = 0; i < paymentCount; i++) {
      const month = asset.paymentFrequency === 'quarterly' 
        ? i * 3 // Mar, Jun, Sep, Dec
        : asset.paymentFrequency === 'monthly'
        ? i
        : 2 // June (yıllık için)
      
      if (month < 12) {
        calendar[month].push({
          symbol: asset.symbol,
          amount: annualDividend / paymentCount
        })
      }
    }
  })
  
  return { months, calendar }
}

// En iyi temettü hisseleri (getiriye göre sırala)
export const getTopDividendStocks = (assets: AssetWithDividend[], limit: number = 5) => {
  return assets
    .filter(a => a.dividendPerShare > 0)
    .sort((a, b) => b.dividendYield - a.dividendYield)
    .slice(0, limit)
}

// Temettü çeşitliliği analizi
export const analyzeDividendDiversity = (assets: AssetWithDividend[]) => {
  const dividendAssets = assets.filter(a => a.dividendPerShare > 0)
  
  return {
    totalDividendStocks: dividendAssets.length,
    percentageOfPortfolio: (dividendAssets.reduce((sum, a) => sum + a.value, 0) / assets.reduce((sum, a) => sum + a.value, 0)) * 100,
    averageYield: calculateWeightedAverageYield(assets),
    paymentFrequencyBreakdown: {
      monthly: dividendAssets.filter(a => a.paymentFrequency === 'monthly').length,
      quarterly: dividendAssets.filter(a => a.paymentFrequency === 'quarterly').length,
      yearly: dividendAssets.filter(a => a.paymentFrequency === 'yearly').length
    }
  }
}
