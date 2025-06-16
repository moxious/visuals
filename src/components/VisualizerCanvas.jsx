import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function VisualizerCanvas({ 
  children,
  cameraPosition = [3, 3, 3],
  cameraFov = 75,
  ambientLightIntensity = 0.5,
  directionalLightPosition = [10, 10, 5],
  directionalLightIntensity = 1,
  pointLightPosition = [-10, -10, -10],
  pointLightIntensity = 0.5,
  enableControls = true,
  minDistance = 0.1,
  maxDistance = 100,
  ...canvasProps
}) {
  return (
    <Canvas
      className="three-canvas"
      camera={{ 
        position: cameraPosition, 
        fov: cameraFov,
        near: 0.1,
        far: 1000
      }}
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'block'
      }}
      {...canvasProps}
    >
      {/* Ambient light for general illumination */}
      <ambientLight intensity={ambientLightIntensity} />
      
      {/* Directional light for shadows and depth */}
      <directionalLight 
        position={directionalLightPosition} 
        intensity={directionalLightIntensity}
        castShadow
      />
      
      {/* Point light for additional highlights */}
      <pointLight 
        position={pointLightPosition} 
        intensity={pointLightIntensity} 
      />
      
      {/* Render the visualizer component(s) */}
      {children}
      
      {/* OrbitControls for mouse interaction */}
      {enableControls && (
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={minDistance}
          maxDistance={maxDistance}
        />
      )}
    </Canvas>
  )
}

export default VisualizerCanvas 