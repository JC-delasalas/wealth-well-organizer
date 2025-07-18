import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InsightsDashboard } from './InsightsDashboard';

/**
 * InsightsPage component displays AI-powered financial insights
 * Features comprehensive analysis and recommendations
 */
export const InsightsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
            <p className="text-gray-600 mt-1">AI-powered analysis and recommendations for your finances</p>
          </div>
        </div>

        {/* Insights Dashboard */}
        <InsightsDashboard />
      </div>
    </div>
  );
};
