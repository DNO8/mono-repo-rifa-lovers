import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, ContactShadows, OrbitControls, Center } from '@react-three/drei'
import * as THREE from 'three'
import { Spinner } from '@/components/ui/spinner'
import { useModelDrag } from '@/hooks/use-model-drag'
import { ModelAnnotations } from './model-annotations'

const MODEL_PATH = '/models/macbook-2k.glb'
const DEFAULT_CAMERA_POS = new THREE.Vector3(2.5, 1.2, 5)
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0.1, 0)
const ORBIT_TARGET = new THREE.Vector3(0, 0.1, 0)
const MIN_DISTANCE = 1
const MAX_DISTANCE = 8
const ANIM_DURATION = 0.8

function MacBookModel({
  userRotation,
  paused,
  onAnimateCamera,
  onResetCamera,
  lock,
  unlock,
}: {
  userRotation: React.RefObject<number>
  paused: React.RefObject<boolean>
  onAnimateCamera: React.RefObject<((pos: [number, number, number], target: [number, number, number]) => void) | null>
  onResetCamera: React.RefObject<(() => void) | null>
  lock: () => void
  unlock: () => void
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
    <group ref={pivotRef} dispose={null}>
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

    // Continuously sync OrbitControls target during animation to prevent snap
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
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary mt-3">Cargando modelo 3D...</p>
      </div>
    </div>
  )
}

export function HeroModelViewer() {
  const { userRotation, paused, lock, unlock, locked, pointerHandlers } = useModelDrag()
  const animateCameraRef = useRef<((pos: [number, number, number], target: [number, number, number]) => void) | null>(null)
  const resetCameraRef = useRef<(() => void) | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)

  return (
    <div
      className="relative mx-auto w-full h-[320px] sm:h-[380px] md:h-[460px] lg:h-[540px] xl:h-[600px]"
      style={{ cursor: locked.current ? 'default' : undefined }}
      {...pointerHandlers}
    >
      <Suspense fallback={<LoadingFallback3D />}>
        <Canvas
          camera={{ position: [2.5, 1.2, 5], fov: 35, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#0a0a0a' }}
        >
          {/* Dramatic dark lighting */}
          <ambientLight intensity={0.12} />
          <directionalLight position={[4, 6, 4]} intensity={1.6} color="#ffffff" castShadow />
          <directionalLight position={[-3, 2, -3]} intensity={0.5} color="#7B3FE4" />
          <pointLight position={[1, 3, 1]} intensity={0.2} color="#FF4DA6" />

          <InnerScene
            userRotation={userRotation}
            paused={paused}
            onAnimateCamera={animateCameraRef}
            onResetCamera={resetCameraRef}
            lock={lock}
            unlock={unlock}
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
}: {
  userRotation: React.RefObject<number>
  paused: React.RefObject<boolean>
  onAnimateCamera: React.RefObject<((pos: [number, number, number], target: [number, number, number]) => void) | null>
  onResetCamera: React.RefObject<(() => void) | null>
  lock: () => void
  unlock: () => void
}) {
  return (
    <>
      <MacBookModel
        userRotation={userRotation}
        paused={paused}
        onAnimateCamera={onAnimateCamera}
        onResetCamera={onResetCamera}
        lock={lock}
        unlock={unlock}
      />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.15} scale={5} blur={2.5} color="#000000" />
    </>
  )
}

useGLTF.preload(MODEL_PATH)
