import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Bright color palette for alien shapes
const BRIGHT_COLORS = [
  '#ff0080', // Hot pink
  '#00ff80', // Neon green
  '#8000ff', // Electric purple
  '#ff8000', // Bright orange
  '#0080ff', // Electric blue
  '#ff0040', // Red-pink
  '#40ff00', // Lime green
  '#ff4000', // Orange-red
  '#0040ff', // Blue
  '#ff00c0', // Magenta
  '#00ffff', // Cyan
  '#ffff00', // Yellow
]

// Shape types for alien terrain
const SHAPE_TYPES = ['ring', 'torus', 'cylinder']

function AlienShape({ 
  position, 
  shapeType, 
  color, 
  id 
}) {
  const meshRef = useRef()
  const rotationSpeed = useRef({
    x: (Math.random() - 0.5) * 0.02, // Gentle rotation speeds
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  })
  
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
  
  // Gentle rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed.current.x
      meshRef.current.rotation.y += rotationSpeed.current.y
      meshRef.current.rotation.z += rotationSpeed.current.z
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
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
      
      layerShapes.push({
        id: `${layerZ}-${i}-${Date.now()}`,
        position: [x, y, z],
        shapeType: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
        color: BRIGHT_COLORS[Math.floor(Math.random() * BRIGHT_COLORS.length)]
      })
    }
    
    return layerShapes
  }
  
  // Initialize shapes
  useEffect(() => {
    const initialShapes = []
    // Create many more initial layers ahead of camera for smoother infinite generation
    for (let i = 0; i < 20; i++) {
      const layerZ = i * layerSpacing
      initialShapes.push(...generateLayerShapes(layerZ))
    }
    setShapes(initialShapes)
    nextLayerZ.current = 20 * layerSpacing
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
      
      // Generate new layers much further ahead to ensure infinite terrain
      // Keep generating layers until we have 10 layers ahead of the camera
      let layersGenerated = 0
      while (nextLayerZ.current < cameraPositionRef.current + layerSpacing * 10) {
        newShapes.push(...generateLayerShapes(nextLayerZ.current))
        nextLayerZ.current += layerSpacing
        layersGenerated++
      }
      
      // Debug: Log when new layers are generated
      if (layersGenerated > 0) {
        console.log(`Generated ${layersGenerated} new layers (${layersGenerated * shapesPerLayer} shapes). Camera at Z: ${cameraPositionRef.current.toFixed(1)}, Next layer at: ${nextLayerZ.current.toFixed(1)}`)
      }
      
      // Remove shapes that are far behind camera to manage memory
      // Keep shapes 6 layers behind for smooth transition and buffer
      const shapesBeforeRemoval = newShapes.length
      newShapes = newShapes.filter(shape => 
        shape.position[2] > cameraPositionRef.current - layerSpacing * 6
      )
      const shapesRemoved = shapesBeforeRemoval - newShapes.length
      
      // Debug: Log when shapes are removed
      if (shapesRemoved > 0) {
        console.log(`Removed ${shapesRemoved} shapes behind camera. Remaining shapes: ${newShapes.length}`)
      }
      
      // Periodic balance summary (every 100 frames ~1.67 seconds at 60fps)
      if (Math.floor(cameraPositionRef.current) % 50 === 0 && Math.floor(cameraPositionRef.current) !== Math.floor(cameraPositionRef.current - moveSpeed)) {
        console.log(`Balance check - Camera Z: ${cameraPositionRef.current.toFixed(1)}, Total shapes: ${newShapes.length}, Next layer at: ${nextLayerZ.current.toFixed(1)}`)
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
          color={shape.color}
          id={shape.id}
        />
      ))}
    </group>
  )
}

export default AlienTerrain 