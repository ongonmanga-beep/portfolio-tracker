import { useState } from 'react'
import { Plus, Search, ArrowUpRight, ArrowDownRight, Download } from 'lucide-react'

const sampleTransactions = [
  { id: 1, type: 'buy', asset: 'AAPL', name: 'Apple Inc.', amount: 10, price: 175.50, total: 1755, date: '2026-03-18' },
  { id: 2, type: 'sell', asset: 'TSLA', name: 'Tesla', amount: 5, price: 245.00, total: 1225, date: '2026-03-17' },
  { id: 3, type: 'dividend', asset: 'AAPL', name: 'Temettü', amount: 0, price: 0, total: 24.50, date: '2026-03-15' },
  { id: 4, type: 'buy', asset: 'BTC', name: 'Bitcoin', amount: 0.5, price: 68000, total: 34000, date: '2026-03-14' },
  { id: 5, type: 'buy', asset: 'ETH', name: 'Ethereum', amount: 8, price: 3500, total: 28000, date: '2026-03-12' },
  { id: 6, type: 'sell', asset: 'NVDA', name: 'NVIDIA', amount: 3, price: 890, total: 2670, date: '2026-03-10' },
  { id: 7, type: 'dividend', asset: 'TSLA', name: 'Temettü', amount: 0, price: 0, total: 12.00, date: '2026-03-08' },
  { id: 8, type: 'buy', asset: 'USD', name: 'USD Alım', amount: 5000, price: 32.50, total: 162500, date: '2026-03-05' },
]

const typeConfig = {
  buy: { icon: ArrowDownRight, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' },
  sell: { icon: ArrowUpRight, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' },
  dividend: { icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' },
}

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const filteredTransactions = sampleTransactions.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tx.asset.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || tx.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">İşlemler</h1>
        <p className="text-sm text-gray-500 mt-1">Alım, satım ve gelir geçmişi</p>
      </header>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tümü</option>
          <option value="buy">Alım</option>
          <option value="sell">Satım</option>
          <option value="dividend">Temettü</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          <span>Ekle</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tür</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varlık</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miktar</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toplam</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map(tx => {
              const TypeIcon = typeConfig[tx.type].icon
              return (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeConfig[tx.type].bg} ${typeConfig[tx.type].color}`}>
                      <TypeIcon className="w-3 h-3" />
                      {tx.type === 'buy' ? 'Alım' : tx.type === 'sell' ? 'Satım' : 'Temettü'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{tx.name}</p>
                      <p className="text-sm text-gray-500">{tx.asset}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {tx.amount > 0 ? tx.amount.toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {tx.price > 0 ? `$${tx.price.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    ${tx.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{tx.date}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
