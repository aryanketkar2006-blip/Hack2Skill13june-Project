import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const typeConfig = {
  research_paper: { icon: '📄', badge: 'bg-red-100 text-red-700', label: 'Research Paper' },
  code_repository: { icon: '💻', badge: 'bg-blue-100 text-blue-700', label: 'Code Repository' },
  medical_report: { icon: '🏥', badge: 'bg-green-100 text-green-700', label: 'Medical Report' },
  business_report: { icon: '📊', badge: 'bg-purple-100 text-purple-700', label: 'Business Report' },
  legal_document: { icon: '⚖️', badge: 'bg-amber-100 text-amber-700', label: 'Legal Document' },
  general_document: { icon: '📋', badge: 'bg-gray-100 text-gray-700', label: 'Document' },
  image: { icon: '🖼️', badge: 'bg-pink-100 text-pink-700', label: 'Image' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

export default function HistoryPage() {
  const { documents, fetchDocuments, removeDocument } = useApp();
  const navigate = useNavigate();

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Document History</h1>

      {documents.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No documents in history</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Document</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Size</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => {
                const cfg = typeConfig[doc.content_type] || typeConfig.general_document;
                return (
                  <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/document/${doc.id}`)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{cfg.icon}</span>
                        <span className="font-medium text-gray-900 text-sm">{doc.overview_json?.title || doc.original_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatSize(doc.file_size)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatDate(doc.created_at)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); removeDocument(doc.id); }}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
