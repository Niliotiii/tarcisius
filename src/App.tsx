import { useState, useCallback, useMemo } from 'react'
import type { Module, Question, QuizSession } from '@/types/quiz'
import { modules } from '@/data/modules'
import { startSession, submitAnswer, advance, getScore } from '@/lib/quizEngine'
import { getRank } from '@/lib/ranking'

// ─── Presentation-only module theming (not part of the content data contract) ─

const ACCENT_COLORS: Record<string, string> = {
  'objetos-liturgicos': '#E8B84B',
  'vestes-liturgicas-insignias': '#9B6EF3',
  'tempos-liturgicos': '#4ADE80',
  'estrutura-partes-missa': '#5EC8E0',
}
const DEFAULT_ACCENT = '#E8B84B'
const LOCKED_LABEL = 'Em breve'

function accentColorFor(moduleId: string): string {
  return ACCENT_COLORS[moduleId] ?? DEFAULT_ACCENT
}

// Fixed color + mark per answer position — the "board game tile" language.
// Tiles never recolor to signal right/wrong (that would collide with these
// hues); correctness is shown via glow/check vs. dim/cross instead.
const TILE_STYLES = [
  { color: '#DE9A1F', mark: 'star' },
  { color: '#7C3AED', mark: 'dot' },
  { color: '#0891B2', mark: 'triangle' },
  { color: '#EA580C', mark: 'cross' },
] as const satisfies readonly { color: string; mark: GlyphName }[]

// ─── SVG Monstrance ───────────────────────────────────────────────────────────

function Monstrance({ size = 200, opacity = 0.9, color = '#E8B84B' }: { size?: number; opacity?: number; color?: string }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.13
  const rays = 24

  const rayLines = Array.from({ length: rays }, (_, i) => {
    const angle = (i * 360) / rays - 90
    const rad = (angle * Math.PI) / 180
    const isLong = i % 2 === 0
    const inner = r * 1.35
    const outer = isLong ? size * 0.48 : size * 0.37
    return {
      x1: cx + Math.cos(rad) * inner,
      y1: cy + Math.sin(rad) * inner,
      x2: cx + Math.cos(rad) * outer,
      y2: cy + Math.sin(rad) * outer,
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ opacity }}>
      {rayLines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={color} strokeWidth={i % 2 === 0 ? 1.5 : 0.8} strokeLinecap="round" />
      ))}
      <circle cx={cx} cy={cy} r={r * 1.2} stroke={color} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r * 0.45} fill={color} />
      <line x1={cx} y1={cy - r * 0.7} x2={cx} y2={cy + r * 0.7} stroke="#0F0A27" strokeWidth="1.5" />
      <line x1={cx - r * 0.5} y1={cy - r * 0.15} x2={cx + r * 0.5} y2={cy - r * 0.15} stroke="#0F0A27" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Glyph Icons ──────────────────────────────────────────────────────────────
// Hand-drawn SVG marks instead of Unicode symbols (✦ ● ▲ ✝ 🔒 🔥 ✓ ✗) — those
// render as system emoji on some browsers/OSes, giving inconsistent size,
// color, and style across platforms. SVG paths render identically everywhere.

type GlyphName = 'star' | 'dot' | 'triangle' | 'cross' | 'check' | 'x' | 'lock' | 'flame'

