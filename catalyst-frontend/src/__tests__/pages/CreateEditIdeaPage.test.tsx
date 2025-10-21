import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreateEditIdeaPage from '@/pages/CreateEditIdeaPage';
import { useIdeas } from '@/hooks';
import '@testing-library/jest-dom';

type UseIdeasMock = ReturnType<typeof vi.fn> & { mockReturnValue: (value: any) => void };

vi.mock('@/hooks', () => ({
  useIdeas: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

afterAll(() => {
  mockConsoleError.mockRestore();
});

const renderPage = (initialEntry = '/ideas/create') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/ideas/create" element={<CreateEditIdeaPage />} />
        <Route path="/ideas/:ideaId/edit" element={<CreateEditIdeaPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('CreateEditIdeaPage', () => {
  const getIdeaById = vi.fn();
  const createIdea = vi.fn();
  const updateIdea = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useIdeas as unknown as UseIdeasMock).mockReturnValue({
      getIdeaById,
      createIdea,
      updateIdea,
    });

    getIdeaById.mockResolvedValue({
      title: 'Existing idea',
      description: 'Existing description',
      category: 'Feature',
    });

    createIdea.mockResolvedValue(undefined);
    updateIdea.mockResolvedValue(undefined);
  });

  it('submits a new idea when form is valid', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Title'), 'New Idea');
    await user.selectOptions(screen.getByLabelText('Category'), 'Feature');
    await user.type(
      screen.getByLabelText('Description'),
      'A detailed description of the new idea.'
    );

    await user.click(screen.getByRole('button', { name: 'Submit Idea' }));

    await waitFor(() => {
      expect(createIdea).toHaveBeenCalledWith({
        title: 'New Idea',
        description: 'A detailed description of the new idea.',
        category: 'Feature',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/ideas');
  });

  it('loads existing idea data in edit mode and updates it', async () => {
    const user = userEvent.setup();
    renderPage('/ideas/idea-123/edit');

    await waitFor(() => {
      expect(getIdeaById).toHaveBeenCalledWith('idea-123');
    });

    expect(screen.getByDisplayValue('Existing idea')).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Updated Idea Title');
    await user.click(screen.getByRole('button', { name: 'Update Idea' }));

    await waitFor(() => {
      expect(updateIdea).toHaveBeenCalledWith('idea-123', {
        title: 'Updated Idea Title',
        description: 'Existing description',
        category: 'Feature',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/ideas');
  });

  it('prevents submission when required fields are missing', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Submit Idea' }));

    expect(await screen.findByText('Please enter a title')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Title'), 'Title only');
    await user.click(screen.getByRole('button', { name: 'Submit Idea' }));

    expect(await screen.findByText('Please enter a description')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Description'), 'Description only');
    await user.click(screen.getByRole('button', { name: 'Submit Idea' }));

    expect(await screen.findByText('Please select a category')).toBeInTheDocument();
    expect(createIdea).not.toHaveBeenCalled();
  });

  it('shows an error if loading an idea fails', async () => {
    getIdeaById.mockRejectedValueOnce(new Error('boom'));

    renderPage('/ideas/idea-123/edit');

    expect(await screen.findByText('Failed to load idea')).toBeInTheDocument();
    expect(mockConsoleError).toHaveBeenCalledWith('Failed to load idea:', expect.any(Error));
  });

  it('shows an error when save fails with a provided message', async () => {
    updateIdea.mockRejectedValueOnce(new Error('Save failed'));

    const user = userEvent.setup();
    renderPage('/ideas/idea-123/edit');

    await waitFor(() => {
      expect(getIdeaById).toHaveBeenCalled();
    });

    await user.click(screen.getByRole('button', { name: 'Update Idea' }));

    expect(await screen.findByText('Save failed')).toBeInTheDocument();
    expect(mockConsoleError).toHaveBeenCalledWith('Error saving idea:', expect.any(Error));
  });

  it('toggles preview mode for the description field', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByLabelText('Description'),
      'Preview this description'
    );

    await user.click(screen.getByRole('button', { name: 'Preview' }));
    expect(screen.getByText('Preview this description')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });
});
