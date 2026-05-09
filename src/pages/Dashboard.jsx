/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import {
    AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Zap, Activity, DollarSign, Leaf, TrendingUp } from 'lucide-react'
import { StatCard, Panel, GaugeRing, ProgressBar, Badge } from '../components/UI.jsx'
import { generateAlerts } from '../data/mockData.js'
import { getLatestPzem, getPzemHistory, getRelayState } from '../lib/api.js'

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

const readPzemMetric = (pzem = {}, keys = [], fallback = 0) => {
    for (const key of keys) {
        const value = pzem?.[key]
        if (value !== undefined && value !== null && value !== '') {
            return toNumber(value, fallback)
        }
    }
    return fallback
}

const extractLivePzemMetrics = (data = {}) => {
    const payload = data?.raw && typeof data.raw === 'object' ? data.raw : data
    const root = payload?.pzem && typeof payload.pzem === 'object' ? payload.pzem : payload
    const pzem1 = root?.pzem1 || payload?.pzem1 || {}
    const pzem2 = root?.pzem2 || payload?.pzem2 || {}

    const pzem1Power = readPzemMetric(pzem1, ['power', 'power_w', 'daya', 'p'])
    const pzem2Power = readPzemMetric(pzem2, ['power', 'power_w', 'daya', 'p'])
    const fallbackPower = readPzemMetric(root, ['total_daya', 'power', 'power_w', 'daya', 'p'])
    const totalPower = pzem1Power + pzem2Power || fallbackPower

    const pzem1Voltage = readPzemMetric(pzem1, ['voltage', 'tegangan', 'v'])
    const pzem2Voltage = readPzemMetric(pzem2, ['voltage', 'tegangan', 'v'])
    const averageVoltage = pzem1Voltage && pzem2Voltage
        ? (pzem1Voltage + pzem2Voltage) / 2
        : pzem1Voltage || pzem2Voltage || readPzemMetric(root, ['avg_tegangan', 'voltage', 'tegangan', 'v'])

    const pzem1Current = readPzemMetric(pzem1, ['current', 'arus', 'i'])
    const pzem2Current = readPzemMetric(pzem2, ['current', 'arus', 'i'])
    const totalCurrent = pzem1Current + pzem2Current || readPzemMetric(root, ['total_arus', 'current', 'arus', 'i']) || (averageVoltage ? totalPower / averageVoltage : 0)

    const pzem1Frequency = readPzemMetric(pzem1, ['frequency', 'frekuensi', 'f'])
    const pzem2Frequency = readPzemMetric(pzem2, ['frequency', 'frekuensi', 'f'])
    const frequency = pzem1Frequency && pzem2Frequency
        ? (pzem1Frequency + pzem2Frequency) / 2
        : pzem1Frequency || pzem2Frequency || readPzemMetric(root, ['avg_frekuensi', 'frequency', 'frekuensi', 'f'], 50)

    const pzem1PowerFactor = readPzemMetric(pzem1, ['powerFactor', 'pf', 'factor'], 0.97)
    const pzem2PowerFactor = readPzemMetric(pzem2, ['powerFactor', 'pf', 'factor'], 0.97)
    const powerFactor = pzem1PowerFactor && pzem2PowerFactor
        ? (pzem1PowerFactor + pzem2PowerFactor) / 2
        : pzem1PowerFactor || pzem2PowerFactor || readPzemMetric(root, ['powerFactor', 'pf', 'factor'], 0.97)

    return {
        totalPower,
        averageVoltage,
        totalCurrent,
        frequency,
        powerFactor,
        pzem1Power,
        pzem2Power,
        pzem1Voltage,
        pzem2Voltage,
        pzem1Current,
        pzem2Current,
    }
}

