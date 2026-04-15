import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { warmupPrinter, shutdownPrinter, printTicket } from './printer'
import type { TicketPayload } from './printer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DEV_URL   = process.env['VITE_DEV_SERVER_URL']

let mainWindow: BrowserWindow | null = null

// ─── Main window ──────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !DEV_URL,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (DEV_URL) {
    mainWindow.loadURL(DEV_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// ─── IPC: terminal.print ─────────────────────────────────────────────────────
// Receives TicketPayload from renderer, returns { ok, mode, bytes, error? }

ipcMain.handle('terminal:print', async (_event, payload: TicketPayload) => {
  try {
    return await printTicket(payload)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[IPC terminal:print]', msg)
    return { ok: false, error: msg }
  }
})

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Start PS server in the background so Add-Type compiles before first print
  warmupPrinter()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  shutdownPrinter()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
