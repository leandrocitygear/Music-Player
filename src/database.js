const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");

const dbPath = path.join(app.getPath("userData"), "discout.db");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

console.log("SQLite database:", dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    sort_name TEXT,
    artwork_path TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,
    sort_title TEXT,

    artist_id INTEGER,
    genre_id INTEGER,

    album_artist TEXT,

    artwork_path TEXT,

    release_date TEXT,
    release_year INTEGER,

    total_tracks INTEGER,
    disc_count INTEGER,

    record_label TEXT,
    copyright TEXT,

    musicbrainz_id TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (artist_id)
      REFERENCES artists(id)
      ON DELETE SET NULL,

    FOREIGN KEY (genre_id)
      REFERENCES genres(id)
      ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    title TEXT NOT NULL,
    sort_title TEXT,

    artist_id INTEGER,
    album_id INTEGER,

    album_artist TEXT,

    file_path TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_size INTEGER,

    track_number INTEGER,
    track_total INTEGER,

    disc_number INTEGER,
    disc_total INTEGER,

    duration REAL,

    bitrate INTEGER,
    sample_rate INTEGER,
    bits_per_sample INTEGER,
    channels INTEGER,

    lossless INTEGER,

    codec TEXT,
    container TEXT,

    release_date TEXT,
    release_year INTEGER,

    composer TEXT,
    comment TEXT,
    copyright TEXT,
    publisher TEXT,

    musicbrainz_id TEXT,
    isrc TEXT,

    is_favorite INTEGER NOT NULL DEFAULT 0,
    rating INTEGER NOT NULL DEFAULT 0,

    folder_id INTEGER,

    date_added TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (artist_id)
      REFERENCES artists(id)
      ON DELETE SET NULL,

    FOREIGN KEY (album_id)
      REFERENCES albums(id)
      ON DELETE SET NULL,

    FOREIGN KEY (folder_id)
      REFERENCES folders(id)
      ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL UNIQUE,
    description TEXT,

    artwork_path TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,

    position INTEGER NOT NULL,

    added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (playlist_id, position),


  UNIQUE (playlist_id, song_id),

    FOREIGN KEY (playlist_id)
      REFERENCES playlists(id)
      ON DELETE CASCADE,

    FOREIGN KEY (song_id)
      REFERENCES songs(id)
      ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS play_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    song_id INTEGER NOT NULL,

    played_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    duration_played REAL,

    FOREIGN KEY (song_id)
      REFERENCES songs(id)
      ON DELETE CASCADE
  );
`);

// =====================================
// CREATE DEFAULT PLAYLISTS
// =====================================

db.prepare(`
  INSERT OR IGNORE INTO playlists
  (name, description)
  VALUES (?, ?)
`).run(
  "Favorites",
  "Your favorite songs"
);

console.log("Disc-Out database initialized.");

module.exports = db;