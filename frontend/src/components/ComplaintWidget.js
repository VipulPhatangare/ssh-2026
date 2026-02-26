import React, { useState } from 'react';
import { AlertTriangle, FileText, Camera, MessageSquare } from 'lucide-react';

const ComplaintWidget = ({ onReportIssue }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-6 shadow-medium">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Report an Issue</h3>
              <p className="text-sm text-gray-600">Have a problem? Report it to the authorities</p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 hover:shadow-lg transition-all duration-200"
          >
            <FileText size={18} />
            <span>Report Now</span>
          </button>
        </div>

        {/* Expanded Form */}
        {isExpanded && (
          <div className="mt-6 bg-white rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Issue Type</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Select issue type...</option>
                <option>Pothole</option>
                <option>Water Supply</option>
                <option>Electricity</option>
                <option>Sanitation</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Describe the issue in detail..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows="3"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photo</label>
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center hover:bg-orange-50 transition-colors cursor-pointer">
                <Camera className="mx-auto text-orange-400 mb-2" size={24} />
                <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onReportIssue();
                  setIsExpanded(false);
                }}
                className="flex-1 px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all duration-200"
              >
                Submit Report
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mobile Quick Report */}
        <div className="sm:hidden mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={onReportIssue}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
          >
            <Camera size={16} />
            <span>Photo</span>
          </button>
          <button
            onClick={onReportIssue}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700"
          >
            <MessageSquare size={16} />
            <span>Describe</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplaintWidget;
