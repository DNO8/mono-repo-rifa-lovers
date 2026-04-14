import { useState, useCallback } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { Cpu, MemoryStick, HardDrive, Monitor, BatteryFull, Usb, Zap, Camera, X } from 'lucide-react'
import type { Hotspot } from '@/types/domain.types'

const HOTSPOTS: Hotspot[] = [
  {
    id: 'chip',
    label: 'Chip Apple M5',
    spec: 'CPU 10 núcleos · GPU 10 núcleos',
    description: 'Rendimiento ultrarrápido para multitasking, edición de video 4K y apps de IA. Neural Engine de 16 núcleos.',
    position: [0.05, -0.05, 0.15],
    cameraPosition: [1.2, 0.6, 2.5],
    cameraTarget: [0.05, -0.05, 0.15],
    side: 'right',
    icon: Cpu,
    color: '#7B3FE4',
  },
  {
    id: 'ram',
    label: 'Memoria Unificada',
    spec: '16 GB RAM',
    description: 'Memoria compartida entre CPU, GPU y Neural Engine para un rendimiento fluido en todas las tareas.',
    position: [0.25, -0.1, 0.3],
    cameraPosition: [1.5, 0.5, 2.5],
    cameraTarget: [0.25, -0.1, 0.3],
    side: 'right',
    icon: MemoryStick,
    color: '#FF4DA6',
  },
  {
    id: 'storage',
    label: 'Almacenamiento SSD',
    spec: '512 GB SSD',
    description: 'Almacenamiento ultrarrápido para cargar apps y transferir archivos en segundos.',
    position: [-0.3, -0.08, 0.4],
    cameraPosition: [-1.2, 0.5, 2.5],
    cameraTarget: [-0.3, -0.08, 0.4],
    side: 'left',
    icon: HardDrive,
    color: '#FF8A3D',
  },
  {
    id: 'display',
    label: 'Pantalla Liquid Retina',
    spec: '13.6" · 1.000 millones de colores',
    description: 'Resolución impresionante con textos nítidos, colores vibrantes y soporte P3 wide color.',
    position: [0, 0.5, 0.4],
    cameraPosition: [0.8, 1.2, 3],
    cameraTarget: [0, 0.5, 0.4],
    side: 'right',
    icon: Monitor,
    color: '#10B981',
  },
  {
    id: 'battery',
    label: 'Batería',
    spec: 'Hasta 18 horas de uso',
    description: 'Todo el día sin cargador. Reproduce video hasta 18 horas seguidas con una sola carga.',
    position: [0, -0.2, 0.6],
    cameraPosition: [0.8, 0.3, 3],
    cameraTarget: [0, -0.2, 0.6],
    side: 'left',
    icon: BatteryFull,
    color: '#3B82F6',
  },
  {
    id: 'usb-c',
    label: 'Thunderbolt 4',
    spec: '2× puertos USB-C',
    description: 'Transferencia de datos de alta velocidad, carga y conexión a monitores externos.',
    position: [-1, -0.05, 0.3],
    cameraPosition: [-2, 0.5, 2],
    cameraTarget: [-1, -0.05, 0.3],
    side: 'left',
    icon: Usb,
    color: '#F59E0B',
  },
  {
    id: 'magsafe',
    label: 'MagSafe',
    spec: 'Carga magnética segura',
    description: 'Conector magnético que se conecta y desconecta fácilmente para proteger tu MacBook.',
    position: [-1.05, 0.01, 0.15],
    cameraPosition: [-2, 0.5, 1.5],
    cameraTarget: [-1.05, 0.01, 0.15],
    side: 'left',
    icon: Zap,
    color: '#EF4444',
  },
  {
    id: 'camera',
    label: 'Cámara FaceTime HD',
    spec: '1080p · Encuadre Centrado',
    description: 'Cámara de alta definición con Encuadre Centrado que te sigue automáticamente en videollamadas.',
    position: [0, 1.2, 1],
    cameraPosition: [0.8, 1.8, 3],
    cameraTarget: [0, 1.2, 1],
    side: 'right',
    icon: Camera,
    color: '#8B5CF6',
  },
]

