import { Suspense, useRef, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, OrbitControls, Center } from '@react-three/drei'
import * as THREE from 'three'
import { Spinner } from '@/components/ui/spinner'
import { ModelAnnotations } from './model-annotations'

const MODEL_PATH = '/models/custom_gaming_pc.glb'

function PCModel({ userRotation, paused }: { userRotation: React.RefObject<number>; paused: React.RefObject<boolean> }) {
  const pivotRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_PATH)
  const idleRotation = useRef(0)

  // Clone scene to avoid shared-state issues & compute uniform scale
  const { cloned, scaleFactor } = useMemo(() => {
    const cloned = scene.clone(true)
    const box = new THREE.Box3().setFromObject(cloned)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    return { cloned, scaleFactor: 3 / maxDim }
  }, [scene])

  // Pivot group at origin rotates Y only → model spins in place
  useFrame((_, delta) => {
    if (pivotRef.current) {
      if (!paused.current) {
        idleRotation.current += delta * 0.2
      }
      pivotRef.current.rotation.y = idleRotation.current + userRotation.current
    }
  })

  return (
    <group ref={pivotRef} dispose={null}>
      <Center>
        <primitive object={cloned} scale={scaleFactor} />
      </Center>
      <ModelAnnotations />
    </group>
  )
}

function LoadingFallback3D() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary mt-3">Cargando modelo 3D...</p>
      </div>
    </div>
  )
}

export function HeroModelViewer() {
  const dragRef = useRef({ active: false, startX: 0, rotation: 0 })
  const userRotation = useRef(0)
  const paused = useRef(false)
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => {
      paused.current = false
    }, 5000)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current.active = true
    dragRef.current.startX = e.clientX
    dragRef.current.rotation = userRotation.current
    paused.current = true
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    userRotation.current = dragRef.current.rotation + dx * 0.01
  }

  const onPointerUp = () => {
    dragRef.current.active = false
    scheduleResume()
  }

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto w-full max-w-[360px] h-[280px] sm:max-w-[400px] sm:h-[320px] md:max-w-[480px] md:h-[400px] cursor-grab active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Suspense fallback={<LoadingFallback3D />}>
        <Canvas
          camera={{ position: [2.5, 1.2, 5], fov: 35, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-4, 3, -4]} intensity={0.4} color="#7B3FE4" />
          <pointLight position={[2, 4, 0]} intensity={0.6} color="#FF4DA6" />
          <pointLight position={[-2, 2, 3]} intensity={0.3} color="#FF8A3D" />

          <InnerScene userRotation={userRotation} paused={paused} />

          <OrbitControls
            enableRotate={false}
            enablePan={false}
            enableZoom
            minDistance={1}
            maxDistance={8}
            target={[0, 0.1, 0]}
          />

          <Environment preset="city" />
        </Canvas>
      </Suspense>

      {/* Gradient glow behind model */}
      <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-20 bg-linear-to-br from-primary via-secondary to-tertiary" />
    </div>
  )
}

function InnerScene({ userRotation, paused }: { userRotation: React.RefObject<number>; paused: React.RefObject<boolean> }) {
  return (
    <>
      <PCModel userRotation={userRotation} paused={paused} />
      <ContactShadows position={[0, 0, 0]} opacity={0.3} scale={5} blur={2.5} />
    </>
  )
}

useGLTF.preload(MODEL_PATH)
