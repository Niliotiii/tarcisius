import { useState, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  image?: string
}

interface Module {
  id: string
  title: string
  subtitle: string
  description: string
  questions: Question[]
  locked: boolean
  accentColor: string
  lockedLabel?: string
}

// ─── Questions — Módulo 1: Objetos Litúrgicos ─────────────────────────────────

const OBJETOS_QUESTIONS: Question[] = [
  {
    id: 101,
    question: 'Como se chama este vaso sagrado, usado para conter o vinho consagrado?',
    image: 'https://images.unsplash.com/photo-1549508477-3e484818ba7d?w=600&h=400&fit=crop&auto=format',
    options: ['Cálice', 'Píxide', 'Patena', 'Ostensório'],
    correct: 0,
  },
  {
    id: 102,
    question: 'O que é o objeto mostrado na imagem, suspenso por correntes e usado para queimar incenso?',
    image: 'https://images.unsplash.com/photo-1673551389008-98e0fcb7f263?w=600&h=400&fit=crop&auto=format',
    options: ['Turíbulo', 'Naveta', 'Caldeirinha', 'Cibório'],
    correct: 0,
  },
  {
    id: 103,
    question: 'O livro mostrado na imagem, colocado sobre o altar com o crucifixo, é o:',
    image: 'https://images.unsplash.com/photo-1527775978467-a86a78e8f791?w=600&h=400&fit=crop&auto=format',
    options: ['Missal Romano', 'Lecionário', 'Evangeliário', 'Antifonário'],
    correct: 0,
  },
  {
    id: 104,
    question: 'Como se chama o prato de metal que recebe a hóstia durante a Missa?',
    options: ['Patena', 'Cálice', 'Píxide', 'Luneta'],
    correct: 0,
  },
  {
    id: 105,
    question: 'Qual é o nome do armário sagrado onde o Santíssimo Sacramento é guardado?',
    options: ['Tabernáculo', 'Ambão', 'Credência', 'Ostensório'],
    correct: 0,
  },
  {
    id: 106,
    question: 'O recipiente usado para guardar e distribuir as hóstias consagradas chama-se:',
    options: ['Píxide', 'Patena', 'Âmbula', 'Cálice'],
    correct: 0,
  },
  {
    id: 107,
    question: 'A peça metálica em forma de meia-lua que sustenta a hóstia no ostensório é a:',
    options: ['Luneta', 'Patena', 'Naveta', 'Âmbula'],
    correct: 0,
  },
  {
    id: 108,
    question: 'A caixinha onde o incenso é guardado antes de ser posto no turíbulo chama-se:',
    options: ['Naveta', 'Âmbula', 'Píxide', 'Caldeirinha'],
    correct: 0,
  },
  {
    id: 109,
    question: 'A mesa lateral onde os vasos sagrados são preparados antes da Missa é a:',
    options: ['Credência', 'Predela', 'Ambão', 'Sedília'],
    correct: 0,
  },
  {
    id: 110,
    question: 'O assento onde o sacerdote e os ministros repousam durante a Missa é a:',
    options: ['Sedília', 'Credência', 'Predela', 'Cathedra'],
    correct: 0,
  },
  {
    id: 111,
    question: 'O pano quadrado branco estendido sobre o altar antes do cálice e da patena é o:',
    options: ['Corporal', 'Sanguinho', 'Purificador', 'Antimínio'],
    correct: 0,
  },
  {
    id: 112,
    question: 'O pequeno pano usado para limpar o cálice após a Comunhão é o:',
    options: ['Purificador', 'Sanguinho', 'Corporal', 'Véu de cálice'],
    correct: 0,
  },
  {
    id: 113,
    question: 'O pano com que o sacerdote cobre as mãos ao carregar o ostensório na bênção é o:',
    options: ['Véu umeral', 'Véu de cálice', 'Humeral', 'Corporal'],
    correct: 0,
  },
  {
    id: 114,
    question: 'O pano que cobre o cálice e a patena antes e depois da Missa é o:',
    options: ['Véu de cálice', 'Corporal', 'Sanguinho', 'Purificador'],
    correct: 0,
  },
  {
    id: 115,
    question: 'A grande vela que representa Cristo Ressuscitado, acesa na Vigília Pascal, é o:',
    options: ['Círio Pascal', 'Tocheiro', 'Candelabro', 'Archote'],
    correct: 0,
  },
  {
    id: 116,
    question: 'A campainha tocada durante a Consagração na Missa é chamada de:',
    options: ['Campainha de altar', 'Gongo', 'Sino', 'Carrilhão'],
    correct: 0,
  },
  {
    id: 117,
    question: 'Os pequenos recipientes que contêm a água e o vinho levados ao altar são as:',
    options: ['Galhetas (âmbulas)', 'Navetas', 'Píxides', 'Caldeirinhas'],
    correct: 0,
  },
  {
    id: 118,
    question: 'O livro do Evangelho ornamentado, carregado em procissão até o ambão, é o:',
    options: ['Evangeliário', 'Missal', 'Lecionário', 'Antifonário'],
    correct: 0,
  },
  {
    id: 119,
    question: 'A cruz carregada à frente das procissões litúrgicas é a:',
    options: ['Cruz processional', 'Crucifixo de altar', 'Cruz peitoral', 'Cruz grega'],
    correct: 0,
  },
  {
    id: 120,
    question: 'O recipiente com água benta e o ramo para aspergir são chamados de:',
    options: ['Caldeirinha e aspersório', 'Naveta e colherinha', 'Âmbula e patena', 'Píxide e luneta'],
    correct: 0,
  },
  {
    id: 121,
    question: 'A plataforma elevada onde fica o altar principal chama-se:',
    options: ['Predela', 'Sedília', 'Credência', 'Ambão'],
    correct: 0,
  },
  {
    id: 122,
    question: 'O estrado elevado de onde o Evangelho é proclamado e a homilia é feita é o:',
    options: ['Ambão', 'Predela', 'Sedília', 'Púlpito lateral'],
    correct: 0,
  },
  {
    id: 123,
    question: 'O recipiente que expõe o Santíssimo Sacramento à adoração dos fiéis é o:',
    options: ['Ostensório', 'Tabernáculo', 'Píxide', 'Teca'],
    correct: 0,
  },
  {
    id: 124,
    question: 'A pequena caixa usada para levar a Comunhão a doentes é a:',
    options: ['Teca', 'Píxide', 'Patena', 'Âmbula'],
    correct: 0,
  },
  {
    id: 125,
    question: 'O suporte metálico onde é colocado o missal durante a Missa é a:',
    options: ['Estante do missal', 'Credência', 'Ambão', 'Lectoeiro'],
    correct: 0,
  },
  {
    id: 126,
    question: 'A pequena colher usada para colocar incenso no turíbulo é a:',
    options: ['Colherinha', 'Espátula', 'Badalo', 'Pinça'],
    correct: 0,
  },
  {
    id: 127,
    question: 'O disco rígido de tecido ou metal que cobre a abertura do cálice é a:',
    options: ['Palinha (pala)', 'Sanguinho', 'Purificador', 'Corporal'],
    correct: 0,
  },
  {
    id: 128,
    question: 'O conjunto formado pelo cálice, patena, purificador e véu é chamado de:',
    options: ['Aparelho do cálice', 'Kit eucarístico', 'Conjunto da credência', 'Vasos do altar'],
    correct: 0,
  },
  {
    id: 129,
    question: 'O suporte ornamentado em que é colocado o círio pascal chama-se:',
    options: ['Tocheiro pascal', 'Candelabro', 'Castiçal', 'Archote'],
    correct: 0,
  },
  {
    id: 130,
    question: 'O turíbulo é suspenso e balançado durante a liturgia por meio de:',
    options: ['Correntes metálicas', 'Cordas de seda', 'Fios de ouro', 'Braçadeiras de couro'],
    correct: 0,
  },
]

