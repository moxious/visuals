import React from 'react'
import { VisualizerCanvas } from '../components'
import { AlienTerrain } from '../visualizers'

/**
 * Example scene configurations for the AlienTerrain visualizer
 * This demonstrates different speeds, densities, and layer configurations
 */

// Dense alien jungle with many shapes
export function AlienJungleScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.3}
      directionalLightIntensity={0.8}
      directionalLightPosition={[3, 3, 3]}
      enableControls={true}
    >
      <AlienTerrain 
        speed={0.3}
        layerThickness={35}
        layerSpacing={25}
        shapesPerLayer={25}
      />
    </VisualizerCanvas>
  )
}

// Sparse alien void with fewer, larger formations
export function AlienVoidScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.1}
      directionalLightIntensity={0.4}
      directionalLightPosition={[8, 8, 5]}
      enableControls={true}
    >
      <AlienTerrain 
        speed={0.6}
        layerThickness={20}
        layerSpacing={50}
        shapesPerLayer={8}
      />
    </VisualizerCanvas>
  )
}

// Fast journey through alien tunnel
export function AlienTunnelScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.2}
      directionalLightIntensity={0.7}
      directionalLightPosition={[4, 4, 4]}
      enableControls={true}
    >
      <AlienTerrain 
        speed={0.8}
        layerThickness={15}
        layerSpacing={20}
        shapesPerLayer={12}
      />
    </VisualizerCanvas>
  )
}

// Default alien terrain scene
function AlienTerrainScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.2}
      directionalLightIntensity={0.6}
      directionalLightPosition={[5, 5, 5]}
      enableControls={true}
    >
      <AlienTerrain 
        speed={0.3}
        layerThickness={25}
        layerSpacing={30}
        shapesPerLayer={15}
      />
    </VisualizerCanvas>
  )
}

export default AlienTerrainScene 