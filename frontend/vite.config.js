import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Clinic Appointment Booking",
        short_name: "Clinic Booking",
        start_url: "/",
        display: "standalone",
        background_color: "#fff7ed",
        theme_color: "#0f766e",
        icons: [],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
