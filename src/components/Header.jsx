import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Wifi } from 'lucide-react'
import { Badge } from './UI.jsx'

export default function Header({ title, subtitle }) {
    const [time, setTime] = useState(new Date())
    const [refreshing, setRefreshing] = useState(false)
    const [showNotif, setShowNotif] = useState(false)
    const [showProfile, setShowProfile] = useState(false)

    const notifications = [
        { id: 1, title: 'Sensor #2 offline', time: '2m lalu', tone: 'error' },
        { id: 2, title: 'PZEM1: Energi tercatat +12 kWh', time: '1h lalu', tone: 'info' },
        { id: 3, title: 'Tagihan estimasi bulan ini tersedia', time: '1d lalu', tone: 'success' },
    ]

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(t)
    }, [])

    const handleRefresh = () => {
        setRefreshing(true)
        setTimeout(() => setRefreshing(false), 1200)
    }

    return (
        <header style={{
            height: 64,
            background: 'var(--bg-panel)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky', top: 0, zIndex: 50,
        }}>
            <div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-primary)', letterSpacing: 3, textTransform: 'uppercase' }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{subtitle}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Live indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wifi size={13} color="#4b9b75" />
                    <Badge type="success">Live</Badge>
                </div>

                {/* Clock */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-accent)', background: '#e8f0f7', padding: '4px 12px', borderRadius: 6, border: '1px solid #bfd2e2', letterSpacing: 2 }}>
                    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>

                {/* Date */}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {time.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                {/* Refresh */}
                <button
                    onClick={handleRefresh}
                    style={{ width: 32, height: 32, borderRadius: 6, background: '#eff5fa', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#9fbed6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear' : 'none' }} />
                </button>

                {/* Notifications */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowNotif(s => !s)} aria-expanded={showNotif}
                        style={{ width: 32, height: 32, borderRadius: 6, background: '#eff5fa', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#d29c91'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                        <Bell size={13} />
                        <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#cd6d5b', boxShadow: '0 0 6px rgba(205,109,91,0.4)' }} />
                    </button>

                    {showNotif && (
                        <div role="dialog" aria-label="Notifikasi" style={{
                            position: 'absolute', right: 0, top: 44, width: 320, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 10px 30px rgba(17,24,39,0.12)', zIndex: 60, overflow: 'hidden'
                        }}>
                            <div style={{ padding: 12, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: 13 }}>Notifikasi</strong>
                                <button onClick={() => setShowNotif(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>Tutup</button>
                            </div>
                            <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                                {notifications.map(n => (
                                    <div key={n.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 6, background: n.tone === 'error' ? '#f87171' : n.tone === 'success' ? '#4ade80' : '#22d3ee' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{n.title}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{n.time}</div>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <div style={{ padding: 12, color: 'var(--text-muted)' }}>Tidak ada notifikasi</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowProfile(s => !s)} aria-expanded={showProfile}
                        style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #a8cae2, #f2d6ab)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#2b3340', cursor: 'pointer', border: 'none' }}>
                        A
                    </button>

                    {showProfile && (
                        <div role="dialog" aria-label="Akun" style={{
                            position: 'absolute', right: 0, top: 44, width: 260, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 10px 30px rgba(17,24,39,0.12)', zIndex: 60, overflow: 'hidden'
                        }}>
                            <div style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #a8cae2, #f2d6ab)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>A</div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700 }}>Admin</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>admin@lokal.local</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
                                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>Lihat Profil</button>
                                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>Pengaturan Akun</button>
                                <button style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: '#fef2f2', color: '#b91c1c', cursor: 'pointer', textAlign: 'left' }}>Logout</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}