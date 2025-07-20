
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { SidebarLayout } from "./components/layout/SidebarLayout";
import { LoadingSpinner } from "./components/ui/loading-spinner";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load components for better performance and code splitting
const Dashboard = React.lazy(() =>
  import("./components/Dashboard").then(module => ({ default: module.Dashboard }))
);
const AuthPage = React.lazy(() =>
  import("./components/auth/AuthPage").then(module => ({ default: module.AuthPage }))
);
const AuthCallback = React.lazy(() =>
  import("./components/auth/AuthCallback").then(module => ({ default: module.AuthCallback }))
);
const LocalhostRedirectHandler = React.lazy(() =>
  import("./components/auth/LocalhostRedirectHandler")
);
const ResetPassword = React.lazy(() =>
  import("./pages/ResetPassword")
);
const TransactionList = React.lazy(() =>
  import("./components/transactions/TransactionList").then(module => ({ default: module.TransactionList }))
);
const ReportsPage = React.lazy(() =>
  import("./components/reports/ReportsPage").then(module => ({ default: module.ReportsPage }))
);
const SavingsGoalsPage = React.lazy(() =>
  import("./components/savings/SavingsGoalsPage").then(module => ({ default: module.SavingsGoalsPage }))
);
const InsightsPage = React.lazy(() =>
  import("./components/insights/InsightsPage").then(module => ({ default: module.InsightsPage }))
);
const CategoriesPage = React.lazy(() =>
  import("./components/categories/CategoriesPage").then(module => ({ default: module.CategoriesPage }))
);
const ReceiptsPage = React.lazy(() =>
  import("./components/receipts/ReceiptsPage").then(module => ({ default: module.ReceiptsPage }))
);
const PhilippineTaxCalculator = React.lazy(() =>
  import("./components/tax/PhilippineTaxCalculator").then(module => ({ default: module.PhilippineTaxCalculator }))
);
const ProfileSettingsPage = React.lazy(() =>
  import("./components/profile/ProfileSettingsPage").then(module => ({ default: module.ProfileSettingsPage }))
);
const NotFound = React.lazy(() =>
  import("./pages/NotFound")
);

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check if we're on localhost with auth errors and show redirect handler
  const isLocalhost = window.location.hostname === 'localhost';
  const hasAuthError = window.location.hash.includes('error=access_denied') || 
                      window.location.hash.includes('error_code=otp_expired');
  const hasAuthTokens = window.location.hash.includes('access_token=') && 
                        window.location.hash.includes('type=recovery');

  if (isLocalhost && (hasAuthError || hasAuthTokens)) {
    return (
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <LocalhostRedirectHandler />
      </Suspense>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" replace /> : (
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <AuthPage />
          </Suspense>
        )} 
      />
      <Route 
        path="/auth/callback" 
        element={
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <AuthCallback />
          </Suspense>
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <ResetPassword />
          </Suspense>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/transactions" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <TransactionList />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ReportsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <SavingsGoalsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <InsightsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <CategoriesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ReceiptsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-calculator"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <PhilippineTaxCalculator />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner size="lg" />}>
              <ProfileSettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingSpinner size="lg" />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
