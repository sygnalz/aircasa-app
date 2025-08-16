import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, Home } from 'lucide-react';

export function PropertyTile({ property }) {
  // Get property image from app_image_url field (prioritized) or fallback to images array
  const propertyImage = property.app_image_url || (property.images && property.images.length > 0 
    ? (Array.isArray(property.images[0]) ? property.images[0][0]?.url : property.images[0])
    : null);

  // Format price/estimated value
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine if property needs attention (could be based on various factors)
  const needsAttention = (!property.app_image_url && (!property.images || property.images.length === 0)) || !property.description;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Property Image */}
      <div className="relative h-48 bg-gray-100">
        {propertyImage ? (
          <img 
            src={propertyImage} 
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Home className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        {needsAttention && (
          <div className="absolute top-3 left-3">
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Needs Attention
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Property Address */}
        <div className="flex items-start gap-2 mb-2">
          <Home className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-sm leading-tight">
              {property.location || property.title || 'Property Address'}
            </h3>
            {needsAttention && (
              <p className="text-xs text-red-600 mt-1">
                Property intake form needs to be completed.
              </p>
            )}
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Property Type:</span>
            <span className="font-medium">{property.propertyType || 'SINGLE FAMILY RESIDENCE'}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600">Estimated Value:</span>
            <span className="font-medium">{formatCurrency(property.marketValue || property.price)}</span>
          </div>
        </div>

        {/* View Details Button */}
        <Link to={`/property/${property.id}`}>
          <Button className="w-full" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}