function GlyphIcon({ name, size = 16 }: { name: GlyphName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' } as const

  switch (name) {
    case 'star':
      return (
        <svg {...common}>
          <path d="M12 2.5c.9 3.1 1.9 5.6 3.1 6.9 1.2 1.3 3.4 2.3 6.4 2.6-3 .3-5.2 1.3-6.4 2.6-1.2 1.3-2.2 3.8-3.1 6.9-.9-3.1-1.9-5.6-3.1-6.9-1.2-1.3-3.4-2.3-6.4-2.6 3-.3 5.2-1.3 6.4-2.6 1.2-1.3 2.2-3.8 3.1-6.9z" />
        </svg>
      )
    case 'dot':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" />
        </svg>
      )
    case 'triangle':
      return (
        <svg {...common}>
          <path d="M12 3.5l8.5 16H3.5L12 3.5z" />
        </svg>
      )
    case 'cross':
      return (
        <svg {...common}>
          <path d="M10.2 2.5h3.6v7.7h7.7v3.6h-7.7v7.7h-3.6v-7.7H2.5v-3.6h7.7V2.5z" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common} fill="none">
          <path d="M4.5 12.5l5 5L19.5 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'x':
      return (
        <svg {...common} fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common} fill="none">
          <rect x="5" y="10.5" width="14" height="10" rx="2.2" stroke="currentColor" strokeWidth="2" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'flame':
      return (
        <svg {...common}>
          <path d="M12 2.3c.4 3 2 4.4 3.6 6 1.8 1.8 2.9 3.7 2.9 6.2 0 4.1-3 7.2-6.5 7.2s-6.5-3.1-6.5-7c0-2 .9-3.5 2-4.7.1 1.4.8 2.3 1.7 2.3.9 0 1.4-.8 1.2-1.9-.5-2.6.1-5.6 2.2-8.1 -.3 1.3 0 2.3.7 3-0.1-1 .1-1.9.7-3z" />
        </svg>
      )
  }
}

// ─── Quiz Pips (progress-as-run-history) ───────────────────────────────────────

