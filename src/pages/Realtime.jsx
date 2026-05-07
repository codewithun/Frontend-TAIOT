/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Panel, GaugeRing, Badge } from '../components/UI.jsx'
import { getLatestPzem } from '../lib/api.js'

function toNumber(value, fallback = 0) {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

function formatRealtimePoint(payload = {}) {
    const raw = payload.raw || {}
    const source = raw.pzem || raw

    const pzem1 = source.pzem1 || {}
    const pzem2 = source.pzem2 || {}

    const p1Power = toNumber(pzem1.power, toNumber(payload.power || payload.power_w, 0))
    const p2Power = toNumber(pzem2.power, 0)
    const p1Voltage = toNumber(pzem1.voltage, toNumber(payload.voltage, 0))
    const p2Voltage = toNumber(pzem2.voltage, 0)
    const p1Current = toNumber(pzem1.current, toNumber(payload.current, 0))
    const p2Current = toNumber(pzem2.current, 0)
    const p1Frequency = toNumber(pzem1.frequency, toNumber(payload.frequency, 0))
    const p2Frequency = toNumber(pzem2.frequency, 0)

    return {
        time: new Date(payload.serverTimestamp || payload.timestamp || Date.now()).toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        }),
        pzem1_daya: p1Power,
        pzem2_daya: p2Power,
        pzem1_tegangan: p1Voltage,
        pzem2_tegangan: p2Voltage,
        pzem1_arus: p1Current,
        pzem2_arus: p2Current,
        pzem1_frekuensi: p1Frequency,
        pzem2_frekuensi: p2Frequency,
        total_daya: p1Power + p2Power,
        avg_tegangan: (p1Voltage + p2Voltage) / (p2Voltage > 0 ? 2 : 1),
        total_arus: p1Current + p2Current,
        avg_frekuensi: (p1Frequency + p2Frequency) / (p2Frequency > 0 ? 2 : 1),
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
    const [data, setData] = useState([])
    const [latest, setLatest] = useState({
        pzem1_daya: 0,
        pzem2_daya: 0,
        pzem1_tegangan: 0,
        pzem2_tegangan: 0,
        pzem1_arus: 0,
        pzem2_arus: 0,
        pzem1_frekuensi: 0,
        pzem2_frekuensi: 0,
        total_daya: 0,
        avg_tegangan: 0,
        total_arus: 0,
        avg_frekuensi: 0,
    })
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
                    const latestData = formatRealtimePoint(res.data)
                    setLatest(latestData)
                    setData(prev => [...prev.slice(-59), latestData])
                    setError(null)
                    return
                }
            } catch (err) {
                setError(err.message)
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
                    {error && <Badge type="error">BACKEND OFFLINE</Badge>}
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
                    { label: 'DAYA TOTAL', value: latest.total_daya, unit: 'W', color: '#22d3ee', warn: latest.total_daya > 3000 },
                    { label: 'TEGANGAN AVG', value: latest.avg_tegangan, unit: 'V', color: '#4ade80', warn: latest.avg_tegangan > 0 && (latest.avg_tegangan < 210 || latest.avg_tegangan > 230) },
                    { label: 'ARUS TOTAL', value: latest.total_arus, unit: 'A', color: '#facc15', warn: latest.total_arus > 16 },
                    { label: 'FREKUENSI AVG', value: latest.avg_frekuensi, unit: 'Hz', color: '#a78bfa', warn: latest.avg_frekuensi > 0 && (latest.avg_frekuensi < 49.5 || latest.avg_frekuensi > 50.5) },
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Panel title="Gauge Panel PZEM1">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '8px 0' }}>
                        <GaugeRing value={latest.pzem1_daya} max={3000} label="PZEM1 Daya" unit="W" color="#22d3ee" size={120} />
                        <GaugeRing value={latest.pzem1_tegangan} max={250} label="PZEM1 Tegangan" unit="V" color="#4ade80" size={120} />
                        <GaugeRing value={latest.pzem1_arus} max={20} label="PZEM1 Arus" unit="A" color="#fbbf24" size={120} />
                    </div>
                </Panel>

                <Panel title="Gauge Panel PZEM2">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '8px 0' }}>
                        <GaugeRing value={latest.pzem2_daya} max={3000} label="PZEM2 Daya" unit="W" color="#38bdf8" size={120} />
                        <GaugeRing value={latest.pzem2_tegangan} max={250} label="PZEM2 Tegangan" unit="V" color="#10b981" size={120} />
                        <GaugeRing value={latest.pzem2_arus} max={20} label="PZEM2 Arus" unit="A" color="#fbbf24" size={120} />
                    </div>
                </Panel>
            </div>

            {/* Rolling charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Panel title="Daya PZEM1 vs PZEM2 (W)">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} interval={9} />
                            <YAxis domain={['auto', 'auto']} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="pzem1_daya" stroke="#22d3ee" strokeWidth={1.5} dot={false} isAnimationActive={false} name="PZEM1 Daya" />
                            <Line type="monotone" dataKey="pzem2_daya" stroke="#38bdf8" strokeWidth={1.5} dot={false} isAnimationActive={false} name="PZEM2 Daya" />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>

                <Panel title="Tegangan PZEM1 vs PZEM2 (V)">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} interval={9} />
                            <YAxis domain={[205, 235]} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Share Tech Mono' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="pzem1_tegangan" stroke="#4ade80" strokeWidth={1.5} dot={false} isAnimationActive={false} name="PZEM1 Tegangan" />
                            <Line type="monotone" dataKey="pzem2_tegangan" stroke="#86efac" strokeWidth={1.5} dot={false} isAnimationActive={false} name="PZEM2 Tegangan" />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>
        </div>
    )
}