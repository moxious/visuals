// Comprehensive configuration metadata for all visualizers
export const VISUALIZER_CONFIGS = {
  pyramid: {
    name: 'Pyramid',
    description: 'Rotating pyramid with material properties',
    parameters: {
      color: {
        type: 'color',
        default: '#61dafb',
        label: 'Color',
        description: 'Primary color of the pyramid'
      },
      size: {
        type: 'number',
        default: 1,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: 'Base Size',
        description: 'Radius of the pyramid base'
      },
      height: {
        type: 'number',
        default: 2,
        min: 0.1,
        max: 10,
        step: 0.1,
        label: 'Height',
        description: 'Height of the pyramid'
      },
      wireframe: {
        type: 'boolean',
        default: false,
        label: 'Wireframe',
        description: 'Show wireframe instead of solid'
      },
      metalness: {
        type: 'number',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Metalness',
        description: 'How metallic the surface appears'
      },
      roughness: {
        type: 'number',
        default: 0.2,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Roughness',
        description: 'Surface roughness'
      },
      rotationSpeed: {
        type: 'number',
        default: 0.2,
        min: -2,
        max: 2,
        step: 0.01,
        label: 'Rotation Speed',
        description: 'Speed of rotation (negative for reverse)'
      }
    }
  },

  starField: {
    name: 'Star Field',
    description: 'Interactive journey through a colorful star field',
    parameters: {
      starCount: {
        type: 'number',
        default: 8000,
        min: 100,
        max: 20000,
        step: 100,
        label: 'Star Count',
        description: 'Number of stars to render'
      },
      spread: {
        type: 'number',
        default: 150,
        min: 10,
        max: 500,
        step: 5,
        label: 'Star Spread',
        description: 'Size of the star field area'
      },
      starColor: {
        type: 'color',
        default: '#ffffff',
        label: 'Star Color',
        description: 'Base color for stars (when not random)'
      },
      starSize: {
        type: 'number',
        default: 1.5,
        min: 0.1,
        max: 10,
        step: 0.1,
        label: 'Star Size',
        description: 'Size of individual stars'
      },
      speed: {
        type: 'number',
        default: 0.8,
        min: 0,
        max: 5,
        step: 0.1,
        label: 'Animation Speed',
        description: 'Speed of camera movement'
      },
      cameraPath: {
        type: 'select',
        default: 'forward',
        options: [
          { value: 'forward', label: 'Forward Motion' },
          { value: 'spiral', label: 'Spiral Movement' },
          { value: 'wave', label: 'Wave Motion' }
        ],
        label: 'Camera Path',
        description: 'Type of camera movement'
      },
      randomColors: {
        type: 'boolean',
        default: true,
        label: 'Random Colors',
        description: 'Use random star colors vs single color'
      }
    }
  },

  alienTerrain: {
    name: 'Alien Terrain',
    description: 'Journey through layers of morphing alien geometric shapes',
    parameters: {
      speed: {
        type: 'number',
        default: 0.3,
        min: 0,
        max: 2,
        step: 0.05,
        label: 'Movement Speed',
        description: 'Speed of forward motion through terrain'
      },
      layerThickness: {
        type: 'number',
        default: 25,
        min: 5,
        max: 100,
        step: 5,
        label: 'Layer Thickness',
        description: 'Thickness of each shape layer'
      },
      layerSpacing: {
        type: 'number',
        default: 30,
        min: 10,
        max: 100,
        step: 5,
        label: 'Layer Spacing',
        description: 'Distance between layer centers'
      },
      shapesPerLayer: {
        type: 'number',
        default: 75,
        min: 1,
        max: 200,
        step: 5,
        label: 'Shapes Per Layer',
        description: 'Number of shapes in each layer'
      }
    }
  },

  hopalongAttractor: {
    name: 'Hopalong Attractor',
    description: 'Mathematical strange attractor with rippling color waves',
    parameters: {
      pointCount: {
        type: 'number',
        default: 50000,
        min: 1000,
        max: 200000,
        step: 1000,
        label: 'Point Count',
        description: 'Number of points in the attractor'
      },
      speed: {
        type: 'number',
        default: 0.5,
        min: 0,
        max: 3,
        step: 0.1,
        label: 'Animation Speed',
        description: 'Speed of rotation and color waves'
      },
      scale: {
        type: 'number',
        default: 0.8,
        min: 0.1,
        max: 3,
        step: 0.1,
        label: 'Scale',
        description: 'Overall size scale of the attractor'
      },
      iterations: {
        type: 'number',
        default: 100000,
        min: 10000,
        max: 1000000,
        step: 10000,
        label: 'Iterations',
        description: 'Mathematical iterations for point generation'
      }
    }
  },

  mycelium: {
    name: 'Mycelium',
    description: 'Organic growth simulation with pulsing color waves',
    parameters: {
      maxParticles: {
        type: 'number',
        default: 5000,
        min: 100,
        max: 20000,
        step: 100,
        label: 'Max Particles',
        description: 'Maximum number of growth points'
      },
      killRadius: {
        type: 'number',
        default: 50,
        min: 10,
        max: 200,
        step: 5,
        label: 'Growth Radius',
        description: 'Maximum distance from center for growth'
      },
      stepSize: {
        type: 'number',
        default: 0.9,
        min: 0.1,
        max: 3,
        step: 0.1,
        label: 'Step Size',
        description: 'Size of each growth step'
      },
      orbitRadius: {
        type: 'number',
        default: 8,
        min: 3,
        max: 25,
        step: 0.5,
        label: 'Orbit Radius',
        description: 'Distance of camera from center during orbital movement'
      }
    }
  },

  pulseGeometry: {
    name: 'Pulse Geometry',
    description: 'Multi-layered pulsing dodecahedron with cyberpunk colors',
    parameters: {
      // Geometry parameters
      scale: {
        type: 'number',
        default: 2,
        min: 0.5,
        max: 5,
        step: 0.1,
        label: 'Geometry Scale',
        description: 'Overall size of the dodecahedron'
      },
      maxSpheres: {
        type: 'number',
        default: 2000,
        min: 100,
        max: 5000,
        step: 100,
        label: 'Max Spheres',
        description: 'Maximum number of spheres to render'
      },
      sphereSize: {
        type: 'number',
        default: 0.025,
        min: 0.005,
        max: 0.1,
        step: 0.005,
        label: 'Base Sphere Size',
        description: 'Base radius of individual spheres'
      },
      edgeDensity: {
        type: 'number',
        default: 0.12,
        min: 0.05,
        max: 0.5,
        step: 0.01,
        label: 'Edge Density',
        description: 'Spacing between spheres on edges'
      },

      // Animation toggles
      enablePulsing: {
        type: 'boolean',
        default: true,
        label: 'Size Pulsing',
        description: 'Enable individual sphere size pulsing'
      },
      enableColorPulsing: {
        type: 'boolean',
        default: true,
        label: 'Color Pulsing',
        description: 'Enable cyberpunk color pulsing'
      },
      enableGeometryPulsing: {
        type: 'boolean',
        default: true,
        label: 'Geometry Pulsing',
        description: 'Enable figure-wide expansion pulsing'
      },

      // Color strategy
      colorStrategy: {
        type: 'select',
        default: 'cyberpunk',
        options: [
          { value: 'solid', label: 'Solid Color' },
          { value: 'cyberpunk', label: 'Cyberpunk Colors' }
        ],
        label: 'Color Strategy',
        description: 'Color animation approach'
      },
      baseColor: {
        type: 'color',
        default: '#ffffff',
        label: 'Base Color',
        description: 'Color when using solid strategy'
      },

      // Timing parameters
      colorTransitionTime: {
        type: 'number',
        default: 4,
        min: 1,
        max: 10,
        step: 0.5,
        label: 'Color Transition Time',
        description: 'Seconds for color transitions'
      },
      infectionChance: {
        type: 'number',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Infection Chance',
        description: 'Probability of color infection per cycle'
      },
      geometryPulseAmount: {
        type: 'number',
        default: 0.4,
        min: 0,
        max: 1,
        step: 0.05,
        label: 'Geometry Pulse Amount',
        description: 'Amount of vertex expansion (40% = 0.4)'
      },

      // Camera parameters
      orbitSpeed: {
        type: 'number',
        default: 0.08,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: 'Orbit Speed',
        description: 'Speed of camera orbit'
      },
      orbitRadius: {
        type: 'number',
        default: 4,
        min: 2,
        max: 20,
        step: 0.5,
        label: 'Orbit Radius',
        description: 'Distance of camera from center'
      },
      orbitHeight: {
        type: 'number',
        default: 3,
        min: 0,
        max: 10,
        step: 0.5,
        label: 'Orbit Height',
        description: 'Vertical oscillation amplitude'
      },
      perspectiveChangeInterval: {
        type: 'number',
        default: 3,
        min: 1,
        max: 10,
        step: 0.5,
        label: 'Perspective Change Interval',
        description: 'Seconds between camera angle changes'
      }
    }
  }
}

// Helper function to get default props for a visualizer
export const getDefaultProps = (visualizerKey) => {
  const config = VISUALIZER_CONFIGS[visualizerKey]
  if (!config) return {}
  
  const defaultProps = {}
  Object.entries(config.parameters).forEach(([key, param]) => {
    defaultProps[key] = param.default
  })
  return defaultProps
}

// Helper function to validate parameter value
export const validateParameterValue = (visualizerKey, paramKey, value) => {
  const config = VISUALIZER_CONFIGS[visualizerKey]
  if (!config || !config.parameters[paramKey]) return value
  
  const param = config.parameters[paramKey]
  
  switch (param.type) {
    case 'number':
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return param.default
      return Math.max(param.min, Math.min(param.max, numValue))
    
    case 'boolean':
      return Boolean(value)
    
    case 'color':
      // Basic color validation - could be enhanced
      return typeof value === 'string' && value.startsWith('#') ? value : param.default
    
    case 'select':
      const validOptions = param.options.map(opt => opt.value)
      return validOptions.includes(value) ? value : param.default
    
    default:
      return value
  }
} 