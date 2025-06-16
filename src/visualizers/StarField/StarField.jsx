import React, { useRef, useMemo, useEffect } from 'react'
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
  const meshRef = useRef()
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

  // Set up instanced mesh with positions and colors
  useEffect(() => {
    if (!meshRef.current) return

    const dummy = new THREE.Object3D()
    const tempColor = new THREE.Color()

    // Set position and color for each star instance
    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3
      
      // Set position
      dummy.position.set(
        starPositions[i3],
        starPositions[i3 + 1], 
        starPositions[i3 + 2]
      )
      
      // Update the instance matrix
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
      
      // Set color for this instance
      tempColor.setRGB(
        starColors[i3],
        starColors[i3 + 1],
        starColors[i3 + 2]
      )
      meshRef.current.setColorAt(i, tempColor)
    }
    
    // Mark for update
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [starCount, starPositions, starColors])

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
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.03 // Increased from 0.02
      meshRef.current.rotation.x = time * 0.015 // Increased from 0.01
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, starCount]} {...props}>
      {/* Sphere geometry for each star - small spheres with few segments for performance */}
      <sphereGeometry args={[starSize * 0.1, 8, 6]} />
      <meshBasicMaterial 
        transparent={true}
        opacity={0.9}
      />
    </instancedMesh>
  )
}

export default StarField 