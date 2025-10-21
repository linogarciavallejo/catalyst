import { describe, it, expect, beforeEach, vi } from 'vitest';
import NotificationService, { initNotifications } from '@/services/NotificationService';

const antdMocks = vi.hoisted(() => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    destroy: vi.fn(),
  },
  notification: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  modalConfirm: vi.fn(),
}));

vi.mock('antd', () => ({
  message: antdMocks.message,
  notification: antdMocks.notification,
  Modal: {
    confirm: antdMocks.modalConfirm,
  },
}));

type MockFn = ReturnType<typeof vi.fn>;

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (Object.values(antdMocks.message) as MockFn[]).forEach((mock) => mock.mockReset());
    (Object.values(antdMocks.notification) as MockFn[]).forEach((mock) => mock.mockReset());
    antdMocks.modalConfirm.mockReset();
  });

  it('initialises notifications with a simple flag', () => {
    expect(initNotifications()).toEqual({ initialized: true });
  });

  it('shows toast variants with default durations and overrides when provided', () => {
    NotificationService.success('Saved', 5);
    expect(antdMocks.message.success).toHaveBeenCalledWith({ content: 'Saved', duration: 5 });

    NotificationService.error('Oops');
    expect(antdMocks.message.error).toHaveBeenCalledWith({ content: 'Oops', duration: 5 });

    NotificationService.error('Bad', 'Detailed');
    expect(antdMocks.notification.error).toHaveBeenCalledWith({
      message: 'Bad',
      description: 'Detailed',
      duration: 5,
    });

    NotificationService.warning('Heads up');
    expect(antdMocks.message.warning).toHaveBeenCalledWith({ content: 'Heads up', duration: 4 });

    NotificationService.warning('Heads up', 'More info', 6);
    expect(antdMocks.notification.warning).toHaveBeenCalledWith({
      message: 'Heads up',
      description: 'More info',
      duration: 6,
    });

    NotificationService.info('FYI');
    expect(antdMocks.message.info).toHaveBeenCalledWith({ content: 'FYI', duration: 3 });

    NotificationService.info('FYI', 'extra');
    expect(antdMocks.notification.info).toHaveBeenCalledWith({
      message: 'FYI',
      description: 'extra',
      duration: 3,
    });
  });

  it('provides a loading handle that destroys the matching key', () => {
    const now = vi.spyOn(Date, 'now').mockReturnValue(1234);
    antdMocks.message.loading.mockImplementation(({ key }) => key);

    const dismiss = NotificationService.loading('Working...');
    expect(antdMocks.message.loading).toHaveBeenCalledWith({ content: 'Working...', key: 'loading_1234', duration: 0 });

    dismiss();
    expect(antdMocks.message.destroy).toHaveBeenCalledWith('loading_1234');

    now.mockRestore();
  });

  it('shows confirmation modal and forwards callbacks', () => {
    antdMocks.modalConfirm.mockImplementation((config) => {
      config.onOk?.();
      config.onCancel?.();
    });
    const onOk = vi.fn();
    const onCancel = vi.fn();

    NotificationService.confirm('Confirm?', 'Are you sure?', onOk, onCancel);

    expect(antdMocks.modalConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Confirm?',
        content: 'Are you sure?',
        okText: 'Confirm',
        cancelText: 'Cancel',
      })
    );
    expect(onOk).toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('supports confirmation modal without onCancel handler', () => {
    antdMocks.modalConfirm.mockImplementation((config) => {
      config.onOk?.();
      config.onCancel?.();
    });

    const onOk = vi.fn();

    NotificationService.confirm('Confirm?', 'Are you sure?', onOk);

    expect(onOk).toHaveBeenCalled();
  });

  it('opens persistent notifications with forced placement and duration', () => {
    NotificationService.persistent('Title', 'Body', 'success');
    expect(antdMocks.notification.success).toHaveBeenCalledWith({
      message: 'Title',
      description: 'Body',
      duration: 0,
      placement: 'topRight',
    });

    NotificationService.persistent('Info', 'Details');
    expect(antdMocks.notification.info).toHaveBeenCalledWith({
      message: 'Info',
      description: 'Details',
      duration: 0,
      placement: 'topRight',
    });
  });
});
