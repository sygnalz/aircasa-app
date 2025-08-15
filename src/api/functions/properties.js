// src/api/functions/properties.js
// Property creation function with ATTOM Data API integration and Zillow API backend calls

import { transformPropertyForAirtable } from '@/lib/dataTransformers';
import { propertiesService } from '@/lib/airtableClient';

// Utility function to safely access nested object properties
const get = (obj, path, defaultValue = null) => {
  const travel = (regexp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[\.\/]+/);
  return result === undefined || result === null ? defaultValue : result;
};

// Helper function to extract schools by grade level as per PDF documentation
const extractSchoolByGrade = (schools, gradeLevel) => {
  if (!schools || !Array.isArray(schools)) return null;
  
  for (const school of schools) {
    const grades = school.gradeLevel || '';
    const gradeLower = grades.toLowerCase();
    
    if (gradeLevel === 'elementary') {
      // Elementary: PK, KG, K, 1-5
      if (gradeLower.includes('pk') || gradeLower.includes('kg') || 
          gradeLower.includes('k-') || gradeLower.includes('1-') ||
          gradeLower.includes('2-') || gradeLower.includes('3-') ||
          gradeLower.includes('4-') || gradeLower.includes('5-') ||
          gradeLower.includes('-5')) {
        return school.name;
      }
    } else if (gradeLevel === 'middle') {
      // Middle: 6-8
      if (gradeLower.includes('6-') || gradeLower.includes('7-') || 
          gradeLower.includes('8-') || gradeLower.includes('-8')) {
        return school.name;
      }
    } else if (gradeLevel === 'high') {
      // High: 9-12
      if (gradeLower.includes('9-') || gradeLower.includes('10-') || 
          gradeLower.includes('11-') || gradeLower.includes('12-') ||
          gradeLower.includes('-12')) {
        return school.name;
      }
    }
  }
  
  return null;
};

// Process school data from /property/detailwithschools endpoint
const extractSchoolData = (attomSchools) => {
  if (!attomSchools || !attomSchools.property || !attomSchools.property[0]) {
    return {
      district: null,
      elementary: null,
      middle: null,
      high: null
    };
  }
  
  const property = attomSchools.property[0];
  const district = get(property, 'schoolDistrict.0.districtname', null);
  const schools = get(property, 'schools', []);
  
  return {
    district,
    elementary: extractSchoolByGrade(schools, 'elementary'),
    middle: extractSchoolByGrade(schools, 'middle'),
    high: extractSchoolByGrade(schools, 'high')
  };
};

// Zillow API backend calls (moved from frontend for security)
const callZillowAPI = async (endpoint, params) => {
  const rapidAPIKey = import.meta.env.VITE_ZILLOW_RAPIDAPI_KEY;
  
  let host, url;
  
  if (endpoint === 'byaddress') {
    host = import.meta.env.VITE_ZILLOW_ADDRESS_HOST;
    url = `https://${host}/pro/byaddress`;
  } else if (endpoint === 'zestimate') {
    host = import.meta.env.VITE_ZILLOW_ZESTIMATE_HOST;
    url = `https://${host}/zestimate`;
  } else if (endpoint === 'images') {
    host = import.meta.env.VITE_ZILLOW_ZESTIMATE_HOST;
    url = `https://${host}/images`;
  } else {
    throw new Error(`Unknown Zillow endpoint: ${endpoint}`);
  }

  const headers = {
    'X-RapidAPI-Key': rapidAPIKey,
    'X-RapidAPI-Host': host,
    'Accept': 'application/json'
  };

  let requestUrl = url;
  if (endpoint === 'byaddress' && params.propertyaddress) {
    requestUrl += `?propertyaddress=${encodeURIComponent(params.propertyaddress)}`;
  } else if ((endpoint === 'zestimate' || endpoint === 'images') && params.zpid) {
    requestUrl += `?zpid=${params.zpid}`;
  }

  console.log('🏠 Calling Zillow API:', { endpoint, url: requestUrl, host });

  try {
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`Zillow API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Zillow API response:', data);
    return data;
  } catch (error) {
    console.error('❌ Zillow API error:', error);
    throw error;
  }
};

// ATTOM Data API calls (backend only - secure)
const callAttomAPI = async (endpoint, params) => {
  const apiKey = import.meta.env.VITE_ATTOM_API_KEY;
  const baseUrl = import.meta.env.VITE_ATTOM_BASE_URL;
  
  const headers = {
    'apikey': apiKey,
    'Accept': 'application/json'
  };

  let url;
  if (endpoint === 'expandedprofile') {
    url = `${baseUrl}/property/expandedprofile?address=${encodeURIComponent(params.address)}`;
  } else if (endpoint === 'assessment') {
    url = `${baseUrl}/assessment/detail?address=${encodeURIComponent(params.address)}`;
  } else if (endpoint === 'detailwithschools') {
    url = `${baseUrl}/property/detailwithschools?attomId=${params.attomId}`;
  } else {
    throw new Error(`Unknown ATTOM endpoint: ${endpoint}`);
  }

  console.log('🏛️ Calling ATTOM API:', { endpoint, url });

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`ATTOM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ ATTOM API response:', data);
    return data;
  } catch (error) {
    console.error('❌ ATTOM API error:', error);
    throw error;
  }
};

