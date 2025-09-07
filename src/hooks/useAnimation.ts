import React, { useState, useRef, useCallback } from 'react';

export interface AnimationStep {
  description: string;
  data: any;
  highlights?: number[];
  delay?: number;
}

export interface UseAnimationReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  currentDescription: string;
  play: () => void;
  pause: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  executeSteps: (steps: AnimationStep[], onStepComplete?: (step: AnimationStep, index: number) => void) => Promise<void>;
}

export const useAnimation = (): UseAnimationReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [currentDescription, setCurrentDescription] = useState('');
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const onStepCompleteRef = useRef<((step: AnimationStep, index: number) => void) | null>(null);

  const play = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      setIsPlaying(true);
      executeCurrentStep();
    } else {
      setIsPlaying(true);
      setIsPaused(false);
    }
  }, [isPaused]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(true);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(0);
    setCurrentDescription('');
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const executeCurrentStep = useCallback(() => {
    if (currentStep < steps.length && onStepCompleteRef.current) {
      const step = steps[currentStep];
      setCurrentDescription(step.description);
      onStepCompleteRef.current(step, currentStep);
      
      if (isPlaying && !isPaused && currentStep < steps.length - 1) {
        const delay = step.delay || 1000;
        animationRef.current = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, delay);
      } else if (currentStep >= steps.length - 1) {
        setIsPlaying(false);
        setIsPaused(false);
      }
    }
  }, [currentStep, steps, isPlaying, isPaused]);

  const executeSteps = useCallback(async (
    newSteps: AnimationStep[], 
    onStepComplete?: (step: AnimationStep, index: number) => void
  ) => {
    setSteps(newSteps);
    setTotalSteps(newSteps.length);
    setCurrentStep(0);
    setCurrentDescription('');
    onStepCompleteRef.current = onStepComplete || null;
    
    if (newSteps.length > 0) {
      setCurrentDescription(newSteps[0].description);
      if (onStepComplete) {
        onStepComplete(newSteps[0], 0);
      }
    }
  }, []);

  // Execute step when currentStep changes
  React.useEffect(() => {
    if (isPlaying && !isPaused) {
      executeCurrentStep();
    }
  }, [currentStep, isPlaying, isPaused, executeCurrentStep]);

  return {
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
    goToStep,
    executeSteps
  };
};
