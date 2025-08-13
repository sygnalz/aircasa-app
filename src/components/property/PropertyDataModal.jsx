import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PropertyDataModal({ property, onClose }) {
  if (!property) return null;

  // Filter and format the property data for display
  const displayData = Object.entries(property)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '' && key !== 'id')
    .map(([key, value]) => ({
      key: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
    }));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Property Data</DialogTitle>
          <DialogDescription>
            This is all the data we have for your property from ATTOM and other sources.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-4">
            {displayData.map(({ key, value }) => (
              <div key={key} className="grid grid-cols-2 gap-4 text-sm even:bg-gray-50 p-2 rounded-md">
                <p className="font-medium text-gray-700">{key}</p>
                <p className="text-gray-900 break-words">{value}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}