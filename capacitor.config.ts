
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biomed.os',
  appName: 'BioMed OS',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
