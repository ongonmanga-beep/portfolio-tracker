import { useState } from 'react'
import { Plus, Target, TrendingUp, Calendar, DollarSign, PieChart } from 'lucide-react'
import { financialCategories, sampleGoals } from '../data/financialGoals'
import type { GoalInstrument } from '../data/financialGoals'

interface GoalsProps {
  assets: any[]
}

export default function Goals({ assets }: GoalsProps) {
  // TEK VERİ KAYNAĞI: Assets'tan hedefleri hesapla
  const [goals, setGoals] = useState(() => {
    // Mevcut portföy değerini hedef olarak kullan
    const totalValue = assets.reduce((sum, a) => sum + (a.value || 0), 0)
    
    return sampleGoals.map(goal => ({
      ...goal,
      currentAmount: goal.category === 'financial-freedom' ? totalValue : goal.currentAmount
    }))
  })
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const getCategoryInfo = (categoryId: string) => {
    return financialCategories.find(c => c.id === categoryId) || { name: categoryId, icon: '📊', color: '#6366f1' }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Finansal Hedefler</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">10 kategoride hedeflerini yönet</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          <span>Yeni Hedef</span>
        </button>
      </header>

      {/* Kategori Özeti - Minimal */}
      <div className="flex flex-wrap gap-2">
        {financialCategories.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* Hedefler Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map(goal => {
          const category = getCategoryInfo(goal.category)
          const progress = getProgress(goal.currentAmount, goal.targetAmount)
          
          return (
            <div
              key={goal.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                    <h3 className="font-medium">{goal.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{category.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">{progress.toFixed(0)}%</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Hedef: ${goal.targetAmount.toLocaleString()}</span>
                  <span className="text-gray-500">Mevcut: ${goal.currentAmount.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: category.color }}
                  />
                </div>
              </div>

              {/* Yatırım Araçları */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                  <PieChart className="w-3 h-3" />
                  Dağılım ({goal.instruments.length} araç)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {goal.instruments.slice(0, 5).map(inst => (
                    <span
                      key={inst.id}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                    >
                      {inst.symbol} {inst.allocation}%
                    </span>
                  ))}
                  {goal.instruments.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      +{goal.instruments.length - 5} daha
                    </span>
                  )}
                </div>
              </div>

              {/* Son Tarih */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>Son Tarih: {new Date(goal.deadline).toLocaleDateString('tr-TR')}</span>
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                  Düzenle
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                  Detay
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Toplam İstatistikler - Minimal */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-1">Hedef</p>
          <p className="text-lg font-semibold">${(goals.reduce((sum, g) => sum + g.targetAmount, 0) / 1000000).toFixed(1)}M</p>
        </div>

        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-1">Birikim</p>
          <p className="text-lg font-semibold">${(goals.reduce((sum, g) => sum + g.currentAmount, 0) / 1000).toFixed(0)}K</p>
        </div>

        <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-1">İlerleme</p>
          <p className="text-lg font-semibold">{(goals.reduce((sum, g) => sum + getProgress(g.currentAmount, g.targetAmount), 0) / goals.length).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  )
}