// ─── Questions — Módulo 2: Paramentos Litúrgicos ──────────────────────────────

const PARAMENTOS_QUESTIONS: Question[] = [
  {
    id: 201,
    question: 'Qual paramento litúrgico é mostrado na imagem, vestido pelo sacerdote por cima de todos os outros?',
    image: 'https://images.unsplash.com/photo-1649105703438-0992d6844823?w=600&h=400&fit=crop&auto=format',
    options: ['Casula', 'Dalmática', 'Alva', 'Pluvial'],
    correct: 0,
  },
  {
    id: 202,
    question: 'O tecido mostrado na imagem, de cor verde com ornamentos, corresponde a qual período litúrgico?',
    image: 'https://images.unsplash.com/photo-1583250261454-f5cb2c96526d?w=600&h=400&fit=crop&auto=format',
    options: ['Tempo Comum', 'Advento', 'Tempo Pascal', 'Quaresma'],
    correct: 0,
  },
  {
    id: 203,
    question: 'O paramento de cor vermelha mostrado na imagem é usado em:',
    image: 'https://images.unsplash.com/photo-1629246775546-6c637dc2e2e1?w=600&h=400&fit=crop&auto=format',
    options: ['Domingo de Ramos e Pentecostes', 'Natal e Páscoa', 'Tempo Comum', 'Advento'],
    correct: 0,
  },
  {
    id: 204,
    question: 'A veste branca usada por todos os ministros ordenados como base é a:',
    options: ['Alva', 'Casula', 'Dalmática', 'Estola'],
    correct: 0,
  },
  {
    id: 205,
    question: 'A faixa de tecido que o sacerdote usa ao redor da cintura sobre a alva é o:',
    options: ['Cíngulo', 'Amito', 'Manípulo', 'Cordão'],
    correct: 0,
  },
  {
    id: 206,
    question: 'A peça de tecido colocada sobre os ombros antes da alva, cobrindo o pescoço, é o:',
    options: ['Amito', 'Cíngulo', 'Humeral', 'Palia'],
    correct: 0,
  },
  {
    id: 207,
    question: 'A veste exterior do diácono, com mangas largas, diferente da casula, é a:',
    options: ['Dalmática', 'Casula', 'Pluvial', 'Alva'],
    correct: 0,
  },
  {
    id: 208,
    question: 'A veste longa usada em procissões e bênções, aberta na frente em vez de fechada, é o:',
    options: ['Pluvial (Capa pluvial)', 'Casula', 'Dalmática', 'Roquete'],
    correct: 0,
  },
  {
    id: 209,
    question: 'A cor dos paramentos no tempo do Advento é:',
    options: ['Roxo ou Violeta', 'Verde', 'Vermelho', 'Branco'],
    correct: 0,
  },
  {
    id: 210,
    question: 'A cor dos paramentos durante o Natal e a Páscoa é:',
    options: ['Branco ou Dourado', 'Verde', 'Roxo', 'Vermelho'],
    correct: 0,
  },
  {
    id: 211,
    question: 'A estola é o símbolo litúrgico por excelência de:',
    options: ['Autoridade e dignidade sacerdotal', 'Humildade do ministro', 'Penitência quaresmal', 'Alegria pascal'],
    correct: 0,
  },
  {
    id: 212,
    question: 'O roquete difere da alva por ser:',
    options: ['Mais curto e com renda nas bordas', 'Mais longo e sem ornamentos', 'Feito exclusivamente de linho puro', 'Usado apenas por bispos'],
    correct: 0,
  },
  {
    id: 213,
    question: 'A mitra é o toucado litúrgico de formato pontiagudo usado por:',
    options: ['Bispos', 'Sacerdotes', 'Diáconos', 'Acólitos'],
    correct: 0,
  },
  {
    id: 214,
    question: 'O bácolo (cajado pastoral) é símbolo do ministério de:',
    options: ['Bispos e abades', 'Sacerdotes em geral', 'Diáconos', 'Leitores'],
    correct: 0,
  },
  {
    id: 215,
    question: 'A faixa estreita usada pelo diácono cruzando o peito (do ombro à cintura) é a:',
    options: ['Estola diaconal', 'Estola presbiteral', 'Manípulo', 'Dalmática'],
    correct: 0,
  },
  {
    id: 216,
    question: 'Qual cor litúrgica é usada na Quaresma e é símbolo de penitência?',
    options: ['Roxo (Violeta)', 'Vermelho', 'Verde', 'Branco'],
    correct: 0,
  },
  {
    id: 217,
    question: 'O solidéu é o pequeno barrete redondo usado pelos bispos. Sua cor para bispos comuns é:',
    options: ['Violeta', 'Vermelha', 'Branca', 'Dourada'],
    correct: 0,
  },
  {
    id: 218,
    question: 'A cor rosa-salmão (chamada "de gáudio") pode ser usada em dois domingos específicos. Quais são eles?',
    options: ['3º do Advento (Gaudete) e 4º da Quaresma (Laetare)', 'Domingo de Ramos e Pentecostes', 'Natal e Páscoa', '2º e 5º da Quaresma'],
    correct: 0,
  },
  {
    id: 219,
    question: 'A sobrepe­liz é uma veste branca mais curta usada geralmente por:',
    options: ['Coroinhas e ministros não-ordenados', 'Apenas bispos', 'Apenas diáconos', 'Apenas sacerdotes'],
    correct: 0,
  },
  {
    id: 220,
    question: 'O peitoral (cruz peitoral) é uma insígnia usada sobre os paramentos por:',
    options: ['Bispos', 'Sacerdotes', 'Diáconos', 'Acólitos'],
    correct: 0,
  },
  {
    id: 221,
    question: 'A cor litúrgica usada nas Missas de Finados (sufrágio) é:',
    options: ['Preto ou Roxo', 'Branco', 'Verde', 'Vermelho'],
    correct: 0,
  },
  {
    id: 222,
    question: 'A alva deve ser cingida (apertada na cintura) com:',
    options: ['O cíngulo', 'O amito', 'A estola', 'O manípulo'],
    correct: 0,
  },
  {
    id: 223,
    question: 'O paramento que o bispo usa sobre a casula durante a bênção solene com o ostensório é o:',
    options: ['Véu umeral', 'Pluvial', 'Dalmática', 'Mitra'],
    correct: 0,
  },
  {
    id: 224,
    question: 'Qual destes não é considerado um "paramentum" (paramento) litúrgico?',
    options: ['Tabernáculo', 'Casula', 'Estola', 'Dalmática'],
    correct: 0,
  },
  {
    id: 225,
    question: 'O anel episcopal é sinal de fidelidade do bispo à:',
    options: ['Igreja (Diocese)', 'Santa Sé', 'Comunidade local', 'Ordem sacerdotal'],
    correct: 0,
  },
]

