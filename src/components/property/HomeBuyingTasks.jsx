import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, FileText, DollarSign, ExternalLink } from "lucide-react";

export default function HomeBuyingTasks({ property, onToggleIsBuyingHome, onOpenForm, onToggleTask }) {
  if (!property) return null;

  const isBuyingHome = !!property.is_buying_a_home;

  const homeBuyingTasks = [
    {
      id: 'home_criteria',
      title: 'Complete Home Criteria',
      description: 'Define your ideal home preferences',
      icon: Home,
      completed: !!property.home_criteria_main_completed,
      field: 'home_criteria_main_completed',
      action: () => onOpenForm('home_criteria'),
      buttonText: 'Fill Out Form'
    },
    {
      id: 'financial',
      title: 'Complete Personal Financials',
      description: 'Provide financial information for pre-approval',
      icon: DollarSign,
      completed: !!property.personal_financial_completed,
      field: 'personal_financial_completed',
      action: () => onOpenForm('personal_financial'),
      buttonText: 'Fill Out Form'
    }
  ];

  return (
    <Card className="bg-green-50 border-green-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-green-800 flex items-center">
            <Home className="w-6 h-6 mr-2" />
            Home Buying Tasks
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_buying_home"
              checked={isBuyingHome}
              onCheckedChange={onToggleIsBuyingHome}
              className="border-green-400 data-[state=checked]:bg-green-600"
            />
            <label htmlFor="is_buying_home" className="text-sm font-medium text-green-800">
              I am buying a home
            </label>
          </div>
        </div>
      </CardHeader>
      
      {isBuyingHome && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeBuyingTasks.map((task) => {
              const TaskIcon = task.icon;
              return (
                <Card key={task.id} className={`border transition-all duration-200 ${
                  task.completed ? 'bg-green-100 border-green-300' : 'bg-green-100 border-green-300 hover:border-green-400'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={task.id}
                        checked={task.completed}
                        onCheckedChange={() => onToggleTask(task.field)}
                        className="mt-1 border-green-400 data-[state=checked]:bg-green-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <TaskIcon className={`w-5 h-5 text-green-600`} />
                          <h3 className={`font-medium ${
                            task.completed 
                              ? 'text-green-800 line-through' 
                              : 'text-green-800'
                          }`}>
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-sm mb-3 text-green-600">
                          {task.description}
                        </p>
                        <Button
                          onClick={task.action}
                          size="sm"
                          variant={task.completed ? "outline" : "default"}
                          className={task.completed ? "border-green-400 text-green-700 hover:bg-green-200" : "bg-green-600 hover:bg-green-700 text-white"}
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
        </CardContent>
      )}
    </Card>
  );
}