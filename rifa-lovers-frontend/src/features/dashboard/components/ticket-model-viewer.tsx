import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, OrbitControls, Center, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { Spinner } from '@/components/ui/spinner'
import { useModelDrag } from '@/hooks/use-model-drag'
import { useMediaQuery } from '@/hooks/use-media-query'

const MODEL_PATH = '/models/ticket-model-2k.glb'

interface TicketModelProps {
  ticketNumber: number
  userRotation: React.RefObject<number>
  paused: React.RefObject<boolean>
}

function TicketModel({ ticketNumber, userRotation, paused }: TicketModelProps) {
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
        idleRotation.current += delta * 0.15
      }
      pivotRef.current.rotation.y = idleRotation.current + userRotation.current
    }
  })

  const numberText = `#${String(ticketNumber).padStart(5, '0')}`

  return (
    <group ref={pivotRef} dispose={null}>
      <Center>
        <primitive object={cloned} scale={scaleFactor} rotation={[-0.2, 0, 0]} />

        {/* 3D extruded text — reacts to scene lighting for engraved look */}
        <Text3D
          font="/fonts/helvetiker_bold.typeface.json"
          position={[0.66, -0.06, 0.08]}
          size={0.12}
          height={0.015}
          bevelEnabled
          bevelThickness={0.003}
          bevelSize={0.002}
          bevelSegments={3}
          curveSegments={12}
          letterSpacing={-0.01}
        >
          {numberText}
          <meshStandardMaterial
            color="#4a1fa0"
            roughness={0.35}
            metalness={0.8}
            emissive="#7B3FE4"
            emissiveIntensity={0.08}
          />
        </Text3D>
      </Center>
    </group>
  )
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="text-sm text-text-secondary mt-3">Cargando ticket 3D...</p>
      </div>
    </div>
  )
}

function InnerScene({ ticketNumber, userRotation, paused }: TicketModelProps) {
  return (
    <>
      <TicketModel ticketNumber={ticketNumber} userRotation={userRotation} paused={paused} />
      <ContactShadows position={[0, -1.5, 0]} opacity={0.2} scale={6} blur={2.5} />
    </>
  )
}

interface TicketModelViewerProps {
  ticketNumber: number
}

export function TicketModelViewer({ ticketNumber }: TicketModelViewerProps) {
  const { userRotation, paused, pointerHandlers } = useModelDrag()
  const isMobile = useMediaQuery('(max-width: 639px)')
  const cameraZ = isMobile ? 9 : 6

  return (
    <div
      className="relative w-full h-[320px] sm:h-[380px] md:h-[420px] cursor-grab active:cursor-grabbing"
      {...pointerHandlers}
    >
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          key={cameraZ}
          camera={{ position: [0, 0, cameraZ], fov: 30, near: 0.1, far: 100 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 5]} intensity={1} castShadow />
          <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#7B3FE4" />
          <pointLight position={[2, 3, 2]} intensity={0.4} color="#FF4DA6" />

          <InnerScene ticketNumber={ticketNumber} userRotation={userRotation} paused={paused} />

          <OrbitControls
            enableRotate={false}
            enablePan={false}
            enableZoom
            enableDamping
            dampingFactor={0.08}
            minDistance={2}
            maxDistance={8}
            target={[0, 0, 0]}
          />

          <Environment preset="city" />
        </Canvas>
      </Suspense>

      {/* Gradient glow behind model */}
      <div className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-15 bg-linear-to-br from-primary via-secondary to-tertiary" />
    </div>
  )
}

useGLTF.preload(MODEL_PATH)
