import { Target, Plus, TrendingUp } from 'lucide-react'

const goals = [
  { id: 1, name: 'Emeklilik', target: 500000, current: 125750, deadline: '2045', icon: '🏖️' },
  { id: 2, name: 'Ev Alma', target: 150000, current: 45000, deadline: '2028', icon: '🏠' },
  { id: 3, name: 'Araba', target: 35000, current: 18500, deadline: '2027', icon: '🚗' },
  { id: 4, name: 'Acil Fon', target: 20000, current: 12000, deadline: '2026', icon: '💰' },
]

export default function Goals() {
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hedefler</h1>
          <p className="text-sm text-gray-500 mt-1">Finansal hedeflerinizi takip edin</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Yeni Hedef</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100
          return (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{goal.name}</h3>
                  <p className="text-sm text-gray-500">Hedef: {goal.deadline}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">İlerleme</span>
                  <span className="text-sm font-medium">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mevcut</p>
                  <p className="font-semibold">${goal.current.toLocaleString()}</p>
                </div>
                <Target className="w-5 h-5 text-gray-400" />
                <div className="text-right">
                  <p className="text-sm text-gray-500">Hedef</p>
                  <p className="font-semibold">${goal.target.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span>Aylık: $2,500 eklendi</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
