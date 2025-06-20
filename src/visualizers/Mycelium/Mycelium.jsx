import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
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
  orbitRadius = 12,
  ...props 
}) {
  const instancedMeshRef = useRef()
  const timeRef = useRef(Math.random() * Math.PI * 2) // Start with random orbital position
  const [cluster, setCluster] = useState([])
  const [isGrowing, setIsGrowing] = useState(true)
  const { camera } = useThree() // Access to the camera for orbital movement
  
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
  
  // Initialize cluster with seed and set initial camera position
  useEffect(() => {
    setCluster(seedCluster)
    
    // Set initial camera position for better visibility
    const initialOrbitTime = timeRef.current * 0.075
    const initialVerticalTime = timeRef.current * 0.03
    
    const x = Math.cos(initialOrbitTime) * orbitRadius
    const z = Math.sin(initialOrbitTime) * orbitRadius  
    const y = Math.sin(initialVerticalTime) * 3 + 2 // Slight upward bias
    
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    
    console.log('🌱 Mycelium: Initialized with new seed cluster')
    console.log('📷 Camera position:', camera.position.toArray(), 'looking at origin')
    console.log('⚙️ Config: orbitRadius =', orbitRadius, 'maxParticles =', maxParticles, 'killRadius =', killRadius)
  }, [seedCluster, camera])
  
  // Create geometry and material for tubes
  const { geometry, material } = useMemo(() => {
    // Cylinder geometry - will be positioned and scaled for each tube
    const geometry = new THREE.CylinderGeometry(0.035, 0.035, 1, 6) // Slightly thicker tubes for better visibility
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

        // Simple thickness based on generation (much more efficient)
        const generationThickness = 1 + (Math.max(0, 10 - parent.generation) * 0.08) // Older = thicker
        const tubeThickness = Math.min(generationThickness, 2.5) // Cap thickness

        // Create transformation matrix for the tube
        direction.normalize()
        
        // Align cylinder (which points up by default) with the connection direction
        const up = new THREE.Vector3(0, 1, 0)
        tempQuaternion.setFromUnitVectors(up, direction)
        
        // Set matrix: position at midpoint, rotate to align with connection, scale by thickness and length
        matrix.compose(
          midpoint,
          tempQuaternion,
          new THREE.Vector3(tubeThickness, length, tubeThickness) // Scale X,Z for thickness, Y for length
        )
        
        instancedMeshRef.current.setMatrixAt(tubeIndex, matrix)

        // Set initial colors during growth (will be updated in useFrame when not growing)
        if (isGrowing) {
          const colorIndex = (particle.generation + particle.id) % NEON_COLORS.length
          const color = new THREE.Color(NEON_COLORS[colorIndex])
          const distanceFromCenter = midpoint.length()
          const intensity = 0.7 + Math.sin(distanceFromCenter * 0.3) * 0.3
          color.multiplyScalar(intensity)
          instancedMeshRef.current.setColorAt(tubeIndex, color)
        }
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
    // Always update time and camera movement, regardless of growth state
    timeRef.current += 0.01
    
    // Gentle rotation of the entire structure
    if (instancedMeshRef.current) {
      instancedMeshRef.current.rotation.y = timeRef.current * 0.1
      instancedMeshRef.current.rotation.x = Math.sin(timeRef.current * 0.05) * 0.1
    }

    // Slow orbital camera movement around the cluster - ALWAYS active
    const orbitSpeed = 0.075 // Increased orbital speed by 50%
    const verticalDrift = 0.03 // Gentle up/down movement
    
    // Calculate orbital position using spherical coordinates
    const orbitTime = timeRef.current * orbitSpeed
    const verticalTime = timeRef.current * verticalDrift
    
    const x = Math.cos(orbitTime) * orbitRadius
    const z = Math.sin(orbitTime) * orbitRadius
    const y = Math.sin(verticalTime) * 3 + 2 // Reduced vertical drift with upward bias
    
    // Update camera position
    camera.position.set(x, y, z)
    
    // Always look at the center of the cluster
    camera.lookAt(0, 0, 0)

    // Update colors with pulsating waves when growth is complete
    if (!isGrowing && instancedMeshRef.current && cluster.length > 0) {
      let tubeIndex = 0
      
      for (let i = 0; i < cluster.length; i++) {
        const particle = cluster[i]
        
        // Skip root particle (has no parent to connect to)
        if (particle.parent === null) continue

        // Find parent particle
        const parent = cluster.find(p => p.id === particle.parent)
        if (!parent) continue

        // Calculate midpoint for distance calculation
        const startPos = parent.position
        const endPos = particle.position
        const midpoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)
        const distanceFromCenter = midpoint.length()

        // Color wave pulsing outward from center
        const waveSpeed = 1.5 // Slower, smoother waves
        const waveLength = 6.0 // Closer wave peaks for more detail
        const currentTime = timeRef.current || 0
        
        // Calculate wave position - multiple waves for more dynamic effect
        const primaryWave = (currentTime * waveSpeed) % (waveLength * 4) // Primary wave cycle
        const secondaryWave = (currentTime * waveSpeed * 0.6) % (waveLength * 3) // Secondary wave
        
        // Calculate color based on distance relative to wave positions
        const primaryPhase = Math.sin((distanceFromCenter - primaryWave) / waveLength * Math.PI * 2) * 0.7
        const secondaryPhase = Math.sin((distanceFromCenter - secondaryWave) / waveLength * Math.PI * 1.8) * 0.3
        const combinedPhase = (primaryPhase + secondaryPhase + 1.0) * 0.5 // Normalize to 0-1
        
        // Cycle through color palette based on wave phase
        const colorIndex = Math.floor(combinedPhase * NEON_COLORS.length) % NEON_COLORS.length
        const nextColorIndex = (colorIndex + 1) % NEON_COLORS.length
        const colorMix = (combinedPhase * NEON_COLORS.length) % 1
        
        // Interpolate between two colors for smooth transitions
        const color1 = new THREE.Color(NEON_COLORS[colorIndex])
        const color2 = new THREE.Color(NEON_COLORS[nextColorIndex])
        const color = color1.lerp(color2, colorMix)
        
        // Add brightness variation based on wave intensity - smoother pulsing
        const intensity = 0.5 + combinedPhase * 0.5 // Gentle brightness variation
        color.multiplyScalar(intensity)
        
        instancedMeshRef.current.setColorAt(tubeIndex, color)
        tubeIndex++
      }

      // Mark colors as needing update
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true
      }
    }

    // Growth simulation - only run if still growing
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
      
      // Anti-crowding: Check for nearby particles
      const crowdingRadius = stepSize * 2.5
      const nearbyParticles = cluster.filter(other => 
        other !== particle && particle.position.distanceTo(other.position) < crowdingRadius
      )
      const crowdingFactor = Math.max(0.3, 1 - (nearbyParticles.length * 0.15)) // Reduce growth in crowded areas
      const adjustedGrowthProbability = growthProbability * crowdingFactor

      // Attempt to grow this tip
      if (Math.random() < adjustedGrowthProbability) {
        // Add moderate randomness to growth direction for wide spreading
        const randomFactor = 0.5 // Reduced for more controlled growth
        const newDirection = particle.growthDirection.clone()
        newDirection.add(new THREE.Vector3(
          (Math.random() - 0.5) * randomFactor,
          (Math.random() - 0.5) * randomFactor,
          (Math.random() - 0.5) * randomFactor
        ))

        // Radial bias: Encourage growth away from center
        const radialDirection = particle.position.clone().normalize()
        const radialBias = 0.6 // Strength of outward bias
        newDirection.add(radialDirection.multiplyScalar(radialBias))

        // Anti-crowding: Add repulsion from nearby particles
        if (nearbyParticles.length > 0) {
          const repulsionDirection = new THREE.Vector3()
          nearbyParticles.forEach(nearby => {
            const repulsion = particle.position.clone().sub(nearby.position).normalize()
            repulsionDirection.add(repulsion)
          })
          repulsionDirection.normalize()
          const repulsionStrength = 0.5
          newDirection.add(repulsionDirection.multiplyScalar(repulsionStrength))
        }

        newDirection.normalize()

        // Ensure direction is valid (not zero vector)
        if (newDirection.length() < 0.01) {
          newDirection.copy(particle.growthDirection) // Fallback to parent direction
        }

        // Calculate new position with generous spacing
        const segmentLength = stepSize * (0.8 + Math.random() * 0.5) // Standard spacing
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
    
    // Reset time with new random orbital position
    timeRef.current = Math.random() * Math.PI * 2
    
    // Set new camera position immediately
    const initialOrbitTime = timeRef.current * 0.075
    const initialVerticalTime = timeRef.current * 0.03
    
    const x = Math.cos(initialOrbitTime) * orbitRadius
    const z = Math.sin(initialOrbitTime) * orbitRadius  
    const y = Math.sin(initialVerticalTime) * 3 + 2
    
    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
    
    console.log('🔄 Mycelium: Complete reset - new random seed direction started')
    console.log('📷 Reset camera position:', camera.position.toArray())
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