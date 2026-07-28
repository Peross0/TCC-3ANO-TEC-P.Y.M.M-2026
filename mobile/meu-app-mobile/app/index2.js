import { StyleSheet, Text, View, Image, StatusBar } from "react-native";

const CN_COLORS = {
  PRIMARY_BLUE: "#00B0FF", 
  SECONDARY_PURPLE: "#8E24AA", 
  ACCENT_YELLOW: "#FFD700",
  OUTLINE_BLACK: "#000000", 
  TEXT_DARK: "#212121", 
  TEXT_LIGHT: "#FFFFFF", 
  BRIGHT_WHITE: "#FAFAFA",
  BACKGROUND_LIGHT: "#E0F7FA",
};

export default function Home() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CN_COLORS.BACKGROUND_LIGHT} />

      <Image
        style={styles.logo}
        source={{
          uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Cartoon_network_modified_logo.PNG/1200px-Cartoon_network_modified_logo.PNG",
        }}
      />

      <View style={styles.cardContainer}> 
        <View style={styles.card}>
          <Text style={styles.title}>BEM-VINDO(A)!</Text>
          <Text style={styles.subtitle}>
            Pré-requisito para a disciplina de DDM
          </Text>
        </View>
      </View>

      <View style={styles.footerStrip}>
        <Text style={styles.footerText}>Desenvolvido por Gabriel Neves © 2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: CN_COLORS.BACKGROUND_LIGHT, 
    padding: 20,
    justifyContent: 'space-around',
  },

  logo: {
    width: 300, 
    height: 150,
    resizeMode: "contain",
    marginTop: 20,
  },

  cardContainer: {
    backgroundColor: CN_COLORS.SECONDARY_PURPLE, 
    borderRadius: 30,
    paddingBottom: 8, 
    paddingRight: 8,
    position: 'relative', 
    width: "95%",
    maxWidth: 400,
  },

  card: {
    backgroundColor: CN_COLORS.ACCENT_YELLOW,
    borderRadius: 25, 
    paddingVertical: 40, 
    paddingHorizontal: 25, 
    width: "100%",
    alignItems: "center",
    borderWidth: 6, 
    borderColor: CN_COLORS.OUTLINE_BLACK, 
    position: 'relative', 
    top: 0,
    left: 0,
  },

  title: {
    fontSize: 40, 
    fontWeight: "900", 
    color: CN_COLORS.TEXT_DARK, 
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: CN_COLORS.BRIGHT_WHITE,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 2,
  },

  subtitle: {
    fontSize: 22, 
    color: CN_COLORS.TEXT_DARK, 
    textAlign: "center",
    fontWeight: '800', 
    lineHeight: 30, 
    textShadowColor: CN_COLORS.TEXT_LIGHT, 
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    letterSpacing: 0.5,
  },
    
  footerStrip: {
    backgroundColor: CN_COLORS.PRIMARY_BLUE,
    width: '100%',
    paddingVertical: 15,
    borderTopWidth: 6, 
    borderBottomWidth: 6,
    borderColor: CN_COLORS.OUTLINE_BLACK, 
    alignItems: 'center',
    marginBottom: -20,
  },

  footerText: {
    fontSize: 16, 
    color: CN_COLORS.TEXT_LIGHT, 
    textAlign: "center",
    fontWeight: '900', 
    letterSpacing: 1,
    textShadowColor: CN_COLORS.OUTLINE_BLACK,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
