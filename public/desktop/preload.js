const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    appVersion: () => ipcRenderer.invoke('app:version'),
    openExam: (code) => ipcRenderer.send('exam:open', code),
    retryConnection: () => ipcRenderer.send('exam:retry'),
    requestExit: () => ipcRenderer.send('exam:request-exit'),
    onConnectionStatus: (callback) => ipcRenderer.on('connection:status', (_event, value) => callback(value)),
});
