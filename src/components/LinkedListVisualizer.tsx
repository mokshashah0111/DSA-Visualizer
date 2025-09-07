import React, { useState, useRef, useEffect } from 'react';

interface ListNode {
  id: string;
  value: number;
  next?: ListNode;
}

const LinkedListVisualizer: React.FC = () => {
  const [head, setHead] = useState<ListNode | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleList: ListNode = {
      id: '1',
      value: 10,
      next: {
        id: '2',
        value: 20,
        next: {
          id: '3',
          value: 30,
          next: {
            id: '4',
            value: 40
          }
        }
      }
    };
    setHead(sampleList);
  }, []);

  // Draw the linked list
  const drawLinkedList = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!head) return;

    let current = head;
    let x = 100;
    const y = canvas.height / 2;
    const nodeWidth = 80;
    const nodeHeight = 60;

    while (current) {
      // Draw node rectangle
      ctx.fillStyle = '#4299e1';
      ctx.fillRect(x, y - nodeHeight/2, nodeWidth, nodeHeight);
      
      // Draw border
      ctx.strokeStyle = '#2b6cb0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y - nodeHeight/2, nodeWidth, nodeHeight);

      // Draw value
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(current.value.toString(), x + nodeWidth/2, y);

      // Draw arrow to next node
      if (current.next) {
        const arrowX = x + nodeWidth + 10;
        const arrowY = y;
        
        // Arrow line
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX + 30, arrowY);
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Arrow head
        ctx.beginPath();
        ctx.moveTo(arrowX + 30, arrowY);
        ctx.lineTo(arrowX + 25, arrowY - 5);
        ctx.lineTo(arrowX + 25, arrowY + 5);
        ctx.closePath();
        ctx.fillStyle = '#4a5568';
        ctx.fill();
      }

      x += nodeWidth + 50;
      current = current.next;
    }
  };

  // Insert at the beginning
  const insertAtBeginning = async (value: number) => {
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newNode: ListNode = {
      id: Date.now().toString(),
      value,
      next: head
    };
    setHead(newNode);
    setIsAnimating(false);
  };

  // Insert at the end
  const insertAtEnd = async (value: number) => {
    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const newNode: ListNode = {
      id: Date.now().toString(),
      value
    };

    if (!head) {
      setHead(newNode);
    } else {
      let current = head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
      setHead({ ...head });
    }
    setIsAnimating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      insertAtBeginning(value);
      setInputValue('');
    }
  };

  useEffect(() => {
    drawLinkedList();
  }, [head]);

  return (
    <div className="visualizer">
      <div className="controls">
        <h2>Linked List Visualizer</h2>
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
            {isAnimating ? 'Inserting...' : 'Insert at Head'}
          </button>
        </form>
        <div className="button-group">
          <button 
            onClick={() => {
              const value = parseInt(inputValue);
              if (!isNaN(value)) insertAtEnd(value);
            }}
            className="insert-btn"
            disabled={isAnimating}
          >
            Insert at Tail
          </button>
        </div>
        <div className="list-info">
          <p>Insert nodes at the beginning or end of the linked list</p>
          <p>Each node points to the next node in the sequence</p>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="list-canvas"
        />
      </div>
    </div>
  );
};

export default LinkedListVisualizer;
