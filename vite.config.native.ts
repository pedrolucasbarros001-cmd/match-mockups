// Build config para o app NATIVO (iOS/Android via Capacitor).
// Diferença face ao vite.config.ts: sem nitro (não há servidor no telefone) e
// em modo SPA, que emite um index.html estático — o Capacitor serve ficheiros.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: false,
  tanstackStart: {
    // outputPath: o shell tem de sair como index.html — é o ficheiro que a
    // WebView do Capacitor carrega ao arrancar o app.
    spa: { enabled: true, prerender: { outputPath: "/index.html" } },
  },
});
