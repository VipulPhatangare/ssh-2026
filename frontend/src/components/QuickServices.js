import React from 'react';
import { Heart, AlertCircle, Plane, Zap, Sprout } from 'lucide-react';

const QuickServices = ({ onServiceClick }) => {
  const services = [
    {
      id: 'health',
      name: 'Health',
      description: 'Medical benefits & healthcare schemes',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
    {
      id: 'emergency',
      name: 'Emergency',
      description: 'Disaster relief & emergency support',
      icon: AlertCircle,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      id: 'travel',
      name: 'Travel',
      description: 'Travel allowance & transport schemes',
      icon: Plane,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      id: 'utility',
      name: 'Utility',
      description: 'Electricity, water, and gas benefits',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      id: 'agriculture',
      name: 'Agriculture',
      description: 'Farm support & agricultural schemes',
      icon: Sprout,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Services</h2>
        <p className="text-gray-600">Browse services by category</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {services.map((service) => {
          const IconComponent = service.icon;
          return (
            <button
              key={service.id}
              onClick={() => onServiceClick(service)}
              className={`${service.bgColor} border-2 border-transparent rounded-xl p-6 transition-all duration-300 hover:shadow-medium hover:border-gray-200 group transform hover:scale-105`}
            >
              {/* Icon Background */}
              <div
                className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-lg flex items-center justify-center mb-4 group-hover:shadow-lg transition-all duration-300`}
              >
                <IconComponent className="text-white" size={28} />
              </div>

              {/* Text Content */}
              <h3 className={`text-lg font-bold ${service.textColor} mb-2`}>{service.name}</h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700">{service.description}</p>

              {/* Arrow Icon */}
              <div className={`mt-4 flex items-center ${service.textColor} text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300`}>
                Explore
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickServices;
