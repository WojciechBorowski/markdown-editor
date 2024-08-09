const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  listFiles: (directory) => ipcRenderer.invoke('list-files', directory),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  saveFile: (data) => ipcRenderer.invoke('save-file', data), 
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog')
});
