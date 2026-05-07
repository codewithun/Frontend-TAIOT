import { useState, useEffect } from 'react'
import { Panel } from '../components/UI.jsx'
import { getRelayState, setRelayState } from '../lib/api.js'

export default function Perangkat() {
    const [devices, setDevices] = useState([
        { id: 1, nama: 'Relay 1', description: 'Relay Control 1', status: 'nonaktif', warna: '#22d3ee' },
        { id: 2, nama: 'Relay 2', description: 'Relay Control 2', status: 'nonaktif', warna: '#4ade80' },
    ])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [toggling, setToggling] = useState({})

    // Fetch relay state on mount and auto-refresh
    useEffect(() => {
        const fetchRelayState = async () => {
            try {
                const res = await getRelayState()
                if (res?.success && res.state) {
                    setDevices(prev => [
                        { ...prev[0], status: res.state.relay1 ? 'aktif' : 'nonaktif' },
                        { ...prev[1], status: res.state.relay2 ? 'aktif' : 'nonaktif' },
                    ])
                }
                setError(null)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchRelayState()

        // Auto-refresh relay state every 3 seconds to sync with external API
        const interval = setInterval(fetchRelayState, 3000)
        return () => clearInterval(interval)
    }, [])

    const toggle = async (id) => {
        const device = devices.find(d => d.id === id)
        if (!device) return
        const relay1Now = devices.find(d => d.id === 1)?.status === 'aktif'
        const relay2Now = devices.find(d => d.id === 2)?.status === 'aktif'
        const nextRelay1 = id === 1 ? !relay1Now : relay1Now
        const nextRelay2 = id === 2 ? !relay2Now : relay2Now

        // Set toggling state for button loading indicator
        setToggling(prev => ({ ...prev, [id]: true }))

        try {
            const payload = { relay1: nextRelay1, relay2: nextRelay2 }
            const res = await setRelayState(payload)

            if (res?.success && res.state) {
                // Update UI with response from server
                setDevices(prev => [
                    { ...prev[0], status: res.state.relay1 ? 'aktif' : 'nonaktif' },
                    { ...prev[1], status: res.state.relay2 ? 'aktif' : 'nonaktif' },
                ])
                setError(null)
            } else {
                throw new Error('Failed to update relay state')
            }
        } catch (err) {
            console.error('Toggle error:', err.message)
            setError(err.message)
            // Fallback: optimistic update
            setDevices(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'aktif' ? 'nonaktif' : 'aktif' } : d))
        } finally {
            setToggling(prev => ({ ...prev, [id]: false }))
        }
    }

    const totalAktif = devices.filter(d => d.status === 'aktif').length
    const totalPerangkat = devices.length

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status message */}
            {loading && <div style={{ padding: '12px 16px', background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 8, color: '#22d3ee', fontSize: 12, fontFamily: 'var(--font-mono)' }}>⏳ Loading relay state...</div>}
            {error && <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 12, fontFamily: 'var(--font-mono)' }}>⚠️ Error: {error}</div>}

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {[
                    { label: 'Total Relay', value: totalPerangkat, unit: 'unit', color: '#22d3ee' },
                    { label: 'Relay Aktif', value: totalAktif, unit: 'unit', color: '#4ade80' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                        border: `1px solid ${s.color}33`,
                    }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: s.color, fontWeight: 700 }}>{s.value}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{s.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Relay Control Panel */}
            <Panel title={`Manajemen Relay (${totalPerangkat} unit)`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                    {devices.map(d => {
                        const isOn = d.status === 'aktif'

                        return (
                            <div key={d.id} style={{
                                background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-lg)', padding: '24px 20px',
                                border: `1px solid ${isOn ? `${d.warna}33` : 'rgba(71,85,105,0.3)'}`,
                                transition: 'all 0.3s ease',
                                opacity: isOn ? 1 : 0.65,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: isOn ? d.warna : '#475569', boxShadow: isOn ? `0 0 12px ${d.warna}` : 'none', animation: isOn ? 'pulse-glow 2s ease-in-out infinite' : 'none' }} />
                                        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{d.nama}</span>
                                    </div>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{d.description}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: isOn ? d.warna : '#94a3b8', fontFamily: 'var(--font-mono)' }}>{isOn ? 'ON' : 'OFF'}</div>
                                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{isOn ? 'AKTIF' : 'NONAKTIF'}</div>
                                    </div>
                                </div>

                                <button onClick={() => toggle(d.id)} disabled={toggling[d.id]} style={{
                                    padding: '12px 28px', borderRadius: 8, border: 'none', cursor: toggling[d.id] ? 'not-allowed' : 'pointer',
                                    background: isOn ? d.warna : '#334155', color: '#fff', fontWeight: 600, fontSize: 12,
                                    fontFamily: 'var(--font-mono)', letterSpacing: 1,
                                    transition: 'all 0.3s ease',
                                    boxShadow: isOn ? `0 0 16px ${d.warna}66` : 'none',
                                    textTransform: 'uppercase',
                                    opacity: toggling[d.id] ? 0.6 : 1,
                                }}>
                                    {toggling[d.id] ? '⏳ PROSES...' : (isOn ? '⏹ MATIKAN' : '▶ NYALAKAN')}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </Panel>
        </div>
    )
}