import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppPreferences } from "../../context/PreferencesContext";
import { SessionContext } from "../../context/SessionContext";
import { apiFetch, getAssetUrl } from "../../lib/api";
import { formatBrasiliaDateTime } from "../../lib/dateTime";

export default function EmpresasScreen() {
  const { colors, preferences } = useAppPreferences();
  const { sessionData } = useContext(SessionContext);
  const styles = makeStyles(colors, preferences.large_text);
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const hasLoadedCompanies = useRef(false);

  const carregarEmpresas = useCallback(async () => {
    setErro("");
    if (hasLoadedCompanies.current) setAtualizando(true);
    else setCarregando(true);
    try {
      const dados = await apiFetch("/candidates/companies");
      setEmpresas(
        (dados.companies || []).map((company) => ({
          id: company.id,
          nome: company.company_name || "Empresa",
          descricao: company.company_description || "",
          segmento: company.company_sector || "",
          endereco: company.location || "Localização não informada",
          logoUri: getAssetUrl(company.company_logo_url),
          applications: company.applications || [],
        })),
      );
    } catch (error) {
      setErro(error.message || "Não foi possível conectar ao servidor.");
    } finally {
      hasLoadedCompanies.current = true;
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (sessionData?.user?.user_type !== "CANDIDATE") return undefined;
      carregarEmpresas();
      return undefined;
    }, [carregarEmpresas, sessionData?.user?.user_type]),
  );

  const abrirEmpresa = (empresa) => {
    setEmpresaSelecionada(empresa);
  };

  const isCandidate = sessionData?.user?.user_type === "CANDIDATE";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Empresas</Text>
        <Text style={styles.subtitle}>
          Empresas das oportunidades pelas quais você demonstrou interesse
        </Text>
      </View>
      {!isCandidate ? (
        <View style={styles.center}>
          <Feather name="briefcase" size={38} color={colors.line} />
          <Text style={styles.emptyTitle}>Área de candidatos</Text>
          <Text style={styles.emptyText}>
            As empresas aparecem aqui depois que você demonstra interesse em uma
            oportunidade.
          </Text>
        </View>
      ) : carregando ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <FlatList
          data={empresas}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            erro ? (
              <View style={styles.errorBox}>
                <Feather
                  name="wifi-off"
                  size={20}
                  color={colors.danger || colors.tint}
                />
                <Text style={styles.errorText}>{erro}</Text>
                <TouchableOpacity
                  onPress={carregarEmpresas}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.companyCard}
              onPress={() => abrirEmpresa(item)}
              activeOpacity={0.8}
            >
              <View style={styles.companyIcon}>
                {item.logoUri ? (
                  <Image
                    source={{ uri: item.logoUri }}
                    style={styles.companyLogoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name="briefcase" size={22} color={colors.text} />
                )}
              </View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{item.nome}</Text>
                <Text style={styles.companyAddress}>{item.endereco}</Text>
                <Text style={styles.companyAction}>Ver empresa</Text>
              </View>
              <Feather name="chevron-right" size={21} color={colors.muted} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !erro ? (
              <View style={styles.center}>
                <Feather name="briefcase" size={42} color={colors.line} />
                <Text style={styles.emptyTitle}>
                  Nenhuma empresa de interesse ainda
                </Text>
                <Text style={styles.emptyText}>
                  Ao tocar em “Tenho interesse” em uma oportunidade, a empresa e
                  os dados da candidatura aparecerão aqui.
                </Text>
              </View>
            ) : null
          }
          onRefresh={carregarEmpresas}
          refreshing={atualizando}
        />
      )}
      <Modal
        visible={Boolean(empresaSelecionada)}
        transparent
        animationType="fade"
        onRequestClose={() => setEmpresaSelecionada(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setEmpresaSelecionada(null)}
            accessibilityLabel="Fechar detalhes da empresa"
          />
          <View style={styles.detailModal}>
            <View style={styles.detailHeader}>
              <View style={styles.detailIcon}>
                {empresaSelecionada?.logoUri ? (
                  <Image
                    source={{ uri: empresaSelecionada.logoUri }}
                    style={styles.detailLogo}
                    resizeMode="cover"
                  />
                ) : (
                  <Feather
                    name="briefcase"
                    size={22}
                    color={colors.primaryDark}
                  />
                )}
              </View>
              <TouchableOpacity
                onPress={() => setEmpresaSelecionada(null)}
                accessibilityLabel="Fechar detalhes"
              >
                <Feather name="x" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.detailTitle}>{empresaSelecionada?.nome}</Text>
              {empresaSelecionada?.segmento ? (
                <Text style={styles.detailSector}>
                  {empresaSelecionada.segmento}
                </Text>
              ) : null}
              <Text style={styles.detailSectionTitle}>Sobre a empresa</Text>
              <Text style={styles.detailDescription}>
                {empresaSelecionada?.descricao ||
                  "Esta empresa ainda não adicionou uma apresentação."}
              </Text>
              <View style={styles.detailLocation}>
                <Feather name="map-pin" size={16} color={colors.primaryDark} />
                <Text style={styles.detailLocationText}>
                  {empresaSelecionada?.endereco}
                </Text>
              </View>
              <Text style={styles.detailSectionTitle}>
                Oportunidades de interesse
              </Text>
              {(empresaSelecionada?.applications || []).map((application) => (
                <View
                  key={String(application.id)}
                  style={styles.applicationCard}
                >
                  <Text style={styles.applicationTitle}>
                    {application.job_title}
                  </Text>
                  <Text style={styles.applicationMeta}>
                    Interesse enviado em{" "}
                    {formatBrasiliaDateTime(application.interested_at)}
                  </Text>
                  <Text style={styles.applicationMeta}>
                    Status:{" "}
                    {{
                      PENDING: "Em análise",
                      ACCEPTED: "Aceita",
                      REJECTED: "Não selecionada",
                    }[application.status] || application.status}
                  </Text>
                  {application.location ? (
                    <Text style={styles.applicationMeta}>
                      Local: {application.location}
                    </Text>
                  ) : null}
                  <Text style={styles.applicationMeta}>
                    Contrato: {application.contract_type || "Não informado"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 14,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    title: { color: colors.text, fontSize: 27 * scale, fontWeight: "800" },
    subtitle: { color: colors.muted, fontSize: 14 * scale, marginTop: 5 },
    list: { padding: 16, paddingBottom: 30 },
    companyCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.line,
    },
    companyIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primaryWash,
      marginRight: 13,
    },
    companyLogoImage: { width: "100%", height: "100%", borderRadius: 14 },
    companyInfo: { flex: 1 },
    companyName: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: "800",
    },
    companyAddress: { color: colors.muted, fontSize: 12 * scale, marginTop: 4 },
    companyAction: {
      color: colors.primaryDark,
      fontSize: 12 * scale,
      fontWeight: "700",
      marginTop: 7,
    },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
    },
    emptyTitle: {
      color: colors.muted,
      fontSize: 16 * scale,
      fontWeight: "700",
      marginTop: 14,
    },
    emptyText: { color: colors.muted, fontSize: 13 * scale, marginTop: 5 },
    errorBox: {
      padding: 14,
      marginBottom: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      gap: 8,
    },
    errorText: { color: colors.text, fontSize: 13 * scale },
    retryButton: {
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 9,
      backgroundColor: colors.primaryWash,
    },
    retryText: {
      color: colors.primaryDark,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 22,
      backgroundColor: "rgba(0,0,0,0.35)",
    },
    modalBackdrop: { ...StyleSheet.absoluteFillObject },
    detailModal: {
      width: "100%",
      maxWidth: 440,
      maxHeight: "80%",
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
    },
    detailHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 14,
    },
    detailIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primaryWash,
    },
    detailLogo: { width: "100%", height: "100%", borderRadius: 13 },
    detailTitle: {
      color: colors.text,
      fontSize: 21 * scale,
      fontWeight: "800",
    },
    detailSector: {
      color: colors.primaryDark,
      fontSize: 13 * scale,
      fontWeight: "700",
      marginTop: 4,
    },
    detailSectionTitle: {
      color: colors.text,
      fontSize: 14 * scale,
      fontWeight: "700",
      marginTop: 21,
      marginBottom: 6,
    },
    detailDescription: {
      color: colors.muted,
      fontSize: 14 * scale,
      lineHeight: 21 * scale,
    },
    detailLocation: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 20,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.line,
    },
    detailLocationText: { flex: 1, color: colors.muted, fontSize: 13 * scale },
    applicationCard: {
      padding: 12,
      marginTop: 9,
      borderRadius: 11,
      backgroundColor: colors.primaryWash,
    },
    applicationTitle: {
      color: colors.text,
      fontSize: 14 * scale,
      fontWeight: "700",
    },
    applicationMeta: {
      color: colors.muted,
      fontSize: 12 * scale,
      lineHeight: 18 * scale,
      marginTop: 4,
    },
  });
}
