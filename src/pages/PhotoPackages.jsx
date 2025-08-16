import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star, Camera, Zap, Crown } from 'lucide-react';

export default function PhotoPackages() {
  const { propertyId } = useParams();

  const handleSelectPackage = (packageName, price) => {
    // For now, show alert with package selection
    // In the future, this would route to booking/checkout
    alert(`Selected: ${packageName} for $${price}. This would proceed to booking/scheduling.`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            to={`/property/${propertyId}`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Property Details
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Professional Photo Packages
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a package that best showcases your property and attracts more buyers.
          </p>
        </div>

        {/* Package Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Standard Package */}
          <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Standard Package
              </CardTitle>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                $149
              </div>
              <p className="text-sm text-gray-600 mt-1">One-time payment</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Up to 25 High-Resolution Photos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Professional Editing & Color Correction</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Interior & Exterior Shots</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">24-48 Hour Turnaround</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => handleSelectPackage('Standard Package', '149')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-base font-medium"
                >
                  Select Package
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Premium Package */}
          <Card className="relative border-2 border-purple-200 hover:border-purple-300 transition-colors bg-gradient-to-br from-purple-50 to-white">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Premium Package
              </CardTitle>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                $199
              </div>
              <p className="text-sm text-gray-600 mt-1">One-time payment</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Includes all Standard benefits</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Up to 40 High-Resolution Photos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Aerial/Drone Photography (3-5 shots)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Twilight Exterior Shot (1 photo)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Virtual Staging (1 room)</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => handleSelectPackage('Premium Package', '199')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Select Package
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ultimate Package */}
          <Card className="relative border-2 border-orange-200 hover:border-orange-300 transition-colors bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Ultimate Package
              </CardTitle>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                $249
              </div>
              <p className="text-sm text-gray-600 mt-1">One-time payment</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Includes all Premium benefits</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Up to 60 High-Resolution Photos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">3D Matterport Virtual Tour</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Schematic Floor Plans</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">Property Website Showcase</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => handleSelectPackage('Ultimate Package', '249')}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-2.5 text-base font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  Select Package
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Professional Photography Guarantee</span>
            </div>
            <p className="text-sm text-blue-800">
              All packages include professional photography by certified real estate photographers with satisfaction guarantee.
            </p>
          </div>
          
          <p className="text-sm text-gray-600">
            Questions about our packages? <a href="/support" className="text-blue-600 hover:text-blue-700 underline">Contact our support team</a> for personalized assistance.
          </p>
        </div>
      </div>
    </div>
  );
}