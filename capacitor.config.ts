import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cash3.app',
  appName: 'Cash 3 Edge',
  webDir: 'out',
  server: {
    url: 'https://www.cas3.app',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#020b2d',
      showSpinner: false,
    },
  },
};

export default config;
