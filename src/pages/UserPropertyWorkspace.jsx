
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { properties as propertiesFunction } from "@/api/functions/properties.js";
import { userSpecificAPI } from "@/api/userSpecificFunctions.js";
import { PropertyIntake } from "@/api/entities";
import { User } from "@/api/entities"; 
import { AIInsight } from "@/api/entities"; 
import { Task } from "@/api/entities"; 
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, Bath, Square, Wallet } from 'lucide-react';

import PropertyOverview from "../components/dashboard/PropertyOverview";
import TodoList from "../components/property/TodoList";
import ProgressBar from "../components/property/ProgressBar";
import FilloutFormModal from "../components/property/FilloutFormModal";
import AIInsights from "../components/dashboard/AIInsights"; 
import PlanManagement from "../components/dashboard/PlanManagement";
import HomeBuyingTasks from "../components/property/HomeBuyingTasks";

export default function UserPropertyWorkspace() {
  console.log('🏠 UserPropertyWorkspace component loading...');
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("id");
  console.log('🏠 Property ID from URL:', propertyId); 

  const [property, setProperty] = useState(null);
  const [propertyIntake, setPropertyIntake] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilloutModal, setShowFilloutModal] = useState(false);
  const [filloutFormUrl, setFilloutFormUrl] = useState("");

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await User.me();
      if (!user) {
        navigate("/", { replace: true }); // or "/dashboard" if that’s your post‑login page
        return;
      }
      setCurrentUser(user);

      if (!propertyId || propertyId === 'null') {
        setError("Property ID not found in URL. Please go back to the dashboard and select a property.");
        setIsLoading(false);
        return;
      }

      // Fetch the main property data - use getUserProperties and filter by ID
      // Since propertiesFunction only supports 'create', we need an alternative approach
      const userProperties = await userSpecificAPI.getUserProperties(user.email, user.id);
      const property = userProperties.find(p => p.id === propertyId);
      
      const propertyResponse = property ? 
        { status: 200, data: property } : 
        { status: 404, data: { error: "Property not found or access denied" } };
      
      if (propertyResponse.status === 200 && propertyResponse.data) {
        const fetchedProperty = propertyResponse.data;
        setProperty(fetchedProperty);
        
        // Regular User View: Use the standard SDK filter with created_by
        console.log(`[User] Fetching data for property: ${propertyId}`);
        const userFilter = { property_id: propertyId, created_by: user.email };
        const [intakes, insights, userTasks] = await Promise.all([
          PropertyIntake.filter(userFilter),
          AIInsight.filter(userFilter),
          Task.filter(userFilter)
        ]);
        
        setPropertyIntake(intakes.length > 0 ? intakes[0] : null);
        setAiInsights(insights);
        setTasks(userTasks);
      
      } else {
        setError(propertyResponse.data?.error || "Failed to load property details.");
      }
    } catch (error) {
      console.error("Error loading property workspace:", error);
      const errorStatus = error.response?.status;
      const errorMessage = error.response?.data?.error || error.message;

      if (errorStatus === 401) {
        navigate("/auth", { replace: true });
        return;
      }
      
      if (errorStatus === 403) {
        setError("You do not have permission to view this property.");
      } else if (errorStatus === 404) {
        setError("Property not found.");
      } else {
        setError(errorMessage || "An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]); 

  const handleToggleTask = async (taskField) => {
    if (!property) return;
    try {
      await propertiesFunction({
        operation: 'update',
        recordId: property.id,
        payload: { [taskField]: !property[taskField] }
      });
      loadData(); 
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert(`Could not update task: ${error.message}`);
    }
  };

  const handleToggleIsBuyingHome = async (isBuying) => {
    if (!property) return;

    const originalProperty = property;
    const updatedProperty = { ...property, is_buying_a_home: isBuying };
    setProperty(updatedProperty);

    try {
      await propertiesFunction({
        operation: 'update',
        recordId: property.id,
        payload: { is_buying_a_home: isBuying }
      });
      loadData();
    } catch (error) {
      console.error('Failed to update buying home status:', error);
      alert(`Could not update buying home status: ${error.message}`);
      setProperty(originalProperty);
    }
  };

  const openFilloutForm = (formType) => {
    console.log('🔍 openFilloutForm called with:', formType);
    console.log('🔍 currentUser:', currentUser);
    console.log('🔍 propertyId:', propertyId);
    
    // Add a guard to ensure we have the necessary IDs before generating the URL
    if (!currentUser?.id || !propertyId) {
        console.error('❌ Missing user or property ID');
        alert("Cannot open form: User or Property information is not available yet. Please wait a moment and try again.");
        return;
    }

    let url = "";
    // Base parameters to be appended to all form URLs
    const baseParams = `?app_owner_user_id=${currentUser.id}&property_id=${propertyId}`;

    switch (formType) {
      case 'intake':
        // This is the corrected URL as per your instruction
        url = `https://form.fillout.com/t/fziJ5towSGus${baseParams}`;
        break;
      case 'home_criteria':
        // Assuming this form ID is 'home-criteria' and requires the same parameters
        url = `https://form.fillout.com/t/home-criteria${baseParams}`;
        break;
      case 'financial':
        // Assuming this form ID is 'personal-financial' and requires the same parameters
        url = `https://form.fillout.com/t/personal-financial${baseParams}`;
        break;
      case 'consultation':
        // Assuming this form ID is 'consultation' and requires the same parameters
        url = `https://form.fillout.com/t/consultation${baseParams}`;
        break;
      default:
        // Do not proceed if the form type is unknown
        console.error('❌ Unknown form type:', formType);
        return;
    }
    
    console.log('✅ Setting form URL:', url);
    console.log('✅ Opening modal...');
    setFilloutFormUrl(url);
    setShowFilloutModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Property</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const fallbackImage = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Property Image and Address */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Property Image */}
            <div className="w-full h-64 bg-gray-200 overflow-hidden">
              <img
                src={property.app_image_url || fallbackImage}
                alt={property.app_address || "Property"}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = fallbackImage; }}
              />
            </div>
            
            {/* Property Address and Basic Info */}
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {property.app_address || "Property Address Not Available"}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                {property.app_property_type && (
                  <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {property.app_property_type}
                  </span>
                )}
              </div>
            </div>

            {/* Property Details Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Est. Value</p>
                    <p className="font-bold text-lg text-gray-800">
                      ${property.app_estimated_value?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <BedDouble className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bedrooms</p>
                    <p className="font-bold text-lg text-gray-800">{property.app_bedrooms || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Bath className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Bathrooms</p>
                    <p className="font-bold text-lg text-gray-800">{property.app_bathrooms || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Square className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Sq. Ft.</p>
                    <p className="font-bold text-lg text-gray-800">
                      {property.attom_sell_property_finished_sf?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar property={property} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Property Task List */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Property Task List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TodoList
                  property={property}
                  propertyIntake={propertyIntake}
                  onToggleTask={handleToggleTask}
                  onOpenForm={openFilloutForm}
                />
              </CardContent>
            </Card>

            {/* Home Buying Tasks Section */}
            <HomeBuyingTasks
              property={property}
              onToggleIsBuyingHome={handleToggleIsBuyingHome}
              onOpenForm={openFilloutForm}
              onToggleTask={handleToggleTask}
            />
          </div>
        </div>
      </div>

      {/* Fillout Form Modal */}
      {showFilloutModal && (
        <FilloutFormModal
          isOpen={showFilloutModal}
          onClose={() => setShowFilloutModal(false)}
          formUrl={filloutFormUrl}
        />
      )}
    </div>
  );
}
