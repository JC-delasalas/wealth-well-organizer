import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '../StatsCard';
import { DollarSign } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Balance',
    value: '$1,234.56',
    change: 12.5,
    icon: DollarSign,
    trend: 'up' as const,
  };

  it('renders the stats card with correct information', () => {
    render(<StatsCard {...defaultProps} />);
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('displays negative change correctly', () => {
    render(<StatsCard {...defaultProps} change={-5.2} trend="down" />);
    
    expect(screen.getByText('-5.2%')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StatsCard {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
