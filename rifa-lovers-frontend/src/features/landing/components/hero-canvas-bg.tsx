import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, ContactShadows, OrbitControls, Center, Stars, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Spinner } from '@/components/ui/spinner'
import { useModelDrag } from '@/hooks/use-model-drag'
import { ModelAnnotations } from './model-annotations'

const MODEL_PATH = '/models/macbook-2k-draco.glb'
const DEFAULT_CAMERA_POS = new THREE.Vector3(2.5, 1.2, 5)
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0.1, 0)
const ORBIT_TARGET = new THREE.Vector3(0, 0.1, 0)
const MIN_DISTANCE = 5
const MAX_DISTANCE = 8
const ANIM_DURATION = 0.6

function MacBookModel({
  userRotation,
  paused,
  onAnimateCamera,
  onResetCamera,
  lock,
  unlock,
  isDesktop,
}: {
  userRotation: React.RefObject<number>
  paused: React.RefObject<boolean>
  onAnimateCamera: React.RefObject<((pos: [number, number, number], target: [number, number, number]) => void) | null>
  onResetCamera: React.RefObject<(() => void) | null>
  lock: () => void
  unlock: () => void
  isDesktop: boolean
}) {
  const pivotRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(MODEL_PATH)
  const idleRotation = useRef(0)

  const cloned = scene.clone(true)
  const box = new THREE.Box3().setFromObject(cloned)
  const size = new THREE.Vector3()
  box.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z)
  const scaleFactor = 3 / maxDim

  useFrame((_, delta) => {
    if (pivotRef.current) {
      if (!paused.current) {
        idleRotation.current += delta * 0.2
      }
      pivotRef.current.rotation.y = idleRotation.current + userRotation.current
    }
  })

  return (
    <group ref={pivotRef} dispose={null} position={[isDesktop ? 1.6 : 0, 0, 0]}>
      <Center>
        <primitive object={cloned} scale={scaleFactor} />
      </Center>
      <ModelAnnotations
        onAnimateCamera={onAnimateCamera}
        onResetCamera={onResetCamera}
        lock={lock}
        unlock={unlock}
        pivotRef={pivotRef}
      />
    </group>
  )
}

function CameraAnimator({
  animateCameraRef,
  resetCameraRef,
  controlsRef,
}: {
  animateCameraRef: React.RefObject<((pos: [number, number, number], target: [number, number, number]) => void) | null>
  resetCameraRef: React.RefObject<(() => void) | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controlsRef: React.RefObject<any>
}) {
  const camera = useThree((s) => s.camera)
  const animating = useRef(false)
  const progress = useRef(0)
  const startPos = useRef(new THREE.Vector3())
  const endPos = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())
  const endTarget = useRef(new THREE.Vector3())
  const currentTarget = useRef(DEFAULT_CAMERA_TARGET.clone())

  useEffect(() => {
    const disableControls = () => {
      if (controlsRef.current) controlsRef.current.enabled = false
    }

    animateCameraRef.current = (pos, target) => {
      disableControls()
      startPos.current.copy(camera.position)
      endPos.current.set(...pos)
      startTarget.current.copy(currentTarget.current)
      endTarget.current.set(...target)
      progress.current = 0
      animating.current = true
    }

    resetCameraRef.current = () => {
      disableControls()
      startPos.current.copy(camera.position)
      endPos.current.copy(DEFAULT_CAMERA_POS)
      startTarget.current.copy(currentTarget.current)
      endTarget.current.copy(DEFAULT_CAMERA_TARGET)
      progress.current = 0
      animating.current = true
    }
  }, [animateCameraRef, resetCameraRef, camera, controlsRef])

  useFrame((_, delta) => {
    if (!animating.current) return
    progress.current = Math.min(progress.current + delta / ANIM_DURATION, 1)
    const t = easeInOutCubic(progress.current)

    camera.position.lerpVectors(startPos.current, endPos.current, t)
    currentTarget.current.lerpVectors(startTarget.current, endTarget.current, t)
    camera.lookAt(currentTarget.current)

    if (controlsRef.current) {
      controlsRef.current.target.copy(currentTarget.current)
      controlsRef.current.update()
    }

    if (progress.current >= 1) {
      animating.current = false
      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }
    }
  })

  return null
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function LoadingFallback3D() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-sm text-white/40 mt-3">Cargando escena 3D...</p>
      </div>
    </div>
  )
}

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

