import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { properties } from '@/api/functions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import FilloutFormModal from '@/components/property/FilloutFormModal';
import { 
  ArrowLeft, 
  Home, 
  Bed, 
  Bath, 
  Square, 
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Camera,
  Users,
  Calendar
} from 'lucide-react';

const TaskListPanel = ({ property, onOpenForm }) => {
  // Task completion logic based on property data
  const tasks = [
    {
      id: 'property-intake',
      title: 'Complete Property Intake',
      description: 'Fill out detailed property information',
      completed: !!(property.description && property.bedrooms && property.bathrooms),
      actionText: 'Fill Out Form',
      actionColor: 'bg-blue-600 hover:bg-blue-700',
      action: () => onOpenForm('intake')
    },
    {
      id: 'photos-media',
      title: 'Upload Photos & Media',
      description: 'Professional photos and virtual tour',
      completed: !!(property.images && property.images.length > 0),
      actionText: 'Order Services',
      actionColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'agent-consultation',
      title: 'Schedule Agent Consultation',
      description: 'Meet with your real estate agent',
      completed: false, // This would come from actual booking data
      actionText: 'Schedule Now',
      actionColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Property Setup Progress
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{completedTasks} of {tasks.length} tasks completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-600">
            {progressPercentage}%
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {tasks.map((task, index) => (
          <div key={task.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className={`text-sm font-medium ${task.completed ? 'text-green-800' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    {task.description}
                  </p>
                </div>
                {!task.completed && (
                  <Button 
                    size="sm" 
                    className={`text-xs py-1 px-3 h-7 ${task.actionColor} text-white`}
                    onClick={task.action}
                  >
                    {task.actionText}
                  </Button>
                )}
              </div>
            </div>
            {index < tasks.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const HomeBuyingTasks = ({ onOpenForm }) => {
  const tasks = [
    {
      id: 'home-criteria',
      title: 'Complete Home Criteria',
      description: 'Define your ideal home preferences',
      completed: false,
      actionText: 'Fill Out Form',
      action: () => onOpenForm('home_criteria')
    },
    {
      id: 'personal-financials',
      title: 'Complete Personal Financials',
      description: 'Provide financial information for pre-approval',
      completed: false,
      actionText: 'Fill Out Form',
      action: () => onOpenForm('financial')
    }
  ];

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-green-800">
          <Home className="h-5 w-5" />
          Home Buying Tasks
          <Badge className="ml-auto bg-green-100 text-green-800 border-green-300">
            I am buying a home
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <div key={task.id} className="bg-green-100 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-green-900">
                    {task.title}
                  </p>
                  <p className="text-xs text-green-700">
                    {task.description}
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 h-7"
                    onClick={task.action}
                  >
                    {task.actionText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilloutModal, setShowFilloutModal] = useState(false);
  const [filloutFormUrl, setFilloutFormUrl] = useState("");

  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        console.log('🏠 Loading property details for ID:', propertyId);
        
        // For now, we'll get all properties and find the one we need
        // In a real app, you'd have a getById endpoint
        const data = await properties.list();
        
        if (data?.items) {
          const foundProperty = data.items.find(p => p.id === propertyId);
          if (foundProperty) {
            console.log('✅ Property found:', foundProperty);
            setProperty(foundProperty);
          } else {
            setError('Property not found');
          }
        } else {
          setError('No properties data available');
        }
      } catch (err) {
        console.error('❌ Error loading property:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const openFilloutForm = (formType) => {
    console.log('🔍 PropertyDetails openFilloutForm called with:', formType);
    console.log('🔍 propertyId:', propertyId);
    
    // For now, use a demo user ID - in real app this would come from authentication
    const demoUserId = 'demo-user-123';
    
    let url = "";
    const baseParams = `?app_owner_user_id=${demoUserId}&property_id=${propertyId}`;

    switch (formType) {
      case 'intake':
        url = `https://form.fillout.com/t/fziJ5towSGus${baseParams}`;
        break;
      case 'home_criteria':
        url = `https://form.fillout.com/t/home-criteria${baseParams}`;
        break;
      case 'financial':
        url = `https://form.fillout.com/t/personal-financial${baseParams}`;
        break;
      default:
        console.error('❌ Unknown form type:', formType);
        return;
    }
    
    console.log('✅ Setting form URL:', url);
    setFilloutFormUrl(url);
    setShowFilloutModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading property details...</span>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">
            {error || 'Property not found'}
          </div>
          <Link to="/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get property image
  const propertyImage = property.images && property.images.length > 0 
    ? (Array.isArray(property.images[0]) ? property.images[0][0]?.url : property.images[0])
    : null;

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Task List */}
          <div className="lg:col-span-1 space-y-6">
            <TaskListPanel property={property} onOpenForm={openFilloutForm} />
            <HomeBuyingTasks onOpenForm={openFilloutForm} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Property Hero */}
            <Card className="overflow-hidden">
              <div className="relative h-64 md:h-80 bg-gray-200">
                {propertyImage ? (
                  <img 
                    src={propertyImage} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {property.location || property.title}
                    </h1>
                    <Badge variant="outline" className="mt-2">
                      {property.propertyType || 'SINGLE FAMILY RESIDENCE'}
                    </Badge>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Est. Value</p>
                        <p className="font-semibold">{formatCurrency(property.marketValue || property.price)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Bedrooms</p>
                        <p className="font-semibold">{property.bedrooms || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Bathrooms</p>
                        <p className="font-semibold">{property.bathrooms || 0}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-gray-600">Sq. Ft.</p>
                        <p className="font-semibold">{property.area?.toLocaleString() || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fillout Form Modal */}
      {showFilloutModal && (
        <FilloutFormModal
          isOpen={showFilloutModal}
          onClose={() => setShowFilloutModal(false)}
          formUrl={filloutFormUrl}
        />
      )}
    </div>
  );
}