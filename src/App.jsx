import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  Target, AlertCircle, Clock, RefreshCw 
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'

// API Konfiguration
const API_URL = 'https://every-sites-smash.loca.lt/api'

// API Client
const fetchAPI = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`)
    if (!response.ok) throw new Error('API Error')
    return await response.json()
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return null
  }
}

function App() {
  const [data, setData] = useState({
    portfolio: null,
    positions: [],
    todayTrades: [],
    watchlist: [],
    strategyStats: [],
    performance: []
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [apiConnected, setApiConnected] = useState(false)

  // Daten laden
  const loadData = async () => {
    const [portfolio, positions, trades, watchlist, strategies, performance] = await Promise.all([
      fetchAPI('/portfolio'),
      fetchAPI('/positions'),
      fetchAPI('/trades/today'),
      fetchAPI('/watchlist'),
      fetchAPI('/strategies'),
      fetchAPI('/performance')
    ])

    setData({
      portfolio: portfolio || {
        totalValue: 10000,
        dayChange: 0,
        dayChangePercent: 0,
        totalReturn: 0,
        openPositions: 0,
        closedToday: 0,
        initialCapital: 10000
      },
      positions: positions || [],
      todayTrades: trades || [],
      watchlist: watchlist || [],
      strategyStats: strategies || [],
      performance: performance || []
    })
    
    setApiConnected(!!portfolio)
    setLastUpdate(new Date())
    setLoading(false)
  }

  // Initial load + Polling
  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000) // Alle 30 Sekunden
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0)
  }

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${(value || 0).toFixed(2)}%`
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0f172a', 
        color: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Activity size={48} style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading TradeForge...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Activity size={28} color="#10b981" />
          <h1>TradeForge Dashboard</h1>
        </div>
        <div className="status">
          <span 
            className="status-dot" 
            style={{ background: apiConnected ? '#10b981' : '#ef4444' }}
          ></span>
          <span>{apiConnected ? 'Agent Connected' : 'Disconnected'}</span>
          <span style={{ marginLeft: '1rem', color: '#64748b' }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
          <button 
            onClick={loadData}
            style={{
              marginLeft: '1rem',
              background: 'transparent',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <DollarSign size={18} />
              <span>Portfolio Value</span>
            </div>
            <div className={`stat-value ${(data.portfolio?.dayChange || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(data.portfolio?.totalValue)}
            </div>
            <div className={`stat-change ${(data.portfolio?.dayChange || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(data.portfolio?.dayChange)} ({formatPercent(data.portfolio?.dayChangePercent)})
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <TrendingUp size={18} />
              <span>Open Positions</span>
            </div>
            <div className="stat-value">{data.portfolio?.openPositions || 0}</div>
            <div className="stat-change" style={{ color: '#64748b' }}>
              {data.positions.filter(p => (p.pnl || 0) > 0).length} in profit
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Target size={18} />
              <span>Today's Trades</span>
            </div>
            <div className="stat-value">{data.todayTrades?.length || 0}</div>
            <div className="stat-change" style={{ color: '#64748b' }}>
              {data.portfolio?.closedToday || 0} closed
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Clock size={18} />
              <span>Win Rate Today</span>
            </div>
            <div className="stat-value positive">
              {(() => {
                const closed = data.todayTrades.filter(t => t.status === 'closed')
                if (closed.length === 0) return '0%'
                const wins = closed.filter(t => (t.pnl || 0) > 0).length
                return Math.round((wins / closed.length) * 100) + '%'
              })()}
            </div>
            <div className="stat-change" style={{ color: '#64748b' }}>
              {(() => {
                const closed = data.todayTrades.filter(t => t.status === 'closed')
                const wins = closed.filter(t => (t.pnl || 0) > 0).length
                return `${wins} / ${closed.length} wins`
              })()}
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Performance Chart */}
            {data.performance.length > 0 && (
              <div className="section" style={{ marginBottom: '2rem' }}>
                <div className="section-header">
                  <h2>Portfolio Performance</h2>
                  <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Today</span>
                </div>
                <div style={{ height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.performance}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} />
                      <Tooltip 
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
                        formatter={(value) => formatCurrency(value)}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Open Positions */}
            <div className="section">
              <div className="section-header">
                <h2>Open Positions</h2>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Live P&L
                </span>
              </div>
              {data.positions.length > 0 ? (
                <div className="positions-list">
                  {data.positions.map(pos => (
                    <div key={pos.id} className="position-card">
                      <div className={`position-type ${pos.type === 'buy' ? 'long' : 'short'}`}>
                        {pos.type === 'buy' ? 'L' : 'S'}
                      </div>
                      <div className="position-info">
                        <h3>{pos.ticker}</h3>
                        <span>{pos.strategy} • {pos.leverage}x • Conf: {Math.round((pos.confidence || 0) * 100)}%</span>
                      </div>
                      <div className="position-price">
                        <div className="label">Entry</div>
                        <div className="value">${(pos.entry || 0).toFixed(2)}</div>
                      </div>
                      <div className="position-price">
                        <div className="label">Current</div>
                        <div className="value">${(pos.current || 0).toFixed(2)}</div>
                      </div>
                      <div className="position-price">
                        <div className="label">P&L</div>
                        <div className={`value ${(pos.pnl || 0) >= 0 ? 'positive' : 'negative'}`}>
                          {(pos.pnl || 0) > 0 ? '+' : ''}{(pos.pnl || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No open positions</div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Watchlist */}
            {data.watchlist.length > 0 && (
              <div className="section" style={{ marginBottom: '2rem' }}>
                <div className="section-header">
                  <h2>Watchlist</h2>
                </div>
                <div className="watchlist">
                  {data.watchlist.map(item => (
                    <div key={item.ticker} className="watchlist-item">
                      <span className="ticker">{item.ticker}</span>
                      <div className="price">
                        <div>${(item.price || 0).toFixed(2)}</div>
                        <div className={`change ${(item.change || 0) >= 0 ? 'positive' : 'negative'}`}>
                          {(item.change || 0) > 0 ? '+' : ''}{item.change}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy Performance */}
            {data.strategyStats.length > 0 && (
              <div className="section" style={{ marginBottom: '2rem' }}>
                <div className="section-header">
                  <h2>Strategy Stats</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.strategyStats.map(strat => (
                    <div key={strat.name} style={{ 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '8px' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600 }}>{strat.name}</span>
                        <span style={{ color: (strat.winRate || 0) >= 50 ? '#10b981' : '#ef4444' }}>
                          {strat.winRate}% WR
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {strat.trades} trades • Ø {strat.avgReturn}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Activity */}
            <div className="section">
              <div className="section-header">
                <h2>Today's Activity</h2>
              </div>
              {data.todayTrades.length > 0 ? (
                <table className="trades-table">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Type</th>
                      <th>Price</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.todayTrades.map((trade, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{trade.ticker}</td>
                        <td>
                          <span className={`badge ${trade.type}`}>
                            {trade.type?.toUpperCase()}
                          </span>
                        </td>
                        <td>${(trade.price || 0).toFixed(2)}</td>
                        <td style={{ 
                          color: trade.pnl === null ? '#64748b' : 
                                 (trade.pnl || 0) > 0 ? '#10b981' : '#ef4444'
                        }}>
                          {trade.pnl === null ? 'OPEN' : 
                           `${(trade.pnl || 0) > 0 ? '+' : ''}${(trade.pnl || 0).toFixed(1)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">No trades today</div>
              )}
            </div>
          </div>
        </div>

        <div className="last-update">
          <RefreshCw size={14} style={{ marginRight: '0.5rem', display: 'inline' }} />
          Dashboard refreshes every 30 seconds • Next update: {new Date(lastUpdate.getTime() + 30000).toLocaleTimeString()}
        </div>
      </main>
    </div>
  )
}

export default App