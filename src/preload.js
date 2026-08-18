
const { contextBridge, ipcRenderer } = require('electron');
const { addAlbum, addArtist, addGenre, addSong } = require('./queries');

console.log('PRELOAD LOADED');

contextBridge.exposeInMainWorld('electronAPI', {
    openFileDialog: () => {
        ipcRenderer.send('open-file-dialog');
    },

    onSelectedFiles: (callback) => {
        ipcRenderer.on('selected-files', (event, filePaths) => {
            callback(filePaths);
        });
    },

    // Database
  getAlbums: () =>
    ipcRenderer.invoke("get-albums"),

  getArtists: () =>
    ipcRenderer.invoke("get-artists"),

  getSongs: () =>
    ipcRenderer.invoke("get-songs"),

  getGenres: () =>
    ipcRenderer.invoke("get-genres"),

  getPlaylists: () =>
    ipcRenderer.invoke("get-playlists"),

  addAlbum: () =>
    ipcRenderer.invoke("add-album"),

  addArtist: () =>
    ipcRenderer.invoke("add-artist"),

  addGenre: () =>
    ipcRenderer.invoke("add-genre"),

  addSong: () =>
    ipcRenderer.invoke("add-song")


});