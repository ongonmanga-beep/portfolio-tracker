import { Download, FileText, Calendar, TrendingUp } from 'lucide-react'

const reports = [
  { id: 1, name: 'Aylık Özet', period: 'Mart 2026', type: 'monthly', icon: FileText },
  { id: 2, name: 'Yıllık Rapor', period: '2025', type: 'yearly', icon: FileText },
  { id: 3, name: 'Varlık Dağılımı', period: 'Güncel', type: 'allocation', icon: TrendingUp },
  { id: 4, name: 'İşlem Geçmişi', period: 'Son 90 gün', type: 'transactions', icon: Calendar },
  { id: 5, name: 'Performans Raporu', period: 'YTD', type: 'performance', icon: TrendingUp },
  { id: 6, name: 'Vergi Özeti', period: '2025', type: 'tax', icon: FileText },
]

export default function Reports() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Raporlar</h1>
        <p className="text-sm text-gray-500 mt-1">Portföy raporlarını indirin</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(report => (
          <div 
            key={report.id} 
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-sm transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <report.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <Download className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <h3 className="font-medium text-lg mb-1">{report.name}</h3>
            <p className="text-sm text-gray-500">{report.period}</p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                PDF
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Export */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium mb-4">Hızlı Export</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Tüm Verileri İndir</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Tarih Aralığı</span>
          </button>
        </div>
      </div>
    </div>
  )
}
