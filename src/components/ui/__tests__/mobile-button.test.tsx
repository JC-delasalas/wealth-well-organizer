import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MobileButton } from '../mobile-button';

// Mock useDeviceInfo hook
const mockDeviceInfo = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isTouchDevice: false,
  screenWidth: 1920,
  screenHeight: 1080,
  orientation: 'landscape' as const,
};

vi.mock('@/hooks/use-mobile', () => ({
  useDeviceInfo: () => mockDeviceInfo,
}));

describe('MobileButton', () => {
  it('should render with default props', () => {
    render(<MobileButton>Click me</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('h-10'); // default size
  });

  it('should apply mobile size on touch devices', () => {
    mockDeviceInfo.isTouchDevice = true;
    
    render(<MobileButton size="sm">Touch Button</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Touch Button' });
    expect(button).toHaveClass('h-11'); // mobile-sm size
  });

  it('should not apply mobile size when autoMobileSize is false', () => {
    mockDeviceInfo.isTouchDevice = true;
    
    render(
      <MobileButton size="sm" autoMobileSize={false}>
        No Auto Size
      </MobileButton>
    );
    
    const button = screen.getByRole('button', { name: 'No Auto Size' });
    expect(button).toHaveClass('h-9'); // original sm size
  });

  it('should apply correct mobile sizes for different variants', () => {
    mockDeviceInfo.isTouchDevice = true;
    
    // Test mobile-default
    const { rerender } = render(<MobileButton size="default">Default</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('h-12');
    
    // Test mobile-lg
    rerender(<MobileButton size="lg">Large</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('h-14');
    
    // Test mobile-icon
    rerender(<MobileButton size="icon">Icon</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('h-12', 'w-12');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    
    render(<MobileButton onClick={handleClick}>Clickable</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Clickable' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<MobileButton disabled>Disabled Button</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('should apply different variants correctly', () => {
    const { rerender } = render(<MobileButton variant="default">Default</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary', 'text-primary-foreground');
    
    rerender(<MobileButton variant="destructive">Destructive</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive', 'text-destructive-foreground');
    
    rerender(<MobileButton variant="outline">Outline</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('border', 'border-input');
    
    rerender(<MobileButton variant="secondary">Secondary</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('bg-secondary', 'text-secondary-foreground');
    
    rerender(<MobileButton variant="ghost">Ghost</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-accent');
    
    rerender(<MobileButton variant="link">Link</MobileButton>);
    expect(screen.getByRole('button')).toHaveClass('text-primary', 'underline-offset-4');
  });

  it('should apply custom className', () => {
    render(<MobileButton className="custom-class">Custom</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Custom' });
    expect(button).toHaveClass('custom-class');
  });

  it('should render as child component when asChild is true', () => {
    render(
      <MobileButton asChild>
        <a href="/test">Link Button</a>
      </MobileButton>
    );
    
    const link = screen.getByRole('link', { name: 'Link Button' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should apply mobile-fab size correctly', () => {
    mockDeviceInfo.isTouchDevice = true;
    
    render(<MobileButton size="mobile-fab">FAB</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'FAB' });
    expect(button).toHaveClass('h-16', 'w-16', 'rounded-full', 'shadow-lg');
  });

  it('should maintain accessibility attributes', () => {
    render(
      <MobileButton 
        aria-label="Accessible button"
        aria-describedby="button-description"
      >
        Button
      </MobileButton>
    );
    
    const button = screen.getByRole('button', { name: 'Accessible button' });
    expect(button).toHaveAttribute('aria-label', 'Accessible button');
    expect(button).toHaveAttribute('aria-describedby', 'button-description');
  });

  it('should handle keyboard navigation', () => {
    const handleClick = vi.fn();
    
    render(<MobileButton onClick={handleClick}>Keyboard Button</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Keyboard Button' });
    
    // Focus the button
    button.focus();
    expect(button).toHaveFocus();
    
    // Press Enter
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    fireEvent.keyUp(button, { key: 'Enter', code: 'Enter' });
    
    // Press Space
    fireEvent.keyDown(button, { key: ' ', code: 'Space' });
    fireEvent.keyUp(button, { key: ' ', code: 'Space' });
    
    // Button should be clickable via keyboard
    expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
  });

  it('should apply correct touch target sizes for accessibility', () => {
    mockDeviceInfo.isTouchDevice = true;
    
    const { rerender } = render(<MobileButton size="sm">Small Touch</MobileButton>);
    const button = screen.getByRole('button');
    
    // Mobile-sm should be at least 44px (h-11 = 44px)
    expect(button).toHaveClass('h-11');
    
    rerender(<MobileButton size="default">Default Touch</MobileButton>);
    // Mobile-default should be 48px (h-12 = 48px)
    expect(button).toHaveClass('h-12');
    
    rerender(<MobileButton size="lg">Large Touch</MobileButton>);
    // Mobile-lg should be 56px (h-14 = 56px)
    expect(button).toHaveClass('h-14');
  });

  it('should not apply mobile sizes on desktop devices', () => {
    mockDeviceInfo.isTouchDevice = false;
    
    render(<MobileButton size="sm">Desktop Button</MobileButton>);
    
    const button = screen.getByRole('button', { name: 'Desktop Button' });
    expect(button).toHaveClass('h-9'); // Original sm size
    expect(button).not.toHaveClass('h-11'); // Not mobile-sm size
  });
});
