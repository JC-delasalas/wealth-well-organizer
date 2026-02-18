import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { useMobilePerformance } from '@/hooks/useMobilePerformance';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileButton } from '@/components/ui/mobile-button';
import {
  Menu,
  Home,
  CreditCard,
  BarChart3,
  Target,
  Lightbulb,
  Receipt,
  Calculator,
  User,
  LogOut,
  X
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface MobileNavigationProps {
  className?: string;
}

export const MobileNavigation = ({ className }: MobileNavigationProps) => {
  const [open, setOpen] = useState(false);
  const { isMobile, isTouchDevice } = useDeviceInfo();
  const { shouldReduceAnimations } = useMobilePerformance();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render on desktop
  if (!isMobile) return null;

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/transactions', label: 'Transactions', icon: CreditCard },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/goals', label: 'Savings Goals', icon: Target },
    { path: '/insights', label: 'Insights', icon: Lightbulb },
    { path: '/receipts', label: 'Receipts', icon: Receipt },
    { path: '/tax-calculator', label: 'Tax Calculator', icon: Calculator },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`md:hidden p-2 ${className}`}
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png" 
                  alt="FinanceTracker Logo" 
                  className="w-8 h-8 object-contain"
                />
                <SheetTitle className="text-lg font-bold text-gray-900">
                  FinanceTracker
                </SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="p-1"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          {/* User Profile Section */}
          <div className="p-6 pb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  Personal Finance
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Navigation Items */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <MobileButton
                  key={item.path}
                  variant={active ? "default" : "ghost"}
                  size="mobile-default"
                  className={`w-full justify-start px-4 ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  } ${shouldReduceAnimations ? '' : 'transition-colors duration-200'}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </MobileButton>
              );
            })}
          </nav>

          <Separator />

          {/* Footer Actions */}
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-gray-700 hover:bg-gray-100"
              onClick={() => handleNavigation('/profile')}
            >
              <User className="h-5 w-5 mr-3" />
              <span className="font-medium">Profile & Settings</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-12 px-4 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
