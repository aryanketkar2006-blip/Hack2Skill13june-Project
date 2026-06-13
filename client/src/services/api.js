import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // 2 min for Gemini calls
});

// Documents
export const uploadFile = (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  });
};

export const ingestURL = (url) => api.post('/documents/url', { url });
export const ingestGitHub = (repo_path) => api.post('/documents/github', { repo_path });
export const getDocuments = () => api.get('/documents');
export const getDocument = (id) => api.get(`/documents/${id}`);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// Analysis
export const generateOverview = (docId) => api.post(`/analysis/overview/${docId}`);
export const generateExplanation = (docId, level) => api.post(`/analysis/explain/${docId}`, { level });
export const generateMindMap = (docId) => api.post(`/analysis/mindmap/${docId}`);
export const generateSummary = (docId, level) => api.post(`/analysis/summary/${docId}`, { level });
export const generateQuiz = (docId) => api.post(`/analysis/quiz/${docId}`);
export const generateActionable = (docId) => api.post(`/analysis/actionable/${docId}`);
export const generateVisualInsight = (docId) => api.post(`/analysis/visual/${docId}`);
export const compareDocuments = (doc_id_1, doc_id_2, question) => 
  api.post('/analysis/compare', { doc_id_1, doc_id_2, question });

// Chat
export const sendChatMessage = (docId, message) => api.post(`/chat/${docId}`, { message });
export const getChatHistory = (docId) => api.get(`/chat/${docId}`);
export const clearChat = (docId) => api.delete(`/chat/${docId}`);

export default api;