// Main properties function that handles creation with API integration
export const properties = async ({ operation, payload }) => {
  console.log('🔄 Properties function called:', { operation, payload });

  if (operation !== 'create') {
    throw new Error(`Unsupported operation: ${operation}`);
  }

  try {
    // Step 1: Get Zillow data for the property address
    console.log('🏠 Step 1: Fetching Zillow data...');
    let zillowData = null;
    let zpid = null;
    
    try {
      zillowData = await callZillowAPI('byaddress', { 
        propertyaddress: payload.address 
      });
      
      // Extract zpid for additional Zillow calls
      if (zillowData && zillowData.zpid) {
        zpid = zillowData.zpid;
      }
    } catch (error) {
      console.warn('⚠️ Zillow API failed, continuing without Zillow data:', error.message);
    }

    // Step 2: Get additional Zillow data (Zestimate and Images) if we have zpid
    let zestimateData = null;
    let imagesData = null;
    
    if (zpid) {
      try {
        console.log('🏠 Step 2a: Fetching Zestimate data...');
        zestimateData = await callZillowAPI('zestimate', { zpid });
      } catch (error) {
        console.warn('⚠️ Zestimate API failed:', error.message);
      }

      try {
        console.log('🏠 Step 2b: Fetching Images data...');
        imagesData = await callZillowAPI('images', { zpid });
      } catch (error) {
        console.warn('⚠️ Images API failed:', error.message);
      }
    }

    // Step 3: Get ATTOM data for property enrichment
    console.log('🏛️ Step 3: Fetching ATTOM data...');
    let attomExpandedProfile = null;
    let attomAssessment = null;
    let attomSchools = null;
    let attomId = null;

    try {
      // Get expanded profile first to get attomId - using correct endpoint path
      attomExpandedProfile = await callAttomAPI('expandedprofile', { 
        address: payload.address 
      });
      
      // Extract attomId for school data - using correct field path from PDF
      if (attomExpandedProfile && attomExpandedProfile.property && attomExpandedProfile.property[0]) {
        attomId = get(attomExpandedProfile, 'property.0.identifier.attomId');
        console.log('🔍 Extracted attomId:', attomId);
      }
    } catch (error) {
      console.warn('⚠️ ATTOM expandedprofile failed:', error.message);
    }

    try {
      // Get assessment data - using correct endpoint path  
      attomAssessment = await callAttomAPI('assessment', { 
        address: payload.address 
      });
    } catch (error) {
      console.warn('⚠️ ATTOM assessment failed:', error.message);
    }

    if (attomId) {
      try {
        // Get school data using attomId
        attomSchools = await callAttomAPI('detailwithschools', { attomId });
      } catch (error) {
        console.warn('⚠️ ATTOM schools failed:', error.message);
      }
    }

    // Step 4: Combine all API data with user input
    console.log('🔄 Step 4: Combining API data with user input...');
    
    const enrichedPropertyData = {
      // Core user input data
      address: payload.address,
      street: payload.street || get(attomExpandedProfile, 'property.0.address.line1', ''),
      city: payload.city || get(attomExpandedProfile, 'property.0.address.locality', ''),
      state: payload.state || get(attomExpandedProfile, 'property.0.address.countrySubd', ''),
      zip_code: payload.zip_code || get(attomExpandedProfile, 'property.0.address.postal1', ''),
      
      // Property characteristics (prefer user input, fallback to APIs)
      property_type: payload.property_type || get(attomExpandedProfile, 'property.0.summary.propclass', 'Single Family'),
      bedrooms: payload.bedrooms || get(attomExpandedProfile, 'property.0.building.rooms.beds'),
      bathrooms: payload.bathrooms || get(attomExpandedProfile, 'property.0.building.rooms.baths'),
      square_feet: payload.square_feet || get(attomExpandedProfile, 'property.0.building.size.bldgsize'),
      lot_size: payload.lot_size || get(attomExpandedProfile, 'property.0.lot.lotsize1'),
      year_built: payload.year_built || get(attomExpandedProfile, 'property.0.summary.yearbuilt'),
      
      // Financial data (prefer Zillow, fallback to ATTOM, then user input)
      estimated_value: payload.estimated_value || get(zestimateData, 'zestimate') || get(attomAssessment, 'assessment.0.market.mktttlvalue'),
      
      // Images (prefer user upload, fallback to Zillow)
      image_url: payload.image_url || get(imagesData, 'images.0') || '',
      
      // API verification flags
      mls_verified: payload.mls_verified || false,
      zillow_zpid: zpid,
      attom_id: attomId,
      
      // User and business data
      is_buying_home: payload.is_buying_home || true,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      referred_by: payload.referred_by || null,
      
      // Process school data using helper function as per PDF documentation
      ...((() => {
        const schoolData = extractSchoolData(attomSchools);
        return {
          school_district: schoolData.district,
          elementary_school: schoolData.elementary,
          middle_school: schoolData.middle,
          high_school: schoolData.high
        };
      })()),
      
      // Tax and legal data from ATTOM
      tax_amount: get(attomAssessment, 'assessment.0.tax.taxtot'),
      tax_year: get(attomAssessment, 'assessment.0.tax.taxyear'),
      assessed_value: get(attomAssessment, 'assessment.0.assessed.assdttlvalue'),
      
      // Additional property details
      parcel_number: get(attomExpandedProfile, 'property.0.lot.apn'),
      legal_description: get(attomAssessment, 'assessment.0.legal.legal1'),
      
      // Comprehensive ATTOM data mapping using correct field paths from PDF documentation
      // From /property/expandedprofile endpoint
      attom_street_address: get(attomExpandedProfile, 'property.0.address.line1'),
      attom_city: get(attomExpandedProfile, 'property.0.address.locality'),
      attom_state: get(attomExpandedProfile, 'property.0.address.countrySubd'),
      attom_zip: get(attomExpandedProfile, 'property.0.address.postal1'),
      attom_country: get(attomExpandedProfile, 'property.0.address.country', 'US'),
      attom_subdivision: get(attomExpandedProfile, 'property.0.area.subdName'),
      attom_municipality: get(attomExpandedProfile, 'property.0.address.locality'),
      attom_county: get(attomExpandedProfile, 'property.0.area.countrySecSubd'),
      attom_use_type: get(attomExpandedProfile, 'property.0.summary.propertyType'),
      attom_year_built: get(attomExpandedProfile, 'property.0.summary.yearBuilt'),
      attom_levels: get(attomExpandedProfile, 'property.0.building.summary.levels'),
      attom_finished_sf: get(attomExpandedProfile, 'property.0.building.size.livingSize'),
      attom_siding: get(attomExpandedProfile, 'property.0.building.construction.wallType'),
      attom_roof_type: get(attomExpandedProfile, 'property.0.building.construction.roofCover'),
      attom_central_air: get(attomExpandedProfile, 'property.0.utilities.coolingType'),
      attom_heating_type: get(attomExpandedProfile, 'property.0.utilities.heatingType'),
      attom_heating_fuel: get(attomExpandedProfile, 'property.0.utilities.heatingFuel'),
      attom_fireplace_number: get(attomExpandedProfile, 'property.0.building.interior.fplcCount'),
      attom_lot_size: get(attomExpandedProfile, 'property.0.lot.lotSize1'),
      attom_lot_zoning: get(attomExpandedProfile, 'property.0.lot.zoningType'),
      attom_mortgage_amount: get(attomExpandedProfile, 'property.0.assessment.mortgage.FirstConcurrent.amount'),
      attom_2nd_mortgage: get(attomExpandedProfile, 'property.0.assessment.mortgage.SecondConcurrent.amount'),
      
      // From /assessment/detail endpoint
      attom_taxes: get(attomAssessment, 'assessment.0.tax.taxAmt'),
      attom_tax_id: get(attomAssessment, 'assessment.0.area.taxcodearea'),
      attom_architectural_style: get(attomAssessment, 'assessment.0.building.summary.archStyle'),
      attom_water_source: get(attomAssessment, 'assessment.0.utilities.watertype'),
      attom_sewer_type: get(attomAssessment, 'assessment.0.utilities.sewertype'),
      attom_pool_type: get(attomAssessment, 'assessment.0.lot.pooltype'),
      attom_garage: get(attomAssessment, 'assessment.0.building.parking.garageType'),
      attom_flooring: get(attomAssessment, 'assessment.0.building.interior.floors'),
      attom_designated_historic: get(attomAssessment, 'assessment.0.building.summary.imprType'),
      attom_legal_desc1: get(attomAssessment, 'assessment.0.summary.legal1'),
      attom_legal_desc2: get(attomAssessment, 'assessment.0.summary.legal2'),
      attom_legal_desc3: get(attomAssessment, 'assessment.0.summary.legal3'),
      
      // School data processed with custom extraction logic as per PDF
      ...((() => {
        const schoolData = extractSchoolData(attomSchools);
        return {
          attom_school_district: schoolData.district,
          attom_elementary_school: schoolData.elementary,
          attom_middle_school: schoolData.middle,
          attom_high_school: schoolData.high
        };
      })()),
    };

    console.log('📊 Enriched property data:', JSON.stringify(enrichedPropertyData, null, 2));

    // Step 5: Transform and save to Airtable
    console.log('💾 Step 5: Saving to Airtable...');
    const airtableFields = transformPropertyForAirtable(enrichedPropertyData);
    console.log('🗂️ Airtable fields to save:', JSON.stringify(airtableFields, null, 2));
    const airtableRecord = await propertiesService.create(airtableFields);

    console.log('✅ Property created successfully:', airtableRecord.id);

    return {
      data: {
        id: airtableRecord.id,
        ...enrichedPropertyData,
        airtable_record_id: airtableRecord.id
      }
    };

  } catch (error) {
    console.error('❌ Property creation failed:', error);
    throw error;
  }
};