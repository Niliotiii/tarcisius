import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet, Platform } from "react-native";
import {
  shouldOfferIOSInstallPrompt,
  shouldOfferSwitchToSafariPrompt,
} from "../lib/pwa";
import { getInstallPromptDismissed, setInstallPromptDismissed } from "../lib/storage";
import { colors, spacing, radius } from "../theme/tokens";

type Variant = "install" | "switch-to-safari" | "android";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    (async () => {
      const dismissed = await getInstallPromptDismissed();

      const iosVariant: Variant | null = shouldOfferIOSInstallPrompt()
        ? "install"
        : shouldOfferSwitchToSafariPrompt()
          ? "switch-to-safari"
          : null;

      if (iosVariant) {
        if (!dismissed) setVariant(iosVariant);
        return;
      }

      const onBeforeInstallPrompt = async (event: Event) => {
        event.preventDefault();
        if (dismissed) return;
        setAndroidPrompt(event as BeforeInstallPromptEvent);
        setVariant("android");
      };
      const onAppInstalled = () => {
        setVariant(null);
        setAndroidPrompt(null);
      };

      window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.addEventListener("appinstalled", onAppInstalled);
    })();
  }, []);

  const dismiss = () => {
    setVariant(null);
    setInstallPromptDismissed();
  };

  const handleBannerAction = async () => {
    if (variant === "android" && androidPrompt) {
      await androidPrompt.prompt();
      await androidPrompt.userChoice;
      setAndroidPrompt(null);
      setVariant(null);
      return;
    }
    setModalOpen(true);
  };

  if (!variant || Platform.OS !== "web") return null;

  return (
    <>
      <View style={styles.banner}>
        <Text style={styles.bannerEmoji}>
          {variant === "switch-to-safari" ? "🧭" : "📲"}
        </Text>
        <Text style={styles.bannerText}>
          {variant === "install"
            ? "Instale o Tarcisius na tela de início do seu iPhone"
            : variant === "switch-to-safari"
              ? "Abra este link no Safari para instalar o Tarcisius como app"
              : "Instale o Tarcisius como app no seu celular"}
        </Text>
        <Pressable onPress={handleBannerAction}>
          <Text style={styles.bannerAction}>
            {variant === "install" ? "Como instalar" : variant === "switch-to-safari" ? "Como fazer" : "Instalar"}
          </Text>
        </Pressable>
        <Pressable onPress={dismiss} accessibilityLabel="Fechar aviso">
          <Text style={styles.bannerClose}>✕</Text>
        </Pressable>
      </View>

      <Modal visible={modalOpen} transparent animationType="fade" onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {variant === "install" ? "Adicionar à tela de início" : "Use o Safari para instalar"}
            </Text>
            <ScrollView style={styles.modalBody}>
              {variant === "install" ? (
                <>
                  <Text style={styles.modalStep}>⬆️ Toque no ícone de Compartilhar na barra do Safari</Text>
                  <Text style={styles.modalStep}>➕ Role a lista e toque em "Adicionar à Tela de Início"</Text>
                  <Text style={styles.modalStep}>✅ Toque em "Adicionar" — pronto!</Text>
                </>
              ) : (
                <>
                  <Text style={styles.modalStep}>⋯ Toque no menu ••• (ou compartilhar) deste navegador</Text>
                  <Text style={styles.modalStep}>🧭 Escolha "Abrir no Safari"</Text>
                  <Text style={styles.modalStep}>⬆️ No Safari: Compartilhar → "Adicionar à Tela de Início"</Text>
                </>
              )}
            </ScrollView>
            <Pressable style={styles.modalButton} onPress={() => setModalOpen(false)}>
              <Text style={styles.modalButtonText}>Entendi</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.sanctum,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerEmoji: {
    fontSize: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: colors.alba,
  },
  bannerAction: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.goldDim,
  },
  bannerClose: {
    fontSize: 16,
    color: colors.albaMuted,
    paddingHorizontal: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.sanctum,
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.alba,
    marginBottom: spacing.lg,
  },
  modalBody: {
    maxHeight: 200,
  },
  modalStep: {
    fontSize: 14,
    color: colors.alba,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  modalButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.alba,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.sanctum,
  },
});
