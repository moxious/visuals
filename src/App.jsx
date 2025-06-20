import React, { useState } from 'react'
import VisualizerCanvas from './components/VisualizerCanvas'
import ConfigurationPanel from './components/ConfigurationPanel'
import { Pyramid, StarField, AlienTerrain, PulseGeometry } from './visualizers'
import HopalongAttractor from './visualizers/HopalongAttractor/HopalongAttractor'
import Mycelium from './visualizers/Mycelium/Mycelium'
import { getDefaultProps, VISUALIZER_CONFIGS } from './config/visualizerConfigs'
import './App.css'

// Component mapping for visualizers
const VISUALIZER_COMPONENTS = {
  pyramid: Pyramid,
  starField: StarField,
  alienTerrain: AlienTerrain,
  hopalongAttractor: HopalongAttractor,
  mycelium: Mycelium,
  pulseGeometry: PulseGeometry
}

// Canvas configuration for each visualizer
const CANVAS_CONFIGS = {
  pyramid: {
    cameraPosition: [3, 3, 3],
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 1,
    enableControls: true
  },
  starField: {
    cameraPosition: [0, 0, 0],
    ambientLightIntensity: 0.1,
    directionalLightIntensity: 0.3,
    enableControls: true
  },
  alienTerrain: {
    cameraPosition: [0, 0, 0],
    ambientLightIntensity: 0.2,
    directionalLightIntensity: 0.6,
    directionalLightPosition: [5, 5, 5],
    enableControls: true
  },
  hopalongAttractor: {
    cameraPosition: [0, 0, 25],
    ambientLightIntensity: 0.8,
    directionalLightIntensity: 0.2,
    enableControls: true
  },
  mycelium: {
    cameraPosition: [12, 2, 0],
    ambientLightIntensity: 0.3,
    directionalLightIntensity: 0.1,
    enableControls: true
  },
  pulseGeometry: {
    cameraPosition: [8, 2, 8],
    ambientLightIntensity: 0.4,
    directionalLightIntensity: 0.8,
    directionalLightPosition: [10, 10, 5],
    pointLightIntensity: 0.3,
    enableControls: false
  }
}

function App() {
  const [selectedVisualizer, setSelectedVisualizer] = useState('pulseGeometry')
  const [configPanelVisible, setConfigPanelVisible] = useState(true)
  
  // Initialize visualizer props with defaults
  const [visualizerProps, setVisualizerProps] = useState(() => {
    const initialProps = {}
    Object.keys(VISUALIZER_COMPONENTS).forEach(key => {
      initialProps[key] = getDefaultProps(key)
    })
    return initialProps
  })
  
  const VisualizerComponent = VISUALIZER_COMPONENTS[selectedVisualizer]
  const canvasConfig = CANVAS_CONFIGS[selectedVisualizer] || {}
  const currentProps = visualizerProps[selectedVisualizer] || {}

  // Handle visualizer change
  const handleVisualizerChange = (newVisualizer) => {
    setSelectedVisualizer(newVisualizer)
    // Optionally reset config panel visibility when switching
    // setConfigPanelVisible(true)
  }

  // Handle props change from configuration panel
  const handlePropsChange = (newProps) => {
    setVisualizerProps(prev => ({
      ...prev,
      [selectedVisualizer]: newProps
    }))
  }

  return (
    <div className="app">
      {/* Configuration Panel */}
      <ConfigurationPanel
        visualizerKey={selectedVisualizer}
        currentProps={currentProps}
        onPropsChange={handlePropsChange}
        isVisible={configPanelVisible}
        onToggleVisibility={() => setConfigPanelVisible(!configPanelVisible)}
      />

      {/* Visualizer Selector */}
      <div className="visualizer-selector">
        <label htmlFor="visualizer-select">Visualizer: </label>
        <select 
          id="visualizer-select"
          value={selectedVisualizer}
          onChange={(e) => handleVisualizerChange(e.target.value)}
        >
          {Object.keys(VISUALIZER_COMPONENTS).map(key => {
            // Get name from config metadata
            const config = VISUALIZER_CONFIGS[key]
            return (
              <option key={key} value={key}>
                {config?.name || key}
              </option>
            )
          })}
        </select>
      </div>

      <VisualizerCanvas {...canvasConfig}>
        <VisualizerComponent {...currentProps} />
      </VisualizerCanvas>
    </div>
  )
}

export default App
