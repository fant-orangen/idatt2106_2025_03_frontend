import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [
        ...configDefaults.exclude,
        'e2e/**',
        'src/assets/**',
        'src/i18n.ts',
        'src/main.ts',
        'src/router/**',
        'src/types/**',
        'src/components/ui/**/index.ts',
      ],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        exclude: [
          'src/components/**',

        ],
        include: [
          'src/stores/**',
          'src/services/**',
          'src/composables/**',
          'src/utils/**',
          'src/views/**',
        ]
      }
    },
  }),
)
