import { Bell, Plus, BellOff } from 'lucide-react'

const alerts = [
  { id: 1, asset: 'BTC', name: 'Bitcoin', type: 'price_above', value: 75000, active: true },
  { id: 2, asset: 'AAPL', name: 'Apple', type: 'price_below', value: 165, active: true },
  { id: 3, asset: 'ETH', name: 'Ethereum', type: 'change_percent', value: 5, active: true },
  { id: 4, asset: 'TSLA', name: 'Tesla', type: 'price_above', value: 300, active: false },
]

const typeLabels = {
  price_above: 'Fiyat >',
  price_below: 'Fiyat <',
  change_percent: 'Değişim %',
}

export default function Alerts() {
  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Alarmlar</h1>
          <p className="text-sm text-gray-500 mt-1">Fiyat ve değişim bildirimleri</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Yeni Alarm</span>
        </button>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varlık</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Koşul</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Değer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {alerts.map(alert => (
              <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{alert.name}</p>
                    <p className="text-sm text-gray-500">{alert.asset}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-600 dark:text-gray-300">
                    {typeLabels[alert.type as keyof typeof typeLabels]}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  ${alert.value.toLocaleString()}
                  {alert.type === 'change_percent' && '%'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    alert.active 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {alert.active ? <Bell className="w-3 h-3" /> : <BellOff className="w-3 h-3" />}
                    {alert.active ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
