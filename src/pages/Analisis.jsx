import { useState } from 'react'
import {
    Bar, LineChart, Line, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend, ReferenceLine
} from 'recharts'
import { Panel, Badge, ProgressBar } from '../components/UI.jsx'
import { generateDailyData, generateMonthlyData, perangkat } from '../data/mockData.js'

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#0d1220', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 8, padding: '10px 14px', minWidth: 140 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#22d3ee', marginBottom: 6 }}>{label}</p>
            {payload.map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, color: p.color, fontFamily: 'var(--font-mono)' }}>{p.name}</span>
                    <span style={{ fontSize: 11, color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{typeof p.value === 'number' ? p.value.toLocaleString('id-ID') : p.value}</span>
                </div>
            ))}
        </div>
    )
}

const periods = ['Harian', 'Mingguan', 'Bulanan']

export default function Analisis() {
    const [period, setPeriod] = useState('Mingguan')
    const daily = generateDailyData()
    const monthly = generateMonthlyData()

    // Distribusi konsumsi per perangkat
    const totalDaya = perangkat.reduce((s, p) => s + p.daya * p.jam, 0)
    const distribusi = perangkat.map(p => ({
        ...p,
        kwhPerHari: parseFloat(((p.daya * p.jam) / 1000).toFixed(2)),
        pct: Math.round((p.daya * p.jam / totalDaya) * 100),
    })).sort((a, b) => b.kwhPerHari - a.kwhPerHari)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Period selector */}
            <div style={{ display: 'flex', gap: 8 }}>
                {periods.map(p => (
                    <button key={p} onClick={() => setPeriod(p)} style={{
                        padding: '8px 18px', borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)',
                        letterSpacing: 1, cursor: 'pointer', border: '1px solid',
                        background: period === p ? 'rgba(34,211,238,0.15)' : 'transparent',
                        borderColor: period === p ? '#22d3ee' : 'var(--border)',
                        color: period === p ? '#22d3ee' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                    }}>
                        {p.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Bar chart mingguan */}
                <Panel title="Konsumsi per Hari (kWh)" headerRight={<Badge type="info">7 Hari</Badge>}>
                    <ResponsiveContainer width="100%" height={240}>
                        <ComposedChart data={daily} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={4500} stroke="#facc15" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'Target', fill: '#facc15', fontSize: 10 }} />
                            <Bar dataKey="konsumsi" fill="#22d3ee" fillOpacity={0.8} radius={[4, 4, 0, 0]} name="Konsumsi (Wh)" />
                            <Line type="monotone" dataKey="target" stroke="#facc15" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Target" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Panel>

                {/* Monthly trend */}
                <Panel title="Tren Konsumsi Bulanan" headerRight={<Badge type="success">2025</Badge>}>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={monthly} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} />
                            <YAxis tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: 'Inter', color: '#94a3b8' }} />
                            <Line type="monotone" dataKey="konsumsi" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3, fill: '#22d3ee' }} name="Tahun Ini" />
                            <Line type="monotone" dataKey="prevYear" stroke="#475569" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Tahun Lalu" />
                        </LineChart>
                    </ResponsiveContainer>
                </Panel>
            </div>

            {/* Distribusi + Insight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

                {/* Distribusi per perangkat */}
                <Panel title="Distribusi Konsumsi per Perangkat">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {distribusi.map(p => (
                            <div key={p.id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.warna, boxShadow: `0 0 6px ${p.warna}` }} />
                                        <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{p.nama}</span>
                                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.ruang}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{p.kwhPerHari} kWh/hari</span>
                                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: p.warna, minWidth: 36, textAlign: 'right' }}>{p.pct}%</span>
                                    </div>
                                </div>
                                <ProgressBar value={p.pct} max={100} color={p.warna} valueLabel={`${p.kwhPerHari} kWh`} />
                            </div>
                        ))}
                    </div>
                </Panel>

                {/* Insight & rekomendasi */}
                <Panel title="Analisis & Rekomendasi">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            {
                                title: 'AC adalah konsumen terbesar',
                                desc: 'AC Split berkontribusi ~35% dari total konsumsi. Pertimbangkan mode hemat energi.',
                                type: 'warning', pct: 35,
                            },
                            {
                                title: 'Water heater tidak efisien',
                                desc: '1500W hanya 1.2 jam/hari — gunakan timer otomatis untuk hemat 20%.',
                                type: 'info', pct: 18,
                            },
                            {
                                title: 'Konsumsi malam hari rendah',
                                desc: 'Beban 23:00–05:00 hanya 15% dari puncak. Jadwalkan laundry malam hari.',
                                type: 'success', pct: 15,
                            },
                            {
                                title: 'Komputer menyala lama',
                                desc: '10 jam/hari × 350W = 3.5 kWh/hari. Aktifkan mode sleep otomatis.',
                                type: 'error', pct: 28,
                            },
                        ].map((item, i) => {
                            const colors = {
                                warning: '#facc15',
                                info: '#22d3ee',
                                success: '#4ade80',
                                error: '#f87171',
                            }
                            const c = colors[item.type]
                            return (
                                <div key={i} style={{
                                    padding: '12px 14px', borderRadius: 8,
                                    background: `${c}0d`, border: `1px solid ${c}33`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: c }}>{item.title}</span>
                                        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: c }}>{item.pct}%</span>
                                    </div>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </Panel>
            </div>

        </div>
    )
}