import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, CheckCircle, Loader2, Database, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { AirtableService } from '../../lib/airtableClient';

export default function AirtableConnectionTester() {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = useCallback(async () => {
    setIsTestingConnection(true);
    setError(null);
    setTestResults(null);

    try {
      console.log('🧪 Testing Airtable connection...');
      
      const results = {
        timestamp: new Date().toISOString(),
        tables: {},
        summary: {
          totalTables: 0,
          successfulConnections: 0,
          failedConnections: 0,
          totalRecords: 0
        }
      };

      // Test each configured table
      const tablesToTest = [
        { name: 'Properties', service: new AirtableService(import.meta.env.VITE_AIRTABLE_PROPERTIES_TABLE || 'Properties') },
        { name: 'Users', service: new AirtableService(import.meta.env.VITE_AIRTABLE_USERS_TABLE || 'Users') },
        { name: 'Bookings', service: new AirtableService(import.meta.env.VITE_AIRTABLE_BOOKINGS_TABLE || 'Bookings') },
        { name: 'Analytics', service: new AirtableService(import.meta.env.VITE_AIRTABLE_ANALYTICS_TABLE || 'Analytics') }
      ];

      for (const { name, service } of tablesToTest) {
        try {
          console.log(`Testing ${name} table...`);
          
          const records = await service.getAll({ maxRecords: 3 });
          
          results.tables[name] = {
            status: 'success',
            recordCount: records.length,
            sampleRecord: records[0] || null,
            fields: records[0] ? Object.keys(records[0]) : []
          };
          
          results.summary.successfulConnections++;
          results.summary.totalRecords += records.length;
          
        } catch (tableError) {
          console.error(`Failed to test ${name}:`, tableError);
          
          results.tables[name] = {
            status: 'error',
            error: tableError.message,
            recordCount: 0
          };
          
          results.summary.failedConnections++;
        }
      }

      results.summary.totalTables = tablesToTest.length;
      
      setTestResults(results);
      console.log('✅ Connection test complete:', results);
      
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setError(error.message);
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Airtable Connection Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Test Button */}
        <div className="text-center">
          <Button 
            onClick={testConnection} 
            disabled={isTestingConnection}
            size="lg"
            className="min-w-[200px]"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Airtable Connection
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Connection test failed: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testResults && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Results</h3>
              <p className="text-sm text-gray-600">
                Tested on {new Date(testResults.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.summary.totalTables}</div>
                <div className="text-sm text-blue-800">Tables Tested</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.successfulConnections}</div>
                <div className="text-sm text-green-800">Successful</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{testResults.summary.failedConnections}</div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{testResults.summary.totalRecords}</div>
                <div className="text-sm text-purple-800">Records Found</div>
              </div>
            </div>

            {/* Individual Table Results */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Table Connection Details</h4>
              {Object.entries(testResults.tables).map(([tableName, result]) => (
                <div key={tableName} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <h5 className="font-medium text-gray-900">{tableName}</h5>
                        {result.status === 'success' ? (
                          <p className="text-sm text-gray-600">
                            {result.recordCount} records found • {result.fields.length} fields detected
                          </p>
                        ) : (
                          <p className="text-sm text-red-600">
                            {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {result.status === 'success' && result.fields.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Available fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.fields.slice(0, 8).map(field => (
                          <span key={field} className="px-2 py-1 bg-white bg-opacity-50 text-xs rounded border">
                            {field}
                          </span>
                        ))}
                        {result.fields.length > 8 && (
                          <span className="px-2 py-1 bg-white bg-opacity-50 text-xs rounded border text-gray-500">
                            +{result.fields.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Success Message */}
            {testResults.summary.successfulConnections === testResults.summary.totalTables && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  🎉 All tables connected successfully! Your AirCasa app is now using your real Airtable data.
                </AlertDescription>
              </Alert>
            )}

            {/* Partial Success Message */}
            {testResults.summary.failedConnections > 0 && testResults.summary.successfulConnections > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some tables connected successfully, but {testResults.summary.failedConnections} table(s) failed. 
                  Check your table names in the .env file and ensure they match exactly with your Airtable base.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Instructions</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Make sure you've updated your .env file with your Airtable credentials</li>
            <li>Restart your development server after updating environment variables</li>
            <li>Click "Test Airtable Connection" to verify everything is working</li>
            <li>If tests fail, check your API key, Base ID, and table names</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}