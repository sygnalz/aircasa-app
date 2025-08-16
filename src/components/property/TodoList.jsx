import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, FileText, Camera, Calendar } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function TodoList({ property, propertyIntake, onToggleTask, onOpenForm }) {
  if (!property) return null;

  const tasks = [
    {
      id: 'intake',
      title: 'Complete Property Intake',
      description: 'Fill out detailed property information',
      icon: FileText,
      completed: !!property.property_intake_completed, 
      field: 'property_intake_completed',
      action: () => onOpenForm('intake'),
      buttonText: 'Fill Out Form'
    },
    {
      id: 'photos',
      title: 'Upload Photos & Media',
      description: 'Professional photos and virtual tour',
      icon: Camera,
      completed: !!property.photos_completed,
      field: 'photos_completed',
      action: () => window.open(createPageUrl(`PhotoPackages?id=${property.id}`), '_blank'),
      buttonText: 'Order Services'
    },
    {
      id: 'consultation',
      title: 'Schedule Agent Consultation',
      description: 'Meet with your real estate agent',
      icon: Calendar,
      completed: !!property.consultation_completed,
      field: 'consultation_completed',
      action: () => onOpenForm('consultation'),
      buttonText: 'Schedule Now'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tasks.map((task) => {
        const TaskIcon = task.icon;
        return (
          <Card key={task.id} className={`border transition-all duration-200 ${
            task.completed ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-200 hover:border-green-300'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={task.id}
                  checked={task.completed}
                  onCheckedChange={() => onToggleTask(task.field)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <TaskIcon className={`w-5 h-5 ${task.completed ? 'text-green-600' : 'text-green-600'}`} />
                    <h3 className={`font-medium ${
                      task.completed 
                        ? 'text-green-800 line-through' 
                        : 'text-green-800'
                    }`}>
                      {task.title}
                    </h3>
                  </div>
                  <p className={`text-sm mb-3 ${
                    task.completed ? 'text-green-600' : 'text-green-600'
                  }`}>
                    {task.description}
                  </p>
                  <Button
                    onClick={task.action}
                    size="sm"
                    variant={task.completed ? "outline" : "default"}
                    className={task.completed ? "border-green-300 text-green-700 hover:bg-green-100" : "bg-green-600 hover:bg-green-700 text-white"}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {task.buttonText}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}