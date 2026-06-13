import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import * as api from '../services/api';

export default function ComparePage() {
  const { documents, fetchDocuments } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [doc1Id, setDoc1Id] = useState(location.state?.docId || '');
  const [doc2Id, setDoc2Id] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.compareDocuments(doc1Id, doc2Id);
      setComparison(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!question.trim() || !doc1Id || !doc2Id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.compareDocuments(doc1Id, doc2Id, question.trim());
      setComparison(res.data);
      setQuestion('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const doc1 = documents.find(d => d.id === doc1Id);
  const doc2 = documents.find(d => d.id === doc2Id);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cross-Document Comparison</h1>
          <p className="text-sm text-gray-500 mt-1">Select two documents to compare side-by-side with AI analysis</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
      </div>

      {/* Document Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document A</label>
          <select
            value={doc1Id}
            onChange={e => setDoc1Id(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">Select document...</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>{d.original_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Document B</label>
          <select
            value={doc2Id}
            onChange={e => setDoc2Id(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="">Select document...</option>
            {documents.filter(d => d.id !== doc1Id).map(d => (
              <option key={d.id} value={d.id}>{d.original_name}</option>
            ))}
          </select>
        </div>
      </div>

      {doc1Id && doc2Id && !comparison && (
        <div className="text-center mb-6">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Comparing...' : 'Compare Documents'}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">{error}</div>
      )}

      {loading && !comparison && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Comparing documents...</p>
          </div>
        </div>
      )}

      {/* Document Panels */}
      {comparison && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">DOC A</span>
                <span className="text-sm font-medium text-gray-900 truncate">{comparison.doc1?.name}</span>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">DOC B</span>
                <span className="text-sm font-medium text-gray-900 truncate">{comparison.doc2?.name}</span>
              </div>
            </div>
          </div>

          {/* Comparison Analysis */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <h3 className="font-bold text-gray-900">AI Comparison Analysis</h3>
            </div>
            <div className="markdown-content text-sm">
              <ReactMarkdown>{comparison.comparison}</ReactMarkdown>
            </div>
          </div>

          {/* Follow-up question */}
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFollowUp()}
              placeholder="Ask comparison questions (e.g., 'Compare the termination clauses')"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              onClick={handleFollowUp}
              disabled={!question.trim() || loading}
              className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
