import { notificationStore } from '../../store';
import NotificationItem from '../../types/NotificationItem';

jest.useFakeTimers()

describe('Notification actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers()
  });

  describe('spawnNotification', () => {
    it('should add new notification', async () => {
      const contextMock = {
        commit: jest.fn(),
        state: {
          notifications: []
        }
      };
      const notification: NotificationItem = {
        type: 'success',
        message: 'Success text.',
        action1: { label: 'OK' }
      }
      const wrapper = (actions: any) => actions.spawnNotification(contextMock, notification);

      await wrapper(notificationStore.actions);

      expect(contextMock.commit).toBeCalledWith('add', notification);
    });

    it('should NOT add new notification if last one has the same message', async () => {
      const notification: NotificationItem = {
        type: 'success',
        message: 'Success text.',
        action1: { label: 'OK' }
      }
      const contextMock = {
        commit: jest.fn(),
        state: {
          notifications: [notification]
        }
      };
      const wrapper = (actions: any) => actions.spawnNotification(contextMock, notification);

      await wrapper(notificationStore.actions);

      expect(contextMock.commit).not.toBeCalledWith('add', notification);
    });

    it('should remove new notification after timeToLive (3000ms)', async () => {
      const dispatch = jest.fn()
      const contextMock = {
        dispatch,
        commit: jest.fn(),
        state: {
          notifications: []
        }
      };
      const notification: NotificationItem = {
        type: 'success',
        message: 'Success text.',
        action1: { label: 'OK' },
        timeToLive: 3000
      }
      const wrapper = (actions: any) => actions.spawnNotification(contextMock, notification);

      await wrapper(notificationStore.actions);

      expect(contextMock.dispatch).not.toHaveBeenLastCalledWith('removeNotification');

      jest.advanceTimersByTime(3000);

      expect(contextMock.dispatch).toHaveBeenLastCalledWith('removeNotification');
    });

    it('should NOT remove new notification if hasNoTimeout is set on true', async () => {
      const dispatch = jest.fn()
      const contextMock = {
        dispatch,
        commit: jest.fn(),
        state: {
          notifications: []
        }
      };
      const notification: NotificationItem = {
        type: 'success',
        message: 'Success text.',
        action1: { label: 'OK' },
        hasNoTimeout: true
      }
      const wrapper = (actions: any) => actions.spawnNotification(contextMock, notification);

      await wrapper(notificationStore.actions);

      jest.advanceTimersByTime(5000);

      expect(contextMock.dispatch).not.toHaveBeenLastCalledWith('removeNotification');
    });
  });

  describe('removeNotification', () => {
    it('should call \'remove\' commit with specific index', async () => {
      const contextMock = {
        commit: jest.fn(),
        state: {
          notifications: []
        }
      };
      const wrapper = (actions: any) => actions.removeNotification(contextMock, 1);

      await wrapper(notificationStore.actions);

      expect(contextMock.commit).toBeCalledWith('remove', 1);
    });

    it('if there is no index provided then should call \'remove\' commit with last index', async () => {
      const notification: NotificationItem = {
        type: 'success',
        message: 'Success text.',
        action1: { label: 'OK' }
      }
      const contextMock = {
        commit: jest.fn(),
        state: {
          notifications: [notification, notification]
        }
      };
      const wrapper = (actions: any) => actions.removeNotification(contextMock);

      await wrapper(notificationStore.actions);

      expect(contextMock.commit).toBeCalledWith('remove', 1);
    });
  })
})
