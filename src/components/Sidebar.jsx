import { Zap, LayoutDashboard, Cpu, Settings, Activity } from 'lucide-react'

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'realtime', label: 'Real-Time', icon: Activity },
    { id: 'perangkat', label: 'Perangkat', icon: Cpu },
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
                        background: 'linear-gradient(135deg, #e6eff6, #f2e5cf)',
                        border: '1px solid #afc8da',
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 12px rgba(89, 116, 142, 0.14)',
                    }}>
                        <Zap size={18} color="#5f88a8" />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-accent)', letterSpacing: 2, lineHeight: 1 }}>ENERGIMON</div>
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
                                background: isActive ? '#e8f0f7' : 'transparent',
                                borderLeft: isActive ? '2px solid var(--text-accent)' : '2px solid transparent',
                                color: isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: isActive ? 600 : 400,
                                marginBottom: 2, transition: 'all 0.2s ease',
                                textAlign: 'left',
                            }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#edf4fa'; e.currentTarget.style.color = 'var(--text-primary)' } }}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                        >
                            <Icon size={16} />
                            {label}
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
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.ok ? '#4b9b75' : '#cd6d5b', boxShadow: `0 0 6px ${s.ok ? 'rgba(75,155,117,0.5)' : 'rgba(205,109,91,0.45)'}`, animation: s.ok ? 'pulse-glow 2s ease-in-out infinite' : 'none' }} />
                        <span style={{ fontSize: 11, color: s.ok ? 'var(--text-secondary)' : '#cd6d5b', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
                    </div>
                ))}
            </div>
        </aside>
    )
}