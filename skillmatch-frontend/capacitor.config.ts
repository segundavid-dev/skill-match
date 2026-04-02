import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skillmatch.app',
  appName: 'SkillMatch',
  webDir: 'dist',
  server: {
    url: 'https://skill-match-weld.vercel.app/',
    cleartext: true
  }
};

export default config;
