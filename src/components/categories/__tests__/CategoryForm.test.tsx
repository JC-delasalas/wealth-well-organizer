import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoryForm } from '../CategoryForm';
import { useCategories } from '@/hooks/useCategories';

// Mock the hooks
jest.mock('@/hooks/useCategories');

const mockUseCategories = useCategories as jest.MockedFunction<typeof useCategories>;

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

describe('CategoryForm - CRUD Operations', () => {
  const mockCreateCategory = jest.fn();
  const mockUpdateCategory = jest.fn();
  const mockDeleteCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseCategories.mockReturnValue({
      categories: [],
      isLoading: false,
      createCategory: mockCreateCategory,
      updateCategory: mockUpdateCategory,
      deleteCategory: mockDeleteCategory,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    });
  });

  it('renders create form with all required fields', () => {
    render(
      <CategoryForm 
        trigger={<button>Create Category</button>}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Create Category'));

    expect(screen.getByText('Create New Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Category Color')).toBeInTheDocument();
  });

  it('submits form with correct data for new category', async () => {
    render(
      <CategoryForm 
        trigger={<button>Create Category</button>}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Create Category'));

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Category Name'), {
      target: { value: 'Food & Dining' }
    });
    fireEvent.change(screen.getByLabelText('Description (Optional)'), {
      target: { value: 'Restaurants and groceries' }
    });
    fireEvent.change(screen.getByDisplayValue('#3B82F6'), {
      target: { value: '#FF5733' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(mockCreateCategory).toHaveBeenCalledWith({
        name: 'Food & Dining',
        description: 'Restaurants and groceries',
        color: '#FF5733',
        type: 'expense',
      });
    });
  });

  it('renders edit form with existing category data', () => {
    const existingCategory = {
      id: '1',
      name: 'Transportation',
      description: 'Car, bus, and taxi expenses',
      color: '#10B981',
      type: 'expense' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    render(
      <CategoryForm 
        trigger={<button>Edit Category</button>}
        category={existingCategory}
        isEdit={true}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Edit Category'));

    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Transportation')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Car, bus, and taxi expenses')).toBeInTheDocument();
    expect(screen.getByDisplayValue('#10B981')).toBeInTheDocument();
  });

  it('calls updateCategory when editing existing category', async () => {
    const existingCategory = {
      id: '1',
      name: 'Transportation',
      description: 'Car, bus, and taxi expenses',
      color: '#10B981',
      type: 'expense' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    render(
      <CategoryForm 
        trigger={<button>Edit Category</button>}
        category={existingCategory}
        isEdit={true}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Edit Category'));

    // Modify the name
    const nameInput = screen.getByDisplayValue('Transportation');
    fireEvent.change(nameInput, {
      target: { value: 'Transport & Travel' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Update Category'));

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith({
        id: '1',
        name: 'Transport & Travel',
        description: 'Car, bus, and taxi expenses',
        color: '#10B981',
        type: 'expense',
      });
    });
  });

  it('shows loading state when creating', () => {
    mockUseCategories.mockReturnValue({
      categories: [],
      isLoading: false,
      createCategory: mockCreateCategory,
      updateCategory: mockUpdateCategory,
      deleteCategory: mockDeleteCategory,
      isCreating: true,
      isUpdating: false,
      isDeleting: false,
    });

    render(
      <CategoryForm 
        trigger={<button>Create Category</button>}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Create Category'));

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
  });

  it('shows loading state when updating', () => {
    const existingCategory = {
      id: '1',
      name: 'Transportation',
      description: 'Car, bus, and taxi expenses',
      color: '#10B981',
      type: 'expense' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    mockUseCategories.mockReturnValue({
      categories: [],
      isLoading: false,
      createCategory: mockCreateCategory,
      updateCategory: mockUpdateCategory,
      deleteCategory: mockDeleteCategory,
      isCreating: false,
      isUpdating: true,
      isDeleting: false,
    });

    render(
      <CategoryForm 
        trigger={<button>Edit Category</button>}
        category={existingCategory}
        isEdit={true}
      />, 
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByText('Edit Category'));

    expect(screen.getByText('Updating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /updating/i })).toBeDisabled();
  });
});
