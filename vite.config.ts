
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // Charts library
            if (id.includes('recharts')) {
              return 'charts';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // UI libraries
            if (id.includes('radix') || id.includes('lucide')) {
              return 'ui-vendor';
            }
            // Other vendors
            return 'vendor';
          }

          // App chunks
          if (id.includes('/components/reports/')) {
            return 'reports';
          }
          if (id.includes('/components/insights/')) {
            return 'insights';
          }
          if (id.includes('/components/tax/')) {
            return 'tax';
          }
          if (id.includes('/hooks/')) {
            return 'hooks';
          }
        },
        // Optimize chunk sizes
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
      },
    },
    // Performance optimizations
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false, // Faster builds
  },
  preview: {
    port: 4173,
    host: true,
  },
}));
