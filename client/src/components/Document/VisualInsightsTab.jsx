import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import * as api from '../../services/api';

export default function VisualInsightsTab({ document }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.generateVisualInsight(document.id);
      setInsight(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [document.id]);

  if (document.file_type !== 'image') {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Visual Insights</h3>
        <p className="text-sm text-gray-500">This feature works with image uploads (charts, diagrams, etc.)</p>
        <p className="text-sm text-gray-400 mt-2">Upload an image document to use visual analysis</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Analyzing visual content...</p>
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

  if (!insight) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Visual Insights</h3>
        <p className="text-sm text-gray-500 mb-6">Get AI analysis of charts, diagrams, and visuals</p>
        <button onClick={generate} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
          Analyze Visual
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {insight.classification && (
        <div className="bg-primary-50 border border-primary/20 rounded-xl p-4">
          <span className="text-xs uppercase tracking-wider text-primary font-semibold">Detected Type</span>
          <p className="text-sm text-gray-700 mt-1">{insight.classification.type}: {insight.classification.description}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Analysis</h3>
        <div className="markdown-content text-sm">
          <ReactMarkdown>{insight.analysis}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
