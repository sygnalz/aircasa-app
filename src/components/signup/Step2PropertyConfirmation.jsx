import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, MapPin, Home, Bed, Bath, Square, XCircle } from "lucide-react";

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
      
      const apiKey = 'f1a6158f5emshcb3278226d03580p13a4e9jsn4231b06ad520';
      const apiHost = 'zillow-working-api.p.rapidapi.com';
      const url = `https://zillow-working-api.p.rapidapi.com/pro/byaddress?propertyaddress=${encodeURIComponent(signupData.property_address)}`;

      try {
        // First API call to get property details including zpid
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost
          }
        });

        const data = await response.json();
        console.log("Main API Response:", data);

        if (!response.ok) {
           if (data && data.message && data.message.toLowerCase().includes("subscribed")) {
              throw new Error("API Subscription Error: Please verify your API subscription on RapidAPI.");
           }
          throw new Error(data.message || `Failed to fetch data: ${response.statusText}`);
        }

        if (!data || !data.propertyDetails) {
          throw new Error("Could not find property details for this address. Please go back and try again.");
        }

        const details = data.propertyDetails;
        
        // Handle address properly - it might be an object or string
        let formattedAddress = signupData.property_address;
        if (details.address) {
          if (typeof details.address === 'string') {
            formattedAddress = details.address;
          } else if (typeof details.address === 'object') {
            // Construct address from object parts
            const addr = details.address;
            formattedAddress = [
              addr.streetAddress,
              addr.city,
              addr.state,
              addr.zipcode
            ].filter(Boolean).join(', ');
          }
        }

        // Get the zpid for subsequent calls
        const zpid = details.zpid;
        let zestimate = details.zestimate || details.price || 0; // Try multiple fields
        let imageUrl = details.photos?.[0] || details.imgSrc || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

        console.log("ZPID found:", zpid);
        console.log("Initial Zestimate:", zestimate);
        console.log("Initial Image URL:", imageUrl);

        // If we have a zpid, fetch the dedicated Zestimate and Images
        if (zpid) {
          // Second API call for Zestimate
          try {
            const zestimateUrl = `https://zillow-com1.p.rapidapi.com/zestimate?zpid=${zpid}`;
            console.log("Calling Zestimate API:", zestimateUrl);
            
            const zestimateResponse = await fetch(zestimateUrl, {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
              }
            });

            const zestimateData = await zestimateResponse.json();
            console.log("Zestimate API Response:", zestimateData);
            
            if (zestimateResponse.ok && zestimateData) {
              // Try different possible field names for zestimate
              const newZestimate = zestimateData.zestimate || 
                                  zestimateData.price || 
                                  zestimateData.value || 
                                  zestimateData.estimate;
              if (newZestimate) {
                zestimate = newZestimate;
                console.log("Updated Zestimate:", zestimate);
              }
            } else {
              console.warn("Zestimate API call failed:", zestimateResponse.status, zestimateResponse.statusText);
            }
          } catch (zestimateError) {
            console.warn("Zestimate API call failed:", zestimateError);
          }

          // Third API call for Images
          try {
            const imagesUrl = `https://zillow-com1.p.rapidapi.com/images?zpid=${zpid}`;
            console.log("Calling Images API:", imagesUrl);
            
            const imagesResponse = await fetch(imagesUrl, {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
              }
            });

            const imagesData = await imagesResponse.json();
            console.log("Images API Response:", imagesData);
            
            if (imagesResponse.ok && imagesData) {
              // Try different possible response structures
              let newImageUrl = null;
              if (Array.isArray(imagesData) && imagesData.length > 0) {
                newImageUrl = imagesData[0]?.url || imagesData[0];
              } else if (imagesData.images && imagesData.images.length > 0) {
                newImageUrl = imagesData.images[0];
              }

              if (newImageUrl) {
                imageUrl = newImageUrl;
                console.log("Updated Image URL:", imageUrl);
              }
            }
          } catch (imageError) {
            console.warn("Images API call failed, using default image:", imageError);
          }
        }
        
        const formattedData = {
          address: formattedAddress,
          property_type: details.propertyType || "N/A",
          bedrooms: details.bedrooms || 0,
          bathrooms: details.bathrooms || 0,
          square_feet: details.livingArea || 0,
          estimated_value: zestimate,
          image_url: imageUrl,
          year_built: details.yearBuilt || "N/A",
          lot_size: details.lotSize || 0,
          mls_verified: true,
          zpid: zpid,
          // Store the individual address components for later use
          street: details.address?.streetAddress || "",
          city: details.address?.city || "",
          state: details.address?.state || "",
          zip_code: details.address?.zipcode || ""
        };
        
        console.log("Final formatted property data:", formattedData);
        setPropertyData(formattedData);

      } catch (err) {
        console.error("Zillow API Error:", err);
        setError(err.message || "An error occurred while fetching property data.");
        setPropertyData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [signupData.property_address]);

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
                <span className="font-medium text-green-600">✓ Zillow</span>
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

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Zillow Estimated Value (Zestimate®)</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {propertyData?.estimated_value ? `$${propertyData.estimated_value.toLocaleString()}` : 'Not Available'}
          </div>
          <p className="text-sm text-gray-600">
            This is not an appraisal and should be used as a starting point.
          </p>
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