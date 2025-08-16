import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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

const TaskListPanel = ({ property, onOpenForm, onToggleTaskComplete }) => {
  // Task completion logic based on property data from Airtable
  const tasks = [
    {
      id: 'property-intake',
      title: 'Complete Property Intake',
      description: 'Fill out detailed property information',
      completed: !!(property.completedIntake),
      actionText: 'Fill Out Form',
      actionColor: 'bg-blue-600 hover:bg-blue-700',
      action: () => onOpenForm('intake'),
      completionField: 'completedIntake'
    },
    {
      id: 'photos-media',
      title: 'Upload Photos & Media',
      description: 'Professional photos and virtual tour',
      completed: !!(property.photosCompleted),
      actionText: 'Order Services',
      actionColor: 'bg-green-600 hover:bg-green-700',
      completionField: 'photosCompleted',
      hasMultipleActions: true,
      actions: [
        {
          text: 'Schedule Now',
          color: 'bg-blue-600 hover:bg-blue-700',
          action: () => navigate(`/photo-packages/${propertyId}`)
        },
        {
          text: 'Upload',
          color: 'bg-gray-400 cursor-not-allowed',
          disabled: true,
          action: null
        }
      ]
    },
    {
      id: 'agent-consultation',
      title: 'Schedule Agent Consultation',
      description: 'Meet with your real estate agent',
      completed: !!(property.consultationCompleted),
      actionText: 'Schedule Now',
      actionColor: 'bg-purple-600 hover:bg-purple-700',
      completionField: 'consultationCompleted'
    }
  ];

  // Add Home Buying Tasks to progress calculation when home buying is enabled
  const homeBuyingTasks = [
    {
      id: 'home-criteria',
      title: 'Complete Home Criteria',
      completed: !!(property.homeCriteriaCompleted)
    },
    {
      id: 'personal-financials',
      title: 'Complete Personal Financials',
      completed: !!(property.personalFinancialCompleted)
    }
  ];

  // Dynamically include home buying tasks in progress calculation when enabled
  const isHomeBuyingEnabled = property?.isBuyingHome;
  const allTasks = isHomeBuyingEnabled ? [...tasks, ...homeBuyingTasks] : tasks;
  const completedTasks = allTasks.filter(task => task.completed).length;
  const progressPercentage = Math.round((completedTasks / allTasks.length) * 100);

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
            <span className="font-medium">{completedTasks} of {allTasks.length} tasks completed</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-600">
            {progressPercentage}% {isHomeBuyingEnabled ? '(including home buying tasks)' : ''}
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
                <div className="flex gap-2 flex-wrap">
                  {!task.completed && task.hasMultipleActions && task.actions ? (
                    // Multiple action buttons for special tasks (like photos-media)
                    task.actions.map((actionItem, actionIndex) => (
                      <Button 
                        key={actionIndex}
                        size="sm" 
                        className={`text-xs py-1 px-3 h-7 ${actionItem.color} text-white`}
                        onClick={actionItem.action}
                        disabled={actionItem.disabled}
                      >
                        {actionItem.text}
                      </Button>
                    ))
                  ) : (
                    // Single action button for regular tasks
                    !task.completed && task.action && (
                      <Button 
                        size="sm" 
                        className={`text-xs py-1 px-3 h-7 ${task.actionColor} text-white`}
                        onClick={task.action}
                      >
                        {task.actionText}
                      </Button>
                    )
                  )}
                  {task.completionField && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`text-xs py-1 px-3 h-7 ${
                        task.completed 
                          ? 'border-red-300 text-red-700 hover:bg-red-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        console.log('🔄 TaskListPanel Toggle Complete clicked:', task.completionField, 'current:', task.completed);
                        if (onToggleTaskComplete) {
                          onToggleTaskComplete(task.completionField, task.completed);
                        } else {
                          console.error('❌ onToggleTaskComplete function not available');
                        }
                      }}
                    >
                      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {index < tasks.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const HomeBuyingTasks = ({ property, onOpenForm, onToggleTaskComplete, onToggleBuyingHome }) => {
  const isEnabled = property?.isBuyingHome;
  
  // Show disabled state when home buying is not enabled (is_buying_a_home = false)
  if (!isEnabled) {
    return (
      <Card className="bg-gray-50 border-gray-200 opacity-75">
        <CardContent className="p-6 text-center">
          <div className="space-y-4">
            <Home className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-medium text-gray-600">Home Buying Tasks</h3>
              <p className="text-sm text-gray-500 mt-2">
                Enable home buying tasks if you're also purchasing a new home
              </p>
            </div>
            <button
              onClick={() => onToggleBuyingHome(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Enable Home Buying Tasks
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = [
    {
      id: 'home-criteria',
      title: 'Complete Home Criteria',
      description: 'Define your ideal home preferences',
      completed: !!(property.homeCriteriaCompleted),
      actionText: 'Fill Out Form',
      action: () => onOpenForm('home_criteria'),
      completionField: 'homeCriteriaCompleted'
    },
    {
      id: 'personal-financials',
      title: 'Complete Personal Financials',
      description: 'Provide financial information for pre-approval',
      completed: !!(property.personalFinancialCompleted),
      actionText: 'Fill Out Form',
      action: () => onOpenForm('financial'),
      completionField: 'personalFinancialCompleted'
    }
  ];

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg text-green-800">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Home Buying Tasks
          </div>
          <button
            onClick={() => onToggleBuyingHome(false)}
            className="bg-green-100 hover:bg-green-200 text-green-800 border border-green-300 px-3 py-1 rounded-full text-xs font-medium transition-colors"
          >
            ✓ Enabled
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className={`space-y-4 transition-all duration-200 ${
        isEnabled ? '' : 'pointer-events-none'
      }`}>
        {tasks.map((task, index) => (
          <div key={task.id} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {task.completed ? (
                  <CheckCircle className={`h-4 w-4 ${
                    isEnabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                ) : (
                  <Clock className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className={`text-sm font-medium ${
                    isEnabled 
                      ? (task.completed ? 'text-green-800' : 'text-green-900')
                      : 'text-gray-500'
                  }`}>
                    {task.title}
                  </p>
                  <p className={`text-xs ${
                    isEnabled ? 'text-green-700' : 'text-gray-400'
                  }`}>
                    {task.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!task.completed && task.action && isEnabled && (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-3 h-7"
                      onClick={task.action}
                    >
                      {task.actionText}
                    </Button>
                  )}
                  {task.completionField && isEnabled && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`text-xs py-1 px-3 h-7 ${
                        task.completed 
                          ? 'border-red-300 text-red-700 hover:bg-red-50' 
                          : 'border-green-300 hover:bg-green-50'
                      }`}
                      onClick={() => {
                        console.log('🔄 HomeBuyingTasks Toggle Complete clicked:', task.completionField, 'current:', task.completed);
                        if (onToggleTaskComplete) {
                          onToggleTaskComplete(task.completionField, task.completed);
                        } else {
                          console.error('❌ onToggleTaskComplete function not available');
                        }
                      }}
                    >
                      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </Button>
                  )}
                  {task.completionField && !isEnabled && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled
                      className="text-xs py-1 px-3 h-7 border-gray-300 text-gray-400 cursor-not-allowed"
                    >
                      {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {index < tasks.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default function PropertyDetails() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilloutModal, setShowFilloutModal] = useState(false);
  const [filloutFormUrl, setFilloutFormUrl] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const toggleBuyingHome = async (value) => {
    if (updating) return;
    
    try {
      setUpdating(true);
      console.log('🔄 Toggling buying home status to:', value);
      
      const updatedPropertyData = {
        ...property,
        isBuyingHome: value
      };
      
      // Specify selective update options
      const updateOptions = {
        onlyChangedFields: true,
        changedFields: ['isBuyingHome']
      };
      
      const updatedProperty = await properties.update(propertyId, updatedPropertyData, updateOptions);
      setProperty(updatedProperty);
      
      console.log('✅ Buying home status updated successfully');
    } catch (error) {
      console.error('❌ Error updating buying home status:', error);
      // Optionally show user feedback here
    } finally {
      setUpdating(false);
    }
  };

  const toggleTaskComplete = async (completionField, currentStatus) => {
    if (updating) {
      console.log('⏳ Update already in progress, skipping');
      return;
    }
    
    try {
      setUpdating(true);
      const newStatus = !currentStatus;
      console.log(`🔄 toggleTaskComplete called with: ${completionField}, current: ${currentStatus}, new: ${newStatus}`);
      console.log('🔄 Current property data:', property);
      
      // Create minimal update object with only the changed field
      const updatedPropertyData = {
        ...property,
        [completionField]: newStatus
      };
      
      // Specify selective update options
      const updateOptions = {
        onlyChangedFields: true,
        changedFields: [completionField]
      };
      
      console.log('🔄 Updated property data to send:', updatedPropertyData);
      console.log('🔄 Update options:', updateOptions);
      
      const updatedProperty = await properties.update(propertyId, updatedPropertyData, updateOptions);
      setProperty(updatedProperty);
      
      console.log(`✅ Task ${newStatus ? 'completed' : 'marked incomplete'} successfully:`, completionField);
      console.log('✅ Updated property received:', updatedProperty);
    } catch (error) {
      console.error('❌ Error updating task:', error);
      alert(`Error updating task: ${error.message}`);
    } finally {
      setUpdating(false);
    }
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

  // Get property image from app_image_url field
  const propertyImage = property.app_image_url || (property.images && property.images.length > 0 
    ? (Array.isArray(property.images[0]) ? property.images[0][0]?.url : property.images[0])
    : null);

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

  // Calculate progress completion for MLS listing button (same logic as TaskListPanel)
  const calculateProgressCompletion = () => {
    const baseTasks = [
      { completed: !!(property.completedIntake) },
      { completed: !!(property.photosCompleted) },
      { completed: !!(property.consultationCompleted) }
    ];

    const homeBuyingTasks = [
      { completed: !!(property.homeCriteriaCompleted) },
      { completed: !!(property.personalFinancialCompleted) }
    ];

    const isHomeBuyingEnabled = property?.isBuyingHome;
    const allTasks = isHomeBuyingEnabled ? [...baseTasks, ...homeBuyingTasks] : baseTasks;
    const completedTasks = allTasks.filter(task => task.completed).length;
    const progressPercentage = Math.round((completedTasks / allTasks.length) * 100);
    
    return progressPercentage;
  };

  const progressPercentage = calculateProgressCompletion();
  const isReadyForMLS = progressPercentage === 100;

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
            <TaskListPanel 
              property={property} 
              onOpenForm={openFilloutForm} 
              onToggleTaskComplete={toggleTaskComplete}
            />
            <HomeBuyingTasks 
              property={property}
              onOpenForm={openFilloutForm} 
              onToggleTaskComplete={toggleTaskComplete}
              onToggleBuyingHome={toggleBuyingHome}
            />
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

            {/* MLS Listing Button */}
            <Card className="mt-6">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ready to List?</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {isReadyForMLS 
                        ? "All tasks completed! You're ready to list your property on the MLS."
                        : `Complete all property setup tasks (${progressPercentage}% complete) to list on the MLS.`
                      }
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/packages/${propertyId}`)}
                    disabled={!isReadyForMLS}
                    className={`w-full py-3 text-base font-medium transition-all duration-200 ${
                      isReadyForMLS
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300'
                    }`}
                  >
                    {isReadyForMLS ? '🏠 List This Property on the MLS' : '🔒 Complete Setup to List Property'}
                  </Button>
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