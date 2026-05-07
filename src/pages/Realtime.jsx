/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Panel, GaugeRing, Badge } from '../components/UI.jsx'
import { getLatestPzem } from '../lib/api.js'

function generatePoint(prev) {
    return {
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        daya: Math.round((prev?.daya || 1800) + (Math.random() - 0.5) * 80),
        tegangan: parseFloat(((prev?.tegangan || 222) + (Math.random() - 0.5) * 2).toFixed(1)),
        arus: parseFloat(((prev?.arus || 8.2) + (Math.random() - 0.5) * 0.3).toFixed(2)),
        frekuensi: parseFloat((50 + (Math.random() - 0.5) * 0.2).toFixed(2)),
    }
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#0d1220', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 8, padding: '8px 12px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#22d3ee', marginBottom: 4 }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ fontSize: 11, color: p.color, fontFamily: 'var(--font-mono)' }}>{p.name}: {p.value}</p>
            ))}
        </div>
    )
}

export default function Realtime() {
    const [data, setData] = useState(() => {
        const pts = []
        let prev = null
        for (let i = 0; i < 30; i++) { prev = generatePoint(prev); pts.push(prev) }
        return pts
    })
    const [latest, setLatest] = useState(data[data.length - 1])
    const [paused, setPaused] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (paused) return

        let mounted = true
        const tick = async () => {
            try {
                const res = await getLatestPzem()
                if (!mounted) return
                if (res?.success && res.data) {
                    const latestData = {
                        time: new Date(res.data.serverTimestamp || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                        daya: Math.round(res.data.power || (res.data.power_w || 0)),
                        tegangan: parseFloat((res.data.voltage || 0).toFixed(1)),
                        arus: parseFloat((res.data.current || 0).toFixed(2)),
                        frekuensi: parseFloat((res.data.frequency || 0).toFixed(2)),
                    }
                    setLatest(latestData)
                    setData(prev => [...prev.slice(-59), latestData])
                    setError(null)
                    return
                }

                // fallback to generated point when backend not available
                const newPoint = generatePoint(data[data.length - 1])
                setLatest(newPoint)
                setData(prev => [...prev.slice(-59), newPoint])
            } catch (err) {
                setError(err.message)
                const newPoint = generatePoint(data[data.length - 1])
                setLatest(newPoint)
                setData(prev => [...prev.slice(-59), newPoint])
            }
        }

        const interval = setInterval(() => { void tick() }, 1000)
        // run immediately once
        void tick()

        return () => { mounted = false; clearInterval(interval) }
    }, [paused])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Control bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: paused ? '#f87171' : '#4ade80', boxShadow: `0 0 8px ${paused ? '#f87171' : '#4ade80'}`, animation: paused ? 'none' : 'pulse-glow 1s ease-in-out infinite' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: paused ? '#f87171' : '#4ade80' }}>{paused ? 'PAUSED' : 'STREAMING LIVE — 1s interval'}</span>
                </div>
                <button onClick={() => setPaused(p => !p)} style={{
                    padding: '7px 16px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)',
                    border: '1px solid', cursor: 'pointer',
                    background: paused ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                    borderColor: paused ? '#4ade80' : '#f87171',
                    color: paused ? '#4ade80' : '#f87171',
                }}>
                    {paused ? '▶ RESUME' : '⏸ PAUSE'}
                </button>
            </div>

            {/* Live metrics top */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { label: 'DAYA', value: latest.daya, unit: 'W', color: '#22d3ee', warn: latest.daya > 2500 },
                    { label: 'TEGANGAN', value: latest.tegangan, unit: 'V', color: '#4ade80', warn: latest.tegangan < 210 || latest.tegangan > 230 },
                    { label: 'ARUS', value: latest.arus, unit: 'A', color: '#facc15', warn: latest.arus > 15 },
                    { label: 'FREKUENSI', value: latest.frekuensi, unit: 'Hz', color: '#a78bfa', warn: latest.frekuensi < 49.5 || latest.frekuensi > 50.5 },
                ].map(m => (
                    <div key={m.label} style={{
                        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                        border: `1px solid ${m.warn ? 'rgba(248,113,113,0.4)' : `${m.color}33`}`,
                        boxShadow: `inset 0 0 30px ${m.warn ? 'rgba(248,113,113,0.08)' : `${m.color}0d`}`,
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 10 }}>{m.label}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: m.warn ? '#f87171' : m.color, lineHeight: 1 }}>
                            {m.value}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{m.unit}</div>
                        {m.warn && (
                            <div style={{ position: 'absolute', top: 12, right: 12 }}>
                                <Badge type="error">ANOMALI</Badge>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Gauges */}
            <Panel title="Gauge Panel Real-Time">
                <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
                    <GaugeRing value={latest.daya} max={3000} label="Daya" unit="W" color="#22d3ee" size={140} />
                    <GaugeRing value={latest.tegangan} max={240} label="Tegangan" unit="V" color="#4ade80" size={140} />
                    <GaugeRing value={latest.arus} max={20} label="Arus" unit="A" color="#facc15" size={140} />
                    <GaugeRing value={latest.frekuensi} max={60} label="Frekuensi" unit="Hz" color="#a78bfa" size={140} />
                </div>
            </Panel>

            {/* Rolling charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Panel title="Daya (W) — Live">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} interval={9} />
                            <YAxis domain={['auto', 'auto']} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="daya" stroke="#22d3ee" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Daya" />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Tegangan (V) — Live">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} interval={9} />
                            <YAxis domain={[205, 235]} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="tegangan" stroke="#4ade80" strokeWidth={1.5} dot={false} isAnimationActive={false} name="Tegangan" />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>
        </div>
    )
}