import React, { useState, useRef, useEffect } from 'react';

const QueueVisualizer: React.FC = () => {
  const [queue, setQueue] = useState<number[]>([90, 11, 22, 12]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the queue
  const drawQueue = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const elementWidth = 80;
    const elementHeight = 60;
    const startX = 50;
    const startY = canvas.height / 2 - elementHeight / 2;

    // Draw queue elements horizontally
    queue.forEach((value, index) => {
      const x = startX + (index * (elementWidth + 10));
      
      // Draw element
      ctx.fillStyle = '#4299e1';
      ctx.fillRect(x, startY, elementWidth, elementHeight);
      
      // Draw border
      ctx.strokeStyle = '#2b6cb0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, startY, elementWidth, elementHeight);

      // Draw value
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value.toString(), x + elementWidth/2, startY + elementHeight/2);
    });

    // Draw front and rear indicators
    if (queue.length > 0) {
      // Front indicator
      ctx.fillStyle = '#e53e3e';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FRONT', startX + elementWidth/2, startY - 20);

      // Rear indicator
      const rearX = startX + ((queue.length - 1) * (elementWidth + 10)) + elementWidth/2;
      ctx.fillStyle = '#38a169';
      ctx.fillText('REAR', rearX, startY + elementHeight + 30);
    }

    // Draw queue label
    ctx.fillStyle = '#2d3748';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QUEUE (FIFO)', canvas.width/2, startY - 60);
  };

  // Enqueue operation
  const enqueue = async (value: number) => {
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setQueue([...queue, value]);
    setIsAnimating(false);
  };

  // Dequeue operation
  const dequeue = async () => {
    if (queue.length === 0) return;
    
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setQueue(queue.slice(1));
    setIsAnimating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      enqueue(value);
      setInputValue('');
    }
  };

  useEffect(() => {
    drawQueue();
  }, [queue]);

  return (
    <div className="visualizer">
      <div className="controls">
        <h2>Queue Visualizer</h2>
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
            {isAnimating ? 'Enqueuing...' : 'Enqueue'}
          </button>
        </form>
        <div className="button-group">
          <button 
            onClick={dequeue}
            className="dequeue-btn"
            disabled={isAnimating || queue.length === 0}
          >
            {isAnimating ? 'Dequeuing...' : 'Dequeue'}
          </button>
        </div>
        <div className="queue-info">
          <p>Queue follows FIFO (First In, First Out) principle</p>
          <p>Enqueue adds to rear, Dequeue removes from front</p>
          <p>Current size: {queue.length}</p>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={300}
          className="queue-canvas"
        />
      </div>
    </div>
  );
};

export default QueueVisualizer;
