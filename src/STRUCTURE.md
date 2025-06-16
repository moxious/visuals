# Visualizer App Structure

This document explains the abstracted structure of the visualizer app and how to add new visualizers.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── VisualizerCanvas.jsx  # Generic Three.js canvas wrapper
│   └── index.js         # Component exports
├── visualizers/         # Individual visualizer components
│   ├── Pyramid/         # Pyramid visualizer
│   │   └── Pyramid.jsx  # Pyramid component
│   ├── StarField/       # Star field visualizer
│   │   └── StarField.jsx # Star field component
│   ├── AlienTerrain/    # Alien terrain visualizer
│   │   └── AlienTerrain.jsx # Alien terrain component
│   └── index.js         # Visualizer exports
├── scenes/              # Pre-configured scene examples
│   ├── PyramidScene.jsx # Example pyramid scene
│   ├── StarFieldScene.jsx # Example star field scenes
│   └── AlienTerrainScene.jsx # Example alien terrain scenes
├── App.jsx              # Main application component
└── ...
```

## Architecture

### VisualizerCanvas
A generic wrapper component that provides:
- Three.js Canvas setup
- Standard lighting configuration
- Orbital controls (pan, zoom, rotate)
- Configurable camera settings
- Extensible props for customization

### Visualizer Components
Individual 3D objects/shapes that can be:
- Used independently within any scene
- Customized through props (color, size, animation, etc.)
- Combined with other visualizers
- Extended with additional features

## Adding New Visualizers

### 1. Create the Visualizer Component

Create a new directory in `src/visualizers/`:

```bash
mkdir src/visualizers/YourVisualizer
```

Create the component file `src/visualizers/YourVisualizer/YourVisualizer.jsx`:

```jsx
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function YourVisualizer({ 
  position = [0, 0, 0], 
  color = "#61dafb",
  // Add more customizable props here
  ...props 
}) {
  const meshRef = useRef()
  
  // Add animations using useFrame if needed
  useFrame((state) => {
    // Animation logic here
  })

  return (
    <mesh ref={meshRef} position={position} {...props}>
      {/* Your geometry here */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default YourVisualizer
```

### 2. Export the Component

Add your visualizer to `src/visualizers/index.js`:

```jsx
export { default as YourVisualizer } from './YourVisualizer/YourVisualizer'
```

### 3. Use in App or Scene

```jsx
import { VisualizerCanvas } from './components'
import { YourVisualizer } from './visualizers'

function App() {
  return (
    <div className="app">
      <VisualizerCanvas>
        <YourVisualizer color="#ff6b6b" />
      </VisualizerCanvas>
    </div>
  )
}
```

## Current Visualizers

### Pyramid
- **File**: `src/visualizers/Pyramid/Pyramid.jsx`
- **Props**: 
  - `position` - 3D position array
  - `color` - Material color
  - `size` - Base radius
  - `height` - Pyramid height
  - `wireframe` - Wireframe mode
  - `rotationSpeed` - Animation speed
  - `metalness` - Material metalness
  - `roughness` - Material roughness

### StarField
- **File**: `src/visualizers/StarField/StarField.jsx`
- **Features**: Camera movement through 3D star field with animated paths
- **Props**:
  - `starCount` - Number of stars (default: 5000)
  - `spread` - Distribution area size (default: 100)
  - `starColor` - Color of stars (default: '#ffffff')
  - `starSize` - Size of individual stars (default: 2)
  - `speed` - Animation speed multiplier (default: 1)
  - `cameraPath` - Movement pattern: 'forward', 'spiral', 'wave' (default: 'forward')

**Camera Movement Patterns**:
- **forward**: Smooth forward motion with subtle drift
- **spiral**: Spiraling movement around the star field
- **wave**: Wave-like undulating motion through space

### AlienTerrain
- **File**: `src/visualizers/AlienTerrain/AlienTerrain.jsx`
- **Features**: Spaceship journey through thick layers of rotating alien geometric shapes
- **Props**:
  - `speed` - Forward camera movement speed (default: 0.3)
  - `layerThickness` - Thickness of each shape layer (default: 25)
  - `layerSpacing` - Distance between layer centers (default: 30)
  - `shapesPerLayer` - Number of shapes per layer (default: 15)

**Shape Features**:
- **Shape Types**: Rings (thick torus), torus, and cylinders with bright random colors
- **Gentle Rotation**: Each shape rotates slowly around its fixed position
- **Thick Layers**: "Fat fields" of shapes creating immersive alien terrain
- **Dynamic Generation**: New layers created ahead, old layers removed behind camera
- **Forward Movement**: Camera flies through the terrain at a leisurely, noticeable pace
- **Interactive Controls**: Mouse controls enabled for click & drag rotation and scroll zoom
- **No Disappearing**: All shapes have minimum thickness to remain visible when rotating

## Examples

See `src/scenes/` for example scene configurations:
- **PyramidScene.jsx**: Pyramid visualizer examples
- **StarFieldScene.jsx**: Multiple star field configurations including:
  - `HyperspaceScene`: Fast forward motion effect
  - `SpiralStarScene`: Spiral camera movement
  - `NebulaWaveScene`: Wave motion through colored stars
- **AlienTerrainScene.jsx**: Alien terrain configurations including:
  - `AlienJungleScene`: Dense terrain with many shapes
  - `AlienVoidScene`: Sparse formations in alien void
  - `AlienTunnelScene`: Fast journey through geometric tunnel 