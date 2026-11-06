import { createContext } from 'react';

export const SessionContext = createContext({
  sessionData: null,
  setSessionData: () => {},
  notifications: [],
  unreadNotificationCount: 0,
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
});
