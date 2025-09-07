import React, { useState, useRef, useEffect } from 'react';
import { useAnimation, AnimationStep } from '../hooks/useAnimation';
import AnimationControls from './AnimationControls';

interface Node {
  id: string;
  x: number;
  y: number;
  value: number;
  visited?: boolean;
  distance?: number;
  parent?: string;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  visited?: boolean;
}

const GraphVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'A', x: 100, y: 100, value: 0 },
    { id: 'B', x: 200, y: 100, value: 1 },
    { id: 'C', x: 300, y: 100, value: 2 },
    { id: 'D', x: 100, y: 200, value: 3 },
    { id: 'E', x: 200, y: 200, value: 4 },
    { id: 'F', x: 300, y: 200, value: 5 }
  ]);
  
  const [edges, setEdges] = useState<Edge[]>([
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 3 },
    { from: 'B', to: 'E', weight: 1 },
    { from: 'C', to: 'F', weight: 2 },
    { from: 'D', to: 'E', weight: 3 },
    { from: 'E', to: 'F', weight: 1 }
  ]);

  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<string[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animation = useAnimation();

  // Draw the graph
  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      
      if (!fromNode || !toNode) return;

      const isHighlighted = highlightedEdges.includes(`${edge.from}-${edge.to}`);
      
      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);
      ctx.strokeStyle = isHighlighted ? '#e53e3e' : '#4a5568';
      ctx.lineWidth = isHighlighted ? 3 : 2;
      ctx.stroke();

      // Draw edge weight
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(midX - 10, midY - 8, 20, 16);
      ctx.fillStyle = '#4a5568';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(edge.weight.toString(), midX, midY + 4);
    });

    // Draw nodes
    nodes.forEach(node => {
      const isHighlighted = highlightedNodes.includes(node.id);
      const isVisited = node.visited;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      
      if (isHighlighted) {
        ctx.fillStyle = '#e53e3e';
      } else if (isVisited) {
        ctx.fillStyle = '#38a169';
      } else {
        ctx.fillStyle = '#4299e1';
      }
      
      ctx.fill();
      ctx.strokeStyle = '#2b6cb0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw node label
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y);

      // Draw distance if available
      if (node.distance !== undefined) {
        ctx.fillStyle = '#4a5568';
        ctx.font = '10px Arial';
        ctx.fillText(node.distance.toString(), node.x, node.y + 30);
      }
    });
  };

  // BFS Algorithm
  const bfs = async (startNode: string) => {
    const steps: AnimationStep[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNode];
    const bfsOrder: string[] = [];

    steps.push({
      description: `Starting BFS from node ${startNode}`,
      data: { nodes: [...nodes], edges: [...edges] },
      highlights: []
    });

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current)) continue;
      
      visited.add(current);
      bfsOrder.push(current);

      steps.push({
        description: `Visiting node ${current}. BFS order so far: ${bfsOrder.join(' → ')}`,
        data: { 
          nodes: nodes.map(n => ({ ...n, visited: visited.has(n.id) })),
          edges: [...edges]
        },
        highlights: [current]
      });

      // Find neighbors
      const neighbors = edges
        .filter(e => e.from === current || e.to === current)
        .map(e => e.from === current ? e.to : e.from)
        .filter(n => !visited.has(n));

      if (neighbors.length > 0) {
        steps.push({
          description: `Adding neighbors of ${current} to queue: ${neighbors.join(', ')}`,
          data: { 
            nodes: nodes.map(n => ({ ...n, visited: visited.has(n.id) })),
            edges: [...edges]
          },
          highlights: [current, ...neighbors]
        });
      }

      queue.push(...neighbors);
    }

    steps.push({
      description: `BFS completed! Final order: ${bfsOrder.join(' → ')}`,
      data: { 
        nodes: nodes.map(n => ({ ...n, visited: true })),
        edges: [...edges]
      },
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setNodes(step.data.nodes);
      setHighlightedNodes(step.highlights || []);
    });
  };

  // DFS Algorithm
  const dfs = async (startNode: string) => {
    const steps: AnimationStep[] = [];
    const visited = new Set<string>();
    const dfsOrder: string[] = [];

    const dfsRecursive = (node: string) => {
      if (visited.has(node)) return;
      
      visited.add(node);
      dfsOrder.push(node);

      steps.push({
        description: `Visiting node ${node}. DFS order so far: ${dfsOrder.join(' → ')}`,
        data: { 
          nodes: nodes.map(n => ({ ...n, visited: visited.has(n.id) })),
          edges: [...edges]
        },
        highlights: [node]
      });

      // Find unvisited neighbors
      const neighbors = edges
        .filter(e => e.from === node || e.to === node)
        .map(e => e.from === node ? e.to : e.from)
        .filter(n => !visited.has(n));

      neighbors.forEach(neighbor => {
        dfsRecursive(neighbor);
      });
    };

    steps.push({
      description: `Starting DFS from node ${startNode}`,
      data: { nodes: [...nodes], edges: [...edges] },
      highlights: []
    });

    dfsRecursive(startNode);

    steps.push({
      description: `DFS completed! Final order: ${dfsOrder.join(' → ')}`,
      data: { 
        nodes: nodes.map(n => ({ ...n, visited: true })),
        edges: [...edges]
      },
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setNodes(step.data.nodes);
      setHighlightedNodes(step.highlights || []);
    });
  };

  // Dijkstra's Algorithm
  const dijkstra = async (startNode: string) => {
    const steps: AnimationStep[] = [];
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set(nodes.map(n => n.id));

    // Initialize distances
    nodes.forEach(node => {
      distances[node.id] = node.id === startNode ? 0 : Infinity;
      previous[node.id] = null;
    });

    steps.push({
      description: `Starting Dijkstra's algorithm from node ${startNode}`,
      data: { 
        nodes: nodes.map(n => ({ ...n, distance: distances[n.id] })),
        edges: [...edges]
      },
      highlights: [startNode]
    });

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      const current = Array.from(unvisited).reduce((min, node) => 
        distances[node] < distances[min] ? node : min
      );

      unvisited.delete(current);

      steps.push({
        description: `Processing node ${current} (distance: ${distances[current]})`,
        data: { 
          nodes: nodes.map(n => ({ 
            ...n, 
            distance: distances[n.id],
            visited: !unvisited.has(n.id)
          })),
          edges: [...edges]
        },
        highlights: [current]
      });

      // Update distances to neighbors
      const neighbors = edges
        .filter(e => e.from === current || e.to === current)
        .map(e => ({ 
          node: e.from === current ? e.to : e.from, 
          weight: e.weight 
        }))
        .filter(n => unvisited.has(n.node));

      neighbors.forEach(({ node, weight }) => {
        const newDistance = distances[current] + weight;
        if (newDistance < distances[node]) {
          distances[node] = newDistance;
          previous[node] = current;
          
          steps.push({
            description: `Updating distance to ${node}: ${newDistance} (via ${current})`,
            data: { 
              nodes: nodes.map(n => ({ 
                ...n, 
                distance: distances[n.id],
                visited: !unvisited.has(n.id)
              })),
              edges: [...edges]
            },
            highlights: [current, node]
          });
        }
      });
    }

    steps.push({
      description: `Dijkstra's algorithm completed! All shortest paths calculated.`,
      data: { 
        nodes: nodes.map(n => ({ 
          ...n, 
          distance: distances[n.id],
          visited: true
        })),
        edges: [...edges]
      },
      highlights: []
    });

    await animation.executeSteps(steps, (step, index) => {
      setNodes(step.data.nodes);
      setHighlightedNodes(step.highlights || []);
    });
  };

  const resetGraph = () => {
    setNodes(nodes.map(n => ({ ...n, visited: false, distance: undefined })));
    setHighlightedNodes([]);
    setHighlightedEdges([]);
    animation.reset();
  };

  useEffect(() => {
    drawGraph();
  }, [nodes, edges, highlightedNodes, highlightedEdges]);

  return (
    <div className="visualizer">
      <div className="controls">
        <h2>Graph Visualizer</h2>
        
        <div className="input-section">
          <h4>Graph Algorithms</h4>
          <div className="button-group">
            <button 
              onClick={() => bfs('A')}
              className="algorithm-btn"
              disabled={animation.isPlaying}
            >
              BFS (A)
            </button>
            <button 
              onClick={() => dfs('A')}
              className="algorithm-btn"
              disabled={animation.isPlaying}
            >
              DFS (A)
            </button>
            <button 
              onClick={() => dijkstra('A')}
              className="algorithm-btn"
              disabled={animation.isPlaying}
            >
              Dijkstra (A)
            </button>
          </div>
        </div>

        <div className="button-group">
          <button 
            onClick={resetGraph}
            className="reset-btn"
            disabled={animation.isPlaying}
          >
            Reset Graph
          </button>
        </div>

        <AnimationControls 
          animation={animation} 
          onSpeedChange={setAnimationSpeed}
          speed={animationSpeed}
        />

        <div className="graph-info">
          <p><strong>Algorithms:</strong></p>
          <p>• BFS: Breadth-First Search</p>
          <p>• DFS: Depth-First Search</p>
          <p>• Dijkstra: Shortest Path</p>
          <p><strong>Colors:</strong> Blue=Unvisited, Green=Visited, Red=Current</p>
        </div>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          className="graph-canvas"
        />
      </div>
    </div>
  );
};

export default GraphVisualizer;
