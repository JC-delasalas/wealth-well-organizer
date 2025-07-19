
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { MobileNavigation } from './MobileNavigation';

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Navigation */}
          <MobileNavigation />

          <Link to="/" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/eb5e50d2-20f4-4a30-840c-4301bd79298e.png"
              alt="FinanceTracker Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold text-gray-900">FinanceTracker</span>
          </Link>
          
          <div className="hidden md:flex space-x-6">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/transactions" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/transactions') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Transactions
            </Link>
            <Link
              to="/reports"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/reports') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Reports
            </Link>
            <Link
              to="/goals"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/goals') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Goals
            </Link>
            <Link
              to="/insights"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/insights') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Insights
            </Link>
            <Link
              to="/categories"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/categories') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Categories
            </Link>
            <Link
              to="/receipts"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/receipts') ? 'bg-primary text-white' : 'text-gray-700 hover:text-primary'
              }`}
            >
              Receipts
            </Link>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};
