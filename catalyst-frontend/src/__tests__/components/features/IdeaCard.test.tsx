import { render, screen, fireEvent } from '@testing-library/react';
import { IdeaCard } from '@/components/features/IdeaCard';

const idea = {
  id: 'idea-1',
  title: 'Improve onboarding',
  description: 'Streamline the onboarding experience',
  category: 'Productivity',
  status: 'under_review',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  authorId: 'u1',
  author: {
    id: 'u1',
    displayName: 'Alice',
    email: 'alice@test.com',
    role: 'Contributor',
    eipPoints: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
  },
  upvotes: 4,
  downvotes: 1,
  commentCount: 2,
};

describe('IdeaCard', () => {
  it('renders idea details and triggers callbacks', () => {
    const onVote = vi.fn();
    const onComment = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <IdeaCard
        idea={idea as any}
        onVote={onVote}
        onComment={onComment}
        onEdit={onEdit}
        onDelete={onDelete}
        isPending
        isPendingVote
      />
    );

    expect(screen.getByText('Improve onboarding')).toBeInTheDocument();
    expect(screen.getByText('Posting...')).toBeInTheDocument();
    expect(screen.getByText('Updating...')).toBeInTheDocument();

    fireEvent.click(screen.getByText('👍 Upvote'));
    fireEvent.click(screen.getByText('👎 Downvote'));
    fireEvent.click(screen.getByText('💬 Comment'));
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Delete'));

    expect(onVote).toHaveBeenNthCalledWith(1, 'idea-1', 'upvote');
    expect(onVote).toHaveBeenNthCalledWith(2, 'idea-1', 'downvote');
    expect(onComment).toHaveBeenCalledWith('idea-1');
    expect(onEdit).toHaveBeenCalledWith('idea-1');
    expect(onDelete).toHaveBeenCalledWith('idea-1');
  });

  it('handles missing optional fields and fallback paths', () => {
    const minimalIdea = {
      id: 'idea-2',
      title: 'Anonymous concept',
      description: 'Details pending',
      status: 'mystery',
      createdAt: new Date('2024-02-02T00:00:00Z'),
      updatedAt: new Date('2024-02-02T00:00:00Z'),
      authorId: 'u2',
      upvotes: undefined,
      downvotes: undefined,
      commentCount: undefined,
    } as any;

    render(<IdeaCard idea={minimalIdea} />);

    expect(screen.queryByText('Posting...')).not.toBeInTheDocument();
    expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
    expect(screen.getByText(/by Anonymous/i)).toBeInTheDocument();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    expect(screen.getAllByText('0')[0]).toBeInTheDocument();
  });
});
