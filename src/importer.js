const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

const {
  addArtist,
  addGenre,
  addAlbum,
  addSong
} = require("./queries");


const SUPPORTED_EXTENSIONS = [
  ".mp3",
  ".m4a",
  ".flac",
  ".wav",
  ".aac",
  ".ogg",
  ".opus",
  ".wma"
];


function isMusicFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  return SUPPORTED_EXTENSIONS.includes(extension);
}


async function importSong(filePath, folderId = null) {

  try {

    console.log("Importing:", filePath);

    const metadata = await mm.parseFile(filePath);

    const common = metadata.common;
    const format = metadata.format;

    const fileStats = fs.statSync(filePath);


    // -------------------------
    // ARTIST
    // -------------------------

    const artistName =
      common.artist ||
      common.albumartist ||
      "Unknown Artist";

    const artistSortName =
      common.artistsort ||
      artistName;


    const artistId = addArtist(
      artistName,
      artistSortName,
      null
    );


    // -------------------------
    // GENRE
    // -------------------------

    const genreName =
      common.genre?.[0] ||
      null;

    const genreId = genreName
      ? addGenre(genreName)
      : null;


    // -------------------------
    // ALBUM
    // -------------------------

    const albumTitle =
      common.album ||
      "Unknown Album";

    const albumArtist =
      common.albumartist ||
      artistName;


    const albumId = addAlbum({
      title: albumTitle,

      sortTitle:
        common.albumsort ||
        albumTitle,

      artistId,

      genreId,

      albumArtist,

      artworkPath: null,

      releaseDate:
        common.date ||
        null,

      releaseYear:
        common.year ||
        null,

      totalTracks:
        common.track?.of ||
        null,

      discCount:
        common.disk?.of ||
        null,

      recordLabel:
        common.label?.[0] ||
        null,

      copyright:
        common.copyright ||
        null,

      musicbrainzId:
        common.musicbrainz_albumid ||
        null
    });


    // -------------------------
    // SONG
    // -------------------------

    const songId = addSong({

      title:
        common.title ||
        path.basename(filePath),

      sortTitle:
        common.titlesort ||
        common.title ||
        path.basename(filePath),

      artistId,

      albumId,

      albumArtist,

      filePath,

      fileName:
        path.basename(filePath),

      fileSize:
        fileStats.size,

      trackNumber:
        common.track?.no ||
        null,

      trackTotal:
        common.track?.of ||
        null,

      discNumber:
        common.disk?.no ||
        null,

      discTotal:
        common.disk?.of ||
        null,

      duration:
        format.duration ||
        null,

      bitrate:
        format.bitrate ||
        null,

      sampleRate:
        format.sampleRate ||
        null,

      bitsPerSample:
        format.bitsPerSample ||
        null,

      channels:
        format.numberOfChannels ||
        null,

      lossless:
        format.lossless ||
        false,

      codec:
        format.codec ||
        null,

      container:
        format.container ||
        null,

      releaseDate:
        common.date ||
        null,

      releaseYear:
        common.year ||
        null,

      composer:
        common.composer?.[0] ||
        null,

      comment:
        common.comment?.join("\n") ||
        null,

      copyright:
        common.copyright ||
        null,

      publisher:
        common.publisher ||
        null,

      musicbrainzId:
        common.musicbrainz_recordingid ||
        null,

      isrc:
        common.isrc?.[0] ||
        null,

      folderId
    });


    console.log(
      `Imported: ${common.title} (${songId})`
    );


    return {
      success: true,
      songId
    };

  } catch (error) {

    console.error(
      "Failed to import:",
      filePath
    );

    console.error(error);

    return {
      success: false,
      filePath,
      error: error.message
    };
  }
};


async function scanFolder(folderPath, folderId = null) {

  const entries = fs.readdirSync(
    folderPath,
    { withFileTypes: true }
  );

  let imported = [];
  let failed = [];


  for (const entry of entries) {

    const fullPath = path.join(
      folderPath,
      entry.name
    );


    // Folder
    if (entry.isDirectory()) {

      const result = await scanFolder(
        fullPath,
        folderId
      );

      imported.push(...result.imported);
      failed.push(...result.failed);

      continue;
    }


    // File
    if (!entry.isFile()) {
      continue;
    }


    if (!isMusicFile(fullPath)) {
      continue;
    }


    const result = await importSong(
      fullPath,
      folderId
    );


    if (result.success) {
      imported.push(result);
    } else {
      failed.push(result);
    }
  }


  return {
    imported,
    failed
  };
};


module.exports = {
  importSong,
  scanFolder,
  isMusicFile
};