import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, ArrowLeft, Star, Zap, Crown } from 'lucide-react';
import { createPageUrl } from '@/utils';

const packages = [
  {
    name: 'Standard Package',
    price: '$149',
    icon: Star,
    color: 'from-blue-500 to-purple-600',
    features: [
      'Up to 25 High-Resolution Photos',
      'Professional Editing & Color Correction',
      'Interior & Exterior Shots',
      '24-48 Hour Turnaround',
    ],
  },
  {
    name: 'Premium Package',
    price: '$199',
    icon: Zap,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Includes all Standard benefits',
      'Up to 40 High-Resolution Photos',
      'Aerial/Drone Photography (3-5 shots)',
      'Twilight Exterior Shot (1 photo)',
      'Virtual Staging (1 room)',
    ],
    popular: true,
  },
  {
    name: 'Ultimate Package',
    price: '$249',
    icon: Crown,
    color: 'from-yellow-500 to-orange-600',
    features: [
      'Includes all Premium benefits',
      'Up to 60 High-Resolution Photos',
      '3D Matterport Virtual Tour',
      'Schematic Floor Plans',
      'Property Website Showcase',
    ],
  },
];

export default function PhotoPackages() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <Link to={createPageUrl(`PropertyWorkspace?id=${propertyId}`)}>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Workspace
              </Button>
            </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Professional Photo Packages
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a package that best showcases your property and attracts more buyers.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.name}
                className={`w-full glass-card premium-shadow rounded-2xl flex flex-col transition-all duration-300 hover:scale-105 ${
                  pkg.popular ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${pkg.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{pkg.price}</p>
                  <p className="text-sm text-gray-500">One-time payment</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-4">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg`}
                  >
                    Select Package
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}