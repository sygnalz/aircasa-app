
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Home, Search, MapPin, DollarSign, Calendar } from "lucide-react";
import { properties as propertiesFunction } from "@/api/functions/properties.js";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm]);

  const openPropertyDetails = (propertyId) => {
    // Changed from window.open to navigate to open in the same tab,
    // and added 'from=admin' query parameter as per outline.
    navigate(createPageUrl(`PropertyWorkspace?id=${propertyId}&from=admin`));
  };

  const checkAdminAccess = async () => {
    try {
      const user = await User.me();
      if (!user || user.role !== 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
        return;
      }
      loadAllProperties();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate(createPageUrl("Auth"), { replace: true });
    }
  };

  const loadAllProperties = async () => {
    try {
      // For admin, we need to modify the properties function to get ALL properties, not just user's
      // For now, we'll use a workaround by calling the function without user filtering
      // This would ideally be a separate admin-only endpoint
      const response = await propertiesFunction({ operation: 'admin_list_all' });
      
      if (response && response.status === 200 && response.data) {
        const propertiesData = response.data.data || response.data;
        setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      } else {
        console.error("Failed to load properties:", response);
        setProperties([]);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
      alert("Failed to load properties. Please try again.");
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = properties;

    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(property => {
        // Construct full name for searching
        const ownerFullName = [property.app_first_name, property.app_last_name]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return (
          property.app_address?.toLowerCase().includes(lowercasedSearchTerm) ||
          property.attom_sell_property_address_street?.toLowerCase().includes(lowercasedSearchTerm) ||
          ownerFullName.includes(lowercasedSearchTerm)
        );
      });
    }

    setFilteredProperties(filtered);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-white">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate(createPageUrl("AdminPanel"))}
                className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Panel
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">All Properties</h1>
                <p className="text-gray-400">Review and manage all property listings</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{filteredProperties.length}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by address or owner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        <div className="grid gap-6">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Card key={property.id} className="bg-slate-800 border-slate-700 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Property Image */}
                    <div className="lg:w-64 h-48 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={property.app_image_url || property.attom_image_url || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
                        alt="Property" 
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                          e.target.src = "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
                        }}
                      />
                    </div>

                    {/* Property Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {property.app_address || property.attom_sell_property_address_street || 'Address Not Available'}
                          </h3>
                          <div className="flex items-center text-gray-400 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              {[
                                property.attom_sell_property_address_city,
                                property.attom_sell_property_address_state,
                                property.attom_sell_property_address_zip
                              ].filter(Boolean).join(', ') || 'Location N/A'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Owner: {[property.app_first_name, property.app_last_name].filter(Boolean).join(' ') || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400 mb-1">
                            {formatCurrency(property.app_estimated_value)}
                          </div>
                          <p className="text-xs text-gray-500">Estimated Value</p>
                        </div>
                      </div>

                      {/* Property Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">{property.app_bedrooms || 'N/A'}</div>
                          <div className="text-xs text-gray-400">Bathrooms</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">{property.app_bathrooms || 'N/A'}</div>
                          <div className="text-xs text-gray-400">Bedrooms</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">
                            {property.attom_sell_property_finished_sf ? property.attom_sell_property_finished_sf.toLocaleString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">Sq Ft</div>
                        </div>
                        <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                          <div className="text-lg font-semibold text-white">
                            {property.attom_sell_property_year_built || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">Year Built</div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {property.app_property_type || 'Unknown Type'}
                          </Badge>
                          {property.app_is_buying_home && (
                            <Badge className="bg-green-100 text-green-800">
                              Also Buying
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                          onClick={() => openPropertyDetails(property.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-12 text-center">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Properties Found</h3>
                <p className="text-gray-400">No properties match your current search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
