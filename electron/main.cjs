const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')

function storageFile() {
  return path.join(app.getPath('userData'), 'retailops-storage.json')
}

function readStorage() {
  try { return JSON.parse(fs.readFileSync(storageFile(), 'utf8')) } catch { return {} }
}

function writeStorage(data) {
  fs.writeFileSync(storageFile(), JSON.stringify(data, null, 2), 'utf8')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL)
  else win.loadFile(path.join(__dirname, '../dist/index.html'))
}

ipcMain.handle('app:getInfo', () => ({ version: app.getVersion(), platform: process.platform }))
ipcMain.handle('storage:get', (_event, key) => readStorage()[key] ?? null)
ipcMain.handle('storage:set', (_event, key, value) => {
  const data = readStorage()
  data[key] = value
  writeStorage(data)
})
ipcMain.handle('storage:remove', (_event, key) => {
  const data = readStorage()
  delete data[key]
  writeStorage(data)
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
