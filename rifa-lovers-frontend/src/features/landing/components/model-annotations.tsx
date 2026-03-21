import { useState } from 'react'
import { Html } from '@react-three/drei'
import { Cpu, MemoryStick, HardDrive, Zap, Fan } from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'

interface Hotspot {
  id: string
  label: string
  spec: string
  position: [number, number, number]
  side: 'left' | 'right'
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>
  color: string
}

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
    position: [0.1, -0.6, -0.7],
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

function AnnotationDot({ hotspot }: { hotspot: Hotspot }) {
  const [hovered, setHovered] = useState(false)
  const Icon = hotspot.icon
  const isRight = hotspot.side === 'right'

  return (
    <Html
      position={hotspot.position}
      center
      zIndexRange={[10, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Pulsing dot */}
        <div className="relative size-3 cursor-pointer">
          {!hovered && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: hotspot.color }}
            />
          )}
          <div
            className="relative size-3 rounded-full ring-2 ring-white/80 shadow-lg transition-transform duration-200"
            style={{
              backgroundColor: hotspot.color,
              transform: hovered ? 'scale(1.5)' : 'scale(1)',
            }}
          />
        </div>

        {/* Connector line + Card on hover */}
        {hovered && (
          <div
            className="absolute top-1/2 -translate-y-1/2 flex items-center gap-0 pointer-events-none"
            style={{
              [isRight ? 'left' : 'right']: '12px',
              flexDirection: isRight ? 'row' : 'row-reverse',
            }}
          >
            {/* Line */}
            <div
              className="h-px shrink-0"
              style={{
                width: '48px',
                backgroundColor: hotspot.color,
              }}
            />

            {/* Card */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-xl border border-white/20 whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
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
          </div>
        )}
      </div>
    </Html>
  )
}

export function ModelAnnotations() {
  return (
    <group>
      {HOTSPOTS.map((hotspot) => (
        <AnnotationDot key={hotspot.id} hotspot={hotspot} />
      ))}
    </group>
  )
}
