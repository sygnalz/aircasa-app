import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";

export default function AdminSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const user = await User.me();
        if (!user || user.role !== 'admin') {
          navigate(createPageUrl("Dashboard"), { replace: true });
        }
      } catch (error) {
        navigate(createPageUrl("Auth"), { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    checkAdminAccess();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
            <Button variant="outline" onClick={() => navigate(createPageUrl("AdminPanel"))} className="flex items-center gap-2 bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4" />
                Back to Admin Panel
            </Button>
            <div>
                <h1 className="text-3xl font-bold text-white">Application Settings</h1>
                <p className="text-gray-400">Configure global application settings</p>
            </div>
        </div>
        <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
                <Construction className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-2">Under Construction</h3>
                <p className="text-gray-400">The global app settings page is coming soon!</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}