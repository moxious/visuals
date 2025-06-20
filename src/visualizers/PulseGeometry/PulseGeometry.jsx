import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function PulseGeometry({ 
  position = [0, 0, 0],
  shape = 'dodecahedron', // Future: 'dodecahedron', 'icosahedron', 'cube', etc.
  maxSpheres = 2000,
  colorStrategy = 'solid', // Future: 'solid', 'gradient', 'pulse', 'rainbow'
  baseColor = '#ffffff',
  sphereSize = 0.02,
  scale = 1,
  orbitSpeed = 0.1,
  orbitRadius = 8,
  orbitHeight = 2,
  edgeDensity = 0.15, // Distance between spheres along edges
  enablePulsing = true, // Enable pulsing animation
  perspectiveChangeInterval = 3, // Seconds between perspective changes
  enableColorPulsing = true, // Enable cyberpunk color pulsing
  colorTransitionTime = 4, // Seconds to transition between colors
  infectionChance = 0.1, // Chance (0-1) for color infection per cycle
  enableGeometryPulsing = true, // Enable figure-wide pulsing
  geometryPulseAmount = 0.4, // 40% expansion from origin
  ...props 
}) {
  const meshRef = useRef()
  const { camera } = useThree()
  
  // Mutable state for color infection tracking
  const sphereColorsRef = useRef(null)
  const lastInfectionCheckRef = useRef(0)
  
  // Cyberpunk color palette
  const cyberpunkColors = [
    '#ff0080', // Hot pink
    '#00ffff', // Cyan
    '#0080ff', // Electric blue
    '#80ff00', // Neon green
    '#ff8000', // Orange
    '#ff0040', // Neon red
    '#8000ff', // Purple
    '#40ff80', // Mint green
    '#ff4080', // Pink
    '#0040ff', // Blue
    '#ffff00', // Yellow
    '#ff00ff', // Magenta
  ]
  
  // Generate dodecahedron geometry and sphere positions
  const sphereData = useMemo(() => {
    const positions = []
    const colors = []
    const phaseOffsets = [] // Random phase for each sphere's pulse cycle
    const cycleSpeeds = []  // Random speed variation for each sphere
    const colorA = []       // First color for each sphere
    const colorB = []       // Second color for each sphere
    const colorPhases = []  // Color transition phase for each sphere
    const lastInfectionTime = [] // Track when each sphere was last infected
    const sphereTypes = []  // Track sphere type: 'vertex', 'edge', 'face'
    const connections = []  // Track connections for geometry pulsing
    const vertexPulsePhases = [] // Vertex-specific pulsing phases
    const vertexPulseSpeeds = [] // Vertex-specific pulsing speeds
    
    // Use Three.js DodecahedronGeometry to get correct geometry
    const geometry = new THREE.DodecahedronGeometry(scale, 0)
    const vertices = geometry.attributes.position.array
    
    // Convert to non-indexed geometry to handle faces properly
    const nonIndexedGeometry = geometry.toNonIndexed()
    const nonIndexedVertices = nonIndexedGeometry.attributes.position.array
    
    // Group vertices into unique positions for building edges
    const uniqueVertices = []
    const vertexMap = new Map()
    
    for (let i = 0; i < vertices.length; i += 3) {
      const vertex = [vertices[i], vertices[i + 1], vertices[i + 2]]
      const key = `${vertex[0].toFixed(6)},${vertex[1].toFixed(6)},${vertex[2].toFixed(6)}`
      
      if (!vertexMap.has(key)) {
        vertexMap.set(key, uniqueVertices.length)
        uniqueVertices.push(vertex)
      }
    }
    
    // Add vertex spheres
    uniqueVertices.forEach((vertex, vertexIndex) => {
      positions.push(vertex[0], vertex[1], vertex[2])
      
      // Choose colors based on strategy
      if (enableColorPulsing && colorStrategy === 'cyberpunk') {
        // Pick two random different colors from cyberpunk palette
        const colorIndex1 = Math.floor(Math.random() * cyberpunkColors.length)
        let colorIndex2 = Math.floor(Math.random() * cyberpunkColors.length)
        while (colorIndex2 === colorIndex1) {
          colorIndex2 = Math.floor(Math.random() * cyberpunkColors.length)
        }
        
        const color1 = new THREE.Color(cyberpunkColors[colorIndex1])
        const color2 = new THREE.Color(cyberpunkColors[colorIndex2])
        
        colorA.push(color1.r, color1.g, color1.b)
        colorB.push(color2.r, color2.g, color2.b)
        colorPhases.push(Math.random() * Math.PI * 2) // Random color phase
        lastInfectionTime.push(-1) // Never infected initially
        
        // Start with first color
        colors.push(color1.r, color1.g, color1.b)
      } else {
        // Use base color
        const color = new THREE.Color(baseColor)
        colors.push(color.r, color.g, color.b)
        colorA.push(color.r, color.g, color.b)
        colorB.push(color.r, color.g, color.b)
        colorPhases.push(0)
        lastInfectionTime.push(-1)
      }
      
      // Add random phase and speed for pulsing animation
      phaseOffsets.push(Math.random() * Math.PI * 2) // Random phase 0 to 2π
      // Speed for 2-5 second full cycles: 2π/5 to 2π/2 radians per second
      cycleSpeeds.push((Math.PI * 2) / (5 - Math.random() * 3)) // 2-5 second cycles
      
      // Track sphere type and connections
      sphereTypes.push('vertex')
      connections.push({ type: 'vertex', vertexIndex: vertexIndex })
      
      // Add vertex-specific pulsing parameters
      if (vertexPulsePhases.length <= vertexIndex) {
        vertexPulsePhases.push(Math.random() * Math.PI * 2) // Random phase for geometry pulsing
        vertexPulseSpeeds.push((Math.PI * 2) / (3 + Math.random() * 2)) // 3-5 second cycles
      }
    })
    
    let sphereCount = uniqueVertices.length
    
    // Build edge list from triangular faces
    const edgeSet = new Set()
    const faces = []
    
    // Process triangular faces from non-indexed geometry
    for (let i = 0; i < nonIndexedVertices.length; i += 9) {
      // Get three vertices of the triangle
      const v1 = [nonIndexedVertices[i], nonIndexedVertices[i + 1], nonIndexedVertices[i + 2]]
      const v2 = [nonIndexedVertices[i + 3], nonIndexedVertices[i + 4], nonIndexedVertices[i + 5]]
      const v3 = [nonIndexedVertices[i + 6], nonIndexedVertices[i + 7], nonIndexedVertices[i + 8]]
      
      // Find indices in unique vertices array
      const key1 = `${v1[0].toFixed(6)},${v1[1].toFixed(6)},${v1[2].toFixed(6)}`
      const key2 = `${v2[0].toFixed(6)},${v2[1].toFixed(6)},${v2[2].toFixed(6)}`
      const key3 = `${v3[0].toFixed(6)},${v3[1].toFixed(6)},${v3[2].toFixed(6)}`
      
      const idx1 = vertexMap.get(key1)
      const idx2 = vertexMap.get(key2)
      const idx3 = vertexMap.get(key3)
      
      if (idx1 !== undefined && idx2 !== undefined && idx3 !== undefined) {
        const face = [idx1, idx2, idx3]
        faces.push(face)
        
        // Add edges (avoiding duplicates)
        const edges = [
          [idx1, idx2].sort((a, b) => a - b),
          [idx2, idx3].sort((a, b) => a - b),
          [idx3, idx1].sort((a, b) => a - b)
        ]
        
        edges.forEach(edge => {
          edgeSet.add(`${edge[0]},${edge[1]}`)
        })
      }
    }
    
    // Convert edge set to array
    const edgeList = Array.from(edgeSet).map(edgeStr => 
      edgeStr.split(',').map(Number)
    )
    
    // Add edge spheres
    edgeList.forEach(([startIdx, endIdx]) => {
      if (sphereCount >= maxSpheres) return
      
      const start = new THREE.Vector3(...uniqueVertices[startIdx])
      const end = new THREE.Vector3(...uniqueVertices[endIdx])
      const distance = start.distanceTo(end)
      const steps = Math.floor(distance / edgeDensity)
      
      for (let i = 1; i < steps && sphereCount < maxSpheres; i++) {
        const t = i / steps
        const point = start.clone().lerp(end, t)
        
        positions.push(point.x, point.y, point.z)
        
        // Choose colors based on strategy
        if (enableColorPulsing && colorStrategy === 'cyberpunk') {
          // Pick two random different colors from cyberpunk palette
          const colorIndex1 = Math.floor(Math.random() * cyberpunkColors.length)
          let colorIndex2 = Math.floor(Math.random() * cyberpunkColors.length)
          while (colorIndex2 === colorIndex1) {
            colorIndex2 = Math.floor(Math.random() * cyberpunkColors.length)
          }
          
          const color1 = new THREE.Color(cyberpunkColors[colorIndex1])
          const color2 = new THREE.Color(cyberpunkColors[colorIndex2])
          
          colorA.push(color1.r, color1.g, color1.b)
          colorB.push(color2.r, color2.g, color2.b)
          colorPhases.push(Math.random() * Math.PI * 2) // Random color phase
          lastInfectionTime.push(-1) // Never infected initially
          
          // Start with first color
          colors.push(color1.r, color1.g, color1.b)
        } else {
          // Use base color
          const color = new THREE.Color(baseColor)
          colors.push(color.r, color.g, color.b)
          colorA.push(color.r, color.g, color.b)
          colorB.push(color.r, color.g, color.b)
          colorPhases.push(0)
          lastInfectionTime.push(-1)
        }
        
        // Add random phase and speed for pulsing animation
        phaseOffsets.push(Math.random() * Math.PI * 2) // Random phase 0 to 2π
        // Speed for 2-5 second full cycles: 2π/5 to 2π/2 radians per second
        cycleSpeeds.push((Math.PI * 2) / (5 - Math.random() * 3)) // 2-5 second cycles
        
        // Track sphere type and connections
        sphereTypes.push('edge')
        connections.push({ 
          type: 'edge', 
          startVertex: startIdx, 
          endVertex: endIdx, 
          t: t // Position along edge (0 to 1)
        })
        
        sphereCount++
      }
    })
    
    // Add face spheres using the triangular faces
    faces.forEach(face => {
      if (sphereCount >= maxSpheres) return
      
      // Get the 3 vertices of this triangular face
      const facePoints = face.map(idx => new THREE.Vector3(...uniqueVertices[idx]))
      
      // Add a few spheres within the triangle
      const subdivisions = 2
      for (let u = 0; u <= subdivisions && sphereCount < maxSpheres; u++) {
        for (let v = 0; v <= subdivisions - u && sphereCount < maxSpheres; v++) {
          if (u === 0 && v === 0) continue // Skip vertex (already added)
          if (u === subdivisions || v === subdivisions - u) continue // Skip edges (already filled)
          
          const w = subdivisions - u - v
          if (w < 0) continue
          
          // Barycentric coordinates
          const total = subdivisions
          const alpha = u / total
          const beta = v / total
          const gamma = w / total
          
          // Calculate point using barycentric coordinates
          const point = new THREE.Vector3()
          point.add(facePoints[0].clone().multiplyScalar(alpha))
          point.add(facePoints[1].clone().multiplyScalar(beta))
          point.add(facePoints[2].clone().multiplyScalar(gamma))
          
          // Add slight randomization
          point.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.05 * scale,
            (Math.random() - 0.5) * 0.05 * scale,
            (Math.random() - 0.5) * 0.05 * scale
          ))
          
          positions.push(point.x, point.y, point.z)
          
          // Choose colors based on strategy
          if (enableColorPulsing && colorStrategy === 'cyberpunk') {
            // Pick two random different colors from cyberpunk palette
            const colorIndex1 = Math.floor(Math.random() * cyberpunkColors.length)
            let colorIndex2 = Math.floor(Math.random() * cyberpunkColors.length)
            while (colorIndex2 === colorIndex1) {
              colorIndex2 = Math.floor(Math.random() * cyberpunkColors.length)
            }
            
            const color1 = new THREE.Color(cyberpunkColors[colorIndex1])
            const color2 = new THREE.Color(cyberpunkColors[colorIndex2])
            
            colorA.push(color1.r, color1.g, color1.b)
            colorB.push(color2.r, color2.g, color2.b)
            colorPhases.push(Math.random() * Math.PI * 2) // Random color phase
            lastInfectionTime.push(-1) // Never infected initially
            
            // Start with first color
            colors.push(color1.r, color1.g, color1.b)
          } else {
            // Use base color
            const color = new THREE.Color(baseColor)
            colors.push(color.r, color.g, color.b)
            colorA.push(color.r, color.g, color.b)
            colorB.push(color.r, color.g, color.b)
            colorPhases.push(0)
            lastInfectionTime.push(-1)
          }
          
          // Add random phase and speed for pulsing animation
          phaseOffsets.push(Math.random() * Math.PI * 2) // Random phase 0 to 2π
          // Speed for 2-5 second full cycles: 2π/5 to 2π/2 radians per second
          cycleSpeeds.push((Math.PI * 2) / (5 - Math.random() * 3)) // 2-5 second cycles
          
          // Track sphere type and connections
          sphereTypes.push('face')
          connections.push({ 
            type: 'face', 
            vertices: face, // The three vertices of the triangular face
            barycentric: [alpha, beta, gamma] // Barycentric coordinates
          })
          
          sphereCount++
        }
      }
    })
    
    // Clean up geometries
    geometry.dispose()
    nonIndexedGeometry.dispose()
    
    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      phaseOffsets: new Float32Array(phaseOffsets),
      cycleSpeeds: new Float32Array(cycleSpeeds),
      colorA: new Float32Array(colorA),
      colorB: new Float32Array(colorB),
      colorPhases: new Float32Array(colorPhases),
      lastInfectionTime: new Float32Array(lastInfectionTime),
      sphereTypes: sphereTypes,
      connections: connections,
      vertexPulsePhases: new Float32Array(vertexPulsePhases),
      vertexPulseSpeeds: new Float32Array(vertexPulseSpeeds),
      originalVertices: uniqueVertices.map(v => [...v]), // Store original vertex positions
      count: Math.floor(positions.length / 3)
    }
  }, [shape, maxSpheres, colorStrategy, baseColor, scale, edgeDensity, enableColorPulsing, enableGeometryPulsing])

  // Initialize color data for infection tracking
  React.useEffect(() => {
    if (!meshRef.current || !sphereData.count) return

    // Initialize mutable color arrays for infection tracking
    sphereColorsRef.current = {
      colorA: new Float32Array(sphereData.colorA),
      colorB: new Float32Array(sphereData.colorB),
      colorPhases: new Float32Array(sphereData.colorPhases),
      lastInfectionTime: new Float32Array(sphereData.lastInfectionTime),
      adjacencyList: [] // Will be computed below
    }
    
    // Build adjacency list for infection
    const adjacencyList = []
    const adjacencyThreshold = scale * 0.8 // Distance threshold for adjacency
    
    for (let i = 0; i < sphereData.count; i++) {
      const neighbors = []
      const i3 = i * 3
      const pos1 = [sphereData.positions[i3], sphereData.positions[i3 + 1], sphereData.positions[i3 + 2]]
      
      for (let j = 0; j < sphereData.count; j++) {
        if (i === j) continue
        
        const j3 = j * 3
        const pos2 = [sphereData.positions[j3], sphereData.positions[j3 + 1], sphereData.positions[j3 + 2]]
        
        // Calculate distance
        const dx = pos1[0] - pos2[0]
        const dy = pos1[1] - pos2[1]
        const dz = pos1[2] - pos2[2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
        
        if (distance <= adjacencyThreshold) {
          neighbors.push(j)
        }
      }
      
      adjacencyList.push(neighbors)
    }
    
    sphereColorsRef.current.adjacencyList = adjacencyList
    lastInfectionCheckRef.current = 0
  }, [sphereData, scale])

  // Animate camera and pulsing spheres
  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    // Camera orbital motion with smooth changing perspectives
    const cameraTime = time * orbitSpeed
    
    // Smooth, constant-speed perspective changes - no acceleration
    const perspectivePhase = time / perspectiveChangeInterval
    
    // Gentle, smooth tilt changes (slower oscillation)
    const orbitalTilt = Math.sin(perspectivePhase * 0.2) * Math.PI * 0.25 // ±45 degrees, slower
    
    // Smooth rotation with constant angular velocity
    const orbitalRotation = perspectivePhase * 0.4 // Constant rotation speed
    
    // Calculate orbital position with changing perspective
    const baseX = Math.sin(cameraTime) * orbitRadius
    const baseY = Math.sin(cameraTime * 0.3) * orbitHeight // Slight vertical oscillation
    const baseZ = Math.cos(cameraTime) * orbitRadius
    
    // Apply orbital plane rotations for changing perspectives (smoother)
    const cosRot = Math.cos(orbitalRotation)
    const sinRot = Math.sin(orbitalRotation)
    const cosTilt = Math.cos(orbitalTilt)
    const sinTilt = Math.sin(orbitalTilt)
    
    // Rotate around Y axis first (horizontal rotation)
    const rotX = baseX * cosRot - baseZ * sinRot
    const rotZ = baseX * sinRot + baseZ * cosRot
    
    // Then tilt around X axis (vertical tilt)
    const x = rotX + position[0]
    const y = baseY * cosTilt - rotZ * sinTilt + position[1]
    const z = baseY * sinTilt + rotZ * cosTilt + position[2]
    
    camera.position.set(x, y, z)
    camera.lookAt(...position) // Always look at the dodecahedron center
    
    // Animate sphere positions, pulsing, and colors
    if (meshRef.current && sphereData.count > 0 && sphereColorsRef.current) {
      const dummy = new THREE.Object3D()
      const tempColor = new THREE.Color()
      
      // Color infection check (every colorTransitionTime seconds)
      if (enableColorPulsing && time - lastInfectionCheckRef.current >= colorTransitionTime) {
        lastInfectionCheckRef.current = time
        
        // Check each sphere for infection
        for (let i = 0; i < sphereData.count; i++) {
          if (Math.random() < infectionChance) {
            const neighbors = sphereColorsRef.current.adjacencyList[i]
            if (neighbors.length > 0) {
              // Pick a random neighbor
              const neighborIndex = neighbors[Math.floor(Math.random() * neighbors.length)]
              const neighborI3 = neighborIndex * 3
              
              // Copy neighbor's current color to this sphere's colorA
              sphereColorsRef.current.colorA[i * 3] = sphereColorsRef.current.colorA[neighborI3]
              sphereColorsRef.current.colorA[i * 3 + 1] = sphereColorsRef.current.colorA[neighborI3 + 1]
              sphereColorsRef.current.colorA[i * 3 + 2] = sphereColorsRef.current.colorA[neighborI3 + 2]
              
              // Reset phase to start transition
              sphereColorsRef.current.colorPhases[i] = 0
              sphereColorsRef.current.lastInfectionTime[i] = time
            }
          }
        }
      }
      
      // Calculate current vertex positions with geometry pulsing
      const currentVertexPositions = []
      if (enableGeometryPulsing) {
        sphereData.originalVertices.forEach((originalVertex, vertexIndex) => {
          const phase = sphereData.vertexPulsePhases[vertexIndex]
          const speed = sphereData.vertexPulseSpeeds[vertexIndex]
          const pulseTime = time * speed + phase
          const pulseScale = Math.sin(pulseTime) * 0.5 + 0.5 // 0 to 1
          
          // Calculate distance from origin and add pulsing
          const distance = Math.sqrt(originalVertex[0] ** 2 + originalVertex[1] ** 2 + originalVertex[2] ** 2)
          const pulseDistance = distance * (1 + pulseScale * geometryPulseAmount)
          const scale = pulseDistance / distance
          
          currentVertexPositions.push([
            originalVertex[0] * scale,
            originalVertex[1] * scale,
            originalVertex[2] * scale
          ])
        })
      } else {
        // Use original positions
        currentVertexPositions.push(...sphereData.originalVertices)
      }
      
      for (let i = 0; i < sphereData.count; i++) {
        const i3 = i * 3
        const connection = sphereData.connections[i]
        let spherePosition = [0, 0, 0]
        
        // Calculate position based on sphere type and current vertex positions
        if (connection.type === 'vertex') {
          // Vertex sphere - use current vertex position
          spherePosition = currentVertexPositions[connection.vertexIndex]
        } else if (connection.type === 'edge') {
          // Edge sphere - interpolate between current vertex positions
          const startPos = currentVertexPositions[connection.startVertex]
          const endPos = currentVertexPositions[connection.endVertex]
          const t = connection.t
          
          spherePosition = [
            startPos[0] * (1 - t) + endPos[0] * t,
            startPos[1] * (1 - t) + endPos[1] * t,
            startPos[2] * (1 - t) + endPos[2] * t
          ]
        } else if (connection.type === 'face') {
          // Face sphere - use barycentric coordinates with current vertex positions
          const [alpha, beta, gamma] = connection.barycentric
          const v1 = currentVertexPositions[connection.vertices[0]]
          const v2 = currentVertexPositions[connection.vertices[1]]
          const v3 = currentVertexPositions[connection.vertices[2]]
          
          spherePosition = [
            v1[0] * alpha + v2[0] * beta + v3[0] * gamma,
            v1[1] * alpha + v2[1] * beta + v3[1] * gamma,
            v1[2] * alpha + v2[2] * beta + v3[2] * gamma
          ]
        }
        
        // Set position
        dummy.position.set(
          spherePosition[0] + position[0],
          spherePosition[1] + position[1], 
          spherePosition[2] + position[2]
        )
        
        // Set scale (pulsing or static)
        if (enablePulsing) {
          // Pulse parameters: radius range 0.025 to 0.05 units (diameter 0.05 to 0.10)
          const minRadius = 0.025
          const maxRadius = 0.05
          const radiusRange = maxRadius - minRadius
          
          // Calculate pulsing scale based on individual phase and speed
          const phase = sphereData.phaseOffsets[i]
          const speed = sphereData.cycleSpeeds[i]
          const pulseTime = time * speed + phase
          const pulseScale = Math.sin(pulseTime) * 0.5 + 0.5 // 0 to 1
          const currentRadius = minRadius + pulseScale * radiusRange
          const scaleRatio = currentRadius / sphereSize // Scale relative to base sphere size
          
          dummy.scale.setScalar(scaleRatio)
        } else {
          dummy.scale.setScalar(1) // Default scale
        }
        
        // Set color (pulsing between two colors or static)
        if (enableColorPulsing && colorStrategy === 'cyberpunk') {
          // Calculate color transition
          const colorPhase = sphereColorsRef.current.colorPhases[i] + (time * Math.PI * 2) / colorTransitionTime
          const colorLerp = Math.sin(colorPhase) * 0.5 + 0.5 // 0 to 1
          
          // Interpolate between colorA and colorB
          const r = sphereColorsRef.current.colorA[i3] * (1 - colorLerp) + sphereColorsRef.current.colorB[i3] * colorLerp
          const g = sphereColorsRef.current.colorA[i3 + 1] * (1 - colorLerp) + sphereColorsRef.current.colorB[i3 + 1] * colorLerp
          const b = sphereColorsRef.current.colorA[i3 + 2] * (1 - colorLerp) + sphereColorsRef.current.colorB[i3 + 2] * colorLerp
          
          tempColor.setRGB(r, g, b)
        } else {
          // Use base color
          tempColor.setRGB(
            sphereData.colors[i3],
            sphereData.colors[i3 + 1],
            sphereData.colors[i3 + 2]
          )
        }
        
        // Update the instance matrix and color
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        meshRef.current.setColorAt(i, tempColor)
      }
      
      // Mark for updates
      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true
      }
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, sphereData.count]} {...props}>
      <sphereGeometry args={[sphereSize, 8, 6]} />
      <meshStandardMaterial 
        transparent={false}
        opacity={1.0}
      />
    </instancedMesh>
  )
}

export default PulseGeometry 