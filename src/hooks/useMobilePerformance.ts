import { useState, useEffect, useCallback } from 'react';
import { useDeviceInfo } from './use-mobile';

// Type definitions for browser APIs
interface NavigatorConnection {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface PerformanceMetrics {
  isSlowConnection: boolean;
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  shouldLazyLoad: boolean;
  shouldCompressImages: boolean;
  networkInfo: NetworkInfo | null;
  memoryInfo: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
}

export const useMobilePerformance = () => {
  const { isMobile, isTouchDevice } = useDeviceInfo();
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    isSlowConnection: false,
    isLowEndDevice: false,
    shouldReduceAnimations: false,
    shouldLazyLoad: true,
    shouldCompressImages: false,
    networkInfo: null,
    memoryInfo: null,
  });

  // Network detection
  const getNetworkInfo = useCallback((): NetworkInfo | null => {
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: NavigatorConnection }).connection;
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
      };
    }
    return null;
  }, []);

  // Memory detection
  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: PerformanceMemory }).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  // Device capability detection
  const detectDeviceCapabilities = useCallback(() => {
    const networkInfo = getNetworkInfo();
    const memoryInfo = getMemoryInfo();
    
    // Detect slow connection
    const isSlowConnection = networkInfo ? 
      ['2g', 'slow-2g'].includes(networkInfo.effectiveType) || 
      networkInfo.saveData ||
      networkInfo.downlink < 1.5 : false;

    // Detect low-end device
    const isLowEndDevice = (() => {
      // Check CPU cores
      const cores = navigator.hardwareConcurrency || 1;
      if (cores <= 2) return true;

      // Check memory
      if (memoryInfo && memoryInfo.jsHeapSizeLimit < 1073741824) { // Less than 1GB
        return true;
      }

      // Check user agent for known low-end devices
      const userAgent = navigator.userAgent.toLowerCase();
      const lowEndPatterns = [
        'android 4', 'android 5', 'android 6',
        'iphone os 9', 'iphone os 10', 'iphone os 11',
        'cpu os 9', 'cpu os 10', 'cpu os 11'
      ];
      
      return lowEndPatterns.some(pattern => userAgent.includes(pattern));
    })();

    // Performance recommendations
    const shouldReduceAnimations = isLowEndDevice || isSlowConnection || 
      (window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    
    const shouldLazyLoad = isMobile || isSlowConnection;
    const shouldCompressImages = isSlowConnection || isLowEndDevice;

    setPerformanceMetrics({
      isSlowConnection,
      isLowEndDevice,
      shouldReduceAnimations,
      shouldLazyLoad,
      shouldCompressImages,
      networkInfo,
      memoryInfo,
    });
  }, [getNetworkInfo, getMemoryInfo, isMobile]);

  // Monitor performance metrics
  useEffect(() => {
    detectDeviceCapabilities();

    // Listen for network changes
    if ('connection' in navigator) {
      const connection = (navigator as unknown as { connection: NavigatorConnection }).connection;
      connection.addEventListener('change', detectDeviceCapabilities);
      
      return () => {
        connection.removeEventListener('change', detectDeviceCapabilities);
      };
    }
  }, [detectDeviceCapabilities]);

  // Performance optimization utilities
  const optimizeForMobile = useCallback((options: {
    enableLazyLoading?: boolean;
    reduceAnimations?: boolean;
    compressImages?: boolean;
  } = {}) => {
    const {
      enableLazyLoading = performanceMetrics.shouldLazyLoad,
      reduceAnimations = performanceMetrics.shouldReduceAnimations,
      compressImages = performanceMetrics.shouldCompressImages,
    } = options;

    return {
      lazyLoading: enableLazyLoading,
      animations: !reduceAnimations,
      imageCompression: compressImages,
      prefersReducedMotion: reduceAnimations,
    };
  }, [performanceMetrics]);

  // Image optimization helper
  const getOptimizedImageProps = useCallback((src: string, alt: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}) => {
    const { width, height, quality = 80 } = options;
    const { shouldCompressImages, shouldLazyLoad } = performanceMetrics;

    // Basic optimization - in a real app, you'd integrate with an image CDN
    const optimizedSrc = shouldCompressImages && quality < 90 ? 
      `${src}?quality=${quality}` : src;

    return {
      src: optimizedSrc,
      alt,
      loading: shouldLazyLoad ? 'lazy' as const : 'eager' as const,
      decoding: 'async' as const,
      ...(width && { width }),
      ...(height && { height }),
    };
  }, [performanceMetrics]);

  // Bundle loading helper
  const shouldLoadBundle = useCallback((bundleName: string) => {
    const { isSlowConnection, isLowEndDevice } = performanceMetrics;
    
    // Prioritize essential bundles on slow connections
    const essentialBundles = ['core', 'auth', 'dashboard'];
    const nonEssentialBundles = ['reports', 'advanced-charts', 'tax-calculator'];
    
    if (isSlowConnection || isLowEndDevice) {
      if (nonEssentialBundles.includes(bundleName)) {
        return false; // Defer loading
      }
    }
    
    return true;
  }, [performanceMetrics]);

  // Prefetch helper for mobile
  const prefetchResource = useCallback((url: string, priority: 'high' | 'low' = 'low') => {
    if (performanceMetrics.isSlowConnection) {
      return; // Skip prefetching on slow connections
    }

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.setAttribute('importance', priority);
    document.head.appendChild(link);
  }, [performanceMetrics.isSlowConnection]);

  return {
    ...performanceMetrics,
    optimizeForMobile,
    getOptimizedImageProps,
    shouldLoadBundle,
    prefetchResource,
    isMobileOptimized: isMobile || isTouchDevice,
  };
};
