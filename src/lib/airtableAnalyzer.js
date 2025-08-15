// Airtable base analyzer to understand existing structure
import Airtable from 'airtable';

export class AirtableAnalyzer {
  constructor(apiKey, baseId) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.base = null;
    
    if (apiKey && baseId) {
      try {
        Airtable.configure({
          endpointUrl: 'https://api.airtable.com',
          apiKey: apiKey
        });
        this.base = Airtable.base(baseId);
      } catch (error) {
        console.error('Failed to initialize Airtable analyzer:', error);
      }
    }
  }

  // Analyze a table's structure
  async analyzeTable(tableName) {
    if (!this.base) {
      throw new Error('Airtable base not initialized');
    }

    try {
      console.log(`🔍 Analyzing table: ${tableName}`);
      
      const records = [];
      const fields = new Set();
      const sampleData = [];
      
      await this.base(tableName).select({
        maxRecords: 5, // Just get a few records to analyze structure
        view: 'Grid view'
      }).eachPage((pageRecords, fetchNextPage) => {
        pageRecords.forEach(record => {
          // Collect all field names
          Object.keys(record.fields).forEach(fieldName => {
            fields.add(fieldName);
          });
          
          // Store sample data
          sampleData.push({
            id: record.id,
            fields: record.fields,
            createdTime: record._createdTime
          });
        });
        fetchNextPage();
      });

      const analysis = {
        tableName,
        recordCount: sampleData.length,
        fields: Array.from(fields).sort(),
        fieldTypes: this.analyzeFieldTypes(sampleData),
        sampleRecords: sampleData.slice(0, 2), // Just first 2 records
        suggestions: this.generateMappingSuggestions(tableName, Array.from(fields))
      };

      console.log(`✅ Analysis complete for ${tableName}:`, analysis);
      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing table ${tableName}:`, error);
      throw error;
    }
  }

  // Analyze field types based on sample data
  analyzeFieldTypes(sampleData) {
    const fieldTypes = {};
    
    if (sampleData.length === 0) return fieldTypes;
    
    // Get all field names from first record
    const allFields = new Set();
    sampleData.forEach(record => {
      Object.keys(record.fields).forEach(field => allFields.add(field));
    });
    
    allFields.forEach(fieldName => {
      const values = sampleData
        .map(record => record.fields[fieldName])
        .filter(value => value !== undefined && value !== null);
      
      if (values.length === 0) {
        fieldTypes[fieldName] = 'unknown';
        return;
      }
      
      const firstValue = values[0];
      
      if (typeof firstValue === 'string') {
        if (firstValue.includes('@')) {
          fieldTypes[fieldName] = 'email';
        } else if (firstValue.match(/^\d{4}-\d{2}-\d{2}/)) {
          fieldTypes[fieldName] = 'date';
        } else if (firstValue.startsWith('http')) {
          fieldTypes[fieldName] = 'url';
        } else {
          fieldTypes[fieldName] = 'text';
        }
      } else if (typeof firstValue === 'number') {
        fieldTypes[fieldName] = 'number';
      } else if (typeof firstValue === 'boolean') {
        fieldTypes[fieldName] = 'boolean';
      } else if (Array.isArray(firstValue)) {
        fieldTypes[fieldName] = 'array';
      } else if (typeof firstValue === 'object') {
        fieldTypes[fieldName] = 'object';
      } else {
        fieldTypes[fieldName] = 'unknown';
      }
    });
    
    return fieldTypes;
  }

  // Generate mapping suggestions based on field names
  generateMappingSuggestions(tableName, fields) {
    const suggestions = {
      likelyPurpose: 'unknown',
      recommendedMapping: {},
      confidence: 'low'
    };

    const lowerFields = fields.map(f => f.toLowerCase());
    
    // Determine likely table purpose
    if (this.containsAny(lowerFields, ['property', 'address', 'rent', 'bedroom', 'bathroom'])) {
      suggestions.likelyPurpose = 'properties';
      suggestions.confidence = 'high';
    } else if (this.containsAny(lowerFields, ['name', 'email', 'phone', 'contact', 'user'])) {
      suggestions.likelyPurpose = 'users';
      suggestions.confidence = 'high';
    } else if (this.containsAny(lowerFields, ['booking', 'reservation', 'check', 'guest', 'stay'])) {
      suggestions.likelyPurpose = 'bookings';
      suggestions.confidence = 'high';
    } else if (this.containsAny(lowerFields, ['revenue', 'income', 'analytics', 'report', 'stats'])) {
      suggestions.likelyPurpose = 'analytics';
      suggestions.confidence = 'medium';
    }

    // Generate field mappings based on common patterns
    fields.forEach(field => {
      const lower = field.toLowerCase();
      
      // Name/Title mappings
      if (this.matchesAny(lower, ['name', 'title', 'property name', 'listing name'])) {
        suggestions.recommendedMapping[field] = 'title';
      }
      // Location mappings  
      else if (this.matchesAny(lower, ['address', 'location', 'city', 'area'])) {
        suggestions.recommendedMapping[field] = 'location';
      }
      // Price mappings
      else if (this.matchesAny(lower, ['price', 'rent', 'rate', 'cost', 'amount'])) {
        suggestions.recommendedMapping[field] = 'price';
      }
      // Email mappings
      else if (this.matchesAny(lower, ['email', 'e-mail', 'email address'])) {
        suggestions.recommendedMapping[field] = 'email';
      }
      // Status mappings
      else if (this.matchesAny(lower, ['status', 'state', 'condition'])) {
        suggestions.recommendedMapping[field] = 'status';
      }
    });

    return suggestions;
  }

  // Helper method to check if array contains any of the target values
  containsAny(array, targets) {
    return targets.some(target => 
      array.some(item => item.includes(target))
    );
  }

  // Helper method to check if string matches any pattern
  matchesAny(str, patterns) {
    return patterns.some(pattern => 
      str === pattern || str.includes(pattern)
    );
  }

  // Analyze entire base structure
  async analyzeBase(tableNames) {
    console.log('🔍 Starting full base analysis...');
    
    const baseAnalysis = {
      baseId: this.baseId,
      analyzedAt: new Date().toISOString(),
      tables: {},
      summary: {
        totalTables: tableNames.length,
        identifiedPurposes: {},
        recommendedConfiguration: {}
      }
    };

    for (const tableName of tableNames) {
      try {
        const tableAnalysis = await this.analyzeTable(tableName);
        baseAnalysis.tables[tableName] = tableAnalysis;
        
        // Update summary
        const purpose = tableAnalysis.suggestions.likelyPurpose;
        baseAnalysis.summary.identifiedPurposes[tableName] = purpose;
        
        // Recommend environment variable mapping
        if (purpose === 'properties') {
          baseAnalysis.summary.recommendedConfiguration['VITE_AIRTABLE_PROPERTIES_TABLE'] = tableName;
        } else if (purpose === 'users') {
          baseAnalysis.summary.recommendedConfiguration['VITE_AIRTABLE_USERS_TABLE'] = tableName;
        } else if (purpose === 'bookings') {
          baseAnalysis.summary.recommendedConfiguration['VITE_AIRTABLE_BOOKINGS_TABLE'] = tableName;
        } else if (purpose === 'analytics') {
          baseAnalysis.summary.recommendedConfiguration['VITE_AIRTABLE_ANALYTICS_TABLE'] = tableName;
        }
        
      } catch (error) {
        console.error(`Failed to analyze table ${tableName}:`, error);
        baseAnalysis.tables[tableName] = {
          error: error.message,
          status: 'failed'
        };
      }
    }

    console.log('✅ Base analysis complete:', baseAnalysis);
    return baseAnalysis;
  }

  // Generate custom data transformer based on analysis
  generateCustomTransformer(tableAnalysis, targetFormat = 'properties') {
    const { fields, suggestions } = tableAnalysis;
    const mapping = suggestions.recommendedMapping;
    
    const transformerCode = `
// Auto-generated transformer for ${tableAnalysis.tableName}
export function transform${tableAnalysis.tableName}(airtableRecord) {
  return {
    id: airtableRecord.id,
    ${Object.entries(mapping).map(([airtableField, appField]) => 
      `${appField}: airtableRecord['${airtableField}'] || airtableRecord.${appField},`
    ).join('\n    ')}
    _createdTime: airtableRecord._createdTime
  };
}
    `;
    
    return transformerCode;
  }
}

// Utility function to quickly analyze a base
export async function quickAnalyze(apiKey, baseId, tableNames) {
  const analyzer = new AirtableAnalyzer(apiKey, baseId);
  return await analyzer.analyzeBase(tableNames);
}
