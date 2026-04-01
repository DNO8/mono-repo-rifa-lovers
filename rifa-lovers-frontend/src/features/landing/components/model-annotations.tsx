import { useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import { Cpu, MemoryStick, HardDrive, Monitor, BatteryFull } from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'
import type { Hotspot } from '@/types/domain.types'

const HOTSPOTS: Hotspot[] = [
  {
    id: 'chip',
    label: 'Procesador',
    spec: 'Apple M5 – 10 núcleos',
    position: [0, -0.5, -0.2],
    side: 'right',
    icon: Cpu,
    color: '#7B3FE4',
  },
  {
    id: 'ram',
    label: 'RAM',
    spec: '16 GB Unificada',
    position: [0.3, 0.1, 0],
    side: 'right',
    icon: MemoryStick,
    color: '#FF4DA6',
  },
  {
    id: 'storage',
    label: 'SSD',
    spec: '512 GB SSD',
    position: [-0.3, 0.05, 0.5],
    side: 'left',
    icon: HardDrive,
    color: '#FF8A3D',
  },
  {
    id: 'display',
    label: 'Pantalla',
    spec: '13.6" Liquid Retina',
    position: [0, 0.8, 0.6],
    side: 'right',
    icon: Monitor,
    color: '#10B981',
  },
  {
    id: 'battery',
    label: 'Batería',
    spec: 'Hasta 18h de uso',
    position: [0, -0.15, 0.3],
    side: 'left',
    icon: BatteryFull,
    color: '#3B82F6',
  },
]

/* ── SVG layout sizes ── */
interface AnnotationSize {
  lineW: number
  cardW: number
  cardH: number
  cardR: number
  svgW: number
  iconSize: string
  iconBox: string
  labelSize: string
  specSize: string
  dotSize: string
  dotOffset: string
}

const SIZE_DESKTOP: AnnotationSize = {
  lineW: 48, cardW: 180, cardH: 44, cardR: 8, svgW: 228,
  iconSize: 'size-4', iconBox: 'size-7', labelSize: 'text-[11px]', specSize: 'text-[10px]',
  dotSize: 'size-3', dotOffset: '14px',
}

const SIZE_MOBILE: AnnotationSize = {
  lineW: 24, cardW: 110, cardH: 44, cardR: 6, svgW: 134,
  iconSize: 'size-3', iconBox: 'size-5', labelSize: 'text-[9px]', specSize: 'text-[8px]',
  dotSize: 'size-2.5', dotOffset: '10px',
}

/**
 * Rounded-rect path starting from the connector-line side.
 * isRight → starts left-center, clockwise.
 * !isRight → starts right-center, counter-clockwise.
 */
function cardBorderPath(isRight: boolean, s: AnnotationSize): string {
  if (isRight) {
    const x = s.lineW
    const w = s.cardW
    const h = s.cardH
    const r = s.cardR
    return [
      `M${x},${h / 2}`,
      `V${r}`, `Q${x},0,${x + r},0`,
      `H${x + w - r}`, `Q${x + w},0,${x + w},${r}`,
      `V${h - r}`, `Q${x + w},${h},${x + w - r},${h}`,
      `H${x + r}`, `Q${x},${h},${x},${h - r}`,
      `Z`,
    ].join('')
  }
  const w = s.cardW
  const h = s.cardH
  const r = s.cardR
  return [
    `M${w},${h / 2}`,
    `V${r}`, `Q${w},0,${w - r},0`,
    `H${r}`, `Q0,0,0,${r}`,
    `V${h - r}`, `Q0,${h},${r},${h}`,
    `H${w - r}`, `Q${w},${h},${w},${h - r}`,
    `Z`,
  ].join('')
}

function AnnotationDot({
  hotspot,
  active,
  onActivate,
  onDeactivate,
  size: s,
}: {
  hotspot: Hotspot
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
  size: AnnotationSize
}) {
  const Icon = hotspot.icon
  const dotRef = useRef<HTMLDivElement>(null)
  const [flipped, setFlipped] = useState(false)

  const handlePointerEnter = () => {
    const el = dotRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const offset = parseInt(s.dotOffset)
      const margin = 8

      if (hotspot.side === 'right') {
        const wouldOverflow = rect.right + offset + s.svgW > vw - margin
        setFlipped(wouldOverflow)
      } else {
        const wouldOverflow = rect.left - offset - s.svgW < margin
        setFlipped(wouldOverflow)
      }
    }
    onActivate()
  }

  const effectiveSide = flipped
    ? (hotspot.side === 'right' ? 'left' : 'right')
    : hotspot.side
  const isRight = effectiveSide === 'right'

  const cardX = isRight ? s.lineW : 0
  const lineX1 = isRight ? 0 : s.svgW
  const lineX2 = isRight ? s.lineW : s.cardW
  const midY = s.cardH / 2

  return (
    <Html
      position={hotspot.position}
      center
      zIndexRange={active ? [1000, 500] : [10, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        ref={dotRef}
        className="relative"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={onDeactivate}
      >
        {/* Pulsing dot */}
        <div className={`relative ${s.dotSize} cursor-pointer`}>
          {!active && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: hotspot.color }}
            />
          )}
          <div
            className={`relative ${s.dotSize} rounded-full ring-2 ring-white/80 shadow-lg`}
            style={{
              backgroundColor: hotspot.color,
              transform: active ? 'scale(1.5)' : 'scale(1)',
              transition: 'transform 0.15s ease',
            }}
          />
        </div>

        {/* SVG tooltip — always rendered, CSS transitions drive the draw animation */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ [isRight ? 'left' : 'right']: s.dotOffset }}
        >
          <svg
            width={s.svgW}
            height={s.cardH}
            viewBox={`0 0 ${s.svgW} ${s.cardH}`}
            fill="none"
            style={{ overflow: 'visible' }}
          >
            {/* Connector line — draws from dot toward card */}
            <line
              x1={lineX1}
              y1={midY}
              x2={lineX2}
              y2={midY}
              stroke={hotspot.color}
              strokeWidth={1.5}
              strokeDasharray={s.lineW}
              strokeDashoffset={active ? 0 : s.lineW}
              style={{ transition: 'stroke-dashoffset 0.25s ease-out' }}
            />

            {/* Card background fill */}
            <rect
              x={cardX}
              y={0}
              width={s.cardW}
              height={s.cardH}
              rx={s.cardR}
              fill="rgba(255,255,255,0.95)"
              opacity={active ? 0.95 : 0}
              style={{ transition: `opacity 0.15s ease ${active ? '0.35s' : '0s'}` }}
            />

            {/* Card border — draws to 50% from the connection side */}
            <path
              d={cardBorderPath(isRight, s)}
              stroke={hotspot.color}
              strokeWidth={1.5}
              fill="none"
              pathLength={1}
              strokeDasharray="0.5 1"
              strokeDashoffset={active ? 0 : 0.5}
              style={{ transition: `stroke-dashoffset 0.3s ease-in-out ${active ? '0.2s' : '0s'}` }}
            />

            {/* Card content */}
            <foreignObject x={cardX} y={0} width={s.cardW} height={s.cardH}>
              <div
                className="flex items-center gap-1.5 px-2 h-full"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateY(0)' : 'translateY(4px)',
                  transition: `opacity 0.2s ease ${active ? '0.4s' : '0s'}, transform 0.2s ease ${active ? '0.4s' : '0s'}`,
                }}
              >
                <div
                  className={`${s.iconBox} rounded-md flex items-center justify-center shrink-0`}
                  style={{ backgroundColor: `${hotspot.color}15` }}
                >
                  <Icon className={s.iconSize} style={{ color: hotspot.color }} />
                </div>
                <div className="min-w-0">
                  <span
                    className={`block ${s.labelSize} font-bold leading-tight truncate`}
                    style={{ color: hotspot.color }}
                  >
                    {hotspot.label}
                  </span>
                  <span className={`block ${s.specSize} text-gray-600 leading-snug`}>
                    {hotspot.spec}
                  </span>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </Html>
  )
}

export function ModelAnnotations() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const isMobile = useMediaQuery('(max-width: 639px)')
  const size = isMobile ? SIZE_MOBILE : SIZE_DESKTOP

  const handleActivate = (id: string) => setActiveId(id)
  const handleDeactivate = () => setActiveId(null)

  return (
    <group>
      {HOTSPOTS.map((hotspot) => (
        <AnnotationDot
          key={hotspot.id}
          hotspot={hotspot}
          active={activeId === hotspot.id}
          onActivate={() => handleActivate(hotspot.id)}
          onDeactivate={handleDeactivate}
          size={size}
        />
      ))}
    </group>
  )
}