const buildRelayDevices = (relayState = {}, live = {}) => {
    const relay1On = Boolean(relayState.relay1)
    const relay2On = Boolean(relayState.relay2)
    const relay1Power = readPzemMetric(live, ['pzem1Power'], 0)
    const relay2Power = readPzemMetric(live, ['pzem2Power'], 0)

    return [
        {
            id: 'relay-1',
            nama: 'Relay 1',
            ruang: 'Channel 1',
            daya: relay1Power,
            status: relay1On ? 'aktif' : 'nonaktif',
            jam: relay1On ? 1 : 0,
            warna: relay1On ? '#4ade80' : '#f87171',
        },
        {
            id: 'relay-2',
            nama: 'Relay 2',
            ruang: 'Channel 2',
            daya: relay2Power,
            status: relay2On ? 'aktif' : 'nonaktif',
            jam: relay2On ? 1 : 0,
            warna: relay2On ? '#22d3ee' : '#f87171',
        },
    ]
}

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
    const [hourly, setHourly] = useState([])
    const [currentPower, setCurrentPower] = useState(0)
    const [currentCurrent, setCurrentCurrent] = useState(0)
    const [voltage, setVoltage] = useState(0)
    const [electricalMetrics, setElectricalMetrics] = useState({
        totalPower: 0,
        totalCurrent: 0,
        averageVoltage: 0,
        frequency: 50,
        powerFactor: 0.97,
    })
    const [relayDevices, setRelayDevices] = useState([])
    const [backendAvailable, setBackendAvailable] = useState(false)
    const [stats, setStats] = useState({
        dayKwh: 0,
        monthKwh: 0,
        frequency: 50,
        powerFactor: 0.97,
        totalBiayaBulan: 0,
        efficiency: 0,
        co2: 0,
        dayTarget: 22,
        monthTarget: 450,
    })
    const alerts = generateAlerts()

    useEffect(() => {
        let mounted = true

        const fetchOnce = async () => {
            try {
                const [latest, relayState] = await Promise.all([getLatestPzem(), getRelayState()])
                if (!mounted) return
                if (latest?.success && latest.data) {
                    setBackendAvailable(true)
                    const live = extractLivePzemMetrics(latest.data)
                    setCurrentPower(live.totalPower)
                    setCurrentCurrent(live.totalCurrent)
                    setVoltage(live.averageVoltage)
                    setElectricalMetrics({
                        totalPower: live.totalPower,
                        totalCurrent: live.totalCurrent,
                        averageVoltage: live.averageVoltage,
                        frequency: live.frequency,
                        powerFactor: live.powerFactor,
                    })
                    setRelayDevices(buildRelayDevices(relayState?.success ? relayState : {}, live))
                    setStats(prev => ({
                        ...prev,
                        frequency: live.frequency,
                        powerFactor: live.powerFactor,
                    }))
                }

                const hist = await getPzemHistory(24)
                if (!mounted) return
                if (hist?.success && Array.isArray(hist.data)) {
                    // Convert history into hourly-like array and calculate stats
                    const mapped = hist.data.slice(-24).map(h => ({
                        time: new Date(h.serverTimestamp || h.timestamp || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                        konsumsi: Math.round(h.power || h.power_w || 0),
                        biaya: Math.round((h.power || 0) * 1.444),
                        tegangan: Math.round(h.voltage || 0),
                        arus: parseFloat(((h.power || 0) / 220).toFixed(2)),
                    }))
                    if (mapped.length) setHourly(mapped)

                    // Calculate daily stats from history
                    const totalWh = hist.data.reduce((sum, h) => sum + (h.power || 0), 0)
                    const avgFrequency = hist.data.reduce((sum, h) => sum + (h.frequency || 50), 0) / hist.data.length
                    const avgPf = hist.data.reduce((sum, h) => sum + (h.powerFactor || 0.97), 0) / hist.data.length
                    const dailyKwh = (totalWh / 1000).toFixed(1)
                    const dailyCost = Math.round(totalWh * 1.444 / 1000)

                    setStats(prev => ({
                        ...prev,
                        dayKwh: parseFloat(dailyKwh),
                        totalBiayaBulan: Math.round(dailyKwh * 30 * 1.444),
                        monthKwh: parseFloat(dailyKwh) * 30,
                        efficiency: Math.max(90, Math.min(99, 94 + (Math.random() - 0.5) * 5)),
                        co2: parseFloat((dailyKwh * 0.3).toFixed(2)),
                    }))
                }
            } catch (err) {
                // ignore — keep simulated data
            }
        }

        void fetchOnce()
        const interval = setInterval(() => { void fetchOnce() }, 5000)

        return () => { mounted = false; clearInterval(interval) }
    }, [])

    const alertColors = { warning: 'warning', info: 'info', success: 'success', error: 'error' }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <StatCard
                    label="Daya Saat Ini"
                    value={currentPower}
                    unit="W"
                    sub="PZEM 1 + PZEM 2"
                    color="cyan"
                    icon={Zap}
                    trend={5.2}
                />
                <StatCard
                    label="Konsumsi Hari Ini"
                    value={stats.dayKwh}
                    unit="kWh"
                    sub={`Target: ${stats.dayTarget} kWh`}
                    color="green"
                    icon={Activity}
                    trend={-3.1}
                />
                <StatCard
                    label="Biaya Bulan Ini"
                    value={`${(stats.totalBiayaBulan).toLocaleString('id-ID')}`}
                    unit="rb"
                    sub={`${stats.monthKwh.toFixed(1)} kWh terpakai`}
                    color="yellow"
                    icon={DollarSign}
                />
                <StatCard
                    label="Efisiensi"
                    value={Math.round(stats.efficiency)}
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
                        <GaugeRing value={electricalMetrics.averageVoltage || voltage} max={240} label="Tegangan" unit="V" color="#22d3ee" size={110} />
                        <GaugeRing value={electricalMetrics.totalCurrent || currentCurrent} max={20} label="Arus" unit="A" color="#4ade80" size={110} />
                        <GaugeRing value={electricalMetrics.frequency} max={60} label="Frekuensi" unit="Hz" color="#facc15" size={110} />
                        <GaugeRing value={electricalMetrics.powerFactor * 100} max={100} label="Power Factor" unit="PF" color="#a78bfa" size={110} />
                    </div>
                </Panel>
            </div>

            {/* Bottom row: devices + alerts + monthly progress */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 320px', gap: 16 }}>

                {/* Top perangkat */}
                <Panel title="Perangkat Teratas">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {(relayDevices.length ? relayDevices : [
                            { id: 'relay-1', nama: 'Relay 1', ruang: 'Channel 1', daya: 0, status: 'nonaktif', warna: '#f87171' },
                            { id: 'relay-2', nama: 'Relay 2', ruang: 'Channel 2', daya: 0, status: 'nonaktif', warna: '#f87171' },
                        ]).map(p => (
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
                                {stats.monthKwh.toFixed(1)}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>kWh bulan ini</div>
                        </div>

                        <ProgressBar value={stats.monthKwh} max={stats.monthTarget} color="#facc15" label="Target Bulan Ini" valueLabel={`${stats.monthKwh.toFixed(1)}/${stats.monthTarget} kWh`} />

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                { label: 'Estimasi Tagihan', value: `Rp ${stats.totalBiayaBulan.toLocaleString('id-ID')}`, color: '#facc15' },
                                { label: 'Penghematan vs Bulan Lalu', value: '- Rp 43.000', color: '#4ade80' },
                                { label: 'Emisi CO₂', value: `${stats.co2} ton`, color: '#94a3b8' },
                                { label: 'Efisiensi', value: `${Math.round(stats.efficiency)}%`, color: '#a78bfa' },
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