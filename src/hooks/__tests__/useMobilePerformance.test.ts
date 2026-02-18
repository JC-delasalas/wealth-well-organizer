import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMobilePerformance } from '../useMobilePerformance';

// Mock useDeviceInfo
const mockDeviceInfo = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchDevice: false,
  screenWidth: 1920,
  screenHeight: 1080,
  orientation: 'landscape' as const,
};

vi.mock('../use-mobile', () => ({
  useDeviceInfo: () => mockDeviceInfo,
}));

// Mock navigator APIs
const mockConnection = {
  effectiveType: '4g' as const,
  downlink: 10,
  rtt: 50,
  saveData: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockMemory = {
  usedJSHeapSize: 50000000,
  totalJSHeapSize: 100000000,
  jsHeapSizeLimit: 2147483648,
};

// Mock window.matchMedia (not available in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock global objects
Object.defineProperty(navigator, 'connection', {
  value: mockConnection,
  writable: true,
  configurable: true,
});

Object.defineProperty(navigator, 'hardwareConcurrency', {
  value: 8,
  writable: true,
  configurable: true,
});

Object.defineProperty(performance, 'memory', {
  value: mockMemory,
  writable: true,
  configurable: true,
});

describe('useMobilePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default values
    mockConnection.effectiveType = '4g';
    mockConnection.downlink = 10;
    mockConnection.rtt = 50;
    mockConnection.saveData = false;
    mockDeviceInfo.isMobile = false;
    mockDeviceInfo.isTouchDevice = false;

    // Restore navigator.connection and performance.memory to defaults
    Object.defineProperty(navigator, 'connection', {
      value: mockConnection,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 8,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(performance, 'memory', {
      value: mockMemory,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect fast connection', () => {
    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.isSlowConnection).toBe(false);
    expect(result.current.networkInfo).toEqual({
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
    });
  });

  it('should detect slow connection', () => {
    mockConnection.effectiveType = '2g';
    mockConnection.downlink = 0.5;

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.isSlowConnection).toBe(true);
  });

  it('should detect save data preference', () => {
    mockConnection.saveData = true;

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.isSlowConnection).toBe(true);
  });

  it('should detect high-end device', () => {
    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.isLowEndDevice).toBe(false);
  });

  it('should detect low-end device by CPU cores', () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 2,
      writable: true,
    });

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.isLowEndDevice).toBe(true);
  });

  it('should detect low-end device by memory', () => {
    Object.defineProperty(performance, 'memory', {
      value: {
        ...mockMemory,
        jsHeapSizeLimit: 500000000, // Less than 1GB
      },
      writable: true,
    });

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.isLowEndDevice).toBe(true);
  });

  it('should recommend performance optimizations for slow connection', () => {
    mockConnection.effectiveType = '2g';

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.shouldReduceAnimations).toBe(true);
    expect(result.current.shouldLazyLoad).toBe(true);
    expect(result.current.shouldCompressImages).toBe(true);
  });

  it('should recommend performance optimizations for low-end device', () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 2,
      writable: true,
    });

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.shouldReduceAnimations).toBe(true);
    expect(result.current.shouldCompressImages).toBe(true);
  });

  it('should optimize for mobile settings', () => {
    const { result } = renderHook(() => useMobilePerformance());

    const optimizations = result.current.optimizeForMobile({
      enableLazyLoading: true,
      reduceAnimations: false,
      compressImages: false,
    });

    expect(optimizations).toEqual({
      lazyLoading: true,
      animations: true,
      imageCompression: false,
      prefersReducedMotion: false,
    });
  });

  it('should generate optimized image props', () => {
    // shouldLazyLoad = isMobile || isSlowConnection, so set isMobile = true
    mockDeviceInfo.isMobile = true;

    const { result } = renderHook(() => useMobilePerformance());

    const imageProps = result.current.getOptimizedImageProps(
      'test.jpg',
      'Test image',
      { width: 800, height: 600, quality: 90 }
    );

    expect(imageProps).toEqual({
      src: 'test.jpg',
      alt: 'Test image',
      loading: 'lazy',
      decoding: 'async',
      width: 800,
      height: 600,
    });
  });

  it('should compress images on slow connection', () => {
    mockConnection.effectiveType = '2g';

    const { result } = renderHook(() => useMobilePerformance());

    const imageProps = result.current.getOptimizedImageProps(
      'test.jpg',
      'Test image',
      { quality: 80 }
    );

    expect(imageProps.src).toBe('test.jpg?quality=80');
  });

  it('should determine bundle loading strategy', () => {
    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.shouldLoadBundle('core')).toBe(true);
    expect(result.current.shouldLoadBundle('reports')).toBe(true);
  });

  it('should defer non-essential bundles on slow connection', () => {
    mockConnection.effectiveType = '2g';

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.shouldLoadBundle('core')).toBe(true);
    expect(result.current.shouldLoadBundle('reports')).toBe(false);
    expect(result.current.shouldLoadBundle('advanced-charts')).toBe(false);
  });

  it('should prefetch resources on fast connection', () => {
    // Render hook first so React rendering uses the real createElement
    const { result } = renderHook(() => useMobilePerformance());

    const mockLink = {
      rel: '',
      href: '',
      setAttribute: vi.fn(),
    };
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'link') return mockLink as unknown as HTMLElement;
      return originalCreateElement(tag);
    });
    const appendChildSpy = vi.spyOn(document.head, 'appendChild').mockImplementation(() => mockLink as unknown as Node);

    act(() => {
      result.current.prefetchResource('test.js', 'high');
    });

    expect(createElementSpy).toHaveBeenCalledWith('link');
    expect(mockLink.rel).toBe('prefetch');
    expect(mockLink.href).toBe('test.js');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('importance', 'high');
    expect(appendChildSpy).toHaveBeenCalledWith(mockLink);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  it('should skip prefetching on slow connection', () => {
    mockConnection.effectiveType = '2g';

    const { result } = renderHook(() => useMobilePerformance());

    // Set up spy AFTER render to avoid interfering with React
    const createElementSpy = vi.spyOn(document, 'createElement');

    act(() => {
      result.current.prefetchResource('test.js');
    });

    // createElement should not have been called with 'link' for prefetching
    const linkCalls = createElementSpy.mock.calls.filter(([tag]) => tag === 'link');
    expect(linkCalls).toHaveLength(0);

    createElementSpy.mockRestore();
  });

  it('should handle missing navigator.connection gracefully', () => {
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.networkInfo).toBeNull();
    expect(result.current.isSlowConnection).toBe(false);
  });

  it('should handle missing performance.memory gracefully', () => {
    Object.defineProperty(performance, 'memory', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useMobilePerformance());

    expect(result.current.memoryInfo).toBeNull();
  });
});
