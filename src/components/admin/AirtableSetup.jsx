import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertCircle, CheckCircle, Loader2, Database, Settings, Download, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { AirtableAnalyzer } from '../../lib/airtableAnalyzer';
import { ClientEnvUpdater } from '../../utils/clientEnvUpdater';

export default function AirtableSetup() {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    baseId: '',
    tableNames: []
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [tableNamesInput, setTableNamesInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  const [generatedConfig, setGeneratedConfig] = useState('');

  // Step 1: Credentials Input
  const handleCredentialsSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!credentials.apiKey || !credentials.baseId) {
      setError('Please provide both API Key and Base ID');
      return;
    }

    // Basic validation
    if (!credentials.baseId.startsWith('app')) {
      setError('Base ID should start with "app" (e.g., appXXXXXXXXXXXXXX)');
      return;
    }

    setStep(2);
  }, [credentials]);

  // Step 2: Table Names Input
  const handleTableNamesSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    
    const tableNames = tableNamesInput
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (tableNames.length === 0) {
      setError('Please provide at least one table name');
      return;
    }

    if (tableNames.length !== 5) {
      setError('You mentioned having 5 tables. Please provide exactly 5 table names.');
      return;
    }

    setCredentials(prev => ({ ...prev, tableNames }));
    setStep(3);
  }, [tableNamesInput]);

  // Step 3: Analyze Base Structure
  const analyzeBase = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('🔍 Starting analysis of your Airtable base...');
      
      const analyzer = new AirtableAnalyzer(credentials.apiKey, credentials.baseId);
      const results = await analyzer.analyzeBase(credentials.tableNames);
      
      setAnalysisResults(results);
      setStep(4);
      
      console.log('✅ Analysis complete:', results);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setError(`Failed to analyze your Airtable base: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [credentials]);

  // Step 4: Generate Configuration
  const generateConfiguration = useCallback(() => {
    if (!analysisResults) return;

    const envContent = ClientEnvUpdater.generateEnvContent(analysisResults, credentials);
    setGeneratedConfig(envContent);
    setStep(5);
  }, [analysisResults, credentials]);

  // Step 5: Download Configuration
  const downloadConfig = useCallback(() => {
    ClientEnvUpdater.downloadConfiguration(generatedConfig, 'airtable-config.env');
  }, [generatedConfig]);

  const copyToClipboard = useCallback(async () => {
    const success = await ClientEnvUpdater.copyToClipboard(generatedConfig);
    if (success) {
      // Could show a toast notification here
      console.log('Configuration copied to clipboard!');
    }
  }, [generatedConfig]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Connect Your Existing Airtable Base
        </h1>
        <p className="text-gray-600">
          Let's analyze your 5-table Airtable base and set up the integration
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step > i ? <CheckCircle className="w-4 h-4" /> : i}
              </div>
              {i < 5 && (
                <div className={`w-12 h-1 ${
                  step > i ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step 1: Credentials */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Step 1: Airtable Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <Label htmlFor="apiKey">Airtable API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="keyXXXXXXXXXXXXXX"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Find this in your Airtable Account Settings → Developer tab
                </p>
              </div>

              <div>
                <Label htmlFor="baseId">Base ID</Label>
                <Input
                  id="baseId"
                  value={credentials.baseId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, baseId: e.target.value }))}
                  placeholder="appXXXXXXXXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Found in your Airtable URL when viewing your base
                </p>
              </div>

              <Button type="submit" className="w-full">
                Continue to Table Names
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Table Names */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Your 5 Table Names</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTableNamesSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tableNames">Table Names (one per line)</Label>
                <Textarea
                  id="tableNames"
                  value={tableNamesInput}
                  onChange={(e) => setTableNamesInput(e.target.value)}
                  placeholder={`Enter your 5 table names, for example:
Properties
Tenants
Bookings
Maintenance
Financial Reports`}
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter exactly 5 table names as they appear in your Airtable base
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Analyze My Base Structure
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Analysis */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Analyzing Your Base</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {!isAnalyzing ? (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Ready to analyze your Airtable base structure and identify optimal field mappings.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">What we'll analyze:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Field names and data types in each table</li>
                    <li>• Identify which tables map to Properties, Users, Bookings, etc.</li>
                    <li>• Generate custom data transformers for your structure</li>
                    <li>• Create environment configuration</li>
                  </ul>
                </div>
                <Button onClick={analyzeBase} size="lg">
                  Start Analysis
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p className="text-gray-600">
                  Analyzing your base structure... This may take a few moments.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === 4 && analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully analyzed your {analysisResults.summary.totalTables} tables!
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="font-semibold">Identified Table Purposes:</h3>
              <div className="grid gap-4">
                {Object.entries(analysisResults.summary.identifiedPurposes).map(([tableName, purpose]) => (
                  <div key={tableName} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{tableName}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      purpose === 'unknown' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {purpose === 'unknown' ? 'Custom Table' : purpose}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Field Analysis Sample:</h3>
              {Object.entries(analysisResults.tables).slice(0, 2).map(([tableName, analysis]) => (
                <div key={tableName} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{tableName}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {analysis.fields?.length || 0} fields detected
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(analysis.fields || []).slice(0, 5).map(field => (
                      <span key={field} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {field}
                      </span>
                    ))}
                    {(analysis.fields || []).length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{(analysis.fields || []).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={generateConfiguration} className="w-full">
              Generate Configuration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Configuration */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Step 5: Your Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Configuration generated successfully! Copy this to your .env file.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label>Generated Environment Configuration:</Label>
                <Textarea
                  value={generatedConfig}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                  Copy to Clipboard
                </Button>
                <Button onClick={downloadConfig} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download .env File
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Copy the configuration above to your .env file</li>
                  <li>Restart your development server (npm run dev)</li>
                  <li>The app will now connect to your real Airtable data!</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}