import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Zap, UserCheck, MessageSquare } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PublishListing() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');
  const navigate = useNavigate();
  const notSureCount = 5; // Placeholder for the actual number of "I'm not sure" answers

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
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
            Final Step: Choose Your Publishing Option
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your listing is ready. Select how you'd like to proceed to the MLS.
          </p>
        </div>

        {/* Recommendation Chat Box */}
        <div className="mb-10 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl flex items-start gap-4 shadow-lg">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white"/>
            </div>
            <div>
                <h3 className="font-bold text-blue-800 text-lg">A Quick Recommendation...</h3>
                <p className="text-blue-700 mt-1">
                    It looks like you've answered "I'm Not Sure" to <strong>{notSureCount} questions</strong> during the intake process. For the best results and to avoid potential issues, we strongly recommend a human review of your information and offers for just 1% of the sale price.
                </p>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Option 1: Publish with AI */}
          <Card className="w-full glass-card premium-shadow rounded-2xl flex flex-col transition-all duration-300 hover:ring-2 hover:ring-blue-400">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">Publish with AI</CardTitle>
              <p className="text-4xl font-bold text-gray-900 mt-2">Free</p>
              <p className="text-sm text-gray-500">Instant MLS Listing</p>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-center text-gray-600">
                    Our AI will perform a final check and publish your listing directly to the MLS. This option is fast and automated.
                </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full font-semibold py-3 rounded-xl shadow-lg border-2"
                onClick={() => console.log("Publishing with AI for property:", propertyId)}
              >
                Choose AI Publish
              </Button>
            </CardFooter>
          </Card>
          
          {/* Option 2: List with Human Review */}
          <Card className="w-full glass-card premium-shadow rounded-2xl flex flex-col ring-2 ring-blue-500 border-blue-500 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">List with Human Review</CardTitle>
              <p className="text-4xl font-bold text-blue-600 mt-2">1%</p>
              <p className="text-sm text-gray-500">Of Final Sale Price</p>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-center text-gray-600">
                    One of our licensed real estate experts will personally review your entire listing, suggest improvements, and handle the publishing process for you.
                </p>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-lg"
                onClick={() => console.log("Publishing with Human Review for property:", propertyId)}
              >
                Choose Human Review
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}