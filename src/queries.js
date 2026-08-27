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

function getArtist(id) {
  return db.prepare(`
    SELECT
      artists.id,
      artists.name,
      artists.sort_name,
      artists.artwork_path
    FROM artists
    WHERE artists.id = ?
  `).get(id);
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
 
  const playlists = db.prepare(`
    SELECT *
    FROM playlists
    ORDER BY name
  `).all();

  const getPlaylistSongs = db.prepare(`
    SELECT song_id
    FROM playlist_songs
    WHERE playlist_id = ?
    ORDER BY position
  `);

  return playlists.map(playlist => {

    const songs = getPlaylistSongs.all(playlist.id);

    return {
      ...playlist,
      song_ids: songs.map(song => song.song_id)
    };

  });
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

function updateAlbumArtwork(albumId, artworkPath) {

  if (!artworkPath) {
    return;
  }

  db.prepare(`
    UPDATE albums
    SET
      artwork_path = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    artworkPath,
    albumId
  );
}

function updateArtistArtwork(artistId, artworkPath) {

  db.prepare(`
    UPDATE artists
    SET artwork_path = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    artworkPath,
    artistId
  );

}

function getArtistsWithoutArtwork() {
  return db.prepare(`
    SELECT
      id,
      name,
      artwork_path
    FROM artists
    WHERE artwork_path IS NULL
       OR artwork_path = ''
    ORDER BY name
  `).all();
}

function getSong(id) {
  return db.prepare(`
    SELECT *
    FROM songs
    WHERE id = ?
  `).get(id);
}

function setSongFavorite(songId, isFavorite) {
  
 const favoritesPlaylist = db.prepare(`
        SELECT id
        FROM playlists
        WHERE name = 'Favorites'
    `).get();

    if (!favoritesPlaylist) {
        throw new Error("Favorites playlist not found");
    }

    // Update favorite state
    db.prepare(`
        UPDATE songs
        SET is_favorite = ?
        WHERE id = ?
    `).run(
        isFavorite ? 1 : 0,
        songId
    );

    if (isFavorite) {

        // Get the next position
        const result = db.prepare(`
            SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition
            FROM playlist_songs
            WHERE playlist_id = ?
        `).get(favoritesPlaylist.id);

        db.prepare(`
            INSERT OR IGNORE INTO playlist_songs
            (
                playlist_id,
                song_id,
                position
            )
            VALUES (?, ?, ?)
        `).run(
            favoritesPlaylist.id,
            songId,
            result.nextPosition
        );

    } else {

        db.prepare(`
            DELETE FROM playlist_songs
            WHERE playlist_id = ?
            AND song_id = ?
        `).run(
            favoritesPlaylist.id,
            songId
        );
    }
}

function removeSongFromPlaylist(
  playlistId,
  songId
) {

  db.prepare(`
    DELETE FROM playlist_songs
    WHERE playlist_id = ?
    AND song_id = ?
  `).run(
    playlistId,
    songId
  );

  return {
    success: true
  };
}

function deleteSong(songId) {

     const song = db.prepare(`
        SELECT album_id, artist_id
        FROM songs
        WHERE id = ?
    `).get(songId);

    if (!song) return;

    // 1. Delete the song
    db.prepare(`
        DELETE FROM songs
        WHERE id = ?
    `).run(songId);

    // 2. Check whether the album still has songs
    if (song.album_id) {
        const remainingSongs = db.prepare(`
            SELECT COUNT(*) AS count
            FROM songs
            WHERE album_id = ?
        `).get(song.album_id);

        if (remainingSongs.count === 0) {
            db.prepare(`
                DELETE FROM albums
                WHERE id = ?
            `).run(song.album_id);
        }
    }

    // 3. Check whether artist still has ANY songs
    const remainingArtistSongs = db.prepare(`
        SELECT COUNT(*) AS count
        FROM songs
        WHERE artist_id = ?
    `).get(song.artist_id);

    // 4. Check whether artist still has ANY albums
    const remainingArtistAlbums = db.prepare(`
        SELECT COUNT(*) AS count
        FROM albums
        WHERE artist_id = ?
    `).get(song.artist_id);

    // 5. Remove artist if completely unused
    if (
        remainingArtistSongs.count === 0 &&
        remainingArtistAlbums.count === 0
    ) {
        db.prepare(`
            DELETE FROM artists
            WHERE id = ?
        `).run(song.artist_id);
    }
}

function deleteAlbum(albumId) {

    const album = db.prepare(`
        SELECT artist_id
        FROM albums
        WHERE id = ?
    `).get(albumId);

    if (!album) return;

    // Delete all songs belonging to album
    db.prepare(`
        DELETE FROM songs
        WHERE album_id = ?
    `).run(albumId);

    // Delete album
    db.prepare(`
        DELETE FROM albums
        WHERE id = ?
    `).run(albumId);

    // Check if artist still has songs
    const remainingSongs = db.prepare(`
        SELECT COUNT(*) AS count
        FROM songs
        WHERE artist_id = ?
    `).get(album.artist_id);

    // Check if artist still has albums
    const remainingAlbums = db.prepare(`
        SELECT COUNT(*) AS count
        FROM albums
        WHERE artist_id = ?
    `).get(album.artist_id);

    // Artist is no longer needed
    if (
        remainingSongs.count === 0 &&
        remainingAlbums.count === 0
    ) {
        db.prepare(`
            DELETE FROM artists
            WHERE id = ?
        `).run(album.artist_id);
    }
  }


module.exports = {
  db,
  getLibrary,
  getAlbums,
  getArtists,
  getArtist,
  getSongs,
  getGenres,
  getPlaylists,
  getSong,

  addArtist, 
  addGenre,
  addAlbum,
  addSong,
  addFolder,
  updateAlbumArtwork,
  updateArtistArtwork,
  getArtistsWithoutArtwork,
  setSongFavorite,
  removeSongFromPlaylist,
  deleteAlbum,
  deleteSong
};