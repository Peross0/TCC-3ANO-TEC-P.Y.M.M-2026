import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedScreen from "../components/layout/AnimatedScreen";
import { useAppPreferences } from "../context/PreferencesContext";
import { SessionContext } from "../context/SessionContext";
import { API_URL, apiFetch, getAssetUrl, getToken } from "../lib/api";

export default function PerfilScreen() {
  const { sessionData, setSessionData } = useContext(SessionContext);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  const user = sessionData?.user;
  const profile = sessionData?.profile;
  const [nome, setNome] = useState(profile?.full_name || user?.full_name || "");
  const [telefone, setTelefone] = useState(profile?.phone || user?.phone || "");
  const [curso, setCurso] = useState(profile?.course || user?.course || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentsLoadedForUser, setDocumentsLoadedForUser] = useState(null);
  const [documentsReloadKey, setDocumentsReloadKey] = useState(0);
  const [documentsError, setDocumentsError] = useState("");
  const [documentActionId, setDocumentActionId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [avatarUri, setAvatarUri] = useState(
    getAssetUrl(profile?.avatar_url || user?.avatar_url),
  );
  const router = useRouter();
  const isCandidate = user?.user_type === "CANDIDATE";
  const loadingDocuments = Boolean(
    user?.id && documentsLoadedForUser !== user.id,
  );

  useEffect(() => {
    let active = true;
    if (!user?.id)
      return () => {
        active = false;
      };
    apiFetch("/users/me/documents")
      .then((result) => {
        if (active) {
          setDocuments(result.documents || []);
          setDocumentsError("");
        }
      })
      .catch((error) => {
        if (active) {
          setDocumentsError(
            error.message || "Não foi possível carregar os documentos.",
          );
        }
      })
      .finally(() => {
        if (active) setDocumentsLoadedForUser(user.id);
      });

    return () => {
      active = false;
    };
  }, [user?.id, documentsReloadKey]);

  const changeAvatar = async () => {
    if (isUploadingAvatar) return;

    try {
      const selection = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (selection.canceled || !selection.assets?.length) return;

      const asset = selection.assets[0];
      const formData = new FormData();
      if (Platform.OS === "web" && asset.file) {
        formData.append("avatar", asset.file, asset.fileName || "avatar.jpg");
      } else {
        formData.append("avatar", {
          uri: asset.uri,
          name: asset.fileName || "avatar.jpg",
          type: asset.mimeType || "image/jpeg",
        });
      }

      setIsUploadingAvatar(true);
      const result = await apiFetch("/users/me/avatar", {
        method: "POST",
        body: formData,
      });
      const updatedAvatarUrl = result.user?.avatar_url;
      if (!updatedAvatarUrl)
        throw new Error("O servidor não retornou a nova foto do perfil.");
      const updatedAvatarUri = getAssetUrl(updatedAvatarUrl);
      setAvatarUri(updatedAvatarUri);
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, avatar_url: updatedAvatarUrl },
        profile: { ...current.profile, avatar_url: updatedAvatarUrl },
      }));
      Alert.alert("Foto atualizada", "Sua foto foi salva no perfil.");
    } catch (error) {
      Alert.alert(
        "Não foi possível atualizar a foto",
        error.message || "Tente novamente.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePickDocument = async () => {
    if (isUploadingDocument) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets?.length) return;

      const fileAsset = result.assets[0];
      const formData = new FormData();
      if (Platform.OS === "web" && fileAsset.file) {
        formData.append(
          "document",
          fileAsset.file,
          fileAsset.name || "documento",
        );
      } else {
        formData.append("document", {
          uri: fileAsset.uri,
          name: fileAsset.name || "documento",
          type: fileAsset.mimeType || "application/octet-stream",
        });
      }

      setIsUploadingDocument(true);
      const response = await apiFetch("/users/me/documents", {
        method: "POST",
        body: formData,
        timeoutMs: 120000,
      });
      setDocuments((current) => [response.document, ...current]);
      Alert.alert("Documento anexado", "O arquivo foi salvo no seu perfil.");
    } catch (error) {
      Alert.alert(
        "Não foi possível anexar o documento",
        error.message || "Tente novamente.",
      );
    } finally {
      setIsUploadingDocument(false);
    }
  };

  const openDocument = async (document, action) => {
    if (documentActionId) return;
    let previewWindow = null;
    if (Platform.OS === "web" && action === "view") {
      previewWindow = globalThis.open("", "_blank");
      if (previewWindow) previewWindow.opener = null;
    }

    setDocumentActionId(document.id);
    try {
      if (Platform.OS === "web") {
        const content = await apiFetch(`/users/me/documents/${document.id}`, {
          responseType: "blob",
          timeoutMs: 120000,
        });
        const blob = new Blob([content], {
          type: document.mime_type || "application/octet-stream",
        });
        const canPreview =
          document.mime_type === "application/pdf" ||
          ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
            document.mime_type,
          );

        if (action === "view" && canPreview && previewWindow) {
          const objectUrl = URL.createObjectURL(blob);
          previewWindow.location.replace(objectUrl);
          previewWindow.addEventListener(
            "beforeunload",
            () => URL.revokeObjectURL(objectUrl),
            { once: true },
          );
        } else {
          previewWindow?.close();
          const objectUrl = URL.createObjectURL(blob);
          const link = globalThis.document.createElement("a");
          link.href = objectUrl;
          link.download = document.name;
          globalThis.document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        }
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error(
          "Não há um aplicativo disponível para abrir ou compartilhar este arquivo.",
        );
      }
      const token = await getToken();
      if (!token || !FileSystem.cacheDirectory) {
        throw new Error(
          "Não foi possível acessar a sessão ou o armazenamento temporário.",
        );
      }
      const localName =
        document.name
          .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_")
          .slice(0, 180) || "documento";
      const localUri = `${FileSystem.cacheDirectory}document-${document.id}-${localName}`;
      const result = await FileSystem.downloadAsync(
        `${API_URL}/users/me/documents/${document.id}`,
        localUri,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (result.status < 200 || result.status >= 300) {
        throw new Error(
          "Não foi possível baixar o documento. Entre novamente e tente de novo.",
        );
      }
      await Sharing.shareAsync(result.uri, {
        mimeType: document.mime_type || "application/octet-stream",
        dialogTitle: document.name,
      });
    } catch (error) {
      previewWindow?.close();
      Alert.alert(
        "Não foi possível abrir o documento",
        error.message || "Tente novamente.",
      );
    } finally {
      setDocumentActionId(null);
    }
  };

  const removeDocument = async (document) => {
    try {
      await apiFetch(`/users/me/documents/${document.id}`, {
        method: "DELETE",
      });
      setDocuments((current) =>
        current.filter((item) => item.id !== document.id),
      );
      Alert.alert(
        "Documento excluído",
        "O arquivo foi removido do seu perfil.",
      );
    } catch (error) {
      Alert.alert(
        "Não foi possível excluir o documento",
        error.message || "Tente novamente.",
      );
    }
  };

  const confirmRemoveDocument = (document) => {
    if (Platform.OS === "web") {
      if (globalThis.confirm(`Excluir "${document.name}" do seu perfil?`)) {
        removeDocument(document);
      }
      return;
    }
    Alert.alert(
      "Excluir documento?",
      `Deseja remover "${document.name}" do seu perfil?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => removeDocument(document),
        },
      ],
    );
  };

  const handleSave = async () => {
    if (!nome.trim() || nome.trim().length < 2) {
      Alert.alert(
        "Nome obrigatório",
        "Informe seu nome completo (pelo menos 2 caracteres).",
      );
      return;
    }
    if (!user) {
      Alert.alert(
        "Sessão não encontrada",
        "Entre novamente para atualizar seu perfil.",
      );
      return;
    }

    const profilePath = isCandidate
      ? "/candidates/profile"
      : user.user_type === "RECRUITER"
        ? "/recruiters/profile"
        : `/admin/users/${user.id}`;
    const updates = {
      full_name: nome.trim(),
      phone: telefone.trim() || null,
      ...(isCandidate ? { course: curso.trim() || null } : {}),
    };

    setIsSaving(true);
    try {
      const result = await apiFetch(profilePath, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const updatedProfile =
        result.candidate || result.recruiter || result.user || updates;
      setSessionData((current) => ({
        ...current,
        user: { ...current.user, ...updates },
        profile: { ...current.profile, ...updatedProfile, ...updates },
      }));
      Alert.alert("Perfil atualizado", "Seus dados foram salvos na sua conta.");
    } catch (error) {
      Alert.alert(
        "Não foi possível salvar",
        error instanceof TypeError
          ? "Não foi possível conectar ao servidor."
          : error.message,
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatedScreen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle={
              colors.background === "#101822" || colors.background === "#000000"
                ? "light-content"
                : "dark-content"
            }
            backgroundColor={colors.background}
          />
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Feather name="arrow-left" size={21} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Editar perfil</Text>
              <Text style={styles.subtitle}>
                Atualize os dados da sua conta
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                    onError={() => setAvatarUri(null)}
                  />
                ) : (
                  <Feather name="user" size={38} color={colors.tint} />
                )}
              </View>
              <TouchableOpacity
                style={styles.photoButton}
                onPress={changeAvatar}
                disabled={isUploadingAvatar}
                accessibilityRole="button"
                accessibilityLabel="Alterar foto do perfil"
              >
                {isUploadingAvatar ? (
                  <ActivityIndicator size="small" color={colors.surface} />
                ) : (
                  <Feather name="camera" size={15} color={colors.surface} />
                )}
                <Text style={styles.photoButtonText}>Alterar foto</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Dados pessoais</Text>
              <Field
                colors={colors}
                styles={styles}
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome completo"
                editable={!isSaving}
              />
              <Field
                colors={colors}
                styles={styles}
                label="E-mail"
                value={profile?.email || user?.email || ""}
                editable={false}
              />
              {profile?.document_number || user?.document_number ? (
                <Field
                  colors={colors}
                  styles={styles}
                  label={
                    (profile?.document_type || user?.document_type) === "CNPJ"
                      ? "CNPJ"
                      : "CPF"
                  }
                  value={profile?.document_number || user?.document_number}
                  editable={false}
                />
              ) : null}
              <Field
                colors={colors}
                styles={styles}
                label="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                editable={!isSaving}
              />
              {isCandidate ? (
                <Field
                  colors={colors}
                  styles={styles}
                  label="Curso"
                  value={curso}
                  onChangeText={setCurso}
                  placeholder="Seu curso"
                  editable={!isSaving}
                />
              ) : null}
            </View>

            <View style={styles.formCard}>
              <View style={styles.documentHeading}>
                <View style={styles.documentHeadingCopy}>
                  <Text style={styles.sectionTitle}>Documentos do perfil</Text>
                  <Text style={styles.documentHint}>
                    Anexe arquivos de qualquer formato, respeitando o limite
                    definido pelo servidor. PDFs e imagens podem ser
                    visualizados; outros formatos podem ser abertos em
                    aplicativos compatíveis.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.documentUploadButton,
                    isUploadingDocument && styles.disabledButton,
                  ]}
                  onPress={handlePickDocument}
                  disabled={isUploadingDocument}
                  accessibilityRole="button"
                  accessibilityLabel="Anexar documento"
                >
                  {isUploadingDocument ? (
                    <ActivityIndicator size="small" color={colors.surface} />
                  ) : (
                    <Feather name="upload" size={16} color={colors.surface} />
                  )}
                </TouchableOpacity>
              </View>

              {loadingDocuments ? (
                <ActivityIndicator color={colors.tint} />
              ) : documentsError ? (
                <View style={styles.documentError}>
                  <Text style={styles.documentEmpty}>{documentsError}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setDocumentsError("");
                      setDocumentsReloadKey((current) => current + 1);
                    }}
                    style={styles.documentRetryButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.documentRetryText}>
                      Tentar novamente
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : documents.length ? (
                <View style={styles.documentList}>
                  {documents.map((document) => (
                    <View key={document.id} style={styles.documentItem}>
                      <Feather name="file" size={20} color={colors.tint} />
                      <View style={styles.documentDetails}>
                        <Text style={styles.documentName} numberOfLines={1}>
                          {document.name}
                        </Text>
                        <Text style={styles.documentMeta}>
                          {formatDocumentSize(document.size)} ·{" "}
                          {new Date(document.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </Text>
                      </View>
                      <View style={styles.documentActions}>
                        <TouchableOpacity
                          onPress={() => openDocument(document, "view")}
                          disabled={documentActionId !== null}
                          accessibilityRole="button"
                          accessibilityLabel={`Visualizar ${document.name}`}
                          style={styles.documentAction}
                        >
                          {documentActionId === document.id ? (
                            <ActivityIndicator
                              size="small"
                              color={colors.tint}
                            />
                          ) : (
                            <Feather name="eye" size={17} color={colors.tint} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openDocument(document, "download")}
                          disabled={documentActionId !== null}
                          accessibilityRole="button"
                          accessibilityLabel={`Baixar ${document.name}`}
                          style={styles.documentAction}
                        >
                          <Feather
                            name="download"
                            size={17}
                            color={colors.tint}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => confirmRemoveDocument(document)}
                          disabled={documentActionId !== null}
                          accessibilityRole="button"
                          accessibilityLabel={`Excluir ${document.name}`}
                          style={styles.documentAction}
                        >
                          <Feather
                            name="trash-2"
                            size={17}
                            color={colors.error}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.documentEmpty}>
                  Nenhum documento anexado.
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.disabledButton]}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityRole="button"
            >
              {isSaving ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Feather name="check" size={18} color={colors.surface} />
              )}
              <Text style={styles.saveText}>
                {isSaving ? "Salvando..." : "Salvar alterações"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </AnimatedScreen>
  );
}

function formatDocumentSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size < 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({ colors, styles, label, ...inputProps }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        style={[
          styles.input,
          inputProps.editable === false && styles.readOnlyInput,
        ]}
        placeholderTextColor={colors.muted}
        accessibilityLabel={label}
      />
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.15 : 1;
  return StyleSheet.create({
    container: { backgroundColor: colors.background, flex: 1 },
    header: {
      alignItems: "center",
      borderBottomColor: colors.line,
      borderBottomWidth: StyleSheet.hairlineWidth,
      flexDirection: "row",
      gap: 12,
      padding: 16,
    },
    backButton: { padding: 8 },
    headerCopy: { flex: 1 },
    title: { color: colors.text, fontSize: 20 * scale, fontWeight: "800" },
    subtitle: { color: colors.muted, fontSize: 12 * scale, marginTop: 3 },
    content: { gap: 16, padding: 18, paddingBottom: 34 },
    avatarSection: { alignItems: "center", paddingVertical: 8 },
    avatar: {
      alignItems: "center",
      backgroundColor: colors.primaryWash,
      borderColor: colors.line,
      borderRadius: 52,
      borderWidth: 2,
      height: 104,
      justifyContent: "center",
      overflow: "hidden",
      width: 104,
    },
    avatarImage: { height: "100%", width: "100%" },
    photoButton: {
      alignItems: "center",
      backgroundColor: colors.tint,
      borderRadius: 20,
      flexDirection: "row",
      gap: 7,
      marginTop: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    photoButtonText: {
      color: colors.surface,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    formCard: {
      backgroundColor: colors.surface,
      borderColor: colors.line,
      borderRadius: 17,
      borderWidth: 1,
      gap: 13,
      padding: 16,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 16 * scale,
      fontWeight: "800",
      marginBottom: 2,
    },
    field: { gap: 6 },
    label: { color: colors.text, fontSize: 12 * scale, fontWeight: "700" },
    input: {
      backgroundColor: colors.background,
      borderColor: colors.line,
      borderRadius: 11,
      borderWidth: 1,
      color: colors.text,
      fontSize: 14 * scale,
      minHeight: 46,
      paddingHorizontal: 13,
      paddingVertical: 10,
    },
    readOnlyInput: { color: colors.muted, opacity: 0.85 },
    documentHeading: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
    },
    documentHeadingCopy: { flex: 1 },
    documentHint: { color: colors.muted, fontSize: 11 * scale, lineHeight: 16 },
    documentUploadButton: {
      alignItems: "center",
      backgroundColor: colors.tint,
      borderRadius: 9,
      height: 40,
      justifyContent: "center",
      width: 42,
    },
    documentList: { gap: 9 },
    documentItem: {
      alignItems: "center",
      backgroundColor: colors.background,
      borderColor: colors.line,
      borderRadius: 11,
      borderWidth: 1,
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 11,
      paddingVertical: 9,
    },
    documentDetails: { flex: 1, minWidth: 0 },
    documentName: {
      color: colors.text,
      fontSize: 13 * scale,
      fontWeight: "700",
    },
    documentMeta: { color: colors.muted, fontSize: 10 * scale, marginTop: 3 },
    documentActions: { flexDirection: "row", alignItems: "center" },
    documentAction: { padding: 6 },
    documentEmpty: { color: colors.muted, fontSize: 12 * scale },
    documentError: { gap: 10, alignItems: "flex-start" },
    documentRetryButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 9,
      backgroundColor: colors.primaryWash,
    },
    documentRetryText: {
      color: colors.tint,
      fontSize: 12 * scale,
      fontWeight: "700",
    },
    saveButton: {
      alignItems: "center",
      backgroundColor: colors.tint,
      borderRadius: 13,
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
      minHeight: 50,
    },
    disabledButton: { opacity: 0.7 },
    saveText: {
      color: colors.surface,
      fontSize: 14 * scale,
      fontWeight: "800",
    },
  });
}
