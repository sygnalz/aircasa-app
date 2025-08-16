import React, { useState } from 'react';
import AirtableSetup from '../components/admin/AirtableSetup';
import AirtableConnectionTester from '../components/admin/AirtableConnectionTester';
import { Button } from '../components/ui/button';

export default function AirtableSetupPage() {
  const [currentView, setCurrentView] = useState('setup');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Airtable Integration</h1>
            <div className="flex gap-2">
              <Button
                variant={currentView === 'setup' ? 'default' : 'outline'}
                onClick={() => setCurrentView('setup')}
                size="sm"
              >
                🔧 Setup Wizard
              </Button>
              <Button
                variant={currentView === 'test' ? 'default' : 'outline'}
                onClick={() => setCurrentView('test')}
                size="sm"
              >
                🧪 Test Connection
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {currentView === 'setup' ? <AirtableSetup /> : <AirtableConnectionTester />}
      </div>
    </div>
  );
}