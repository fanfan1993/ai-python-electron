import { app, BrowserWindow, net, protocol } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'morrow',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
])

let mainWindow: BrowserWindow | null = null

async function registerAppProtocol() {
  const rendererDirectory = path.resolve(__dirname, '../renderer/main_window')
  await protocol.handle('morrow', (request) => {
    const pathname = decodeURIComponent(new URL(request.url).pathname).replace(/^\/+/, '')
    const relativePath = pathname || 'index.html'
    const filePath = path.resolve(rendererDirectory, relativePath)

    if (filePath !== rendererDirectory && !filePath.startsWith(`${rendererDirectory}${path.sep}`)) {
      return new Response('Not found', { status: 404 })
    }

    return net.fetch(pathToFileURL(filePath).toString())
  })
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: '#351019',
    title: 'Morrow · 每日食记',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  const trustedOrigin = MAIN_WINDOW_VITE_DEV_SERVER_URL
    ? new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL).origin
    : 'morrow://app'
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== trustedOrigin) event.preventDefault()
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    await mainWindow.loadURL(`morrow://app/index.html`)
  }
}

app.whenReady().then(async () => {
  await registerAppProtocol()
  await createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
