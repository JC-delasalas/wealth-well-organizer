// Shared Sidebar Layout Component for Wealth Well Organizer
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Home,
  List,
  BarChart3,
  Target,
  Lightbulb,
  FolderOpen,
  Receipt,
  Calculator,
  User,
  Menu,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

// Navigation items configuration
const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/',
    description: 'Financial overview and quick actions'
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: List,
    path: '/transactions',
    description: 'Manage income and expenses'
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart3,
    path: '/reports',
    description: 'Financial reports and analytics'
  },
  {
    id: 'goals',
    label: 'Goals & Savings',
    icon: Target,
    path: '/goals',
    description: 'Track savings goals and progress'
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: Lightbulb,
    path: '/insights',
    description: 'AI-powered financial insights'
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: FolderOpen,
    path: '/categories',
    description: 'Manage transaction categories'
  },
  {
    id: 'receipts',
    label: 'Receipts',
    icon: Receipt,
    path: '/receipts',
    description: 'Upload and manage receipts'
  },
  {
    id: 'tax-calculator',
    label: 'Tax Calculator',
    icon: Calculator,
    path: '/tax-calculator',
    description: 'Philippine tax calculations'
  }
];

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('sidebar-open');
    if (savedSidebarState !== null) {
      setSidebarOpen(JSON.parse(savedSidebarState));
    } else {
      // Default to open on desktop, closed on mobile
      setSidebarOpen(window.innerWidth >= 768);
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar on mobile when screen size changes
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [sidebarOpen]);

  // Close sidebar when navigating on mobile
  const handleNavigation = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Check if current path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Desktop sidebar component
  const DesktopSidebar = () => (
    <div className={`hidden md:flex flex-col w-64 bg-white border-r border-gray-200 transition-all duration-300 ${
      sidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png"
            alt="FinanceTracker Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold text-gray-900">FinanceTracker</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Personal Finance Management
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={handleNavigation}
              className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 ${active ? 'text-primary-foreground' : 'text-gray-500'}`} />
              <div>
                <div className={`font-medium text-sm ${active ? 'text-primary-foreground' : 'text-gray-900'}`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-1 ${active ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-3">
              <Avatar className="w-8 h-8 mr-3">
                <AvatarFallback className="text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                Profile & Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  // Mobile sidebar using Sheet component
  const MobileSidebar = () => (
    <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <SheetContent side="left" className="w-64 p-0">
        {/* Mobile Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png"
              alt="FinanceTracker Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">FinanceTracker</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Personal Finance Management
          </p>
        </div>

        {/* Mobile Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleNavigation}
                className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${active ? 'text-primary-foreground' : 'text-gray-500'}`} />
                <div>
                  <div className={`font-medium text-sm ${active ? 'text-primary-foreground' : 'text-gray-900'}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs mt-1 ${active ? 'text-primary-foreground/80' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Mobile User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-2">
            <Link
              to="/profile"
              onClick={handleNavigation}
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 mr-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Profile & Settings</span>
            </Link>
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start p-3"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <DesktopSidebar />

      {/* Mobile Sidebar */}
      <MobileSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Hamburger Menu */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Page Title Area - will be populated by individual pages */}
            <div className="flex-1">
              {/* This will be enhanced to show page-specific titles */}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile & Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
