import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import UploadModal from '../components/Upload/UploadModal';

const typeConfig = {
  research_paper: { icon: '📄', color: 'bg-red-50 text-red-600', badge: 'bg-red-100 text-red-700', label: 'Research Paper' },
  code_repository: { icon: '💻', color: 'bg-blue-50 text-blue-600', badge: 'bg-blue-100 text-blue-700', label: 'Code Repository' },
  medical_report: { icon: '🏥', color: 'bg-green-50 text-green-600', badge: 'bg-green-100 text-green-700', label: 'Medical Report' },
  business_report: { icon: '📊', color: 'bg-purple-50 text-purple-600', badge: 'bg-purple-100 text-purple-700', label: 'Business Report' },
  legal_document: { icon: '⚖️', color: 'bg-amber-50 text-amber-600', badge: 'bg-amber-100 text-amber-700', label: 'Legal Document' },
  educational_material: { icon: '📚', color: 'bg-teal-50 text-teal-600', badge: 'bg-teal-100 text-teal-700', label: 'Educational' },
  general_document: { icon: '📋', color: 'bg-gray-50 text-gray-600', badge: 'bg-gray-100 text-gray-700', label: 'Document' },
  image: { icon: '🖼️', color: 'bg-pink-50 text-pink-600', badge: 'bg-pink-100 text-pink-700', label: 'Image' },
};

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Today, ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DashboardPage() {
  const { documents, fetchDocuments } = useApp();
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filtered = documents.filter(d => 
    d.original_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadSuccess = (doc) => {
    fetchDocuments();
    navigate(`/document/${doc.id}`);
  };

  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative flex-1 max-w-xl">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search across documents, code, and insights..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="ml-4 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Analysis
        </button>
      </div>

      {/* Recent Uploads Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recent Uploads</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents yet</h3>
          <p className="text-sm text-gray-500 mb-6">Upload a file, paste a URL, or connect a GitHub repo to get started.</p>
          <button onClick={() => setShowUpload(true)} className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors">
            + New Analysis
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, i) => {
            const cfg = typeConfig[doc.content_type] || typeConfig.general_document;
            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="card-hover bg-white border border-gray-200 rounded-xl p-5 cursor-pointer animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${cfg.color} flex items-center justify-center text-lg`}>
                    {cfg.icon}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-snug">
                  {doc.overview_json?.title || doc.original_name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {formatDate(doc.created_at)}
                  {doc.file_size && (
                    <>
                      <span>·</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filtered.map((doc, i) => {
            const cfg = typeConfig[doc.content_type] || typeConfig.general_document;
            return (
              <div
                key={doc.id}
                onClick={() => navigate(`/document/${doc.id}`)}
                className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${cfg.color} flex items-center justify-center text-lg shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{doc.overview_json?.title || doc.original_name}</h3>
                  <p className="text-xs text-gray-500">{formatDate(doc.created_at)} · {formatFileSize(doc.file_size)}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <UploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} onSuccess={handleUploadSuccess} />
    </div>
  );
}
