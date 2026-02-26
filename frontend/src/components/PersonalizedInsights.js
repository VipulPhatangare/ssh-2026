import React from 'react';
import { TrendingUp, AlertCircle, MapPin, Clock, ChevronRight } from 'lucide-react';

const PersonalizedInsights = ({ onViewMore }) => {
  const insights = [
    {
      id: 1,
      type: 'schemes',
      icon: TrendingUp,
      title: 'Eligible Schemes',
      description: 'Based on your profile',
      value: '8',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      schemes: [
        { name: 'Skill Development Program', match: '95%' },
        { name: 'Rural Development Grant', match: '88%' },
      ],
    },
    {
      id: 2,
      type: 'complaints',
      icon: AlertCircle,
      title: 'Your Complaints',
      description: 'Recent activity',
      resolved: '12',
      pending: '2',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
    },
    {
      id: 3,
      type: 'nearby',
      icon: MapPin,
      title: 'Nearby Issues',
      description: 'In your area',
      value: '24',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      issues: ['Pothole reported 2km away', 'Water supply issue 500m away'],
    },
    {
      id: 4,
      type: 'activity',
      icon: Clock,
      title: 'Recent Activity',
      description: 'Last 30 days',
      value: '5',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Insights</h2>
        <p className="text-gray-600">Personalized information just for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <div
              key={insight.id}
              className={`${insight.bgColor} border border-gray-200 rounded-2xl p-6 hover:shadow-medium transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${insight.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent className="text-white" size={24} />
                </div>
                <button
                  onClick={() => onViewMore(insight)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">{insight.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{insight.description}</p>

              {/* Type-specific content */}
              {insight.type === 'schemes' && (
                <div className="space-y-3">
                  {insight.schemes.map((scheme, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">{scheme.name}</p>
                        <span className="text-xs font-bold text-primary-600">{scheme.match}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {insight.type === 'complaints' && (
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-3xl font-bold text-green-600">{insight.resolved}</p>
                    <p className="text-xs text-gray-600">Resolved</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-orange-600">{insight.pending}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                </div>
              )}

              {insight.type === 'nearby' && (
                <div className="space-y-2">
                  {insight.issues.map((issue, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-white rounded-lg p-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-gray-700">{issue}</p>
                    </div>
                  ))}
                </div>
              )}

              {insight.type === 'activity' && (
                <div className="flex items-baseline space-x-2">
                  <p className="text-4xl font-bold text-gray-900">{insight.value}</p>
                  <p className="text-sm text-gray-600">actions this month</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA Section */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-6">Our AI assistant can help you find the right schemes and file complaints</p>
        <button className="px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
          Chat with AI Assistant
        </button>
      </div>
    </div>
  );
};

export default PersonalizedInsights;
