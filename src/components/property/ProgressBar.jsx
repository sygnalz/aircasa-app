import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function ProgressBar({ property }) {
  if (!property) return null;

  // Define all tasks and their completion status
  const tasks = [
    { name: 'Property Intake', completed: !!property.property_intake_completed },
    { name: 'Photos & Media', completed: !!property.photos_completed },
    { name: 'Agent Consultation', completed: !!property.consultation_completed }
  ];

  const completedCount = tasks.filter(task => task.completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="bg-gray-900 border-gray-700 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-white">
          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
          Property Setup Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Progress</span>
            <span className="text-white font-medium">
              {completedCount} of {totalCount} tasks completed
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                task.completed ? 'bg-green-500' : 'bg-gray-600'
              }`}></div>
              <span className={`text-sm ${
                task.completed ? 'text-green-400' : 'text-gray-400'
              }`}>
                {task.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}