
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { Home, AlertTriangle, CheckCircle, Clock, ExternalLink, Eye } from "lucide-react";

export default function ProjectTile({ property, signup, hasIncompleteIntake, isReadyToPublish }) {
  if (!property) {
    return (
      <Card className="glass-card premium-shadow">
        <CardContent className="p-6">
          <p className="text-gray-500">Property data not available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusInfo = () => {
    if (isReadyToPublish) {
      return {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        status: "Ready to Publish",
        description: "All tasks completed. Ready for MLS listing."
      };
    } else if (hasIncompleteIntake) {
      return {
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        status: "Needs Attention",
        description: "Property intake form needs to be completed."
      };
    } else {
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        status: "In Progress",
        description: "Setup tasks in progress."
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  // Ensure property ID exists before creating URLs
  const propertyId = property.id;
  if (!propertyId) {
    console.error("Property missing ID:", property);
    return (
      <Card className="glass-card premium-shadow">
        <CardContent className="p-6">
          <p className="text-red-500">Error: Property ID missing</p>
        </CardContent>
      </Card>
    );
  }
  
  const fallbackImage = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";

  return (
    <Card className={`glass-card premium-shadow ${statusInfo.borderColor} border-2 hover:shadow-lg transition-all duration-300 flex flex-col`}>
      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={property.app_image_url || fallbackImage} 
            alt="Property" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.src = fallbackImage; }}
          />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <CardTitle className="text-lg text-gray-900 break-words hyphens-auto leading-tight">
              {property.app_address || property.address || 'Address not available'}
            </CardTitle>
          </div>
          <StatusIcon className={`w-5 h-5 ${statusInfo.color} flex-shrink-0 ml-2`} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 flex-grow flex flex-col justify-between">
        <div>
            <div className={`p-3 rounded-lg ${statusInfo.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium text-sm ${statusInfo.color}`}>
                    {statusInfo.status}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {statusInfo.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Property Type:</span>
                <span className="font-medium text-gray-900">
                  {property.app_property_type || property.property_type || 'N/A'}
                </span>
              </div>
              {property.app_estimated_value && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Value:</span>
                  <span className="font-medium text-gray-900">
                    ${Number(property.app_estimated_value).toLocaleString()}
                  </span>
                </div>
              )}
              {signup?.pricing_plan && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Plan:</span>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {signup.pricing_plan.charAt(0).toUpperCase() + signup.pricing_plan.slice(1)}
                  </Badge>
                </div>
              )}
            </div>
        </div>

        <div className="flex gap-2 pt-3 border-t mt-4">
          <Link to={createPageUrl(`PropertyWorkspace?id=${propertyId}`)} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          {isReadyToPublish && (
            <Link to={createPageUrl(`PublishListing?id=${propertyId}`)} className="flex-1">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
