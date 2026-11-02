import { Feather } from '@expo/vector-icons';
import { Stack, router, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import RecruiterNavigation from '../components/layout/RecruiterNavigation';
import { clearSession, getSession } from '../lib/api';
import { colors, theme } from '../lib/theme';

const privateRoutes = ['/home', '/candidaturas', '/vagas', '/mensagens', '/perfil'];
const routeTitles = {
  '/home': 'Início',
  '/candidaturas': 'Candidaturas',
  '/vagas': 'Vagas',
  '/mensagens': 'Mensagens',
  '/perfil': 'Meu perfil',
};

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'R';
}

export default function RootLayout() {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isRecruiterRoute = privateRoutes.includes(pathname);
  const [user, setUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    getSession().then(({ user: sessionUser }) => {
      if (active) setUser(sessionUser);
    });
    return () => {
      active = false;
    };
  }, [pathname]);

  const navigate = (path) => {
    setDrawerOpen(false);
    router.push(path);
  };

  const signOut = async () => {
    setDrawerOpen(false);
    setProfileMenuOpen(false);
    await clearSession();
    router.replace('/');
  };

  return (
    <View style={styles.root}>
      <Head>
        <title>Conecta Fácil</title>
      </Head>
      <StatusBar style="light" backgroundColor={colors.background} />
      {isRecruiterRoute && isDesktop ? (
        <RecruiterNavigation
          pathname={pathname}
          user={user}
          onNavigate={navigate}
          onSignOut={signOut}
        />
      ) : null}
      <View style={styles.main}>
        {isRecruiterRoute ? (
          <SafeAreaView style={styles.topbar}>
            {!isDesktop ? (
              <Pressable
                style={styles.topbarButton}
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Abrir menu de navegação"
                title="Abrir menu"
              >
                <Feather name="menu" size={20} color={colors.textPrimary} />
              </Pressable>
            ) : null}
            <Text style={styles.pageTitle}>{routeTitles[pathname] || 'Área do recrutador'}</Text>
            <Pressable
              style={styles.avatarButton}
              onPress={() => setProfileMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Abrir menu do perfil"
              accessibilityHint="Opções de perfil e saída da conta"
              title="Menu do perfil"
            >
              <Text style={styles.avatarText}>{getInitials(user?.full_name)}</Text>
            </Pressable>
          </SafeAreaView>
        ) : null}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        />
      </View>

      <Modal
        visible={isRecruiterRoute && !isDesktop && drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.drawerOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDrawerOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Fechar menu de navegação"
          />
          <RecruiterNavigation
            pathname={pathname}
            user={user}
            onNavigate={navigate}
            onSignOut={signOut}
            onClose={() => setDrawerOpen(false)}
            drawer
          />
        </View>
      </Modal>

      <Modal
        visible={isRecruiterRoute && profileMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileMenuOpen(false)}
      >
        <View style={styles.profileOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setProfileMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Fechar menu do perfil"
          />
          <View style={styles.profileMenu}>
            <Text style={styles.profileName}>{user?.full_name || 'Recrutador'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'Conta empresarial'}</Text>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.profileAction}
              onPress={() => {
                setProfileMenuOpen(false);
                navigate('/perfil');
              }}
              accessibilityRole="button"
              accessibilityLabel="Abrir meu perfil"
            >
              <Feather name="user" size={17} color={colors.textSecondary} />
              <Text style={styles.profileActionText}>Meu perfil</Text>
            </Pressable>
            <Pressable
              style={styles.profileAction}
              onPress={signOut}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <Feather name="log-out" size={17} color={colors.danger} />
              <Text style={styles.signOutText}>Sair</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: colors.background },
  main: { flex: 1, minWidth: 0, backgroundColor: colors.background },
  topbar: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[8],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topbarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing[3],
    borderRadius: theme.radii.medium,
    backgroundColor: colors.surface,
  },
  pageTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: theme.typography.subtitle,
    fontWeight: '700',
  },
  avatarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.radii.medium,
    backgroundColor: colors.surfaceElevated,
  },
  avatarText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.overlay,
  },
  profileOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 72,
    paddingRight: theme.spacing[4],
    backgroundColor: colors.overlay,
  },
  profileMenu: {
    width: 240,
    padding: theme.spacing[3],
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.radii.medium,
    ...theme.shadows.card,
  },
  profileName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  profileEmail: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  menuDivider: { height: 1, backgroundColor: colors.border, marginVertical: theme.spacing[2] },
  profileAction: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.radii.small,
  },
  profileActionText: { color: colors.textPrimary, fontSize: theme.typography.body, fontWeight: '600' },
  signOutText: { color: colors.danger, fontSize: theme.typography.body, fontWeight: '600' },
});
