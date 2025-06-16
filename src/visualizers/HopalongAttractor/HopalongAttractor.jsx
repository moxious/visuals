import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Cyberpunk neon color palette
const NEON_COLORS = [
  '#00FFF7', // Neon Cyan
  '#FF00FF', // Electric Magenta
  '#CCFF00', // Lime Laser Green
  '#8F00FF', // Ultraviolet Vibe
  '#FF0033', // Infrared Red
  '#FF6F00', // Plasma Orange
  '#FF4EB1', // Glitch Pink
  '#1F51FF', // Neon Blue
  '#00FF41', // Matrix green
  '#FF0080', // Hot neon pink
  '#40E0D0', // Turquoise glow
  '#FFD700', // Electric gold
]

function HopalongAttractor({ 
  pointCount = 50000,
  speed = 0.5,
  scale = 0.8,
  iterations = 100000,
  ...props 
}) {
  const instancedMeshRef = useRef()
  const timeRef = useRef(0)
  const [currentParams, setCurrentParams] = useState({ a: 0, b: 0, c: 0 })
  const [regenerationTrigger, setRegenerationTrigger] = useState(0)
  
  // Generate Hopalong attractor points and setup instanced mesh
  const { geometry, material, instanceData } = useMemo(() => {
    // Random parameters for the Hopalong attractor
    const a = Math.random() * 4 - 2    // -2 to 2 (smaller range for better patterns)
    const b = Math.random() * 1.5 - 0.75  // -0.75 to 0.75
    const c = Math.random() * 10 - 5   // -5 to 5
    
    setCurrentParams({ a, b, c })
    console.log(`Hopalong parameters: a=${a.toFixed(3)}, b=${b.toFixed(3)}, c=${c.toFixed(3)}`)
    
    const positions = []
    const initialColors = []
    
    // Starting point
    let x = 0
    let y = 0
    
    // Generate points using the Hopalong formula
    // (x, y) -> (y - sign(x)*sqrt(abs(b*x - c)), a - x)
    for (let i = 0; i < pointCount; i++) {
      // Skip initial iterations to let the attractor settle
      for (let j = 0; j < Math.floor(iterations / pointCount); j++) {
        const newX = y - Math.sign(x) * Math.sqrt(Math.abs(b * x - c))
        const newY = a - x
        x = newX
        y = newY
      }
      
      // Store position (scale down and add slight Z variation for 3D effect)
      positions.push({
        x: x * scale,
        y: y * scale,
        z: Math.sin(i * 0.01) * 0.5
      })
      
      // Assign colors based on position and iteration
      const colorIndex = Math.floor((i / pointCount) * NEON_COLORS.length)
      const color = new THREE.Color(NEON_COLORS[colorIndex % NEON_COLORS.length])
      
      // Add some variation based on position magnitude but keep colors bright
      const magnitude = Math.sqrt(x * x + y * y)
      const intensity = Math.min(1, magnitude * 0.02 + 0.8) // Higher base intensity
      
      initialColors.push({
        r: color.r * intensity,
        g: color.g * intensity,
        b: color.b * intensity
      })
    }
    
    // Create sphere geometry (smaller spheres for better performance)
    const geometry = new THREE.SphereGeometry(0.08, 8, 6) // Small spheres with low detail
    
    // Create material for instanced spheres
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    })
    
    return { 
      geometry, 
      material, 
      instanceData: { positions, initialColors }
    }
  }, [pointCount, iterations, scale, regenerationTrigger])
  
  // Setup instanced mesh matrices and colors
  useEffect(() => {
    if (instancedMeshRef.current && instanceData) {
      const { positions, initialColors } = instanceData
      
      // Create transformation matrices for each sphere
      const matrix = new THREE.Matrix4()
      for (let i = 0; i < pointCount; i++) {
        const pos = positions[i]
        matrix.setPosition(pos.x, pos.y, pos.z)
        instancedMeshRef.current.setMatrixAt(i, matrix)
        
        // Set initial colors
        const color = initialColors[i]
        instancedMeshRef.current.setColorAt(i, new THREE.Color(color.r, color.g, color.b))
      }
      
      instancedMeshRef.current.instanceMatrix.needsUpdate = true
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true
      }
    }
  }, [instanceData, pointCount])
  
  // Animation loop
  useFrame((state) => {
    if (instancedMeshRef.current && instanceData) {
      timeRef.current += speed * 0.01
      
      // Gentle rotation of the entire attractor
      instancedMeshRef.current.rotation.z = timeRef.current * 0.1
      instancedMeshRef.current.rotation.y = timeRef.current * 0.05
      
      // Wave-based color cycling with center-outward ripples
      const { positions } = instanceData
      const time = state.clock.elapsedTime
      
      // Calculate the center point of the attractor pattern
      let centerX = 0, centerY = 0
      for (let i = 0; i < pointCount; i++) {
        centerX += positions[i].x
        centerY += positions[i].y
      }
      centerX /= pointCount
      centerY /= pointCount
      
      for (let i = 0; i < pointCount; i++) {
        // Get point position
        const pos = positions[i]
        
        // Calculate distance from center for wave propagation
        const distanceFromCenter = Math.sqrt((pos.x - centerX) * (pos.x - centerX) + (pos.y - centerY) * (pos.y - centerY))
        
        // Create ripple waves emanating from center
        const waveSpeed = 3.0 // How fast waves travel outward
        const waveLength = 2.0 // Distance between wave crests
        const ripplePhase = time * waveSpeed - distanceFromCenter / waveLength
        
        // Multiple wave frequencies for complex patterns
        const primaryWave = Math.sin(ripplePhase) * 0.3 + 0.7  // Main wave: 0.4 to 1.0
        const secondaryWave = Math.sin(ripplePhase * 1.5 + Math.PI/3) * 0.15 + 0.85  // Secondary: 0.7 to 1.0
        
        // Color cycling based on distance and time for smooth color waves
        const colorPhase = (time * 0.5 + distanceFromCenter * 0.3) % NEON_COLORS.length
        const colorIndex1 = Math.floor(colorPhase) % NEON_COLORS.length
        const colorIndex2 = (colorIndex1 + 1) % NEON_COLORS.length
        const lerpFactor = colorPhase - Math.floor(colorPhase)
        
        // Get the two colors to interpolate between
        const color1 = new THREE.Color(NEON_COLORS[colorIndex1])
        const color2 = new THREE.Color(NEON_COLORS[colorIndex2])
        
        // Smooth interpolation between palette colors
        const currentR = color1.r + (color2.r - color1.r) * lerpFactor
        const currentG = color1.g + (color2.g - color1.g) * lerpFactor
        const currentB = color1.b + (color2.b - color1.b) * lerpFactor
        
        // Apply wave effects to create rippling intensity
        const finalIntensity = primaryWave * secondaryWave
        
        // Apply the colors with ripple wave effects to the instanced mesh
        instancedMeshRef.current.setColorAt(
          i,
          new THREE.Color(
            currentR * finalIntensity,
            currentG * finalIntensity,
            currentB * finalIntensity
          )
        )
      }
      
      instancedMeshRef.current.instanceColor.needsUpdate = true
    }
  })
  
  // Regenerate attractor with new parameters periodically (random 10-30 seconds)
  useEffect(() => {
    const scheduleNextRegeneration = () => {
      // Random interval between 10 and 30 seconds
      const randomInterval = 10000 + Math.random() * 20000 // 10000ms + (0-20000ms)
      console.log(`Next Hopalong regeneration scheduled in ${(randomInterval/1000).toFixed(1)} seconds`)
      
      return setTimeout(() => {
        console.log('Regenerating Hopalong Attractor with new parameters...')
        setRegenerationTrigger(prev => prev + 1)
      }, randomInterval)
    }
    
    // Start the first regeneration timer
    const timeout = scheduleNextRegeneration()
    
    return () => {
      clearTimeout(timeout)
    }
  }, [])
  
  // Schedule the next regeneration whenever the trigger changes
  useEffect(() => {
    if (regenerationTrigger === 0) return // Skip the initial render
    
    // Random interval between 10 and 30 seconds
    const randomInterval = 10000 + Math.random() * 20000
    console.log(`Next Hopalong regeneration scheduled in ${(randomInterval/1000).toFixed(1)} seconds`)
    
    const timeout = setTimeout(() => {
      console.log('Regenerating Hopalong Attractor with new parameters...')
      setRegenerationTrigger(prev => prev + 1)
    }, randomInterval)
    
    return () => {
      clearTimeout(timeout)
    }
  }, [regenerationTrigger])
  
  return (
    <group {...props}>
      <instancedMesh 
        ref={instancedMeshRef} 
        args={[geometry, material, pointCount]}
      />
    </group>
  )
}

export default HopalongAttractor 