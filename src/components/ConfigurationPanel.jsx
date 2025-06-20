import React, { useState, useEffect } from 'react'
import { VISUALIZER_CONFIGS } from '../config/visualizerConfigs'
import './ConfigurationPanel.css'

// Individual parameter control components
const NumberControl = ({ param, value, onChange }) => (
  <div className="control-group">
    <label className="control-label" title={param.description}>
      {param.label}
    </label>
    <div className="number-control">
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-input"
      />
      <input
        type="number"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="number-input"
      />
    </div>
  </div>
)

const BooleanControl = ({ param, value, onChange }) => (
  <div className="control-group">
    <label className="control-label" title={param.description}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox-input"
      />
      {param.label}
    </label>
  </div>
)

const ColorControl = ({ param, value, onChange }) => (
  <div className="control-group">
    <label className="control-label" title={param.description}>
      {param.label}
    </label>
    <div className="color-control">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="color-input"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="color-text-input"
        placeholder="#ffffff"
      />
    </div>
  </div>
)

const SelectControl = ({ param, value, onChange }) => (
  <div className="control-group">
    <label className="control-label" title={param.description}>
      {param.label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="select-input"
    >
      {param.options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

function ConfigurationPanel({ 
  visualizerKey, 
  currentProps, 
  onPropsChange,
  isVisible,
  onToggleVisibility,
  onGenerateShareURL 
}) {
  const [localProps, setLocalProps] = useState(currentProps)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  
  const config = VISUALIZER_CONFIGS[visualizerKey]
  
  // Update local state when visualizer changes
  useEffect(() => {
    setLocalProps(currentProps)
  }, [visualizerKey, currentProps])
  
  // Handle parameter change
  const handleParameterChange = (paramKey, value) => {
    const newProps = { ...localProps, [paramKey]: value }
    setLocalProps(newProps)
    onPropsChange(newProps)
  }
  
  // Reset to defaults
  const handleReset = () => {
    const defaultProps = {}
    Object.entries(config.parameters).forEach(([key, param]) => {
      defaultProps[key] = param.default
    })
    setLocalProps(defaultProps)
    onPropsChange(defaultProps)
  }
  
  // Handle share URL generation
  const handleShare = async () => {
    if (!onGenerateShareURL) return
    
    try {
      const shareableURL = onGenerateShareURL()
      
      // Try to copy to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareableURL)
        setShareMessage('✅ URL copied to clipboard!')
      } else {
        // Fallback for older browsers or non-HTTPS
        setShareMessage(`📋 Copy this URL: ${shareableURL}`)
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setShareMessage(''), 3000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
      setShareMessage('❌ Failed to copy URL')
      setTimeout(() => setShareMessage(''), 3000)
    }
  }
  
  if (!isVisible || !config) {
    return (
      <button 
        className="config-toggle-button"
        onClick={onToggleVisibility}
        title="Show Configuration Panel"
      >
        ⚙️
      </button>
    )
  }
  
  return (
    <div className="configuration-panel">
      <div className="config-header">
        <div className="config-title">
          <h3>{config.name} Configuration</h3>
          <p className="config-description">{config.description}</p>
        </div>
        <div className="config-actions">
          <button
            className="config-action-button"
            onClick={handleShare}
            title="Share Configuration URL"
          >
            🔗
          </button>
          <button
            className="config-action-button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? '📋' : '➖'}
          </button>
          <button
            className="config-action-button"
            onClick={handleReset}
            title="Reset to Defaults"
          >
            🔄
          </button>
          <button
            className="config-action-button"
            onClick={onToggleVisibility}
            title="Hide Configuration Panel"
          >
            ✕
          </button>
        </div>
      </div>
      
      {shareMessage && (
        <div className="config-share-message">
          {shareMessage}
        </div>
      )}
      
      {!isCollapsed && (
        <div className="config-content">
          <div className="parameter-groups">
            {Object.entries(config.parameters).map(([paramKey, param]) => {
              const value = localProps[paramKey] ?? param.default
              
              return (
                <div key={paramKey} className="parameter-item">
                  {param.type === 'number' && (
                    <NumberControl
                      param={param}
                      value={value}
                      onChange={(val) => handleParameterChange(paramKey, val)}
                    />
                  )}
                  {param.type === 'boolean' && (
                    <BooleanControl
                      param={param}
                      value={value}
                      onChange={(val) => handleParameterChange(paramKey, val)}
                    />
                  )}
                  {param.type === 'color' && (
                    <ColorControl
                      param={param}
                      value={value}
                      onChange={(val) => handleParameterChange(paramKey, val)}
                    />
                  )}
                  {param.type === 'select' && (
                    <SelectControl
                      param={param}
                      value={value}
                      onChange={(val) => handleParameterChange(paramKey, val)}
                    />
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="config-footer">
            <small>
              {Object.keys(config.parameters).length} parameters available
            </small>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConfigurationPanel 