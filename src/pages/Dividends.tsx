import { useState } from 'react'
import { DollarSign, TrendingUp, Calendar, PieChart, Target, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { 
  createDividendProjection, 
  generateDividendCalendar,
  getTopDividendStocks,
  analyzeDividendDiversity,
  type AssetWithDividend
} from '../utils/dividendCalculator'

interface DividendsProps {
  assets: any[]
}

export default function Dividends({ assets }: DividendsProps) {
  const [projectionYears, setProjectionYears] = useState(10)
  const [dividendGrowthRate, setDividendGrowthRate] = useState(5)
  const [portfolioGrowthRate, setPortfolioGrowthRate] = useState(7)
  const [annualContribution, setAnnualContribution] = useState(5000)

  // Temettü ödeyen varlıkları filtrele
  const dividendAssets: AssetWithDividend[] = assets
    .filter(a => a.dividendPerShare && a.dividendPerShare > 0)
    .map(a => ({
      symbol: a.symbol,
      name: a.name,
      amount: a.amount,
      price: a.price,
      value: a.value,
      dividendPerShare: a.dividendPerShare,
      dividendYield: a.dividendYield,
      paymentFrequency: a.paymentFrequency || 'yearly',
      dividendGrowthRate: 5
    }))

  // Projeksiyon hesapla
  const projection = createDividendProjection(dividendAssets, {
    dividendGrowthRate,
    portfolioGrowthRate,
    annualContribution
  })

  // Takvim oluştur
  const calendar = generateDividendCalendar(dividendAssets)

  // En iyi temettü hisseleri
  const topStocks = getTopDividendStocks(dividendAssets, 5)

  // Çeşitlilik analizi
  const diversity = analyzeDividendDiversity(dividendAssets)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Temettü & Pasif Gelir</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {dividendAssets.length} temettü hissesi • Ortalama getiri: {diversity.averageYield.toFixed(2)}%
        </p>
      </header>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm opacity-90">Aylık Gelir</span>
          </div>
          <p className="text-3xl font-bold">${projection.monthlyIncome.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">Yıllık: ${projection.currentAnnualIncome.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm opacity-90">{projectionYears} Yıl Sonra</span>
          </div>
          <p className="text-3xl font-bold">${projection.projectedIncome[`year${projectionYears}` as keyof typeof projection.projectedIncome].toFixed(0)}</p>
          <p className="text-xs opacity-75 mt-1">Yıllık temettü geliri</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="w-5 h-5" />
            <span className="text-sm opacity-90">DRIP {projectionYears} Yıl</span>
          </div>
          <p className="text-3xl font-bold">${projection.reinvestmentProjection[`year${projectionYears}` as keyof typeof projection.reinvestmentProjection].toFixed(0)}</p>
          <p className="text-xs opacity-75 mt-1">Yeniden yatırım ile</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm opacity-90">FIRE</span>
          </div>
          <p className="text-3xl font-bold">{projection.yearsToFire} yıl</p>
          <p className="text-xs opacity-75 mt-1">Kalan süre</p>
        </div>
      </div>

      {/* Projeksiyon Ayarları */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Projeksiyon Ayarları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Temettü Artış (%)</label>
            <input
              type="number"
              value={dividendGrowthRate}
              onChange={(e) => setDividendGrowthRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Portföy Büyüme (%)</label>
            <input
              type="number"
              value={portfolioGrowthRate}
              onChange={(e) => setPortfolioGrowthRate(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Yıllık Katkı ($)</label>
            <input
              type="number"
              value={annualContribution}
              onChange={(e) => setAnnualContribution(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Projeksiyon (Yıl)</label>
            <select
              value={projectionYears}
              onChange={(e) => setProjectionYears(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              <option value={5}>5 Yıl</option>
              <option value={10}>10 Yıl</option>
              <option value={15}>15 Yıl</option>
              <option value={20}>20 Yıl</option>
              <option value={30}>30 Yıl</option>
            </select>
          </div>
        </div>
      </div>

      {/* Temettü Takvimi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Temettü Takvimi 2026
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {calendar.months.map((month: string, index: number) => {
            const payments = calendar.calendar[index as keyof typeof calendar.calendar]
            const total = payments.reduce((sum, p) => sum + p.amount, 0)
            return (
              <div
                key={month}
                className={`p-3 rounded-lg border ${
                  total > 0
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 mb-1">{month}</p>
                {total > 0 ? (
                  <>
                    <p className="text-lg font-bold text-emerald-600">${total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{payments.length} ödeme</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400">-</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* En İyi Temettü Hisseleri */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          En Yüksek Temettü Getirisi
        </h3>
        <div className="space-y-3">
          {topStocks.map((stock, index) => (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium">{stock.symbol}</p>
                  <p className="text-xs text-gray-500">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{stock.dividendYield.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">${stock.dividendPerShare.toFixed(3)}/hisse</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Çeşitlilik Analizi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Ödeme Sıklığı</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Aylık</span>
              <span className="font-medium">{diversity.paymentFrequencyBreakdown.monthly} hisse</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">3 Aylık</span>
              <span className="font-medium">{diversity.paymentFrequencyBreakdown.quarterly} hisse</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Yıllık</span>
              <span className="font-medium">{diversity.paymentFrequencyBreakdown.yearly} hisse</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Portföy Dağılımı</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Temettü Hisseleri</span>
              <span className="font-medium">{diversity.percentageOfPortfolio.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Toplam Hisse</span>
              <span className="font-medium">{diversity.totalDividendStocks} adet</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ortalama Getiri</span>
              <span className="font-medium text-emerald-600">{diversity.averageYield.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* DRIP Projeksiyon Tablosu */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">DRIP (Yeniden Yatırım) Projeksionu</h3>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Yıl</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Portföy Değeri</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Yıllık Temettü</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Aylık Gelir</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 font-medium">Şimdi</td>
              <td className="px-4 py-3 text-right">${assets.reduce((sum, a) => sum + a.value, 0).toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-emerald-600">${projection.currentAnnualIncome.toFixed(0)}</td>
              <td className="px-4 py-3 text-right text-emerald-600">${projection.monthlyIncome.toFixed(0)}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 font-medium">5 Yıl</td>
              <td className="px-4 py-3 text-right">${projection.reinvestmentProjection.year5.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-emerald-600">${projection.projectedIncome.year5.toFixed(0)}</td>
              <td className="px-4 py-3 text-right text-emerald-600">${(projection.projectedIncome.year5 / 12).toFixed(0)}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 font-medium">10 Yıl</td>
              <td className="px-4 py-3 text-right">${projection.reinvestmentProjection.year10.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-emerald-600">${projection.projectedIncome.year10.toFixed(0)}</td>
              <td className="px-4 py-3 text-right text-emerald-600">${(projection.projectedIncome.year10 / 12).toFixed(0)}</td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-4 py-3 font-medium">20 Yıl</td>
              <td className="px-4 py-3 text-right">${projection.reinvestmentProjection.year20.toLocaleString()}</td>
              <td className="px-4 py-3 text-right text-emerald-600">-</td>
              <td className="px-4 py-3 text-right text-emerald-600">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
