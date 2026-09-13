const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('retailDesktop', {
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  storageGet: (key) => ipcRenderer.invoke('storage:get', key),
  storageSet: (key, value) => ipcRenderer.invoke('storage:set', key, value),
  storageRemove: (key) => ipcRenderer.invoke('storage:remove', key),
})
