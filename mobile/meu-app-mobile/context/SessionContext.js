import { createContext } from "react";

export const SessionContext = createContext({
  sessionData: null,
  setSessionData: () => {},
  notifications: [],
  unreadNotificationCount: 0,
  markNotificationRead: () => {},
  markAllNotificationsRead: () => {},
  vacancyFilters: {
    workModels: [],
    contractTypes: [],
    experienceLevels: [],
    workSchedules: [],
    salaryMin: "",
    salaryMax: "",
    city: "",
    state: "",
    sector: "",
  },
  setVacancyFilters: () => {},
});
