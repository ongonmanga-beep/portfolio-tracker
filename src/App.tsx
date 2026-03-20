import { useState, useEffect } from 'react'
import { 
  LayoutGrid, 
  Wallet,
  TrendingUp,
  PieChart as PieChartIcon, 
  Bell, 
  Settings,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronDown,
  Activity,
  DollarSign,
  Clock,
  Target,
  Moon,
  Sun
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Assets from './pages/Assets'
import Transactions from './pages/Transactions'
import Analysis from './pages/Analysis'
import Goals from './pages/Goals'
import Alerts from './pages/Alerts'
import Reports from './pages/Reports'
import SettingsPage from './pages/Settings'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme')
    return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Theme değişince localStorage'a kaydet ve class ekle
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const [assets, setAssets] = useState(() => {
    try {
      const stored = localStorage.getItem('portfolio_assets_v1')
      if (stored) return JSON.parse(stored)
    } catch (err) {
      console.error('Failed to load assets:', err)
    }
    return [
      { name: 'Apple Inc.', symbol: 'AAPL', value: 25400, change: 2.3 },
      { name: 'Bitcoin', symbol: 'BTC', value: 45000, change: -1.2 },
      { name: 'Tesla', symbol: 'TSLA', value: 18500, change: 4.5 },
      { name: 'Ethereum', symbol: 'ETH', value: 22000, change: 0.8 },
      { name: 'NVIDIA', symbol: 'NVDA', value: 14850.50, change: 3.1 },
    ]
  })

  const totalValue = assets.reduce((sum: number, a: any) => sum + (a.value || 0), 0)
  const totalChange = assets.reduce((sum: number, a: any) => sum + ((a.value || 0) * (a.change || 0) / 100), 0)
  const changePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0

  const portfolio = {
    totalValue,
    change: totalChange,
    changePercent,
    assets: assets
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard portfolio={portfolio} assets={assets} />
      case 'assets':
        return <Assets />
      case 'transactions':
        return <Transactions />
      case 'goals':
        return <Goals />
      case 'analysis':
        return <Analysis />
      case 'goals':
        return <Goals />
      case 'alerts':
        return <Alerts />
      case 'reports':
        return <Reports />
      case 'settings':
        return <SettingsPage />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0C0F] text-gray-900 dark:text-slate-100 transition-colors">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-[#0B0C0F]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06] z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <NavButton icon={LayoutGrid} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavButton icon={Wallet} label="Varlıklar" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
              <NavButton icon={TrendingUp} label="İşlemler" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
              <NavButton icon={Target} label="Hedefler" active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
              <NavButton icon={PieChartIcon} label="Analiz" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
              <NavButton icon={Bell} label="Bildirimler" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Ara..." 
                className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-lg text-sm text-gray-900 dark:text-slate-200 placeholder:text-gray-500 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 dark:focus:bg-white/[0.06] transition-all"
              />
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            <button className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors md:block hidden">
              <Settings className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
              SÖ
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

function NavButton({ icon: Icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
        active 
          ? 'bg-white text-[#0B0C0F]' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}

function Dashboard({ portfolio, assets }: { portfolio: any, assets: any[] }) {
  const allocation = portfolio.assets.map((asset: any) => ({
    name: asset.symbol,
    value: asset.value,
    change: asset.change,
    percent: ((asset.value / portfolio.totalValue) * 100).toFixed(1)
  }))

  const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#14b8a6', '#3b82f6', '#0ea5e9', '#22c55e', '#eab308', '#f97316']
  const greenColors = ['#16a34a', '#15803d', '#166534', '#22c55e', '#4ade80', '#86efac']
  const redColors = ['#dc2626', '#b91c1c', '#991b1b', '#ef4444', '#f87171', '#fca5a5']

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Portföyüne genel bakış</p>
        </div>
      </header>

      <div className="mb-6">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-slate-400">Toplam Değer</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              portfolio.change >= 0 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-rose-400/10 text-rose-400'
            }`}>
              <TrendingUp className="w-3 h-3" />
              <span>{portfolio.changePercent >= 0 ? '+' : ''}{portfolio.changePercent.toFixed(2)}%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-semibold text-white">${portfolio.totalValue.toLocaleString()}</span>
            <span className={`text-sm font-medium ${
              portfolio.change >= 0 ? 'text-emerald-500' : 'text-rose-400'
            }`}>
              {portfolio.change >= 0 ? '+' : ''}${portfolio.change.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {allocation.length > 0 ? (
        <div className="h-[60vh] min-h-[500px] w-full" style={{ overflow: 'visible' }}>
            <ReactECharts
              option={{
                grid: {
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0
                },
                tooltip: {
                  formatter: (params: any) => {
                    const percent = ((params.value / portfolio.totalValue) * 100).toFixed(1)
                    return `
                      <div style="padding: 8px">
                        <div style="font-weight: bold; margin-bottom: 4px">${params.name}</div>
                        <div>Değer: $${params.value.toLocaleString()}</div>
                        <div>Pay: %${percent}</div>
                        ${params.data.change ? `<div>Değişim: ${params.data.change >= 0 ? '+' : ''}${params.data.change}%</div>` : ''}
                      </div>
                    `
                  }
                },
                series: [{
                  type: 'treemap',
                  width: '100%',
                  height: '100%',
                  data: allocation.map((item: any, i: number) => {
                    const percent = ((item.value / portfolio.totalValue) * 100).toFixed(1)
                    const isPositive = item.change >= 0
                    const colorArray = isPositive ? greenColors : redColors
                    return {
                      name: item.name,
                      value: item.value,
                      change: item.change,
                      percent: percent,
                      itemStyle: { color: colorArray[i % colorArray.length] }
                    }
                  }),
                  leafDepth: 1,
                  roam: false,
                  nodeClick: false,
                  breadcrumb: { show: false },
                  padding: 0,
                  label: {
                    show: true,
                    position: 'inside',
                    color: '#fff',
                    fontSize: 14,
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    fontWeight: 400,
                    align: 'center',
                    verticalAlign: 'middle',
                    formatter: (params: any) => {
                      const changePercent = params.data.change || 0
                      const changeSign = changePercent >= 0 ? '+' : ''
                      return `${params.name}\n$${params.value.toLocaleString()}\n${changeSign}${changePercent}%`
                    }
                  },
                  itemStyle: {
                    borderColor: '#1e293b',
                    borderWidth: 1,
                    gapWidth: 2,
                    borderRadius: 6
                  },
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowColor: 'rgba(0,0,0,0.5)',
                      opacity: 0.8
                    }
                  },
                  boundaryGap: [0, 0],
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0
                }]
              }}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        ) : (
          <div className="h-[60vh] min-h-[500px] w-full flex items-center justify-center text-slate-500">
            <div className="text-center">
              <LayoutGrid className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Henüz varlık eklenmemiş</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/[0.06]">
          {allocation.map((item: any, index: number) => {
            const isPositive = item.change >= 0
            const colorArray = isPositive ? greenColors : redColors
            return (
              <div key={item.name} className="flex items-center gap-2 cursor-pointer group">
                <div 
                  className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" 
                  style={{ backgroundColor: colorArray[index % colors.length] }} 
                />
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                  {item.name}
                </span>
                <span className="text-xs text-slate-500">
                  {((item.value / portfolio.totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            )
          })}
        </div>

        {/* Donut Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Varlık Türü</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(
                      assets.reduce((acc: any, a: any) => {
                        acc[a.category] = (acc[a.category] || 0) + a.value
                        return acc
                      }, {})
                    ).map(([key, value]: any) => ({ name: key.toUpperCase(), value }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value"
                  >
                    {Object.keys(assets.reduce((acc: any, a: any) => { acc[a.category] = true; return acc }, {})).map((key: string, i: number) => (
                      <Cell key={key} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-slate-300 mb-4">Kâr/Zarar</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Kâr', value: assets.filter((a: any) => a.change >= 0).reduce((sum: number, a: any) => sum + a.value, 0) },
                      { name: 'Zarar', value: assets.filter((a: any) => a.change < 0).reduce((sum: number, a: any) => sum + a.value, 0) }
                    ]}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
    </div>
  )
}

export default App
