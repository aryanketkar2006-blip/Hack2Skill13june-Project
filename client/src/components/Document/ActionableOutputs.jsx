import { useState, useCallback } from 'react';
import * as api from '../../services/api';

export default function ActionableOutputs({ document }) {
  const [outputs, setOutputs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.generateActionable(document.id);
      setOutputs(res.data);
      // Auto-expand first section
      const keys = Object.keys(res.data.outputs || {});
      if (keys.length > 0) setExpandedSections(new Set([keys[0]]));
    } catch (err) {
      console.error('Actionable outputs error:', err);
    } finally {
      setLoading(false);
    }
  }, [document.id]);

  const toggleSection = (key) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const formatKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-1.5 mt-2">
          {value.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
              {typeof item === 'object' ? (
                <div>
                  {Object.entries(item).map(([k, v]) => (
                    <span key={k}><strong className="text-gray-800">{formatKey(k)}:</strong> {String(v)} </span>
                  ))}
                </div>
              ) : String(item)}
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-sm text-gray-700 mt-2">{String(value)}</p>;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Actionable Outputs</h3>

      {!outputs && !loading && (
        <div className="space-y-2">
          <button
            onClick={generate}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>📋</span> Create Flashcards
            <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            onClick={generate}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>🧠</span> Generate Quiz
            <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button
            onClick={generate}
            className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>📧</span> Draft Summary Email
            <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-12 w-full" />
          <div className="skeleton h-12 w-full" />
        </div>
      )}

      {outputs && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-2">
            Content type: <span className="font-medium text-gray-700">{formatKey(outputs.content_type)}</span>
          </div>
          {Object.entries(outputs.outputs || {}).map(([key, value]) => (
            <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {formatKey(key)}
                <svg className={`w-4 h-4 transition-transform ${expandedSections.has(key) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedSections.has(key) && (
                <div className="px-3 pb-3 border-t border-gray-100 animate-fade-in">
                  {renderValue(value)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
