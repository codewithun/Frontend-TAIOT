const formatNumericValue = value => {
    if (typeof value !== 'number' || !Number.isFinite(value)) return value
    return new Intl.NumberFormat('id-ID', {
        useGrouping: false,
        maximumFractionDigits: 2,
    }).format(value)
}

// ─── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, unit, sub, color = 'cyan', icon: Icon, trend, style = {} }) {
    const colors = {
        cyan: { border: '#bfd1df', glow: 'rgba(95,136,168,0.08)', text: '#4d7594' },
        green: { border: '#bfd7cb', glow: 'rgba(75,155,117,0.08)', text: '#4b9b75' },
        yellow: { border: '#e1cfb1', glow: 'rgba(202,154,79,0.08)', text: '#b48443' },
        red: { border: '#e0c2bc', glow: 'rgba(205,109,91,0.08)', text: '#bf6657' },
        purple: { border: '#cfd6e0', glow: 'rgba(127,143,167,0.08)', text: '#74829a' },
        orange: { border: '#e6ceb0', glow: 'rgba(197,138,77,0.08)', text: '#bf8749' },
    }
    const c = colors[color]
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 10px 24px rgba(73,95,120,0.08), inset 0 0 26px ${c.glow}`,
            transition: 'all 0.3s ease',
            cursor: 'default',
            ...style,
        }}
            onMouseEnter={e => {
                e.currentTarget.style.border = `1px solid ${c.text}55`
                e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.border = `1px solid ${c.border}`
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
                    {label}
                </span>
                {Icon && (
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: `${c.glow}`, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={c.text} />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-mono)', color: c.text, lineHeight: 1 }}>
                    {formatNumericValue(value)}
                </span>
                {unit && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{unit}</span>}
            </div>

            {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{sub}</p>}
            {trend !== undefined && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: trend >= 0 ? '#cd6d5b' : '#4b9b75', fontFamily: 'var(--font-mono)' }}>
                        {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>vs kemarin</span>
                </div>
            )}
        </div>
    )
}

// ─── Panel ───────────────────────────────────────────────────────────────────
export function Panel({ title, children, style = {}, headerRight }) {
    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-card)',
            ...style,
        }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid var(--border)',
                background: '#edf4fa',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 3, height: 16, background: 'var(--neon-cyan)', borderRadius: 2 }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: 2, color: 'var(--text-accent)', textTransform: 'uppercase' }}>
                        {title}
                    </span>
                </div>
                {headerRight}
            </div>
            <div style={{ padding: 20 }}>{children}</div>
        </div>
    )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
export function Badge({ children, type = 'info' }) {
    const types = {
        info: { bg: '#e7f0f7', color: '#4d7594', border: '#bfd1df' },
        success: { bg: '#e7f4ed', color: '#4b9b75', border: '#bcd9ca' },
        warning: { bg: '#f7efe2', color: '#b48443', border: '#e1cfb1' },
        error: { bg: '#f8ecea', color: '#bf6657', border: '#dfc3be' },
    }
    const t = types[type]
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 4,
            fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase',
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.color, animation: 'pulse-glow 2s ease-in-out infinite' }} />
            {children}
        </span>
    )
}

// ─── GaugeRing ────────────────────────────────────────────────────────────────
export function GaugeRing({ value, max = 100, label, unit, color = '#22d3ee', size = 120 }) {
    const pct = Math.min(value / max, 1)
    const r = (size - 16) / 2
    const circ = 2 * Math.PI * r
    const dash = circ * 0.75
    const offset = dash - pct * dash

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#dde7f0" strokeWidth={8} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
                        strokeDasharray={`${dash - offset} ${circ - (dash - offset)}`}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 2px 4px ${color}55)`, transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.2, fontWeight: 700, color, lineHeight: 1 }}>{formatNumericValue(value)}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.1, color: 'var(--text-muted)' }}>{unit}</span>
                </div>
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
        </div>
    )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max, color = '#22d3ee', label, valueLabel }) {
    const pct = Math.min((value / max) * 100, 100)
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color }}>{valueLabel || `${Math.round(pct)}%`}</span>
            </div>
            <div style={{ height: 6, background: '#dce7f1', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 3,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    boxShadow: `0 2px 6px ${color}55`,
                    transition: 'width 1s ease',
                }} />
            </div>
        </div>
    )
}