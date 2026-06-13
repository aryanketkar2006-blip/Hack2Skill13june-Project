import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [activeDocument, setActiveDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.getDocuments();
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, []);

  const loadDocument = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await api.getDocument(id);
      setActiveDocument(res.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeDocument = useCallback(async (id) => {
    try {
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocument?.id === id) setActiveDocument(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, [activeDocument]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AppContext.Provider value={{
      documents, setDocuments, fetchDocuments,
      activeDocument, setActiveDocument, loadDocument,
      removeDocument,
      loading, setLoading,
      error, setError, clearError,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
