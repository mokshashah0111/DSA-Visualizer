import React, { useState, useRef, useEffect } from 'react';
import { useAnimation, AnimationStep } from '../hooks/useAnimation';
import AnimationControls from './AnimationControls';

interface TreeNode {
  id: string;
  value: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
  x?: number;
  y?: number;
}

const TreeVisualizer: React.FC = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [deleteValue, setDeleteValue] = useState<string>('');
  const [treeInput, setTreeInput] = useState<string>('10, 5, 15, 3, 7, 12, 20');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animation = useAnimation();

  // Initialize with a sample tree
  useEffect(() => {
    const values = treeInput
      .split(',')
      .map(val =>
         val.trim())
      .filter(val => val !== '')
      .map(val => parseInt(val))
      .filter(val => !isNaN(val));
    
    if (values.length === 0) return;
    
    let root: TreeNode | null = null;
    
    values.forEach((value, index) => {
      if (index === 0) {
        root = { id: index.toString(), value };
      } else {
        root = insertIntoBST(root!, value, index.toString());
      }
    });
    
    setTree(root);
  }, []);

  // Create tree from comma-separated values
  const createTreeFromInput = () => {
    const values = treeInput
      .split(',')
      .map(val => val.trim())
      .filter(val => val !== '')
      .map(val => parseInt(val))
      .filter(val => !isNaN(val));
    
    if (values.length === 0) return;
    
    let root: TreeNode | null = null;
    
    values.forEach((value, index) => {
      if (index === 0) {
        root = { id: index.toString(), value };
      } else {
        root = insertIntoBST(root!, value, index.toString());
      }
    });
    
    setTree(root);
  };

  // Insert into BST
  const insertIntoBST = (node: TreeNode, value: number, id: string): TreeNode => {
    if (value < node.value) {
      if (node.left) {
        node.left = insertIntoBST(node.left, value, id);
      } else {
        node.left = { id, value };
      }
    } else {
      if (node.right) {
        node.right = insertIntoBST(node.right, value, id);
      } else {
        node.right = { id, value };
      }
    }
    return node;
  };

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
    
    // Color based on highlight state
    if (highlightedNodes.includes(node.id)) {
      ctx.fillStyle = '#e53e3e';
    } else {
      ctx.fillStyle = '#4299e1';
    }
    
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

  // Animated insertion with step-by-step visualization
  const insertNodeAnimated = async (value: number) => {
    if (!tree) {
      const steps: AnimationStep[] = [{
        description: `Creating root node with value ${value}`,
        data: { id: Date.now().toString(), value },
        highlights: []
      }];
      
      await animation.executeSteps(steps, (step, index) => {
        setTree(step.data);
        setHighlightedNodes((step.highlights || []) as string[]);
      });
      return;
    }

    const steps: AnimationStep[] = [];
    const path: string[] = [];
    
    // Find insertion path
    const findPath = (node: TreeNode, target: number): string[] => {
      path.push(node.id);
      
      if (target < node.value) {
        if (node.left) {
          return findPath(node.left, target);
        } else {
          return path;
        }
      } else {
        if (node.right) {
          return findPath(node.right, target);
        } else {
          return path;
        }
      }
    };

    const insertionPath = findPath(tree, value);
    
    steps.push({
      description: `Starting insertion of value ${value}`,
      data: tree,
      highlights: []
    });

    // Animate the path
    for (let i = 0; i < insertionPath.length; i++) {
      const nodeId = insertionPath[i];
      const node = findNodeById(tree, nodeId);
      
      if (node) {
        if (i === insertionPath.length - 1) {
          // Last node - show where we'll insert
          if (value < node.value) {
            steps.push({
              description: `Found insertion point: ${value} < ${node.value}, will insert as left child`,
              data: tree,
              highlights: [nodeId]
            });
          } else {
            steps.push({
              description: `Found insertion point: ${value} >= ${node.value}, will insert as right child`,
              data: tree,
              highlights: [nodeId]
            });
          }
        } else {
          steps.push({
            description: `Traversing to node ${node.value} (${value < node.value ? 'left' : 'right'} path)`,
            data: tree,
            highlights: [nodeId]
          });
        }
      }
    }

    // Perform actual insertion
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

    const newTree = insert(tree, value);
    steps.push({
      description: `Successfully inserted ${value} into the tree`,
      data: newTree,
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setTree(step.data);
      setHighlightedNodes((step.highlights || []) as string[]);
    });
  };

  // Helper function to find node by ID
  const findNodeById = (node: TreeNode | null, id: string): TreeNode | null => {
    if (!node) return null;
    if (node.id === id) return node;
    
    const left = findNodeById(node.left || null, id);
    if (left) return left;
    
    return findNodeById(node.right || null, id);
  };

  // Animated deletion with step-by-step visualization
  const deleteNodeAnimated = async (value: number) => {
    if (!tree) {
      return;
    }

    const steps: AnimationStep[] = [];
    
    // Find the node to delete
    const findNodeToDelete = (node: TreeNode, target: number): TreeNode | null => {
      if (node.value === target) return node;
      if (target < node.value && node.left) return findNodeToDelete(node.left, target);
      if (target > node.value && node.right) return findNodeToDelete(node.right, target);
      return null;
    };

    const nodeToDelete = findNodeToDelete(tree, value);
    
    if (!nodeToDelete) {
      steps.push({
        description: `Value ${value} not found in the tree`,
        data: tree,
        highlights: []
      });
      
      await animation.executeSteps(steps, (step, index) => {
        setTree(step.data);
        setHighlightedNodes((step.highlights || []) as string[]);
      });
      return;
    }

    steps.push({
      description: `Found node ${value} to delete`,
      data: tree,
      highlights: [nodeToDelete.id]
    });

    // Handle different deletion cases
    if (!nodeToDelete.left && !nodeToDelete.right) {
      // Case 1: Leaf node
      steps.push({
        description: `Node ${value} is a leaf node - can be deleted directly`,
        data: tree,
        highlights: [nodeToDelete.id]
      });
    } else if (!nodeToDelete.left || !nodeToDelete.right) {
      // Case 2: Node with one child
      const child = nodeToDelete.left || nodeToDelete.right;
      steps.push({
        description: `Node ${value} has one child (${child?.value}) - replace with child`,
        data: tree,
        highlights: [nodeToDelete.id, child?.id || '']
      });
    } else {
      // Case 3: Node with two children - find inorder successor
      const findInorderSuccessor = (node: TreeNode): TreeNode => {
        let current = node.right!;
        while (current.left) {
          current = current.left;
        }
        return current;
      };

      const successor = findInorderSuccessor(nodeToDelete);
      steps.push({
        description: `Node ${value} has two children - find inorder successor (${successor.value})`,
        data: tree,
        highlights: [nodeToDelete.id, successor.id]
      });
    }

    // Perform actual deletion
    const deleteNode = (node: TreeNode, target: number): TreeNode | null => {
      if (target < node.value) {
        return {
          ...node,
          left: node.left ? deleteNode(node.left, target) : null
        };
      } else if (target > node.value) {
        return {
          ...node,
          right: node.right ? deleteNode(node.right, target) : null
        };
      } else {
        // Found the node to delete
        if (!node.left && !node.right) {
          return null; // Leaf node
        } else if (!node.left) {
          return node.right!; // Only right child
        } else if (!node.right) {
          return node.left!; // Only left child
        } else {
          // Two children - find inorder successor
          const findInorderSuccessor = (node: TreeNode): TreeNode => {
            let current = node.right!;
            while (current.left) {
              current = current.left;
            }
            return current;
          };
          
          const successor = findInorderSuccessor(node);
          return {
            ...node,
            value: successor.value,
            right: deleteNode(node.right!, successor.value)
          };
        }
      }
    };

    const newTree = deleteNode(tree, value);
    steps.push({
      description: `Successfully deleted ${value} from the tree`,
      data: newTree,
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setTree(step.data);
      setHighlightedNodes((step.highlights || []) as string[]);
    });
  };

  // Handle form submissions
  const handleInsertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      insertNodeAnimated(value);
      setInputValue('');
    }
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseInt(deleteValue);
    if (!isNaN(value)) {
      deleteNodeAnimated(value);
      setDeleteValue('');
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
        
        <div className="input-section">
          <h4>Create Your Tree</h4>
          <p className="input-description">Enter comma-separated numbers to build a BST:</p>
          <form onSubmit={(e) => { e.preventDefault(); createTreeFromInput(); }} className="input-form">
            <input
              type="text"
              value={treeInput}
              onChange={(e) => setTreeInput(e.target.value)}
              placeholder="e.g., 10, 5, 15, 3, 7, 12, 20"
              className="array-input"
              disabled={animation.isPlaying}
            />
            <button type="submit" className="create-btn" disabled={animation.isPlaying}>
              Create Tree
            </button>
          </form>
        </div>

        <div className="input-section">
          <h4>Insert Node</h4>
          <form onSubmit={handleInsertSubmit} className="input-form">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a number"
              className="number-input"
              disabled={animation.isPlaying}
            />
            <button type="submit" className="insert-btn" disabled={animation.isPlaying}>
              Insert Node
            </button>
          </form>
        </div>

        <div className="input-section">
          <h4>Delete Node</h4>
          <form onSubmit={handleDeleteSubmit} className="input-form">
            <input
              type="number"
              value={deleteValue}
              onChange={(e) => setDeleteValue(e.target.value)}
              placeholder="Enter a number to delete"
              className="number-input"
              disabled={animation.isPlaying}
            />
            <button type="submit" className="delete-btn" disabled={animation.isPlaying}>
              Delete Node
            </button>
          </form>
        </div>

        <AnimationControls 
          animation={animation} 
          onSpeedChange={setAnimationSpeed}
          speed={animationSpeed}
        />

        <div className="tree-info">
          <p><strong>Binary Search Tree Operations:</strong></p>
          <p>1. <strong>Create Tree:</strong> Build BST from comma-separated values</p>
          <p>2. <strong>Insert:</strong> Add new nodes maintaining BST property</p>
          <p>3. <strong>Delete:</strong> Remove nodes with proper restructuring</p>
          <p><strong>BST Rules:</strong> Left &lt; Parent &lt; Right</p>
          <p><strong>Colors:</strong> Blue=Normal, Red=Highlighted</p>
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
