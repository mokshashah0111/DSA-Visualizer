import React, { useState, useRef, useEffect } from 'react';

interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode;
  right?: TreeNode;
  x?: number;
  y?: number;
}

const TreeVisualizer: React.FC = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with a sample tree
  useEffect(() => {
    const sampleTree: TreeNode = {
      id: '1',
      value: 10,
      left: {
        id: '2',
        value: 5,
        left: { id: '4', value: 3 },
        right: { id: '5', value: 7 }
      },
      right: {
        id: '3',
        value: 15,
        left: { id: '6', value: 12 },
        right: { id: '7', value: 20 }
      }
    };
    setTree(sampleTree);
  }, []);

  // Calculate positions for tree nodes
  const calculatePositions = (node: TreeNode, x: number, y: number, level: number): TreeNode => {
    const nodeWidth = 40;
    const nodeHeight = 40;
    const levelHeight = 80;
    const spacing = Math.max(100, 200 - level * 20);

    const newNode = { ...node, x, y };

    if (node.left) {
      newNode.left = calculatePositions(node.left, x - spacing, y + levelHeight, level + 1);
    }
    if (node.right) {
      newNode.right = calculatePositions(node.right, x + spacing, y + levelHeight, level + 1);
    }

    return newNode;
  };

  // Draw the tree on canvas
  const drawTree = () => {
    const canvas = canvasRef.current;
    if (!canvas || !tree) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const positionedTree = calculatePositions(tree, canvas.width / 2, 50, 0);
    drawNode(ctx, positionedTree);
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: TreeNode) => {
    if (!node.x || !node.y) return;

    // Draw connections to children
    if (node.left && node.left.x && node.left.y) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y + 20);
      ctx.lineTo(node.left.x, node.left.y - 20);
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawNode(ctx, node.left);
    }

    if (node.right && node.right.x && node.right.y) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y + 20);
      ctx.lineTo(node.right.x, node.right.y - 20);
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 2;
      ctx.stroke();
      drawNode(ctx, node.right);
    }

    // Draw the node
    ctx.beginPath();
    ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#4299e1';
    ctx.fill();
    ctx.strokeStyle = '#2b6cb0';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw the value
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.value.toString(), node.x, node.y);
  };

  // Insert a new node
  const insertNode = async (value: number) => {
    if (!tree) {
      setTree({ id: Date.now().toString(), value });
      return;
    }

    setIsAnimating(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const insert = (node: TreeNode, newValue: number): TreeNode => {
      if (newValue < node.value) {
        return {
          ...node,
          left: node.left ? insert(node.left, newValue) : { id: Date.now().toString(), value: newValue }
        };
      } else {
        return {
          ...node,
          right: node.right ? insert(node.right, newValue) : { id: Date.now().toString(), value: newValue }
        };
      }
    };

    setTree(insert(tree, value));
    setIsAnimating(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      insertNode(value);
      setInputValue('');
    }
  };

  // Redraw when tree changes
  useEffect(() => {
    drawTree();
  }, [tree]);

  return (
    <div className="visualizer">
      <div className="controls">
        <h2>Binary Tree Visualizer</h2>
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
            {isAnimating ? 'Inserting...' : 'Insert'}
          </button>
        </form>
        <div className="tree-info">
          <p>Click "Insert" to add nodes to the binary search tree</p>
          <p>Left child: smaller values | Right child: larger values</p>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="tree-canvas"
        />
      </div>
    </div>
  );
};

export default TreeVisualizer;
