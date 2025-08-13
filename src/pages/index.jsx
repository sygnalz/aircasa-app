
import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Zap, Shield, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/api/entities";

export default function Home() {
  const navigate = useNavigate();

  // If user is already logged in, redirect them to dashboard
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await User.me();
        if (currentUser) {
          navigate(createPageUrl("Dashboard"));
        }
      } catch (error) {
        // User not logged in, stay on marketing page
        // console.error("User not logged in:", error); // Optional: for debugging
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async () => {
    try {
      const redirectUrl = createPageUrl("Dashboard");
      // Use window.location.origin to construct a full absolute URL for the redirect
      await User.loginWithRedirect(window.location.origin + redirectUrl);
    } catch (error) {
      console.error("Login redirect failed:", error);
      // Fallback to basic login if redirect fails
      window.location.href = "/login";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="luxury-gradient text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto py-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-12 leading-tight">
              Sell Your Home
              <span className="gold-shimmer block">for Free</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300/90 leading-relaxed">
              AI-powered platform that lists your property on MLS, generates documents, 
              and provides market insights—all without traditional agent fees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("Auth") + "?register=true"}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                onClick={handleSignIn}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold transition-all duration-200"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose AirCasa?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI technology meets real estate expertise to deliver 
              unparalleled results for home sellers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card premium-shadow p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Pricing</h3>
              <p className="text-gray-600">
                Get accurate property valuations using advanced AI algorithms and real-time market data.
              </p>
            </div>
            
            <div className="glass-card premium-shadow p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">MLS Listing</h3>
              <p className="text-gray-600">
                Automatically list your property on MLS with professional-grade descriptions and photos.
              </p>
            </div>
            
            <div className="glass-card premium-shadow p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Market Analysis</h3>
              <p className="text-gray-600">
                Receive detailed market insights and trends to optimize your selling strategy.
              </p>
            </div>
            
            <div className="glass-card premium-shadow p-8 rounded-2xl text-center group hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Document Generation</h3>
              <p className="text-gray-600">
                Automatically generate all necessary legal documents and contracts for your sale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 luxury-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Sell Your Home?
          </h2>
          <p className="text-xl mb-8 text-gray-300/90 max-w-2xl mx-auto">
            Join thousands of homeowners who have successfully sold their properties 
            using our AI-powered platform.
          </p>
          <Link to={createPageUrl("Onboarding")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-12 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
