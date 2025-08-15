import React, { useEffect, useState } from 'react';
import { properties } from '@/api/functions';
import { userSpecificAPI } from '../api/userSpecificFunctions';
import { useAuth } from '../contexts/AuthContext';
import { debugUserProperties } from '../utils/debugProperties';
import { testAirtableConnection } from '../utils/testAirtable';
// import AuthDebug from '../components/debug/AuthDebug'; // Removed for production
import PropertyCard from '@/components/properties/PropertyCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Grid3X3,
  List,
  RefreshCw,
  Building2,
  MapPin,
  DollarSign,
} from 'lucide-react';

// Sample data for demonstration
const sampleProperties = [
  {
    id: 1,
    title: 'Luxury Beachfront Villa',
    location: 'Miami Beach, FL',
    price: 450,
    bedrooms: 4,
    bathrooms: 3,
    area: 2500,
    rating: 4.8,
    reviews: 127,
    status: 'active',
    bookings: 23,
    revenue: 12500,
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80'],
  },
  {
    id: 2,
    title: 'Modern Downtown Apartment',
    location: 'Seattle, WA',
    price: 180,
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    rating: 4.6,
    reviews: 89,
    status: 'active',
    bookings: 31,
    revenue: 8900,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=500&q=80'],
  },
  {
    id: 3,
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, CO',
    price: 320,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    rating: 4.9,
    reviews: 156,
    status: 'maintenance',
    bookings: 18,
    revenue: 7200,
    images: ['https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=500&q=80'],
  },
  {
    id: 4,
    title: 'Historic Brownstone',
    location: 'Boston, MA',
    price: 275,
    bedrooms: 3,
    bathrooms: 2,
    area: 1600,
    rating: 4.4,
    reviews: 73,
    status: 'active',
    bookings: 15,
    revenue: 5500,
    images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=500&q=80'],
  },
  {
    id: 5,
    title: 'Desert Oasis Retreat',
    location: 'Scottsdale, AZ',
    price: 380,
    bedrooms: 4,
    bathrooms: 4,
    area: 2200,
    rating: 4.7,
    reviews: 92,
    status: 'pending',
    bookings: 8,
    revenue: 3800,
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=500&q=80'],
  },
];

