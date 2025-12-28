import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import { execSync } from 'child_process';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import jotaiReactRefresh from 'jotai/babel/plugin-react-refresh';

const commitHash = execSync('git rev-parse --verify --short HEAD').toString().trim();
const versionTag = execSync('git --no-pager tag --sort -taggerdate --points-at HEAD')
  .toString()
  .split('\n')[0]
  .trim();
// If not empty then it's not clean
const gitCleanString = execSync('git status --porcelain').toString();
const gitClean = gitCleanString ? false : true;
if (!gitClean) console.log('Git is dirty because of:\n' + gitCleanString);

console.log(`version is ${versionTag || commitHash}${gitClean ? '' : '-dirty'}`);

// Detect fluent file changes
export function i18nHotReload(): PluginOption {
  return {
    name: 'i18n-hot-reload',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.ftl')) {
        console.log('Fluent files updated');
        server.hot.send({
          type: 'custom',
          event: 'locales-update',
        });
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Avoid noisy warnings/telemetry during local dev.
  // Only run Sentry sourcemap upload in production builds when a token is provided (e.g. CI).
  const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
  const enableSentryBundlerPlugin =
    command === 'build' && mode === 'production' && !!sentryAuthToken;

  const plugins = [
    react({ babel: { plugins: [jotaiReactRefresh] } }),
    i18nHotReload(),
    visualizer() as PluginOption,
    enableSentryBundlerPlugin
      ? sentryVitePlugin({
          org: 'slimevr',
          project: 'slimevr-server-gui-react',
          authToken: sentryAuthToken,
          telemetry: false,
        })
      : null,
  ].filter(Boolean) as PluginOption[];

  return {
    define: {
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __VERSION_TAG__: JSON.stringify(versionTag),
      __GIT_CLEAN__: gitClean,
    },
    plugins,
    build: {
      target: 'es2022',
      emptyOutDir: true,

      commonjsOptions: {
        include: [/solarxr-protocol/, /node_modules/],
      },

      sourcemap: true,
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'es2022',
      },
      needsInterop: ['solarxr-protocol'],
      include: ['solarxr-protocol'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
  };
});
