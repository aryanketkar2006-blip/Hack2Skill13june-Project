import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import OverviewTab from '../components/Document/OverviewTab';
import ExplainTab from '../components/Document/ExplainTab';
import MindMapTab from '../components/Document/MindMapTab';
import ChatTab from '../components/Document/ChatTab';
import QuizTab from '../components/Document/QuizTab';
import VisualInsightsTab from '../components/Document/VisualInsightsTab';
import SmartSummary from '../components/Document/SmartSummary';
import ActionableOutputs from '../components/Document/ActionableOutputs';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'explain', label: "Explain Like I'm..." },
  { id: 'mindmap', label: 'Mind Map' },
  { id: 'chat', label: 'AI Tutor' },
  { id: 'quiz', label: 'Quiz Mode' },
  { id: 'visual', label: 'Visual Insights' },
];

export default function DocumentPage() {
  const { id } = useParams();
  const { loadDocument, activeDocument } = useApp();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadDocument(id);
      setLoading(false);
    })();
  }, [id, loadDocument]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-96 mb-4" />
        <div className="skeleton h-6 w-64 mb-8" />
        <div className="flex gap-4 mb-6">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-8 w-24" />)}
        </div>
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!activeDocument) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-gray-600">Document not found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary font-medium">← Back to Dashboard</button>
      </div>
    );
  }

  const doc = activeDocument;
  const overview = doc.overview_json;

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 p-6 min-w-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 bg-primary-100 text-primary text-[10px] uppercase tracking-wider font-bold rounded-md">
              Analysis Complete
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Just now
            </span>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight max-w-lg">
              {overview?.title || doc.original_name}
            </h1>
            <div className="flex gap-2 shrink-0">
              <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                Share Insight
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && <OverviewTab document={doc} />}
          {activeTab === 'explain' && <ExplainTab document={doc} />}
          {activeTab === 'mindmap' && <MindMapTab document={doc} />}
          {activeTab === 'chat' && <ChatTab document={doc} />}
          {activeTab === 'quiz' && <QuizTab document={doc} />}
          {activeTab === 'visual' && <VisualInsightsTab document={doc} />}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-72 border-l border-gray-200 p-5 space-y-6 shrink-0 bg-white/50">
        <SmartSummary document={doc} />
        <ActionableOutputs document={doc} />
        <button
          onClick={() => navigate('/compare', { state: { docId: doc.id } })}
          className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-primary hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Compare with another document
        </button>
      </div>
    </div>
  );
}
