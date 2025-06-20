import { VISUALIZER_CONFIGS, getDefaultProps, validateParameterValue } from '../config/visualizerConfigs'

// URL parameter prefix to avoid conflicts
const URL_PREFIX = 'v_'

/**
 * Encode visualizer state to URL parameters
 * @param {string} visualizerKey - Current visualizer key
 * @param {Object} visualizerProps - Current visualizer properties
 * @returns {URLSearchParams} - URL search parameters
 */
export const encodeStateToURL = (visualizerKey, visualizerProps) => {
  const params = new URLSearchParams()
  
  // Set the visualizer type
  params.set('visualizer', visualizerKey)
  
  // Get default props for comparison
  const defaults = getDefaultProps(visualizerKey)
  const config = VISUALIZER_CONFIGS[visualizerKey]
  
  if (!config) return params
  
  // Only encode parameters that differ from defaults
  Object.entries(config.parameters).forEach(([paramKey, paramConfig]) => {
    const currentValue = visualizerProps[paramKey]
    const defaultValue = defaults[paramKey]
    
    // Only add to URL if value differs from default
    if (currentValue !== undefined && currentValue !== defaultValue) {
      const urlKey = `${URL_PREFIX}${paramKey}`
      
      // Encode based on parameter type
      switch (paramConfig.type) {
        case 'boolean':
          params.set(urlKey, currentValue ? '1' : '0')
          break
        case 'number':
          params.set(urlKey, currentValue.toString())
          break
        case 'color':
          // Remove # prefix for cleaner URLs
          params.set(urlKey, currentValue.replace('#', ''))
          break
        case 'select':
          params.set(urlKey, currentValue)
          break
        default:
          params.set(urlKey, currentValue.toString())
          break
      }
    }
  })
  
  return params
}

/**
 * Decode URL parameters to visualizer state
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} - { visualizerKey, visualizerProps }
 */
export const decodeStateFromURL = (searchParams) => {
  // Get visualizer type
  const visualizerKey = searchParams.get('visualizer') || 'pulseGeometry'
  
  // Validate visualizer exists
  if (!VISUALIZER_CONFIGS[visualizerKey]) {
    console.warn(`Unknown visualizer '${visualizerKey}', falling back to pulseGeometry`)
    return {
      visualizerKey: 'pulseGeometry',
      visualizerProps: getDefaultProps('pulseGeometry')
    }
  }
  
  // Start with default props
  const visualizerProps = { ...getDefaultProps(visualizerKey) }
  const config = VISUALIZER_CONFIGS[visualizerKey]
  
  // Decode parameters from URL
  Object.entries(config.parameters).forEach(([paramKey, paramConfig]) => {
    const urlKey = `${URL_PREFIX}${paramKey}`
    const urlValue = searchParams.get(urlKey)
    
    if (urlValue !== null) {
      let decodedValue
      
      // Decode based on parameter type
      switch (paramConfig.type) {
        case 'boolean':
          decodedValue = urlValue === '1'
          break
        case 'number':
          decodedValue = parseFloat(urlValue)
          if (isNaN(decodedValue)) {
            console.warn(`Invalid number value for ${paramKey}: ${urlValue}`)
            decodedValue = paramConfig.default
          }
          break
        case 'color':
          // Add # prefix back if not present
          decodedValue = urlValue.startsWith('#') ? urlValue : `#${urlValue}`
          // Validate hex color format
          if (!/^#[0-9A-Fa-f]{6}$/i.test(decodedValue)) {
            console.warn(`Invalid color value for ${paramKey}: ${urlValue}`)
            decodedValue = paramConfig.default
          }
          break
        case 'select':
          // Validate against available options
          const validOptions = paramConfig.options.map(opt => opt.value)
          if (validOptions.includes(urlValue)) {
            decodedValue = urlValue
          } else {
            console.warn(`Invalid select value for ${paramKey}: ${urlValue}`)
            decodedValue = paramConfig.default
          }
          break
        default:
          decodedValue = urlValue
          break
      }
      
      // Validate and set the parameter
      visualizerProps[paramKey] = validateParameterValue(visualizerKey, paramKey, decodedValue)
    }
  })
  
  return {
    visualizerKey,
    visualizerProps
  }
}

/**
 * Update the browser URL with current state
 * @param {string} visualizerKey - Current visualizer key
 * @param {Object} visualizerProps - Current visualizer properties
 * @param {boolean} replaceState - Whether to replace current history entry
 */
export const updateURL = (visualizerKey, visualizerProps, replaceState = true) => {
  const params = encodeStateToURL(visualizerKey, visualizerProps)
  const newURL = `${window.location.pathname}?${params.toString()}`
  
  if (replaceState) {
    window.history.replaceState(null, '', newURL)
  } else {
    window.history.pushState(null, '', newURL)
  }
}

/**
 * Get current URL parameters
 * @returns {URLSearchParams} - Current URL search parameters
 */
export const getCurrentURLParams = () => {
  return new URLSearchParams(window.location.search)
}

/**
 * Generate a shareable URL for current state
 * @param {string} visualizerKey - Current visualizer key
 * @param {Object} visualizerProps - Current visualizer properties
 * @returns {string} - Complete shareable URL
 */
export const generateShareableURL = (visualizerKey, visualizerProps) => {
  const params = encodeStateToURL(visualizerKey, visualizerProps)
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}

/**
 * Check if current URL has any visualization parameters
 * @returns {boolean} - True if URL contains visualization parameters
 */
export const hasURLParameters = () => {
  const params = getCurrentURLParams()
  return params.has('visualizer') || Array.from(params.keys()).some(key => key.startsWith(URL_PREFIX))
}

/**
 * Clear all visualization parameters from URL
 */
export const clearURLParameters = () => {
  const newURL = `${window.location.pathname}`
  window.history.replaceState(null, '', newURL)
} 