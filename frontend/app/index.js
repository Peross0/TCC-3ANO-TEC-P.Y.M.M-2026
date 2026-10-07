import React, { useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '../lib/theme';

const benefits = [
  {
    icon: 'briefcase',
    title: 'Oportunidades mais claras',
    text: 'Apresente vagas com informações objetivas para que cada pessoa entenda o que a empresa procura.',
  },
  {
    icon: 'users',
    title: 'Conexões com propósito',
    text: 'Organize a presença da sua empresa e facilite o encontro com profissionais em busca do próximo passo.',
  },
  {
    icon: 'compass',
    title: 'Gestão sem complicação',
    text: 'Cuide do perfil e das oportunidades em um só lugar, com um fluxo simples para o dia a dia.',
  },
];

export default function LandingPage() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef(null);
  const [benefitsY, setBenefitsY] = useState(0);
  const isWide = width >= 760;

  const scrollToBenefits = () => scrollRef.current?.scrollTo({ y: benefitsY, animated: true });
  const goToRegister = () => router.push({ pathname: '/login', params: { cadastro: '1' } });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.brand} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} accessibilityRole="button" accessibilityLabel="Conecta Fácil, início">
            <View style={styles.brandMark}><Feather name="link-2" size={19} color={colors.surface} /></View>
            <Text style={styles.brandName}>Conecta Fácil</Text>
          </Pressable>
          {isWide && (
            <View style={styles.navLinks}>
              <Pressable onPress={scrollToBenefits} accessibilityRole="button"><Text style={styles.navText}>A plataforma</Text></Pressable>
              <Pressable onPress={() => router.push('/login')} accessibilityRole="button"><Text style={styles.navText}>Para empresas</Text></Pressable>
            </View>
          )}
          <Pressable style={styles.loginButton} onPress={() => router.push('/login')} accessibilityRole="button">
            <Text style={styles.loginButtonText}>Entrar</Text>
            <Feather name="arrow-up-right" size={16} color={colors.primaryDark} />
          </Pressable>
        </View>

        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={styles.heroCopy}>
            <View style={styles.kicker}><View style={styles.kickerDot} /><Text style={styles.kickerText}>TALENTOS E EMPRESAS, MAIS PERTO</Text></View>
            <Text style={styles.heroTitle}>O próximo bom encontro profissional pode começar aqui.</Text>
            <Text style={styles.heroDescription}>O Conecta Fácil ajuda empresas a apresentar oportunidades e a encontrar pessoas prontas para crescer junto.</Text>
            <View style={styles.heroActions}>
              <Pressable style={styles.primaryButton} onPress={goToRegister} accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Cadastrar minha empresa</Text>
                <Feather name="arrow-right" size={17} color={colors.surface} />
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={scrollToBenefits} accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Conhecer a plataforma</Text>
              </Pressable>
            </View>
            <View style={styles.trustNote}><Feather name="check-circle" size={15} color={colors.success} /><Text style={styles.trustText}>Um espaço simples para criar conexões de trabalho.</Text></View>
          </View>

          <View style={styles.visualWrap} accessible accessibilityLabel="Ilustração das etapas para conectar uma empresa a profissionais">
            <View style={styles.visualCard}>
              <View style={styles.visualTopline}><Text style={styles.visualEyebrow}>CONEXÕES QUE MOVEM</Text><Feather name="more-horizontal" size={19} color={colors.muted} /></View>
              <Text style={styles.visualTitle}>Da oportunidade à conversa</Text>
              <Text style={styles.visualSubtitle}>Um caminho direto, sem etapas desnecessárias.</Text>
              <View style={styles.flowLine}>
                <View style={styles.flowItem}>
                  <View style={[styles.flowIcon, styles.flowIconPrimary]}><Feather name="briefcase" size={17} color={colors.primaryDark} /></View>
                  <Text style={styles.flowLabel}>Empresa</Text>
                </View>
                <View style={styles.flowConnector}><View style={styles.flowDash} /><Feather name="arrow-right" size={15} color={colors.primaryDark} /></View>
                <View style={styles.flowItem}>
                  <View style={[styles.flowIcon, styles.flowIconAccent]}><Feather name="file-text" size={17} color={colors.primaryDark} /></View>
                  <Text style={styles.flowLabel}>Oportunidade</Text>
                </View>
                <View style={styles.flowConnector}><View style={styles.flowDash} /><Feather name="arrow-right" size={15} color={colors.primaryDark} /></View>
                <View style={styles.flowItem}>
                  <View style={[styles.flowIcon, styles.flowIconPrimary]}><Feather name="users" size={17} color={colors.primaryDark} /></View>
                  <Text style={styles.flowLabel}>Talento</Text>
                </View>
              </View>
              <View style={styles.visualFooter}><View style={styles.visualFooterIcon}><Feather name="heart" size={14} color={colors.primaryDark} /></View><Text style={styles.visualFooterText}>Mais clareza para os dois lados.</Text></View>
            </View>
            <View style={styles.visualNote}><Feather name="message-circle" size={17} color={colors.surface} /><Text style={styles.visualNoteText}>O trabalho começa com uma boa conexão.</Text></View>
          </View>
        </View>

        <View style={styles.benefitSection} onLayout={(event) => setBenefitsY(event.nativeEvent.layout.y)}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionEyebrow}>FEITO PARA O DIA A DIA</Text>
            <Text style={styles.sectionTitle}>Menos ruído. Mais boas conexões.</Text>
            <Text style={styles.sectionDescription}>Uma experiência pensada para aproximar quem oferece uma oportunidade de quem pode fazer parte dela.</Text>
          </View>
          <View style={[styles.benefitGrid, isWide && styles.benefitGridWide]}>
            {benefits.map((benefit, index) => (
              <View key={benefit.title} style={[styles.benefitItem, isWide && styles.benefitItemWide, index === 0 && styles.firstBenefit]}>
                <View style={[styles.benefitIcon, index === 1 && styles.benefitIconAccent]}><Feather name={benefit.icon} size={19} color={colors.primaryDark} /></View>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.closing, isWide && styles.closingWide]}>
          <View style={styles.closingCopy}>
            <Text style={styles.closingEyebrow}>SUA PRÓXIMA OPORTUNIDADE COMEÇA COM UM PASSO</Text>
            <Text style={styles.closingTitle}>Vamos criar conexões que fazem sentido?</Text>
            <Text style={styles.closingText}>Crie o acesso da sua empresa e comece a organizar suas oportunidades.</Text>
          </View>
          <Pressable style={styles.closingButton} onPress={goToRegister} accessibilityRole="button">
            <Text style={styles.closingButtonText}>Começar agora</Text><Feather name="arrow-right" size={17} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable style={styles.footerBrand} onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} accessibilityRole="button">
            <View style={styles.footerMark}><Feather name="link-2" size={14} color={colors.surface} /></View><Text style={styles.footerName}>Conecta Fácil</Text>
          </Pressable>
          <Text style={styles.footerText}>Conexões profissionais começam com proximidade.</Text>
          <Text style={styles.copyright}>© 2026 Conecta Fácil</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  header: { width: '100%', maxWidth: 1180, minHeight: 76, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 37, height: 37, borderRadius: 12, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  brandName: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  navText: { color: colors.inkSoft, fontSize: 13, fontWeight: '600' },
  loginButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, borderRadius: 10, backgroundColor: colors.surface },
  loginButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  hero: { width: '100%', maxWidth: 1180, paddingHorizontal: 24, paddingTop: 45, paddingBottom: 56 },
  heroWide: { minHeight: 560, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 46, paddingTop: 68, paddingBottom: 74 },
  heroCopy: { flex: 1, maxWidth: 590 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 19 },
  kickerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  kickerText: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  heroTitle: { color: colors.ink, fontSize: 43, lineHeight: 51, fontWeight: '700', letterSpacing: -1.25 },
  heroDescription: { maxWidth: 520, color: colors.inkSoft, fontSize: 16, lineHeight: 25, marginTop: 17 },
  heroActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginTop: 25 },
  primaryButton: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 18, borderRadius: 10, backgroundColor: colors.primaryDark },
  primaryButtonText: { color: colors.surface, fontSize: 13, fontWeight: '800' },
  secondaryButton: { minHeight: 45, justifyContent: 'center', paddingHorizontal: 8 },
  secondaryButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700' },
  trustNote: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 25 },
  trustText: { color: colors.muted, fontSize: 12 },
  visualWrap: { flex: 0.9, alignItems: 'center', justifyContent: 'center', minHeight: 330, marginTop: 28 },
  visualCard: { width: '100%', maxWidth: 470, padding: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 20 },
  visualTopline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  visualEyebrow: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  visualTitle: { color: colors.ink, fontSize: 20, fontWeight: '700', letterSpacing: -0.3, marginTop: 19 },
  visualSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 },
  flowLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
  flowItem: { alignItems: 'center', gap: 8 },
  flowIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  flowIconPrimary: { backgroundColor: colors.primaryWash },
  flowIconAccent: { backgroundColor: colors.accentWash },
  flowLabel: { color: colors.inkSoft, fontSize: 10, fontWeight: '700' },
  flowConnector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 6 },
  flowDash: { flex: 1, height: 1, backgroundColor: colors.line },
  visualFooter: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 22, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.line },
  visualFooterIcon: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: colors.primaryWash },
  visualFooterText: { color: colors.inkSoft, fontSize: 12, fontWeight: '600' },
  visualNote: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.primaryDark, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 11, marginTop: 13 },
  visualNoteText: { color: colors.surface, fontSize: 11, fontWeight: '600' },
  benefitSection: { width: '100%', maxWidth: 1180, paddingHorizontal: 24, paddingVertical: 52, borderTopWidth: 1, borderTopColor: colors.line },
  sectionHeading: { maxWidth: 650 },
  sectionEyebrow: { color: colors.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 31, lineHeight: 39, fontWeight: '700', letterSpacing: -0.7 },
  sectionDescription: { color: colors.inkSoft, fontSize: 14, lineHeight: 22, marginTop: 10 },
  benefitGrid: { marginTop: 25 },
  benefitGridWide: { flexDirection: 'row', gap: 0 },
  benefitItem: { paddingVertical: 20, borderTopWidth: 1, borderTopColor: colors.line },
  benefitItemWide: { flex: 1, paddingHorizontal: 22, paddingVertical: 22, borderTopWidth: 1 },
  firstBenefit: { borderTopColor: colors.primary },
  benefitIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryWash, marginBottom: 15 },
  benefitIconAccent: { backgroundColor: colors.limeWash },
  benefitTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', marginBottom: 7 },
  benefitText: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  closing: { width: '92%', maxWidth: 1132, padding: 25, backgroundColor: colors.primaryWash, borderRadius: 18, gap: 20 },
  closingWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 34, paddingVertical: 30 },
  closingCopy: { maxWidth: 650 },
  closingEyebrow: { color: colors.primaryDark, fontSize: 9, fontWeight: '800', letterSpacing: 1.35, marginBottom: 9 },
  closingTitle: { color: colors.ink, fontSize: 22, lineHeight: 29, fontWeight: '700', letterSpacing: -0.4 },
  closingText: { color: colors.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 6 },
  closingButton: { minHeight: 45, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 15, borderRadius: 10, backgroundColor: colors.primaryWash },
  closingButtonText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  footer: { width: '100%', maxWidth: 1180, marginTop: 39, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, borderTopWidth: 1, borderTopColor: colors.line, gap: 9 },
  footerBrand: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  footerMark: { width: 25, height: 25, borderRadius: 8, backgroundColor: colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  footerName: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  footerText: { color: colors.muted, fontSize: 11 },
  copyright: { color: colors.muted, fontSize: 10, marginTop: 3 },
});
