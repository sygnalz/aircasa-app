import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Home, Bed, Bath, Square, XCircle, AlertCircle } from "lucide-react";
import { zillowService, propertyEnrichmentService } from "@/api/propertyServices";

export default function Step2PropertyConfirmation({ onNext, onBack, signupData }) {
  const [propertyData, setPropertyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPropertyData = async () => {
      setIsLoading(true);
      setError("");

      if (!signupData.property_address) {
        setError("No address provided from the previous step.");
        setIsLoading(false);
        return;
      }

      console.log('🔄 Processing property confirmation for:', signupData.property_address);

      try {
        let zillowData = null;
        let enrichedData = null;

        // Check if we already have Zillow verification from Step 1
        if (signupData.zillow_verification?.success) {
          console.log('✅ Using Zillow data from Step 1');
          zillowData = signupData.zillow_verification.data;
          
          // Get additional details if we have zpid
          if (zillowData.zpid) {
            console.log('🔍 Fetching additional Zillow details...');
            const additionalDetails = await zillowService.getPropertyDetails(zillowData.zpid);
            if (additionalDetails.success) {
              // Merge additional data
              zillowData = {
                ...zillowData,
                ...additionalDetails
              };
            }
          }
        } else {
          console.log('🔍 Fetching fresh Zillow data...');
          // Fetch fresh Zillow data
          const zillowResult = await zillowService.verifyAddress(signupData.property_address);
          
          if (zillowResult.success) {
            zillowData = zillowResult.data;
            
            // Get additional details
            if (zillowData.zpid) {
              const additionalDetails = await zillowService.getPropertyDetails(zillowData.zpid);
              if (additionalDetails.success) {
                zillowData = {
                  ...zillowData,
                  ...additionalDetails
                };
              }
            }
          } else {
            console.warn('⚠️ Zillow verification failed:', zillowResult.error);
          }
        }

        // Enrich property data with user input and API data
        const userData = {
          address: signupData.property_address,
          ...signupData.address_components
        };

        enrichedData = propertyEnrichmentService.enrichPropertyData(userData, zillowData?.propertyData);

        // Format for display
        const formattedData = {
          address: enrichedData.address,
          property_type: enrichedData.propertyType || "Single Family",
          bedrooms: enrichedData.bedrooms || 0,
          bathrooms: enrichedData.bathrooms || 0,
          square_feet: enrichedData.sqft || 0,
          estimated_value: enrichedData.estimatedValue || enrichedData.zestimate || 0,
          image_url: enrichedData.images?.[0] || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          year_built: enrichedData.yearBuilt || "N/A",
          lot_size: enrichedData.lotSize || 0,
          mls_verified: enrichedData.verified || false,
          zpid: enrichedData.zpid || null,
          verification_source: enrichedData.verificationSource || 'Manual Entry',
          // Store the individual address components for later use
          street: enrichedData.street || signupData.address_components?.street || "",
          city: enrichedData.city || signupData.address_components?.city || "",
          state: enrichedData.state || signupData.address_components?.state || "",
          zip_code: enrichedData.zipcode || signupData.address_components?.zipcode || ""
        };

        console.log('📊 Final formatted property data:', formattedData);
        setPropertyData(formattedData);

      } catch (err) {
        console.error('❌ Property data fetch error:', err);
        setError(err.message || "An error occurred while fetching property data.");
        
        // Create minimal property data from user input as fallback
        const fallbackData = {
          address: signupData.property_address,
          property_type: "Single Family",
          bedrooms: 0,
          bathrooms: 0,
          square_feet: 0,
          estimated_value: 0,
          image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          year_built: "N/A",
          lot_size: 0,
          mls_verified: false,
          zpid: null,
          verification_source: 'Manual Entry',
          street: signupData.address_components?.street || "",
          city: signupData.address_components?.city || "",
          state: signupData.address_components?.state || "",
          zip_code: signupData.address_components?.zipcode || ""
        };
        
        setPropertyData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [signupData.property_address, signupData.zillow_verification]);

  const handleNext = () => {
    onNext({ property_data: propertyData });
  };

  if (isLoading) {
    return (
      <div className="glass-card premium-shadow p-8 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verifying Your Property
          </h2>
          <p className="text-gray-600">
            Getting the latest Zestimate from Zillow...
          </p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
       <div className="glass-card premium-shadow p-8 rounded-2xl">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
            </h2>
            <p className="text-red-600">{error}</p>
        </div>
        <Button
            onClick={onBack}
            variant="outline"
            className="w-full py-4 rounded-xl font-semibold border-2 hover:bg-gray-50"
        >
            Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-card premium-shadow p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property Verified!
        </h2>
        <p className="text-gray-600">
          We found your property: <span className="font-medium">{propertyData?.address}</span>
        </p>
      </div>

      <div className="space-y-6">
        {propertyData?.image_url && (
          <div className="relative">
            <img 
              src={propertyData.image_url} 
              alt="Property exterior view" 
              className="w-full h-64 object-cover rounded-xl shadow-lg"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
              }}
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-gray-700">Exterior View</span>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-900">Property Details</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{propertyData?.property_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Year Built:</span>
                <span className="font-medium">{propertyData?.year_built}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verified By:</span>
                {propertyData?.mls_verified ? (
                  <span className="font-medium text-green-600">✓ {propertyData.verification_source}</span>
                ) : (
                  <span className="font-medium text-amber-600">⚠ Manual Entry</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <div className="flex items-center mb-4">
              <Home className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="font-semibold text-gray-900">Property Features</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center">
                <Bed className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm">{propertyData?.bedrooms || 'N/A'} beds</span>
              </div>
              <div className="flex items-center">
                <Bath className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm">{propertyData?.bathrooms || 'N/A'} baths</span>
              </div>
              <div className="flex items-center">
                <Square className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm">{propertyData?.square_feet ? `${propertyData.square_feet.toLocaleString()} sq ft` : 'N/A'}</span>
              </div>
              {propertyData?.lot_size ? (
                <div className="flex items-center">
                  <Square className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm">{(propertyData.lot_size / 43560).toFixed(2)} acre lot</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${propertyData?.mls_verified ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'}`}>
          <h3 className="font-semibold text-gray-900 mb-2">
            {propertyData?.mls_verified ? 'Estimated Value (Zestimate®)' : 'Property Value'}
          </h3>
          <div className={`text-3xl font-bold mb-2 ${propertyData?.mls_verified ? 'text-blue-600' : 'text-amber-600'}`}>
            {propertyData?.estimated_value ? `$${propertyData.estimated_value.toLocaleString()}` : 'Not Available'}
          </div>
          <p className="text-sm text-gray-600">
            {propertyData?.mls_verified 
              ? 'This is not an appraisal and should be used as a starting point.'
              : 'Property value will be estimated during the enrichment process.'
            }
          </p>
          {!propertyData?.mls_verified && (
            <div className="flex items-center mt-2 text-sm text-amber-700">
              <AlertCircle className="w-4 h-4 mr-1" />
              Property data will be enriched with ATTOM Data API
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1 py-4 rounded-xl font-semibold border-2 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Confirm & Continue
          </Button>
        </div>
      </div>
    </div>
  );
}