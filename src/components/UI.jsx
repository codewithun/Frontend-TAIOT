// ─── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, unit, sub, color = 'cyan', icon: Icon, trend, style = {} }) {
    const colors = {
        cyan: { border: 'rgba(34,211,238,0.25)', glow: 'rgba(34,211,238,0.12)', text: '#22d3ee' },
        green: { border: 'rgba(74,222,128,0.25)', glow: 'rgba(74,222,128,0.12)', text: '#4ade80' },
        yellow: { border: 'rgba(250,204,21,0.25)', glow: 'rgba(250,204,21,0.12)', text: '#facc15' },
        red: { border: 'rgba(248,113,113,0.25)', glow: 'rgba(248,113,113,0.12)', text: '#f87171' },
        purple: { border: 'rgba(167,139,250,0.25)', glow: 'rgba(167,139,250,0.12)', text: '#a78bfa' },
        orange: { border: 'rgba(251,146,60,0.25)', glow: 'rgba(251,146,60,0.12)', text: '#fb923c' },
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
            boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 0 40px ${c.glow}`,
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
            {/* Corner accent */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 40, height: 40,
                borderLeft: `1px solid ${c.text}40`,
                borderBottom: `1px solid ${c.text}40`,
                borderBottomLeftRadius: 8,
            }} />

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
                    {value}
                </span>
                {unit && <span style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{unit}</span>}
            </div>

            {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>{sub}</p>}
            {trend !== undefined && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: trend >= 0 ? '#f87171' : '#4ade80', fontFamily: 'var(--font-mono)' }}>
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
                background: 'rgba(34,211,238,0.03)',
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
        info: { bg: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: 'rgba(34,211,238,0.25)' },
        success: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', border: 'rgba(74,222,128,0.25)' },
        warning: { bg: 'rgba(250,204,21,0.12)', color: '#facc15', border: 'rgba(250,204,21,0.25)' },
        error: { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
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
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
                        strokeDasharray={`${dash - offset} ${circ - (dash - offset)}`}
                        strokeLinecap="round"
                        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: size * 0.2, fontWeight: 700, color, lineHeight: 1 }}>{Math.round(value)}</span>
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
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                    height: '100%', width: `${pct}%`, borderRadius: 3,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                    boxShadow: `0 0 8px ${color}66`,
                    transition: 'width 1s ease',
                }} />
            </div>
        </div>
    )
}