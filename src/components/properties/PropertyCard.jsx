import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Star,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
} from 'lucide-react';

const PropertyCard = ({ property, onView, onEdit, onDelete }) => {
  const {
    id,
    title = 'Beautiful Property',
    location = 'Location not specified',
    price = 0,
    bedrooms = 0,
    bathrooms = 0,
    area = 0,
    rating = 0,
    reviews = 0,
    status = 'active',
    images = [],
    bookings = 0,
    revenue = 0,
  } = property;

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    maintenance: 'bg-red-100 text-red-800 border-red-200',
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const primaryImage = images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80';

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Property Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
        <img
          src={primaryImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(property)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(property)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Property
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(property)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-md">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">{rating.toFixed(1)}</span>
            {reviews > 0 && (
              <span className="text-xs text-muted-foreground">({reviews})</span>
            )}
          </div>
        )}
      </div>

      {/* Property Details */}
      <CardHeader className="pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg leading-6 line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-3 w-3" />
            {location}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Property Features */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          {bedrooms > 0 && (
            <div className="flex items-center">
              <Bed className="mr-1 h-4 w-4" />
              {bedrooms} bed{bedrooms !== 1 ? 's' : ''}
            </div>
          )}
          {bathrooms > 0 && (
            <div className="flex items-center">
              <Bath className="mr-1 h-4 w-4" />
              {bathrooms} bath{bathrooms !== 1 ? 's' : ''}
            </div>
          )}
          {area > 0 && (
            <div className="flex items-center">
              <Square className="mr-1 h-4 w-4" />
              {area.toLocaleString()} sq ft
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-xs">Bookings</span>
            </div>
            <div className="font-semibold">{bookings}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4 mr-1" />
              <span className="text-xs">Revenue</span>
            </div>
            <div className="font-semibold">{formatPrice(revenue)}</div>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-primary">
              {formatPrice(price)}
            </div>
            <div className="text-xs text-muted-foreground">per night</div>
          </div>
          <Button
            onClick={() => onView?.(property)}
            className="hover:shadow-md transition-shadow"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
