/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Zap, Activity, DollarSign, Leaf, TrendingUp } from 'lucide-react'
import { StatCard, Panel, GaugeRing, ProgressBar, Badge } from '../components/UI.jsx'
import { generateHourlyData, kwhStats, generateAlerts, perangkat } from '../data/mockData.js'
import { getLatestPzem, getPzemHistory } from '../lib/api.js'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#0d1220', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#22d3ee', marginBottom: 6 }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ fontSize: 12, color: p.color, fontFamily: 'var(--font-mono)' }}>
                    {p.name}: {p.value} {p.name === 'konsumsi' ? 'W' : p.name === 'biaya' ? 'Rp' : ''}
                </p>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const [hourly, setHourly] = useState(() => generateHourlyData())
    const [currentPower, setCurrentPower] = useState(kwhStats.current * 220)
    const [voltage, setVoltage] = useState(kwhStats.voltage)
    const [backendAvailable, setBackendAvailable] = useState(false)
    const alerts = generateAlerts()

    useEffect(() => {
        // Try fetch real data from backend; fall back to simulated updates
        let mounted = true

        const fetchOnce = async () => {
            try {
                const latest = await getLatestPzem()
                if (!mounted) return
                if (latest?.success && latest.data) {
                    setBackendAvailable(true)
                    const d = latest.data
                    setCurrentPower(Math.round(d.power || d.power_w || 0))
                    setVoltage(Math.round(d.voltage || 0))
                }

                const hist = await getPzemHistory(24)
                if (!mounted) return
                if (hist?.success && Array.isArray(hist.data)) {
                    // Convert history into hourly-like array (most recent first)
                    const mapped = hist.data.slice(-24).map(h => ({
                        time: new Date(h.serverTimestamp || h.timestamp || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        konsumsi: Math.round(h.power || h.power_w || 0),
                        biaya: Math.round((h.power || 0) * 1.444),
                        tegangan: Math.round(h.voltage || 0),
                        arus: parseFloat(((h.power || 0) / 220).toFixed(2)),
                    }))
                    if (mapped.length) setHourly(mapped)
                }
            } catch (err) {
                // ignore — keep simulated data
            }
        }

        void fetchOnce()

        // keep simulating small deltas when backend not available
        const interval = setInterval(() => {
            if (backendAvailable) return
            setCurrentPower(prev => {
                const delta = (Math.random() - 0.5) * 20
                return Math.max(800, Math.min(2800, prev + delta))
            })
            setVoltage(prev => {
                const delta = (Math.random() - 0.5) * 2
                return Math.max(210, Math.min(230, prev + delta))
            })
        }, 2000)

        return () => { mounted = false; clearInterval(interval) }
    }, [])

    const alertColors = { warning: 'warning', info: 'info', success: 'success', error: 'error' }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <StatCard
                    label="Daya Saat Ini"
                    value={Math.round(currentPower)}
                    unit="W"
                    sub="Konsumsi real-time"
                    color="cyan"
                    icon={Zap}
                    trend={5.2}
                />
                <StatCard
                    label="Konsumsi Hari Ini"
                    value={kwhStats.dayKwh}
                    unit="kWh"
                    sub={`Target: ${kwhStats.dayTarget} kWh`}
                    color="green"
                    icon={Activity}
                    trend={-3.1}
                />
                <StatCard
                    label="Biaya Bulan Ini"
                    value={`${(kwhStats.totalBiayaBulan).toLocaleString('id-ID')}`}
                    unit="rb"
                    sub={`${kwhStats.monthKwh} kWh terpakai`}
                    color="yellow"
                    icon={DollarSign}
                />
                <StatCard
                    label="Efisiensi"
                    value={kwhStats.efficiency}
                    unit="%"
                    sub="Di atas target 90%"
                    color="purple"
                    icon={TrendingUp}
                />
            </div>

            {/* Main row: chart + gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

                {/* Area Chart konsumsi */}
                <Panel title="Konsumsi Energi 24 Jam" headerRight={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Badge type="info">Watt</Badge>
                        <Badge type="success">Hari Ini</Badge>
                    </div>
                }>
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={hourly} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <defs>
                                <linearGradient id="gradCyan" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono' }} interval={3} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Share Tech Mono' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={250} stroke="#facc15" strokeDasharray="4 4" strokeOpacity={0.5} />
                            <Area type="monotone" dataKey="konsumsi" stroke="#22d3ee" strokeWidth={2} fill="url(#gradCyan)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </Panel>

                {/* Gauges */}
                <Panel title="Parameter Listrik">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, justifyItems: 'center' }}>
                        <GaugeRing value={Math.round(voltage)} max={240} label="Tegangan" unit="V" color="#22d3ee" size={110} />
                        <GaugeRing value={parseFloat((currentPower / 220).toFixed(1))} max={20} label="Arus" unit="A" color="#4ade80" size={110} />
                        <GaugeRing value={kwhStats.frequency} max={60} label="Frekuensi" unit="Hz" color="#facc15" size={110} />
                        <GaugeRing value={kwhStats.powerFactor * 100} max={100} label="Power Factor" unit="PF" color="#a78bfa" size={110} />
                    </div>
                </Panel>
            </div>

            {/* Bottom row: devices + alerts + monthly progress */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16 }}>

                {/* Top perangkat */}
                <Panel title="Perangkat Teratas">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {perangkat.slice(0, 5).map(p => (
                            <div key={p.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div>
                                        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{p.nama}</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 8 }}>{p.ruang}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: p.warna }}>{p.daya}W</span>
                                        <Badge type={p.status === 'aktif' ? 'success' : 'error'}>{p.status}</Badge>
                                    </div>
                                </div>
                                <ProgressBar value={p.daya} max={1500} color={p.warna} valueLabel={`${p.daya}W`} />
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Alerts */}
                <Panel title="Peringatan & Notifikasi">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {alerts.map(a => (
                            <div key={a.id} style={{
                                padding: '10px 14px', borderRadius: 8,
                                background: a.type === 'error' ? 'rgba(248,113,113,0.08)' : a.type === 'warning' ? 'rgba(250,204,21,0.08)' : a.type === 'success' ? 'rgba(74,222,128,0.08)' : 'rgba(34,211,238,0.08)',
                                border: `1px solid ${a.type === 'error' ? 'rgba(248,113,113,0.2)' : a.type === 'warning' ? 'rgba(250,204,21,0.2)' : a.type === 'success' ? 'rgba(74,222,128,0.2)' : 'rgba(34,211,238,0.2)'}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>{a.msg}</p>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.time}</span>
                                </div>
                                <Badge type={alertColors[a.type]}>{a.type}</Badge>
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Monthly summary */}
                <Panel title="Progres Bulanan">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, color: '#facc15', fontWeight: 700 }}>
                                {kwhStats.monthKwh}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>kWh bulan ini</div>
                        </div>

                        <ProgressBar value={kwhStats.monthKwh} max={kwhStats.monthTarget} color="#facc15" label="Target Bulan Ini" valueLabel={`${kwhStats.monthKwh}/${kwhStats.monthTarget} kWh`} />

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Estimasi Tagihan', value: 'Rp 596.000', color: '#facc15' },
                                { label: 'Penghematan vs Bulan Lalu', value: '- Rp 43.000', color: '#4ade80' },
                                { label: 'Emisi CO₂', value: `${kwhStats.co2} ton`, color: '#94a3b8' },
                                { label: 'Efisiensi', value: `${kwhStats.efficiency}%`, color: '#a78bfa' },
                            ].map(item => (
                                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</span>
                                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Leaf size={14} color="#4ade80" />
                            <span style={{ fontSize: 11, color: '#4ade80' }}>Dalam batas hemat energi!</span>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    )
}