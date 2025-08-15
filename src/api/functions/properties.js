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
      // Get expanded profile first to get attomId
      attomExpandedProfile = await callAttomAPI('expandedprofile', { 
        address: payload.address 
      });
      
      // Extract attomId for school data
      if (attomExpandedProfile && attomExpandedProfile.property && attomExpandedProfile.property[0]) {
        attomId = get(attomExpandedProfile, 'property.0.identifier.attomId');
      }
    } catch (error) {
      console.warn('⚠️ ATTOM expandedprofile failed:', error.message);
    }

    try {
      // Get assessment data
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
      
      // Additional ATTOM data for school information
      school_district: get(attomSchools, 'property.0.school.district.name'),
      elementary_school: get(attomSchools, 'property.0.school.elementary.name'),
      middle_school: get(attomSchools, 'property.0.school.middle.name'),
      high_school: get(attomSchools, 'property.0.school.high.name'),
      
      // Tax and legal data from ATTOM
      tax_amount: get(attomAssessment, 'assessment.0.tax.taxtot'),
      tax_year: get(attomAssessment, 'assessment.0.tax.taxyear'),
      assessed_value: get(attomAssessment, 'assessment.0.assessed.assdttlvalue'),
      
      // Additional property details
      parcel_number: get(attomExpandedProfile, 'property.0.lot.apn'),
      legal_description: get(attomAssessment, 'assessment.0.legal.legal1'),
      
      // Comprehensive ATTOM data mapping to Airtable schema
      attom_street_address: get(attomExpandedProfile, 'property.0.address.line1'),
      attom_city: get(attomExpandedProfile, 'property.0.address.locality'),
      attom_state: get(attomExpandedProfile, 'property.0.address.countrySubd'),
      attom_zip: get(attomExpandedProfile, 'property.0.address.postal1'),
      attom_country: get(attomExpandedProfile, 'property.0.address.country', 'US'),
      attom_subdivision: get(attomExpandedProfile, 'property.0.area.subdname'),
      attom_municipality: get(attomExpandedProfile, 'property.0.area.munname'),
      attom_county: get(attomExpandedProfile, 'property.0.area.countyname'),
      attom_use_type: get(attomExpandedProfile, 'property.0.summary.propclass'),
      attom_year_built: get(attomExpandedProfile, 'property.0.summary.yearbuilt'),
      attom_levels: get(attomExpandedProfile, 'property.0.building.rooms.storeytype'),
      attom_finished_sf: get(attomExpandedProfile, 'property.0.building.size.bldgsize'),
      attom_siding: get(attomExpandedProfile, 'property.0.building.exterior.walltype'),
      attom_roof_type: get(attomExpandedProfile, 'property.0.building.construction.rooftype'),
      attom_central_air: get(attomExpandedProfile, 'property.0.utilities.coolingtype'),
      attom_heating_type: get(attomExpandedProfile, 'property.0.utilities.heatingtype'),
      attom_heating_fuel: get(attomExpandedProfile, 'property.0.utilities.heatingfuel'),
      attom_fireplace_number: get(attomExpandedProfile, 'property.0.building.interior.fplccount'),
      attom_lot_size: get(attomExpandedProfile, 'property.0.lot.lotsize1'),
      attom_lot_zoning: get(attomExpandedProfile, 'property.0.summary.zoning'),
      attom_mortgage_amount: get(attomAssessment, 'assessment.0.deed.amount'),
      attom_2nd_mortgage: get(attomAssessment, 'assessment.0.deed.amount2'),
      attom_pool_type: get(attomExpandedProfile, 'property.0.building.pool.pooltype'),
      attom_flooring: get(attomExpandedProfile, 'property.0.building.interior.floortype'),
      attom_taxes: get(attomAssessment, 'assessment.0.tax.taxtot'),
      attom_legal_desc1: get(attomAssessment, 'assessment.0.legal.legal1'),
      attom_legal_desc2: get(attomAssessment, 'assessment.0.legal.legal2'),
      attom_legal_desc3: get(attomAssessment, 'assessment.0.legal.legal3'),
      attom_tax_id: get(attomExpandedProfile, 'property.0.lot.apn'),
      attom_school_district: get(attomSchools, 'property.0.school.district.name'),
      attom_elementary_school: get(attomSchools, 'property.0.school.elementary.name'),
      attom_middle_school: get(attomSchools, 'property.0.school.middle.name'),
      attom_high_school: get(attomSchools, 'property.0.school.high.name'),
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