/* ── Dot component ── */
function AnnotationDot({
  hotspot,
  active,
  onClick,
}: {
  hotspot: Hotspot
  active: boolean
  onClick: () => void
}) {
  const Icon = hotspot.icon

  // Ref callback: when panel mounts, measure and reposition to stay within canvas bounds
  const panelRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    // Allow the browser to lay out the element first
    requestAnimationFrame(() => {
      const container = node.closest('canvas')?.parentElement
      if (!container) return

      const panelRect = node.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const margin = 8

      // Horizontal: flip side if overflowing
      if (panelRect.right > containerRect.right - margin) {
        node.style.left = 'auto'
        node.style.right = '20px'
      } else if (panelRect.left < containerRect.left + margin) {
        node.style.right = 'auto'
        node.style.left = '20px'
      }

      // Vertical: shift if overflowing
      const freshRect = node.getBoundingClientRect()
      if (freshRect.top < containerRect.top + margin) {
        const shift = containerRect.top + margin - freshRect.top
        node.style.transform = `translateY(calc(-50% + ${shift}px))`
      } else if (freshRect.bottom > containerRect.bottom - margin) {
        const shift = containerRect.bottom - margin - freshRect.bottom
        node.style.transform = `translateY(calc(-50% + ${shift}px))`
      }
    })
  }, [])

  return (
    <Html
      position={hotspot.position}
      center
      zIndexRange={active ? [1000, 500] : [10, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative" onClick={onClick}>
        {/* Pulsing dot */}
        <div className="relative size-3.5 cursor-pointer">
          {!active && (
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-40"
              style={{ backgroundColor: hotspot.color }}
            />
          )}
          <div
            className="relative size-3.5 rounded-full ring-2 ring-white/80 shadow-lg"
            style={{
              backgroundColor: hotspot.color,
              transform: active ? 'scale(1.6)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>

        {/* Floating info panel */}
        {active && (
          <div
            ref={panelRefCallback}
            className="absolute z-50"
            style={{
              top: '50%',
              transform: 'translateY(-50%)',
              [hotspot.side === 'right' ? 'left' : 'right']: '20px',
            }}
          >
            <div
              className="relative w-[160px] min-[375px]:w-[200px] sm:w-[240px] rounded-xl overflow-hidden backdrop-blur-xl border border-white/15 shadow-2xl"
              style={{ background: 'rgba(10, 10, 10, 0.85)' }}
            >
              {/* Accent bar */}
              <div className="h-0.5 w-full" style={{ background: hotspot.color }} />

              {/* Close button */}
              <button
                className="absolute top-2 right-2 size-5 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); onClick() }}
              >
                <X className="size-3 text-white/70" />
              </button>

              {/* Content */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${hotspot.color}20` }}
                  >
                    <Icon className="size-4" style={{ color: hotspot.color }} />
                  </div>
                  <div className="min-w-0">
                    <span
                      className="block text-[10px] min-[375px]:text-xs font-bold leading-tight"
                      style={{ color: hotspot.color }}
                    >
                      {hotspot.label}
                    </span>
                    <span className="block text-[9px] min-[375px]:text-[10px] text-white/60 leading-snug">
                      {hotspot.spec}
                    </span>
                  </div>
                </div>
                {hotspot.description && (
                  <p className="hidden min-[375px]:block text-[10px] text-white/50 leading-relaxed">
                    {hotspot.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Html>
  )
}

/* ── Helper: rotate a point around Y axis ── */
const _vec = new THREE.Vector3()
function rotateY(point: [number, number, number], angle: number): [number, number, number] {
  _vec.set(...point).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle)
  return [_vec.x, _vec.y, _vec.z]
}

/* ── Annotations group ── */
export function ModelAnnotations({
  onAnimateCamera,
  onResetCamera,
  lock,
  unlock,
  pivotRef,
}: {
  onAnimateCamera: React.RefObject<((pos: [number, number, number], target: [number, number, number]) => void) | null>
  onResetCamera: React.RefObject<(() => void) | null>
  lock: () => void
  unlock: () => void
  pivotRef: React.RefObject<THREE.Group | null>
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const handleClick = useCallback((hotspot: Hotspot) => {
    if (activeId === hotspot.id) {
      // Deactivate — reset camera
      setActiveId(null)
      onResetCamera.current?.()
      unlock()
    } else {
      // Activate — lock drag + animate camera
      // Rotate camera coordinates by the model's current Y rotation
      const yAngle = pivotRef.current?.rotation.y ?? 0
      const worldCamPos = rotateY(hotspot.cameraPosition, yAngle)
      const worldCamTarget = rotateY(hotspot.cameraTarget, yAngle)
      setActiveId(hotspot.id)
      lock()
      onAnimateCamera.current?.(worldCamPos, worldCamTarget)
    }
  }, [activeId, onAnimateCamera, onResetCamera, lock, unlock, pivotRef])

  return (
    <group>
      {HOTSPOTS.map((hotspot) => (
        <AnnotationDot
          key={hotspot.id}
          hotspot={hotspot}
          active={activeId === hotspot.id}
          onClick={() => handleClick(hotspot)}
        />
      ))}
    </group>
  )
}
