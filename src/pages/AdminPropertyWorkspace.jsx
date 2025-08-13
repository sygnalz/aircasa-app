
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { properties as propertiesFunction } from "@/api/functions/properties.js";
import { getIntakeForPropertyAdmin } from "@/api/functions/getIntakeForPropertyAdmin.js";
import { PropertyIntake } from "@/api/entities";
import { User } from "@/api/entities"; 
import { AIInsight } from "@/api/entities"; 
import { Task } from "@/api/entities"; 
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import PropertyOverview from "../components/dashboard/PropertyOverview";
import TodoList from "../components/property/TodoList";
import ProgressBar from "../components/property/ProgressBar";
import FilloutFormModal from "../components/property/FilloutFormModal";
import AIInsights from "../components/dashboard/AIInsights"; 
import PlanManagement from "../components/dashboard/PlanManagement"; 
import AdminPropertyEditor from "../components/admin/AdminPropertyEditor";

export default function AdminPropertyWorkspace() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("id"); 

  const [property, setProperty] = useState(null);
  const [propertyIntake, setPropertyIntake] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilloutModal, setShowFilloutModal] = useState(false);
  const [showHomeCriteriaModal, setShowHomeCriteriaModal] = useState(false);
  const [showFinancialInfoModal, setShowFinancialInfoModal] = useState(false);

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await User.me();
      if (!user) {
        navigate(createPageUrl("Auth"), { replace: true });
        return;
      }

      // Check admin access
      if (user.role !== 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }

      setCurrentUser(user);

      if (!propertyId || propertyId === 'null') {
        setError("Property ID not found in URL. Please go back and select a property.");
        setIsLoading(false);
        return;
      }

      // Fetch the main property data using the secure backend function
      const propertyResponse = await propertiesFunction({ operation: 'get', recordId: propertyId });
      
      if (propertyResponse.status === 200 && propertyResponse.data) {
        const fetchedProperty = propertyResponse.data;
        setProperty(fetchedProperty);
        
        // Admin View: Use the special backend function to bypass ownership rules for intake
        console.log(`[Admin] Fetching intake form for property: ${propertyId}`);
        const intakeResponse = await getIntakeForPropertyAdmin({ property_id: propertyId });
        let propertyIntakeData = null;
        if (intakeResponse?.data?.success && intakeResponse.data.data) {
          propertyIntakeData = intakeResponse.data.data;
          console.log("[Admin] Found intake record:", intakeResponse.data.data);
        } else {
          console.log("[Admin] No intake record found for this property.");
        }

        // For admin, AIInsights and Tasks still come from the filter without created_by
        const adminFilter = { property_id: propertyId };
        const [aiInsightsData, tasksData] = await Promise.all([
          AIInsight.filter(adminFilter),
          Task.filter(adminFilter)
        ]);

        setPropertyIntake(propertyIntakeData);
        setAiInsights(aiInsightsData);
        setTasks(tasksData);
      
      } else {
        setError(propertyResponse.data?.error || "Failed to load property details.");
      }
    } catch (error) {
      console.error("Error loading admin property workspace:", error);
      const errorStatus = error.response?.status;
      const errorMessage = error.response?.data?.error || error.message;

      if (errorStatus === 401) {
        navigate(createPageUrl("Auth"), { replace: true });
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
    const updatedProperty = { ...property, app_is_buying_home: isBuying };
    setProperty(updatedProperty);

    try {
      await propertiesFunction({
        operation: 'update',
        recordId: property.id,
        payload: { 'app_is_buying_home': isBuying }
      });
    } catch (error) {
      console.error('Failed to update "is_buying_home" status:', error);
      alert(`Could not update your home buying status. Please try again.`);
      setProperty(originalProperty);
    }
  };

  const handleSaveAdminChanges = async (propertyUpdates, intakeUpdates) => {
    try {
      // Update property data if there are changes
      if (Object.keys(propertyUpdates).length > 0) {
        const propertyResponse = await propertiesFunction({
          operation: 'update',
          recordId: property.id,
          payload: propertyUpdates
        });
        
        if (propertyResponse.status === 200) {
          setProperty(prev => ({ ...prev, ...propertyUpdates }));
        } else {
          throw new Error("Failed to update property data");
        }
      }

      // Update property intake data if there are changes
      if (propertyIntake && Object.keys(intakeUpdates).length > 0) {
        await PropertyIntake.update(propertyIntake.id, intakeUpdates);
        setPropertyIntake(prev => ({ ...prev, ...intakeUpdates }));
      } else if (!propertyIntake && Object.keys(intakeUpdates).length > 0) {
        const newIntake = await PropertyIntake.create({ ...intakeUpdates, property_id: property.id });
        setPropertyIntake(newIntake);
      }

      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving admin changes:", error);
      throw error;
    }
  };

  const allTasksCompleted = () => {
    if (!property) return false;
    const intakeDone = propertyIntake?.completed || property.property_intake_completed;
    const isBuyingHome = property.app_is_buying_home !== false;
    
    let allDone = intakeDone && property.photos_completed && property.consultation_completed;
    if (isBuyingHome) {
      allDone = allDone && property.home_criteria_main_completed && property.personal_financial_completed;
    }
    return allDone;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <Card className="w-full max-w-md text-center shadow-lg bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">{error}</p>
            <Button onClick={() => navigate(-1)} className="mt-6">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
        <Card className="w-full max-w-md text-center shadow-lg bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Property Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">The requested property could not be found.</p>
            <Button onClick={() => navigate(-1)} className="mt-6">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-slate-900 text-gray-200">
        <div className="max-w-7xl mx-auto">
          {/* Admin Back Button */}
          <div className="flex justify-start mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl("AdminProperties"))}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Properties
            </Button>
          </div>
          
          <ProgressBar property={property} hasCompletedIntake={propertyIntake?.completed} isAdminView={true} />
          
          {/* Admin Property Editor */}
          <div className="mb-6">
            <AdminPropertyEditor
              property={property}
              propertyIntake={propertyIntake}
              onSave={handleSaveAdminChanges}
              isAdminView={true}
            />
          </div>

          {allTasksCompleted() && (
            <div className="flex justify-end mb-4">
              <Link to={createPageUrl(`PublishListing?id=${property.id}`)}>
                <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg animate-pulse">
                  List Property on MLS <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PropertyOverview property={property} currentUser={currentUser} isAdminView={true} />
              <TodoList
                property={property}
                tasks={tasks}
                onToggleTask={handleToggleTask}
                isAdminView={true}
              />
            </div>
            <div className="space-y-6">
              <AIInsights propertyId={property.id} insights={aiInsights} isAdminView={true} />
              <PlanManagement property={property} onToggleBuyingHome={handleToggleIsBuyingHome} isAdminView={true} />
            </div>
          </div>
        </div>
      </div>
      
      {showFilloutModal && (
        <FilloutFormModal 
          isOpen={showFilloutModal} 
          onClose={() => setShowFilloutModal(false)}
          formUrl="https://aircasa.fillout.com/t/7wLgQYgJzKaL"
          propertyId={property.id}
          onFormSubmit={loadData}
        />
      )}
      
      {showHomeCriteriaModal && (
        <FilloutFormModal 
          isOpen={showHomeCriteriaModal} 
          onClose={() => setShowHomeCriteriaModal(false)}
          formUrl="https://aircasa.fillout.com/t/2s6JPLpjWw2F"
          propertyId={property.id}
          onFormSubmit={loadData}
        />
      )}
      
      {showFinancialInfoModal && (
        <FilloutFormModal 
          isOpen={showFinancialInfoModal} 
          onClose={() => setShowFinancialInfoModal(false)}
          formUrl="https://aircasa.fillout.com/t/na3mHkpyGfL5"
          propertyId={property.id}
          onFormSubmit={loadData}
        />
      )}
    </>
  );
}
