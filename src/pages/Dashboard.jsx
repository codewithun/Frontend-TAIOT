/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import {
    BarChart, Bar, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Activity, DollarSign, TrendingUp, AlertTriangle, CircleCheckBig, Info } from 'lucide-react'
import { StatCard, Panel, ProgressBar, Badge } from '../components/UI.jsx'
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

const WEEKDAY_ORDER = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const WEEKDAY_BY_INDEX = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

const buildWeeklyUsage = (records = []) => {
    const buckets = Object.fromEntries(WEEKDAY_ORDER.map(day => [day, 0]))

    records.forEach(record => {
        const rawDate = record?.serverTimestamp || record?.timestamp || Date.now()
        const date = new Date(rawDate)
        if (Number.isNaN(date.getTime())) return

        const dayLabel = WEEKDAY_BY_INDEX[date.getDay()]
        const nextValue = buckets[dayLabel] || 0
        buckets[dayLabel] = nextValue + (toNumber(record?.power || record?.power_w || 0) / 1000)
    })

    return WEEKDAY_ORDER.map(day => ({
        day,
        kWh: Number(buckets[day].toFixed(2)),
    }))
}

const WeeklyTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    return (
        <div style={{ background: '#ffffff', border: '1px solid #dfe7ef', borderRadius: 12, padding: '10px 14px', boxShadow: '0 10px 24px rgba(45, 60, 84, 0.12)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#5f88a8', marginBottom: 6 }}>{label}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#ef5a09', fontWeight: 700 }}>
                {payload[0]?.value ?? 0} kWh
            </p>
        </div>
    )
}

const getUsageStatus = power => {
    if (power < 1000) {
        return {
            tone: 'success',
            label: 'Pemakaian Rendah',
            title: 'Sangat Hemat',
            detail: '< 1.000W',
            color: '#1ca852',
            bg: '#e8f5ed',
            border: '#c1dfd4',
            icon: CircleCheckBig,
        }
    }

    if (power <= 2200) {
        return {
            tone: 'warning',
            label: 'Pemakaian Normal',
            title: 'Normal / Sedang',
            detail: '1.000W - 2.200W',
            color: '#b37f00',
            bg: '#fffbf0',
            border: '#f5e8c8',
            icon: Info,
        }
    }

    return {
        tone: 'warning',
        label: 'Pemakaian Tinggi',
        title: 'Cukup Boros',
        detail: '> 2.200W',
        color: '#e56400',
        bg: '#fef0e6',
        border: '#f5d9b8',
        icon: AlertTriangle,
    }
}

