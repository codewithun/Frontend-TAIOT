import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Zap } from 'lucide-react'
import { Panel, Badge } from '../components/UI.jsx'
import { getLatestPzem } from '../lib/api.js'

function toNumber(value, fallback = 0) {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

function formatDisplayNumber(value, maxDecimals = 3) {
    const n = Number(value)
    if (!Number.isFinite(n)) return '0'

    const fixed = n.toFixed(maxDecimals)
    return fixed.replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1')
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
        pzem1: {
            voltage: p1Voltage,
            current: p1Current,
            power: p1Power,
            energy: toNumber(pzem1.energy, 0),
            frequency: p1Frequency,
            powerFactor: toNumber(pzem1.powerFactor ?? pzem1.pf, 0.97),
            ok: Boolean(pzem1.ok),
        },
        pzem2: {
            voltage: p2Voltage,
            current: p2Current,
            power: p2Power,
            energy: toNumber(pzem2.energy, 0),
            frequency: p2Frequency,
            powerFactor: toNumber(pzem2.powerFactor ?? pzem2.pf, 0.97),
            ok: Boolean(pzem2.ok),
        },
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

const formatCardNumber = (value, digits = 1) => {
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return '0'
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(parsed)
}

const getPzemCardReading = (latest = {}, key = 'pzem1') => {
    const source = latest?.[key] || {}
    return {
        voltage: toNumber(source.voltage ?? 0, 0),
        current: toNumber(source.current ?? 0, 0),
        power: toNumber(source.power ?? 0, 0),
        energy: toNumber(source.energy ?? 0, 0),
        frequency: toNumber(source.frequency ?? 0, 50),
        powerFactor: toNumber(source.powerFactor ?? 0.97, 0.97),
        ok: Boolean(source.ok),
    }
}

const PzemMetric = ({ label, value, unit, digits = 1, accent = '#5f88a8', valueColor = accent }) => (
    <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 6 }}>
            {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(24px, 2.2vw, 34px)',
                fontWeight: 800,
                lineHeight: 1,
                color: valueColor,
            }}>
                {formatCardNumber(value, digits)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#111111', letterSpacing: 0.5 }}>
                {unit}
            </span>
        </div>
    </div>
)

const PzemCard = ({ title, subtitle, icon: Icon, reading }) => {
    const live = reading?.ok ? 'LIVE' : 'STANDBY'
    return (
        <div style={{
            position: 'relative',
            borderRadius: 18,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-card)',
            minHeight: 280,
        }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(95,136,168,0.08), transparent 36%)', pointerEvents: 'none' }} />

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                padding: '18px 18px 16px',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                    <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 15,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(180deg, #f8fbfd, #edf4fa)',
                        border: '1px solid #d6e2ee',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), 0 8px 18px rgba(95,136,168,0.10)',
                        color: '#5f88a8',
                        flexShrink: 0,
                    }}>
                        <Icon size={24} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: '#111111', letterSpacing: 0.6 }}>
                            {title}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111111', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                            {subtitle}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 14px',
                    borderRadius: 999,
                    background: '#edf4fa',
                    border: '1px solid #d6e2ee',
                    color: '#111111',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    letterSpacing: 1.1,
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 12px rgba(95,136,168,0.08)',
                }}>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#111111', boxShadow: '0 0 0 4px rgba(17,17,17,0.12)', animation: 'pulse-glow 1.8s ease-in-out infinite' }} />
                    {live}
                </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1, padding: 18 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
                    <PzemMetric label="Tegangan" value={reading.voltage} unit="V" digits={1} valueColor="#111111" />
                    <PzemMetric label="Arus" value={reading.current} unit="A" digits={2} valueColor="#111111" />
                    <PzemMetric label="Daya Aktif" value={reading.power} unit="W" digits={0} valueColor="#111111" />
                </div>

                <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
                    <PzemMetric label="Energi" value={reading.energy} unit="kWh" digits={1} valueColor="#111111" />
                    <PzemMetric label="Frekuensi" value={reading.frequency} unit="Hz" digits={2} valueColor="#111111" />
                    <PzemMetric label="Faktor Daya" value={reading.powerFactor} unit="PF" digits={2} valueColor="#111111" />
                </div>
            </div>
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
    const pzem1Reading = getPzemCardReading(latest, 'pzem1')
    const pzem2Reading = getPzemCardReading(latest, 'pzem2')

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
                            {formatDisplayNumber(m.value)}
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

            {/* PZEM cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <PzemCard
                    title="PZEM 01"
                    icon={Zap}
                    reading={pzem1Reading}
                />

                <PzemCard
                    title="PZEM 02"
                    icon={Zap}
                    reading={pzem2Reading}
                />
            </div>

            {/* Rolling charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Panel title="Daya PZEM1 vs PZEM2 (W)">
                    <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Inter' }} interval={9} />
                            <YAxis domain={['auto', 'auto']} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Inter' }} />
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
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Inter' }} interval={9} />
                            <YAxis domain={[205, 235]} tick={{ fill: '#475569', fontSize: 9, fontFamily: 'Inter' }} />
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