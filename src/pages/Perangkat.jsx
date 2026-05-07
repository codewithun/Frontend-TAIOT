import { useState } from 'react'
import { Panel, ProgressBar } from '../components/UI.jsx'
import { perangkat } from '../data/mockData.js'
import { setRelayState } from '../lib/api.js'
import { Power, Clock, Zap } from 'lucide-react'

export default function Perangkat() {
    const [devices, setDevices] = useState(perangkat)

    const toggle = async (id) => {
        const device = devices.find(d => d.id === id)
        if (!device) return
        const isOn = device.status === 'aktif'

        // Map first two devices to relay1/relay2 if applicable
        const relayKey = id === 1 ? 'relay1' : id === 2 ? 'relay2' : null

        if (relayKey) {
            try {
                const payload = { [relayKey]: !isOn }
                const res = await setRelayState(payload)
                if (res?.success && res.state) {
                    // update local state to reflect server state
                    setDevices(prev => prev.map(d => d.id === id ? { ...d, status: !isOn ? 'aktif' : 'nonaktif' } : d))
                    return
                }
                // eslint-disable-next-line no-unused-vars
            } catch (err) {
                // fallthrough to optimistic update
            }
        }

        // fallback: optimistic local-only toggle
        setDevices(prev => prev.map(d => d.id === id ? { ...d, status: d.status === 'aktif' ? 'nonaktif' : 'aktif' } : d))
    }

    const totalAktif = devices.filter(d => d.status === 'aktif').reduce((s, d) => s + d.daya, 0)
    const totalPerangkat = devices.reduce((s, d) => s + d.daya, 0)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                    { label: 'Total Perangkat', value: devices.length, unit: 'unit', color: '#22d3ee' },
                    { label: 'Aktif', value: devices.filter(d => d.status === 'aktif').length, unit: 'unit', color: '#4ade80' },
                    { label: 'Nonaktif', value: devices.filter(d => d.status === 'nonaktif').length, unit: 'unit', color: '#f87171' },
                    { label: 'Beban Aktif', value: (totalAktif / 1000).toFixed(2), unit: 'kW', color: '#facc15' },
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

            {/* Device grid */}
            <Panel title={`Manajemen Perangkat (${devices.length} unit)`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                    {devices.map(d => {
                        const isOn = d.status === 'aktif'
                        const kwhDay = ((d.daya * d.jam) / 1000).toFixed(2)
                        const biayaDay = Math.round(d.daya * d.jam * 1.444 / 1000)

                        return (
                            <div key={d.id} style={{
                                background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-lg)', padding: '16px 18px',
                                border: `1px solid ${isOn ? `${d.warna}33` : 'rgba(71,85,105,0.3)'}`,
                                transition: 'all 0.3s ease',
                                opacity: isOn ? 1 : 0.65,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOn ? d.warna : '#475569', boxShadow: isOn ? `0 0 8px ${d.warna}` : 'none', animation: isOn ? 'pulse-glow 2s ease-in-out infinite' : 'none' }} />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{d.nama}</span>
                                        </div>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.ruang}</span>
                                    </div>

                                    <button onClick={() => toggle(d.id)} style={{
                                        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
                                        background: isOn ? d.warna : '#334155', position: 'relative',
                                        transition: 'all 0.3s ease',
                                        boxShadow: isOn ? `0 0 12px ${d.warna}66` : 'none',
                                    }}>
                                        <div style={{
                                            position: 'absolute', top: 2,
                                            left: isOn ? 18 : 2,
                                            width: 16, height: 16, borderRadius: '50%', background: '#fff',
                                            transition: 'left 0.3s ease',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                                        }} />
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                                    {[
                                        { icon: Zap, label: 'Daya', value: `${d.daya}W`, color: d.warna },
                                        { icon: Clock, label: 'Jam/hari', value: `${d.jam}j`, color: '#94a3b8' },
                                        { icon: Power, label: 'kWh/hari', value: kwhDay, color: '#94a3b8' },
                                    ].map(m => (
                                        <div key={m.label} style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '6px 4px' }}>
                                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: m.color, fontWeight: 600 }}>{m.value}</div>
                                            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 1 }}>{m.label}</div>
                                        </div>
                                    ))}
                                </div>

                                <ProgressBar value={d.daya} max={totalPerangkat} color={isOn ? d.warna : '#334155'} label={`Porsi beban`} valueLabel={`Rp ${biayaDay.toLocaleString('id-ID')}/hari`} />
                            </div>
                        )
                    })}
                </div>
            </Panel>
        </div>
    )
}