import { render, screen, fireEvent, act } from '@testing-library/react';
import VoteButton from '@/components/features/VoteButton';

describe('VoteButton', () => {
  it('invokes vote and unvote callbacks depending on current state', async () => {
    const onVote = vi.fn().mockResolvedValue(undefined);
    const onUnvote = vi.fn().mockResolvedValue(undefined);

    const { rerender } = render(
      <VoteButton
        upvotes={3}
        downvotes={1}
        onVote={onVote}
        onUnvote={onUnvote}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTitle('Upvote'));
    });
    expect(onVote).toHaveBeenCalledWith('upvote');

    rerender(
      <VoteButton
        upvotes={3}
        downvotes={1}
        userVote="upvote"
        onVote={onVote}
        onUnvote={onUnvote}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTitle('Upvote'));
    });
    expect(onUnvote).toHaveBeenCalledWith('upvote');
  });

  it('respects disabled and layout props', () => {
    render(
      <VoteButton
        upvotes={0}
        downvotes={0}
        vertical
        disabled
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
    expect(buttons[1]).toBeDisabled();
  });
});
