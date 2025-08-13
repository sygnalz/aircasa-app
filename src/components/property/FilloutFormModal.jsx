import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";

export default function FilloutFormModal({ isOpen, onClose, formUrl }) {
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90%] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <DialogTitle>Complete Form</DialogTitle>
          <DialogDescription>
            Please fill out the required information below. Your progress is saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          {formUrl ? (
            <iframe
              key={formUrl}
              src={formUrl}
              className="w-full h-full border-0"
              title="Fillout Form"
              allow="geolocation; microphone; camera; midi; encrypted-media; autoplay; clipboard-write;"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading form...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}