import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/document') ||
                      location.pathname.startsWith('/compare') ||
                      location.pathname.startsWith('/history');

  if (isDashboard) return null;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-900">Insight AI</span>
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" className={`text-sm font-medium ${location.pathname === '/' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600 hover:text-gray-900'}`}>
            Home
          </Link>
          <Link to="/dashboard" className={`text-sm font-medium ${location.pathname === '/dashboard' ? 'text-primary border-b-2 border-primary pb-0.5' : 'text-gray-600 hover:text-gray-900'}`}>
            Dashboard
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            About
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-44" />
          </div>
          <button className="bg-primary text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </nav>
  );
}
