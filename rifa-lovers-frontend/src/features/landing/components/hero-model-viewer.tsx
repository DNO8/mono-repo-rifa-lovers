import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, OrbitControls, Center } from '@react-three/drei'
import * as THREE from 'three'
import { Spinner } from '@/components/ui/spinner'
import { useModelDrag } from '@/hooks/use-model-drag'
import { ModelAnnotations } from './model-annotations'

const MODEL_PATH = '/models/custom_gaming_pc.glb'

function PCModel({ userRotation, paused }: { userRotation: React.RefObject<number>; paused: React.RefObject<boolean> }) {
  const pivotRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_PATH)
  const idleRotation = useRef(0)

  // Clone scene to avoid shared-state issues & compute uniform scale
  const cloned = scene.clone(true)
  const box = new THREE.Box3().setFromObject(cloned)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const scaleFactor = 3 / maxDim

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
  const { userRotation, paused, pointerHandlers } = useModelDrag()

  return (
    <div
      className="relative mx-auto w-full max-w-[480px] h-[320px] sm:max-w-[560px] sm:h-[380px] md:max-w-[680px] md:h-[460px] cursor-grab active:cursor-grabbing"
      {...pointerHandlers}
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

          <ZoomPassthrough />
          <OrbitControls
            enableRotate={false}
            enablePan={false}
            enableZoom
            enableDamping
            dampingFactor={0.08}
            minDistance={MIN_DISTANCE}
            maxDistance={MAX_DISTANCE}
            target={ORBIT_TARGET}
          />

          <Environment preset="city" />
        </Canvas>
      </Suspense>

      {/* Gradient glow behind model */}
      <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-20 bg-linear-to-br from-primary via-secondary to-tertiary" />
    </div>
  )
}

const ORBIT_TARGET = new THREE.Vector3(0, 0.1, 0)
const MIN_DISTANCE = 1
const MAX_DISTANCE = 8

function ZoomPassthrough() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const canvas = gl.domElement
    const handler = (e: WheelEvent) => {
      const dist = camera.position.distanceTo(ORBIT_TARGET)
      const zoomingOut = e.deltaY > 0
      const zoomingIn = e.deltaY < 0

      if ((zoomingOut && dist >= MAX_DISTANCE - 0.2) || (zoomingIn && dist <= MIN_DISTANCE + 0.2)) {
        e.stopImmediatePropagation()
      }
    }
    canvas.addEventListener('wheel', handler, { capture: true, passive: true })
    return () => canvas.removeEventListener('wheel', handler, { capture: true })
  }, [camera, gl])

  return null
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
