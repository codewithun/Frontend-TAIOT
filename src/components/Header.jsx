import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Wifi } from 'lucide-react'
import { Badge } from './UI.jsx'

export default function Header({ title, subtitle }) {
    const [time, setTime] = useState(new Date())
    const [refreshing, setRefreshing] = useState(false)

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
                    <Wifi size={13} color="#4ade80" />
                    <Badge type="success">Live</Badge>
                </div>

                {/* Clock */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--neon-cyan)', background: 'rgba(34,211,238,0.08)', padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(34,211,238,0.15)', letterSpacing: 2 }}>
                    {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>

                {/* Date */}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {time.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                {/* Refresh */}
                <button
                    onClick={handleRefresh}
                    style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.8s linear' : 'none' }} />
                </button>

                {/* Notifications */}
                <button style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <Bell size={13} />
                    <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 6px #f87171' }} />
                </button>

                {/* Avatar */}
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #22d3ee, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#050810', cursor: 'pointer' }}>A</div>
            </div>
        </header>
    )
}