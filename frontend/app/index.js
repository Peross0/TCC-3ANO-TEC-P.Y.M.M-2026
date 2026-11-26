import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useHydratedWidth } from '../lib/useHydratedWidth';

const palette = {
  background: '#0D1117',
  surface: '#171E29',
  surfaceRaised: '#1D2734',
  border: '#293544',
  blue: '#48BCEB',
  blueSoft: '#143044',
  text: '#E5EAF0',
  secondary: '#A0ACB9',
  muted: '#7E8B99',
  darkText: '#08202D',
  green: '#68D5AE',
};

const benefits = [
  {
    number: '01',
    icon: 'briefcase',
    title: 'Oportunidades mais claras',
    text: 'Vagas bem apresentadas ajudam cada pessoa a entender o que a empresa procura.',
  },
  {
    number: '02',
    icon: 'users',
    title: 'Conexões com propósito',
    text: 'Aproxime empresas e profissionais que compartilham objetivos e vontade de crescer.',
  },
  {
    number: '03',
    icon: 'layers',
    title: 'Gestão sem complicação',
    text: 'Organize o perfil e acompanhe suas oportunidades em um só lugar.',
  },
];

const webFont = Platform.select({
  web: 'Inter, Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: undefined,
});

function navigateFromPress(callback, event) {
  if (Platform.OS === 'web') event?.currentTarget?.blur?.();
  callback();
}

function Brand({ onPress, footer = false }) {
  return (
    <Pressable
      style={[styles.brand, footer && styles.footerBrand]}
      onPress={(event) => navigateFromPress(onPress, event)}
      accessibilityRole="button"
      accessibilityLabel="Conecta Fácil, voltar ao início"
    >
      <View style={[styles.brandMark, footer && styles.footerBrandMark]}>
        <Feather name="link-2" size={footer ? 15 : 18} color={palette.darkText} />
      </View>
      <Text style={[styles.brandName, footer && styles.footerBrandName]}>Conecta Fácil</Text>
    </Pressable>
  );
}

function NavigationAction({ label, onPress, compact = false }) {
  return (
    <Pressable
      style={({ hovered, pressed }) => [
        styles.navAction,
        compact && styles.navActionCompact,
        hovered && styles.navActionHovered,
        pressed && styles.navActionPressed,
      ]}
      onPress={(event) => navigateFromPress(onPress, event)}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.navActionText, compact && styles.navActionTextCompact]}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ label, icon, onPress, secondary = false, wide = false, accessibilityHint }) {
  return (
    <Pressable
      style={({ hovered, pressed }) => [
        styles.actionButton,
        secondary ? styles.secondaryButton : styles.primaryButton,
        wide && styles.actionButtonWide,
        hovered && (secondary ? styles.secondaryButtonHovered : styles.primaryButtonHovered),
        pressed && styles.buttonPressed,
      ]}
      onPress={(event) => navigateFromPress(onPress, event)}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <Text style={[styles.actionButtonText, secondary && styles.secondaryButtonText]}>{label}</Text>
      <Feather
        name={icon}
        size={17}
        color={secondary ? palette.blue : palette.darkText}
      />
    </Pressable>
  );
}

function FlowStep({ icon, label, index, last }) {
  return (
    <View style={styles.flowStep}>
      <View style={styles.flowStepTop}>
        <View style={[styles.flowIcon, index === 1 && styles.flowIconMiddle]}>
          <Feather name={icon} size={19} color={index === 1 ? palette.darkText : palette.blue} />
        </View>
        {!last && (
          <View style={styles.flowConnector}>
            <View style={styles.flowConnectorLine} />
            <Feather name="arrow-right" size={14} color={palette.blue} />
          </View>
        )}
      </View>
      <Text style={styles.flowLabel}>{label}</Text>
      <Text style={styles.flowCaption}>{index === 0 ? 'Perfil da empresa' : index === 1 ? 'Vaga bem definida' : 'Pessoas conectadas'}</Text>
    </View>
  );
}