// ─── Modules ──────────────────────────────────────────────────────────────────

const MODULES: Module[] = [
  {
    id: 'objetos',
    title: 'Objetos Litúrgicos',
    subtitle: 'Módulo I',
    description: 'Vasos sagrados, livros, móveis e instrumentos usados na celebração da Missa.',
    questions: OBJETOS_QUESTIONS,
    locked: false,
    accentColor: '#E8B84B',
  },
  {
    id: 'paramentos',
    title: 'Paramentos Litúrgicos',
    subtitle: 'Módulo II',
    description: 'Vestes, cores litúrgicas e insígnias usadas pelos ministros ordenados e acólitos.',
    questions: PARAMENTOS_QUESTIONS,
    locked: false,
    accentColor: '#9B6EF3',
  },
  {
    id: 'ritos',
    title: 'Gestos e Ritos',
    subtitle: 'Módulo III',
    description: 'Ações, gestos simbólicos e estrutura das celebrações litúrgicas.',
    questions: [],
    locked: true,
    accentColor: '#4ADE80',
    lockedLabel: 'Em breve',
  },
]

// ─── Ranking ─────────────────────────────────────────────────────────────────

const RANKS = [
  { min: 0, max: 2, title: 'Visitante da Igreja', desc: 'A jornada está começando. Continue explorando!', stars: 1 },
  { min: 3, max: 4, title: 'Fiel Curioso', desc: 'Você conhece alguns fundamentos. Pratique mais!', stars: 2 },
  { min: 5, max: 6, title: 'Acólito Aprendiz', desc: 'Bom conhecimento! Você está no caminho certo.', stars: 2 },
  { min: 7, max: 8, title: 'Servidor Dedicado', desc: 'Excelente! Você domina grande parte da liturgia.', stars: 3 },
  { min: 9, max: 9, title: 'Cerimoniário Experiente', desc: 'Quase perfeito! O altar precisa de você.', stars: 3 },
  { min: 10, max: 10, title: 'Guardião do Altar', desc: 'Perfeito! Você é um mestre da liturgia!', stars: 3 },
]

