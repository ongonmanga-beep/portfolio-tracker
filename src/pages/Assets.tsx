import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Upload, X, CheckCircle, AlertCircle, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'

const assetCategories = [
  { id: 'all', name: 'Tümü' },
  { id: 'stocks', name: 'Hisse' },
  { id: 'crypto', name: 'Kripto' },
  { id: 'realestate', name: 'Gayrimenkul' },
  { id: 'cash', name: 'Nakit' },
  { id: 'etf', name: 'ETF/Fon' },
]

// USD/TRY kuru (güncel kur ~35.5)
const USD_TRY_RATE = 35.5

const sampleAssets = [
  { 
    id: 1, 
    symbol: 'AVR', 
    name: 'AGESA Teknoloji Sektörü Fonu', 
    category: 'emk', 
    amount: 1000,
    price: 0.010577, // 0.375507 TRY / 35.5
    value: 10.58, // 1000 * 0.010577 USD
    costBasis: 9.86, // 350 TRY / 35.5
    change: 7.3 
  },
]

interface ImportResult {
  success: boolean
  count?: number
  error?: string
  assets?: any[]
}

// localStorage key
const STORAGE_KEY = 'portfolio_assets_v1'

// LocalStorage'dan yükle
const loadAssets = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (err) {
    console.error('Failed to load assets from localStorage:', err)
  }
  return []
}

// LocalStorage'a kaydet
const saveAssets = (assets: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  } catch (err) {
    console.error('Failed to save assets to localStorage:', err)
  }
}

