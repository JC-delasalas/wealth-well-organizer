import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { useMobilePerformance } from '@/hooks/useMobilePerformance';

// Loading component optimized for mobile
const MobileLoader = ({ message = "Loading..." }: { message?: string }) => {
  const { shouldReduceAnimations } = useMobilePerformance();
  
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 
        className={`h-8 w-8 text-primary ${shouldReduceAnimations ? '' : 'animate-spin'}`} 
      />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
};

// Skeleton loader for mobile
const MobileSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

// Card skeleton for mobile lists
const MobileCardSkeleton = () => (
  <div className="p-4 border rounded-lg space-y-3">
    <div className="flex items-center space-x-3">
      <MobileSkeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <MobileSkeleton className="h-4 w-3/4" />
        <MobileSkeleton className="h-3 w-1/2" />
      </div>
    </div>
    <MobileSkeleton className="h-3 w-full" />
  </div>
);

// Lazy loaded components with mobile-optimized loading states
export const LazyReportsPage = lazy(() => 
  import('../reports/ReportsPage').then(module => ({ default: module.ReportsPage }))
);

export const LazyAdvancedReports = lazy(() => 
  import('../reports/AdvancedReports').then(module => ({ default: module.AdvancedReports }))
);

export const LazyTaxCalculator = lazy(() => 
  import('../tax/TaxCalculatorPage').then(module => ({ default: module.TaxCalculatorPage }))
);

export const LazyReceiptsPage = lazy(() => 
  import('../receipts/ReceiptsPage').then(module => ({ default: module.ReceiptsPage }))
);

export const LazyCategoriesPage = lazy(() => 
  import('../categories/CategoriesPage').then(module => ({ default: module.CategoriesPage }))
);

export const LazyProfileSettings = lazy(() => 
  import('../profile/ProfileSettingsPage').then(module => ({ default: module.ProfileSettingsPage }))
);

// HOC for mobile-optimized lazy loading
interface MobileLazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  bundleName?: string;
}

export const MobileLazyWrapper = ({ 
  children, 
  fallback, 
  bundleName 
}: MobileLazyWrapperProps) => {
  const { shouldLoadBundle, isSlowConnection } = useMobilePerformance();
  
  // Default fallback based on connection speed
  const defaultFallback = isSlowConnection ? (
    <MobileLoader message="Loading on slow connection..." />
  ) : (
    <MobileLoader />
  );
  
  // Check if bundle should be loaded
  if (bundleName && !shouldLoadBundle(bundleName)) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">
          This feature is temporarily disabled for better performance.
        </p>
      </div>
    );
  }
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Mobile-optimized image component with lazy loading
interface MobileImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
}

export const MobileImage = ({ 
  src, 
  alt, 
  className = "", 
  width, 
  height, 
  quality = 80,
  placeholder 
}: MobileImageProps) => {
  const { getOptimizedImageProps, shouldLazyLoad } = useMobilePerformance();
  
  const imageProps = getOptimizedImageProps(src, alt, { width, height, quality });
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {placeholder && shouldLazyLoad && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-sm scale-110"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}
      <img
        {...imageProps}
        className="w-full h-full object-cover transition-opacity duration-300"
        onLoad={(e) => {
          // Remove placeholder when image loads
          const placeholder = e.currentTarget.previousElementSibling;
          if (placeholder) {
            placeholder.remove();
          }
        }}
      />
    </div>
  );
};

// Mobile-optimized chart wrapper
interface MobileChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  height?: number;
}

export const MobileChartWrapper = ({ 
  children, 
  title, 
  height = 300 
}: MobileChartWrapperProps) => {
  const { shouldReduceAnimations, isMobile } = useMobilePerformance();
  
  // Reduce chart height on mobile
  const chartHeight = isMobile ? Math.min(height, 250) : height;
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 px-2">{title}</h3>
      )}
      <div 
        className="w-full overflow-hidden"
        style={{ height: chartHeight }}
        data-reduce-animations={shouldReduceAnimations}
      >
        {children}
      </div>
    </div>
  );
};

// Export loading components
export { MobileLoader, MobileSkeleton, MobileCardSkeleton };
