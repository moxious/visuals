import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Pyramid({ 
  position = [0, 0, 0], 
  color = "#61dafb",
  size = 1,
  height = 2,
  wireframe = false,
  metalness = 0.1,
  roughness = 0.2,
  rotationSpeed = 0.2,
  ...props 
}) {
  const meshRef = useRef()
  
  // Add rotation animation
  useFrame((state) => {
    if (meshRef.current && rotationSpeed !== 0) {
      meshRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed
    }
  })

  return (
    <mesh ref={meshRef} position={position} {...props}>
      {/* Pyramid geometry - using ConeGeometry with 4 radial segments */}
      <coneGeometry args={[size, height, 4]} />
      <meshStandardMaterial 
        color={color}
        wireframe={wireframe}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  )
}

export default Pyramid 