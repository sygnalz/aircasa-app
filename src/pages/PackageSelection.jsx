import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, Star, Users, Eye, TrendingUp, DollarSign, Shield } from 'lucide-react';

export default function PackageSelection() {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const handleSelectPackage = (packageType) => {
    // For now, show alert with package selection
    // In the future, this would route to checkout or next step
    alert(`Selected: ${packageType} for property ${propertyId}. This would proceed to checkout/next steps.`);
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
            Choose Your Listing Package
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect package to list your property on the MLS and reach qualified buyers.
          </p>
        </div>

        {/* Package Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Package 1: Free Listing */}
          <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Sell Your Home for Free
              </CardTitle>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                $0
                <span className="text-lg font-normal text-gray-600"> commission</span>
              </div>
              <Badge variant="secondary" className="mt-2">Most Popular</Badge>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Full MLS listing with professional photos</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Listing on major real estate websites (Zillow, Realtor.com)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Digital marketing tools and analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Automated buyer communication system</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Contract and document templates</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basic customer support (email/chat)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Transaction coordination assistance</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-4">
                  Perfect for experienced sellers who want full control and maximum savings.
                </p>
                <Button 
                  onClick={() => handleSelectPackage('Free Listing')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base font-medium"
                >
                  Choose Free Listing
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Package 2: Human Review */}
          <Card className="relative border-2 border-green-200 hover:border-green-300 transition-colors bg-gradient-to-br from-green-50 to-white">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-green-600 text-white px-4 py-1">
                <Star className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Sell with Human Review
              </CardTitle>
              <div className="text-3xl font-bold text-green-600 mt-2">
                1%
                <span className="text-lg font-normal text-gray-600"> commission</span>
              </div>
              <Badge variant="outline" className="mt-2 border-green-200 text-green-800">Premium Service</Badge>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700"><strong>Everything in Free Package</strong> plus:</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Dedicated real estate expert review</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Professional pricing strategy consultation</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Market analysis and comparable sales report</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Negotiation assistance and offer review</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority phone support (direct agent line)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Closing support and attorney coordination</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Enhanced marketing and showing coordination</span>
                </div>
              </div>

              <div className="pt-4 border-t border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Peace of Mind Guarantee</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get expert guidance throughout your sale with professional oversight and support.
                </p>
                <Button 
                  onClick={() => handleSelectPackage('Human Review (1%)')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-base font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  Choose Human Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Questions about our packages? <a href="/support" className="text-blue-600 hover:text-blue-700 underline">Contact our support team</a> for personalized assistance.
          </p>
        </div>
      </div>
    </div>
  );
}