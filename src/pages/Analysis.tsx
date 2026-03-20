import { TrendingUp, Shield, AlertTriangle, Target } from 'lucide-react'

const metrics = [
  { name: 'Toplam Getiri', value: '+18.5%', icon: TrendingUp, color: 'text-green-600' },
  { name: 'Yıllık Getiri', value: '+12.3%', icon: TrendingUp, color: 'text-green-600' },
  { name: 'Sharpe Oranı', value: '1.42', icon: Shield, color: 'text-blue-600' },
  { name: 'Maks. Drawdown', value: '-8.2%', icon: AlertTriangle, color: 'text-red-600' },
]

const allocation = [
  { name: 'Hisse Senetleri', value: 45, color: 'bg-blue-500' },
  { name: 'Kripto', value: 30, color: 'bg-purple-500' },
  { name: 'Nakit', value: 15, color: 'bg-green-500' },
  { name: 'Gayrimenkul', value: 10, color: 'bg-orange-500' },
]

const performance = [
  { period: '1G', value: '+1.2%' },
  { period: '1H', value: '+4.5%' },
  { period: '1A', value: '+12.3%' },
  { period: '1Y', value: '+18.5%' },
  { period: 'Tüm', value: '+45.2%' },
]

export default function Analysis() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Analiz & Performans</h1>
        <p className="text-sm text-gray-500 mt-1">Portföy performans metrikleri</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
              <span className="text-sm text-gray-500">{metric.name}</span>
            </div>
            <p className={`text-2xl font-semibold ${metric.color}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium mb-4">Varlık Dağılımı</h2>
          <div className="space-y-4">
            {allocation.map(item => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium mb-4">Getiri</h2>
          <div className="space-y-3">
            {performance.map(item => (
              <div key={item.period} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-600 dark:text-gray-300">{item.period}</span>
                <span className={`font-medium ${item.value.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium mb-4">Kıyaslama</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Portföy</p>
            <p className="text-xl font-semibold text-green-600">+18.5%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">S&P 500</p>
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">+15.2%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">BIST 100</p>
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-300">+22.1%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
