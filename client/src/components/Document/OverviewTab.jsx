import { useState, useEffect } from 'react';
import * as api from '../../services/api';

export default function OverviewTab({ document }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document?.overview_json) {
      setOverview(document.overview_json);
    }
  }, [document]);

  const difficultyColor = {
    'Beginner': 'text-green-600 bg-green-100',
    'Intermediate': 'text-yellow-600 bg-yellow-100',
    'Advanced': 'text-red-600 bg-red-100'
  };

  const sentimentIcon = {
    'Positive': '📈',
    'Negative': '📉',
    'Neutral': '➡️',
    'Mixed': '🔄'
  };

  if (!overview) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Reading Time</p>
          <p className="text-2xl font-bold text-gray-900">{overview.estimated_reading_time_minutes || '~5'} <span className="text-sm font-normal text-gray-500">min</span></p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Complexity</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              <div className={`w-6 h-1.5 rounded-full ${overview.difficulty_level !== 'Beginner' ? 'bg-primary' : 'bg-primary'}`} />
              <div className={`w-6 h-1.5 rounded-full ${overview.difficulty_level === 'Advanced' || overview.difficulty_level === 'Intermediate' ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`w-6 h-1.5 rounded-full ${overview.difficulty_level === 'Advanced' ? 'bg-primary' : 'bg-gray-200'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">{overview.difficulty_level}</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Key Entities</p>
          <p className="text-2xl font-bold text-gray-900">{overview.key_entities_count || overview.key_concepts?.length || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Sentiment</p>
          <p className="text-lg font-semibold text-primary flex items-center gap-2">
            {sentimentIcon[overview.sentiment] || '➡️'} {overview.sentiment || 'Neutral'}
          </p>
        </div>
      </div>

      {/* Core Concepts */}
      <h3 className="text-lg font-bold text-gray-900 mb-4">Core Concepts Extracted</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(overview.concept_details || overview.key_concepts?.map(c => ({ name: c, description: '', priority: 'Important' })) || []).map((concept, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 card-hover animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{concept.name}</h4>
              {concept.priority && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  concept.priority === 'High Priority' ? 'bg-orange-100 text-orange-700' :
                  concept.priority === 'Technical' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {concept.priority}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{concept.description}</p>
            {concept.description && (
              <button className="text-sm text-primary font-medium mt-3 hover:text-primary-dark flex items-center gap-1">
                Deep Dive <span>→</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
