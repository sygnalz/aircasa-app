import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const StatCard = ({ title, value, description, trend, trendValue, icon: Icon, className }) => {
  const isPositiveTrend = trend === 'up';
  const TrendIcon = isPositiveTrend ? ArrowUpRight : ArrowDownRight;
  
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <div className="flex items-center pt-1">
            <TrendIcon
              className={cn(
                'h-4 w-4 mr-1',
                isPositiveTrend ? 'text-green-600' : 'text-red-600'
              )}
            />
            <span
              className={cn(
                'text-xs',
                isPositiveTrend ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trendValue}
            </span>
            <span className="text-xs text-muted-foreground ml-1">
              {description}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function StatsCards({ stats = {} }) {
  const defaultStats = {
    totalProperties: { value: '24', trend: 'up', trendValue: '+12%', description: 'from last month' },
    totalRevenue: { value: '$45,231', trend: 'up', trendValue: '+20.1%', description: 'from last month' },
    activeListings: { value: '18', trend: 'down', trendValue: '-4%', description: 'from last week' },
    totalViews: { value: '2,350', trend: 'up', trendValue: '+180%', description: 'from last month' },
    ...stats
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Properties"
        value={defaultStats.totalProperties.value}
        description={defaultStats.totalProperties.description}
        trend={defaultStats.totalProperties.trend}
        trendValue={defaultStats.totalProperties.trendValue}
        icon={Building2}
      />
      <StatCard
        title="Total Revenue"
        value={defaultStats.totalRevenue.value}
        description={defaultStats.totalRevenue.description}
        trend={defaultStats.totalRevenue.trend}
        trendValue={defaultStats.totalRevenue.trendValue}
        icon={DollarSign}
      />
      <StatCard
        title="Active Listings"
        value={defaultStats.activeListings.value}
        description={defaultStats.activeListings.description}
        trend={defaultStats.activeListings.trend}
        trendValue={defaultStats.activeListings.trendValue}
        icon={Calendar}
      />
      <StatCard
        title="Total Views"
        value={defaultStats.totalViews.value}
        description={defaultStats.totalViews.description}
        trend={defaultStats.totalViews.trend}
        trendValue={defaultStats.totalViews.trendValue}
        icon={Users}
      />
    </div>
  );
}

export default StatsCards;
