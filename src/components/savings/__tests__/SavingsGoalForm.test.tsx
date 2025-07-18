import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SavingsGoalForm } from '../SavingsGoalForm';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

// Mock the hooks
jest.mock('@/hooks/useSavingsGoals');

const mockUseSavingsGoals = useSavingsGoals as jest.MockedFunction<typeof useSavingsGoals>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('SavingsGoalForm', () => {
  const mockCreateSavingsGoal = jest.fn();
  const mockUpdateSavingsGoal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseSavingsGoals.mockReturnValue({
      savingsGoals: [],
      isLoading: false,
      createSavingsGoal: mockCreateSavingsGoal,
      updateSavingsGoal: mockUpdateSavingsGoal,
      isCreating: false,
      isUpdating: false,
    });
  });

  it('renders create form with all required fields', () => {
    render(
      <SavingsGoalForm 
        trigger={<button>Create Goal</button>}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Create Goal'));

    expect(screen.getByText('Create Savings Goal')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Amount ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Current Amount ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Savings Threshold (%)')).toBeInTheDocument();
  });

  it('submits form with correct data for new goal', async () => {
    render(
      <SavingsGoalForm 
        trigger={<button>Create Goal</button>}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Create Goal'));

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Goal Name'), {
      target: { value: 'Emergency Fund' }
    });
    fireEvent.change(screen.getByLabelText('Target Amount ($)'), {
      target: { value: '10000' }
    });
    fireEvent.change(screen.getByLabelText('Current Amount ($)'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByLabelText('Target Date'), {
      target: { value: '2025-12-31' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create Goal'));

    await waitFor(() => {
      expect(mockCreateSavingsGoal).toHaveBeenCalledWith({
        name: 'Emergency Fund',
        description: undefined,
        target_amount: 10000,
        current_amount: 1000,
        target_date: '2025-12-31',
        savings_percentage_threshold: 20,
        salary_date_1: 15,
        salary_date_2: 30,
      });
    });
  });

  it('renders edit form with existing goal data', () => {
    const existingGoal = {
      id: '1',
      user_id: 'user1',
      name: 'Vacation Fund',
      description: 'Save for summer vacation',
      target_amount: 5000,
      current_amount: 1500,
      target_date: '2025-06-01',
      savings_percentage_threshold: 25,
      salary_date_1: 15,
      salary_date_2: 30,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    render(
      <SavingsGoalForm 
        trigger={<button>Edit Goal</button>}
        goal={existingGoal}
        isEdit={true}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Edit Goal'));

    expect(screen.getByText('Update Savings Goal')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Vacation Fund')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Save for summer vacation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1500')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-06-01')).toBeInTheDocument();
  });

  it('shows loading state when creating', () => {
    mockUseSavingsGoals.mockReturnValue({
      savingsGoals: [],
      isLoading: false,
      createSavingsGoal: mockCreateSavingsGoal,
      updateSavingsGoal: mockUpdateSavingsGoal,
      isCreating: true,
      isUpdating: false,
    });

    render(
      <SavingsGoalForm 
        trigger={<button>Create Goal</button>}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Create Goal'));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });
});
