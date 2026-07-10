import './Die.css'

const FACE_ROTATIONS: Record<number, string> = {
  1: 'rotateX(0deg) rotateY(0deg)',
  2: 'rotateX(0deg) rotateY(-90deg)',
  3: 'rotateX(-90deg) rotateY(0deg)',
  4: 'rotateX(90deg) rotateY(0deg)',
  5: 'rotateX(0deg) rotateY(90deg)',
  6: 'rotateX(0deg) rotateY(180deg)',
}

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
}

function DieFace({ value }: { value: number }) {
  const pips = PIP_LAYOUTS[value]

  return (
    <div className={`die-face die-face--${value}`}>
      {Array.from({ length: 9 }, (_, i) => {
        const row = Math.floor(i / 3)
        const col = i % 3
        const on = pips.some(([r, c]) => r === row && c === col)
        return <span key={i} className={`die-pip ${on ? 'die-pip--on' : ''}`} />
      })}
    </div>
  )
}

interface DieProps {
  value: number | null
  isRolling: boolean
  size?: 'normal' | 'large'
  variant?: 'normal' | 'bridge'
}

export function Die({ value, isRolling, size = 'normal', variant = 'normal' }: DieProps) {
  const transform = !isRolling && value !== null ? FACE_ROTATIONS[value] : undefined

  return (
    <div
      className={[
        'die-scene',
        size === 'large' ? 'die-scene--large' : '',
        variant === 'bridge' ? 'die-scene--bridge' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'die-cube',
          isRolling ? 'die-cube--rolling' : '',
          !isRolling && value !== null ? 'die-cube--settled' : '',
          !isRolling && value === null ? 'die-cube--idle' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={transform ? { transform } : undefined}
      >
        <DieFace value={1} />
        <DieFace value={6} />
        <DieFace value={2} />
        <DieFace value={5} />
        <DieFace value={3} />
        <DieFace value={4} />
      </div>
    </div>
  )
}