function getRank(score: number) {
  return RANKS.find(r => score >= r.min && score <= r.max) ?? RANKS[0]
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
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

        <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '11px', color: 'var(--color-alba-muted)', margin: '14px 0 0', opacity: 0.5, textAlign: 'center' }}>
          Em honra de São Tarcísio, mártir acólito
        </p>
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
            width: '36px', height: '36px', borderRadius: '10px', border: '1px solid rgba(155,110,243,0.2)',
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
        {MODULES.map((mod, idx) => (
          <ModuleCard key={mod.id} mod={mod} index={idx} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function ModuleCard({ mod, index, onSelect }: { mod: Module; index: number; onSelect: (mod: Module) => void }) {
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={() => !mod.locked && onSelect(mod)}
      disabled={mod.locked}
      onMouseDown={() => !mod.locked && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: '100%', background: 'var(--color-sanctum)', borderRadius: '20px',
        border: `1.5px solid ${mod.locked ? 'rgba(255,255,255,0.04)' : `${mod.accentColor}30`}`,
        padding: '20px', textAlign: 'left', cursor: mod.locked ? 'default' : 'pointer',
        opacity: mod.locked ? 0.55 : 1,
        transform: pressed ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform 0.15s ease, border-color 0.2s ease',
        display: 'block',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', color: mod.accentColor,
              background: `${mod.accentColor}18`, padding: '3px 8px', borderRadius: '99px',
            }}>
              {mod.subtitle}
            </span>
            {mod.locked && (
              <span style={{
                fontFamily: 'var(--font-jakarta)', fontSize: '10px', fontWeight: 700,
                letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-alba-muted)',
                background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '99px',
              }}>
                {mod.lockedLabel}
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

          {!mod.locked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: mod.accentColor }} />
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

        {/* Accent accent indicator */}
        {!mod.locked && (
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: `${mod.accentColor}15`,
            border: `1.5px solid ${mod.accentColor}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, color: mod.accentColor, fontSize: '20px',
          }}>
            {index === 0 ? '✦' : index === 1 ? '✤' : '◈'}
          </div>
        )}
      </div>

      {!mod.locked && (
        <div style={{
          marginTop: '16px', height: '3px', background: 'var(--color-sanctum-light)',
          borderRadius: '99px', overflow: 'hidden',
        }}>
          <div style={{ height: '100%', width: '100%', background: `linear-gradient(90deg, ${mod.accentColor}60, ${mod.accentColor})`, borderRadius: '99px' }} />
        </div>
      )}
    </button>
  )
}

// ─── Screen: Quiz ─────────────────────────────────────────────────────────────

function QuizScreen({
  questions, currentIndex, selectedAnswer, onAnswer, onNext, score, accentColor,
}: {
  questions: Question[]; currentIndex: number; selectedAnswer: number | null;
  onAnswer: (idx: number) => void; onNext: () => void; score: number; accentColor: string;
}) {
  const q = questions[currentIndex]
  const answered = selectedAnswer !== null
  const letters = ['A', 'B', 'C', 'D']

  function getState(i: number): AnswerState {
    if (!answered) return 'idle'
    if (i === q.correct) return 'correct'
    if (i === selectedAnswer) return 'wrong'
    return 'neutral'
  }

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--color-altar)',
      display: 'flex', flexDirection: 'column', maxWidth: '480px', margin: '0 auto',
    }}>
      <ProgressBar current={currentIndex + 1} total={questions.length} accentColor={accentColor} />

      <div key={currentIndex} className="animate-slide-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '4px 16px 24px', gap: '10px' }}>
        {/* Question number */}
        <span style={{
          fontFamily: 'var(--font-fraunces)', fontSize: '13px', fontStyle: 'italic',
          color: accentColor, fontWeight: 500, letterSpacing: '0.04em',
        }}>
          {String(currentIndex + 1).padStart(2, '0')} de {questions.length}
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
            <div style={{ width: '100%', maxHeight: '200px', background: '#0a0720', overflow: 'hidden' }}>
              <img
                src={q.image}
                alt="Objeto litúrgico mostrado na pergunta"
                style={{ width: '100%', height: '200px', objectFit: 'cover', objectPosition: 'center', display: 'block', opacity: 0.92 }}
              />
              {/* Gold overlay gradient at bottom */}
              <div style={{
                position: 'absolute', left: 0, right: 0,
                height: '60px',
                background: 'linear-gradient(to bottom, transparent, var(--color-sanctum))',
                marginTop: '-60px', pointerEvents: 'none',
              }} />
            </div>
          )}

          <div style={{ padding: '18px 20px 20px', position: 'relative', zIndex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-jakarta)', fontSize: 'clamp(15px, 4vw, 18px)',
              fontWeight: 700, color: 'var(--color-alba)', margin: 0, lineHeight: 1.45,
            }}>
              {q.question}
            </p>
          </div>
        </div>

        {/* Answers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {q.options.map((opt, i) => (
            <AnswerButton
              key={i} label={opt} optionLetter={letters[i]}
              state={getState(i)} disabled={answered} onClick={() => onAnswer(i)}
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
              {currentIndex < questions.length - 1 ? 'Próxima →' : 'Ver Resultado'}
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
            {rank.desc}
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
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)

  const startQuiz = useCallback((mod: Module) => {
    setActiveModule(mod)
    setQuestions(shuffle(mod.questions).slice(0, 10))
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setScreen('quiz')
  }, [])

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    if (idx === questions[currentIndex].correct) setScore(s => s + 1)
  }, [selectedAnswer, questions, currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelectedAnswer(null)
    } else {
      setScreen('result')
    }
  }, [currentIndex, questions.length])

  const accentColor = activeModule?.accentColor ?? '#E8B84B'

  if (screen === 'start') return <StartScreen onContinue={() => setScreen('modules')} />
  if (screen === 'modules') return <ModulesScreen onSelect={startQuiz} onBack={() => setScreen('start')} />
  if (screen === 'result') return (
    <ResultScreen
      score={score} total={questions.length}
      onRestart={() => activeModule && startQuiz(activeModule)}
      onModules={() => setScreen('modules')}
      accentColor={accentColor}
    />
  )
  return (
    <QuizScreen
      questions={questions} currentIndex={currentIndex}
      selectedAnswer={selectedAnswer} onAnswer={handleAnswer}
      onNext={handleNext} score={score} accentColor={accentColor}
    />
  )
}
