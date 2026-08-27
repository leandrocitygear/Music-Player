
const { contextBridge, ipcRenderer } = require('electron');

console.log('PRELOAD LOADED');

contextBridge.exposeInMainWorld('electronAPI', {

    selectMusicFiles: () =>
  ipcRenderer.invoke('select-music-files'),

selectMusicFolder: () =>
  ipcRenderer.invoke('select-music-folder'),

  getLibrary: () =>
  ipcRenderer.invoke("get-library"),
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

  addAlbum: (album) =>
      ipcRenderer.invoke(
        'add-album',
        album
      ),

    addArtist: (artist) =>
      ipcRenderer.invoke(
        'add-artist',
        artist
      ),

    addGenre: (genre) =>
      ipcRenderer.invoke(
        'add-genre',
        genre
      ),

    addSong: (song) =>
      ipcRenderer.invoke(
        'add-song',
        song
      ),

    addFolder: (folder) =>
      ipcRenderer.invoke(
        'add-folder',
        folder
      ),

      // =========================
    // IMPORTER
    // =========================

    importSong: (filePath) =>
      ipcRenderer.invoke(
        'import-song',
        filePath
      ),

    importFolder: (folderPath) =>
      ipcRenderer.invoke(
        'import-folder',
        folderPath
      ),

      populateArtistArtwork: () =>
  ipcRenderer.invoke(
    "populate-artist-artwork"
  ),

  getSong: (songId) =>
  ipcRenderer.invoke(
    "get-song",
    songId
  ),

  decodeALAC: (filePath) =>
  ipcRenderer.invoke(
    'decode-alac',
    filePath
  ),

  setSongFavorite: (
  songId,
  isFavorite
) =>
  ipcRenderer.invoke(
    "set-song-favorite",
    songId,
    isFavorite
  ),

  removeSongFromPlaylist: (
  playlistId,
  songId
) =>
  ipcRenderer.invoke(
    "remove-song-from-playlist",
    playlistId,
    songId
  ),

  deleteAlbum: (albumId) =>
    ipcRenderer.invoke(
        "delete-album",
        albumId
    ),

  deleteSong: (songId) =>
    ipcRenderer.invoke(
        "delete-song",
        songId
    ),

    createPlaylist: (
  name,
  description
) =>
  ipcRenderer.invoke(
    "create-playlist",
    name,
    description
  ),
  deletePlaylist: (playlistId) => 
    ipcRenderer.invoke('deletePlaylist', playlistId),
  addSongToPlaylist: (playlistId, songId) => 
    ipcRenderer.invoke('addSongToPlaylist', playlistId, songId)
      
});