function QuizPips({
  total, currentIndex, results, accentColor, onExit,
}: {
  total: number; currentIndex: number; results: (boolean | null)[]; accentColor: string; onExit: () => void
}) {
  return (
    <div style={{ width: '100%', padding: '16px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--color-alba-muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Pergunta {currentIndex + 1} de {total}
        </span>
        <button
          onClick={onExit}
          aria-label="Sair do quiz"
          style={{
            minWidth: '48px', minHeight: '48px', border: 'none', background: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, margin: '-8px -8px -8px 0',
          }}
        >
          <span style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(36,26,69,0.06)', color: 'var(--color-alba-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GlyphIcon name="x" size={13} />
          </span>
        </button>
      </div>
      <div style={{ display: 'flex', gap: '5px' }}>
        {Array.from({ length: total }, (_, i) => {
          const result = results[i]
          const isCurrent = i === currentIndex
          let bg = 'var(--color-sanctum-light)'
          if (result === true) bg = 'var(--color-viridis)'
          else if (result === false) bg = 'var(--color-rubrum)'
          else if (isCurrent) bg = accentColor
          return (
            <div
              key={i}
              className={result !== null ? 'animate-pip-pop' : undefined}
              style={{
                flex: 1, height: '7px', borderRadius: '99px', background: bg,
                boxShadow: isCurrent ? `0 0 8px ${accentColor}AA` : 'none',
                transition: 'background 0.25s ease',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Answer Tile ────────────────────────────────────────────────────────────

type TileState = 'idle' | 'correct' | 'wrong' | 'neutral'

function AnswerTile({
  label, mark, color, state, disabled, onClick,
}: {
  label: string; mark: GlyphName; color: string; state: TileState; disabled: boolean; onClick: () => void
}) {
  const isDimmed = state === 'neutral'
  const isWrong = state === 'wrong'
  const isCorrect = state === 'correct'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={isCorrect ? 'animate-tile-pop-correct' : isWrong ? 'animate-tile-shake-wrong' : undefined}
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px',
        padding: '14px', borderRadius: '20px', border: 'none',
        background: isWrong ? 'linear-gradient(160deg, #E4D9BE, #D8CBA8)' : `linear-gradient(160deg, ${color}, ${color}D9)`,
        color: isWrong ? 'var(--color-alba-muted)' : '#FFFFFF',
        opacity: isDimmed ? 0.4 : 1,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'opacity 0.25s ease, filter 0.25s ease',
        textAlign: 'left', minHeight: '128px',
        fontFamily: 'var(--font-jakarta)', fontSize: '15px', fontWeight: 800, lineHeight: 1.3,
        boxShadow: isCorrect ? '0 0 0 3px rgba(36,26,69,0.45), 0 8px 22px rgba(36,26,69,0.24)' : '0 3px 10px rgba(36,26,69,0.14)',
        position: 'relative',
      }}
    >
      <span style={{
        width: '38px', height: '38px', borderRadius: '11px',
        background: isWrong ? 'rgba(36,26,69,0.06)' : 'rgba(255,255,255,0.24)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <GlyphIcon name={mark} size={18} />
      </span>
      <span>{label}</span>

      {(isCorrect || isWrong) && (
        <span
          className="animate-badge-pop-in"
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
            background: isCorrect ? 'var(--color-viridis)' : 'var(--color-rubrum)',
            color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <GlyphIcon name={isCorrect ? 'check' : 'x'} size={13} />
        </span>
      )}
    </button>
  )
}

// ─── Star Icon ────────────────────────────────────────────────────────────────

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? '#E8B84B' : 'none'} stroke={filled ? '#E8B84B' : '#D8CBA8'} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// ─── Screen Header ────────────────────────────────────────────────────────────
// A single vertical block — back-link, then title, then subtitle — instead of
// an icon chip floating next to a text stack. Ties into the same wayfinding
// language as the "Como funciona?" link on the start screen, rather than
// borrowing a generic icon-button pattern.

function ScreenHeader({
  title, subtitle, backLabel, onBack,
}: {
  title: string; subtitle: string; backLabel: string; onBack: () => void
}) {
  return (
    <div style={{ padding: '20px 20px 0' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', padding: '10px 0', margin: '-10px 0 6px -2px',
          display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', minHeight: '44px',
          fontFamily: 'var(--font-jakarta)', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold-dim)',
        }}
      >
        <svg width="9" height="14" viewBox="0 0 9 14" fill="none">
          <path d="M7.5 1.5L2 7L7.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {backLabel}
      </button>
      <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '26px', fontWeight: 800, fontStyle: 'italic', color: 'var(--color-alba)', margin: 0, lineHeight: 1.1 }}>
        {title}
      </h2>
      <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12.5px', color: 'var(--color-alba-muted)', margin: '4px 0 0', fontWeight: 600 }}>
        {subtitle}
      </p>
    </div>
  )
}

// ─── Screen: Start ────────────────────────────────────────────────────────────

function StartScreen({ onContinue, onAbout }: { onContinue: () => void; onAbout: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 24px calc(24px + env(safe-area-inset-bottom))', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,110,243,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Identity block floats in the remaining space above the actions */}
      <div className="animate-halo-in" style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', maxWidth: '360px', width: '100%',
      }}>
        <div className="monstrance-pulse" style={{ marginBottom: '8px' }}>
          <Monstrance size={180} opacity={0.95} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(38px, 11vw, 52px)',
          fontWeight: 800, fontStyle: 'italic', color: 'var(--color-alba)',
          margin: '0 0 4px', textAlign: 'center', lineHeight: 1.05, letterSpacing: '-0.02em',
        }}>
          <span className="gold-shimmer">Tarcisius</span>
        </h1>

        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 600,
          color: 'var(--color-alba-muted)', margin: '0 0 6px', textAlign: 'center',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Quiz Litúrgico
        </p>

        <div style={{ width: '36px', height: '1px', background: 'var(--color-gold-dim)', margin: '14px 0 16px', opacity: 0.6 }} />

        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--color-alba-muted)',
          margin: 0, textAlign: 'center', lineHeight: 1.65, maxWidth: '270px',
        }}>
          Treine seu conhecimento sobre a liturgia da Igreja Católica de forma divertida.
        </p>
      </div>

      {/* Actions pinned to the thumb zone at the bottom of the screen */}
      <div style={{ maxWidth: '360px', width: '100%', flexShrink: 0 }}>
        <button
          onClick={onContinue}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: 'linear-gradient(135deg, #A07E2A 0%, #E8B84B 50%, #F5D87A 100%)',
            color: '#0F0A27', fontFamily: 'var(--font-jakarta)', fontSize: '16px',
            fontWeight: 800, letterSpacing: '0.02em', cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: '0 4px 24px rgba(232,184,75,0.3)', minHeight: '52px',
          }}
          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = '0 8px 32px rgba(232,184,75,0.45)' }}
          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.transform = 'translateY(0)'; b.style.boxShadow = '0 4px 24px rgba(232,184,75,0.3)' }}
        >
          Escolher Módulo
        </button>

        <button
          onClick={onAbout}
          style={{
            width: '100%', padding: '13px', borderRadius: '16px', border: 'none',
            background: 'transparent', color: 'var(--color-alba-muted)',
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 700,
            cursor: 'pointer', minHeight: '44px', marginTop: '6px',
          }}
        >
          Como funciona?
        </button>
      </div>
    </div>
  )
}

