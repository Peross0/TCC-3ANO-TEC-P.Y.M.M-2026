import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppPreferences } from "../../context/PreferencesContext";

export default function MessageHeader({ activeChat, onBack, onRefresh }) {
  const [failedLogoUri, setFailedLogoUri] = useState(null);
  const { colors, preferences } = useAppPreferences();
  const styles = makeStyles(colors, preferences.large_text);
  if (!activeChat) return null;
  const showLogo =
    activeChat.companyLogoUri && failedLogoUri !== activeChat.companyLogoUri;

  return (
    <View style={styles.chatHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Feather name="arrow-left" size={22} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.avatarSmall}>
        {showLogo ? (
          <Image
            source={{ uri: activeChat.companyLogoUri }}
            style={styles.companyLogoImage}
            onError={() => setFailedLogoUri(activeChat.companyLogoUri)}
          />
        ) : (
          <Feather
            name={activeChat.contactType === "Candidato" ? "user" : "briefcase"}
            size={18}
            color={colors.primaryDark}
          />
        )}
      </View>

      <View style={styles.chatHeaderInfo}>
        <Text style={styles.chatHeaderCompany}>{activeChat.company}</Text>
        <Text style={styles.chatHeaderJob}>
          {activeChat.contactType ? `${activeChat.contactType} · ` : ""}
          {activeChat.jobTitle}
        </Text>
      </View>
      {onRefresh ? (
        <TouchableOpacity
          onPress={onRefresh}
          style={styles.refreshButton}
          accessibilityRole="button"
          accessibilityLabel="Atualizar conversa"
        >
          <Feather name="refresh-cw" size={17} color={colors.tint} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function makeStyles(colors, largeText) {
  const scale = largeText ? 1.12 : 1;
  return StyleSheet.create({
    chatHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    backBtn: {
      paddingRight: 12,
    },
    avatarSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    companyLogoImage: { width: "100%", height: "100%", borderRadius: 18 },
    chatHeaderInfo: {
      marginLeft: 10,
      flex: 1,
    },
    refreshButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    chatHeaderCompany: {
      fontSize: 15 * scale,
      fontWeight: "700",
      color: colors.text,
    },
    chatHeaderJob: {
      fontSize: 11 * scale,
      color: colors.muted,
    },
  });
}
