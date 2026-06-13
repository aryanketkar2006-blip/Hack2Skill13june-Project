import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as api from '../../services/api';

export default function SmartSummary({ document }) {
  const [activeLevel, setActiveLevel] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState(false);

  const handleLevel = async (level) => {
    setActiveLevel(level);
    if (summaries[level]) return;

    setLoading(prev => ({ ...prev, [level]: true }));
    try {
      const res = await api.generateSummary(document.id, level);
      setSummaries(prev => ({ ...prev, [level]: res.data.content }));
    } catch (err) {
      setSummaries(prev => ({ ...prev, [level]: `Error: ${err.response?.data?.error || err.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [level]: false }));
    }
  };

  const handleCopy = () => {
    if (summaries[activeLevel]) {
      navigator.clipboard.writeText(summaries[activeLevel]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">✨</span>
        <h3 className="font-bold text-gray-900">Smart Summary</h3>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5 mb-4">
        {['30s', '3m', '10m'].map(level => (
          <button
            key={level}
            onClick={() => handleLevel(level)}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeLevel === level ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {loading[activeLevel] ? (
        <div className="space-y-2">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      ) : summaries[activeLevel] ? (
        <div>
          <div className="text-3xl text-gray-200 mb-2">"</div>
          <div className="markdown-content text-sm text-gray-700 leading-relaxed -mt-4">
            <ReactMarkdown>{summaries[activeLevel]}</ReactMarkdown>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 mt-3 text-xs text-gray-500 hover:text-gray-700"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">Select a summary length</p>
      )}
    </div>
  );
}