// ─── Screen: About ────────────────────────────────────────────────────────────

const HOW_IT_WORKS_STEPS = [
  'Cada sessão sorteia 10 perguntas do banco do módulo escolhido.',
  'Toque numa alternativa e veja na hora se acertou — sem espera.',
  'Ao final você recebe uma pontuação e um título de acordo com seu desempenho.',
  'Jogue de novo para pegar um conjunto novo de perguntas do mesmo módulo.',
]

function AboutScreen({ onBack }: { onBack: () => void }) {
  const availableModules = modules.filter(m => m.status === 'available')

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto',
    }}>
      <ScreenHeader
        title="Como funciona" subtitle="As regras do jogo, em poucas linhas"
        backLabel="Início" onBack={onBack}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px', gap: '10px' }}>
        {HOW_IT_WORKS_STEPS.map((text, i) => {
          const tile = TILE_STYLES[i % TILE_STYLES.length]
          return (
            <div key={i} style={{
              background: 'var(--color-sanctum)', borderRadius: '16px', padding: '14px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 2px 10px rgba(36,26,69,0.06)',
            }}>
              <span style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: tile.color, color: '#FFFFFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <GlyphIcon name={tile.mark} size={16} />
              </span>
              <p style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '13.5px', color: 'var(--color-alba)',
                margin: 0, lineHeight: 1.5, fontWeight: 600,
              }}>
                {text}
              </p>
            </div>
          )
        })}

        <h3 style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-alba-muted)',
          margin: '14px 0 2px',
        }}>
          Módulos ativos
        </h3>

        {availableModules.map(mod => {
          const accentColor = accentColorFor(mod.id)
          return (
            <div key={mod.id} style={{
              background: 'var(--color-sanctum)', borderRadius: '16px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              boxShadow: '0 2px 10px rgba(36,26,69,0.06)',
            }}>
              <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', fontWeight: 800, color: 'var(--color-alba)' }}>
                {mod.title}
              </span>
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700,
                color: accentColor, background: `${accentColor}18`, padding: '4px 10px', borderRadius: '99px',
                flexShrink: 0,
              }}>
                {mod.questions.length} perguntas no banco
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Screen: Modules ──────────────────────────────────────────────────────────

function ModulesScreen({ onSelect, onBack }: { onSelect: (mod: Module) => void; onBack: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto',
    }}>
      <ScreenHeader
        title="Módulos" subtitle="Escolha um tema para estudar"
        backLabel="Início" onBack={onBack}
      />

      {/* Module tiles — a level-select grid, not a settings list. Centered in
          the remaining space so the tappable tiles fall in thumb reach
          instead of sitting flush under the header with dead space below. */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {modules.map((mod, idx) => (
            <ModuleCard key={mod.id} mod={mod} index={idx} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}

const MODULE_GLYPHS: GlyphName[] = ['star', 'dot', 'triangle', 'cross']

function ModuleCard({ mod, index, onSelect }: { mod: Module; index: number; onSelect: (mod: Module) => void }) {
  const [pressed, setPressed] = useState(false)
  const locked = mod.status === 'locked'
  const accentColor = accentColorFor(mod.id)

  if (locked) {
    return (
      <div style={{
        background: 'var(--color-sanctum-light)', borderRadius: '20px',
        padding: '16px', minHeight: '188px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', opacity: 0.7,
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(36,26,69,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-alba-muted)',
        }}>
          <GlyphIcon name="lock" size={16} />
        </div>
        <div>
          <span style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-alba-muted)',
            display: 'inline-block', marginBottom: '6px',
          }}>
            {LOCKED_LABEL}
          </span>
          <h3 style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '15px', fontWeight: 800,
            color: 'var(--color-alba-muted)', margin: '0 0 4px', lineHeight: 1.2,
          }}>
            {mod.title}
          </h3>
          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '11.5px', color: 'var(--color-alba-muted)',
            margin: 0, lineHeight: 1.4, opacity: 0.8,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {mod.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => onSelect(mod)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: `linear-gradient(165deg, ${accentColor}, ${accentColor}D9)`,
        borderRadius: '20px', border: 'none',
        padding: '16px', textAlign: 'left', cursor: 'pointer',
        minHeight: '188px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        boxShadow: `0 6px 20px ${accentColor}44`,
        color: '#FFFFFF',
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '11px', background: 'rgba(255,255,255,0.24)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <GlyphIcon name={MODULE_GLYPHS[index % MODULE_GLYPHS.length]} size={17} />
      </div>

      <div>
        <h3 style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '16px', fontWeight: 800,
          margin: '0 0 4px', lineHeight: 1.2,
        }}>
          {mod.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-jakarta)', fontSize: '11.5px', color: 'rgba(255,255,255,0.85)',
          margin: 0, lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {mod.description}
        </p>
      </div>
    </button>
  )
}