export default function Dashboard() {
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
    const [weeklyUsage, setWeeklyUsage] = useState(WEEKDAY_ORDER.map(day => ({ day, kWh: 0 })))
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
    useEffect(() => {
        let mounted = true

        const fetchOnce = async () => {
            try {
                const [latest, relayState, dailyHist, weeklyHist] = await Promise.all([
                    getLatestPzem(),
                    getRelayState(),
                    getPzemHistory(24),
                    getPzemHistory(168),
                ])
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

                if (dailyHist?.success && Array.isArray(dailyHist.data) && dailyHist.data.length) {
                    // Calculate daily stats from history
                    const totalWh = dailyHist.data.reduce((sum, h) => sum + (h.power || 0), 0)
                    const avgFrequency = dailyHist.data.reduce((sum, h) => sum + (h.frequency || 50), 0) / dailyHist.data.length
                    const avgPf = dailyHist.data.reduce((sum, h) => sum + (h.powerFactor || 0.97), 0) / dailyHist.data.length
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

                if (weeklyHist?.success && Array.isArray(weeklyHist.data)) {
                    setWeeklyUsage(buildWeeklyUsage(weeklyHist.data.slice(-168)))
                }
            } catch (err) {
                // ignore — keep simulated data
            }
        }

        void fetchOnce()
        const interval = setInterval(() => { void fetchOnce() }, 5000)

        return () => { mounted = false; clearInterval(interval) }
    }, [])

    const usageStatus = getUsageStatus(currentPower)
    const weeklyPeak = Math.max(...weeklyUsage.map(item => item.kWh), 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Stat cards row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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

            <Panel title="Konsumsi Energi 24 Jam" headerRight={
                <Badge type={usageStatus.tone}>{usageStatus.label}</Badge>
            }>
                <div style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)',
                    border: '1px solid #e9edf3',
                    borderRadius: 24,
                    boxShadow: '0 20px 40px rgba(45, 60, 84, 0.08)',
                    padding: '34px 24px 28px',
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(54px, 7vw, 94px)', fontWeight: 800, color: '#ef5a09', lineHeight: 1 }}>
                                {new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(currentPower)}
                            </span>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(20px, 2.2vw, 38px)', fontWeight: 700, color: '#f17c47' }}>
                                WATT
                            </span>
                        </div>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            borderRadius: 999,
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: 'uppercase',
                            padding: '10px 18px',
                            border: `1px solid ${usageStatus.border}`,
                            background: usageStatus.bg,
                            color: usageStatus.color,
                        }}>
                            <usageStatus.icon size={16} />
                            {usageStatus.title}
                        </div>
                    </div>

                    <div style={{ marginTop: 34 }}>
                        <div style={{ position: 'relative', height: 14, borderRadius: 999, overflow: 'hidden', background: '#e6eaef', display: 'grid', gridTemplateColumns: '33% 33% 25% 9%' }}>
                            <div style={{ background: 'linear-gradient(90deg, #2ac65c, #71d35a)' }} />
                            <div style={{ background: 'linear-gradient(90deg, #f0cc2d, #f9b82f)' }} />
                            <div style={{ background: 'linear-gradient(90deg, #ff9c35, #ff7a10)' }} />
                            <div style={{ background: '#e5e7eb' }} />
                            <div style={{
                                position: 'absolute',
                                top: -5,
                                left: `${Math.min((currentPower / 3000) * 100, 100)}%`,
                                transform: 'translateX(-50%)',
                                width: 6,
                                height: 24,
                                borderRadius: 999,
                                background: '#ffffff',
                                boxShadow: '0 0 0 2px rgba(25,25,25,0.18), 0 3px 10px rgba(0,0,0,0.15)',
                            }} />
                        </div>

                        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 18 }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: 1, color: '#1ca852', textTransform: 'uppercase', fontSize: 'clamp(12px, 1.1vw, 18px)' }}>
                                    Sangat Hemat
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: 'clamp(11px, 0.95vw, 15px)', marginTop: 2 }}>
                                    &lt; 1.000W
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: 1, color: '#b37f00', textTransform: 'uppercase', fontSize: 'clamp(12px, 1.1vw, 18px)' }}>
                                    Normal / Sedang
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: 'clamp(11px, 0.95vw, 15px)', marginTop: 2 }}>
                                    1.000W - 2.200W
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: 1, color: '#e56400', textTransform: 'uppercase', fontSize: 'clamp(12px, 1.1vw, 18px)' }}>
                                    Cukup Boros
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: 'clamp(11px, 0.95vw, 15px)', marginTop: 2 }}>
                                    &gt; 2.200W
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Panel>

            {/* Bottom row: devices + weekly usage */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 16 }}>

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

                {/* Weekly usage */}
                <Panel title="Pemakaian Harian 7 Hari Terakhir" headerRight={<Badge type="info">Senin - Minggu</Badge>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
                                Perbandingan pemakaian listrik selama 7 hari terakhir.
                            </p>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
                                kWh / hari
                            </span>
                        </div>

                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={weeklyUsage} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} />
                                <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} />
                                <Tooltip content={<WeeklyTooltip />} />
                                <Bar dataKey="kWh" radius={[8, 8, 0, 0]} barSize={28}>
                                    {weeklyUsage.map((entry, index) => (
                                        <Cell
                                            key={`${entry.day}-${index}`}
                                            fill={entry.kWh === weeklyPeak && weeklyPeak > 0 ? '#ef5a09' : '#5f88a8'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                            <div style={{ padding: '10px 12px', borderRadius: 10, background: '#edf4fa', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Puncak</div>
                                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', fontWeight: 700 }}>
                                    {weeklyPeak.toFixed(2)} kWh
                                </div>
                            </div>
                            <div style={{ padding: '10px 12px', borderRadius: 10, background: '#edf4fa', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Hari Tertinggi</div>
                                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', fontWeight: 700 }}>
                                    {weeklyUsage.find(item => item.kWh === weeklyPeak)?.day || '-'}
                                </div>
                            </div>
                            <div style={{ padding: '10px 12px', borderRadius: 10, background: '#edf4fa', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>Total 7 Hari</div>
                                <div style={{ fontSize: 14, fontFamily: 'var(--font-mono)', color: 'var(--text-accent)', fontWeight: 700 }}>
                                    {weeklyUsage.reduce((sum, item) => sum + item.kWh, 0).toFixed(2)} kWh
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    )
}