
import React, { useState, useEffect } from "react";
import { Signup } from "@/api/entities";
import { User } from "@/api/entities";
import { PropertyIntake } from "@/api/entities";
import { Plus, FileText, Gift } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { properties as propertiesFunction } from "@/api/functions/properties.js";
import { exportConversationLog } from "@/api/functions";
import { getUserReferralId } from "@/api/functions/getUserReferralId.js";
import { syncUserWithAirtable } from "@/api/functions";

import ProjectTile from "../components/dashboard/ProjectTile";
import ReferralModal from "../components/dashboard/ReferralModal";

export default function Dashboard() {
  const [properties, setProperties] = useState([]);
  const [signups, setSignups] = useState([]);
  const [propertyIntakes, setPropertyIntakes] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // State for referral modal
  const [isReferralModalOpen, setIsReferralModal] = useState(false);
  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      if (!currentUser) {
        // Redirect to Home instead of Auth for better UX
        navigate(createPageUrl("Index"));
        return;
      }
      setUser(currentUser);

      // Sync user with Airtable before loading other data
      console.log('[DEBUG] Syncing user with Airtable...');
      try {
        const syncResponse = await syncUserWithAirtable();
        console.log('[DEBUG] Sync response status:', syncResponse?.status);
        if (syncResponse && syncResponse.status === 200) {
          console.log('[DEBUG] User sync successful:', syncResponse.data);
        } else {
          console.warn('[DEBUG] User sync returned non-200 status:', syncResponse?.status);
          // Don't throw error here, continue with loading other data
        }
      } catch (syncError) {
        console.error('[DEBUG] User sync failed, but continuing:', syncError);
        // Continue with loading dashboard data even if sync fails
      }
      
      // Get all user's properties from Airtable using the properties function
      console.log('[DEBUG] Loading properties...');
      const propertiesResponse = await propertiesFunction({ operation: 'list' });

      console.log('[DEBUG] Properties response status:', propertiesResponse?.status);
      console.log('[DEBUG] Properties response data:', propertiesResponse?.data);
      
      // Handle axios response structure
      let userProperties = [];
      
      if (propertiesResponse && propertiesResponse.status === 200 && propertiesResponse.data) {
        const responseData = propertiesResponse.data;
        console.log('[DEBUG] Response data type:', typeof responseData);
        console.log('[DEBUG] Response data is array:', Array.isArray(responseData));
        
        if (responseData.data && Array.isArray(responseData.data)) {
          // Structure: { data: { data: [...] } }
          userProperties = responseData.data;
          console.log('[DEBUG] Using nested data array, length:', userProperties.length);
        } else if (Array.isArray(responseData)) {
          // Structure: { data: [...] }
          userProperties = responseData;
          console.log('[DEBUG] Using direct data array, length:', userProperties.length);
        } else {
          console.error('[DEBUG] Unexpected data structure:', responseData);
        }
      } else {
        console.error('[DEBUG] Invalid response structure or status');
      }
      
      console.log('[DEBUG] Final properties count:', userProperties.length);
      if (userProperties.length > 0) {
        console.log('[DEBUG] Sample property:', userProperties[0]);
      }
      
      setProperties(userProperties);
      
      // Get all user's signups from Base44 DB
      const userSignups = await Signup.filter({ email: currentUser.email });
      setSignups(userSignups);

      // Get all property intakes for the user's properties from Base44 DB
      const propertyIds = userProperties.map(p => p.id).filter(Boolean);
      console.log('[DEBUG] Property IDs for intake lookup:', propertyIds);
      
      const userPropertyIntakes = propertyIds.length > 0 
        ? await PropertyIntake.filter({ property_id: { $in: propertyIds } })
        : [];
      console.log('[DEBUG] Property intakes found:', userPropertyIntakes.length);
      setPropertyIntakes(userPropertyIntakes);
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // More specific error handling
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.error("Authentication error - redirecting to login");
        navigate("/auth?login=true");
      } else {
        alert(`Could not load your dashboard. Reason: ${error.message}. Please try refreshing the page or contact support if the issue persists.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportConversations = async () => {
    try {
      const response = await exportConversationLog();
      if (response && response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'casa-ai-conversations.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Error exporting conversations. Please try again.');
      }
    } catch (error) {
      console.error('Error exporting conversations:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert('Session expired. Please log in again.');
        navigate("/auth?login=true");
      } else {
        alert('Error exporting conversations. Please try again.');
      }
    }
  };

  const handleOpenReferralModal = async () => {
    try {
      const response = await getUserReferralId();
      console.log('[DEBUG] Referral response:', response);

      if (response?.status !== 200 || !response?.data?.referralId) {
        console.error("Could not get referral ID:", response?.data?.error || "ID not found in response");
        alert("Could not generate referral link. Please ensure you are properly logged in and try again.");
        return;
      }
      
      const refId = response.data.referralId;
      const url = `${window.location.origin}${createPageUrl(`Onboarding`)}?ref=${refId}`;
      setReferralLink(url);
      setIsReferralModal(true);

    } catch (error) {
      console.error("Failed to execute referral link generation:", error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert("Session expired. Please log in again.");
        navigate("/auth?login=true");
      } else {
        alert("An unexpected error occurred while generating your referral link. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-900">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to Your Dashboard
                </h1>
                <p className="text-gray-600">
                  {user?.full_name ? `Hello ${user.full_name}! ` : ""}
                  Manage your property listings and track your selling progress.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleOpenReferralModal}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  Get Referral Link
                </Button>
                <Button
                  onClick={handleExportConversations}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export Conversations
                </Button>
              </div>
            </div>
          </div>

          {/* Project Tiles Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Properties</h2>
              <Link to={createPageUrl("Onboarding")}>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:-to-purple-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Property
                </Button>
              </Link>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties && properties.length > 0 ? (
                properties.map((property) => {
                  // Add validation to ensure property has required fields
                  if (!property || !property.id) {
                    console.warn("Skipping property with missing ID:", property);
                    return null;
                  }

                  const relatedSignup = signups.find(signup => signup.property_id === property.id);
                  const completedIntake = propertyIntakes.find(intake => 
                    intake.property_id === property.id && intake.completed
                  );
                  const hasIncompleteIntake = !completedIntake;

                  // Logic to determine if a property is ready to be published
                  const isBuyingHome = property.is_buying_home !== false;
                  const areHomeBuyingTasksComplete = !isBuyingHome || (property.home_criteria_main_completed && property.personal_financial_completed);
                  const isReadyToPublish = !!completedIntake &&
                                           property.photos_completed &&
                                           areHomeBuyingTasksComplete &&
                                           property.consultation_completed;

                  return (
                    <ProjectTile
                      key={property.id}
                      property={property}
                      signup={relatedSignup}
                      hasIncompleteIntake={hasIncompleteIntake}
                      isReadyToPublish={isReadyToPublish}
                    />
                  );
                }).filter(Boolean) // Remove any null entries
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg mb-4">No properties found</p>
                  <Link to={createPageUrl("Onboarding")}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      Add Your First Property
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModal(false)}
        referralUrl={referralLink}
      />
    </>
  );
}
