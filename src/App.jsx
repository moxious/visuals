import React, { useState, useEffect, useCallback, useRef } from 'react'
import VisualizerCanvas from './components/VisualizerCanvas'
import ConfigurationPanel from './components/ConfigurationPanel'
import { Pyramid, StarField, AlienTerrain, PulseGeometry } from './visualizers'
import HopalongAttractor from './visualizers/HopalongAttractor/HopalongAttractor'
import Mycelium from './visualizers/Mycelium/Mycelium'
import { getDefaultProps, VISUALIZER_CONFIGS } from './config/visualizerConfigs'
import { 
  decodeStateFromURL, 
  updateURL, 
  getCurrentURLParams, 
  hasURLParameters,
  generateShareableURL 
} from './utils/urlState'
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
    cameraPosition: [0, 0, 37.5], // Default pulled back by 50%
    ambientLightIntensity: 0.8,
    directionalLightIntensity: 0.2,
    enableControls: true
  },
  mycelium: {
    cameraPosition: [8, 2, 0],
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
  const [configPanelCollapsed, setConfigPanelCollapsed] = useState(true) // Default to collapsed
  const [visualizerProps, setVisualizerProps] = useState({})
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Debounce URL updates to avoid excessive history entries
  const urlUpdateTimeoutRef = useRef(null)
  
  // Initialize state from URL or defaults
  useEffect(() => {
    const initializeFromURL = () => {
      if (hasURLParameters()) {
        // Load from URL
        const urlParams = getCurrentURLParams()
        const { visualizerKey, visualizerProps: urlProps, panelCollapsed } = decodeStateFromURL(urlParams)
        
        console.log('🔗 Loading from URL:', { visualizerKey, urlProps, panelCollapsed })
        
        setSelectedVisualizer(visualizerKey)
        setConfigPanelCollapsed(panelCollapsed)
        
        // Initialize all visualizer props
        const allProps = {}
        Object.keys(VISUALIZER_COMPONENTS).forEach(key => {
          allProps[key] = key === visualizerKey ? urlProps : getDefaultProps(key)
        })
        setVisualizerProps(allProps)
      } else {
        // Load defaults
        console.log('📋 Loading default configuration')
        
        const defaultProps = {}
        Object.keys(VISUALIZER_COMPONENTS).forEach(key => {
          defaultProps[key] = getDefaultProps(key)
        })
        setVisualizerProps(defaultProps)
      }
      
      setIsInitialized(true)
    }
    
    initializeFromURL()
  }, [])
  
  // Update URL when state changes (debounced)
  const updateURLDebounced = useCallback((visualizerKey, props, panelCollapsed) => {
    // Clear existing timeout
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current)
    }
    
    // Set new timeout
    urlUpdateTimeoutRef.current = setTimeout(() => {
      updateURL(visualizerKey, props, panelCollapsed, true)
      console.log('🔗 URL updated for:', visualizerKey, 'panel collapsed:', panelCollapsed)
    }, 300) // 300ms debounce
  }, [])
  
  // Handle browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      console.log('🔄 Browser navigation detected, updating from URL')
      const urlParams = getCurrentURLParams()
      const { visualizerKey, visualizerProps: urlProps, panelCollapsed } = decodeStateFromURL(urlParams)
      
      setSelectedVisualizer(visualizerKey)
      setConfigPanelCollapsed(panelCollapsed)
      setVisualizerProps(prev => ({
        ...prev,
        [visualizerKey]: urlProps
      }))
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  
  // Update URL when visualizer, props, or panel state change
  useEffect(() => {
    if (!isInitialized) return
    
    const currentProps = visualizerProps[selectedVisualizer]
    if (currentProps) {
      updateURLDebounced(selectedVisualizer, currentProps, configPanelCollapsed)
    }
  }, [selectedVisualizer, visualizerProps, configPanelCollapsed, isInitialized, updateURLDebounced])
  
  const VisualizerComponent = VISUALIZER_COMPONENTS[selectedVisualizer]
  const currentProps = visualizerProps[selectedVisualizer] || {}
  
  // Get canvas config and apply dynamic parameters
  const getCanvasConfig = () => {
    const baseConfig = CANVAS_CONFIGS[selectedVisualizer] || {}
    
    // Apply dynamic camera positioning for HopalongAttractor
    if (selectedVisualizer === 'hopalongAttractor' && currentProps.cameraDistance !== undefined) {
      return {
        ...baseConfig,
        cameraPosition: [0, 0, currentProps.cameraDistance]
      }
    }
    
    return baseConfig
  }
  
  const canvasConfig = getCanvasConfig()

  // Handle visualizer change
  const handleVisualizerChange = (newVisualizer) => {
    setSelectedVisualizer(newVisualizer)
    console.log('🎨 Visualizer changed to:', newVisualizer)
  }

  // Handle props change from configuration panel
  const handlePropsChange = (newProps) => {
    setVisualizerProps(prev => ({
      ...prev,
      [selectedVisualizer]: newProps
    }))
    console.log('⚙️ Props updated for:', selectedVisualizer)
  }
  
  // Generate shareable URL
  const getShareableURL = () => {
    return generateShareableURL(selectedVisualizer, currentProps, configPanelCollapsed)
  }

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#61dafb',
          fontSize: '18px'
        }}>
          Loading visualization...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Configuration Panel */}
      <ConfigurationPanel
        visualizerKey={selectedVisualizer}
        currentProps={currentProps}
        onPropsChange={handlePropsChange}
        onVisualizerChange={handleVisualizerChange}
        isVisible={configPanelVisible}
        onToggleVisibility={() => setConfigPanelVisible(!configPanelVisible)}
        onGenerateShareURL={getShareableURL}
        isCollapsed={configPanelCollapsed}
        onToggleCollapsed={() => setConfigPanelCollapsed(!configPanelCollapsed)}
      />

      <VisualizerCanvas {...canvasConfig}>
        <VisualizerComponent {...currentProps} />
      </VisualizerCanvas>
    </div>
  )
}

export default App