function InnerScene({
  userRotation,
  paused,
  onAnimateCamera,
  onResetCamera,
  lock,
  unlock,
  isDesktop,
}: {
  userRotation: React.RefObject<number>
  paused: React.RefObject<boolean>
  onAnimateCamera: React.RefObject<((pos: [number, number, number], target: [number, number, number]) => void) | null>
  onResetCamera: React.RefObject<(() => void) | null>
  lock: () => void
  unlock: () => void
  isDesktop: boolean
}) {
  return (
    <>
      <Stars radius={80} depth={60} count={3000} factor={4} fade speed={0.8} saturation={0.5} />
      <Sparkles count={40} scale={4} size={2} speed={0.3} color="#FF4DA6" noise={0.5} />
      <MacBookModel
        userRotation={userRotation}
        paused={paused}
        onAnimateCamera={onAnimateCamera}
        onResetCamera={onResetCamera}
        lock={lock}
        unlock={unlock}
        isDesktop={isDesktop}
      />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.15} scale={5} blur={2.5} color="#000000" />
    </>
  )
}

interface HeroCanvasBGProps {
  isVisible?: boolean
  pausedRef?: React.MutableRefObject<boolean>
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isDesktop
}

export default function HeroCanvasBG({ isVisible = true, pausedRef: externalPausedRef }: HeroCanvasBGProps) {
  const isDesktop = useIsDesktop()
  const { userRotation, paused: internalPaused, lock, unlock, locked, pointerHandlers } = useModelDrag({ resumeDelayMs: 10000 })

  const animateCameraRef = useRef<((pos: [number, number, number], target: [number, number, number]) => void) | null>(null)
  const resetCameraRef = useRef<(() => void) | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)

  // Sync external paused ref for Page Visibility API
  useEffect(() => {
    if (externalPausedRef) {
      externalPausedRef.current = internalPaused.current || !isVisible
    }
  })

  return (
    <div
      className="relative w-full h-full"
      style={{ cursor: locked.current ? 'default' : undefined }}
      {...pointerHandlers}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 40%, rgba(123,63,228,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(255,77,166,0.15) 0%, transparent 55%), linear-gradient(135deg, #0d0b1a 0%, #140e26 40%, #1a1028 70%, #0d0b1a 100%)',
        }}
      />
      <Suspense fallback={<LoadingFallback3D />}>
        <Canvas
          camera={{ position: [2.5, 1.2, 5], fov: 35, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 4]} intensity={2.2} color="#ffffff" castShadow />
          <directionalLight position={[-3, 2, -3]} intensity={0.8} color="#7B3FE4" />
          <directionalLight position={[-4, 3, 5]} intensity={0.6} color="#ffffff" />
          <pointLight position={[1, 3, 1]} intensity={0.5} color="#FF4DA6" />

          <InnerScene
            userRotation={userRotation}
            paused={internalPaused}
            onAnimateCamera={animateCameraRef}
            onResetCamera={resetCameraRef}
            lock={lock}
            unlock={unlock}
            isDesktop={isDesktop}
          />

          <CameraAnimator
            animateCameraRef={animateCameraRef}
            resetCameraRef={resetCameraRef}
            controlsRef={controlsRef}
          />

          <ZoomPassthrough />
          <OrbitControls
            ref={controlsRef}
            enableRotate={false}
            enablePan={false}
            enableZoom
            enableDamping
            dampingFactor={0.08}
            minDistance={MIN_DISTANCE}
            maxDistance={MAX_DISTANCE}
            target={ORBIT_TARGET}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}
