import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Zap } from "lucide-react";

export default function PlanManagement({ property, onToggleBuyingHome, isAdminView }) {
  if (!property) return null;

  const isBuying = !!(isAdminView ? property.app_is_buying_home : property.is_buying_a_home);

  const cardClasses = isAdminView
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white shadow-sm";
  
  const titleClasses = isAdminView ? "text-white" : "text-gray-900";
  const textClasses = isAdminView ? "text-gray-300" : "text-gray-600";

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle className={`flex items-center ${titleClasses}`}>
          <Home className="w-5 h-5 mr-2" />
          Home Buying Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isBuying ? (
          <div className={`mt-4 p-4 rounded-lg ${isAdminView ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-2 ${titleClasses}`}>Next Steps:</h4>
            <ul className={`list-disc list-inside space-y-1 text-sm ${textClasses}`}>
              <li>Complete Home Buying Criteria form.</li>
              <li>Provide financial information for pre-approval.</li>
              <li>Get connected with a partner agent.</li>
            </ul>
          </div>
        ) : (
          <div className={`mt-4 p-4 rounded-lg text-center ${isAdminView ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
            <p className={`${textClasses}`}>
              This option is not currently enabled for this property.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}