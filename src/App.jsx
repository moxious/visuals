import React, { useState } from 'react'
import VisualizerCanvas from './components/VisualizerCanvas'
import { Pyramid, StarField, AlienTerrain } from './visualizers'
import './App.css'

const VISUALIZERS = {
  pyramid: {
    name: 'Pyramid',
    component: Pyramid,
    props: {},
    canvasProps: {
      cameraPosition: [3, 3, 3],
      ambientLightIntensity: 0.5,
      directionalLightIntensity: 1,
      enableControls: true
    }
  },
  starField: {
    name: 'StarField',
    component: StarField,
    props: {
      starCount: 8000,
      spread: 150,
      starSize: 1.5,
      speed: 0.8,
      cameraPath: "forward"
    },
    canvasProps: {
      cameraPosition: [0, 0, 0],
      ambientLightIntensity: 0.1,
      directionalLightIntensity: 0.3,
      enableControls: true
    }
  },
  alienTerrain: {
    name: 'AlienTerrain',
    component: AlienTerrain,
    props: {
      speed: 0.3,
      layerThickness: 25,
      layerSpacing: 30,
      shapesPerLayer: 75
    },
    canvasProps: {
      cameraPosition: [0, 0, 0],
      ambientLightIntensity: 0.2,
      directionalLightIntensity: 0.6,
      directionalLightPosition: [5, 5, 5],
      enableControls: true
    }
  }
}

function App() {
  const [selectedVisualizer, setSelectedVisualizer] = useState('alienTerrain')
  
  const currentVisualizer = VISUALIZERS[selectedVisualizer]
  const VisualizerComponent = currentVisualizer.component

  return (
    <div className="app">
      {/* Visualizer Selector */}
      <div className="visualizer-selector">
        <label htmlFor="visualizer-select">Visualizer: </label>
        <select 
          id="visualizer-select"
          value={selectedVisualizer}
          onChange={(e) => setSelectedVisualizer(e.target.value)}
        >
          {Object.entries(VISUALIZERS).map(([key, visualizer]) => (
            <option key={key} value={key}>
              {visualizer.name}
            </option>
          ))}
        </select>
      </div>

      <VisualizerCanvas {...currentVisualizer.canvasProps}>
        <VisualizerComponent {...currentVisualizer.props} />
      </VisualizerCanvas>
    </div>
  )
}

export default App
