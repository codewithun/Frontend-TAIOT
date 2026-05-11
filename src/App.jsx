import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Realtime from './pages/Realtime.jsx'
import Analisis from './pages/Analisis.jsx'
import Perangkat from './pages/Perangkat.jsx'
import Alerts from './pages/Alerts.jsx'

const pageConfig = {
  dashboard: { title: 'Dashboard Utama', subtitle: 'Monitoring Energi Listrik — Sistem Rumah' },
  realtime: { title: 'Monitor Real-Time', subtitle: 'Data streaming live — 1 detik refresh' },
  analisis: { title: 'Analisis Konsumsi', subtitle: 'Tren, distribusi, dan rekomendasi penghematan' },
  perangkat: { title: 'Manajemen Perangkat', subtitle: 'Kontrol dan pantau setiap perangkat listrik' },
  alerts: { title: 'Peringatan & Notifikasi', subtitle: 'Log kejadian dan anomali sistem' },
  settings: { title: 'Pengaturan Sistem', subtitle: 'Konfigurasi threshold dan preferensi' },
}

function SettingsPlaceholder() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: 2 }}>
      ⚙ HALAMAN PENGATURAN — SEGERA HADIR
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const cfg = pageConfig[page] || pageConfig.dashboard

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />
      case 'realtime': return <Realtime />
      case 'analisis': return <Analisis />
      case 'perangkat': return <Perangkat />
      case 'alerts': return <Alerts />
      default: return <SettingsPlaceholder />
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)' }}>
      {/* Atmospheric effects */}
      <div className="grid-bg" />
      <div className="scan-line" />

      {/* Sidebar */}
      <Sidebar active={page} onNav={setPage} />

      {/* Main content */}
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        <Header title={cfg.title} subtitle={cfg.subtitle} />

        <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          <div key={page} className="fade-in-up">
            {renderPage()}
          </div>
        </main>

        {/* Footer bar */}
        <div style={{
          height: 32, background: '#eef4f9', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>
            ENERGIMON v2.4.1 · Semarang, Jawa Tengah · PLN R-2 · Rp 1.444/kWh
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            {['CPU: 12%', 'MEM: 84MB', 'UPTIME: 99.8%'].map(s => (
              <span key={s} style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}