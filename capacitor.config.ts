import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.homematch.app",
  appName: "HomeMatch",
  // Output do build SPA (vite.config.native.ts) — a WebView carrega daqui.
  webDir: "dist/client",
  ios: {
    contentInset: "never",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 600,
      backgroundColor: "#F9FAFB",
    },
  },
};

export default config;
