import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Cyberpunk neon color palette for alien shapes
const NEON_COLORS = [
  '#00FFF7', // Neon Cyan — glows like a digital ocean
  '#FF00FF', // Electric Magenta — hurts your eyes, in a good way
  '#CCFF00', // Lime Laser Green — like alien slime but make it highlighter
  '#8F00FF', // Ultraviolet Vibe — royalty, but from space
  '#FF0033', // Infrared Red — the kinda red that screams "do not touch"
  '#FF6F00', // Plasma Orange — like a sunrise on Mars with the saturation cranked
  '#FF4EB1', // Glitch Pink — somewhere between cotton candy and a corrupted jpeg
  '#1F51FF', // Neon Blue — classic Tron-line blue, freshly digitized
  // Additional colors that fit the vibe
  '#00FF41', // Matrix green
  '#FF0080', // Hot neon pink
  '#40E0D0', // Turquoise glow
  '#FFD700', // Electric gold
]

// Shape types for alien terrain
const SHAPE_TYPES = ['ring', 'torus', 'cylinder']

function AlienShape({ 
  position, 
  shapeType, 
  color1,
  color2, 
  id 
}) {
  const meshRef = useRef()
  const rotationSpeed = useRef({
    x: (Math.random() - 0.5) * 0.02, // Gentle rotation speeds
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  })
  
  // Color morphing setup
  const baseColor = useMemo(() => new THREE.Color(color1), [color1])
  const targetColor = useMemo(() => new THREE.Color(color2), [color2])
  const currentColor = useMemo(() => new THREE.Color(color1), [color1])
  const colorSpeed = useRef(0.5 + Math.random() * 1.5) // Random speed between 0.5-2.0 for variety
  
  // Create geometry based on shape type
  const geometry = useMemo(() => {
    const size = 1.5 + Math.random() * 2 // Shape size variation (increased minimum)
    
    switch (shapeType) {
      case 'ring':
        // Use a thin torus instead of flat ring to avoid disappearing
        return new THREE.TorusGeometry(size, Math.max(0.2, size * 0.15), 8, 16)
      case 'torus':
        // Ensure tube radius is never too thin
        return new THREE.TorusGeometry(size, Math.max(0.3, size * 0.25), 8, 16)
      case 'cylinder':
        // Ensure height is substantial
        return new THREE.CylinderGeometry(
          Math.max(0.3, size * 0.4), 
          Math.max(0.3, size * 0.4), 
          Math.max(1.0, size * 1.2), 
          12
        )
      default:
        return new THREE.TorusGeometry(size, Math.max(0.3, size * 0.25), 8, 16)
    }
  }, [shapeType])
  
  // Gentle rotation animation and color morphing
  useFrame((state) => {
    if (meshRef.current) {
      // Rotation animation
      meshRef.current.rotation.x += rotationSpeed.current.x
      meshRef.current.rotation.y += rotationSpeed.current.y
      meshRef.current.rotation.z += rotationSpeed.current.z
      
      // Color morphing animation - smooth oscillation between two colors
      const time = state.clock.elapsedTime * colorSpeed.current
      const colorLerpFactor = (Math.sin(time) + 1) * 0.5 // Oscillates between 0 and 1
      
      // Interpolate between the two colors
      currentColor.copy(baseColor).lerp(targetColor, colorLerpFactor)
      
      // Update the material color
      if (meshRef.current.material) {
        meshRef.current.material.color.copy(currentColor)
        meshRef.current.material.emissive.copy(currentColor).multiplyScalar(0.2)
      }
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color={currentColor}
        emissive={currentColor}
        emissiveIntensity={0.2}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  )
}

function AlienTerrain({ 
  speed = 0.3,
  layerThickness = 25,
  layerSpacing = 30,
  shapesPerLayer = 15,
  ...props 
}) {
  const { camera } = useThree()
  const [shapes, setShapes] = useState([])
  const cameraPositionRef = useRef(0)
  const nextLayerZ = useRef(0)
  
  // Generate shapes for a layer
  const generateLayerShapes = (layerZ) => {
    const layerShapes = []
    
    for (let i = 0; i < shapesPerLayer; i++) {
      // Distribute shapes within the thick layer with much wider spread
      const x = (Math.random() - 0.5) * 120 // Much wider spread across X (-60 to +60)
      const y = (Math.random() - 0.5) * 120 // Much wider spread across Y (-60 to +60)
      const z = layerZ + (Math.random() - 0.5) * layerThickness // Within layer thickness
      
      // Pick two different random colors for morphing
      const color1Index = Math.floor(Math.random() * NEON_COLORS.length)
      let color2Index = Math.floor(Math.random() * NEON_COLORS.length)
      // Ensure the second color is different from the first
      while (color2Index === color1Index) {
        color2Index = Math.floor(Math.random() * NEON_COLORS.length)
      }
      
      layerShapes.push({
        id: `${layerZ}-${i}-${Date.now()}`,
        position: [x, y, z],
        shapeType: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
        color1: NEON_COLORS[color1Index],
        color2: NEON_COLORS[color2Index]
      })
    }
    
    return layerShapes
  }
  
  // Initialize shapes
  useEffect(() => {
    const initialShapes = []
    // Create massive initial buffer - 40 layers ahead of camera
    for (let i = 0; i < 40; i++) {
      const layerZ = i * layerSpacing
      initialShapes.push(...generateLayerShapes(layerZ))
    }
    setShapes(initialShapes)
    nextLayerZ.current = 40 * layerSpacing
    console.log(`Initialized ${initialShapes.length} shapes across 40 layers`)
  }, [layerSpacing, layerThickness, shapesPerLayer])
  
  // Animate camera and manage shapes
  useFrame((state) => {
    // Use direct frame-based movement instead of deltaTime
    const moveSpeed = speed * 0.5 // Simple multiplier per frame (0.5 units per frame at speed=1)
    
    // Move camera forward
    cameraPositionRef.current += moveSpeed
    camera.position.z = cameraPositionRef.current
    // Look straight ahead (positive Z direction) instead of constantly adjusting target
    camera.lookAt(0, 0, cameraPositionRef.current + 100)
    
    // Generate new layers ahead of camera for infinite terrain
    setShapes(prevShapes => {
      let newShapes = [...prevShapes]
      
      // EMERGENCY CHECK: If we have very few shapes, generate many immediately
      if (newShapes.length < 500) {
        console.log(`EMERGENCY: Only ${newShapes.length} shapes remaining! Generating emergency layers.`)
        for (let i = 0; i < 10; i++) {
          newShapes.push(...generateLayerShapes(nextLayerZ.current))
          nextLayerZ.current += layerSpacing
        }
        console.log(`Emergency generation complete: ${newShapes.length} shapes now`)
      }
      
      // AGGRESSIVE GENERATION: Always maintain 25 layers ahead minimum
      let layersGenerated = 0
      const targetLayersAhead = 25
      const minLayersAhead = 18
      
      while (nextLayerZ.current < cameraPositionRef.current + layerSpacing * targetLayersAhead) {
        newShapes.push(...generateLayerShapes(nextLayerZ.current))
        nextLayerZ.current += layerSpacing
        layersGenerated++
        
        // Force large batch generation if we're significantly behind
        if (nextLayerZ.current < cameraPositionRef.current + layerSpacing * minLayersAhead) {
          // Generate 5 more layers immediately in this batch
          for (let i = 0; i < 5; i++) {
            newShapes.push(...generateLayerShapes(nextLayerZ.current))
            nextLayerZ.current += layerSpacing
            layersGenerated++
          }
        }
        
        // Prevent infinite loop
        if (layersGenerated > 15) break
      }
      
      // Debug: Log when new layers are generated
      if (layersGenerated > 0) {
        const layersAhead = (nextLayerZ.current - cameraPositionRef.current) / layerSpacing
        console.log(`Generated ${layersGenerated} new layers (${layersGenerated * shapesPerLayer} shapes). Camera at Z: ${cameraPositionRef.current.toFixed(1)}, Layers ahead: ${layersAhead.toFixed(1)}, Total shapes: ${newShapes.length}`)
      }
      
      // CONSERVATIVE REMOVAL: Only remove shapes very rarely and keep huge buffer
      // Keep shapes 20 layers behind camera
      // Only clean up every 20th frame to minimize removal frequency
      const frameNum = Math.floor(cameraPositionRef.current / moveSpeed)
      if (frameNum % 20 === 0 && newShapes.length > 2000) { // Only clean up every 20th frame and only if we have many shapes
        const shapesBeforeRemoval = newShapes.length
        newShapes = newShapes.filter(shape => 
          shape.position[2] > cameraPositionRef.current - layerSpacing * 20
        )
        const shapesRemoved = shapesBeforeRemoval - newShapes.length
        
        // Debug: Log when shapes are removed
        if (shapesRemoved > 0) {
          console.log(`Removed ${shapesRemoved} shapes behind camera. Remaining shapes: ${newShapes.length}`)
        }
      }
      
      // Periodic balance summary
      if (Math.floor(cameraPositionRef.current) % 100 === 0 && Math.floor(cameraPositionRef.current) !== Math.floor(cameraPositionRef.current - moveSpeed)) {
        const layersAhead = (nextLayerZ.current - cameraPositionRef.current) / layerSpacing
        console.log(`Balance check - Camera Z: ${cameraPositionRef.current.toFixed(1)}, Total shapes: ${newShapes.length}, Layers ahead: ${layersAhead.toFixed(1)}`)
      }
      
      return newShapes
    })
  })
  
  return (
    <group {...props}>
      {shapes.map(shape => (
        <AlienShape
          key={shape.id}
          position={shape.position}
          shapeType={shape.shapeType}
          color1={shape.color1}
          color2={shape.color2}
          id={shape.id}
        />
      ))}
    </group>
  )
}

export default AlienTerrain 