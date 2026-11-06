import React, { useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';
import { SessionContext } from '../context/SessionContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { apiFetch } from '../lib/api';

function blurFocusedWebElement() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.activeElement?.blur?.();
  }
}

export default function RootLayout() {
  const [sessionData, setSessionData] = useState(null);
  const [notificationState, setNotificationState] = useState({ userId: null, items: [] });
  const seenMessageIds = useRef(new Set());
  const notificationsEnabled = useRef(true);
  const sessionUser = sessionData?.user;
  const userId = sessionUser?.id;
  const userType = sessionUser?.user_type;

  useEffect(() => {
    notificationsEnabled.current = sessionUser?.active_notification !== false;
  }, [sessionUser?.active_notification]);

  useEffect(() => {
    if (!userId) {
      seenMessageIds.current = new Set();
      return undefined;
    }

    let active = true;
    let initialized = false;
    let polling = false;
    let hasLoggedError = false;
    seenMessageIds.current = new Set();

    const checkForMessages = async () => {
      if (polling) return;
      polling = true;
      try {
        const response = await apiFetch('/messages');
        if (!active) return;
        hasLoggedError = false;

        const messages = response.messages || [];
        if (!initialized) {
          messages.forEach((message) => seenMessageIds.current.add(String(message.id)));
          initialized = true;
          return;
        }

        const incomingMessages = messages.filter((message) => {
          const id = String(message.id);
          if (seenMessageIds.current.has(id)) return false;
          seenMessageIds.current.add(id);
          return String(message.sender_id) !== String(userId);
        });

        if (incomingMessages.length && notificationsEnabled.current) {
          const newNotifications = incomingMessages.map((message) => ({
            id: String(message.id),
            applicationId: message.application_id,
            title: userType === 'RECRUITER'
              ? message.candidate_name || 'Candidato'
              : message.recruiter_name || 'Empresa',
            jobTitle: message.job_title || 'Conversa',
            body: message.body,
            createdAt: message.created_at,
          }));
          setNotificationState((current) => {
            const currentItems = current.userId === userId ? current.items : [];
            return {
              userId,
              items: [
                ...newNotifications.filter((item) => !currentItems.some((notification) => notification.id === item.id)),
                ...currentItems,
              ].slice(0, 30),
            };
          });
        }
      } catch (error) {
        if (active && !hasLoggedError) {
          console.warn('Não foi possível verificar novas mensagens.', error);
          hasLoggedError = true;
        }
      } finally {
        polling = false;
      }
    };

    checkForMessages();
    const interval = setInterval(checkForMessages, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [userId, userType]);

  const markNotificationRead = (notificationId) => {
    setNotificationState((current) => ({
      ...current,
      items: current.userId === userId
        ? current.items.filter((item) => item.id !== String(notificationId))
        : current.items,
    }));
  };
  const markAllNotificationsRead = () => {
    setNotificationState((current) => (
      current.userId === userId ? { ...current, items: [] } : current
    ));
  };
  const notifications = notificationState.userId === userId ? notificationState.items : [];

  return (
    <SessionContext.Provider value={{
      sessionData,
      setSessionData,
      notifications,
      unreadNotificationCount: notifications.length,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      <PreferencesProvider
        userId={sessionData?.user?.id}
        initialPreferences={sessionData?.preferences}
      >
        <Stack
          screenListeners={{
            blur: blurFocusedWebElement,
          }}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            // Opcional: define uma cor de fundo padrão para evitar flashes brancos durante a transição de tela
            contentStyle: { backgroundColor: 'transparent' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="carregando" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </PreferencesProvider>
    </SessionContext.Provider>
  );
}