// ─── Screen: Quiz ─────────────────────────────────────────────────────────────

function currentStreak(session: QuizSession): number {
  let streak = 0
  for (let i = session.answers.length - 1; i >= 0; i--) {
    if (!session.answers[i].correct) break
    streak++
  }
  return streak
}

function QuizScreen({
  session, onAnswer, onNext, onExit, accentColor,
}: {
  session: QuizSession; onAnswer: (optionId: string) => void; onNext: () => void; onExit: () => void; accentColor: string;
}) {
  const q: Question = session.questions[session.currentIndex]
  const currentAnswer = session.answers.find(a => a.questionId === q.id)
  const answered = currentAnswer !== undefined
  const score = getScore(session)
  const streak = currentStreak(session)

  const results: (boolean | null)[] = session.questions.map((question, i) => {
    if (i > session.currentIndex) return null
    if (i === session.currentIndex && !answered) return null
    const a = session.answers.find(ans => ans.questionId === question.id)
    return a ? a.correct : null
  })

  function getState(optionId: string): TileState {
    if (!answered) return 'idle'
    if (optionId === q.correctOptionId) return 'correct'
    if (optionId === currentAnswer!.selectedOptionId) return 'wrong'
    return 'neutral'
  }

  const isCorrect = answered && currentAnswer!.correct

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto',
    }}>
      <QuizPips total={session.questions.length} currentIndex={session.currentIndex} results={results} accentColor={accentColor} onExit={onExit} />

      <div key={session.currentIndex} className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 16px 24px', gap: '16px' }}>
        {/* Question — image gets a card if present; the prompt itself sits directly
            on the page so it reads as the "stage", not another stacked card. */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', top: '-10px', right: '-10px', opacity: 0.06,
            pointerEvents: 'none', userSelect: 'none',
          }}>
            <Monstrance size={110} opacity={1} color={accentColor} />
          </div>

          {q.image && (
            <div style={{
              width: '100%', maxHeight: '32vh', background: 'var(--color-sanctum)',
              borderRadius: '18px', overflow: 'hidden', marginBottom: '14px',
              boxShadow: '0 2px 14px rgba(36,26,69,0.08)',
            }}>
              <img
                src={q.image.src}
                alt={q.image.alt}
                style={{ width: '100%', maxHeight: '32vh', objectFit: 'contain', objectPosition: 'center', display: 'block' }}
              />
            </div>
          )}

          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(19px, 5.6vw, 24px)',
            fontWeight: 800, color: 'var(--color-alba)', margin: 0, lineHeight: 1.32,
            position: 'relative', zIndex: 1,
          }}>
            {q.prompt}
          </p>
        </div>

        {/* Answers — 2x2 tile grid, the dominant surface on this screen */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1, alignContent: 'end' }}>
          {q.options.map((opt, i) => {
            const tile = TILE_STYLES[i % TILE_STYLES.length]
            return (
              <AnswerTile
                key={opt.id} label={opt.label} mark={tile.mark} color={tile.color}
                state={getState(opt.id)} disabled={answered} onClick={() => onAnswer(opt.id)}
              />
            )
          })}
        </div>
      </div>

      {/* Feedback + next — pinned to the thumb zone, not inline in the flow */}
      {answered && (
        <div
          className="animate-banner-drop-in"
          style={{
            position: 'sticky', bottom: 0, background: 'var(--color-altar)',
            padding: '10px 16px calc(14px + env(safe-area-inset-bottom))',
            boxShadow: '0 -6px 16px rgba(36,26,69,0.08)',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '99px',
            background: isCorrect ? 'rgba(34,184,122,0.14)' : 'rgba(224,72,63,0.14)',
            color: isCorrect ? 'var(--color-viridis)' : 'var(--color-rubrum)',
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', fontWeight: 800, alignSelf: 'flex-start',
          }}>
            <span>{isCorrect ? 'Correto!' : 'Ops!'}</span>
            {isCorrect && streak >= 2 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-gold)' }}>
                <GlyphIcon name="flame" size={13} />
                {streak}x
              </span>
            )}
            <span style={{ position: 'relative', color: 'var(--color-alba-muted)', fontWeight: 600 }}>
              Pontuação: <span style={{ color: accentColor, fontWeight: 800 }}>{score}</span>
              {isCorrect && (
                <span key={session.currentIndex} className="animate-float-score" style={{
                  position: 'absolute', right: 0, top: '-4px', color: 'var(--color-viridis)', fontWeight: 800, fontSize: '12px',
                }}>
                  +1
                </span>
              )}
            </span>
          </div>
          <button
            onClick={onNext}
            style={{
              width: '100%', padding: '15px', borderRadius: '14px', border: 'none',
              background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
              color: '#0F0A27', fontFamily: 'var(--font-jakarta)', fontSize: '15px',
              fontWeight: 800, cursor: 'pointer', minHeight: '52px',
              boxShadow: `0 4px 16px ${accentColor}44`,
              transition: 'transform 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)')}
          >
            {session.currentIndex < session.questions.length - 1 ? (
              <>
                Próxima
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                  <path d="M1 6h11.5M8 1l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            ) : 'Ver Resultado'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Screen: Result ───────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#E8B84B', '#9B6EF3', '#5EC8E0', '#4ADE80', '#F2994A']

function useConfettiPieces(count: number) {
  return useMemo(
    () => Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.round((i / count) * 100 + (Math.random() * 8 - 4)),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.3,
      duration: 1.6 + Math.random() * 0.8,
      size: 5 + Math.round(Math.random() * 4),
    })),
    [count],
  )
}

