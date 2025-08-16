import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";

export default function Step4PricingPlan({ onNext, onBack, initialData }) {
  const [selectedPlan, setSelectedPlan] = useState(initialData?.pricing_plan || "");
  const [error, setError] = useState("");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$399",
      icon: Star,
      color: "from-blue-500 to-purple-600",
      popular: false,
      features: [
        "MLS Listing",
        "Basic AI Pricing",
        "Standard Documents",
        "Email Support",
        "Basic Market Analysis"
      ]
    },
    {
      id: "plus",
      name: "Plus",
      price: "$699",
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      popular: true,
      features: [
        "Everything in Basic",
        "Advanced AI Pricing",
        "Premium Documents",
        "Priority Support",
        "Detailed Market Analysis",
        "Professional Photos",
        "Social Media Marketing"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "$999",
      icon: Crown,
      color: "from-yellow-500 to-orange-600",
      popular: false,
      features: [
        "Everything in Plus",
        "Expert AI Insights",
        "Custom Documents",
        "24/7 Support",
        "Comprehensive Analysis",
        "Virtual Tours",
        "Dedicated Success Manager",
        "Legal Review"
      ]
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!selectedPlan) {
      setError("Please select a pricing plan");
      return;
    }

    onNext({ pricing_plan: selectedPlan });
  };

  return (
    <div className="glass-card premium-shadow p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that best fits your needs
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <div className="text-3xl font-bold text-gray-900 mt-2">{plan.price}</div>
                  <p className="text-sm text-gray-500">One-time fee</p>
                </div>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                    selectedPlan === plan.id
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedPlan === plan.id && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="bg-yellow-50 p-4 rounded-xl">
          <p className="text-sm text-yellow-800">
            <span className="font-medium">Money-back guarantee:</span> If you're not satisfied 
            with our service, we'll refund your money within 30 days.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            className="flex-1 py-4 rounded-xl font-semibold border-2 hover:bg-gray-50"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Complete Sign-Up
          </Button>
        </div>
      </form>
    </div>
  );
}