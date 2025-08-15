import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard-simple';
import Properties from '@/pages/Properties';
import AirtableSetupPage from '@/pages/AirtableSetupPage';

// Demo user for the working version
const demoUser = {
  id: 'demo-user-123',
  email: 'demo@aircasa.com',
  user_metadata: {
    full_name: 'Demo User',
    avatar_url: null
  }
};

function WelcomePage({ onEnterDemo }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 text-white mx-auto mb-6">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 3v18m7-18v18M9 7h6m-6 4h6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">AirCasa</h1>
          <p className="text-gray-600 mb-6">Professional Property Management Platform</p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">✅ Migration & UI/UX Complete!</h3>
            <p className="text-sm text-green-700">
              Professional interface with modern design system implemented
            </p>
          </div>
        </div>

        <button 
          onClick={onEnterDemo}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 mb-6"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Enter Demo Platform
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-800 mb-2">🔗 Ready for Your Airtable Data!</h3>
          <p className="text-sm text-blue-700 mb-3">
            Connect your existing 5-table Airtable base to see your real data
          </p>
          <button 
            onClick={() => window.open('/airtable-setup', '_blank')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            🔧 Connect My Airtable Base
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-gray-800">🚀 Features Implemented:</h3>
          <div className="grid grid-cols-1 gap-2 text-sm text-left">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Professional Layout & Navigation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Interactive Dashboard with Charts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Property Management Interface</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Responsive Design & Animations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Modern UI Components</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <span>Base44 → Supabase Migration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <WelcomePage onEnterDemo={() => setIsAuthenticated(true)} />;
  }

  return (
    <AppLayout user={demoUser}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/airtable-setup" element={<AirtableSetupPage />} />
      </Routes>
    </AppLayout>
  );
}

export default App;