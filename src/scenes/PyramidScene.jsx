import React from 'react'
import { VisualizerCanvas } from '../components'
import { Pyramid } from '../visualizers'

/**
 * Example scene configuration for the Pyramid visualizer
 * This demonstrates how to create different scene setups using the abstracted components
 */
function PyramidScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[4, 4, 4]}
      cameraFov={75}
      ambientLightIntensity={0.6}
      directionalLightPosition={[8, 8, 4]}
      directionalLightIntensity={1.2}
      minDistance={2}
      maxDistance={15}
    >
      <Pyramid 
        color="#ff6b6b"
        size={1.2}
        height={2.5}
        rotationSpeed={0.3}
        metalness={0.2}
        roughness={0.1}
      />
    </VisualizerCanvas>
  )
}

export default PyramidScene 