import React from "react";
import { BedDouble, Bath, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PropertyOverview({ property, currentUser, isAdminView = false }) {
  if (!property) return null;

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `$${Number(value).toLocaleString()}`;
  };

  return (
    <Card className={`shadow-lg rounded-2xl ${isAdminView ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white'}`}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className={`text-2xl font-bold ${isAdminView ? 'text-white' : 'text-gray-900'}`}>
            {property.app_address || 'Property Address Not Available'}
          </CardTitle>
          <CardDescription className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>
            Property owned by {isAdminView ? (property.app_first_name + ' ' + property.app_last_name) : 'you'}.
          </CardDescription>
        </div>
        <Badge variant="outline" className={isAdminView ? 'border-blue-400 text-blue-400' : 'border-blue-600 text-blue-600'}>
          {property.app_property_type || 'N/A'}
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg text-center ${isAdminView ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
          <p className="text-sm text-gray-400">Est. Value</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(property.app_estimated_value)}</p>
        </div>
        <div className={`p-4 rounded-lg text-center ${isAdminView ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
          <BedDouble className="w-5 h-5 mx-auto text-gray-400 mb-1" />
          <p className="text-lg font-semibold">{property.app_bedrooms || 'N/A'}</p>
          <p className="text-xs text-gray-500">Bedrooms</p>
        </div>
        <div className={`p-4 rounded-lg text-center ${isAdminView ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
          <Bath className="w-5 h-5 mx-auto text-gray-400 mb-1" />
          <p className="text-lg font-semibold">{property.app_bathrooms || 'N/A'}</p>
          <p className="text-xs text-gray-500">Bathrooms</p>
        </div>
        <div className={`p-4 rounded-lg text-center ${isAdminView ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
          <Ruler className="w-5 h-5 mx-auto text-gray-400 mb-1" />
          <p className="text-lg font-semibold">
            {property.attom_sell_property_finished_sf ? property.attom_sell_property_finished_sf.toLocaleString() : 'N/A'}
          </p>
          <p className="text-xs text-gray-500">Sq. Ft.</p>
        </div>
      </CardContent>
    </Card>
  );
}