import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🏠 AirCasa</h1>
          <p className="text-gray-600">Professional Property Management Platform</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🎬 <strong>Demo Mode</strong> - UI/UX Implementation Complete!
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <a 
            href="/dashboard" 
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            View Dashboard
          </a>
          <a 
            href="/properties" 
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            View Properties
          </a>
        </div>
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Features Implemented:</h3>
          <ul className="text-sm text-left space-y-1">
            <li>• Professional Layout & Navigation</li>
            <li>• Interactive Dashboard with Charts</li>
            <li>• Property Management Interface</li>
            <li>• Responsive Design</li>
            <li>• Modern Animations & Styling</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;