export default function PropertiesPage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  async function load() {
    if (!isAuthenticated || !user?.email) {
      console.log('⚠️ User not authenticated, cannot load properties');
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      console.log(`🔄 Loading properties for user: ${user.email} (ID: ${user.id})`);
      
      // First, let's test direct Airtable connection
      console.log('🧪 Testing Airtable connection...');
      const airtableTest = await testAirtableConnection();
      console.log('🧪 Airtable test result:', airtableTest);
      
      // Try to get all properties first to see what's available
      console.log('🔄 Loading all properties to inspect data...');
      const allPropertiesData = await properties.list();
      console.log('📊 All properties response:', allPropertiesData);
      
      if (allPropertiesData?.items && Array.isArray(allPropertiesData.items)) {
        console.log(`📄 Found ${allPropertiesData.items.length} total properties in system`);
        
        // Log first few properties to see structure
        allPropertiesData.items.slice(0, 3).forEach((prop, index) => {
          console.log(`🏠 Property ${index + 1} structure:`, {
            id: prop.id,
            title: prop.title,
            ownerEmail: prop.ownerEmail,
            app_email: prop.app_email,
            app_owner_user_id: prop.app_owner_user_id,
            allFields: Object.keys(prop)
          });
        });
        
        // Filter for current user
        const userProperties = allPropertiesData.items.filter(property => {
          const userMatch = (
            property.ownerEmail === user.email ||
            property.app_email === user.email ||
            property.app_owner_user_id === user.id
          );
          
          if (userMatch) {
            console.log('✅ Found matching property:', {
              title: property.title,
              matchedBy: property.ownerEmail === user.email ? 'ownerEmail' : 
                        property.app_email === user.email ? 'app_email' : 'app_owner_user_id'
            });
          }
          
          return userMatch;
        });
        
        console.log(`🎯 Found ${userProperties.length} properties for user ${user.email}`);
        setItems(userProperties);
        
        if (userProperties.length === 0) {
          console.log('🔍 No user-specific properties found. Checking for any email matches...');
          const emailMatches = allPropertiesData.items.filter(prop => 
            JSON.stringify(prop).toLowerCase().includes(user.email.toLowerCase())
          );
          console.log(`📧 Properties containing user email: ${emailMatches.length}`);
        }
      } else {
        console.log('⚠️ No properties data received or invalid format');
        setItems([]);
        setError('No properties data available');
      }
      
    } catch (err) {
      console.error('❌ Error loading properties:', err);
      setError(`Failed to load properties: ${err.message}`);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      load();
    }
  }, [isAuthenticated, user]);

  // Filter and sort properties
  console.log('🔍 Filtering properties:', {
    totalItems: items.length,
    searchQuery,
    statusFilter,
    firstItem: items[0] ? Object.keys(items[0]) : 'No items'
  });

  const filteredProperties = items
    .filter(property => {
      console.log('🏠 Checking property for filters:', {
        id: property.id,
        title: property.title,
        name: property.name,
        status: property.status,
        hasTitle: !!property.title,
        hasName: !!property.name,
        allFields: Object.keys(property).slice(0, 10) // First 10 fields
      });

      const matchesSearch = searchQuery === '' || 
                           property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           property.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      
      console.log('🎯 Filter results:', { matchesSearch, matchesStatus });
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'revenue':
          return (b.revenue || 0) - (a.revenue || 0);
        default:
          return (a.title || '').localeCompare(b.title || '');
      }
    });

  const handlePropertyView = (property) => {
    console.log('View property:', property);
    // TODO: Navigate to property detail page
  };

  const handlePropertyEdit = (property) => {
    console.log('Edit property:', property);
    // TODO: Navigate to property edit page
  };

  const handlePropertyDelete = (property) => {
    console.log('Delete property:', property);
    // TODO: Show delete confirmation dialog
  };

  const statusCounts = {
    all: items.length,
    active: items.filter(p => p.status === 'active').length,
    inactive: items.filter(p => p.status === 'inactive').length,
    pending: items.filter(p => p.status === 'pending').length,
    maintenance: items.filter(p => p.status === 'maintenance').length,
  };

  const totalRevenue = items.reduce((sum, property) => sum + (property.revenue || 0), 0);
  const averagePrice = items.length > 0 
    ? items.reduce((sum, property) => sum + (property.price || 0), 0) / items.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Properties</h1>
          <p className="text-muted-foreground">
            Manage your rental properties and track their performance
          </p>
          {user?.email && (
            <p className="text-sm text-muted-foreground">
              Showing properties for: {user.email}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={load} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price/Night</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Math.round(averagePrice)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="active">Active ({statusCounts.active})</SelectItem>
              <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
              <SelectItem value="maintenance">Maintenance ({statusCounts.maintenance})</SelectItem>
              <SelectItem value="inactive">Inactive ({statusCounts.inactive})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Name (A-Z)</SelectItem>
              <SelectItem value="price-high">Price (High-Low)</SelectItem>
              <SelectItem value="price-low">Price (Low-High)</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none border-r"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔍 Loading Debug Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>User Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>Items Count:</strong> {items.length}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
            <p><strong>Authentication:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              Error: {error}
            </div>
          </CardContent>
        </Card>
      )}

      {!error && filteredProperties.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No properties found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Get started by adding your first property'}
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Property
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Property Data (Debug) */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 Raw Property Data (Debug)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((property, index) => (
                <div key={property.id || index} className="border p-4 rounded">
                  <h4 className="font-medium">Property {index + 1}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div><strong>ID:</strong> {property.id}</div>
                    <div><strong>Title:</strong> {property.title || 'N/A'}</div>
                    <div><strong>Name:</strong> {property.name || 'N/A'}</div>
                    <div><strong>Status:</strong> {property.status || 'N/A'}</div>
                    <div><strong>Location:</strong> {property.location || 'N/A'}</div>
                    <div><strong>app_email:</strong> {property.app_email || 'N/A'}</div>
                    <div><strong>Fields Count:</strong> {Object.keys(property).length}</div>
                    <div><strong>Sample Fields:</strong> {Object.keys(property).slice(0, 5).join(', ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties Grid/List */}
      {filteredProperties.length > 0 && (
        <div className={viewMode === 'grid' 
          ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
          : 'space-y-4'
        }>
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={handlePropertyView}
              onEdit={handlePropertyEdit}
              onDelete={handlePropertyDelete}
            />
          ))}
        </div>
      )}

      {filteredProperties.length === 0 && items.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-yellow-600">
              <p><strong>Debug:</strong> {items.length} properties loaded but {filteredProperties.length} after filtering</p>
              <p>Check console for filtering details</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Load More / Pagination would go here */}
      {filteredProperties.length > 0 && (
        <div className="flex justify-center pt-8">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProperties.length} of {items.length} properties
          </p>
        </div>
      )}
    </div>
  );
}