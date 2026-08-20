import { Platform } from "react-native";

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function isRunningStandalone(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  return (
    window.navigator.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

function isIOSDevice(): boolean {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isSafariBrowser(): boolean {
  if (Platform.OS !== "web" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/.test(ua);
}

export function isIOSSafariBrowser(): boolean {
  return isIOSDevice() && isSafariBrowser();
}

export function isIOSNonSafariBrowser(): boolean {
  return isIOSDevice() && !isSafariBrowser();
}

export function shouldOfferIOSInstallPrompt(): boolean {
  return isIOSSafariBrowser() && !isRunningStandalone();
}

export function shouldOfferSwitchToSafariPrompt(): boolean {
  return isIOSNonSafariBrowser() && !isRunningStandalone();
}

export function registerServiceWorker(): void {
  if (Platform.OS !== "web" || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
