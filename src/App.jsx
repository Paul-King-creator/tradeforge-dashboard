import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, 
  Target, AlertCircle, Clock, RefreshCw 
} from 'lucide-react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'

// Mock-Daten für Demo (später durch API ersetzen)
const mockData = {
  portfolio: {
    totalValue: 10847.50,
    dayChange: +847.50,
    dayChangePercent: +8.47,
    totalReturn: +8.47,
    openPositions: 3,
    closedToday: 5
  },
  positions: [
    {
      id: 1,
      ticker: 'NVDA',
      type: 'long',
      strategy: 'momentum_long',
      entry: 875.25,
      current: 892.40,
      stopLoss: 845.00,
      takeProfit: 925.00,
      leverage: 5,
      pnl: +9.79,
      confidence: 0.78,
      time: '2h ago'
    },
    {
      id: 2,
      ticker: 'TSLA',
      type: 'short',
      strategy: 'breakout_short',
      entry: 178.50,
      current: 172.30,
      stopLoss: 185.00,
      takeProfit: 165.00,
      leverage: 3,
      pnl: +10.42,
      confidence: 0.72,
      time: '4h ago'
    },
    {
      id: 3,
      ticker: 'AAPL',
      type: 'long',
      strategy: 'mean_reversion_long',
      entry: 185.20,
      current: 187.85,
      stopLoss: 180.00,
      takeProfit: 195.00,
      leverage: 2,
      pnl: +2.86,
      confidence: 0.65,
      time: '6h ago'
    }
  ],
  todayTrades: [
    { ticker: 'NVDA', type: 'buy', price: 875.25, pnl: null, status: 'open' },
    { ticker: 'MSFT', type: 'sell', price: 420.50, pnl: -4.2, status: 'closed' },
    { ticker: 'TSLA', type: 'sell', price: 178.50, pnl: null, status: 'open' },
    { ticker: 'AMZN', type: 'buy', price: 178.20, pnl: +12.5, status: 'closed' },
    { ticker: 'AAPL', type: 'buy', price: 185.20, pnl: null, status: 'open' },
    { ticker: 'META', type: 'buy', price: 495.00, pnl: +8.3, status: 'closed' }
  ],
  watchlist: [
    { ticker: 'NVDA', price: 892.40, change: +2.15 },
    { ticker: 'AAPL', price: 187.85, change: +0.89 },
    { ticker: 'MSFT', price: 422.10, change: +0.45 },
    { ticker: 'AMZN', price: 180.50, change: +1.25 },
    { ticker: 'GOOGL', price: 175.20, change: -0.35 },
    { ticker: 'META', price: 498.50, change: +1.92 },
    { ticker: 'TSLA', price: 172.30, change: -3.45 },
    { ticker: 'AVGO', price: 1385.20, change: +0.78 }
  ],
  performance: [
    { time: '09:30', value: 10000 },
    { time: '10:00', value: 10120 },
    { time: '10:30', value: 10050 },
    { time: '11:00', value: 10230 },
    { time: '11:30', value: 10410 },
    { time: '12:00', value: 10520 },
    { time: '12:30', value: 10680 },
    { time: '13:00', value: 10750 },
    { time: '13:30', value: 10847 }
  ],
  strategyStats: [
    { name: 'Momentum Long', trades: 12, winRate: 67, avgReturn: 8.5 },
    { name: 'Breakout', trades: 8, winRate: 50, avgReturn: 4.2 },
    { name: 'Mean Reversion', trades: 5, winRate: 60, avgReturn: 3.8 }
  ]
}

function App() {
  const [data, setData] = useState(mockData)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [activeTab, setActiveTab] = useState('overview')

  // In echter Anwendung: API-Polling alle 30 Sekunden
  useEffect(() => {
    const interval = setInterval(() => {
      // Hier würde API-Call kommen
      setLastUpdate(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Activity size={28} color="#10b981" />
          <h1>TradeForge Dashboard</h1>
        </div>
        <div className="status">
          <span className="status-dot"></span>
          <span>Agent Active</span>
          <span style={{ marginLeft: '1rem', color: '#64748b' }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
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
            <div className={`stat-value ${data.portfolio.dayChange >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(data.portfolio.totalValue)}
            </div>
            <div className={`stat-change ${data.portfolio.dayChange >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(data.portfolio.dayChange)} ({formatPercent(data.portfolio.dayChangePercent)})
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <TrendingUp size={18} />
              <span>Open Positions</span>
            </div>
            <div className="stat-value">{data.portfolio.openPositions}</div>
            <div className="stat-change" style={{ color: '#64748b' }}>
              {data.positions.filter(p => p.pnl > 0).length} in profit
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Target size={18} />
              <span>Today's Trades</span>
            </div>
            <div className="stat-value">{data.todayTrades.length}</div>
            <div className="stat-change" style={{ color: '#64748b' }}>
              {data.portfolio.closedToday} closed
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <Clock size={18} />
              <span>Win Rate Today</span>
            </div>
            <div className="stat-value positive">
              {Math.round((data.todayTrades.filter(t => (t.pnl || 0) > 0).length / 
                data.todayTrades.filter(t => t.status === 'closed').length) * 100 || 0)}%
            </div>
            <div className="stat-change" style={{ color: '#64748b' }}>
              {data.todayTrades.filter(t => (t.pnl || 0) > 0).length} / {data.todayTrades.filter(t => t.status === 'closed').length} wins
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="left-column">
            {/* Performance Chart */}
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

            {/* Open Positions */}
            <div className="section">
              <div className="section-header">
                <h2>Open Positions</h2>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  Live P&L
                </span>
              </div>
              <div className="positions-list">
                {data.positions.map(pos => (
                  <div key={pos.id} className="position-card">
                    <div className={`position-type ${pos.type}`}>
                      {pos.type === 'long' ? 'L' : 'S'}
                    </div>
                    <div className="position-info">
                      <h3>{pos.ticker}</h3>
                      <span>{pos.strategy} • {pos.leverage}x • Conf: {Math.round(pos.confidence * 100)}%</span>
                    </div>
                    <div className="position-price">
                      <div className="label">Entry</div>
                      <div className="value">${pos.entry.toFixed(2)}</div>
                    </div>
                    <div className="position-price">
                      <div className="label">Current</div>
                      <div className="value">${pos.current.toFixed(2)}</div>
                    </div>
                    <div className="position-price">
                      <div className="label">P&L</div>
                      <div className={`value ${pos.pnl >= 0 ? 'positive' : 'negative'}`}>
                        {pos.pnl > 0 ? '+' : ''}{pos.pnl.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Watchlist */}
            <div className="section" style={{ marginBottom: '2rem' }}>
              <div className="section-header">
                <h2>Watchlist</h2>
              </div>
              <div className="watchlist">
                {data.watchlist.map(item => (
                  <div key={item.ticker} className="watchlist-item">
                    <span className="ticker">{item.ticker}</span>
                    <div className="price">
                      <div>${item.price.toFixed(2)}</div>
                      <div className={`change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Performance */}
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
                      <span style={{ color: strat.winRate >= 50 ? '#10b981' : '#ef4444' }}>
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

            {/* Today's Activity */}
            <div className="section">
              <div className="section-header">
                <h2>Today's Activity</h2>
              </div>
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
                          {trade.type.toUpperCase()}
                        </span>
                      </td>
                      <td>${trade.price.toFixed(2)}</td>
                      <td style={{ 
                        color: trade.pnl === null ? '#64748b' : 
                               trade.pnl > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {trade.pnl === null ? 'OPEN' : 
                         `${trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(1)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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