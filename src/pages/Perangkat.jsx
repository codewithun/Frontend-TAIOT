import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Panel, Badge } from '../components/UI.jsx'
import {
    createRelayDevice,
    deleteRelayDevice,
    getRelayDevices,
    updateRelayDevice,
} from '../lib/api.js'

const COLOR_PALETTE = ['#22d3ee', '#4ade80', '#a78bfa', '#facc15', '#fb923c', '#f87171', '#38bdf8', '#86efac']

export default function Perangkat() {
    const [devices, setDevices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [toggling, setToggling] = useState({})
    const [showAddForm, setShowAddForm] = useState(false)
    const [newDevice, setNewDevice] = useState({ nama: '', description: '', warna: '#a78bfa' })
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 5

    const fetchDevices = async ({ silent = false } = {}) => {
        try {
            const res = await getRelayDevices()
            if (res?.success && Array.isArray(res.devices)) {
                setDevices(res.devices)
                if (!silent) setError(null)
            } else {
                throw new Error(res?.message || 'Gagal mengambil daftar relay')
            }
        } catch (err) {
            if (!silent) setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const initialTimer = setTimeout(() => {
            void fetchDevices()
        }, 0)

        const interval = setInterval(() => {
            void fetchDevices({ silent: true })
        }, 5000)

        return () => {
            clearTimeout(initialTimer)
            clearInterval(interval)
        }
    }, [])

    const totalAktif = devices.filter(device => device.status === 'aktif').length
    const totalPerangkat = devices.length
    const totalPages = Math.max(1, Math.ceil(totalPerangkat / pageSize))
    const safeCurrentPage = Math.min(currentPage, totalPages)
    const startIndex = (safeCurrentPage - 1) * pageSize
    const paginatedDevices = devices.slice(startIndex, startIndex + pageSize)

    const handleAddDevice = async () => {
        const nama = newDevice.nama.trim()

        if (!nama) {
            setError('Nama relay harus diisi')
            return
        }

        try {
            const res = await createRelayDevice({
                nama,
                description: newDevice.description.trim(),
                warna: newDevice.warna,
            })

            if (!res?.success || !res.device) {
                throw new Error(res?.message || 'Gagal menyimpan relay baru')
            }

            setDevices(prev => [...prev, res.device])
            setNewDevice({ nama: '', description: '', warna: COLOR_PALETTE[devices.length % COLOR_PALETTE.length] })
            setShowAddForm(false)
            setCurrentPage(Math.ceil((devices.length + 1) / pageSize))
            setError(null)
        } catch (err) {
            setError(err.message)
        }
    }

    const handleToggle = async (device) => {
        const nextStatus = device.status === 'aktif' ? 'nonaktif' : 'aktif'

        setToggling(prev => ({ ...prev, [device.id]: true }))

        try {
            const res = await updateRelayDevice(device.id, { status: nextStatus })

            if (!res?.success || !res.device) {
                throw new Error(res?.message || 'Gagal mengubah status relay')
            }

            setDevices(prev => prev.map(item => (item.id === device.id ? res.device : item)))
            setError(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setToggling(prev => ({ ...prev, [device.id]: false }))
        }
    }

    const handleDeleteDevice = async (device) => {
        if (device.isBuiltin) {
            setError('Relay bawaan tidak bisa dihapus')
            return
        }

        try {
            const res = await deleteRelayDevice(device.id)
            if (!res?.success) {
                throw new Error(res?.message || 'Gagal menghapus relay')
            }

            setDevices(prev => prev.filter(item => item.id !== device.id))
            setError(null)
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {loading && <div style={{ padding: '12px 16px', background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 8, color: '#22d3ee', fontSize: 12, fontFamily: 'var(--font-mono)' }}>⏳ Loading relay data...</div>}
            {error && <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: 12, fontFamily: 'var(--font-mono)' }}>⚠️ Error: {error}</div>}

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

            <Panel title="Tambah Relay Baru" headerRight={
                <button onClick={() => setShowAddForm(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)', background: '#eff5fa', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                    <Plus size={14} />
                    {showAddForm ? 'Tutup' : 'Tambah'}
                </button>
            }>
                {showAddForm ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 0.8fr auto', gap: 10, alignItems: 'end' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Nama relay</span>
                            <input value={newDevice.nama} onChange={e => setNewDevice(prev => ({ ...prev, nama: e.target.value }))} placeholder="Relay 3"
                                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font-body)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Deskripsi</span>
                            <input value={newDevice.description} onChange={e => setNewDevice(prev => ({ ...prev, description: e.target.value }))} placeholder="Relay Control 3"
                                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font-body)' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Warna</span>
                            <input type="color" value={newDevice.warna} onChange={e => setNewDevice(prev => ({ ...prev, warna: e.target.value }))} style={{ height: 42, width: '100%', border: '1px solid var(--border)', borderRadius: 8, padding: 4, background: 'var(--bg-card)' }} />
                        </label>
                        <button onClick={handleAddDevice} style={{ padding: '11px 14px', borderRadius: 8, border: 'none', background: '#4b9b75', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            Simpan
                        </button>
                    </div>
                ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Klik tombol Tambah untuk menambahkan relay baru dan menyimpannya ke backend database.</div>
                )}
            </Panel>

            <Panel title={`Manajemen Relay (${totalPerangkat} unit)`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {paginatedDevices.map(device => {
                        const isOn = device.status === 'aktif'

                        return (
                            <div key={device.id} style={{
                                background: 'var(--bg-card-hover)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '18px 18px',
                                border: `1px solid ${isOn ? `${device.warna}33` : 'rgba(71,85,105,0.3)'}`,
                                transition: 'all 0.3s ease',
                                opacity: isOn ? 1 : 0.7,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                                    <div style={{ width: 56, height: 56, borderRadius: 14, background: isOn ? `${device.warna}20` : '#e2e8f0', border: `1px solid ${isOn ? `${device.warna}55` : 'rgba(71,85,105,0.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: isOn ? device.warna : '#94a3b8', boxShadow: isOn ? `0 0 12px ${device.warna}` : 'none', animation: isOn ? 'pulse-glow 2s ease-in-out infinite' : 'none' }} />
                                    </div>

                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{device.nama}</span>
                                            {device.isBuiltin ? <Badge type="info">Bawaan</Badge> : <Badge type="warning">Custom</Badge>}
                                        </div>
                                        <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{device.description}</div>
                                        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                            <div style={{ fontSize: 28, fontWeight: 700, color: isOn ? device.warna : '#94a3b8', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>{isOn ? 'ON' : 'OFF'}</div>
                                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{isOn ? 'AKTIF' : 'NONAKTIF'}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleToggle(device)} disabled={toggling[device.id]} style={{
                                        padding: '12px 20px',
                                        borderRadius: 8,
                                        border: 'none',
                                        cursor: toggling[device.id] ? 'not-allowed' : 'pointer',
                                        background: isOn ? device.warna : '#334155',
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: 12,
                                        fontFamily: 'var(--font-mono)',
                                        letterSpacing: 1,
                                        transition: 'all 0.3s ease',
                                        boxShadow: isOn ? `0 0 16px ${device.warna}66` : 'none',
                                        textTransform: 'uppercase',
                                        opacity: toggling[device.id] ? 0.6 : 1,
                                    }}>
                                        {toggling[device.id] ? '⏳ PROSES...' : (isOn ? '⏹ MATIKAN' : '▶ NYALAKAN')}
                                    </button>

                                    <button onClick={() => handleDeleteDevice(device)} disabled={device.isBuiltin} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '10px 12px',
                                        borderRadius: 8,
                                        border: '1px solid var(--border)',
                                        background: device.isBuiltin ? '#f3f4f6' : 'transparent',
                                        cursor: device.isBuiltin ? 'not-allowed' : 'pointer',
                                        color: device.isBuiltin ? 'var(--text-muted)' : '#b91c1c',
                                        fontSize: 11,
                                        fontFamily: 'var(--font-mono)',
                                    }}>
                                        <Trash2 size={12} /> Hapus
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                            Menampilkan {totalPerangkat === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + pageSize, totalPerangkat)} dari {totalPerangkat} relay
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                disabled={safeCurrentPage === 1}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: safeCurrentPage === 1 ? '#f3f4f6' : 'var(--bg-card)',
                                    cursor: safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 11,
                                }}
                            >
                                Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        minWidth: 34,
                                        height: 34,
                                        borderRadius: 8,
                                        border: `1px solid ${page === safeCurrentPage ? 'var(--text-accent)' : 'var(--border)'}`,
                                        background: page === safeCurrentPage ? '#e8f0f7' : 'var(--bg-card)',
                                        color: page === safeCurrentPage ? 'var(--text-accent)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: 11,
                                    }}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                disabled={safeCurrentPage === totalPages}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 8,
                                    border: '1px solid var(--border)',
                                    background: safeCurrentPage === totalPages ? '#f3f4f6' : 'var(--bg-card)',
                                    cursor: safeCurrentPage === totalPages ? 'not-allowed' : 'pointer',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 11,
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Panel>
        </div>
    )
}