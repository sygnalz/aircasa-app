// Utility functions for updating environment configuration
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export class EnvUpdater {
  constructor() {
    this.envPath = join(process.cwd(), '.env');
  }

  // Read current .env file
  readEnvFile() {
    try {
      const content = readFileSync(this.envPath, 'utf8');
      const lines = content.split('\n');
      const env = {};
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            env[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      
      return { content, env, lines };
    } catch (error) {
      console.error('Error reading .env file:', error);
      return { content: '', env: {}, lines: [] };
    }
  }

  // Update environment variables with new Airtable configuration
  updateAirtableConfig(config) {
    const { content, env, lines } = this.readEnvFile();
    
    // Create updated environment object
    const updatedEnv = { ...env, ...config };
    
    // Rebuild the file content
    const newLines = [];
    const processedKeys = new Set();
    
    // Process existing lines, updating Airtable-related ones
    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('#') || !trimmed.includes('=')) {
        // Keep comments and empty lines as-is
        newLines.push(line);
      } else {
        const [key] = trimmed.split('=');
        const cleanKey = key.trim();
        
        if (cleanKey.startsWith('VITE_AIRTABLE_')) {
          // Update Airtable-related variables
          if (updatedEnv[cleanKey]) {
            newLines.push(`${cleanKey}=${updatedEnv[cleanKey]}`);
            processedKeys.add(cleanKey);
          }
        } else {
          // Keep other variables as-is
          newLines.push(line);
        }
      }
    });
    
    // Add any new Airtable variables that weren't in the original file
    Object.keys(config).forEach(key => {
      if (!processedKeys.has(key)) {
        newLines.push(`${key}=${config[key]}`);
      }
    });
    
    return newLines.join('\n');
  }

  // Write updated configuration to .env file
  writeEnvFile(content) {
    try {
      writeFileSync(this.envPath, content, 'utf8');
      console.log('✅ .env file updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error writing .env file:', error);
      return false;
    }
  }

  // Complete update process
  updateFromAnalysis(analysisResults, credentials) {
    const config = this.generateConfigFromAnalysis(analysisResults, credentials);
    const newContent = this.updateAirtableConfig(config);
    return this.writeEnvFile(newContent);
  }

  // Generate configuration object from analysis results
  generateConfigFromAnalysis(analysisResults, credentials) {
    const config = {
      VITE_AIRTABLE_API_KEY: credentials.apiKey,
      VITE_AIRTABLE_BASE_ID: credentials.baseId
    };

    // Map tables based on identified purposes
    const { summary } = analysisResults;
    
    Object.entries(summary.identifiedPurposes).forEach(([tableName, purpose]) => {
      switch (purpose) {
        case 'properties':
          config.VITE_AIRTABLE_PROPERTIES_TABLE = tableName;
          break;
        case 'users':
          config.VITE_AIRTABLE_USERS_TABLE = tableName;
          break;
        case 'bookings':
          config.VITE_AIRTABLE_BOOKINGS_TABLE = tableName;
          break;
        case 'analytics':
          config.VITE_AIRTABLE_ANALYTICS_TABLE = tableName;
          break;
        default:
          // For unidentified tables, create custom variables
          const cleanName = tableName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
          config[`VITE_AIRTABLE_${cleanName}_TABLE`] = tableName;
      }
    });

    return config;
  }

  // Validate that required Airtable variables are set
  validateAirtableConfig() {
    const { env } = this.readEnvFile();
    
    const required = [
      'VITE_AIRTABLE_API_KEY',
      'VITE_AIRTABLE_BASE_ID'
    ];
    
    const missing = required.filter(key => !env[key] || env[key] === 'your_airtable_api_key_here' || env[key] === 'your_airtable_base_id_here');
    
    return {
      isValid: missing.length === 0,
      missing,
      current: env
    };
  }
}

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
}