function ResultScreen({ score, total, onRestart, onModules, accentColor }: {
  score: number; total: number; onRestart: () => void; onModules: () => void; accentColor: string;
}) {
  const rank = getRank(score)
  const pct = Math.round((score / total) * 100)
  const ringR = 54
  const circ = 2 * Math.PI * ringR
  const offset = circ - (pct / 100) * circ
  const celebrate = score / total >= 0.7
  const confetti = useConfettiPieces(celebrate ? 18 : 0)

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '32px 20px calc(24px + env(safe-area-inset-bottom))',
      maxWidth: '480px', margin: '0 auto', position: 'relative', overflow: 'hidden',
    }}>
      {confetti.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`, width: `${p.size}px`, height: `${p.size * 1.4}px`,
            background: p.color, borderRadius: '2px',
            animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div className="animate-halo-in" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Score ring */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={ringR} stroke="var(--color-sanctum-light)" strokeWidth="10" fill="none" />
            <circle cx="65" cy="65" r={ringR} stroke={accentColor} strokeWidth="10" fill="none"
              strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)', filter: `drop-shadow(0 0 6px ${accentColor}88)` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: '36px', fontWeight: 800, fontStyle: 'italic', color: accentColor, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--color-alba-muted)', fontWeight: 600 }}>
              de {total}
            </span>
          </div>
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
          {[1, 2, 3].map(s => <StarIcon key={s} filled={s <= rank.stars} />)}
        </div>

        {/* Rank card */}
        <div style={{
          background: 'var(--color-sanctum)', border: `1px solid ${accentColor}30`,
          borderRadius: '20px', padding: '20px 24px', textAlign: 'center',
          marginBottom: '16px', width: '100%',
        }}>
          <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accentColor, marginBottom: '8px' }}>
            Seu Título
          </div>
          <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(22px, 6vw, 28px)', fontWeight: 800, fontStyle: 'italic', color: 'var(--color-alba)', lineHeight: 1.2, marginBottom: '10px' }}>
            {rank.title}
          </div>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '14px', color: 'var(--color-alba-muted)', margin: 0, lineHeight: 1.5 }}>
            {rank.description}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', marginBottom: '24px' }}>
          {[
            { label: 'Acertos', value: score, color: 'var(--color-viridis)' },
            { label: 'Erros', value: total - score, color: 'var(--color-rubrum)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--color-sanctum)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: '32px', fontWeight: 800, fontStyle: 'italic', color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--color-alba-muted)', fontWeight: 600, marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Actions pinned to the thumb zone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', flexShrink: 0 }}>
        <button
          onClick={onRestart}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: `linear-gradient(135deg, ${accentColor}AA, ${accentColor}, ${accentColor}DD)`,
            color: '#0F0A27', fontFamily: 'var(--font-jakarta)', fontSize: '16px',
            fontWeight: 800, cursor: 'pointer', minHeight: '52px',
            boxShadow: `0 4px 24px ${accentColor}40`,
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)')}
        >
          Jogar Novamente
        </button>
        <button
          onClick={onModules}
          style={{
            width: '100%', padding: '14px', borderRadius: '16px',
            border: '1.5px solid rgba(155,110,243,0.25)', background: 'var(--color-sanctum)',
            color: 'var(--color-alba-muted)', fontFamily: 'var(--font-jakarta)',
            fontSize: '14px', fontWeight: 700, cursor: 'pointer', minHeight: '48px',
            transition: 'border-color 0.2s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(155,110,243,0.5)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(155,110,243,0.25)')}
        >
          Trocar de Módulo
        </button>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

type Screen = 'start' | 'about' | 'modules' | 'quiz' | 'result'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)

  const startQuiz = useCallback((mod: Module) => {
    setActiveModule(mod)
    setSession(startSession(mod))
    setScreen('quiz')
  }, [])

  const handleAnswer = useCallback((optionId: string) => {
    setSession(s => (s ? submitAnswer(s, optionId) : s))
  }, [])

  const handleNext = useCallback(() => {
    setSession(s => {
      if (!s) return s
      if (s.currentIndex < s.questions.length - 1) {
        return advance(s)
      }
      setScreen('result')
      return s
    })
  }, [])

  const exitQuiz = useCallback(() => {
    if (window.confirm('Sair agora? O progresso desta sessão será perdido.')) {
      setSession(null)
      setScreen('modules')
    }
  }, [])

  const accentColor = activeModule ? accentColorFor(activeModule.id) : DEFAULT_ACCENT
  const score = useMemo(() => (session ? getScore(session) : 0), [session])

  if (screen === 'start') return <StartScreen onContinue={() => setScreen('modules')} onAbout={() => setScreen('about')} />
  if (screen === 'about') return <AboutScreen onBack={() => setScreen('start')} />
  if (screen === 'modules') return <ModulesScreen onSelect={startQuiz} onBack={() => setScreen('start')} />
  if (screen === 'result' && session) return (
    <ResultScreen
      score={score} total={session.questions.length}
      onRestart={() => activeModule && startQuiz(activeModule)}
      onModules={() => setScreen('modules')}
      accentColor={accentColor}
    />
  )
  if (screen === 'quiz' && session) return (
    <QuizScreen
      session={session} onAnswer={handleAnswer} onNext={handleNext} onExit={exitQuiz} accentColor={accentColor}
    />
  )
  return <StartScreen onContinue={() => setScreen('modules')} onAbout={() => setScreen('about')} />
}
