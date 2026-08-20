import { Platform, Share } from "react-native";

export function buildShareText(score: number, total: number, rankTitle: string): string {
  return `Fiz ${score}/${total} no quiz litúrgico do Tarcisius e virei "${rankTitle}"! 🙏`;
}

export async function shareResult(text: string): Promise<"shared" | "copied" | "unavailable"> {
  if (Platform.OS === "web") {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ text });
        return "shared";
      } catch {
        // User cancelled or it failed — try clipboard.
      }
    }
    if (nav?.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(text);
        return "copied";
      } catch {
        return "unavailable";
      }
    }
    return "unavailable";
  }

  // Native (iOS/Android)
  try {
    const result = await Share.share({ message: text });
    if (result.action === Share.sharedAction) return "shared";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}
