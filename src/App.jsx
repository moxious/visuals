import React from 'react'
import VisualizerCanvas from './components/VisualizerCanvas'
import { StarField } from './visualizers'
import './App.css'

function App() {
  return (
    <div className="app">
      <VisualizerCanvas
        cameraPosition={[0, 0, 0]}
        ambientLightIntensity={0.1}
        directionalLightIntensity={0.3}
        enableControls={false}
      >
        <StarField 
          starCount={8000}
          spread={150}
          starSize={1.5}
          speed={0.8}
          cameraPath="forward"
        />
      </VisualizerCanvas>
    </div>
  )
}

export default App
