import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypingIndicator from '../../components/TypingIndicator';

describe('TypingIndicator Component', () => {
  it('should not render when users array is empty', () => {
    const { container } = render(<TypingIndicator users={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when users is undefined', () => {
    const { container } = render(
      <TypingIndicator users={undefined as unknown as string[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render typing indicator with single user', () => {
    const { container } = render(
      <TypingIndicator users={['Alice']} showLabel={true} />
    );
    expect(container.querySelector('.typing-indicator-container')).toBeTruthy();
  });

  it('should render animated dots', () => {
    const { container } = render(<TypingIndicator users={['Alice']} />);
    const dots = container.querySelectorAll('.dot');
    expect(dots.length).toBe(3);
  });

  it('should show single user name correctly', () => {
    render(<TypingIndicator users={['Alice']} showLabel={true} />);
    expect(screen.getByText(/Alice is typing/)).toBeTruthy();
  });

  it('should show multiple user names correctly', () => {
    render(
      <TypingIndicator users={['Alice', 'Bob']} showLabel={true} />
    );
    expect(screen.getByText(/Alice, Bob are typing/)).toBeTruthy();
  });

  it('should handle more than 3 users with +N more format', () => {
    render(
      <TypingIndicator users={['Alice', 'Bob', 'Charlie', 'Diana']} showLabel={true} />
    );
    expect(screen.getByText(/and 1 more/)).toBeTruthy();
  });

  it('should use correct grammar for singular', () => {
    render(<TypingIndicator users={['Alice']} showLabel={true} />);
    expect(screen.getByText(/is typing/)).toBeTruthy();
  });

  it('should use correct grammar for plural', () => {
    render(<TypingIndicator users={['Alice', 'Bob']} showLabel={true} />);
    expect(screen.getByText(/are typing/)).toBeTruthy();
  });

  it('should not show label when showLabel is false', () => {
    const { container } = render(
      <TypingIndicator users={['Alice']} showLabel={false} />
    );
    const label = container.querySelector('.typing-label');
    expect(label).toBeNull();
  });

  it('should have typing-indicator-container class', () => {
    const { container } = render(<TypingIndicator users={['Alice']} />);
    expect(
      container.querySelector('.typing-indicator-container')?.className
    ).toContain('typing-indicator-container');
  });

  it('should have typing-dots class', () => {
    const { container } = render(<TypingIndicator users={['Alice']} />);
    expect(
      container.querySelector('.typing-dots')?.className
    ).toContain('typing-dots');
  });
});
