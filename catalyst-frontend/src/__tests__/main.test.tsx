import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';

const StrictMode = React.StrictMode;

const rootMocks = vi.hoisted(() => {
  const renderMock = vi.fn();
  return {
    renderMock,
    createRootMock: vi.fn(() => ({ render: renderMock })),
  };
});

const appMock = vi.hoisted(() => ({
  component: vi.fn(() => <div data-testid="app" />),
}));

vi.mock('react-dom/client', () => ({
  createRoot: rootMocks.createRootMock,
}));

vi.mock('../App.tsx', () => ({
  default: appMock.component,
}));

describe('main entry point', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('creates the root and renders App inside StrictMode', async () => {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    vi.resetModules();
    await import('../main.tsx');

    expect(rootMocks.createRootMock).toHaveBeenCalledWith(rootElement);
    expect(rootMocks.renderMock).toHaveBeenCalled();

    const [[element]] = rootMocks.renderMock.mock.calls;
    expect(element.type).toBe(StrictMode);
    expect(element.props.children.type).toBe(appMock.component);
  });
});