function BenefitCard({ benefit }) {
  const [hovered, setHovered] = useState(false);

  return (
    <View
      style={[styles.benefitCard, hovered && styles.benefitCardHovered]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <View style={styles.benefitCardTop}>
        <View style={styles.benefitIcon}>
          <Feather name={benefit.icon} size={19} color={palette.blue} />
        </View>
        <Text style={styles.benefitNumber}>{benefit.number}</Text>
      </View>
      <Text style={styles.benefitTitle} accessibilityRole="header" aria-level={3}>{benefit.title}</Text>
      <Text style={styles.benefitText}>{benefit.text}</Text>
    </View>
  );
}

export default function LandingPage() {
  const width = useHydratedWidth();
  const scrollRef = useRef(null);
  const [benefitsY, setBenefitsY] = useState(0);
  const isWide = width >= 880;
  const isCompact = width < 760;

  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });
  const scrollToBenefits = () => scrollRef.current?.scrollTo({ y: benefitsY, animated: true });
  const goToRegister = () => router.push({ pathname: '/login', params: { cadastro: '1' } });
  const goToCandidates = () => router.push('/candidato');
  const goToLogin = () => router.push('/login');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerOuter}>
          <View style={[styles.header, isCompact && styles.headerCompact]}>
            <View style={styles.headerMain}>
              <Brand onPress={scrollToTop} />
              {!isCompact && (
                <View style={styles.navigation}>
                  <NavigationAction label="Início" onPress={scrollToTop} />
                  <NavigationAction label="Para candidatos" onPress={goToCandidates} />
                  <NavigationAction label="Para empresas" onPress={goToRegister} />
                </View>
              )}
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.loginButton,
                  hovered && styles.loginButtonHovered,
                  pressed && styles.buttonPressed,
                ]}
                onPress={(event) => navigateFromPress(goToLogin, event)}
                accessibilityRole="button"
                accessibilityLabel="Entrar na conta de recrutador"
              >
                <Text style={styles.loginButtonText}>Entrar</Text>
                <Feather name="arrow-up-right" size={16} color={palette.text} />
              </Pressable>
            </View>
            {isCompact && (
              <View style={styles.compactNavigation}>
                <NavigationAction compact label="Início" onPress={scrollToTop} />
                <NavigationAction compact label="Para candidatos" onPress={goToCandidates} />
                <NavigationAction compact label="Para empresas" onPress={goToRegister} />
              </View>
            )}
          </View>
        </View>

        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={styles.heroCopy}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowLine} />
              <Text style={styles.eyebrow}>TALENTOS E EMPRESAS, MAIS PERTO</Text>
            </View>
            <Text
              style={[styles.heroTitle, { fontSize: width < 400 ? 37 : isWide ? 50 : 43, lineHeight: width < 400 ? 45 : isWide ? 59 : 52 }]}
              accessibilityRole="header"
              aria-level={1}
            >
              O próximo bom encontro profissional pode começar aqui.
            </Text>
            <Text style={styles.heroDescription}>
              O Conecta Fácil ajuda empresas a encontrar oportunidades e pessoas prontas para crescer junto.
            </Text>
            <View style={[styles.heroActions, !isWide && styles.heroActionsStacked]}>
              <ActionButton
                label="Encontrar oportunidades"
                icon="arrow-right"
                onPress={goToCandidates}
                wide={!isWide}
                accessibilityHint="Abre a área de candidaturas disponível no portal"
              />
              <ActionButton
                label="Sou uma empresa"
                icon="briefcase"
                onPress={goToRegister}
                secondary
                wide={!isWide}
                accessibilityHint="Abre o cadastro empresarial"
              />
            </View>
            <View style={styles.trustNote}>
              <View style={styles.trustIcon}><Feather name="shield" size={14} color={palette.green} /></View>
              <Text style={styles.trustText}>Um espaço claro para criar conexões de trabalho.</Text>
            </View>
          </View>

          <View
            style={[styles.visualWrap, isWide && styles.visualWrapWide]}
            accessible
            accessibilityLabel="Ilustração do fluxo entre empresa, oportunidade e talento"
          >
            <View style={styles.visualGlow} />
            <View style={styles.visualCard}>
              <View style={styles.visualHeader}>
                <View>
                  <Text style={styles.visualEyebrow}>CONEXÕES QUE MOVEM</Text>
                  <Text style={styles.visualTitle}>Da oportunidade à conversa</Text>
                </View>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>Conectando</Text>
                </View>
              </View>
              <Text style={styles.visualSubtitle}>Um caminho direto, sem etapas desnecessárias.</Text>
              <View style={styles.flowPanel}>
                <View style={styles.flowLine}>
                  <FlowStep icon="briefcase" label="Empresa" index={0} />
                  <FlowStep icon="file-text" label="Oportunidade" index={1} />
                  <FlowStep icon="user" label="Talento" index={2} last />
                </View>
              </View>
              <View style={styles.visualFooter}>
                <View style={styles.visualFooterIcon}><Feather name="check" size={14} color={palette.darkText} /></View>
                <Text style={styles.visualFooterText}>Mais clareza para os dois lados.</Text>
                <Feather name="arrow-up-right" size={16} color={palette.muted} />
              </View>
            </View>
            <View style={styles.visualNote}>
              <View style={styles.visualNoteIcon}><Feather name="message-circle" size={16} color={palette.blue} /></View>
              <View style={styles.visualNoteCopy}>
                <Text style={styles.visualNoteTitle}>Uma boa conexão começa com clareza.</Text>
                <Text style={styles.visualNoteText}>Da vaga publicada ao primeiro contato.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.benefitSection} onLayout={(event) => setBenefitsY(event.nativeEvent.layout.y)}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionEyebrowWrap}>
              <Feather name="star" size={14} color={palette.blue} />
              <Text style={styles.sectionEyebrow}>FEITO PARA O DIA A DIA</Text>
            </View>
            <Text style={styles.sectionTitle} accessibilityRole="header" aria-level={2}>Menos ruído. Mais boas conexões.</Text>
            <Text style={styles.sectionDescription}>
              Uma experiência pensada para aproximar quem oferece uma oportunidade de quem pode fazer parte dela.
            </Text>
          </View>
          <View style={[styles.benefitGrid, isWide && styles.benefitGridWide]}>
            {benefits.map((benefit) => <BenefitCard key={benefit.number} benefit={benefit} />)}
          </View>
        </View>

        <View style={styles.ctaOuter}>
          <View style={[styles.cta, isWide && styles.ctaWide]}>
            <View style={styles.ctaDecoration} />
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaEyebrow}>CONECTA FÁCIL</Text>
              <Text style={styles.ctaTitle} accessibilityRole="header" aria-level={2}>Sua próxima oportunidade começa aqui.</Text>
              <Text style={styles.ctaDescription}>
                Crie sua conta e descubra novas possibilidades com o Conecta Fácil.
              </Text>
            </View>
            <ActionButton label="Começar agora" icon="arrow-right" onPress={goToRegister} wide={!isWide} />
          </View>
        </View>

        <View style={styles.footerOuter}>
          <View style={styles.footer}>
            <View style={[styles.footerMain, isWide && styles.footerMainWide]}>
              <View style={styles.footerIdentity}>
                <Brand onPress={scrollToTop} footer />
                <Text style={styles.footerDescription}>
                  Conexões profissionais começam com proximidade, confiança e boas oportunidades.
                </Text>
              </View>
              <View style={styles.footerLinksGroup}>
                <Text style={styles.footerHeading}>INSTITUCIONAL</Text>
                <NavigationAction label="Início" onPress={scrollToTop} />
                <NavigationAction label="A plataforma" onPress={scrollToBenefits} />
              </View>
              <View style={styles.footerLinksGroup}>
                <Text style={styles.footerHeading}>PARA CANDIDATOS</Text>
                <NavigationAction label="Para candidatos" onPress={goToCandidates} />
              </View>
              <View style={styles.footerLinksGroup}>
                <Text style={styles.footerHeading}>PARA EMPRESAS</Text>
                <NavigationAction label="Criar uma conta" onPress={goToRegister} />
                <NavigationAction label="Entrar" onPress={goToLogin} />
              </View>
            </View>
            <View style={styles.footerBottom}>
              <Text style={styles.copyright}>© 2026 Conecta Fácil. Todos os direitos reservados.</Text>
              <Text style={styles.footerTagline}>Talentos e empresas, mais perto.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: palette.background },
  scrollContent: { flexGrow: 1, alignItems: 'center', backgroundColor: palette.background },
  headerOuter: { width: '100%', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: palette.border },
  header: { width: '100%', maxWidth: 1240, minHeight: 76, justifyContent: 'center', paddingHorizontal: 28 },
  headerCompact: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  headerMain: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 11, minHeight: 44 },
  brandMark: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: palette.blue },
  brandName: { color: palette.text, fontSize: 17, fontWeight: '700', letterSpacing: -0.5, fontFamily: webFont },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  navAction: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 9 },
  navActionCompact: { minHeight: 38, paddingHorizontal: 10 },
  navActionHovered: { backgroundColor: palette.surface },
  navActionPressed: { opacity: 0.74 },
  navActionText: { color: palette.secondary, fontSize: 13, fontWeight: '500', fontFamily: webFont },
  navActionTextCompact: { fontSize: 11 },
  compactNavigation: { minHeight: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: palette.border },
  loginButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: palette.border, borderRadius: 10, backgroundColor: palette.surface },
  loginButtonHovered: { borderColor: palette.blue, backgroundColor: palette.surfaceRaised },
  loginButtonText: { color: palette.text, fontSize: 13, fontWeight: '600', fontFamily: webFont },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  hero: { width: '100%', maxWidth: 1240, paddingHorizontal: 28, paddingTop: 58, paddingBottom: 66 },
  heroWide: { minHeight: 620, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 64, paddingTop: 74, paddingBottom: 82 },
  heroCopy: { flex: 1, maxWidth: 575, alignItems: 'flex-start' },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 21 },
  eyebrowLine: { width: 25, height: 2, borderRadius: 1, backgroundColor: palette.blue },
  eyebrow: { color: palette.blue, fontSize: 10, fontWeight: '700', letterSpacing: 1.65, fontFamily: webFont },
  heroTitle: { color: palette.text, maxWidth: 570, fontWeight: '700', letterSpacing: -1.65, fontFamily: webFont },
  heroDescription: { maxWidth: 490, color: palette.secondary, fontSize: 16, lineHeight: 26, marginTop: 18, fontFamily: webFont },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 28 },
  heroActionsStacked: { width: '100%', alignItems: 'stretch' },
  actionButton: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 19, borderRadius: 10 },
  actionButtonWide: { width: '100%' },
  primaryButton: { backgroundColor: palette.blue },
  primaryButtonHovered: { backgroundColor: '#67C9F0' },
  secondaryButton: { borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  secondaryButtonHovered: { borderColor: palette.blue, backgroundColor: palette.surfaceRaised },
  actionButtonText: { color: palette.darkText, fontSize: 13, fontWeight: '700', fontFamily: webFont },
  secondaryButtonText: { color: palette.text },
  trustNote: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 25 },
  trustIcon: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#173029' },
  trustText: { color: palette.muted, fontSize: 12, fontFamily: webFont },
  visualWrap: { width: '100%', maxWidth: 540, alignSelf: 'center', marginTop: 49, position: 'relative' },
  visualWrapWide: { flex: 0.95, maxWidth: 550, marginTop: 0 },
  visualGlow: { position: 'absolute', top: '14%', left: '12%', right: '12%', bottom: '20%', borderRadius: 120, backgroundColor: '#10293A', opacity: 0.72 },
  visualCard: { padding: 27, borderWidth: 1, borderColor: '#304153', borderRadius: 19, backgroundColor: palette.surface },
  visualHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  visualEyebrow: { color: palette.blue, fontSize: 9, fontWeight: '700', letterSpacing: 1.6, fontFamily: webFont },
  visualTitle: { color: palette.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.4, marginTop: 9, fontFamily: webFont },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderWidth: 1, borderColor: '#2D4B4A', borderRadius: 20, backgroundColor: '#172D30' },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: palette.green },
  statusText: { color: '#A6D8C8', fontSize: 9, fontWeight: '600', fontFamily: webFont },
  visualSubtitle: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 7, fontFamily: webFont },
  flowPanel: { marginTop: 25, paddingHorizontal: 14, paddingVertical: 20, borderWidth: 1, borderColor: palette.border, borderRadius: 13, backgroundColor: palette.background },
  flowLine: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  flowStep: { flex: 1, minWidth: 0, alignItems: 'center' },
  flowStepTop: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  flowIcon: { width: 46, height: 46, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2C5266', borderRadius: 14, backgroundColor: '#152A38' },
  flowIconMiddle: { borderColor: '#397F9D', backgroundColor: palette.blue },
  flowConnector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  flowConnectorLine: { flex: 1, height: 1, backgroundColor: '#344453' },
  flowLabel: { color: palette.text, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 11, fontFamily: webFont },
  flowCaption: { color: palette.muted, fontSize: 9, textAlign: 'center', marginTop: 4, fontFamily: webFont },
  visualFooter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: palette.border },
  visualFooterIcon: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: palette.blue },
  visualFooterText: { flex: 1, color: palette.secondary, fontSize: 11, fontWeight: '500', fontFamily: webFont },
  visualNote: { flexDirection: 'row', alignItems: 'center', gap: 11, alignSelf: 'flex-end', maxWidth: '92%', marginTop: -18, marginRight: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#304153', borderRadius: 12, backgroundColor: palette.surfaceRaised },
  visualNoteIcon: { width: 31, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: palette.blueSoft },
  visualNoteCopy: { flex: 1, minWidth: 0 },
  visualNoteTitle: { color: palette.text, fontSize: 10, fontWeight: '600', fontFamily: webFont },
  visualNoteText: { color: palette.muted, fontSize: 9, marginTop: 3, fontFamily: webFont },
  benefitSection: { width: '100%', maxWidth: 1240, paddingHorizontal: 28, paddingTop: 65, paddingBottom: 75, borderTopWidth: 1, borderTopColor: palette.border },
  sectionHeading: { maxWidth: 680 },
  sectionEyebrowWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionEyebrow: { color: palette.blue, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, fontFamily: webFont },
  sectionTitle: { color: palette.text, fontSize: 32, lineHeight: 41, fontWeight: '700', letterSpacing: -0.9, fontFamily: webFont },
  sectionDescription: { color: palette.secondary, fontSize: 14, lineHeight: 23, marginTop: 11, fontFamily: webFont },
  benefitGrid: { gap: 13, marginTop: 31 },
  benefitGridWide: { flexDirection: 'row', alignItems: 'stretch' },
  benefitCard: { flex: 1, minHeight: 210, padding: 22, borderWidth: 1, borderColor: palette.border, borderRadius: 14, backgroundColor: palette.surface, ...Platform.select({ web: { transitionDuration: '180ms' }, default: {} }) },
  benefitCardHovered: { borderColor: '#3A718B', backgroundColor: palette.surfaceRaised, transform: [{ translateY: -2 }] },
  benefitCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  benefitIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#29475A', borderRadius: 12, backgroundColor: palette.blueSoft },
  benefitNumber: { color: '#667484', fontSize: 11, fontWeight: '700', letterSpacing: 1, fontFamily: webFont },
  benefitTitle: { color: palette.text, fontSize: 16, fontWeight: '700', marginBottom: 9, fontFamily: webFont },
  benefitText: { color: palette.secondary, fontSize: 12, lineHeight: 20, fontFamily: webFont },
  ctaOuter: { width: '100%', alignItems: 'center', paddingHorizontal: 20 },
  cta: { width: '100%', maxWidth: 1184, minHeight: 210, position: 'relative', overflow: 'hidden', justifyContent: 'center', gap: 22, padding: 27, borderWidth: 1, borderColor: '#31556A', borderRadius: 18, backgroundColor: '#142532' },
  ctaWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 42, paddingVertical: 34 },
  ctaDecoration: { position: 'absolute', top: -105, right: -40, width: 280, height: 280, borderWidth: 1, borderColor: '#274356', borderRadius: 140, opacity: 0.85 },
  ctaCopy: { maxWidth: 670, zIndex: 1 },
  ctaEyebrow: { color: palette.blue, fontSize: 9, fontWeight: '700', letterSpacing: 1.5, marginBottom: 9, fontFamily: webFont },
  ctaTitle: { color: palette.text, fontSize: 23, lineHeight: 31, fontWeight: '700', letterSpacing: -0.5, fontFamily: webFont },
  ctaDescription: { color: palette.secondary, fontSize: 13, lineHeight: 20, marginTop: 7, fontFamily: webFont },
  footerOuter: { width: '100%', alignItems: 'center', marginTop: 62, borderTopWidth: 1, borderTopColor: palette.border },
  footer: { width: '100%', maxWidth: 1240, paddingHorizontal: 28, paddingTop: 37, paddingBottom: 22 },
  footerMain: { gap: 30, paddingBottom: 31 },
  footerMainWide: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  footerIdentity: { flex: 1, maxWidth: 360 },
  footerBrand: { alignSelf: 'flex-start' },
  footerBrandMark: { width: 31, height: 31, borderRadius: 10 },
  footerBrandName: { fontSize: 14 },
  footerDescription: { color: palette.muted, fontSize: 12, lineHeight: 19, marginTop: 13, fontFamily: webFont },
  footerLinksGroup: { minWidth: 130, alignItems: 'flex-start', gap: 3 },
  footerHeading: { color: palette.text, fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 7, fontFamily: webFont },
  footerBottom: { minHeight: 46, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 15, borderTopWidth: 1, borderTopColor: palette.border },
  copyright: { color: palette.muted, fontSize: 10, fontFamily: webFont },
  footerTagline: { color: palette.muted, fontSize: 10, fontFamily: webFont },
});
