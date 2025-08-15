// Browser-compatible environment configuration utilities
// No Node.js dependencies - safe for browser use

// Browser-compatible version for client-side use
export class ClientEnvUpdater {
  // Generate configuration string that user can copy to .env
  static generateEnvContent(analysisResults, credentials) {
    const config = [];
    
    config.push('# Airtable Configuration - Updated by AirCasa Setup');
    config.push(`# Generated on: ${new Date().toISOString()}`);
    config.push('');
    config.push(`VITE_AIRTABLE_API_KEY=${credentials.apiKey}`);
    config.push(`VITE_AIRTABLE_BASE_ID=${credentials.baseId}`);
    config.push('');
    config.push('# Table Mappings');
    
    const { summary } = analysisResults;
    
    Object.entries(summary.identifiedPurposes).forEach(([tableName, purpose]) => {
      switch (purpose) {
        case 'properties':
          config.push(`VITE_AIRTABLE_PROPERTIES_TABLE=${tableName}`);
          break;
        case 'users':
          config.push(`VITE_AIRTABLE_USERS_TABLE=${tableName}`);
          break;
        case 'bookings':
          config.push(`VITE_AIRTABLE_BOOKINGS_TABLE=${tableName}`);
          break;
        case 'analytics':
          config.push(`VITE_AIRTABLE_ANALYTICS_TABLE=${tableName}`);
          break;
        default:
          const cleanName = tableName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
          config.push(`VITE_AIRTABLE_${cleanName}_TABLE=${tableName}`);
      }
    });
    
    config.push('');
    config.push('# Analysis Results Summary:');
    config.push(`# Total Tables: ${summary.totalTables}`);
    config.push('# Table Purposes:');
    Object.entries(summary.identifiedPurposes).forEach(([table, purpose]) => {
      config.push(`#   ${table} → ${purpose}`);
    });
    
    return config.join('\n');
  }

  // Generate custom data transformers based on analysis
  static generateTransformers(analysisResults) {
    const transformers = {};
    
    Object.entries(analysisResults.tables).forEach(([tableName, analysis]) => {
      if (analysis.suggestions && analysis.suggestions.recommendedMapping) {
        const mapping = analysis.suggestions.recommendedMapping;
        
        transformers[tableName] = {
          transform: `
export function transform${tableName.replace(/[^a-zA-Z0-9]/g, '')}(airtableRecord) {
  if (!airtableRecord) return null;
  
  return {
    id: airtableRecord.id,
    ${Object.entries(mapping).map(([airtableField, appField]) => 
      `${appField}: airtableRecord['${airtableField}'] || airtableRecord.fields?.['${airtableField}'] || null,`
    ).join('\n    ')}
    // Original fields for debugging
    _originalFields: airtableRecord.fields || airtableRecord,
    _createdTime: airtableRecord._createdTime || airtableRecord.createdTime
  };
}`,
          mapping,
          fieldCount: analysis.fields?.length || 0,
          confidence: analysis.suggestions.confidence
        };
      }
    });
    
    return transformers;
  }

  // Create a comprehensive setup report
  static generateSetupReport(analysisResults, credentials) {
    const report = {
      timestamp: new Date().toISOString(),
      baseInfo: {
        baseId: credentials.baseId,
        tableCount: analysisResults.summary.totalTables,
        tablesAnalyzed: Object.keys(analysisResults.tables)
      },
      mappings: analysisResults.summary.identifiedPurposes,
      confidence: {},
      recommendations: []
    };
    
    // Add confidence levels
    Object.entries(analysisResults.tables).forEach(([tableName, analysis]) => {
      if (analysis.suggestions) {
        report.confidence[tableName] = analysis.suggestions.confidence;
      }
    });
    
    // Generate recommendations
    const unknownTables = Object.entries(report.mappings)
      .filter(([_, purpose]) => purpose === 'unknown')
      .map(([table]) => table);
    
    if (unknownTables.length > 0) {
      report.recommendations.push({
        type: 'manual_mapping',
        message: `${unknownTables.length} tables need manual mapping`,
        tables: unknownTables
      });
    }
    
    const lowConfidenceTables = Object.entries(report.confidence)
      .filter(([_, confidence]) => confidence === 'low')
      .map(([table]) => table);
    
    if (lowConfidenceTables.length > 0) {
      report.recommendations.push({
        type: 'verify_mapping',
        message: `${lowConfidenceTables.length} tables have low confidence mappings`,
        tables: lowConfidenceTables
      });
    }
    
    return report;
  }

  // Download configuration as a file
  static downloadConfiguration(content, filename = 'airtable-config.env') {
    try {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error downloading configuration:', error);
      return false;
    }
  }

  // Copy to clipboard
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (fallbackError) {
        console.error('Fallback copy failed:', fallbackError);
        return false;
      }
    }
  }
}