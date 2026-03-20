import { useState } from 'react'
import { User, Key, Shield, Database, Moon, Eye, EyeOff, Save } from 'lucide-react'

const apiKeysList = [
  { id: 'yahoo', name: 'Yahoo Finance', desc: 'Hisse senedi verileri' },
  { id: 'alphavantage', name: 'Alpha Vantage', desc: 'Finansal API' },
  { id: 'binance', name: 'Binance', desc: 'Kripto borsa' },
  { id: 'coingecko', name: 'CoinGecko', desc: 'Kripto fiyatlar' },
  { id: 'coinbase', name: 'Coinbase', desc: 'Kripto borsa' },
]

const settingsSections = [
  {
    title: 'Hesap',
    icon: User,
    items: [
      { name: 'Profil Bilgileri', desc: 'Ad, e-posta, şifre' },
      { name: 'Para Birimi', desc: 'TL, USD, EUR', value: 'USD' },
      { name: 'Dil', desc: 'Uygulama dili', value: 'Türkçe' },
    ]
  },
  {
    title: 'Güvenlik',
    icon: Shield,
    items: [
      { name: 'İki Faktörlü Doğrulama', desc: '2FA', value: 'Açık' },
      { name: 'Oturum Yönetimi', desc: 'Aktif oturumlar' },
      { name: 'Giriş Geçmişi', desc: 'Son girişler' },
    ]
  },
  {
    title: 'Veri',
    icon: Database,
    items: [
      { name: 'Verileri Yedekle', desc: 'JSON export' },
      { name: 'Yedek Geri Yükle', desc: 'Import' },
      { name: 'Tüm Verileri Sil', desc: 'Kalıcı silme', danger: true },
    ]
  },
  {
    title: 'Görünüm',
    icon: Moon,
    items: [
      { name: 'Tema', desc: 'Açık / Koyu', value: 'Otomatik' },
    ]
  },
]

export default function Settings() {
  const [keys, setKeys] = useState<Record<string, string>>({})
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const updateKey = (id: string, value: string) => {
    setKeys(prev => ({ ...prev, [id]: value }))
  }

  const saveKeys = () => {
    console.log('Saving API keys:', keys)
    alert('API anahtarları kaydedildi')
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">Uygulama ayarlarını yönet</p>
      </header>

      {/* API Keys Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Key className="w-5 h-5 text-gray-400" />
          <h2 className="font-medium">API Anahtarları</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {apiKeysList.map(api => (
              <div key={api.id}>
                <label className="block text-sm font-medium mb-1">
                  {api.name}
                </label>
                <div className="relative">
                  <input
                    type={visibleKeys[api.id] ? 'text' : 'password'}
                    value={keys[api.id] || ''}
                    onChange={(e) => updateKey(api.id, e.target.value)}
                    placeholder={`${api.name} API anahtarı`}
                    className="w-full pr-20 pl-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      onClick={() => toggleVisibility(api.id)}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                      {visibleKeys[api.id] ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{api.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={saveKeys}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Save className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="space-y-6">
        {settingsSections.map(section => (
          <div key={section.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <section.icon className="w-5 h-5 text-gray-400" />
              <h2 className="font-medium">{section.title}</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {section.items.map((item: any) => (
                <div 
                  key={item.name} 
                  className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer ${
                    item.danger ? 'text-red-600' : ''
                  }`}
                >
                  <div>
                    <p className={`font-medium ${item.danger ? 'text-red-600' : ''}`}>{item.name}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  {item.value && (
                    <span className="text-gray-600 dark:text-gray-300">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
