import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import vueDevTools from 'vite-plugin-vue-devtools';
import path from 'path';

export default defineConfig({
    base: '/', 
  plugins: [
    vue(),
    vueDevTools(),
    vuetify({
      autoImport: true,
    }),
  ],
  cacheDir: '.vite-cache',
  define: {
    'process.env': process.env,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' as const,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      modules: path.resolve(__dirname, 'src/stores/modules'),
      layouts: path.resolve(__dirname, 'src/views/layouts'),
      pages: path.resolve(__dirname, 'src/views/pages'),
      images: path.resolve(__dirname, 'src/assets/images'),
      styles: path.resolve(__dirname, 'src/assets/styles'),
      services: path.resolve(__dirname, 'src/utils/services'),
      helpers: path.resolve(__dirname, 'src/utils/helpers'),
    },
  },
  optimizeDeps: {
    include: [
      'vuetify',
      'vuetify/components',
      'vuetify/directives',
      'vuetify/locale',
    ],
    exclude: ['object-inspect'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: [],
      output: {
        globals: { axios: 'axios', },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        entryFileNames: 'assets/[hash][name].js',
        chunkFileNames: 'assets/[hash][name].js',
        assetFileNames: 'assets/[hash][name].[ext]',
      },
    },
    chunkSizeWarningLimit: 1600,
    terserOptions: {
      compress: {
        drop_console: true, // Change to true before production
        drop_debugger: true, // Change to true before production
      },
    },
  },
  publicDir: 'public',
});
