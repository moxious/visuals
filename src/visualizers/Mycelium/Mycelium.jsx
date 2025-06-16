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

function Mycelium({ 
  maxParticles = 5000,
  killRadius = 50,
  stepSize = 0.9,
  ...props 
}) {
  const instancedMeshRef = useRef()
  const timeRef = useRef(0)
  const [cluster, setCluster] = useState([])
  const [isGrowing, setIsGrowing] = useState(true)
  
  // Create new seed with random direction
  const createNewSeed = () => {
    return [{
      position: new THREE.Vector3(0, 0, 0),
      id: 0,
      generation: 0,
      isGrowingTip: true,
      growthDirection: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize(),
      parent: null // Root has no parent
    }]
  }

  // Initialize with seed particle at center
  const [seedCluster, setSeedCluster] = useState(() => createNewSeed())
  
  // Growth simulation state
  const simulationRef = useRef({
    frameCount: 0
  })
  
  // Initialize cluster with seed
  useEffect(() => {
    setCluster(seedCluster)
    console.log('🌱 Mycelium: Initialized with new seed cluster')
  }, [seedCluster])
  
  // Create geometry and material for tubes
  const { geometry, material } = useMemo(() => {
    // Cylinder geometry - will be positioned and scaled for each tube
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 6) // Thin tubes, 1 unit tall, low detail
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
    return { geometry, material }
  }, [])
  
  // Growth parameters are now handled directly in the growth algorithm
  
  // Update instanced mesh with tubes connecting points
  useEffect(() => {
    if (instancedMeshRef.current && cluster.length > 0) {
      const matrix = new THREE.Matrix4()
      const tempQuaternion = new THREE.Quaternion()
      const tempVector = new THREE.Vector3()
      let tubeIndex = 0

      for (let i = 0; i < cluster.length; i++) {
        const particle = cluster[i]
        
        // Skip root particle (has no parent to connect to)
        if (particle.parent === null) continue

        // Find parent particle
        const parent = cluster.find(p => p.id === particle.parent)
        if (!parent) continue

        // Calculate tube parameters
        const startPos = parent.position
        const endPos = particle.position
        const direction = new THREE.Vector3().subVectors(endPos, startPos)
        const length = direction.length()
        const midpoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)

        // Create transformation matrix for the tube
        direction.normalize()
        
        // Align cylinder (which points up by default) with the connection direction
        const up = new THREE.Vector3(0, 1, 0)
        tempQuaternion.setFromUnitVectors(up, direction)
        
        // Set matrix: position at midpoint, rotate to align with connection, scale length
        matrix.compose(
          midpoint,
          tempQuaternion,
          new THREE.Vector3(1, length, 1) // Scale Y (height) to match distance
        )
        
        instancedMeshRef.current.setMatrixAt(tubeIndex, matrix)

        // Color based on generation (age of growth)
        const colorIndex = particle.generation % NEON_COLORS.length
        const color = new THREE.Color(NEON_COLORS[colorIndex])
        
        // Add some variation based on distance from center
        const distanceFromCenter = midpoint.length()
        const intensity = 0.7 + Math.sin(distanceFromCenter * 0.3) * 0.3
        color.multiplyScalar(intensity)
        
        instancedMeshRef.current.setColorAt(tubeIndex, color)
        tubeIndex++
      }

      // Hide unused instances
      for (let i = tubeIndex; i < maxParticles; i++) {
        matrix.setPosition(1000, 1000, 1000) // Move far away
        instancedMeshRef.current.setMatrixAt(i, matrix)
      }

      instancedMeshRef.current.instanceMatrix.needsUpdate = true
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true
      }
    }
  }, [cluster, maxParticles])
  
  // Continuous growth simulation
  useFrame(() => {
    if (!isGrowing || cluster.length >= maxParticles) {
      setIsGrowing(false)
      return
    }
    
    simulationRef.current.frameCount++
    
    // Log every 60 frames to reduce spam
    if (simulationRef.current.frameCount % 60 === 0) {
      console.log(`Frame ${simulationRef.current.frameCount}: ${cluster.length} particles in cluster`)
    }
    
    const newGrowthParticles = []
    
    // Process each growing tip for potential growth
    cluster.forEach(particle => {
      if (!particle.isGrowingTip) return
      
      // Check if this tip is too far from center (stop growing)
      const distanceFromCenter = particle.position.length()
      if (distanceFromCenter > killRadius) {
        particle.isGrowingTip = false
        return
      }
      
      // Growth probability decreases with distance from center
      const growthProbability = Math.max(0.05, 0.18 * (1 - distanceFromCenter / killRadius))
      
      // Attempt to grow this tip
      if (Math.random() < growthProbability) {
        // Add moderate randomness to growth direction for wide spreading
        const randomFactor = 0.8 // Reduced from 0.8 - that was too extreme
        const newDirection = particle.growthDirection.clone()
        newDirection.add(new THREE.Vector3(
          (Math.random() - 0.5) * randomFactor,
          (Math.random() - 0.5) * randomFactor,
          (Math.random() - 0.5) * randomFactor
        )).normalize()

        // Ensure direction is valid (not zero vector)
        if (newDirection.length() < 0.01) {
          newDirection.copy(particle.growthDirection) // Fallback to parent direction
        }

        // Calculate new position with generous spacing
        const segmentLength = stepSize * (0.8 + Math.random() * 0.5) // Increased variation for longer reach
        const newPosition = particle.position.clone().add(
          newDirection.multiplyScalar(segmentLength)
        )

        // Create new growing segment
        const newParticle = {
          position: newPosition,
          id: cluster.length + newGrowthParticles.length,
          generation: particle.generation + Math.floor(Math.random() * 2), // Sometimes increment generation
          isGrowingTip: true,
          growthDirection: newDirection.clone(),
          parent: particle.id // Track parent for tube connections
        }

        newGrowthParticles.push(newParticle)

        // Sometimes the old particle stops being a growing tip (creates branching points)
        if (Math.random() < 0.12) { // Reduced branching frequency
          particle.isGrowingTip = false
        }

        // Sometimes create a branch from this point - with wider angles
        if (Math.random() < 0.05) { // Slightly increased for more spreading branches
          // Create branch direction that encourages horizontal/vertical spreading
          const branchDirection = new THREE.Vector3(
            (Math.random() - 0.5) * 2.0, // Reduced back to 2.0 from 2.5
            (Math.random() - 0.5) * 2.0, // Reduced back to 2.0 from 2.5
            (Math.random() - 0.5) * 2.0  // Reduced back to 2.0 from 2.5
          ).normalize()

          // Ensure branch direction is valid
          if (branchDirection.length() < 0.01) {
            branchDirection.set(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5
            ).normalize()
          }

          const branchPosition = particle.position.clone().add(
            branchDirection.multiplyScalar(stepSize * 1.2) // Reasonable branch reach
          )

          const branchParticle = {
            position: branchPosition,
            id: cluster.length + newGrowthParticles.length,
            generation: particle.generation + 1,
            isGrowingTip: true,
            growthDirection: branchDirection,
            parent: particle.id // Track parent for tube connections
          }

          newGrowthParticles.push(branchParticle)
          console.log(`🌿 Branch created at generation ${particle.generation}`)
        }
      }
    })
    
    // Add new growth particles
    if (newGrowthParticles.length > 0) {
      console.log(`🌱 Growing ${newGrowthParticles.length} new segments`)
      setCluster(prevCluster => [...prevCluster, ...newGrowthParticles])
    }
    
    // Gentle rotation of the entire structure
    if (instancedMeshRef.current) {
      timeRef.current += 0.01
      instancedMeshRef.current.rotation.y = timeRef.current * 0.1
      instancedMeshRef.current.rotation.x = Math.sin(timeRef.current * 0.05) * 0.1
    }
  })
  
  // Reset and restart growth with new seed
  const resetGrowth = () => {
    const newSeed = createNewSeed()
    setSeedCluster(newSeed)
    setCluster(newSeed)
    simulationRef.current = {
      frameCount: 0
    }
    setIsGrowing(true)
    timeRef.current = 0
    console.log('🔄 Mycelium: Complete reset - new random seed direction started')
  }
  
  // Auto-restart every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ 20-second cycle complete - restarting with new seed')
      resetGrowth()
    }, 20000) // 20 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  // Stop growth when max particles reached, but don't auto-reset (let timer handle it)
  useEffect(() => {
    if (cluster.length >= maxParticles) {
      setIsGrowing(false)
      console.log(`🏁 Growth complete: ${cluster.length} particles reached maximum`)
    }
  }, [cluster.length, maxParticles])
  
  return (
    <group {...props}>
      <instancedMesh 
        ref={instancedMeshRef} 
        args={[geometry, material, maxParticles]}
      />
      
      {/* Add some ambient lighting to see the structure better */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00FFF7" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FF00FF" />
    </group>
  )
}

export default Mycelium 