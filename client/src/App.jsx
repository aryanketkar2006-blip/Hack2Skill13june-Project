import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Layout/Navbar';
import DashboardLayout from './components/Layout/DashboardLayout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DocumentPage from './pages/DocumentPage';
import ComparePage from './pages/ComparePage';
import HistoryPage from './pages/HistoryPage';
import UploadPage from './pages/UploadPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/document/:id" element={<DocumentPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/settings" element={
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">API Configuration</h3>
                  <p className="text-sm text-gray-500">Gemini API is configured via server environment variables.</p>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm font-mono text-gray-600">
                    GEMINI_API_KEY=****<br/>
                    GEMINI_MODEL_FLASH=gemini-1.5-flash<br/>
                    GEMINI_MODEL_PRO=gemini-1.5-pro
                  </div>
                </div>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
