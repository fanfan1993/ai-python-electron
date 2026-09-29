import type { ForgeConfig } from '@electron-forge/shared-types'
import { MakerZIP } from '@electron-forge/maker-zip'
import { VitePlugin } from '@electron-forge/plugin-vite'
import path from 'node:path'
import { tmpdir } from 'node:os'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    appBundleId: 'com.morrow.dailyritual',
    appCategoryType: 'public.app-category.lifestyle',
    download: {
      cacheRoot: process.env.MORROW_ELECTRON_CACHE ?? path.join(tmpdir(), 'morrow-electron-cache'),
      mirrorOptions: {
        mirror: process.env.MORROW_ELECTRON_MIRROR ?? 'https://npmmirror.com/mirrors/electron/',
      },
    },
  },
  rebuildConfig: {},
  makers: [new MakerZIP({}, ['darwin'])],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'electron/main.ts', config: 'vite.main.config.ts' },
        { entry: 'electron/preload.ts', config: 'vite.preload.config.ts' },
      ],
      renderer: [{ name: 'main_window', config: 'vite.renderer.config.ts' }],
    }),
  ],
}

export default config
