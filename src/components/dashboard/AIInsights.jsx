import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Lightbulb, TrendingUp } from 'lucide-react';

export default function AIInsights({ propertyId, insights, isAdminView = false }) {
  const placeholderInsights = [
    { id: 1, title: 'Optimal Listing Price', content: '$475,500', icon: TrendingUp },
    { id: 2, title: 'Best Time to List', content: 'Mid-April for maximum buyer interest.', icon: Lightbulb },
  ];

  const displayInsights = insights && insights.length > 0 ? insights : placeholderInsights;

  return (
    <Card className={`shadow-lg rounded-2xl ${isAdminView ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className={`w-6 h-6 ${isAdminView ? 'text-blue-400' : 'text-blue-600'}`} />
          <CardTitle className={`text-2xl font-bold ${isAdminView ? 'text-white' : 'text-gray-900'}`}>AI-Powered Insights</CardTitle>
        </div>
        <CardDescription className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>
          Leverage AI to make smarter selling decisions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {displayInsights.map((insight) => (
            <li key={insight.id} className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isAdminView ? 'bg-slate-700' : 'bg-blue-50'}`}>
                {React.createElement(insight.icon || Lightbulb, { className: `w-5 h-5 ${isAdminView ? 'text-blue-300' : 'text-blue-600'}` })}
              </div>
              <div>
                <h4 className={`font-semibold ${isAdminView ? 'text-gray-200' : 'text-gray-800'}`}>{insight.title}</h4>
                <p className={`text-sm ${isAdminView ? 'text-gray-400' : 'text-gray-600'}`}>{insight.content}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}