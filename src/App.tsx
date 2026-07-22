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

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total, accentColor }: { current: number; total: number; accentColor: string }) {
  const pct = (current / total) * 100
  return (
    <div style={{ width: '100%', padding: '16px 16px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--color-alba-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Pergunta
        </span>
        <span style={{ fontFamily: 'var(--font-fraunces)', fontSize: '14px', color: accentColor, fontWeight: 700 }}>
          {current} <span style={{ color: 'var(--color-alba-muted)', fontWeight: 400 }}>/ {total}</span>
        </span>
      </div>
      <div style={{ height: '4px', background: 'var(--color-sanctum-light)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: accentColor,
          borderRadius: '99px',
          transition: 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: `0 0 8px ${accentColor}88`,
        }} />
      </div>
    </div>
  )
}

// ─── Answer Button ────────────────────────────────────────────────────────────

type AnswerState = 'idle' | 'correct' | 'wrong' | 'neutral'

function AnswerButton({
  label, optionLetter, state, disabled, onClick,
}: {
  label: string; optionLetter: string; state: AnswerState; disabled: boolean; onClick: () => void
}) {
  const cfg = {
    idle: { bg: 'var(--color-sanctum-light)', border: 'transparent', text: 'var(--color-alba)', letterBg: 'rgba(155,110,243,0.18)', letterColor: 'var(--color-violet)', opacity: 1 },
    correct: { bg: 'rgba(74,222,128,0.15)', border: 'var(--color-viridis)', text: 'var(--color-viridis)', letterBg: 'transparent', letterColor: 'var(--color-viridis)', opacity: 1 },
    wrong: { bg: 'rgba(224,82,82,0.15)', border: 'var(--color-rubrum)', text: 'var(--color-rubrum)', letterBg: 'transparent', letterColor: 'var(--color-rubrum)', opacity: 1 },
    neutral: { bg: 'var(--color-sanctum)', border: 'transparent', text: 'var(--color-alba-muted)', letterBg: 'transparent', letterColor: 'var(--color-alba-muted)', opacity: 0.45 },
  }[state]

  const icon = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : null

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '13px 16px', borderRadius: '14px', border: `1.5px solid ${cfg.border}`,
        background: cfg.bg, color: cfg.text, opacity: cfg.opacity,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease', textAlign: 'left',
        minHeight: '52px', fontFamily: 'var(--font-jakarta)',
        fontSize: '15px', fontWeight: 600, lineHeight: 1.35,
      }}
    >
      <span style={{
        minWidth: '28px', height: '28px', borderRadius: '8px', background: cfg.letterBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-fraunces)', fontSize: '14px', fontWeight: 700, fontStyle: 'italic',
        color: cfg.letterColor, flexShrink: 0,
      }}>
        {icon ?? optionLetter}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  )
}

// ─── Star Icon ────────────────────────────────────────────────────────────────

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? '#E8B84B' : 'none'} stroke={filled ? '#E8B84B' : '#3D2F7A'} strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

// ─── Screen: Start ────────────────────────────────────────────────────────────

function StartScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: '320px', height: '320px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(155,110,243,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-halo-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '360px', width: '100%' }}>
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
          margin: '0 0 32px', textAlign: 'center', lineHeight: 1.65, maxWidth: '270px',
        }}>
          Treine seu conhecimento sobre a liturgia da Igreja Católica de forma divertida.
        </p>

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
      {/* Header */}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            width: '48px', height: '48px', borderRadius: '10px', border: '1px solid rgba(155,110,243,0.2)',
            background: 'var(--color-sanctum)', color: 'var(--color-alba-muted)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-jakarta)', fontSize: '16px', flexShrink: 0,
          }}
        >
          ←
        </button>
        <div>
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '22px', fontWeight: 800, fontStyle: 'italic', color: 'var(--color-alba)', margin: 0, lineHeight: 1.1 }}>
            Módulos
          </h2>
          <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--color-alba-muted)', margin: 0, fontWeight: 600 }}>
            Escolha um tema para estudar
          </p>
        </div>
      </div>

      {/* Monstrance watermark */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0 12px', opacity: 0.07, pointerEvents: 'none' }}>
        <Monstrance size={120} opacity={1} />
      </div>

      {/* Module cards */}
      <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {modules.map((mod, idx) => (
          <ModuleCard key={mod.id} mod={mod} index={idx} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function ModuleCard({ mod, index, onSelect }: { mod: Module; index: number; onSelect: (mod: Module) => void }) {
  const [pressed, setPressed] = useState(false)
  const locked = mod.status === 'locked'
  const accentColor = accentColorFor(mod.id)

  return (
    <button
      onClick={() => !locked && onSelect(mod)}
      disabled={locked}
      onMouseDown={() => !locked && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: '100%', background: 'var(--color-sanctum)', borderRadius: '20px',
        border: `1.5px solid ${locked ? 'rgba(255,255,255,0.04)' : `${accentColor}30`}`,
        padding: '20px', textAlign: 'left', cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.55 : 1,
        transform: pressed ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform 0.15s ease, border-color 0.2s ease',
        display: 'block', minHeight: '48px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: accentColor,
              background: `${accentColor}18`, padding: '3px 8px', borderRadius: '99px',
            }}>
              {mod.subtitle}
            </span>
            {locked && (
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-alba-muted)',
                background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '99px',
              }}>
                {LOCKED_LABEL}
              </span>
            )}
          </div>

          <h3 style={{
            fontFamily: 'var(--font-fraunces)', fontSize: '20px', fontWeight: 800,
            fontStyle: 'italic', color: 'var(--color-alba)', margin: '0 0 6px', lineHeight: 1.15,
          }}>
            {mod.title}
          </h3>

          <p style={{
            fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--color-alba-muted)',
            margin: '0 0 14px', lineHeight: 1.55,
          }}>
            {mod.description}
          </p>

          {!locked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor }} />
                <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--color-alba-muted)', fontWeight: 600 }}>
                  {mod.questions.length} perguntas
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(155,110,243,0.5)' }} />
                <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '12px', color: 'var(--color-alba-muted)', fontWeight: 600 }}>
                  10 por sessão
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Accent indicator */}
        {!locked && (
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: `${accentColor}15`,
            border: `1.5px solid ${accentColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: accentColor, fontSize: '20px',
          }}>
            {index === 0 ? '✦' : index === 1 ? '✤' : '◈'}
          </div>
        )}
      </div>

      {!locked && (
        <div style={{
          marginTop: '16px', height: '3px', background: 'var(--color-sanctum-light)',
          borderRadius: '99px', overflow: 'hidden',
        }}>
          <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${accentColor}60, ${accentColor})`, borderRadius: '99px' }} />
        </div>
      )}
    </button>
  )
}

// ─── Screen: Quiz ─────────────────────────────────────────────────────────────

