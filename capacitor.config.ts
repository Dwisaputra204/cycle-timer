import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dwisaputra.cycletimer",
  appName: "cycle-timer",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000, // Durasi tampilan splash dalam milidetik
      launchAutoHide: true,
      backgroundColor: "#ffffff", // Warna background
      androidSplashResourceName: "splash", // Nama resource
      androidScaleType: "CENTER_CROP", // Tipe scaling
      showSpinner: true, // Tampilkan spinner
      androidSpinnerStyle: "large", // Style spinner (Android)
      iosSpinnerStyle: "large", // Style spinner (iOS)
      spinnerColor: "#999999", // Warna spinner
    },
  },
};

export default config;
