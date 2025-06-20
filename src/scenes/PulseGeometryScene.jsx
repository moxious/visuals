import React from 'react'
import { VisualizerCanvas } from '../components'
import { PulseGeometry } from '../visualizers'

/**
 * Example scene configuration for the PulseGeometry visualizer
 * This demonstrates a dodecahedron made of small white spheres with orbital camera movement
 */
function PulseGeometryScene() {
  return (
    <VisualizerCanvas
      cameraPosition={[8, 2, 8]} // Initial position (will be overridden by orbital motion)
      cameraFov={75}
      ambientLightIntensity={0.4}
      directionalLightPosition={[10, 10, 5]}
      directionalLightIntensity={0.8}
      pointLightPosition={[-10, -10, -10]}
      pointLightIntensity={0.3}
      enableControls={false} // Disable controls since we have automatic camera movement
      minDistance={2}
      maxDistance={20}
    >
      <PulseGeometry 
        position={[0, 0, 0]}
        shape="dodecahedron"
        maxSpheres={2000}
        colorStrategy="solid"
        baseColor="#ffffff"
        sphereSize={0.025}
        scale={2}
        orbitSpeed={0.08}
        orbitRadius={10}
        orbitHeight={3}
        edgeDensity={0.12}
      />
    </VisualizerCanvas>
  )
}

export default PulseGeometryScene 