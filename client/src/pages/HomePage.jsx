import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center pt-20 pb-16 px-6">
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6 animate-fade-in">
          Understand Anything with AI
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{animationDelay: '0.1s'}}>
          Upload your documents, paste a URL, or connect a repository. Our adaptive AI tutor breaks down complex topics, answers questions, and helps you learn faster.
        </p>
      </section>

      {/* Input Cards */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-20 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <Link to="/dashboard" className="card-hover border border-gray-200 rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload File</h3>
            <p className="text-sm text-gray-500">PDFs, Docs, Spreadsheets</p>
          </Link>

          <Link to="/dashboard" className="card-hover border border-gray-200 rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Paste URL</h3>
            <p className="text-sm text-gray-500">Articles, Blogs, Documentation</p>
          </Link>

          <Link to="/dashboard" className="card-hover border border-gray-200 rounded-xl p-6 bg-white">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">GitHub Repository</h3>
            <p className="text-sm text-gray-500">Codebases, Markdown</p>
          </Link>
        </div>

        {/* How It Works */}
        <div className="text-center animate-slide-up" style={{animationDelay: '0.3s'}}>
          <h2 className="text-2xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-4 gap-6">
            {[
              { num: 1, title: 'Upload', desc: 'Provide your source material.', active: true },
              { num: 2, title: 'Understand', desc: 'AI analyzes the content.' },
              { num: 3, title: 'Learn', desc: 'Get tailored explanations.' },
              { num: 4, title: 'Quiz', desc: 'Test your knowledge.' },
            ].map(step => (
              <div key={step.num} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold mb-4 ${
                  step.active 
                    ? 'bg-primary-50 text-primary border-2 border-primary' 
                    : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                }`}>
                  {step.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <p className="text-sm text-gray-500">© 2024 Insight AI</p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
