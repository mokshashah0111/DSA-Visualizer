import React from 'react';
import { UseAnimationReturn } from '../hooks/useAnimation';

interface AnimationControlsProps {
  animation: UseAnimationReturn;
  onSpeedChange?: (speed: number) => void;
  speed?: number;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({ 
  animation, 
  onSpeedChange, 
  speed = 1000 
}) => {
  const {
    isPlaying,
    isPaused,
    currentStep,
    totalSteps,
    currentDescription,
    play,
    pause,
    reset,
    nextStep,
    prevStep,
    goToStep
  } = animation;

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="animation-controls">
      <div className="controls-header">
        <h3>Animation Controls</h3>
        <div className="step-info">
          Step {currentStep + 1} of {totalSteps}
        </div>
      </div>
      
      <div className="description-box">
        <p>{currentDescription || 'Ready to start animation...'}</p>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max={Math.max(0, totalSteps - 1)}
          value={currentStep}
          onChange={(e) => goToStep(parseInt(e.target.value))}
          className="progress-slider"
          disabled={totalSteps === 0}
        />
      </div>

      <div className="control-buttons">
        <button 
          onClick={prevStep} 
          className="control-btn prev-btn"
          disabled={currentStep === 0}
        >
          ⏮️ Previous
        </button>
        
        <button 
          onClick={isPlaying ? pause : play} 
          className={`control-btn ${isPlaying ? 'pause-btn' : 'play-btn'}`}
          disabled={totalSteps === 0}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        <button 
          onClick={nextStep} 
          className="control-btn next-btn"
          disabled={currentStep >= totalSteps - 1}
        >
          Next ⏭️
        </button>
        
        <button 
          onClick={reset} 
          className="control-btn reset-btn"
        >
          🔄 Reset
        </button>
      </div>

      <div className="speed-control">
        <label>Animation Speed:</label>
        <select 
          value={speed} 
          onChange={(e) => onSpeedChange?.(parseInt(e.target.value))}
          className="speed-select"
        >
          <option value={2000}>Slow (2s)</option>
          <option value={1000}>Normal (1s)</option>
          <option value={500}>Fast (0.5s)</option>
          <option value={200}>Very Fast (0.2s)</option>
        </select>
      </div>
    </div>
  );
};

export default AnimationControls;
