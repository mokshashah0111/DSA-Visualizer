import React, { useState, useRef, useEffect } from 'react';

const StackVisualizer: React.FC = () => {
  const [stack, setStack] = useState<number[]>([90, 11, 22, 12]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the stack
  const drawStack = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const stackWidth = 100;
    const stackHeight = 50;
    const startX = canvas.width / 2 - stackWidth / 2;
    const startY = canvas.height - 100;

    // Draw stack base
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(startX - 10, startY + stack.length * stackHeight, stackWidth + 20, 10);

    // Draw stack elements
    stack.forEach((value, index) => {
      const y = startY - (index * stackHeight);
      
      // Draw element
      ctx.fillStyle = '#4299e1';
      ctx.fillRect(startX, y, stackWidth, stackHeight);
      
      // Draw border
      ctx.strokeStyle = '#2b6cb0';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, y, stackWidth, stackHeight);

      // Draw value
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), startX + stackWidth/2, y + stackHeight/2);

      // Draw index
      ctx.fillStyle = '#4a5568';
      ctx.font = '12px Arial';
      ctx.fillText(`[${index}]`, startX - 30, y + stackHeight/2);
    });

    // Draw stack label
    ctx.fillStyle = '#2d3748';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('STACK (LIFO)', startX + stackWidth/2, startY + stack.length * stackHeight + 40);
  };

  // Push operation
  const push = async (value: number) => {
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setStack([...stack, value]);
    setIsAnimating(false);
  };

  // Pop operation
  const pop = async () => {
    if (stack.length === 0) return;
    
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setStack(stack.slice(0, -1));
    setIsAnimating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      push(value);
      setInputValue('');
    }
  };

  useEffect(() => {
    drawStack();
  }, [stack]);

  return (
    <div className="visualizer">
      <div className="controls">
        <h2>Stack Visualizer</h2>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number"
            className="number-input"
            disabled={isAnimating}
          />
          <button type="submit" className="insert-btn" disabled={isAnimating}>
            {isAnimating ? 'Pushing...' : 'Push'}
          </button>
        </form>
        <div className="button-group">
          <button 
            onClick={pop}
            className="pop-btn"
            disabled={isAnimating || stack.length === 0}
          >
            {isAnimating ? 'Popping...' : 'Pop'}
          </button>
        </div>
        <div className="stack-info">
          <p>Stack follows LIFO (Last In, First Out) principle</p>
          <p>Push adds to top, Pop removes from top</p>
          <p>Current size: {stack.length}</p>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="stack-canvas"
        />
      </div>
    </div>
  );
};

export default StackVisualizer;
