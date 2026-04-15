import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://payroll-management-1-nb0h.onrender.com',
        changeOrigin: true,
      }
    }
  }
});
