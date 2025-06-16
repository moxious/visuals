import React from 'react'
import { VisualizerCanvas } from '../components'
import { StarField } from '../visualizers'

/**
 * Example scene configurations for the StarField visualizer
 * This demonstrates different camera movement patterns and star field settings
 */

// Hyperspace jump effect
export function HyperspaceScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.05}
      directionalLightIntensity={0.1}
      enableControls={false}
    >
      <StarField 
        starCount={10000}
        spread={200}
        starSize={2}
        speed={2}
        cameraPath="forward"
        starColor="#ffffff"
      />
    </VisualizerCanvas>
  )
}

// Spiral journey through stars
export function SpiralStarScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.1}
      directionalLightIntensity={0.2}
      enableControls={false}
    >
      <StarField 
        starCount={6000}
        spread={120}
        starSize={1.8}
        speed={1.2}
        cameraPath="spiral"
        starColor="#e6f3ff"
      />
    </VisualizerCanvas>
  )
}

// Wave motion through colorful nebula
export function NebulaWaveScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[0, 0, 0]}
      ambientLightIntensity={0.15}
      directionalLightIntensity={0.25}
      enableControls={false}
    >
      <StarField 
        starCount={7500}
        spread={100}
        starSize={2.5}
        speed={0.6}
        cameraPath="wave"
        starColor="#ffddff"
      />
    </VisualizerCanvas>
  )
}

// Default star field scene
function StarFieldScene() {
  return <HyperspaceScene />
}

export default StarFieldScene 