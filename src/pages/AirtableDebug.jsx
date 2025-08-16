import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  testBasicConnection, 
  testWithMinimalParams, 
  testFindUserProperties, 
  testTableSchema,
  runAllTests 
} from '../utils/testDirectAirtable';

export default function AirtableDebug() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [logs, setLogs] = useState([]);

  // Capture console logs
  const originalLog = console.log;
  const originalError = console.error;

  const captureLog = (type, ...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    setLogs(prev => [...prev, { type, message, timestamp: new Date().toLocaleTimeString() }]);
    
    if (type === 'log') {
      originalLog(...args);
    } else {
      originalError(...args);
    }
  };

  React.useEffect(() => {
    console.log = (...args) => captureLog('log', ...args);
    console.error = (...args) => captureLog('error', ...args);

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const runTest = async (testName, testFunction) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    setLogs([]);
    
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
    } catch (error) {
      setResults(prev => ({ ...prev, [testName]: { success: false, error: error.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResults({});
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Airtable Connection Debug</h1>
        <p className="text-gray-600">
          Test direct Airtable connection to diagnose parameter validation issues
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
              <CardDescription>
                Run individual tests or all tests to diagnose Airtable connectivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => runTest('basic', testBasicConnection)}
                disabled={loading.basic}
                className="w-full"
              >
                {loading.basic ? 'Running...' : 'Test 1: Basic Connection'}
              </Button>
              
              <Button 
                onClick={() => runTest('minimal', testWithMinimalParams)}
                disabled={loading.minimal}
                className="w-full"
              >
                {loading.minimal ? 'Running...' : 'Test 2: Minimal Parameters'}
              </Button>
              
              <Button 
                onClick={() => runTest('userProps', testFindUserProperties)}
                disabled={loading.userProps}
                className="w-full"
              >
                {loading.userProps ? 'Running...' : 'Test 3: Find User Properties'}
              </Button>
              
              <Button 
                onClick={() => runTest('schema', testTableSchema)}
                disabled={loading.schema}
                className="w-full"
              >
                {loading.schema ? 'Running...' : 'Test 4: Table Schema'}
              </Button>
              
              <div className="border-t pt-3">
                <Button 
                  onClick={() => runTest('all', runAllTests)}
                  disabled={Object.values(loading).some(Boolean)}
                  className="w-full"
                  variant="outline"
                >
                  {Object.values(loading).some(Boolean) ? 'Running...' : 'Run All Tests'}
                </Button>
              </div>
              
              <Button 
                onClick={clearLogs}
                variant="secondary"
                className="w-full"
              >
                Clear Results
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(results).length === 0 ? (
                <p className="text-gray-500">No tests run yet</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(results).map(([testName, result]) => (
                    <div key={testName} className="flex items-center justify-between">
                      <span className="font-medium">{testName}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "SUCCESS" : "FAILED"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Console Logs */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Console Output</CardTitle>
              <CardDescription>
                Real-time logs from Airtable tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet. Run a test to see output.</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      <span className="text-gray-400">[{log.timestamp}]</span>
                      <span className={log.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                        {' '}{log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Environment Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Airtable API Key:</strong>{' '}
              {import.meta.env.VITE_AIRTABLE_API_KEY 
                ? `${import.meta.env.VITE_AIRTABLE_API_KEY.substring(0, 10)}...` 
                : 'NOT SET'
              }
            </div>
            <div>
              <strong>Base ID:</strong> {import.meta.env.VITE_AIRTABLE_BASE_ID || 'NOT SET'}
            </div>
            <div>
              <strong>Properties Table:</strong> {import.meta.env.VITE_AIRTABLE_PROPERTIES_TABLE || 'Properties'}
            </div>
            <div>
              <strong>Demo Mode:</strong>{' '}
              {!import.meta.env.VITE_AIRTABLE_API_KEY || 
               import.meta.env.VITE_AIRTABLE_API_KEY === 'your_airtable_api_key_here'
                ? 'YES' : 'NO'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}