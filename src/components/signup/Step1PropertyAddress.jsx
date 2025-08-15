import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2 } from "lucide-react";
import { zillowService, propertyValidationService } from "@/api/propertyServices";

export default function Step1PropertyAddress({ onNext, initialData }) {
  const [address, setAddress] = useState(initialData?.property_address || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Check if Google Maps is already loaded
  const isGoogleLoaded = () => {
    return typeof window !== 'undefined' && 
           window.google && 
           window.google.maps && 
           window.google.maps.places;
  };

  // Function to initialize the autocomplete
  const initAutocomplete = () => {
    if (!inputRef.current || !isGoogleLoaded()) {
      console.log("Google Maps not ready, retrying...");
      return;
    }

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "address_components", "geometry"]
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        console.log("Place selected:", place);
        
        if (place && place.formatted_address) {
          setAddress(place.formatted_address);
          setError("");
        }
      });

      console.log("Autocomplete initialized successfully");
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      setError("Address autocomplete unavailable. You can still enter your address manually.");
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if (isGoogleLoaded()) {
      initAutocomplete();
      return;
    }

    // Create global callback function
    window.initGoogleMaps = () => {
      console.log("Google Maps loaded via callback");
      setIsMapScriptLoaded(true);
      initAutocomplete();
    };

    const googleMapsUrl = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBViO6jOYB5NhNDL0m0Sp--xGrEMjFzWMQ&libraries=places&callback=initGoogleMaps`;
    
    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      // Script exists, wait for it to load
      if (isGoogleLoaded()) {
        initAutocomplete();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = googleMapsUrl;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
      setError("Address autocomplete unavailable. You can still enter your address manually.");
    };
    
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, []);

  const handleInputChange = (e) => {
    setAddress(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!address.trim()) {
      setError("Please enter your property address");
      return;
    }

    // Validate address format
    const validation = propertyValidationService.validateAddress(address.trim());
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("🔍 Verifying address with Zillow:", address.trim());
      
      // Call Zillow API to verify address
      const zillowResult = await zillowService.verifyAddress(address.trim());
      
      if (zillowResult.success) {
        console.log("✅ Address verified successfully");
        // Parse address components for better data structure
        const addressComponents = propertyValidationService.parseAddress(address.trim());
        
        onNext({ 
          property_address: address.trim(),
          zillow_verification: zillowResult,
          address_components: addressComponents.components
        });
      } else {
        console.warn("⚠️ Zillow verification failed, proceeding with manual address");
        // Allow user to proceed even if Zillow fails
        const addressComponents = propertyValidationService.parseAddress(address.trim());
        
        onNext({ 
          property_address: address.trim(),
          zillow_verification: { success: false, error: zillowResult.error },
          address_components: addressComponents.components
        });
      }
    } catch (err) {
      console.error("Address verification error:", err);
      // Still allow user to proceed with manual address entry
      const addressComponents = propertyValidationService.parseAddress(address.trim());
      
      onNext({ 
        property_address: address.trim(),
        zillow_verification: { success: false, error: err.message },
        address_components: addressComponents.components
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card premium-shadow p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter Your Property Address
        </h2>
        <p className="text-gray-600">
          Start typing your address and select from the suggestions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            Property Address *
          </Label>
          <Input
            ref={inputRef}
            id="address"
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder="123 Main Street, City, State 12345"
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            disabled={isLoading}
            autoComplete="off"
          />
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
          {!isMapScriptLoaded && (
            <p className="text-xs text-gray-500 mt-1">
              Loading address suggestions...
            </p>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-xl">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Tip:</span> Start typing your address and select from 
            the dropdown suggestions for the most accurate results.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying Address...
            </>
          ) : (
            "Verify Property"
          )}
        </Button>
      </form>
    </div>
  );
}