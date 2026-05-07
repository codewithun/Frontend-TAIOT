import { useState } from 'react'
import { Panel, Badge } from '../components/UI.jsx'
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react'

const allAlerts = [
    { id: 1, type: 'warning', title: 'Konsumsi AC Berlebih', msg: 'AC Split 1 PK melebihi rata-rata konsumsi 23% dalam 2 jam terakhir.', time: '2 menit lalu', source: 'Sensor AC-01', read: false },
    { id: 2, type: 'info', title: 'Estimasi Tagihan Bulan Ini', msg: 'Berdasarkan tren konsumsi, estimasi tagihan bulan ini adalah Rp 487.200.', time: '1 jam lalu', source: 'Sistem Analisis', read: false },
    { id: 3, type: 'success', title: 'Target Efisiensi Tercapai', msg: 'Efisiensi hari ini 94% — melampaui target 90%. Pertahankan!', time: '3 jam lalu', source: 'Monitor Efisiensi', read: true },
    { id: 4, type: 'error', title: 'Tegangan Drop Terdeteksi', msg: 'Tegangan turun ke 208V pada pukul 21:32. Potensi kerusakan peralatan sensitif.', time: '6 jam lalu', source: 'Sensor Tegangan #1', read: true },
    { id: 5, type: 'warning', title: 'Konsumsi Melebihi Target Harian', msg: 'Konsumsi hari ini 21.2 kWh, mendekati batas target 22 kWh.', time: '8 jam lalu', source: 'Monitor Harian', read: true },
    { id: 6, type: 'info', title: 'Pembaruan Tarif PLN', msg: 'Tarif listrik PLN untuk golongan R-2 tetap Rp 1.444/kWh hingga Desember 2025.', time: '2 hari lalu', source: 'Sistem', read: true },
    { id: 7, type: 'success', title: 'Penghematan Bulan Ini', msg: 'Berhasil hemat Rp 43.000 dibanding bulan lalu dengan konsumsi turun 4.2%.', time: '3 hari lalu', source: 'Laporan Bulanan', read: true },
    { id: 8, type: 'error', title: 'Sensor #2 Offline', msg: 'Sensor pengukur #2 tidak mengirim data sejak 04:15. Perlu pemeriksaan.', time: '5 hari lalu', source: 'Monitor Sensor', read: false },
]

const typeConfig = {
    error: { icon: AlertTriangle, color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.25)', badge: 'error' },
    warning: { icon: AlertTriangle, color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)', badge: 'warning' },
    info: { icon: Info, color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)', badge: 'info' },
    success: { icon: CheckCircle, color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.25)', badge: 'success' },
}

export default function Alerts() {
    const [alerts, setAlerts] = useState(allAlerts)
    const [filter, setFilter] = useState('semua')

    const filtered = filter === 'semua' ? alerts : filter === 'belum-dibaca' ? alerts.filter(a => !a.read) : alerts.filter(a => a.type === filter)

    const markRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id))
    const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })))

    const unread = alerts.filter(a => !a.read).length

    const filters = [
        { key: 'semua', label: 'Semua' },
        { key: 'belum-dibaca', label: `Belum Dibaca (${unread})` },
        { key: 'error', label: 'Error' },
        { key: 'warning', label: 'Peringatan' },
        { key: 'info', label: 'Info' },
        { key: 'success', label: 'Sukses' },
    ]

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { label: 'Error', count: alerts.filter(a => a.type === 'error').length, color: '#f87171' },
                    { label: 'Peringatan', count: alerts.filter(a => a.type === 'warning').length, color: '#facc15' },
                    { label: 'Info', count: alerts.filter(a => a.type === 'info').length, color: '#22d3ee' },
                    { label: 'Sukses', count: alerts.filter(a => a.type === 'success').length, color: '#4ade80' },
                ].map(s => (
                    <div key={s.label} style={{
                        background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                        border: `1px solid ${s.color}33`,
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: `${s.color}15`, border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.count}</span>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Filter + list */}
            <Panel title="Log Notifikasi" headerRight={
                unread > 0 ? (
                    <button onClick={markAllRead} style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#22d3ee', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 5, padding: '4px 10px', cursor: 'pointer' }}>
                        Tandai Semua Dibaca
                    </button>
                ) : null
            }>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                    {filters.map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)} style={{
                            padding: '5px 12px', borderRadius: 5, fontSize: 11, fontFamily: 'var(--font-mono)',
                            cursor: 'pointer', border: '1px solid',
                            background: filter === f.key ? 'rgba(34,211,238,0.12)' : 'transparent',
                            borderColor: filter === f.key ? '#22d3ee' : 'var(--border)',
                            color: filter === f.key ? '#22d3ee' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Alert list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                            Tidak ada notifikasi
                        </div>
                    )}
                    {filtered.map(a => {
                        const cfg = typeConfig[a.type]
                        const Icon = cfg.icon
                        return (
                            <div key={a.id} style={{
                                display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 8,
                                background: a.read ? 'var(--bg-card)' : cfg.bg,
                                border: `1px solid ${a.read ? 'var(--border)' : cfg.border}`,
                                opacity: a.read ? 0.75 : 1,
                                transition: 'all 0.2s',
                            }}>
                                <div style={{ width: 32, height: 32, borderRadius: 6, background: `${cfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={15} color={cfg.color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: a.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{a.title}</span>
                                            {!a.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <Badge type={cfg.badge}>{a.type}</Badge>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{a.msg}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.source}</span>
                                            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>· {a.time}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {!a.read && (
                                                <button onClick={() => markRead(a.id)} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: cfg.color, background: 'transparent', border: `1px solid ${cfg.color}44`, borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}>
                                                    Tandai Dibaca
                                                </button>
                                            )}
                                            <button onClick={() => dismiss(a.id)} style={{ width: 22, height: 22, borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                                <X size={11} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Panel>
        </div>
    )
}