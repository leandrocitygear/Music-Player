const db = require("./database");

// =========================
// ALBUMS
// =========================

function getAlbums() {
  return db.prepare(`
    SELECT
      albums.id,
  albums.title,
  albums.sort_title,

  albums.artist_id,
  albums.genre_id,

  albums.artwork_path,
  albums.release_date,
  albums.release_year,
  albums.total_tracks,
  albums.disc_count,

  artists.name AS artist,
  genres.name AS genre
    FROM albums
    LEFT JOIN artists
      ON albums.artist_id = artists.id
    LEFT JOIN genres
      ON albums.genre_id = genres.id
    ORDER BY albums.sort_title, albums.title
  `).all();
}


// =========================
// ARTISTS
// =========================

function getArtists() {
  return db.prepare(`
    SELECT
      artists.id,
      artists.name,
      artists.sort_name,
      artists.artwork_path
    FROM artists
    ORDER BY artists.sort_name, artists.name
  `).all();
}


// =========================
// SONGS
// =========================

function getSongs() {
  return db.prepare(`
    SELECT 
      songs.*,

      artists.name AS artist,

      albums.title AS album,
      albums.artwork_path AS artwork_path,

      genres.name AS genre

    FROM songs

    LEFT JOIN artists
      ON songs.artist_id = artists.id

    LEFT JOIN albums
      ON songs.album_id = albums.id

    LEFT JOIN genres
      ON albums.genre_id = genres.id

    ORDER BY 
      artists.sort_name,
      albums.sort_title,
      songs.disc_number,
      songs.track_number,
      songs.title
  `).all();
}


// =========================
// GENRES
// =========================

function getGenres() {
  return db.prepare(`
    SELECT
      genres.id,
      genres.name
    FROM genres
    ORDER BY genres.name
  `).all();
}


// =========================
// PLAYLISTS
// =========================

function getPlaylists() {
  return db.prepare(`
    SELECT
      id,
      name,
      description,
      artwork_path,
      created_at,
      updated_at
    FROM playlists
    ORDER BY name
  `).all();
}


function addArtist(name, sortName = null, artworkPath = null) {
  const existing = db.prepare(`
    SELECT id
    FROM artists
    WHERE name = ?
  `).get(name);

  if (existing) {
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO artists (
      name,
      sort_name,
      artwork_path
    )
    VALUES (?, ?, ?)
  `).run(
    name,
    sortName,
    artworkPath
  );

  return result.lastInsertRowid;
};


function addGenre(name) {
  if (!name) {
    return null;
  }

  const existing = db.prepare(`
    SELECT id
    FROM genres
    WHERE name = ?
  `).get(name);

  if (existing) {
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO genres (name)
    VALUES (?)
  `).run(name);

  return result.lastInsertRowid;
};

function addAlbum(album) {
 
  // =========================
  // CHECK IF ALBUM EXISTS
  // =========================

  const existing = db.prepare(`
    SELECT id
    FROM albums
    WHERE title = ?
      AND artist_id = ?
  `).get(
    album.title,
    album.artistId
  );


  // =========================
  // UPDATE EXISTING ALBUM
  // =========================

  if (existing) {

    db.prepare(`
      UPDATE albums
      SET
        sort_title = COALESCE(?, sort_title),
        genre_id = COALESCE(?, genre_id),
        album_artist = COALESCE(?, album_artist),
        artwork_path = COALESCE(?, artwork_path),
        release_date = COALESCE(?, release_date),
        release_year = COALESCE(?, release_year),
        total_tracks = COALESCE(?, total_tracks),
        disc_count = COALESCE(?, disc_count),
        record_label = COALESCE(?, record_label),
        copyright = COALESCE(?, copyright),
        musicbrainz_id = COALESCE(?, musicbrainz_id),
        updated_at = CURRENT_TIMESTAMP

      WHERE id = ?
    `).run(

      album.sortTitle,
      album.genreId,
      album.albumArtist,
      album.artworkPath,
      album.releaseDate,
      album.releaseYear,
      album.totalTracks,
      album.discCount,
      album.recordLabel,
      album.copyright,
      album.musicbrainzId,

      existing.id
    );

    return existing.id;
  }


  // =========================
  // CREATE NEW ALBUM
  // =========================

  const result = db.prepare(`
    INSERT INTO albums (
      title,
      sort_title,
      artist_id,
      genre_id,
      album_artist,
      artwork_path,
      release_date,
      release_year,
      total_tracks,
      disc_count,
      record_label,
      copyright,
      musicbrainz_id
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

  `).run(

    album.title,
  album.sortTitle || album.title,
  album.artistId || null,
  album.genreId || null,
  album.albumArtist || null,
  album.artworkPath || null,
  album.releaseDate || null,
  album.releaseYear || null,
  album.totalTracks || null,
  album.discCount || null,
  album.recordLabel || null,
  album.copyright || null,
  album.musicbrainzId || null
  );


  return result.lastInsertRowid;
};

function addSong(song) {
  const existing = db.prepare(`
    SELECT id
    FROM songs
    WHERE file_path = ?
  `).get(song.filePath);

  if (existing) {
    return existing.id;
  }

  const result = db.prepare(`
    INSERT INTO songs (
      title,
      sort_title,
      artist_id,
      album_id,
      album_artist,

      file_path,
      file_name,
      file_size,

      track_number,
      track_total,

      disc_number,
      disc_total,

      duration,

      bitrate,
      sample_rate,
      bits_per_sample,
      channels,

      lossless,

      codec,
      container,

      release_date,
      release_year,

      composer,
      comment,
      copyright,
      publisher,

      musicbrainz_id,
      isrc,

      folder_id
    )
    VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?,
      ?,
      ?, ?, ?, ?,
      ?,
      ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?
    )
  `).run(
    song.title,
    song.sortTitle,
    song.artistId,
    song.albumId,
    song.albumArtist,

    song.filePath,
    song.fileName,
    song.fileSize,

    song.trackNumber,
    song.trackTotal,

    song.discNumber,
    song.discTotal,

    song.duration,

    song.bitrate,
    song.sampleRate,
    song.bitsPerSample,
    song.channels,

    song.lossless ? 1 : 0,

    song.codec,
    song.container,

    song.releaseDate,
    song.releaseYear,

    song.composer,
    song.comment,
    song.copyright,
    song.publisher,

    song.musicbrainzId,
    song.isrc,

    song.folderId
  );

  return result.lastInsertRowid;
};


function addFolder(folderPath, name) {

  const existing = db.prepare(`
    SELECT id
    FROM folders
    WHERE path = ?
  `).get(folderPath);


  if (existing) {
    return existing.id;
  }


  const result = db.prepare(`
    INSERT INTO folders (
      path,
      name
    )
    VALUES (?, ?)
  `).run(
    folderPath,
    name
  );


  return result.lastInsertRowid;
};

function getLibrary() {
  return {
    albums: getAlbums(),
    artists: getArtists(),
    songs: getSongs(),
    genres: getGenres(),
    playlists: getPlaylists()
  };
}

module.exports = {
  db,
  getLibrary,
  getAlbums,
  getArtists,
  getSongs,
  getGenres,
  getPlaylists,

  addArtist, 
  addGenre,
  addAlbum,
  addSong,
  addFolder
};