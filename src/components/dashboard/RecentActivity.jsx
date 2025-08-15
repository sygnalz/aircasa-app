import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Calendar,
  DollarSign,
  Home,
  User,
  TrendingUp,
  Settings,
  Bell,
} from 'lucide-react';

const activityIcons = {
  message: MessageSquare,
  booking: Calendar,
  payment: DollarSign,
  property: Home,
  user: User,
  analytics: TrendingUp,
  settings: Settings,
  notification: Bell,
};

const activityColors = {
  message: 'bg-blue-500',
  booking: 'bg-green-500',
  payment: 'bg-emerald-500',
  property: 'bg-purple-500',
  user: 'bg-orange-500',
  analytics: 'bg-pink-500',
  settings: 'bg-gray-500',
  notification: 'bg-yellow-500',
};

const recentActivities = [
  {
    id: 1,
    type: 'booking',
    title: 'New booking received',
    description: 'Sunset Villa - 7 nights',
    user: {
      name: 'Sarah Johnson',
      avatar: null,
      initials: 'SJ',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    amount: '$2,400',
  },
  {
    id: 2,
    type: 'message',
    title: 'New message from guest',
    description: 'Question about check-in process',
    user: {
      name: 'Mike Chen',
      avatar: null,
      initials: 'MC',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: 3,
    type: 'payment',
    title: 'Payment received',
    description: 'Ocean View Apartment booking',
    user: {
      name: 'Emma Davis',
      avatar: null,
      initials: 'ED',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    amount: '$1,850',
  },
  {
    id: 4,
    type: 'property',
    title: 'Property updated',
    description: 'Mountain Cabin - Photos uploaded',
    user: {
      name: 'You',
      avatar: null,
      initials: 'YU',
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
  },
  {
    id: 5,
    type: 'analytics',
    title: 'Weekly report ready',
    description: 'Performance summary for last week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
];

const ActivityItem = ({ activity }) => {
  const Icon = activityIcons[activity.type];
  const colorClass = activityColors[activity.type];

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium leading-none">{activity.title}</p>
          <div className="flex items-center space-x-2">
            {activity.amount && (
              <Badge variant="secondary" className="text-xs">
                {activity.amount}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{activity.description}</p>
        
        {activity.user && (
          <div className="flex items-center space-x-2 pt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="text-xs">
                {activity.user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {activity.user.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and notifications from your properties
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {recentActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentActivity;
