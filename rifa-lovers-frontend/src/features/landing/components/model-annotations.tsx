import { useState } from 'react'
import { Html } from '@react-three/drei'
import { Cpu, MemoryStick, HardDrive, Zap, Fan } from 'lucide-react'
import type { Hotspot } from '@/types/domain.types'

const HOTSPOTS: Hotspot[] = [
  {
    id: 'gpu',
    label: 'GPU',
    spec: 'RTX 4070 Ti Super',
    position: [-0.1, 0, -0.3],
    side: 'right',
    icon: Cpu,
    color: '#7B3FE4',
  },
  {
    id: 'ram',
    label: 'RAM',
    spec: 'DDR5 32GB 6000MHz',
    position: [0.1, 0.3, -0.1],
    side: 'right',
    icon: MemoryStick,
    color: '#FF4DA6',
  },
  {
    id: 'psu',
    label: 'Fuente',
    spec: '850W 80+ Gold',
    position: [0.1, -0.6, -0.5],
    side: 'left',
    icon: Zap,
    color: '#FF8A3D',
  },
  {
    id: 'storage',
    label: 'SSD',
    spec: 'NVMe 1TB Gen4',
    position: [0.2, -0.3, -0.3],
    side: 'left',
    icon: HardDrive,
    color: '#10B981',
  },
  {
    id: 'cooler',
    label: 'Cooler',
    spec: 'AIO 240mm RGB',
    position: [-0.1, 0.3, 0.5],
    side: 'right',
    icon: Fan,
    color: '#3B82F6',
  },
]

/* ── SVG layout constants ── */
const LINE_W = 48
const CARD_W = 180
const CARD_H = 44
const CARD_R = 8
const SVG_W = LINE_W + CARD_W

/**
 * Rounded-rect path starting from the connector-line side.
 * isRight → starts left-center, clockwise.
 * !isRight → starts right-center, counter-clockwise.
 */
function cardBorderPath(isRight: boolean): string {
  if (isRight) {
    const x = LINE_W
    const w = CARD_W
    const h = CARD_H
    const r = CARD_R
    return [
      `M${x},${h / 2}`,
      `V${r}`, `Q${x},0,${x + r},0`,
      `H${x + w - r}`, `Q${x + w},0,${x + w},${r}`,
      `V${h - r}`, `Q${x + w},${h},${x + w - r},${h}`,
      `H${x + r}`, `Q${x},${h},${x},${h - r}`,
      `Z`,
    ].join('')
  }
  const w = CARD_W
  const h = CARD_H
  const r = CARD_R
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
}: {
  hotspot: Hotspot
  active: boolean
  onActivate: () => void
  onDeactivate: () => void
}) {
  const Icon = hotspot.icon
  const isRight = hotspot.side === 'right'

  const cardX = isRight ? LINE_W : 0
  const lineX1 = isRight ? 0 : SVG_W
  const lineX2 = isRight ? LINE_W : CARD_W
  const midY = CARD_H / 2

  return (
    <Html
      position={hotspot.position}
      center
      zIndexRange={active ? [100, 50] : [10, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="relative"
        onPointerEnter={onActivate}
        onPointerLeave={onDeactivate}
      >
        {/* Pulsing dot */}
        <div className="relative size-3 cursor-pointer">
          {!active && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: hotspot.color }}
            />
          )}
          <div
            className="relative size-3 rounded-full ring-2 ring-white/80 shadow-lg"
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
          style={{ [isRight ? 'left' : 'right']: '14px', zIndex: 50 }}
        >
          <svg
            width={SVG_W}
            height={CARD_H}
            viewBox={`0 0 ${SVG_W} ${CARD_H}`}
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
              strokeDasharray={LINE_W}
              strokeDashoffset={active ? 0 : LINE_W}
              style={{ transition: 'stroke-dashoffset 0.25s ease-out' }}
            />

            {/* Card background fill */}
            <rect
              x={cardX}
              y={0}
              width={CARD_W}
              height={CARD_H}
              rx={CARD_R}
              fill="rgba(255,255,255,0.95)"
              opacity={active ? 0.95 : 0}
              style={{ transition: `opacity 0.15s ease ${active ? '0.35s' : '0s'}` }}
            />

            {/* Card border — draws to 50% from the connection side */}
            <path
              d={cardBorderPath(isRight)}
              stroke={hotspot.color}
              strokeWidth={1.5}
              fill="none"
              pathLength={1}
              strokeDasharray="0.5 1"
              strokeDashoffset={active ? 0 : 0.5}
              style={{ transition: `stroke-dashoffset 0.3s ease-in-out ${active ? '0.2s' : '0s'}` }}
            />

            {/* Card content */}
            <foreignObject x={cardX} y={0} width={CARD_W} height={CARD_H}>
              <div
                className="flex items-center gap-2 px-3 h-full"
                style={{
                  opacity: active ? 1 : 0,
                  transform: active ? 'translateY(0)' : 'translateY(4px)',
                  transition: `opacity 0.2s ease ${active ? '0.4s' : '0s'}, transform 0.2s ease ${active ? '0.4s' : '0s'}`,
                }}
              >
                <div
                  className="size-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${hotspot.color}15` }}
                >
                  <Icon className="size-4" style={{ color: hotspot.color }} />
                </div>
                <div>
                  <span
                    className="block text-[11px] font-bold leading-tight"
                    style={{ color: hotspot.color }}
                  >
                    {hotspot.label}
                  </span>
                  <span className="block text-[10px] text-gray-600 leading-tight">
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
        />
      ))}
    </group>
  )
}
