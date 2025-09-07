import React, { useState, useRef, useEffect } from 'react';
import { useAnimation, AnimationStep } from '../hooks/useAnimation';
import AnimationControls from './AnimationControls';

const ArrayVisualizer: React.FC = () => {
  const [array, setArray] = useState<number[]>([64, 34, 25, 12, 22, 11, 90]);
  const [inputValue, setInputValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [searchResult, setSearchResult] = useState<number>(-1);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animation = useAnimation();

  // Draw the array
  const drawArray = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = Math.floor(canvas.width / array.length) - 2;
    const maxValue = Math.max(...array, 1);
    const scale = (canvas.height - 100) / maxValue;

    array.forEach((value, index) => {
      const x = index * (barWidth + 2);
      const barHeight = value * scale;
      const y = canvas.height - barHeight - 50;

      // Determine color based on state
      let fillColor = '#4299e1';
      if (highlightedIndices.includes(index)) {
        fillColor = '#e53e3e';
      } else if (searchResult === index) {
        fillColor = '#38a169';
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw border
      ctx.strokeStyle = '#2b6cb0';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth, barHeight);

      // Draw value
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toString(), x + barWidth/2, y - 5);

      // Draw index
      ctx.fillStyle = '#4a5568';
      ctx.fillText(index.toString(), x + barWidth/2, canvas.height - 20);
    });
  };

  // Bubble sort with step-by-step animation
  const bubbleSort = async () => {
    const arr = [...array];
    const steps: AnimationStep[] = [];
    const n = arr.length;

    steps.push({
      description: `Starting Bubble Sort with ${n} elements`,
      data: [...arr],
      highlights: []
    });

    for (let i = 0; i < n - 1; i++) {
      steps.push({
        description: `Outer loop iteration ${i + 1}: Sorting the largest ${i + 1} elements`,
        data: [...arr],
        highlights: []
      });

      for (let j = 0; j < n - i - 1; j++) {
        steps.push({
          description: `Comparing elements at positions ${j} and ${j + 1}: ${arr[j]} vs ${arr[j + 1]}`,
          data: [...arr],
          highlights: [j, j + 1]
        });

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            description: `Swapping ${arr[j + 1]} and ${arr[j]}`,
            data: [...arr],
            highlights: [j, j + 1]
          });
        } else {
          steps.push({
            description: `No swap needed: ${arr[j]} <= ${arr[j + 1]}`,
            data: [...arr],
            highlights: [j, j + 1]
          });
        }
      }
    }

    steps.push({
      description: 'Bubble Sort completed! Array is now sorted.',
      data: [...arr],
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setArray(step.data);
      setHighlightedIndices(step.highlights || []);
    });
  };

  // Linear search with animation
  const linearSearch = async () => {
    const target = parseInt(searchValue);
    if (isNaN(target)) return;

    const steps: AnimationStep[] = [];
    steps.push({
      description: `Starting linear search for value ${target}`,
      data: [...array],
      highlights: []
    });

    for (let i = 0; i < array.length; i++) {
      steps.push({
        description: `Checking element at index ${i}: ${array[i]}`,
        data: [...array],
        highlights: [i]
      });

      if (array[i] === target) {
        steps.push({
          description: `Found ${target} at index ${i}!`,
          data: [...array],
          highlights: [i]
        });
        setSearchResult(i);
        break;
      }
    }

    if (steps[steps.length - 1].description.includes('Checking')) {
      steps.push({
        description: `Value ${target} not found in the array`,
        data: [...array],
        highlights: []
      });
      setSearchResult(-1);
    }

    await animation.executeSteps(steps, (step, index) => {
      setHighlightedIndices(step.highlights || []);
    });
  };

  // Insert element at specific index
  const insertElement = async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    const steps: AnimationStep[] = [];
    const newArray = [...array, value];
    
    steps.push({
      description: `Inserting ${value} at the end of the array`,
      data: newArray,
      highlights: [newArray.length - 1]
    });

    await animation.executeSteps(steps, (step, index) => {
      setArray(step.data);
      setHighlightedIndices(step.highlights || []);
    });
    setInputValue('');
  };

  // Delete element at specific index
  const deleteElement = async (index: number) => {
    if (index < 0 || index >= array.length) return;

    const steps: AnimationStep[] = [];
    const value = array[index];
    
    steps.push({
      description: `Deleting element ${value} at index ${index}`,
      data: [...array],
      highlights: [index]
    });

    const newArray = array.filter((_, i) => i !== index);
    steps.push({
      description: `Element ${value} removed. Array size is now ${newArray.length}`,
      data: newArray,
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setArray(step.data);
      setHighlightedIndices(step.highlights || []);
    });
  };

  // Reset array
  const resetArray = () => {
    setArray([64, 34, 25, 12, 22, 11, 90]);
    setHighlightedIndices([]);
    setSearchResult(-1);
    animation.reset();
  };

  useEffect(() => {
    drawArray();
  }, [array, highlightedIndices, searchResult]);

  return (
    <div className="visualizer">
      <div className="controls">
        <h2>Array Visualizer</h2>
        
        <div className="input-section">
          <h4>Add Element</h4>
          <form onSubmit={(e) => { e.preventDefault(); insertElement(); }} className="input-form">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a number"
              className="number-input"
              disabled={animation.isPlaying}
            />
            <button type="submit" className="insert-btn" disabled={animation.isPlaying}>
              Add Element
            </button>
          </form>
        </div>

        <div className="input-section">
          <h4>Search Element</h4>
          <form onSubmit={(e) => { e.preventDefault(); linearSearch(); }} className="input-form">
            <input
              type="number"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for a number"
              className="number-input"
              disabled={animation.isPlaying}
            />
            <button type="submit" className="search-btn" disabled={animation.isPlaying}>
              Search
            </button>
          </form>
        </div>

        <div className="button-group">
          <button 
            onClick={bubbleSort}
            className="sort-btn"
            disabled={animation.isPlaying}
          >
            Bubble Sort
          </button>
          <button 
            onClick={resetArray}
            className="reset-btn"
            disabled={animation.isPlaying}
          >
            Reset Array
          </button>
        </div>

        <AnimationControls 
          animation={animation} 
          onSpeedChange={setAnimationSpeed}
          speed={animationSpeed}
        />

        <div className="array-info">
          <p><strong>Operations:</strong></p>
          <p>• Add: Insert element at end</p>
          <p>• Search: Find element position</p>
          <p>• Sort: Arrange elements in order</p>
          <p><strong>Colors:</strong> Blue=Normal, Red=Comparing, Green=Found</p>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="array-canvas"
        />
      </div>
    </div>
  );
};

export default ArrayVisualizer;
