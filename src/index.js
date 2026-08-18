const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const db = require("./database");

const {
  getAlbums,
  getArtists,
  getSongs,
  getGenres,
  getPlaylists,

  addArtist,
  addGenre,
  addAlbum,
  addSong
} = require("./database");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1012,
    height: 690,
    minWidth: 1012,
    minHeight: 690,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: 'rgba(0, 0, 0, 0)',
      symbolColor: '#fff',
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
  
};

  ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({

      filters: [
        {
          name: 'Music files',
          extensions: ['mp3', 'wav', 'aac', 'm4a', 'flac', 'wma']
        }
      ],
      properties: ['openFile', 'multiSelections']
    }).then(result => {
      if (!result.canceled) {
        event.sender.send('selected-files', result.filePaths);
      }
    }).catch(err => {
      console.error(err);
    });
  });

  ipcMain.handle("get-albums", () => {
  return getAlbums();
});

ipcMain.handle("get-artists", () => {
  return getArtists();
});

ipcMain.handle("get-songs", () => {
  return getSongs();
});

ipcMain.handle("get-genres", () => {
  return getGenres();
});

ipcMain.handle("get-playlists", () => {
  return getPlaylists();
});

ipcMain.handle("add-album", () => {
  return addAlbum();
});

ipcMain.handle("add-artist", () => {
  return addArtist();
});

ipcMain.handle("add-genre", () => {
  return addGenre();
});

ipcMain.handle("add-song", () => {
  return addSong();
});

// This method will be called when Electron has finishe
// initialization and is ready to create browser windo.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();

    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and imrt t .


    