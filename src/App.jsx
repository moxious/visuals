import React, { useState } from 'react'
import VisualizerCanvas from './components/VisualizerCanvas'
import { Pyramid, StarField, AlienTerrain } from './visualizers'
import HopalongAttractor from './visualizers/HopalongAttractor/HopalongAttractor'
import Mycelium from './visualizers/Mycelium/Mycelium'
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
  },
  hopalongAttractor: {
    name: 'Hopalong Attractor',
    component: HopalongAttractor,
    props: {
      pointCount: 50000,
      speed: 0.5,
      scale: 0.8,
      iterations: 100000
    },
    canvasProps: {
      cameraPosition: [0, 0, 25],
      ambientLightIntensity: 0.8,
      directionalLightIntensity: 0.2,
      enableControls: true
    }
  },
  mycelium: {
    name: 'Mycelium',
    component: Mycelium,
    props: {
      maxParticles: 5000,
      killRadius: 50,
      stepSize: 0.9
    },
    canvasProps: {
      cameraPosition: [0, 0, 17],
      ambientLightIntensity: 0.3,
      directionalLightIntensity: 0.1,
      enableControls: true
    }
  }
}

function App() {
  const [selectedVisualizer, setSelectedVisualizer] = useState('mycelium')
  
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
