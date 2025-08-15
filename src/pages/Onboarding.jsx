
import React, { useState, useEffect } from "react";
import { Signup } from "@/api/entities";
import { User } from "@/api/entities";
import { Core } from "@/api/integrations";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { properties as propertiesFunction } from "@/api/functions/properties.js";

import ProgressBar from "../components/signup/ProgressBar";
import Step1PropertyAddress from "../components/signup/Step1PropertyAddress";
import Step2PropertyConfirmation from "../components/signup/Step2PropertyConfirmation";
import Step3PersonalInfo from "../components/signup/Step3PersonalInfo";
// Step4PricingPlan is removed

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Capture referral ID from URL
    const referralId = searchParams.get('ref');
    if (referralId) {
      setSignupData(prev => ({ ...prev, referred_by: referralId }));
    }

    const fetchUser = async () => {
      try {
        const user = await User.me();
        if (user) {
          setCurrentUser(user);
          const nameParts = user.full_name?.split(' ') || [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setSignupData(prev => ({
            ...prev,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            phone: user.phone_number || "" // Pre-fill phone if available, otherwise keep empty
          }));
        }
      } catch (error) {
        // Not logged in, proceed as a new user
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, [searchParams]);

  const handleStepNext = (stepData) => {
    const newSignupData = { ...signupData, ...stepData };
    setSignupData(newSignupData);

    // For existing users, skip from step 2 (confirmation) directly to final submission
    if (currentUser && currentStep === 2) {
      handleFinalSubmit(newSignupData);
    } else if (currentStep === 2) {
      // For new users, go from step 2 to step 3 (personal info)
      setCurrentStep(3);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleStepBack = () => {
    // For existing users, from step 2 can only go back to step 1
    if (currentUser && currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      // For new users, from step 3 (personal info) go back to step 2 (confirmation)
      setCurrentStep(2);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalSubmit = async (finalStepData) => {
    setIsSubmitting(true);
    
    try {
      const completeData = { ...signupData, ...finalStepData };

      // Save phone number to the Base44 User entity first if provided
      if (completeData.phone) {
        await User.updateMyUserData({ phone_number: completeData.phone });
      }
      
      const propertyResponse = await propertiesFunction({
        operation: 'create',
        payload: {
          address: completeData.property_address,
          street: get(completeData.property_data, 'street', ''),
          city: get(completeData.property_data, 'city', ''),
          state: get(completeData.property_data, 'state', ''),
          zip_code: get(completeData.property_data, 'zip_code', ''),
          property_type: get(completeData.property_data, 'property_type', 'Single Family'),
          bedrooms: get(completeData.property_data, 'bedrooms'),
          bathrooms: get(completeData.property_data, 'bathrooms'),
          square_feet: get(completeData.property_data, 'square_feet'),
          lot_size: get(completeData.property_data, 'lot_size'),
          year_built: get(completeData.property_data, 'year_built'),
          estimated_value: get(completeData.property_data, 'estimated_value'),
          image_url: get(completeData.property_data, 'image_url', ''),
          mls_verified: get(completeData.property_data, 'mls_verified', false),
          is_buying_home: true,
          first_name: completeData.first_name,
          last_name: completeData.last_name,
          email: completeData.email,
          phone: completeData.phone,
          referred_by: completeData.referred_by || null,
        }
      });
      
      if (!propertyResponse || !propertyResponse.data) {
          throw new Error("Failed to create property record. The response was empty.");
      }

      console.log('✅ Property created in Onboarding:', propertyResponse);

      // Property creation is successful - signup tracking removed as property is primary record

      // Email notification - temporarily disabled as Core.SendEmail not implemented
      // TODO: Implement email notification service
      /* 
      await Core.SendEmail({
        to: completeData.email,
        subject: "Welcome to AirCasa - Your Property is Ready!",
        body: `Hello ${completeData.first_name},\n\nWe're excited to help you with your property at ${completeData.property_address}.\n\nYour property has been added to your dashboard. You can complete the setup tasks and choose your plan from there.\n\nBest regards,\nThe AirCasa Team`
      });
      */

      console.log('🎉 Onboarding completed successfully! Property created and user redirecting to dashboard.');

      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Signup process failed:", error);
      alert(`Error completing signup:\n\n${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const get = (obj, path, defaultValue = null) => {
    const travel = (regexp) =>
      String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[\.\/]+/);
    return result === undefined || result === null ? defaultValue : result;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1PropertyAddress 
            onNext={handleStepNext} 
            initialData={signupData}
          />
        );
      case 2:
        return (
          <Step2PropertyConfirmation 
            onNext={handleStepNext} 
            onBack={handleStepBack}
            signupData={signupData}
          />
        );
      case 3:
        return (
          <Step3PersonalInfo 
            onNext={handleFinalSubmit} // This is now the final step for new users
            onBack={handleStepBack}
            initialData={signupData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add a New Property
          </h1>
          <p className="text-gray-600">
            {currentUser 
              ? "Complete the following steps to add your new property."
              : "Get started with AI-powered home selling in just 3 steps" // Changed from 4 to 3 steps
            }
          </p>
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={3} isExistingUser={!!currentUser} /> {/* Changed totalSteps to 3 */}
        
        <div className="transition-all duration-500">
          {renderCurrentStep()}
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-900">Creating your account...</p>
              <p className="text-gray-600 mt-2">This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
