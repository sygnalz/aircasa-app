
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PropertyIntake } from "@/api/entities";
import { Save, Edit3, X, Info } from "lucide-react";
import { propertyFieldDescriptions, propertyIntakeFieldDescriptions } from "../constants/FieldDescriptions";

export default function AdminPropertyEditor({ property, propertyIntake, onSave, isAdminView }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [intakeSchema, setIntakeSchema] = useState(null);
  
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm();

  // Read-only fields that should not be editable
  const readOnlyPropertyFields = [
    'id', 'attom_id', 'attom_property_tax_id', 'app_owner_user_id', 
    'internal_property_id', 'created_date', 'updated_date', 'created_by',
    // Added new read-only fields as requested
    'property_id', 'Conversations', 'app_user_link'
  ];
  
  const readOnlyIntakeFields = [
    'id', 'property_id', 'internal_property_id', 
    'created_date', 'updated_date', 'created_by'
  ];

  // Load PropertyIntake schema on component mount
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const schema = await PropertyIntake.schema();
        setIntakeSchema(schema);
        console.log("PropertyIntake schema loaded:", schema);
      } catch (error) {
        console.error("Error loading PropertyIntake schema:", error);
      }
    };
    loadSchema();
  }, []);

  // Reset form when property data changes
  useEffect(() => {
    console.log("Data received - Property:", property);
    console.log("Data received - PropertyIntake:", propertyIntake);
    console.log("Schema loaded:", intakeSchema);
    
    if (property) {
      // Helper function to convert null/undefined values to empty strings
      const normalizeValues = (obj) => {
        if (!obj) return {};
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, (v === null || v === undefined) ? '' : v])
        );
      };

      const defaultValues = {
        ...normalizeValues(property),
        ...normalizeValues(propertyIntake)
      };
      
      console.log("Setting form default values:", defaultValues);
      reset(defaultValues);
    }
  }, [property, propertyIntake, intakeSchema, reset]);

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      console.log("Form submitted with data:", formData);
      
      // Separate property data from intake data
      const propertyUpdates = {};
      const intakeUpdates = {};

      // Extract property updates (anything that exists in property object)
      Object.keys(property || {}).forEach(key => {
        // Compare formData value to original property value
        // Note: formData[key] will be '' if original was null/undefined due to normalization
        // This comparison correctly identifies changes.
        const originalPropertyValue = property[key] === null || property[key] === undefined ? '' : property[key];
        if (!readOnlyPropertyFields.includes(key) && formData[key] !== originalPropertyValue) {
          propertyUpdates[key] = formData[key];
        }
      });

      // Extract intake updates (anything that exists in intake schema)
      if (intakeSchema?.properties) { // Check for intakeSchema.properties
        Object.keys(intakeSchema.properties).forEach(key => {
          // Compare formData value to current propertyIntake value, if it exists.
          // Normalize currentIntakeValue for accurate comparison with formData[key] (which is normalized).
          const currentIntakeValue = propertyIntake?.[key];
          const normalizedIntakeValue = currentIntakeValue === null || currentIntakeValue === undefined ? '' : currentIntakeValue;

          if (!readOnlyIntakeFields.includes(key) && formData[key] !== normalizedIntakeValue) {
            intakeUpdates[key] = formData[key];
          }
        });
      }

      console.log("Property updates:", propertyUpdates);
      console.log("Intake updates:", intakeUpdates);

      await onSave(propertyUpdates, intakeUpdates);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving admin changes:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // New function to render field label with optional tooltip
  const renderFieldLabel = (key, isReadOnly, section) => {
    const descriptions = section === 'property' ? propertyFieldDescriptions : propertyIntakeFieldDescriptions;
    const description = descriptions[key];
    
    return (
      <div className="flex items-center gap-2">
        <Label htmlFor={`${section}-${key}`} className={`text-sm font-medium ${isAdminView ? 'text-gray-200' : 'text-gray-700'}`}>
          {key}
          {isReadOnly && <span className="ml-1 text-xs text-gray-400">(read-only)</span>}
        </Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className={`w-4 h-4 cursor-help ${isAdminView ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`} />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-sm">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const renderField = (key, initialValue, isReadOnly, section) => {
    // Determine the type based on the schema if possible for intake fields
    let fieldType = typeof initialValue;
    if (section === 'intake' && intakeSchema?.properties?.[key]?.type) {
      // Map JSON schema types to HTML input types
      const schemaType = intakeSchema.properties[key].type;
      if (schemaType === 'integer' || schemaType === 'number') {
        fieldType = 'number';
      } else if (schemaType === 'boolean') {
        fieldType = 'boolean';
      } else if (schemaType === 'string') {
        fieldType = 'string';
      }
      // Consider specific format for dates, etc., if needed
    }

    const inputId = `${section}-${key}`;
    
    // console.log(`Rendering field: ${key}, initialValue: ${initialValue}, type: ${fieldType}, readOnly: ${isReadOnly}`);

    return (
      <div key={key} className="space-y-2">
        {/* Use the new renderFieldLabel function */}
        {renderFieldLabel(key, isReadOnly, section)}
        
        {fieldType === 'boolean' ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={inputId}
              {...register(key, { value: !!initialValue })} // Ensure boolean values are correctly registered
              disabled={isReadOnly || !isEditing}
              checked={watch(key) || false} // Use watch for reactive check state
              onCheckedChange={(checked) => setValue(key, checked)} // Update form value
              className={isAdminView ? "border-slate-600" : ""}
            />
            <Label htmlFor={inputId} className={`text-sm ${isAdminView ? 'text-gray-300' : 'text-gray-600'}`}>
              {watch(key) ? 'Yes' : 'No'}
            </Label>
          </div>
        ) : fieldType === 'string' && (String(initialValue).length > 100 || intakeSchema?.properties?.[key]?.format === 'text') ? ( // Added check for explicit text format in schema
          <Textarea
            id={inputId}
            {...register(key)}
            readOnly={isReadOnly || !isEditing}
            value={watch(key) || ''} // Use value and watch for controlled input reflecting form state
            className={`${isAdminView ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50'} ${isReadOnly ? 'opacity-60' : ''}`}
            rows={3}
          />
        ) : (
          <Input
            id={inputId}
            {...register(key)}
            readOnly={isReadOnly || !isEditing}
            type={fieldType === 'number' ? 'number' : 'text'}
            value={watch(key) || ''} // Use value and watch for controlled input reflecting form state
            className={`${isAdminView ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50'} ${isReadOnly ? 'opacity-60' : ''}`}
          />
        )}
      </div>
    );
  };

  if (!isAdminView) {
    return null;
  }

  // Debug render
  console.log("AdminPropertyEditor rendering - Property available:", !!property);
  console.log("AdminPropertyEditor rendering - PropertyIntake available:", !!propertyIntake);
  console.log("AdminPropertyEditor rendering - Intake Schema available:", !!intakeSchema);

  return (
    <div className="space-y-6">
      <Card className={`${isAdminView ? 'bg-slate-800 border-slate-700' : 'bg-white'} shadow-lg`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`text-2xl font-bold ${isAdminView ? 'text-white' : 'text-gray-900'}`}>
            Admin Property Editor
          </CardTitle>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Property
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to its initial state when cancelling
                    // Re-use the same normalization logic for consistency
                    const normalizeValues = (obj) => {
                      if (!obj) return {};
                      return Object.fromEntries(
                        Object.entries(obj).map(([k, v]) => [k, (v === null || v === undefined) ? '' : v])
                      );
                    };
                    const defaultValues = {
                      ...normalizeValues(property),
                      ...normalizeValues(propertyIntake)
                    };
                    reset(defaultValues);
                  }}
                  variant="outline"
                  className={isAdminView ? "border-slate-600 text-gray-300 hover:bg-slate-700" : ""}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading || !isDirty}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        
        {isEditing && (
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Properties Table Data Section */}
              <div>
                <h3 className={`text-xl font-semibold mb-4 ${isAdminView ? 'text-white' : 'text-gray-900'}`}>
                  Properties Table Data
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {property && Object.entries(property)
                    .filter(([key]) => key !== 'id') // Don't show the main ID field twice
                    .map(([key, value]) => 
                      renderField(key, value, readOnlyPropertyFields.includes(key), 'property')
                    )}
                </div>
                {!property && (
                  <p className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>
                    No property data available
                  </p>
                )}
              </div>

              {/* Property Intake Form Data Section */}
              {intakeSchema ? (
                <div>
                  <h3 className={`text-xl font-semibold mb-4 ${isAdminView ? 'text-white' : 'text-gray-900'}`}>
                    Property Intake Form Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Iterate through all properties defined in the intake schema */}
                    {Object.entries(intakeSchema.properties).map(([key, schema]) => {
                      const value = propertyIntake?.[key]; // Get the current value from propertyIntake, or undefined if not present
                      return renderField(key, value, readOnlyIntakeFields.includes(key), 'intake');
                    })}
                  </div>
                </div>
              ) : (
                <p className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>
                  Loading Property Intake schema...
                </p>
              )}
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
