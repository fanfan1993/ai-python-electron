import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('morrowDesktop', {
  platform: process.platform,
  version: process.versions.electron,
})
