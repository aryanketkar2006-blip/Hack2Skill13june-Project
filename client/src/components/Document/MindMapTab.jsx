import { useState, useCallback, useEffect } from 'react';
import * as api from '../../services/api';

// Simple tree-based mind map without heavy dependencies
function MindMapNode({ node, depth = 0, isLast = false }) {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const hasChildren = node.children && node.children.length > 0;

  const colors = [
    'bg-gradient-to-r from-primary to-primary-dark text-white',
    'bg-primary-50 text-primary-dark border border-primary/20',
    'bg-white text-gray-800 border border-gray-200',
    'bg-gray-50 text-gray-600 border border-gray-200',
  ];

  return (
    <div className="flex items-start">
      {depth > 0 && (
        <div className="flex items-center mr-2 shrink-0 mt-3">
          <div className="w-6 h-px bg-gray-300" />
        </div>
      )}
      <div className="flex flex-col">
        <button
          onClick={() => hasChildren && setCollapsed(!collapsed)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium mb-2 transition-all hover:shadow-md ${colors[Math.min(depth, colors.length - 1)]} ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
        >
          {hasChildren && (
            <svg className={`w-3.5 h-3.5 transition-transform ${collapsed ? '' : 'rotate-90'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {node.label || node.topic}
        </button>
        {hasChildren && !collapsed && (
          <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-1">
            {node.children.map((child, i) => (
              <MindMapNode key={i} node={child} depth={depth + 1} isLast={i === node.children.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MindMapTab({ document }) {
  const [mindmap, setMindmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateMindMap(document.id);
      setMindmap(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [document.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Generating mind map...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={generate} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Retry</button>
      </div>
    );
  }

  if (!mindmap) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Mind Map Generator</h3>
        <p className="text-sm text-gray-500 mb-6">Visualize key concepts and their relationships</p>
        <button onClick={generate} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          Generate Mind Map
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-white border border-gray-200 rounded-xl p-6 overflow-auto">
      <MindMapNode node={mindmap} />
    </div>
  );
}
