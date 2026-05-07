import { Zap, LayoutDashboard, BarChart3, Cpu, AlertTriangle, Settings, Activity } from 'lucide-react'

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'realtime', label: 'Real-Time', icon: Activity },
    { id: 'analisis', label: 'Analisis', icon: BarChart3 },
    { id: 'perangkat', label: 'Perangkat', icon: Cpu },
    { id: 'alerts', label: 'Peringatan', icon: AlertTriangle },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
]

export default function Sidebar({ active, onNav }) {
    return (
        <aside style={{
            width: 220,
            minHeight: '100vh',
            background: 'var(--bg-panel)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            top: 0, left: 0, bottom: 0,
            zIndex: 100,
        }}>
            {/* Logo */}
            <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36,
                        background: 'linear-gradient(135deg, #22d3ee22, #4ade8022)',
                        border: '1px solid rgba(34,211,238,0.4)',
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(34,211,238,0.2)',
                    }}>
                        <Zap size={18} color="#22d3ee" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#22d3ee', letterSpacing: 2, lineHeight: 1 }}>ENERGIMON</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginTop: 2 }}>v2.4.1 · LIVE</div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '16px 12px' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 2, padding: '0 8px', marginBottom: 8 }}>NAVIGASI</div>
                {navItems.map(({ id, label, icon: Icon }) => {
                    const isActive = active === id
                    return (
                        <button
                            key={id}
                            onClick={() => onNav(id)}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 12px', borderRadius: 8, border: 'none',
                                background: isActive ? 'rgba(34,211,238,0.12)' : 'transparent',
                                borderLeft: isActive ? '2px solid #22d3ee' : '2px solid transparent',
                                color: isActive ? '#22d3ee' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 400,
                                marginBottom: 2, transition: 'all 0.2s ease',
                                textAlign: 'left',
                            }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                        >
                            <Icon size={16} />
                            {label}
                            {id === 'alerts' && (
                                <span style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: '#f87171', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}>4</span>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Status bar */}
            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>STATUS SISTEM</div>
                {[
                    { label: 'API PLN', ok: true },
                    { label: 'Sensor #1', ok: true },
                    { label: 'Sensor #2', ok: false },
                ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.ok ? '#4ade80' : '#f87171', boxShadow: `0 0 6px ${s.ok ? '#4ade80' : '#f87171'}`, animation: s.ok ? 'pulse-glow 2s ease-in-out infinite' : 'none' }} />
                        <span style={{ fontSize: 11, color: s.ok ? 'var(--text-secondary)' : '#f87171', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                    </div>
                ))}
            </div>
        </aside>
    )
}