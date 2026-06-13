import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as api from '../../services/api';

const levels = [
  { id: 'beginner', label: '🎈 Beginner', desc: 'Simple, everyday language' },
  { id: 'student', label: '🎓 Student', desc: 'Academic context' },
  { id: 'professional', label: '💼 Professional', desc: 'Business-focused' },
  { id: 'developer', label: '💻 Developer', desc: 'Full technical depth' },
];

export default function ExplainTab({ document }) {
  const [activeLevel, setActiveLevel] = useState('beginner');
  const [explanations, setExplanations] = useState({});
  const [loading, setLoading] = useState({});

  const handleLevelClick = async (level) => {
    setActiveLevel(level);
    if (explanations[level]) return; // already cached

    setLoading(prev => ({ ...prev, [level]: true }));
    try {
      const res = await api.generateExplanation(document.id, level);
      setExplanations(prev => ({ ...prev, [level]: res.data.content }));
    } catch (err) {
      setExplanations(prev => ({ ...prev, [level]: `Error: ${err.response?.data?.error || err.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [level]: false }));
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Level Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {levels.map(level => (
          <button
            key={level.id}
            onClick={() => handleLevelClick(level.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              activeLevel === level.id
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {loading[activeLevel] ? (
          <div className="space-y-3">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
            <div className="skeleton h-4 w-full" />
          </div>
        ) : explanations[activeLevel] ? (
          <div className="markdown-content prose prose-sm max-w-none">
            <ReactMarkdown>{explanations[activeLevel]}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-14 h-14 mx-auto bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-2">Click a level to generate explanation</p>
            <p className="text-sm text-gray-500">Each level adapts the explanation for a different audience</p>
          </div>
        )}
      </div>
    </div>
  );
}
