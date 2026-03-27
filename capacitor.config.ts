import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cash3edge.app",
  appName: "Cash 3 Edge",
  // Points to your live hosted URL — the WebView loads from here.
  // Change this to your Vercel / Railway / custom domain before building.
  webDir: "out", // unused when server.url is set
  server: {
    url: "https://your-production-domain.com",
    cleartext: false,
  },
  ios: {
    contentInset: "always", // respect notch / Dynamic Island / home bar
    scrollEnabled: false,   // prevent rubber-band bounce on the outer shell
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#020b2d",
      showSpinner: false,
    },
  },
};

export default config;
