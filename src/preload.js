
const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD LOADED');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => {
        ipcRenderer.send('open-file-dialog');
    },

    onSelectedFiles: (callback) => {
        ipcRenderer.on('selected-files', (event, filePaths) => {
            callback(filePaths);
        });
    }
});