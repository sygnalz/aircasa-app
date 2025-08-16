
import React from "react";
import { Check } from "lucide-react";

export default function ProgressBar({ currentStep, isExistingUser }) {
  const allSteps = [
    { number: 1, title: "Property Address" },
    { number: 2, title: "Confirmation" },
    { number: 3, title: "Personal Info" }
  ];

  const steps = isExistingUser ? allSteps.filter(step => step.number !== 3) : allSteps;

  const isStepCompleted = (stepNumber) => {
    // If we are on the final step (2 for existing user) and the previous step (1) should be marked as complete.
    if (isExistingUser && currentStep === 2 && stepNumber === 1) {
      return true;
    }
    return stepNumber < currentStep;
  };

  return (
    <div className="w-full mb-8">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center text-center">
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                isStepCompleted(step.number)
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.number === currentStep 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {isStepCompleted(step.number) ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              <p className={`mt-2 text-xs font-medium w-20 ${
                  step.number <= currentStep ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-colors duration-500 ${
                (steps[index+1].number <= currentStep && step.number < currentStep) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
