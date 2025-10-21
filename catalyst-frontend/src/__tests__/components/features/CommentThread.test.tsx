import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import CommentThread from '@/components/features/CommentThread';

const baseComment = {
  id: 'c1',
  ideaId: 'i1',
  author: { id: 'u1', displayName: 'Alice', email: 'alice@test.com' },
  content: 'First comment',
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:00:00Z'),
  likeCount: 2,
};

describe('CommentThread', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading and empty states', () => {
    const { rerender } = render(
      <CommentThread comments={[]} ideaId="i1" loading />
    );

    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    rerender(<CommentThread comments={[]} ideaId="i1" />);
    expect(
      screen.getByText('No comments yet. Be the first to comment!')
    ).toBeInTheDocument();
  });

  it('supports replies, likes, and deletion', async () => {
    const onAddComment = vi.fn().mockResolvedValue(undefined);
    const onDeleteComment = vi.fn().mockResolvedValue(undefined);
    const onLikeComment = vi.fn().mockResolvedValue(undefined);
    const onReplyClick = vi.fn();

    render(
      <CommentThread
        comments={[
          {
            ...baseComment,
            replies: [
              {
                ...baseComment,
                id: 'c2',
                author: {
                  id: 'u2',
                  displayName: 'Bob',
                  email: 'bob@test.com',
                },
                content: 'Nested reply',
              },
            ],
          },
        ]}
        ideaId="i1"
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
        onLikeComment={onLikeComment}
        onReplyClick={onReplyClick}
      />
    );

    fireEvent.click(screen.getAllByText('Delete')[0]!);
    expect(onDeleteComment).toHaveBeenCalledWith('c1');

    fireEvent.click(screen.getAllByRole('button', { name: /🤍 2/ })[0]!);
    expect(onLikeComment).toHaveBeenCalledWith('c1');

    fireEvent.click(screen.getAllByText('Reply')[0]!);
    expect(onReplyClick).toHaveBeenCalledWith('c1');

    const input = screen.getByPlaceholderText('Write a reply...');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Thanks!' } });
    });
    const formContainer = input.closest('div')!.parentElement!.parentElement!;
    const submitReply = within(formContainer).getByRole('button', { name: 'Reply' });
    await act(async () => {
      fireEvent.click(submitReply);
    });

    expect(onAddComment).toHaveBeenCalledWith('Thanks!', 'c1');
    expect(screen.queryByPlaceholderText('Write a reply...')).not.toBeInTheDocument();
  });
});
