import { TrendingUp, Shield, AlertTriangle, Target } from 'lucide-react'

interface AnalysisProps {
  assets: any[]
}

export default function Analysis({ assets }: AnalysisProps) {
  // TEK VERİ KAYNAĞI: Assets'tan hesapla
  const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0)
  const totalCost = assets.reduce((sum, a) => sum + (a.costBasis || a.value || 0), 0)
  const totalReturn = totalValue - totalCost
  const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

  // Kategori bazlı dağılım
  const categoryAllocation = assets.reduce((acc: any, a: any) => {
    acc[a.category] = (acc[a.category] || 0) + (a.value || 0)
    return acc
  }, {})

  const allocation = Object.entries(categoryAllocation).map(([key, value]: any) => ({
    name: key.toUpperCase(),
    value: ((value / totalValue) * 100).toFixed(1),
    color: getColorForKey(key)
  }))

  // Kâr/Zarar dağılımı
  const profitable = assets.filter(a => (a.value || 0) >= (a.costBasis || a.value || 0))
  const losing = assets.filter(a => (a.value || 0) < (a.costBasis || a.value || 0))

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Analiz & Performans</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {assets.length} varlık • Toplam: ${totalValue.toLocaleString()}
        </p>
      </header>

      {/* Metrikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          name="Toplam Getiri"
          value={`${totalReturn >= 0 ? '+' : ''}${totalReturnPercent.toFixed(2)}%`}
          icon={TrendingUp}
          positive={totalReturn >= 0}
        />
        <MetricCard
          name="Kâr Eden"
          value={profitable.length.toString()}
          icon={Shield}
          positive={true}
        />
        <MetricCard
          name="Zarar Eden"
          value={losing.length.toString()}
          icon={AlertTriangle}
          positive={losing.length === 0}
        />
        <MetricCard
          name="Varlık Sayısı"
          value={assets.length.toString()}
          icon={Target}
          positive={true}
        />
      </div>

      {/* Dağılım */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Kategori Dağılımı</h3>
          <div className="space-y-3">
            {allocation.map((item: any) => (
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

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Kâr/Zarar Dağılımı</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Kâr Eden</span>
                <span className="text-sm font-medium text-green-600">{profitable.length} varlık</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${assets.length > 0 ? (profitable.length / assets.length) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-300">Zarar Eden</span>
                <span className="text-sm font-medium text-red-600">{losing.length} varlık</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${assets.length > 0 ? (losing.length / assets.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ name, value, icon: Icon, positive }: { name: string, value: string, icon: any, positive: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${positive ? 'text-green-600' : 'text-red-600'}`} />
        <span className="text-sm text-gray-500 dark:text-gray-400">{name}</span>
      </div>
      <p className={`text-2xl font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>{value}</p>
    </div>
  )
}

function getColorForKey(key: string): string {
  const colors: Record<string, string> = {
    stocks: 'bg-blue-500',
    crypto: 'bg-purple-500',
    realestate: 'bg-orange-500',
    cash: 'bg-green-500',
    etf: 'bg-cyan-500',
    emk: 'bg-indigo-500',
    yat: 'bg-pink-500',
    byf: 'bg-teal-500'
  }
  return colors[key] || 'bg-gray-500'
}
