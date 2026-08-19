const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");
const { app } = require("electron");

const {
  getArtistsWithoutArtwork,
  getArtists,
  getArtist,
  addArtist,
  addGenre,
  addAlbum,
  addSong,
  updateAlbumArtwork,
  updateArtistArtwork
} = require("./queries");

const {
  downloadArtistArtwork
} = require("./artistArtwork");


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

function saveArtwork(pictures, albumId) {

  if (!pictures || pictures.length === 0) {
    return null;
  }

  const picture = pictures[0];

  const artworkDir = path.join(
    app.getPath("userData"),
    "artwork"
  );

  fs.mkdirSync(
    artworkDir,
    { recursive: true }
  );

  const extension =
    picture.format === "image/png"
      ? ".png"
      : ".jpg";

  const artworkPath = path.join(
    artworkDir,
    `album-${albumId}${extension}`
  );

  fs.writeFileSync(
    artworkPath,
    picture.data
  );

  return artworkPath;
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

    const artist = getArtist(artistId);

if (!artist.artwork_path) {

  const artworkPath =
    await downloadArtistArtwork(
      artistName,
      artistId
    );

  if (artworkPath) {

    updateArtistArtwork(
      artistId,
      artworkPath
    );

  }
}

    const artistArtworkPath =
  await downloadArtistArtwork(
    artistName,
    artistId
  );

if (artistArtworkPath) {

  updateArtistArtwork(
    artistId,
    artistArtworkPath
  );

}


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

    const artworkPath = saveArtwork(
  common.picture,
  albumId
);

updateAlbumArtwork(
  albumId,
  artworkPath
);


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


async function populateArtistArtwork() {

  const artists = getArtistsWithoutArtwork();

  console.log(
    `Found ${artists.length} artists without artwork.`
  );

  for (const artist of artists) {

    try {

      console.log(
        `Getting artwork for: ${artist.name}`
      );

      const artworkPath =
        await downloadArtistArtwork(
          artist.name,
          artist.id
        );

      if (artworkPath) {

        updateArtistArtwork(
          artist.id,
          artworkPath
        );

        console.log(
          `Artwork saved for ${artist.name}`
        );

      }

    } catch (error) {

      console.error(
        `Artwork failed for ${artist.name}:`,
        error.message
      );

    }
  }

  console.log(
    "Artist artwork population complete."
  );
}


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
  isMusicFile,
  populateArtistArtwork
};