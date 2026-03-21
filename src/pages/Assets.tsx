import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Upload, X, CheckCircle, AlertCircle, Edit2, Trash2, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown, TrendingUp as Stocks, Coins, Home, Banknote, PieChart, Building, Package, TrendingDown as BYF } from 'lucide-react'

const STORAGE_KEY = 'portfolio_assets_v1'

const assetCategories = [
  { id: 'all', name: 'Tümü' },
  { id: 'stocks', name: 'Hisse' },
  { id: 'crypto', name: 'Kripto' },
  { id: 'realestate', name: 'Gayrimenkul' },
  { id: 'cash', name: 'Nakit' },
  { id: 'etf', name: 'ETF/Fon' },
]

interface ImportResult {
  success: boolean
  count?: number
  error?: string
  assets?: any[]
}

const loadAssets = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (err) {
    console.error('Failed to load assets:', err)
  }
  return []
}

const saveAssets = (assets: any[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
  } catch (err) {
    console.error('Failed to save assets:', err)
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
  const [editingAmount, setEditingAmount] = useState<number | null>(null)
  const [editingAmountValue, setEditingAmountValue] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateAssets = (newAssets: any[]) => {
    setAssets(newAssets)
    saveAssets(newAssets)
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const getSortedAssets = (assetsToSort: any[]) => {
    if (!sortColumn) return assetsToSort
    return [...assetsToSort].sort((a, b) => {
      let aVal: any = a[sortColumn]
      let bVal: any = b[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  const filteredAssets = getSortedAssets(assets.filter(asset => {
    const matchesCategory = activeCategory === 'all' || asset.category === activeCategory
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  }))

  const handleAmountEdit = (assetId: number, currentAmount: number) => {
    setEditingAmount(assetId)
    setEditingAmountValue(currentAmount.toString())
  }

  const handleAmountSave = (assetId: number) => {
    const newAmount = parseFloat(editingAmountValue)
    if (isNaN(newAmount) || newAmount < 0) {
      setEditingAmount(null)
      return
    }
    
    const updatedAssets = assets.map(asset => {
      if (asset.id === assetId) {
        const newValue = newAmount * asset.price
        const costBasis = asset.costBasis || (newAmount * asset.price)
        const changePercent = costBasis > 0 ? ((newValue - costBasis) / costBasis) * 100 : 0
        return {
          ...asset,
          amount: newAmount,
          value: newValue,
          change: parseFloat(changePercent.toFixed(2))
        }
      }
      return asset
    })
    
    updateAssets(updatedAssets)
    setEditingAmount(null)
  }

  const handleAmountBlur = (assetId: number) => handleAmountSave(assetId)

  const handleAmountKeyDown = (e: React.KeyboardEvent, assetId: number) => {
    if (e.key === 'Enter') handleAmountSave(assetId)
    else if (e.key === 'Escape') setEditingAmount(null)
  }

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
      if (lines.length < 2) return { success: false, error: 'CSV dosyası boş veya geçersiz' }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
      
      const symbolIdx = headers.findIndex(h => ['holding', 'symbol', 'ticker'].includes(h))
      const nameIdx = headers.findIndex(h => ['holdings\' name', 'name', 'company'].includes(h))
      const valueIdx = headers.findIndex(h => ['current value', 'value', 'market value'].includes(h))
      const sharesIdx = headers.findIndex(h => ['shares', 'quantity', 'amount', 'units'].includes(h))
      const costBasisIdx = headers.findIndex(h => ['cost basis', 'avg cost', 'purchase price', 'buy price'].includes(h))
      const sectorIdx = headers.findIndex(h => ['sector', 'category', 'asset type'].includes(h))
      
      if (symbolIdx === -1 || nameIdx === -1 || valueIdx === -1) {
        return { success: false, error: 'Gerekli kolonlar bulunamadı: Symbol, Name, Value' }
      }

      const parsedAssets: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, '')) || []
        if (values.length > symbolIdx && values[symbolIdx]) {
          const symbol = values[symbolIdx] || ''
          const name = values[nameIdx] || ''
          const value = parseFloat(values[valueIdx]?.replace(/,/g, '') || '0')
          const shares = sharesIdx !== -1 ? parseFloat(values[sharesIdx]?.replace(/,/g, '') || '0') : 0
          const costBasis = costBasisIdx !== -1 ? parseFloat(values[costBasisIdx]?.replace(/,/g, '') || '0') : 0
          const sector = sectorIdx !== -1 ? values[sectorIdx] : 'stocks'
          
          const pricePerShare = shares > 0 ? (costBasis > 0 ? costBasis : value) / shares : 0
          
          let category = 'stocks'
          if (sector.toLowerCase().includes('fund') || sector.toLowerCase().includes('etf')) category = 'etf'
          else if (sector.toLowerCase().includes('crypto')) category = 'crypto'
          else if (sector.toLowerCase().includes('real estate')) category = 'realestate'
          else if (sector.toLowerCase().includes('cash')) category = 'cash'
          
          const calculatedCostBasis = costBasis || (shares > 0 ? shares * pricePerShare : value)
          const changePercent = calculatedCostBasis > 0 ? ((value - calculatedCostBasis) / calculatedCostBasis) * 100 : 0
          
          parsedAssets.push({
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

      return { success: true, count: parsedAssets.length, assets: parsedAssets }
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
      const result = parseCSV(event.target?.result as string)
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
        const result = parseCSV(event.target?.result as string)
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
          <button onClick={() => { if (confirm('Tüm varlıklar silinecek. Emin misiniz?')) updateAssets([]) }}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs">
            Sıfırla
          </button>
          <button onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs">
            <Upload className="w-3.5 h-3.5" /><span>CSV</span>
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs">
            <Plus className="w-3.5 h-3.5" /><span>Ekle</span>
          </button>
        </div>
      </header>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Ara..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {assetCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition text-xs ${
              activeCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-500">Varlık</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Fiyat</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Miktar</th>
              <th 
                className="px-3 py-2 text-right font-medium text-gray-500 cursor-pointer hover:text-gray-300 transition"
                onClick={() => handleSort('value')}
              >
                <span className="inline-flex items-center gap-1">
                  Değer
                  {sortColumn === 'value' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3" />}
                </span>
              </th>
              <th 
                className="px-3 py-2 text-right font-medium text-gray-500 cursor-pointer hover:text-gray-300 transition"
                onClick={() => handleSort('change')}
              >
                <span className="inline-flex items-center gap-1">
                  Kâr/Zarar
                  {sortColumn === 'change' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3" />}
                </span>
              </th>
              <th 
                className="px-3 py-2 text-right font-medium text-gray-500 cursor-pointer hover:text-gray-300 transition"
                onClick={() => handleSort('change')}
              >
                <span className="inline-flex items-center gap-1">
                  ±%
                  {sortColumn === 'change' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : <ArrowUpDown className="w-3 h-3" />}
                </span>
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Temettü</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500">Getiri</th>
              <th className="px-3 py-2 text-right font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredAssets.map(asset => {
              const costBasis = asset.costBasis || (asset.amount && asset.price ? asset.amount * asset.price : asset.value)
              const profitLoss = (asset.value || 0) - (costBasis || 0)
              const isPositive = profitLoss >= 0
              
              return (
                <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-1 py-2.5 whitespace-nowrap w-[45px] max-w-[45px]">
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">{asset.symbol?.slice(0, 5)}</p>
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-500">
                    ${asset.price ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="px-1 py-2.5 text-right">
                    {editingAmount === asset.id ? (
                      <input type="text" value={editingAmountValue}
                        onChange={(e) => setEditingAmountValue(e.target.value.slice(0, 5))}
                        onBlur={() => handleAmountBlur(asset.id)}
                        onKeyDown={(e) => handleAmountKeyDown(e, asset.id)}
                        className="w-12 px-0.5 py-0.5 text-right text-xs font-light bg-white dark:bg-gray-700 border border-blue-500 rounded focus:outline-none"
                        autoFocus maxLength={5} />
                    ) : (
                      <span onClick={() => handleAmountEdit(asset.id, asset.amount || 0)}
                        className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1 py-1 text-xs font-light text-gray-500">
                        {asset.amount ? asset.amount.toLocaleString().slice(0, 5) : '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-gray-900 dark:text-gray-100">
                    ${asset.value.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`inline-flex items-center gap-1 ${isPositive ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}${Math.abs(profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`inline-flex items-center gap-1 ${asset.change >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {asset.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {asset.change >= 0 ? '+' : ''}{asset.change}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600 dark:text-gray-400">
                    {asset.dividendPerShare ? `$${asset.dividendPerShare.toFixed(4)}` : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    {asset.dividendYield ? (
                      <span className="text-emerald-600 font-medium">{asset.dividendYield.toFixed(2)}%</span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {deleteConfirm === asset.id ? (
                        <>
                          <button onClick={() => handleDelete(asset.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition" title="Onayla">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition" title="İptal">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditingAsset(asset)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition text-gray-500 dark:text-gray-400" title="Düzenle">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirm(asset.id)} className="p-1 hover:bg-red-100 rounded transition text-gray-500 hover:text-red-600" title="Sil">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editingAsset && <EditModal asset={editingAsset} onSave={handleSaveEdit} onCancel={() => setEditingAsset(null)} />}
      {showAddModal && <AddAssetModal onSave={handleAdd} onCancel={() => setShowAddModal(false)} />}
      
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">CSV İçe Aktar</h3>
              <button onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Dosyayı buraya sürükleyin veya tıklayın</p>
              <p className="text-xs text-gray-500">Desteklenen format: Symbol, Name, Value</p>
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </div>

            {importResult && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                importResult.success ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {importResult.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm">{importResult.success ? `${importResult.count} varlık parse edildi` : importResult.error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowImportModal(false); setImportResult(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                İptal
              </button>
              <button disabled={!importResult?.success}
                onClick={() => {
                  if (importResult?.assets) {
                    const merged = assets.map(existing => {
                      const incoming = importResult.assets!.find(n => n.symbol === existing.symbol)
                      return incoming ? { ...existing, ...incoming } : existing
                    })
                    importResult.assets!.forEach(incoming => {
                      if (!assets.find(e => e.symbol === incoming.symbol)) merged.push(incoming)
                    })
                    updateAssets(merged)
                    setShowImportModal(false)
                    setImportResult(null)
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
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
    onSave({ 
      ...form, 
      amount: parseFloat(form.amount) || 0,
      price: parseFloat(form.price) || 0,
      costBasis: parseFloat(form.costBasis) || 0,
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
              <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">İsim</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Miktar</label>
              <input type="number" step="0.0001" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fiyat ($)</label>
              <input type="number" step="0.01" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Maliyet ($)</label>
              <input type="number" step="0.01" value={form.costBasis || ''} onChange={(e) => setForm({ ...form, costBasis: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değer ($)</label>
              <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değişim (%)</label>
              <input type="number" step="0.01" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kategori</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="stocks">Hisse</option>
              <option value="crypto">Kripto</option>
              <option value="realestate">Gayrimenkul</option>
              <option value="cash">Nakit</option>
              <option value="etf">ETF/Fon</option>
            </select>
          </div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">İptal</button>
            <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddAssetModal({ onSave, onCancel }: { onSave: (asset: any) => void, onCancel: () => void }) {
  const [activeTab, setActiveTab] = useState('yat')
  const [form, setForm] = useState({
    symbol: '', name: '', amount: '', price: '', value: '', change: '0', category: 'yat',
    dividendPerShare: '', dividendYield: '', paymentFrequency: 'yearly'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usdTryRate, setUsdTryRate] = useState(35.5)

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://api.tcmb.gov.tr/api/currency/USD/TRY')
        const data = await response.json()
        if (data?.data?.value) setUsdTryRate(parseFloat(data.data.value))
        else {
          const altResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
          const altData = await altResponse.json()
          if (altData?.rates?.TRY) setUsdTryRate(altData.rates.TRY)
        }
      } catch (err) { setUsdTryRate(35.5) }
    }
    fetchRate()
  }, [])

  const categories = [
    { id: 'stocks', label: 'Hisse', icon: <Stocks className="w-4 h-4" /> },
    { id: 'crypto', label: 'Kripto', icon: <Coins className="w-4 h-4" /> },
    { id: 'realestate', label: 'Gayrimenkul', icon: <Home className="w-4 h-4" /> },
    { id: 'cash', label: 'Nakit', icon: <Banknote className="w-4 h-4" /> },
    { id: 'etf', label: 'ETF/Fon', icon: <PieChart className="w-4 h-4" /> },
    { id: 'emk', label: 'BES', icon: <Building className="w-4 h-4" /> },
    { id: 'yat', label: 'Yatırım Fonu', icon: <Package className="w-4 h-4" /> },
    { id: 'byf', label: 'BYF', icon: <BYF className="w-4 h-4" /> }
  ]

  useEffect(() => {
    const abortController = new AbortController()
    const fetchPrice = async () => {
      if (form.symbol.length < 3) return
      setLoading(true)
      setError('')
      try {
        // Hisse ve ETF için Yahoo Finance
        if (['stocks', 'etf'].includes(activeTab)) {
          const url = `http://localhost:8080/api/v1/stocks/${form.symbol.toUpperCase()}`
          const response = await fetch(url, { signal: abortController.signal })
          const data = await response.json()
          if (data.price) {
            setForm(prev => ({
              ...prev, 
              name: data.name || prev.name, 
              price: data.price.toFixed(6),
              dividendPerShare: data.dividendPerShare?.toFixed(4) || '0',
              dividendYield: data.dividendYield?.toFixed(2) || '0',
              paymentFrequency: data.paymentFrequency || 'quarterly', 
              category: activeTab
            }))
          } else setError('Bulunamadı')
        }
      } catch (err: any) { if (err.name !== 'AbortError') setError('API bağlantı hatası') }
      finally { setLoading(false) }
    }
    const debounceTimer = setTimeout(fetchPrice, 300)
    return () => { clearTimeout(debounceTimer); abortController.abort() }
  }, [form.symbol, activeTab, usdTryRate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(form.amount) || 0
    const price = parseFloat(form.price) || 0
    const value = parseFloat(form.value) || (amount * price)
    onSave({
      id: Date.now(), symbol: form.symbol.toUpperCase(), name: form.name, amount, price, value,
      costBasis: amount * price, category: form.category, change: parseFloat(form.change),
      dividendPerShare: parseFloat(form.dividendPerShare) || 0,
      dividendYield: price ? ((parseFloat(form.dividendPerShare) || 0) / price) * 100 : 0,
      paymentFrequency: form.paymentFrequency || 'yearly'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-5 shadow-xl">
        <h3 className="text-base font-semibold mb-4">Yeni Varlık Ekle</h3>
        
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Varlık Türü</label>
          <div className="relative">
            <select value={activeTab} onChange={(e) => { setActiveTab(e.target.value); setForm(prev => ({ ...prev, category: e.target.value })) }}
              className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none">
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {categories.find(cat => cat.id === activeTab)?.icon}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <ArrowUpDown className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sembol *</label>
              <div className="relative">
                <input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="AVR" required />
                {loading && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">İsim *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Apple Inc." required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Miktar</label>
              <input type="number" step="0.0001" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Fiyat ($) {['stocks', 'etf'].includes(activeTab) ? '(Yahoo Finance)' : '(Manuel)'}</label>
              <input type="number" step="0.000001" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                readOnly={['stocks', 'etf'].includes(activeTab)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" placeholder="150.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değer ($)</label>
              <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Değişim (%)</label>
              <input type="number" step="0.01" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            {['stocks', 'etf'].includes(activeTab) && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Temettü ($/hisse)</label>
                  <input type="number" step="0.0001" value={form.dividendPerShare} onChange={(e) => setForm({ ...form, dividendPerShare: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Ödeme</label>
                  <select value={form.paymentFrequency} onChange={(e) => setForm({ ...form, paymentFrequency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="monthly">Aylık</option>
                    <option value="quarterly">3 Aylık</option>
                    <option value="yearly">Yıllık</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2 pt-3">
            <button type="button" onClick={onCancel} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm">İptal</button>
            <button type="submit" className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm">Ekle</button>
          </div>
        </form>
      </div>
    </div>
  )
}
