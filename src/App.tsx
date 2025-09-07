import React, { useState } from 'react';
import './App.css';

// Import data structure components
import TreeVisualizer from './components/TreeVisualizer';
import LinkedListVisualizer from './components/LinkedListVisualizer';
import ArrayVisualizer from './components/ArrayVisualizer';
import StackVisualizer from './components/StackVisualizer';
import QueueVisualizer from './components/QueueVisualizer';
import GraphVisualizer from './components/GraphVisualizer';

type DataStructure = 'tree' | 'linkedlist' | 'array' | 'stack' | 'queue' | 'graph';

export default function App() {
  const [activeStructure, setActiveStructure] = useState<DataStructure>('tree');

  const dataStructures = [
    { id: 'tree' as DataStructure, name: 'Binary Tree', icon: '🌳' },
    { id: 'linkedlist' as DataStructure, name: 'Linked List', icon: '🔗' },
    { id: 'array' as DataStructure, name: 'Array', icon: '📊' },
    { id: 'stack' as DataStructure, name: 'Stack', icon: '📚' },
    { id: 'queue' as DataStructure, name: 'Queue', icon: '🚶' },
    { id: 'graph' as DataStructure, name: 'Graph', icon: '🕸️' },
  ];

  const renderVisualizer = () => {
    switch (activeStructure) {
      case 'tree':
        return <TreeVisualizer />;
      case 'linkedlist':
        return <LinkedListVisualizer />;
      case 'array':
        return <ArrayVisualizer />;
      case 'stack':
        return <StackVisualizer />;
      case 'queue':
        return <QueueVisualizer />;
      case 'graph':
        return <GraphVisualizer />;
      default:
        return <TreeVisualizer />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">🎯</span>
          DSA Visualizer
        </h1>
        <p className="app-subtitle">Interactive Data Structure & Algorithm Visualization</p>
      </header>

      <nav className="nav-tabs">
        {dataStructures.map((ds) => (
          <button
            key={ds.id}
            className={`nav-tab ${activeStructure === ds.id ? 'active' : ''}`}
            onClick={() => setActiveStructure(ds.id)}
          >
            <span className="tab-icon">{ds.icon}</span>
            <span className="tab-name">{ds.name}</span>
          </button>
        ))}
      </nav>

      <main className="visualizer-container">
        {renderVisualizer()}
      </main>
    </div>
  );
}
