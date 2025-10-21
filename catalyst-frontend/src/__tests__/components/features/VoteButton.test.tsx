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

  it('toggles downvotes, handles errors, and guards against missing handlers', async () => {
    const onVote = vi.fn().mockResolvedValue(undefined);
    const onUnvote = vi.fn().mockResolvedValue(undefined);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const { rerender } = render(
      <VoteButton
        upvotes={2}
        downvotes={5}
        onVote={vi.fn().mockRejectedValue(new Error('boom'))}
        onUnvote={onUnvote}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTitle('Upvote'));
    });
    expect(consoleSpy).toHaveBeenCalledWith('Failed to vote:', expect.any(Error));

    rerender(
      <VoteButton
        upvotes={2}
        downvotes={5}
        userVote="downvote"
        onVote={onVote}
        onUnvote={onUnvote}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTitle('Downvote'));
    });
    expect(onUnvote).toHaveBeenCalledWith('downvote');

    rerender(
      <VoteButton
        upvotes={2}
        downvotes={5}
        userVote="downvote"
        onVote={undefined}
        onUnvote={onUnvote}
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTitle('Downvote'));
    });
    expect(onUnvote).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
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
