const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const db = require("./database");
const decoder = require("@audio/decode-aac").default;

const {
  getLibrary,
  getAlbums,
  getArtists,
  getSongs,
  getGenres,
  getPlaylists,
  getSong,

  addArtist,
  addGenre,
  addAlbum,
  addSong,
  addFolder
} = require("./queries");

const {
  importSong,
  scanFolder,
  populateArtistArtwork
} = require('./importer');


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

  ipcMain.handle('select-music-files', async () => {

  const result = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Music files',
        extensions: [
          'mp3',
          'wav',
          'aac',
          'm4a',
          'flac',
          'wma',
          'ogg',
          'opus'
        ]
      }
    ],
    properties: [
      'openFile',
      'multiSelections'
    ]
  });

  if (result.canceled) {
    return [];
  }

  return result.filePaths;
});


ipcMain.handle('select-music-folder', async () => {

  const result = await dialog.showOpenDialog({
    properties: [
      'openDirectory'
    ]
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0];
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

ipcMain.handle('add-album', (event, album) => {
  return addAlbum(album);
});

ipcMain.handle('add-artist', (event, artist) => {
  return addArtist(
    artist.name,
    artist.sortName,
    artist.artworkPath
  );
});

ipcMain.handle('add-genre', (event, genre) => {
  return addGenre(genre.name);
});

ipcMain.handle('add-song', (event, song) => {
  return addSong(song);
});

ipcMain.handle('add-folder', (event, folder) => {
  return addFolder(
    folder.path,
    folder.name
  );
});

ipcMain.handle('import-song', async (event, filePath) => {

  return await importSong(filePath);

}); 


ipcMain.handle('import-folder', async (event, folderPath) => {

  const folderName = path.basename(folderPath);

  const folderId = addFolder(
    folderPath,
    folderName
  );

  return await scanFolder(
    folderPath,
    folderId
  );

});

ipcMain.handle("get-library", () => {
  return getLibrary();
});


ipcMain.handle(
  "populate-artist-artwork",
  async () => {

    await populateArtistArtwork();

    return {
      success: true
    };

  }
);

ipcMain.handle('get-song', (event, songId) => {
  return getSong(songId);
});


ipcMain.handle('decode-alac', async (event, filePath) => {
  try {

   console.log("Decoding ALAC:", filePath);

    const fs = require('node:fs/promises');

    const fileBuffer = await fs.readFile(filePath);

    const decoded = await decoder(fileBuffer);

    console.log("ALAC decoded successfully");

    return {
      channelData: decoded.channelData,
      sampleRate: decoded.sampleRate
    };

  } catch (error) {

    console.error("ALAC decoding failed:", error);

    throw error;
  }
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


    