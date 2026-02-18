// Tax Deadlines Display Component
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Bell,
  FileText,
  Building,
  User
} from 'lucide-react';
import { useTaxBrackets } from '@/hooks/usePhilippineTax';
import { getPhilippineTaxDeadlines } from '@/utils/philippineTax';

interface TaxDeadline {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'individual' | 'business' | 'corporate';
  category: 'annual' | 'quarterly' | 'monthly';
  formType?: string;
  isOverdue: boolean;
  daysUntil: number;
  priority: 'high' | 'medium' | 'low';
}

export const TaxDeadlinesDisplay: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'business' | 'corporate'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'annual' | 'quarterly' | 'monthly'>('all');

  const deadlines = getPhilippineTaxDeadlines(selectedYear);

  // Convert deadline data to structured format
  const structuredDeadlines = useMemo((): TaxDeadline[] => {
    const today = new Date();
    const allDeadlines: TaxDeadline[] = [];

    // Individual deadlines
    allDeadlines.push({
      id: 'individual-annual',
      title: 'Individual Income Tax Return (ITR)',
      description: 'Annual filing of individual income tax return',
      date: deadlines.individual.annual,
      type: 'individual',
      category: 'annual',
      formType: 'ITR 1700/1701',
      isOverdue: new Date(deadlines.individual.annual) < today,
      daysUntil: Math.ceil((new Date(deadlines.individual.annual).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      priority: 'high'
    });

    deadlines.individual.quarterly.forEach((date, index) => {
      allDeadlines.push({
        id: `individual-q${index + 1}`,
        title: `Individual Quarterly Tax Payment - Q${index + 1}`,
        description: `Quarterly income tax payment for Q${index + 1} ${selectedYear}`,
        date,
        type: 'individual',
        category: 'quarterly',
        formType: 'BIR Form 1701Q',
        isOverdue: new Date(date) < today,
        daysUntil: Math.ceil((new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'medium'
      });
    });

    // Business deadlines
    allDeadlines.push({
      id: 'business-annual',
      title: 'Business Income Tax Return',
      description: 'Annual filing of business income tax return',
      date: deadlines.business.annual,
      type: 'business',
      category: 'annual',
      formType: 'ITR 1701',
      isOverdue: new Date(deadlines.business.annual) < today,
      daysUntil: Math.ceil((new Date(deadlines.business.annual).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      priority: 'high'
    });

    deadlines.business.quarterly.forEach((date, index) => {
      allDeadlines.push({
        id: `business-q${index + 1}`,
        title: `Business Quarterly Tax Payment - Q${index + 1}`,
        description: `Quarterly business tax payment for Q${index + 1} ${selectedYear}`,
        date,
        type: 'business',
        category: 'quarterly',
        formType: 'BIR Form 1701Q',
        isOverdue: new Date(date) < today,
        daysUntil: Math.ceil((new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'medium'
      });
    });

    // Corporate deadlines
    allDeadlines.push({
      id: 'corporate-annual',
      title: 'Corporate Income Tax Return',
      description: 'Annual filing of corporate income tax return',
      date: deadlines.corporate.annual,
      type: 'corporate',
      category: 'annual',
      formType: 'ITR 1702',
      isOverdue: new Date(deadlines.corporate.annual) < today,
      daysUntil: Math.ceil((new Date(deadlines.corporate.annual).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      priority: 'high'
    });

    deadlines.corporate.quarterly.forEach((date, index) => {
      allDeadlines.push({
        id: `corporate-q${index + 1}`,
        title: `Corporate Quarterly Tax Payment - Q${index + 1}`,
        description: `Quarterly corporate tax payment for Q${index + 1} ${selectedYear}`,
        date,
        type: 'corporate',
        category: 'quarterly',
        formType: 'BIR Form 1702Q',
        isOverdue: new Date(date) < today,
        daysUntil: Math.ceil((new Date(date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
        priority: 'medium'
      });
    });

    return allDeadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedYear, deadlines]);

  // Filter deadlines
  const filteredDeadlines = structuredDeadlines.filter(deadline => {
    if (filterType !== 'all' && deadline.type !== filterType) return false;
    if (filterCategory !== 'all' && deadline.category !== filterCategory) return false;
    return true;
  });

  // Get upcoming deadlines (next 90 days)
  const upcomingDeadlines = filteredDeadlines.filter(deadline => 
    deadline.daysUntil >= 0 && deadline.daysUntil <= 90
  );

  // Get overdue deadlines
  const overdueDeadlines = filteredDeadlines.filter(deadline => deadline.isOverdue);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-gray-900 bg-white border-gray-200';
      case 'medium': return 'text-gray-900 bg-white border-gray-200';
      case 'low': return 'text-gray-900 bg-white border-gray-200';
      default: return 'text-gray-900 bg-white border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return <User className="w-4 h-4" />;
      case 'business': return <Building className="w-4 h-4" />;
      case 'corporate': return <Building className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Tax Year:</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <Select value={filterType} onValueChange={(value: string) => setFilterType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Period:</label>
            <Select value={filterCategory} onValueChange={(value: string) => setFilterCategory(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Calendar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-800">
                  {overdueDeadlines.length}
                </div>
                <div className="text-sm text-red-600">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-800">
                  {upcomingDeadlines.length}
                </div>
                <div className="text-sm text-orange-600">Upcoming (90 days)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-800">
                  {filteredDeadlines.length - overdueDeadlines.length - upcomingDeadlines.length}
                </div>
                <div className="text-sm text-green-600">Future</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Deadlines */}
      {overdueDeadlines.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-5 h-5" />
              Overdue Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueDeadlines.map((deadline) => (
                <div key={deadline.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(deadline.type)}
                      <div>
                        <div className="font-medium">{deadline.title}</div>
                        <div className="text-sm text-muted-foreground">{deadline.description}</div>
                        {deadline.formType && (
                          <Badge variant="outline" className="mt-1">
                            {deadline.formType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">
                        {formatDate(deadline.date)}
                      </div>
                      <div className="text-sm text-red-500">
                        {Math.abs(deadline.daysUntil)} days overdue
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Tax Deadlines
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Important tax filing and payment deadlines for {selectedYear}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className={`p-4 border rounded-lg ${getPriorityColor(deadline.priority)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(deadline.type)}
                    <div>
                      <div className="font-medium">{deadline.title}</div>
                      <div className="text-sm opacity-80">{deadline.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {deadline.formType && (
                          <Badge variant="outline">
                            {deadline.formType}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="capitalize">
                          {deadline.type}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {deadline.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatDate(deadline.date)}
                    </div>
                    <div className="text-sm opacity-80">
                      {deadline.daysUntil === 0 ? 'Today' : 
                       deadline.daysUntil === 1 ? 'Tomorrow' :
                       `${deadline.daysUntil} days`}
                    </div>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Bell className="w-3 h-3 mr-1" />
                      Remind
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Deadlines Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Complete Tax Calendar ({selectedYear})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDeadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(deadline.type)}
                  <div>
                    <div className="font-medium">{deadline.title}</div>
                    <div className="text-sm text-muted-foreground">{deadline.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium">
                      {formatDate(deadline.date)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {deadline.formType}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {deadline.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-2">Important Reminders:</p>
              <ul className="text-blue-700 space-y-1 list-disc list-inside">
                <li>Annual ITR filing deadline is April 15 of the following year</li>
                <li>Quarterly payments are due on the 15th of May, August, November, and January</li>
                <li>Late filing penalties apply for overdue returns</li>
                <li>Extensions may be available in certain circumstances</li>
                <li>Always verify deadlines with the BIR as they may change due to holidays or special circumstances</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
