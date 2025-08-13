
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone } from "lucide-react";

export default function Step3PersonalInfo({ onNext, onBack, initialData }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        email: initialData.email || "",
        phone: initialData.phone || ""
      });
    }
  }, [initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.first_name || !formData.first_name.trim()) newErrors.first_name = "First name is required";
    if (!formData.last_name || !formData.last_name.trim()) newErrors.last_name = "Last name is required";
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const phoneDigits = (formData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      newErrors.phone = "Please enter a valid 10-digit US phone number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const phoneDigits = (formData.phone || '').replace(/\D/g, '');
      const formattedPhone = `(${phoneDigits.substring(0, 3)}) ${phoneDigits.substring(3, 6)}-${phoneDigits.substring(6, 10)}`;
      onNext({ ...formData, phone: formattedPhone });
    }
  };

  return (
    <div className="glass-card premium-shadow p-8 rounded-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">
          We'll use this information to create your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name *</Label>
            <Input id="first_name" type="text" value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} placeholder="John" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            {errors.first_name && <p className="text-sm text-red-600">{errors.first_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name *</Label>
            <Input id="last_name" type="text" value={formData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} placeholder="Doe" className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            {errors.last_name && <p className="text-sm text-red-600">{errors.last_name}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="john@example.com" className="w-full pl-12 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="(555) 123-4567" className="w-full pl-12 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>
          {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div className="bg-purple-50 p-4 rounded-xl">
          <p className="text-sm text-purple-800"><span className="font-medium">Note:</span> We'll send you a verification email after signup completion. Your phone number will be used for important updates about your listing.</p>
        </div>
        <div className="flex gap-4">
          <Button type="button" onClick={onBack} variant="outline" className="flex-1 py-4 rounded-xl font-semibold border-2 hover:bg-gray-50">Back</Button>
          <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">Complete Setup</Button>
        </div>
      </form>
    </div>
  );
}