export default function Assets() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [assets, setAssets] = useState(() => loadAssets())
  const [editingAsset, setEditingAsset] = useState<any | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Assets değiştiğinde kaydet
  const updateAssets = (newAssets: any[]) => {
    setAssets(newAssets)
    saveAssets(newAssets)
  }

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleDelete = (id: number) => {
    updateAssets(assets.filter(a => a.id !== id))
    setDeleteConfirm(null)
  }

  const handleSaveEdit = (updatedAsset: any) => {
    updateAssets(assets.map(a => a.id === updatedAsset.id ? updatedAsset : a))
    setEditingAsset(null)
  }

  const handleAdd = (newAsset: any) => {
    updateAssets([...assets, newAsset])
    setShowAddModal(false)
  }

  const parseCSV = (content: string): ImportResult => {
    try {
      const lines = content.trim().split('\n')
      if (lines.length < 2) {
        return { success: false, error: 'CSV dosyası boş veya geçersiz' }
      }

      // Header satırını parse et (tırnak işareti ile böl)
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
      
      // Farklı formatları destekle
      const symbolIdx = headers.findIndex(h => ['holding', 'symbol', 'ticker'].includes(h))
      const nameIdx = headers.findIndex(h => ['holdings\' name', 'name', 'company'].includes(h))
      const valueIdx = headers.findIndex(h => ['current value', 'value', 'market value'].includes(h))
      const sharesIdx = headers.findIndex(h => ['shares', 'quantity', 'amount', 'units'].includes(h))
      const costBasisIdx = headers.findIndex(h => ['cost basis', 'avg cost', 'purchase price', 'buy price'].includes(h))
      const sectorIdx = headers.findIndex(h => ['sector', 'category', 'asset type'].includes(h))
      
      if (symbolIdx === -1 || nameIdx === -1 || valueIdx === -1) {
        return { 
          success: false, 
          error: 'Gerekli kolonlar bulunamadı: Holding/Symbol, Name, Current Value' 
        }
      }

      const assets: any[] = []
      for (let i = 1; i < lines.length; i++) {
        // Tırnak işaretleri içindeki virgülleri koruyarak böl
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || []
        if (values.length > symbolIdx && values[symbolIdx]) {
          const symbol = values[symbolIdx] || ''
          const name = values[nameIdx] || ''
          const value = parseFloat(values[valueIdx]?.replace(/,/g, '') || '0')
          const shares = sharesIdx !== -1 ? parseFloat(values[sharesIdx]?.replace(/,/g, '') || '0') : 0
          const costBasis = costBasisIdx !== -1 ? parseFloat(values[costBasisIdx]?.replace(/,/g, '') || '0') : 0
          const sector = sectorIdx !== -1 ? values[sectorIdx] : 'stocks'
          
          // Hisse başına fiyat hesapla (eğer cost basis yoksa value/shares)
          const pricePerShare = shares > 0 ? (costBasis > 0 ? costBasis : value / shares) : 0
          
          // Sektörü kategoriye çevir
          let category = 'stocks'
          if (sector.toLowerCase().includes('fund') || sector.toLowerCase().includes('etf')) category = 'etf'
          else if (sector.toLowerCase().includes('crypto')) category = 'crypto'
          else if (sector.toLowerCase().includes('real estate')) category = 'realestate'
          else if (sector.toLowerCase().includes('cash')) category = 'cash'
          
          const calculatedCostBasis = costBasis || (shares > 0 ? shares * pricePerShare : value)
          const profitLoss = value - calculatedCostBasis
          const changePercent = calculatedCostBasis > 0 ? (profitLoss / calculatedCostBasis) * 100 : 0
          
          assets.push({
            id: Date.now() + i,
            symbol: symbol.toUpperCase(),
            name,
            value,
            amount: shares,
            price: pricePerShare,
            costBasis: calculatedCostBasis,
            category,
            change: parseFloat(changePercent.toFixed(2))
          })
        }
      }

      return { success: true, count: assets.length, assets }
    } catch (err) {
      return { success: false, error: 'CSV parse hatası: ' + (err as Error).message }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setImportResult({ success: false, error: 'Sadece CSV dosyası yüklenebilir' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const result = parseCSV(content)
      setImportResult(result)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const result = parseCSV(content)
        setImportResult(result)
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Varlıklar</h1>
          <p className="text-xs text-gray-500">{assets.length} adet</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              if (confirm('Tüm varlıklar silinecek. Emin misiniz?')) {
                updateAssets([])
              }
            }}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs"
          >
            Sıfırla
          </button>
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ekle</span>
          </button>
        </div>
      </header>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {assetCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition text-xs ${
              activeCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredAssets.length > 0 && (
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100 dark:border-gray-700">
            İlk varlık: {filteredAssets[0].symbol} | Değer: ${filteredAssets[0].value} | Maliyet: ${filteredAssets[0].costBasis} | K/Z: ${(filteredAssets[0].value - (filteredAssets[0].costBasis || 0)).toFixed(0)} | %: {filteredAssets[0].change}%
          </div>
        )}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Varlık</th>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Kategori</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Miktar</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Maliyet</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Değer</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Kâr/Zarar</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">±%</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredAssets.map(asset => (
              <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <td className="px-3 py-2.5">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{asset.symbol}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{asset.name}</p>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {asset.category}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-400">
                  {asset.amount ? asset.amount.toLocaleString() : '-'}
                </td>
                <td className="px-3 py-2.5 text-right text-gray-500">
                  ${asset.price ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                </td>
                <td className="px-3 py-2.5 text-right font-medium text-gray-900 dark:text-gray-100">
                  ${asset.value.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {(() => {
                    const costBasis = asset.costBasis || (asset.amount && asset.price ? asset.amount * asset.price : asset.value)
                    const profitLoss = (asset.value || 0) - (costBasis || 0)
                    const isPositive = profitLoss >= 0
                    return (
                      <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}${Math.abs(profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    )
                  })()}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`inline-flex items-center gap-1 ${asset.change >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {asset.change >= 0 ? '+' : ''}{asset.change}%
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {deleteConfirm === asset.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                          title="Onayla"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition"
                          title="İptal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingAsset(asset)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition text-gray-500 dark:text-gray-400"
                          title="Düzenle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(asset.id)}
                          className="p-1 hover:bg-red-100 rounded transition text-gray-500 hover:text-red-600"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingAsset && (
        <EditModal asset={editingAsset} onSave={handleSaveEdit} onCancel={() => setEditingAsset(null)} />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddAssetModal onSave={handleAdd} onCancel={() => setShowAddModal(false)} />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">CSV İçe Aktar</h3>
              <button 
                onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Dosyayı buraya sürükleyin veya tıklayın
              </p>
              <p className="text-xs text-gray-500">
                Desteklenen formatlar: Holding/Name/Current Value veya Symbol/Name/Value
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importResult && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                importResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <p className="text-sm">
                  {importResult.success 
                    ? `${importResult.count} varlık başarıyla parse edildi` 
                    : importResult.error}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                İptal
              </button>
              <button 
                disabled={!importResult?.success}
                onClick={() => {
                  if (importResult?.assets) {
                    const newAssets = importResult.assets!
                    let updated = 0
                    let added = 0
                    
                    // Mevcut varlıkları güncelle veya ekle
                    const merged = assets.map(existing => {
                      const incoming = newAssets.find(n => n.symbol === existing.symbol)
                      if (incoming) {
                        updated++
                        return { ...existing, ...incoming }
                      }
                      return existing
                    })
                    
                    // Yeni varlıkları ekle
                    newAssets.forEach(incoming => {
                      if (!assets.find(e => e.symbol === incoming.symbol)) {
                        merged.push(incoming)
                        added++
                      }
                    })
                    
                    updateAssets(merged)
                    alert(`${added} yeni eklendi, ${updated} güncellendi!`)
                    setShowImportModal(false)
                    setImportResult(null)
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                İçe Aktar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function EditModal({ asset, onSave, onCancel }: { asset: any, onSave: (a: any) => void, onCancel: () => void }) {
  const [form, setForm] = useState({ ...asset })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount) || 0
    const price = parseFloat(form.price) || 0
    const costBasis = parseFloat(form.costBasis) || amount * price
    onSave({ 
      ...form, 
      amount,
      price,
      costBasis,
      value: parseFloat(form.value), 
      change: parseFloat(form.change) 
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-5 shadow-xl">
        <h3 className="text-base font-semibold mb-4">Varlık Düzenle</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sembol</label>
              <input
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">İsim</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Miktar</label>
              <input
                type="number"
                step="0.0001"
                value={form.amount || ''}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fiyat ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Maliyet ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.costBasis || ''}
                onChange={(e) => setForm({ ...form, costBasis: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değer ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değişim (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.change}
                onChange={(e) => setForm({ ...form, change: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değişim (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.change}
                onChange={(e) => setForm({ ...form, change: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stocks">Hisse</option>
                <option value="crypto">Kripto</option>
                <option value="realestate">Gayrimenkul</option>
                <option value="cash">Nakit</option>
                <option value="etf">ETF/Fon</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
              İptal
            </button>
            <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddAssetModal({ onSave, onCancel }: { onSave: (asset: any) => void, onCancel: () => void }) {
  const [form, setForm] = useState({
    symbol: '',
    name: '',
    amount: '',
    price: '',
    value: '',
    change: '0',
    category: 'emk'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // USD/TRY kuru (güncel kur ~35.5)
  const USD_TRY_RATE = 35.5

  // Bilinen fonlar için otomatik doldurma (TRY cinsinden)
  const knownFunds: Record<string, { name: string, priceTRY: number, category: string }> = {
    'AVR': { name: 'AGESA Teknoloji Sektörü Fonu', priceTRY: 0.375507, category: 'emk' },
  }

  // Sembol değişince bilinen fonları kontrol et
  useEffect(() => {
    if (form.symbol.length >= 3) {
      const known = knownFunds[form.symbol.toUpperCase()]
      if (known) {
        // TRY'den USD'ye çevir
        const priceUSD = known.priceTRY / USD_TRY_RATE
        setForm(prev => ({
          ...prev,
          name: known.name,
          price: priceUSD.toFixed(6),
          category: known.category
        }))
      }
    }
  }, [form.symbol])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount) || 0
    const price = parseFloat(form.price) || 0
    const value = parseFloat(form.value) || (amount * price)
    
    onSave({
      id: Date.now(),
      symbol: form.symbol.toUpperCase(),
      name: form.name,
      amount,
      price,
      value,
      costBasis: amount * price,
      category: form.category,
      change: parseFloat(form.change)
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-5 shadow-xl">
        <h3 className="text-base font-semibold mb-4">Yeni Varlık Ekle</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sembol *</label>
              <div className="relative">
                <input
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="AVR"
                  required
                />
                {loading && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">İsim *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apple Inc."
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Miktar</label>
              <input
                type="number"
                step="0.0001"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fiyat ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="150.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değer ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değişim (%)</label>
              <input
                type="number"
                step="0.01"
                value={form.change}
                onChange={(e) => setForm({ ...form, change: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stocks">Hisse</option>
                <option value="crypto">Kripto</option>
                <option value="realestate">Gayrimenkul</option>
                <option value="cash">Nakit</option>
                <option value="etf">ETF/Fon</option>
                <option value="emk">BES (EMK)</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">
              İptal
            </button>
            <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