function QuizScreen({
  session, onAnswer, onNext, accentColor,
}: {
  session: QuizSession; onAnswer: (optionId: string) => void; onNext: () => void; accentColor: string;
}) {
  const q: Question = session.questions[session.currentIndex]
  const currentAnswer = session.answers.find(a => a.questionId === q.id)
  const answered = currentAnswer !== undefined
  const score = getScore(session)
  const letters = ['A', 'B', 'C', 'D', 'E', 'F']

  function getState(optionId: string): AnswerState {
    if (!answered) return 'idle'
    if (optionId === q.correctOptionId) return 'correct'
    if (optionId === currentAnswer!.selectedOptionId) return 'wrong'
    return 'neutral'
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto',
    }}>
      <ProgressBar current={session.currentIndex + 1} total={session.questions.length} accentColor={accentColor} />

      <div key={session.currentIndex} className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 16px 24px', gap: '10px' }}>
        {/* Question number */}
        <span style={{
          fontFamily: 'var(--font-fraunces)', fontSize: '13px', fontStyle: 'italic',
          color: accentColor, fontWeight: 500, letterSpacing: '0.04em',
        }}>
          {String(session.currentIndex + 1).padStart(2, '0')} de {session.questions.length}
        </span>

        {/* Question card */}
        <div style={{
          background: 'var(--color-sanctum)', borderRadius: '20px',
          border: '1px solid rgba(155,110,243,0.1)', overflow: 'hidden', position: 'relative',
        }}>
          {/* Watermark */}
          <div style={{
            position: 'absolute', top: '-20px', right: '-20px', opacity: 0.05,
            pointerEvents: 'none', userSelect: 'none',
          }}>
            <Monstrance size={140} opacity={1} color={accentColor} />
          </div>

          {/* Image (if any) */}
          {q.image && (
            <div style={{ width: '100%', maxHeight: '35vh', background: '#0a0720', overflow: 'hidden', position: 'relative' }}>
              <img
                src={q.image.src}
                alt={q.image.alt}
                style={{ width: '100%', maxHeight: '35vh', objectFit: 'contain', objectPosition: 'center', display: 'block', opacity: 0.92 }}
              />
              {/* Gold overlay gradient at bottom */}
              <div style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                height: '60px',
                background: 'linear-gradient(to bottom, transparent, var(--color-sanctum))',
                pointerEvents: 'none',
              }} />
            </div>
          )}

          <div style={{ padding: '18px 20px 20px', position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(15px, 4vw, 18px)',
              fontWeight: 700, color: 'var(--color-alba)', margin: 0, lineHeight: 1.45,
            }}>
              {q.prompt}
            </p>
          </div>
        </div>

        {/* Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {q.options.map((opt, i) => (
            <AnswerButton
              key={opt.id} label={opt.label} optionLetter={letters[i]}
              state={getState(opt.id)} disabled={answered} onClick={() => onAnswer(opt.id)}
            />
          ))}
        </div>

        {/* Next button */}
        {answered && (
          <div className="animate-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '13px', color: 'var(--color-alba-muted)' }}>
              Pontuação: <span style={{ color: accentColor, fontWeight: 700 }}>{score}</span>
            </div>
            <button
              onClick={onNext}
              style={{
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: `linear-gradient(135deg, ${accentColor}CC, ${accentColor})`,
                color: '#0F0A27', fontFamily: 'var(--font-jakarta)', fontSize: '14px',
                fontWeight: 800, cursor: 'pointer', minHeight: '48px',
                boxShadow: `0 4px 16px ${accentColor}44`,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)')}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)')}
            >
              {session.currentIndex < session.questions.length - 1 ? 'Próxima →' : 'Ver Resultado'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen: Result ───────────────────────────────────────────────────────────

function ResultScreen({ score, total, onRestart, onModules, accentColor }: {
  score: number; total: number; onRestart: () => void; onModules: () => void; accentColor: string;
}) {
  const rank = getRank(score)
  const pct = Math.round((score / total) * 100)
  const ringR = 54
  const circ = 2 * Math.PI * ringR
  const offset = circ - (pct / 100) * circ

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '32px 20px',
      maxWidth: '480px', margin: '0 auto',
    }}>
      <div className="animate-halo-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
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
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

type Screen = 'start' | 'modules' | 'quiz' | 'result'

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

  const accentColor = activeModule ? accentColorFor(activeModule.id) : DEFAULT_ACCENT
  const score = useMemo(() => (session ? getScore(session) : 0), [session])

  if (screen === 'start') return <StartScreen onContinue={() => setScreen('modules')} />
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
      session={session} onAnswer={handleAnswer} onNext={handleNext} accentColor={accentColor}
    />
  )
  return <StartScreen onContinue={() => setScreen('modules')} />
}
