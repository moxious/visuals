import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function StarField({ 
  starCount = 5000,
  spread = 100,
  starColor = '#ffffff',
  starSize = 2,
  speed = 1,
  cameraPath = 'forward', // 'forward', 'spiral', 'wave'
  randomColors = true,
  ...props 
}) {
  const pointsRef = useRef()
  const { camera } = useThree()
  
  // Generate random star positions and colors
  const { starPositions, starColors } = useMemo(() => {
    const positions = new Float32Array(starCount * 3)
    const colors = new Float32Array(starCount * 3)
    
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      
      // Distribute stars in a cube around the origin
      positions[i3] = (Math.random() - 0.5) * spread * 2     // x
      positions[i3 + 1] = (Math.random() - 0.5) * spread * 2 // y  
      positions[i3 + 2] = (Math.random() - 0.5) * spread * 2 // z
      
      // Generate random colors for each star
      if (randomColors) {
        // Create varied star colors (whites, blues, yellows, reds)
        const colorType = Math.random()
        if (colorType < 0.6) {
          // White/blue-white stars (most common)
          colors[i3] = 0.8 + Math.random() * 0.2     // R
          colors[i3 + 1] = 0.8 + Math.random() * 0.2 // G
          colors[i3 + 2] = 1.0                       // B
        } else if (colorType < 0.8) {
          // Yellow/orange stars
          colors[i3] = 1.0                           // R
          colors[i3 + 1] = 0.8 + Math.random() * 0.2 // G
          colors[i3 + 2] = 0.3 + Math.random() * 0.3 // B
        } else {
          // Red stars
          colors[i3] = 1.0                           // R
          colors[i3 + 1] = 0.3 + Math.random() * 0.3 // G
          colors[i3 + 2] = 0.2 + Math.random() * 0.2 // B
        }
      } else {
        // Use single color converted to RGB
        const color = new THREE.Color(starColor)
        colors[i3] = color.r
        colors[i3 + 1] = color.g
        colors[i3 + 2] = color.b
      }
    }
    
    return { starPositions: positions, starColors: colors }
  }, [starCount, spread, starColor, randomColors])

  // Animate camera movement through the star field (increased speed)
  useFrame((state) => {
    const time = state.clock.elapsedTime * speed * 0.8 // Increased from 0.5 to 0.8
    
    switch (cameraPath) {
      case 'forward':
        // Move forward through the star field (faster)
        camera.position.z = Math.sin(time * 0.15) * 12 // Increased frequency and amplitude
        camera.position.x = Math.sin(time * 0.08) * 7
        camera.position.y = Math.cos(time * 0.05) * 4
        break
        
      case 'spiral':
        // Spiral movement through the stars (faster)
        const radius = 18 + Math.sin(time * 0.15) * 6 // Increased radius and frequency
        camera.position.x = Math.cos(time * 0.3) * radius // Increased rotation speed
        camera.position.y = Math.sin(time * 0.2) * 10
        camera.position.z = Math.sin(time * 0.3) * radius
        break
        
      case 'wave':
        // Wave-like movement (faster)
        camera.position.x = Math.sin(time * 0.15) * 18 // Increased frequency and amplitude
        camera.position.y = Math.cos(time * 0.12) * 12
        camera.position.z = Math.sin(time * 0.18) * 15
        break
        
      default:
        // Default forward movement (faster)
        camera.position.z = time * 3 // Increased from 2 to 3
        camera.position.x = Math.sin(time * 0.15) * 4
        break
    }
    
    // Always look towards the center/origin
    camera.lookAt(0, 0, 0)
    
    // Optional: Rotate the star field slightly for more dynamic effect (faster)
    if (pointsRef.current) {
      pointsRef.current.rotation.y = time * 0.03 // Increased from 0.02
      pointsRef.current.rotation.x = time * 0.015 // Increased from 0.01
    }
  })

  return (
    <points ref={pointsRef} {...props}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={starPositions}
          itemSize={3}
          count={starCount}
        />
        <bufferAttribute
          attach="attributes-color"
          array={starColors}
          itemSize={3}
          count={starCount}
        />
      </bufferGeometry>
      <pointsMaterial
        size={starSize}
        sizeAttenuation={true}
        transparent={true}
        alphaTest={0.5}
        opacity={0.9}
        vertexColors={true}
      />
    </points>
  )
}

export default StarField 