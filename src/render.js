





console.log("🔥 DISCOUT RENDERER LOADED");
document.addEventListener("DOMContentLoaded", async () => {
  
  const library = {
    albums: [],
    artists: [],
    songs: [],
    genres: [],
    playlists: []
  };
  
  let activeTab = 'albums';
  let selectedArtistId = null;
let selectedGenreId = null;
let selectedPlaylistId = null;

const audio = document.getElementById('myAudio');
  let currentSong = null;
  let currentSongIndex = -1;
  
  let isShuffle = false;
  let repeatMode = "off"; // off, all, one
  const progressBar = document.getElementById("myBar");

  const progress = document.getElementById("myProgress");

  const progressHandle =
  document.getElementById("progressHandle");

  const songTitle = document.querySelector(".player .title");
  
  
  
  let currentAudioUrl = null;

  let queueSongs = [];
let queueIndex = -1;
let searchQuery = "";

  
  async function loadLibrary() {
    
    try {
      
      const data =
      await window.electronAPI.getLibrary();

    library.albums = data.albums;
    library.artists = data.artists;
    library.songs = data.songs;
    library.genres = data.genres;
    library.playlists = data.playlists;

    console.log("Library loaded:", library);
      
      console.log("Albums:", library.albums);
      console.log("Artists:", library.artists);
      console.log("Songs:", library.songs);
      console.log("Genres:", library.genres);
      console.log("Playlists:", library.playlists);
      
      renderCurrentView();
    
      
    } catch (error) {
      console.error(
        "Failed to load library:",
        error
      );
    }
  }
  
  
  const addFiles = document.getElementById('settings');
  
  addFiles.onclick = () => {
    showAddMenu();
  };
  
  function showAddMenu() {
    
    // Don't create duplicates
    if (document.getElementById('addMenu')) {
      return;
    }
    
    const menu = document.createElement('div');
    
    menu.id = 'addMenu';
    
    menu.innerHTML = `
    <div class="addMenuTitle">
    Add to Library
    </div>
    
    <button id="addMusicFiles">
    <img src="./icons/audio_file.png" alt="">
    Add Music Files
    </button>
    
    <button id="addMusicFolder">
    <img src="./icons/folder.png" alt="">
    Add Music Folder
    </button>
    `;
    
    document.body.appendChild(menu);
    
    
    // Add individual files
    document
    .getElementById('addMusicFiles')
    .addEventListener('click', async () => {
      
      menu.remove();
      
      const files =
      await window.electronAPI.selectMusicFiles();
      
      console.log('Selected files:', files);
      
      for (const file of files) {
        
        const result =
        await window.electronAPI.importSong(file);
        
        console.log('Imported:', result);
      }
      await loadLibrary();
      
    });
    
    
    // Add folder
    document
    .getElementById('addMusicFolder')
    .addEventListener('click', async () => {
      
          menu.remove();
          
          const folder =
          await window.electronAPI.selectMusicFolder();
          
          if (!folder) {
            return;
          }
          
          console.log('Selected folder:', folder);
          
          const result =
          await window.electronAPI.importFolder(folder);
          
          console.log('Folder imported:', result);
          
          await loadLibrary();
          
        });
        
        
        // Close menu when clicking outside
        setTimeout(() => {
          
          document.addEventListener(
            'click',
            closeAddMenu,
            { once: true }
          );
          
        }, 0);
        
        
        function closeAddMenu(event) {
          
          if (!menu.contains(event.target) &&
          event.target !== addFiles) {
            
            menu.remove();
          }
          
        }
        
      }
      
      const musicMenu = document.getElementById('menu');
      const navigation = document.getElementById('navigation');
      
      musicMenu.addEventListener('click', (event) => {
        
        event.stopPropagation();

        if (navigation.style.display === "block") {
          navigation.style.display = 'none';
        } else {
          navigation.style.display = 'block';
        }
      });

     document.addEventListener('click', (event) => {

  // Click was inside the menu or navigation
  if (
    musicMenu.contains(event.target) ||
    navigation.contains(event.target)
  ) {
    return;
  }

  navigation.style.display = "none";

});

      
      const nowPlaying = document.querySelector('.albumArt');
const queue = document.getElementById('queue');
      
      nowPlaying.addEventListener('click', (event) => {

        event.stopPropagation();

        if (queue.style.display === 'block') {
          queue.style.display = 'none';
        } else {
          queue.style.display = 'block';
        }
      });

      queue.addEventListener('click', (event) => {
        event.stopPropagation();
      })

      document.addEventListener('click', () => {
        queue.style.display = 'none';
      })
      
      
      
      
      
      
      
      
      
      
      
      function renderCurrentView() {
  switch (activeTab) {
    case "albums":
      renderAlbums();
      break;
    case "songs":
      renderSongs();
      break;
    case "artists":
      renderArtists();
      break;
    case "genres":
      renderGenres();
      break;
    case "playlist":
      renderPlaylists();
      break;
  }

  updateActiveSong();
};


function renderArtistMusic() {

  if (!selectedArtistId) {
    return `
      <div class="emptyMusicMessage">
        Select an artist
      </div>
    `;
  }

  const artistSongs = library.songs.filter(
    song => song.artist_id === selectedArtistId
  );

  if (artistSongs.length === 0) {
    return `
      <div class="emptyMusicMessage">
        No songs found
      </div>
    `;
  }

  // Group songs by album
  const albums = [];

  artistSongs.forEach(song => {

    let album = albums.find(
      album => album.id === song.album_id
    );

    if (!album) {

      album = {
        id: song.album_id,
        title: song.album,
        artwork_path: song.artwork_path,
        release_year: song.release_year,
        songs: []
      };

      albums.push(album);
    }

    album.songs.push(song);
  });

  return albums.map(album => `

    <div class="artistAlbumBox">

      <img 
        class="artistAlbumImg"
        src="${album.artwork_path || './icons/album.png'}"
      />

      <div class="artistAlbumInfo">
        <p>${album.title || 'Unknown Album'}</p>
        <p>${album.release_year || ''}</p>
      </div>

      ${album.songs.map((song, index) => `

        <div 
          class="songContainer"
          data-song-id="${song.id}"
        >

          <div id="leftSpan">

            <img 
              class="songStatusIcon"
              src="./icons/play.png" 
              alt=""
            >

            <p>${index + 1}</p>

            <p title="${song.title}">${song.title}</p>

          </div>

          <img class="songIsFavorite"
            src="${
    isSongFavorite(song)
      ? "./icons/likefull.png"
      : "./icons/favorite.png"
  }"
            alt=""
          >

        </div>

      `).join("")}

    </div>

  `).join("");
}


function renderSelectedAlbum(albumId) {

  const album = library.albums.find(
    album => album.id === albumId
  );

  if (!album) {
    return;
  }

  document
    .querySelectorAll('.musicbox')
    .forEach(box => {
      box.classList.remove('active');
    });

  const selectedAlbum =
    document.querySelector(
      `.musicbox[data-album-id="${albumId}"]`
    );

  if (selectedAlbum) {
    selectedAlbum.classList.add('active');
  }

  const songs = library.songs.filter(
    song => song.album_id === albumId
  );

  document.getElementById('selectedAlbumArt').src =
    album.artwork_path || './icons/album.png';

  document.getElementById('selectedAlbumName').textContent =
    album.title || 'Unknown Album';

  document.getElementById('SelectedArtistsName').textContent =
    album.artist || 'Unknown Artist';

  const albumInfo = document.getElementById('selectedAlbumInfo');

  albumInfo.querySelectorAll('.dynamicAlbumInfo').forEach(
    element => element.remove()
  );

  const year = document.createElement('p');

  year.className = 'dynamicAlbumInfo';

  year.textContent =
    album.release_year || '';

  albumInfo.appendChild(year);


  const genre = document.createElement('p');

  genre.className = 'dynamicAlbumInfo';

  genre.textContent =
    album.genre || '';

  albumInfo.appendChild(genre);


  const songList =
    document.getElementById('songListContainer');

  songList.innerHTML = songs.map((song, index) => `

    <div
      class="songContainer"
      data-song-id="${song.id}"
    >

      <div id="leftSpan">

        <img
          class="songStatusIcon"
          src="./icons/play.png"
          alt=""
        >

        <p>${song.track_number || index + 1}</p>

        <p title="${song.title}">${song.title}</p>

      </div>

      <img
       class="songIsFavorite"
        src="${
    isSongFavorite(song)
      ? "./icons/likefull.png"
      : "./icons/favorite.png"
  }"
        alt=""
      >

    </div>

  `).join('');
}

function renderGenreMusic() {

  if (!selectedGenreId) {
    return `
      <div class="emptyMusicMessage">
        Select a genre
      </div>
    `;
  }

 const genreAlbums = library.albums.filter(
  album =>
    Number(album.genre_id) ===
    Number(selectedGenreId)
);

const genreAlbumIds =
  genreAlbums.map(album => album.id);

const genreSongs =
  library.songs.filter(
    song =>
      genreAlbumIds.includes(song.album_id)
  );

  if (genreSongs.length === 0) {
    return `
      <div class="emptyMusicMessage">
        No songs found
      </div>
    `;
  }

  // Group songs by album
  const albums = [];

  genreSongs.forEach(song => {

    let album = albums.find(
      album => album.id === song.album_id
    );

    if (!album) {

      album = {
        id: song.album_id,
        title: song.album,
        artwork_path: song.artwork_path,
        release_year: song.release_year,
        songs: []
      };

      albums.push(album);
    }

    album.songs.push(song);
  });


  // Sort songs inside each album
  albums.forEach(album => {

    album.songs.sort(
      (a, b) =>
        (a.track_number || 0) -
        (b.track_number || 0)
    );

  });


  return albums.map(album => `

    <div class="artistAlbumBox">

      <img
        class="artistAlbumImg"
        src="${album.artwork_path || './icons/album.png'}"
      >

      <div class="artistAlbumInfo">

        <p>
          ${album.title || 'Unknown Album'}
        </p>

        <p>
          ${album.release_year || ''}
        </p>

      </div>


      ${album.songs.map((song, index) => `

        <div
          class="songContainer"
          data-song-id="${song.id}"
        >

          <div id="leftSpan">

            <img
              class="songStatusIcon"
              src="./icons/play.png"
              alt=""
            >

            <p>
              ${song.track_number || index + 1}
            </p>

            <p title="${song.title}">
              ${song.title}
            </p>

          </div>

          <img
            class="songIsFavorite"
            src="${
    isSongFavorite(song)
      ? "./icons/likefull.png"
      : "./icons/favorite.png"
  }"
            alt=""
          >

        </div>

      `).join("")}

    </div>

  `).join("");
}

function renderPlaylistMusic() {

  if (!selectedPlaylistId) {
    return `
      <div class="emptyMusicMessage">
        Select a playlist
      </div>
    `;
  }

  const playlist = library.playlists.find(
    playlist =>
      Number(playlist.id) ===
      Number(selectedPlaylistId)
  );

  if (!playlist) {
    return `
      <div class="emptyMusicMessage">
        Playlist not found
      </div>
    `;
  }

  const songs = playlist.song_ids
    .map(songId =>
      library.songs.find(
        song =>
          Number(song.id) ===
          Number(songId)
      )
    )
    .filter(Boolean);

  if (songs.length === 0) {
    return `
      <div class="emptyMusicMessage">
        No songs in this playlist
      </div>
    `;
  }

  return `
    <div class="playlistSongs">

      <div class="playlistHeader">

        <div class="playlistArtwork">
          <img
            src="${
              playlist.artwork_path ||
              "./icons/playlist.png"
            }"
          >
        </div>

        <div class="playlistInfo">
          <p class="playlistTitle">
            ${playlist.name}
          </p>

          <p class="playlistSongCount">
            ${songs.length} songs
          </p>
        </div>

      </div>

      ${songs.map((song, index) => `

        <div
          class="songContainer"
          data-song-id="${song.id}"
        >

          <div id="leftSpan">

            <img
              class="songStatusIcon"
              src="./icons/play.png"
              alt=""
            >

            <p>
              ${index + 1}
            </p>

            <p title="${song.title}">
              ${song.title}
            </p>

          </div>

          <img
            class="songIsFavorite"
            src="${
  isSongFavorite(song)
    ? "./icons/likefull.png"
    : "./icons/favorite.png"
}"
            alt=""
          >

        </div>

      `).join("")}

    </div>
  `;
}

function normalizeSearchText(value) {

  return String(value || "")
    .toLowerCase()
    .trim();

}


function matchesSearch(value, query) {

  return normalizeSearchText(value)
    .includes(query);

}


function getSongGenre(song) {

  const album = library.albums.find(
    album =>
      Number(album.id) === Number(song.album_id)
  );

  if (!album) return "";

  const genre = library.genres.find(
    genre =>
      Number(genre.id) === Number(album.genre_id)
  );

  return genre?.name || "";

}


function songMatchesSearch(song, query) {

  if (!query) return true;

  const searchableText = [

    song.title,

    song.artist,

    song.album,

    getSongGenre(song)

  ]
    .map(normalizeSearchText)
    .join(" ");

  return searchableText.includes(query);

}


function renderAlbums() {

  const results =
    document.getElementById("results");

  let albums = library.albums;

  if (searchQuery) {

    albums = albums.filter(album => {

      const albumSongs =
        library.songs.filter(
          song =>
            Number(song.album_id) ===
            Number(album.id)
        );

      const albumGenre =
        library.genres.find(
          genre =>
            Number(genre.id) ===
            Number(album.genre_id)
        );

      const albumText = [

        album.title,

        album.artist,

        albumGenre?.name

      ]
        .map(normalizeSearchText)
        .join(" ");

      return (
        albumText.includes(searchQuery) ||
        albumSongs.some(song =>
          songMatchesSearch(song, searchQuery)
        )
      );

    });

  }

  if (albums.length === 0) {

    results.innerHTML = `
      <div class="emptyMusicMessage">
        No albums found
      </div>
    `;

    return;
  }

  results.innerHTML = `
    <div id="albumWindow">

      ${albums.map(album => `

        <div
          class="musicbox"
          data-album-id="${album.id}"
        >

          <img
            class="art"
            src="${album.artwork_path || "./b.jpg"}"
          />

          <p class="alb">
            ${album.title || "Unknown Album"}
          </p>

          <p class="artistsName">
            ${album.artist || "Unknown Artist"}
          </p>

        </div>

      `).join("")}

    </div>
  `;

}

function renderArtists() {

  const results =
    document.getElementById("results");

  let artists = library.artists;

  if (searchQuery) {

    artists = artists.filter(artist => {

      if (
        matchesSearch(
          artist.name,
          searchQuery
        )
      ) {
        return true;
      }

      return library.songs.some(song =>
        Number(song.artist_id) ===
          Number(artist.id) &&
        songMatchesSearch(song, searchQuery)
      );

    });

  }

  if (artists.length === 0) {

    results.innerHTML = `
      <div class="emptyMusicMessage">
        No artists found
      </div>
    `;

    return;
  }

  results.innerHTML = `

    <div id="artistWindow">

      <div id="artistList">

        ${artists.map(artist => `

          <div
            class="artistBox ${
              Number(artist.id) ===
              Number(selectedArtistId)
                ? "active"
                : ""
            }"
            data-artist-id="${artist.id}"
          >

            <img
              class="artistImg"
              src="${artist.artwork_path || "./b.jpg"}"
            />

            <p class="artistName">
              ${artist.name}
            </p>

          </div>

        `).join("")}

      </div>

      <div id="artistMusicResults">

        ${renderArtistMusic()}

      </div>

    </div>

  `;

}

function renderSongs() {

  const results =
    document.getElementById("results");

  let songs = library.songs;

  if (searchQuery) {

    songs = songs.filter(song =>
      songMatchesSearch(
        song,
        searchQuery
      )
    );

  }

  if (songs.length === 0) {

    results.innerHTML = `
      <div class="emptyMusicMessage">
        No songs found
      </div>
    `;

    return;
  }

  results.innerHTML = `

    <div id="songWindow">

      <div class="songHeader">

        <div class="coverColumn"></div>

        <div class="titleColumn">
          TITLE
        </div>

        <div class="artistColumn">
          ARTIST
        </div>

        <div class="albumColumn">
          ALBUM
        </div>

      </div>

      <div class="songBody">

        ${songs.map(song => `

          <div
            class="songRow"
            data-song-id="${song.id}"
          >

            <div class="coverColumn">

              <img
                class="songImg"
                src="${song.artwork_path || "./b.jpg"}"
              />

            </div>

            <div class="titleColumn">
              ${song.title || "Unknown Title"}
            </div>

            <div class="artistColumn">
              ${song.artist || "Unknown Artist"}
            </div>

            <div class="albumColumn">
              ${song.album || "Unknown Album"}
            </div>

          </div>

        `).join("")}

      </div>

    </div>

  `;

  updateActiveSong();

}

function renderGenres() {

  const results =
    document.getElementById("results");

  let genres = library.genres;

  if (searchQuery) {

    genres = genres.filter(genre => {

      if (
        matchesSearch(
          genre.name,
          searchQuery
        )
      ) {
        return true;
      }

      return library.albums.some(album =>

        Number(album.genre_id) ===
          Number(genre.id) &&

        (
          matchesSearch(
            album.title,
            searchQuery
          ) ||

          matchesSearch(
            album.artist,
            searchQuery
          )
        )

      );

    });

  }

  if (genres.length === 0) {

    results.innerHTML = `
      <div class="emptyMusicMessage">
        No genres found
      </div>
    `;

    return;
  }

  results.innerHTML = `

    <div id="genreWindow">

      <div id="genreList">

        ${genres.map(genre => `

          <div
            class="genreBox ${
              Number(genre.id) ===
              Number(selectedGenreId)
                ? "active"
                : ""
            }"
            data-genre-id="${genre.id}"
          >

            <p class="genreName">
              ${genre.name}
            </p>

          </div>

        `).join("")}

      </div>

      <div id="genreMusicResults">

        ${renderGenreMusic()}

      </div>

    </div>

  `;

  updateActiveSong();

}

function renderPlaylists() {

  const results =
    document.getElementById("results");

  let playlists = library.playlists;

  if (searchQuery) {

    playlists = playlists.filter(playlist => {

      if (
        matchesSearch(
          playlist.name,
          searchQuery
        )
      ) {
        return true;
      }

      const songs =
        playlist.song_ids
          .map(songId =>
            library.songs.find(
              song =>
                Number(song.id) ===
                Number(songId)
            )
          )
          .filter(Boolean);

      return songs.some(song =>
        songMatchesSearch(
          song,
          searchQuery
        )
      );

    });

  }

  // =========================
  // NO PLAYLISTS
  // =========================

  if (playlists.length === 0) {

    results.innerHTML = `

      <div id="playlistWindow">

        <div id="playlistList">

          <div id="addNewPlaylistBtn">

            <button
              class="contextItem"
              data-action="create-playlist"
              id="createPlaylistBtn"
            >

              <span>＋</span>

              <span>
                Create New Playlist
              </span>

            </button>

          </div>

        </div>

        <div id="playlistMusicResults">

          <div class="emptyMusicMessage">
            No playlists found
          </div>

        </div>

      </div>

    `;

    return;
  }

  // =========================
  // PLAYLISTS
  // =========================

  results.innerHTML = `

    <div id="playlistWindow">

      <div id="playlistList">

        <div id="addNewPlaylistBtn">

          <button
            class="contextItem"
            data-action="create-playlist"
            id="createPlaylistBtn"
          >

            <span>＋</span>

            <span>
              Create New Playlist
            </span>

          </button>

        </div>

        ${playlists.map(playlist => `

          <div
            class="playlistBox ${
              Number(playlist.id) ===
              Number(selectedPlaylistId)
                ? "active"
                : ""
            }"
            data-playlist-id="${playlist.id}"
          >

            <p class="playlistName">
              ${playlist.name}
            </p>

          </div>

        `).join("")}

      </div>

      <div id="playlistMusicResults">

        ${renderPlaylistMusic()}

      </div>

    </div>

  `;

  updateActiveSong();

}

let draggedQueueIndex = null;
let originalQueueOrder = [];

function setupQueueDragAndDrop() {

  const queueItems =
    document.querySelectorAll(".queueSong");

  queueItems.forEach(item => {

    item.addEventListener("dragstart", event => {

      draggedQueueIndex =
        Number(item.dataset.queueIndex);

      item.classList.add("dragging");

      event.dataTransfer.effectAllowed = "move";

    });


    item.addEventListener("dragend", () => {

      item.classList.remove("dragging");

      draggedQueueIndex = null;

      document
        .querySelectorAll(".queueSong")
        .forEach(song => {
          song.classList.remove("drag-over");
        });

    });


    item.addEventListener("dragover", event => {

      event.preventDefault();

      if (draggedQueueIndex === null) {
        return;
      }

      const targetIndex =
        Number(item.dataset.queueIndex);

      if (targetIndex === draggedQueueIndex) {
        return;
      }

      document
        .querySelectorAll(".queueSong")
        .forEach(song => {
          song.classList.remove("drag-over");
        });

      item.classList.add("drag-over");

    });


    item.addEventListener("drop", event => {

      event.preventDefault();

      const targetIndex =
        Number(item.dataset.queueIndex);

      if (draggedQueueIndex === null) {
        return;
      }

      if (draggedQueueIndex === targetIndex) {
        return;
      }

      reorderQueue(
        draggedQueueIndex,
        targetIndex
      );

    });

  });

}


function renderQueue() {

  const queueList = document.getElementById("queueList");

  if (!queueList) return;

  if (queueSongs.length === 0) {
    queueList.innerHTML = `
      <div class="emptyQueue">
        <p>Your queue is empty</p>
      </div>
    `;
    return;
  }

  if (currentSong) {
    const currentIndex = queueSongs.findIndex(
      song => String(song.id) === String(currentSong.id)
    );
    queueIndex = currentIndex;
  } else {
    queueIndex = -1;
  }

  const renderSongRow = (song, index, isActive) => `
    <div
      class="queueSong ${isActive ? "active" : ""}"
      data-queue-index="${index}"
      data-song-id="${song.id}"
      draggable="${isActive ? "false" : "true"}"
    >
      <img class="queueArt" src="${song.artwork_path || "./icons/album.png"}" alt="">
      <div class="queueSongInfo">
        <p class="queueSongTitle">${song.title || "Unknown Title"}</p>
        <p class="queueAlb">${song.album || "Unknown Album"}</p>
        <p class="queueArtistsName">${song.artist || "Unknown Artist"}</p>
      </div>
      <div class="queueSongDuration">${formatTime(song.duration)}</div>
    </div>
  `;

  let html = "";

  if (currentSong && queueIndex !== -1) {
    html += `
      <div class="queueSectionLabel">Now Playing</div>
      ${renderSongRow(currentSong, queueIndex, true)}
    `;
  }

  // Only songs AFTER the current index — already-played songs stay hidden
  const upNext = queueSongs
    .map((song, index) => ({ song, index }))
    .filter(({ index }) => index > queueIndex);

  if (upNext.length > 0) {
    html += `<div class="queueSectionLabel">Next Up</div>`;
    html += upNext
      .map(({ song, index }) => renderSongRow(song, index, false))
      .join("");
  }

  queueList.innerHTML = html;

  setupQueueDragAndDrop();

  scrollToCurrentQueueSong();
}

function reorderQueue(fromIndex, toIndex) {

  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= queueSongs.length ||
    toIndex >= queueSongs.length
  ) {
    return;
  }

  const currentSongId =
    currentSong
      ? currentSong.id
      : null;


  const [movedSong] =
    queueSongs.splice(fromIndex, 1);


  // Account for the index shifting
  // when an item is moved downward.
  let newIndex = toIndex;

  if (fromIndex < toIndex) {
    newIndex--;
  }


  queueSongs.splice(
    newIndex,
    0,
    movedSong
  );


  // Find the current song again.
  // This prevents queueIndex from becoming wrong.
  if (currentSongId !== null) {

    queueIndex =
      queueSongs.findIndex(
        song =>
          String(song.id) ===
          String(currentSongId)
      );

  }


  renderQueue();

}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQueue() {

  originalQueueOrder = [...queueSongs];

  if (!currentSong) {
    queueSongs = shuffleArray(queueSongs);
    renderQueue();
    return;
  }

  const currentIndex = queueSongs.findIndex(
    song => String(song.id) === String(currentSong.id)
  );

  // Keep played history + current song exactly where they are,
  // only shuffle what's still upcoming
  const played = queueSongs.slice(0, currentIndex);
  const current = queueSongs[currentIndex];
  const upcoming = queueSongs.slice(currentIndex + 1);

  const shuffledUpcoming = shuffleArray(upcoming);

  queueSongs = [...played, current, ...shuffledUpcoming];
  queueIndex = currentIndex;

  renderQueue();
}

function unshuffleQueue() {

  if (originalQueueOrder.length === 0) return;

  const currentIndex = originalQueueOrder.findIndex(
    song => currentSong && String(song.id) === String(currentSong.id)
  );

  queueSongs = [...originalQueueOrder];
  queueIndex = currentIndex;

  originalQueueOrder = [];

  renderQueue();
}

document
  .getElementById("queueList")
  .addEventListener("click", async (event) => {

    event.stopPropagation();

    const queueSong =
      event.target.closest(".queueSong");

    if (!queueSong) return;

    const index =
      Number(queueSong.dataset.queueIndex);

    if (
      index < 0 ||
      index >= queueSongs.length
    ) {
      return;
    }

    queueIndex = index;

    const song = queueSongs[queueIndex];

    console.log(
      "Playing queue song:",
      song.title
    );

    await playSong(song);

    renderQueue();
  });
  
function addToQueue(song) {

  if (!song) return;


  // Current song doesn't need to be
  // added to the queue.
  if (
    currentSong &&
    String(song.id) ===
    String(currentSong.id)
  ) {
    return;
  }


  // Don't add duplicates.
  if (
    queueSongs.some(
      s =>
        String(s.id) ===
        String(song.id)
    )
  ) {
    return;
  }


  queueSongs.push(song);

  renderQueue();

  console.log(
    "Added to queue:",
    song.title
  );

}

function removeFromQueue(index) {

  if (
    index < 0 ||
    index >= queueSongs.length
  ) {
    return;
  }


  const removedSong =
    queueSongs[index];


  // Never allow the currently playing
  // song to be removed this way.
  if (
    currentSong &&
    String(removedSong.id) ===
    String(currentSong.id)
  ) {

    console.log(
      "Cannot remove the currently playing song."
    );

    return;

  }


  queueSongs.splice(
    index,
    1
  );


  // Recalculate current position.
  if (currentSong) {

    queueIndex =
      queueSongs.findIndex(
        song =>
          String(song.id) ===
          String(currentSong.id)
      );

  }


  renderQueue();

  console.log(
    "Removed from queue:",
    removedSong.title
  );

}

function playQueue(songs, startIndex = 0) {

  if (!songs || songs.length === 0) {
    return;
  }

  queueSongs = [...songs];

  queueIndex = startIndex;

  renderQueue();

  playSong(queueSongs[queueIndex]);
}

function playNextInQueue(song) {

  if (!song) return;

  const insertIndex = queueIndex + 1;

  queueSongs.splice(insertIndex, 0, song);

  renderQueue();

  console.log(
    "Playing next:",
    song.title
  );
}

function clearQueue() {

  queueSongs = [];
  queueIndex = -1;

  renderQueue();
console.log("Queue cleared");
}

function scrollToCurrentQueueSong() {

  if (!currentSong) return;


  const currentQueueSong =
    document.querySelector(
      `.queueSong[data-song-id="${currentSong.id}"]`
    );


  if (!currentQueueSong) return;


  currentQueueSong.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

}

document
  .getElementById("clearQueue")
  .addEventListener("click", () => {

    clearQueue();

  });

function createWavBlob(channelData, sampleRate) {

  const channels = channelData.length;
  const samples = channelData[0].length;

  const buffer = new ArrayBuffer(
    44 + samples * channels * 2
  );

  const view = new DataView(buffer);


  function writeString(offset, string) {

    for (let i = 0; i < string.length; i++) {

      view.setUint8(
        offset + i,
        string.charCodeAt(i)
      );

    }

  }


  // RIFF
  writeString(0, "RIFF");

  view.setUint32(
    4,
    36 + samples * channels * 2,
    true
  );

  writeString(8, "WAVE");


  // fmt
  writeString(12, "fmt ");

  view.setUint32(16, 16, true);

  view.setUint16(20, 1, true);

  view.setUint16(
    22,
    channels,
    true
  );

  view.setUint32(
    24,
    sampleRate,
    true
  );

  view.setUint32(
    28,
    sampleRate * channels * 2,
    true
  );

  view.setUint16(
    32,
    channels * 2,
    true
  );

  view.setUint16(
    34,
    16,
    true
  );


  // data
  writeString(36, "data");

  view.setUint32(
    40,
    samples * channels * 2,
    true
  );


  let offset = 44;


  for (let i = 0; i < samples; i++) {

    for (let channel = 0; channel < channels; channel++) {

      let sample =
        channelData[channel][i];

      sample =
        Math.max(-1, Math.min(1, sample));


      const intSample =
        sample < 0
          ? sample * 0x8000
          : sample * 0x7FFF;


      view.setInt16(
        offset,
        intSample,
        true
      );

      offset += 2;

    }

  }


  return new Blob(
    [buffer],
    { type: "audio/wav" }
  );

}


function updateActiveSong() {

  // Remove active from every song
  document
    .querySelectorAll(".songContainer, .songRow")
    .forEach(song => {
      song.classList.remove("active");

      const icon =
        song.querySelector(".songStatusIcon");

      if (icon) {
        icon.src = "./icons/play.png";
      }

    });


  if (!currentSong) return;


  // Find every instance of this song
  document
    .querySelectorAll(
      `[data-song-id="${currentSong.id}"]`
    )
    .forEach(song => {

      song.classList.add("active");

      const icon =
        song.querySelector(".songStatusIcon");

      if (icon) {
        if (audio.paused) {
          icon.src = "./icons/play.png";
        } else {
          icon.src = "./icons/pause.png";
        }
      }

    });

}


async function playSong(song) {

 
  if (!song) return;

  currentSong = song;

  currentSongIndex =
    library.songs.findIndex(
      s => s.id === song.id
    );

  // Find song inside queue
const indexInQueue =
    queueSongs.findIndex(
      s =>
        String(s.id) ===
        String(song.id)
    );

  if (indexInQueue !== -1) {
    queueIndex = indexInQueue;
  }

  renderQueue();

  console.log(
    "Playing:",
    song.title
  );

  updateActiveSong();
  

  // =========================
  // PLAYER INFO
  // =========================

  document.querySelector(".songName").textContent =
    song.title || "";

    document.querySelector(".player .title").textContent =
  song.title || "";

  document.querySelector(".artName").textContent =
    song.artist || "";

  document.querySelector(".albumName").textContent =
    song.album || "";

  document.querySelector(".albumArt").src =
    song.artwork_path || "./icons/album.png";

  document.querySelector('.likeButton .songIsFavorite').src =
    isSongFavorite(song)
      ? "./icons/likefull.png"
      : "./icons/favorite.png"
  



  // =========================
  // BACKGROUND
  // =========================

  const artworkPath =
    song.artwork_path || "./icons/album.png";

  if (
    artworkPath.startsWith("C:\\") ||
    artworkPath.includes(":\\")
  ) {

    document.getElementById("background").style.backgroundImage =
      `url("file:///${artworkPath.replace(/\\/g, "/")}")`;

  } else {

    document.getElementById("background").style.backgroundImage =
      `url("${artworkPath}")`;

  }


  // =========================
  // ALAC
  // =========================

  if (song.codec === "ALAC") {

    console.log("Decoding ALAC...");

    try {

      const decoded =
        await window.electronAPI.decodeALAC(
          song.file_path
        );

      const wavBlob =
        createWavBlob(
          decoded.channelData,
          decoded.sampleRate
        );

      if (currentAudioUrl) {

        URL.revokeObjectURL(
          currentAudioUrl
        );

      }

      currentAudioUrl =
        URL.createObjectURL(
          wavBlob
        );

      audio.src =
        currentAudioUrl;

    } catch (error) {

      console.error(
        "ALAC playback failed:",
        error
      );

      return;
    }

  }

  // =========================
  // NORMAL AUDIO
  // =========================

  else {

    audio.src =
      song.file_path;

  }


  audio.load();


  try {

    await audio.play();

    updatePlayButton();
    updateActiveSong();

  } catch (error) {

    console.error(
      "Playback failed:",
      error
    );

  }

}


const playButton =
  document.getElementById("play");


playButton.addEventListener("click", async () => {

  if (!currentSong) return;


  if (audio.paused) {

    await audio.play();

  } else {

    audio.pause();

  }


  updatePlayButton();

});

function updatePlayButton() {

  const img =
    document.querySelector("#play img");

  if (!img) return;


  if (audio.paused) {

    img.src =
      "./icons/play.png";

  } else {

    img.src =
      "./icons/pause.png";

  }

}

function playLibraryPreviousSong() {

  if (!library.songs.length) return;

  let index;

  if (isShuffle) {

    index = Math.floor(
      Math.random() * library.songs.length
    );

  } else {

    index = currentSongIndex - 1;

    if (index < 0) {

      if (repeatMode === "all") {

        index =
          library.songs.length - 1;

      } else {

        index = 0;
      }
    }
  }

  playSong(library.songs[index]);
}

document
  .getElementById("skip_previous")
  .addEventListener("click", () => {

    playPreviousSong();

  });

function playPreviousSong() {
  if (!currentSong) return;

  if (queueSongs.length === 0) {
    playLibraryPreviousSong();
    return;
  }

  let previousIndex = queueIndex - 1;   // no more isShuffle branch

  if (previousIndex < 0) {
    if (repeatMode === "all") {
      previousIndex = queueSongs.length - 1;
    } else {
      previousIndex = 0;
    }
  }

  queueIndex = previousIndex;
  playSong(queueSongs[queueIndex]);
}

function playLibraryNextSong() {

  if (!library.songs.length) return;

  let index;

  if (isShuffle) {

    index = Math.floor(
      Math.random() * library.songs.length
    );

  } else {

    index = currentSongIndex + 1;

    if (index >= library.songs.length) {

      if (repeatMode === "all") {

        index = 0;

      } else {

        audio.pause();

        return;
      }
    }
  }

  playSong(library.songs[index]);
}

document
  .getElementById("skip_next")
  .addEventListener("click", () => {

    playNextSong();

  });

function playNextSong() {
  if (!currentSong) return;

  if (repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
    return;
  }

  if (queueSongs.length === 0) {
    playLibraryNextSong();
    return;
  }

  let nextIndex = queueIndex + 1;   // no more isShuffle branch

  if (nextIndex >= queueSongs.length) {
    if (repeatMode === "all") {
      nextIndex = 0;
    } else {
      audio.pause();
      queueIndex = queueSongs.length - 1;
      renderQueue();
      updateActiveSong();
      updatePlayButton();
      return;
    }
  }

  queueIndex = nextIndex;
  playSong(queueSongs[queueIndex]);
}


audio.addEventListener(
  "ended",
  () => {

    if (repeatMode === "one") {

      audio.currentTime = 0;

      audio.play();

      return;

    }


    playNextSong();

  }
);

audio.addEventListener("play", () => {

  updateActiveSong();
updatePlayButton();
});


audio.addEventListener("pause", () => {

  updateActiveSong();
updatePlayButton();
});


document
  .getElementById("shuffle")
  .addEventListener("click", () => {

    isShuffle =
      !isShuffle;


    document
      .getElementById("shuffle")
      .classList.toggle(
        "active",
        isShuffle
      );

       if (isShuffle) {
    shuffleQueue();
  } else {
    unshuffleQueue();
  }


    console.log(
      "Shuffle:",
      isShuffle
    );

  });

  document
  .getElementById("repeat")
  .addEventListener("click", () => {

    if (repeatMode === "off") {

      repeatMode = "all";

    } else if (repeatMode === "all") {

      repeatMode = "one";

    } else {

      repeatMode = "off";

    }

    const repeatButton =
      document.getElementById("repeat");

    const repeatIcon =
      repeatButton.querySelector("img");


    // Change icon
    if (repeatMode === "one") {

      repeatIcon.src = "./icons/repeat1.png";

    } else {

      repeatIcon.src = "./icons/repeat.png";

    }


    // Active when repeat is enabled
    repeatButton.classList.toggle(
      "active",
      repeatMode !== "off"
    );


    console.log(
      "Repeat:",
      repeatMode
    );




  });


  audio.addEventListener("timeupdate", () => {

  if (!audio.duration) return;

  const progress =
    (audio.currentTime / audio.duration) * 100;

  progressBar.style.width = `${progress}%`;

  //  progressHandle.style.left =
  //   `${progress}%`;

});

document
  .getElementById("myProgress")
  .addEventListener("click", (event) => {

    if (!audio.duration) return;

    const progress = event.currentTarget;

    const rect = progress.getBoundingClientRect();

    const clickPosition =
      event.clientX - rect.left;

    const percentage =
      clickPosition / rect.width;

    audio.currentTime =
      percentage * audio.duration;

  });


  const timer =
  document.querySelector(".timer");

const duration =
  document.querySelector(".duration");

function formatTime(seconds) {

  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  return `${String(minutes).padStart(1, "0")}:${String(secs).padStart(2, "0")}`;
}

audio.addEventListener("timeupdate", () => {

  timer.textContent =
    formatTime(audio.currentTime);

});

audio.addEventListener("loadedmetadata", () => {

  duration.textContent =
    formatTime(audio.duration);

});


progress.addEventListener("mousedown", (event) => {

  if (!audio.duration) return;

  const updateProgress = (event) => {

    const rect = progress.getBoundingClientRect();

    let percentage =
      (event.clientX - rect.left) / rect.width;

    percentage =
      Math.max(0, Math.min(1, percentage));

    audio.currentTime =
      percentage * audio.duration;

    progressBar.style.width =
      `${percentage * 100}%`;
  };

  updateProgress(event);

  const drag = (event) => {
    updateProgress(event);
  };

  const stopDrag = () => {

    document.removeEventListener(
      "mousemove",
      drag
    );

    document.removeEventListener(
      "mouseup",
      stopDrag
    );
  };

  document.addEventListener(
    "mousemove",
    drag
  );

  document.addEventListener(
    "mouseup",
    stopDrag
  );

});

function playArtistSong(song) {

  const artistSongs = library.songs
    .filter(s => s.artist_id === song.artist_id)
    .sort((a, b) => {

      if (a.album_id !== b.album_id) {
        return a.album_id - b.album_id;
      }

      return (a.track_number || 0) -
             (b.track_number || 0);
    });

  const clickedIndex = artistSongs.findIndex(
    s => s.id === song.id
  );

  queueSongs = [...artistSongs];

  queueIndex = clickedIndex;

  renderQueue();

  playSong(song);
}

function playAllSongs(song) {

  const allSongs = [...library.songs];

  const clickedIndex = allSongs.findIndex(
    s => s.id === song.id
  );

  queueSongs = [...allSongs];

  queueIndex = clickedIndex;

  renderQueue();

  playSong(song);
}

function playGenreSong(song, genreId) {

  // Get all albums that belong to this genre
  const genreAlbums = library.albums.filter(
    album => album.genre_id === genreId
  );

  const genreAlbumIds = genreAlbums.map(
    album => album.id
  );

  // Get every song from those albums
  const genreSongs = library.songs
    .filter(song =>
      genreAlbumIds.includes(song.album_id)
    )
    .sort((a, b) => {

      // Album order
      if (a.album_id !== b.album_id) {
        return a.album_id - b.album_id;
      }

      // Track order within album
      return (a.track_number || 0) -
             (b.track_number || 0);
    });

  // Find clicked song
  const clickedIndex = genreSongs.findIndex(
    s => s.id === song.id
  );

  if (clickedIndex === -1) {
    return;
  }

  // Start queue at clicked song
  queueSongs = [...genreSongs];

  queueIndex = clickedIndex;

  renderQueue();

  playSong(song);
}

function isSongFavorite(song) {
  return Number(song.is_favorite) === 1;
}

function updateFavoriteIcons() {

  document
    .querySelectorAll(".songIsFavorite")
    .forEach(icon => {

      const songElement =
        icon.closest(
          ".songContainer, .songRow"
        );

      if (!songElement) return;

      const songId =
        songElement.dataset.songId;

      const song =
        library.songs.find(
          song =>
            String(song.id) ===
            String(songId)
        );

      if (!song) return;

      icon.src = isSongFavorite(song)
        ? "./icons/likefull.png"
        : "./icons/favorite.png";
    });
}

async function toggleFavorite(song) {

 if (!song) return;

  const newFavoriteState = !isSongFavorite(song);

  try {
    await window.electronAPI.setSongFavorite(
      song.id,
      newFavoriteState
    );

    // Update renderer copy
    song.is_favorite = newFavoriteState ? 1 : 0;

    // Reload the library so Favorites playlist gets updated
    const data = await window.electronAPI.getLibrary();

    library.albums = data.albums;
    library.artists = data.artists;
    library.songs = data.songs;
    library.genres = data.genres;
    library.playlists = data.playlists;


    // Get the updated song from the new library
    const updatedSong =
      library.songs.find(
        s => String(s.id) === String(song.id)
      );

    if (updatedSong) {
      currentSong = updatedSong;
    }

    // Update the player favorite icon
    document.querySelector(
      '.likeButton .songIsFavorite'
    ).src =
      isSongFavorite(currentSong)
        ? "./icons/likefull.png"
        : "./icons/favorite.png";


    // Refresh the current view
    renderCurrentView();
    updateFavoriteIcons();

    console.log(
      newFavoriteState
        ? "Added to favorites:"
        : "Removed from favorites:",
      song.title
    );

  } catch (error) {
    console.error(
      "Failed to update favorite:",
      error
    );
  }
}

document
  .querySelector(".likeButton")
  .addEventListener("click", async (event) => {

    event.stopPropagation();

    if (!currentSong) return;

    await toggleFavorite(currentSong);
  });

  const volumeButton =
  document.getElementById("volume");

const volumeSlider =
  document.getElementById("volumeSlider");


// Hide slider initially
volumeSlider.style.display = "none";


// Show / hide slider
volumeButton.addEventListener("click", (event) => {

  event.stopPropagation();

  if (volumeSlider.style.display === "none") {

    volumeSlider.style.display = "block";

  } else {

    volumeSlider.style.display = "none";

  }

});


// Change audio volume
volumeSlider.addEventListener("input", () => {

  audio.volume =
    Number(volumeSlider.value);

});






// =====================================================
// CONTEXT MENU
// =====================================================

const contextMenu =
  document.getElementById("contextMenu");

let contextTarget = null;
let contextType = null;


// =====================================================
// HIDE CONTEXT MENU
// =====================================================

function hideContextMenu() {

  contextMenu.style.display = "none";

  contextTarget = null;
  contextType = null;
}


// =====================================================
// SHOW CONTEXT MENU
// =====================================================

function showContextMenu(event, type, target) {

  event.preventDefault();
  event.stopPropagation();

  contextTarget = target;
  contextType = type;

  // Hide every menu
  document
    .querySelectorAll(".contextSection")
    .forEach(section => {
      section.classList.remove("active");
    });


  // Show correct menu
  const section =
    document.querySelector(
      `.contextSection[data-menu="${type}"]`
    );

  if (!section) return;

  section.classList.add("active");


  // ===================================================
  // SONG FAVORITE TEXT
  // ===================================================

  if (type === "song") {

    const favoriteText =
      section.querySelector(".favoriteText");

    if (favoriteText) {

      favoriteText.textContent =
        isSongFavorite(target)
          ? "Remove from Favorites"
          : "Add to Favorites";
    }


    // Remove from playlist only when
    // currently viewing a playlist

    const removePlaylist =
      document.getElementById(
        "removeFromPlaylistItem"
      );

    if (removePlaylist) {

      removePlaylist.style.display =
        activeTab === "playlist"
          ? "flex"
          : "none";
    }
  }


  // ===================================================
  // ALBUM FAVORITE TEXT
  // ===================================================

  if (type === "album") {

    const albumSongs =
      library.songs.filter(
        song =>
          Number(song.album_id) ===
          Number(target.id)
      );

    const allFavorite =
      albumSongs.length > 0 &&
      albumSongs.every(
        song => isSongFavorite(song)
      );

    const favoriteText =
      section.querySelector(
        ".albumFavoriteText"
      );

    if (favoriteText) {

      favoriteText.textContent =
        allFavorite
          ? "Remove All from Favorites"
          : "Add All to Favorites";
    }
  }


  // ===================================================
  // POSITION MENU
  // ===================================================

  contextMenu.style.display = "block";


  let x = event.clientX;
  let y = event.clientY;


  const menuRect =
    contextMenu.getBoundingClientRect();


  // Prevent going outside right side
  if (
    x + menuRect.width >
    window.innerWidth
  ) {

    x =
      window.innerWidth -
      menuRect.width -
      10;
  }


  // Prevent going outside bottom
  if (
    y + menuRect.height >
    window.innerHeight
  ) {

    y =
      window.innerHeight -
      menuRect.height -
      10;
  }


  contextMenu.style.left =
    `${Math.max(5, x)}px`;

  contextMenu.style.top =
    `${Math.max(5, y)}px`;
}


// =====================================================
// RIGHT CLICK DETECTION
// =====================================================

document.addEventListener(
  "contextmenu",
  event => {

    // ==========================================
  // QUEUE SONG
  // ==========================================

  const queueSongElement =
    event.target.closest(".queueSong");

  if (queueSongElement) {

    const songId =
      queueSongElement.dataset.songId;

    const song =
      queueSongs.find(
        s => String(s.id) === String(songId)
      );

    if (!song) return;

    showContextMenu(event, "queue", song);

    return;
  }

    // ==========================================
    // SONG
    // ==========================================

    const songElement =
      event.target.closest(
        ".songContainer, .songRow"
      );

    if (songElement) {

      const songId =
        songElement.dataset.songId;

      const song =
        library.songs.find(
          s =>
            String(s.id) ===
            String(songId)
        );

      if (!song) return;

      showContextMenu(
        event,
        "song",
        song
      );

      return;
    }


    // ==========================================
    // ALBUM
    // ==========================================

    const albumElement =
      event.target.closest(
        ".musicbox"
      );

    if (albumElement) {

      const albumId =
        Number(
          albumElement.dataset.albumId
        );

      const album =
        library.albums.find(
          a =>
            Number(a.id) ===
            albumId
        );

      if (!album) return;

      showContextMenu(
        event,
        "album",
        album
      );

      return;
    }


    // ==========================================
    // ARTIST
    // ==========================================

    const artistElement =
      event.target.closest(
        ".artistBox"
      );

    if (artistElement) {

      const artistId =
        Number(
          artistElement.dataset.artistId
        );

      const artist =
        library.artists.find(
          a =>
            Number(a.id) ===
            artistId
        );

      if (!artist) return;

      showContextMenu(
        event,
        "artist",
        artist
      );

      return;
    }


    // ==========================================
    // PLAYLIST
    // ==========================================

    const playlistElement =
      event.target.closest(
        ".playlistBox"
      );

    if (playlistElement) {

      const playlistId =
        Number(
          playlistElement.dataset.playlistId
        );

      const playlist =
        library.playlists.find(
          p =>
            Number(p.id) ===
            playlistId
        );

      if (!playlist) return;

      showContextMenu(
        event,
        "playlist",
        playlist
      );

      return;
    }


    // Nothing recognized
    hideContextMenu();

  }
);

document.addEventListener(
  "click",
  event => {

    if (
      !contextMenu.contains(
        event.target
      )
    ) {

      hideContextMenu();
    }

  }
);


window.addEventListener(
  "blur",
  hideContextMenu
);


window.addEventListener(
  "resize",
  hideContextMenu
);

// =====================================================
// CONTEXT MENU ACTIONS
// =====================================================

contextMenu.addEventListener(
  "click",
  async event => {

    event.stopPropagation();

    const item =
      event.target.closest(
        ".contextItem"
      );

    if (!item) return;

    const action =
      item.dataset.action;

    const target =
      contextTarget;

    hideContextMenu();

    if (!target) return;


    // =================================================
    // SONG
    // =================================================

    if (action === "play") {

      await playSong(target);

      return;
    }


    if (action === "play-next") {

      playNextSongContext(target);

      return;
    }


    if (action === "add-queue") {

      addToQueue(target);

      return;
    }


    if (action === "favorite") {

      await toggleFavorite(target);

      return;
    }


    if (action === "go-album") {

      goToAlbum(target);

      return;
    }


    if (action === "go-artist") {

      goToArtist(target);

      return;
    }


    if (action === "add-playlist") {

      showAddToPlaylistMenu(target);

      return;
    }


    if (action === "remove-playlist") {

      await removeSongFromPlaylist(
        target,
        selectedPlaylistId
      );

      return;
    }


    if (action === "delete-song") {

      await deleteSong(target);

      return;
    }


    // =================================================
    // ALBUM
    // =================================================

    if (action === "play-album") {

      playAlbumContext(target);

      return;
    }


    if (action === "album-next") {

      playAlbumNext(target);

      return;
    }


    if (action === "album-queue") {

      addAlbumToQueue(target);

      return;
    }


    if (action === "album-favorite") {

      await toggleAlbumFavorites(target);

      return;
    }


    if (action === "album-artist") {

      goToAlbumArtist(target);

      return;
    }


    if (action === "delete-album") {

      await deleteAlbum(target);

      return;
    }


    // =================================================
    // ARTIST
    // =================================================

    if (action === "play-artist") {

      playArtistContext(target);

      return;
    }


    if (action === "artist-queue") {

      addArtistToQueue(target);

      return;
    }


    // =================================================
    // PLAYLIST
    // =================================================

    if (action === "play-playlist") {

      playPlaylistContext(target);

      return;
    }


    if (action === "playlist-next") {

      playPlaylistNext(target);

      return;
    }


    if (action === "playlist-queue") {

      addPlaylistToQueue(target);

      return;
    }


    if (action === "delete-playlist") {

      await deletePlaylist(target);

      return;
    }

    if (action === "create-playlist") {

  openCreatePlaylistModal();

}

    // =================================================
    // QUEUE
    // =================================================

    if (action === "remove-queue") {

      const index =
        queueSongs.findIndex(
          s => String(s.id) === String(target.id)
        );

      removeFromQueue(index);

      return;
    }

  }
);

function playNextSongContext(song) {

  if (!song) return;


  // If nothing is currently playing,
  // just start the song.
  if (!currentSong) {

    playSong(song);

    return;

  }


  // Don't add the current song.
  if (
    String(song.id) ===
    String(currentSong.id)
  ) {
    return;
  }


  // Don't duplicate a song already in queue.
  const existingIndex =
    queueSongs.findIndex(
      s =>
        String(s.id) ===
        String(song.id)
    );

  if (existingIndex !== -1) {

    queueSongs.splice(
      existingIndex,
      1
    );

  }


  // Find the current song's REAL position.
  const currentIndex =
    queueSongs.findIndex(
      s =>
        String(s.id) ===
        String(currentSong.id)
    );


  const insertIndex =
    currentIndex === -1
      ? 0
      : currentIndex + 1;


  queueSongs.splice(
    insertIndex,
    0,
    song
  );


  queueIndex =
    currentIndex;


  renderQueue();

  console.log(
    "Playing next:",
    song.title
  );

}

function getAlbumSongs(album) {

  return library.songs
    .filter(
      song =>
        Number(song.album_id) ===
        Number(album.id)
    )
    .sort(
      (a, b) =>
        (a.track_number || 0) -
        (b.track_number || 0)
    );
}


function playAlbumContext(album) {

  const songs =
    getAlbumSongs(album);

  if (!songs.length) return;

  queueSongs = [
    ...songs
  ];

  queueIndex = 0;

  renderQueue();

  playSong(
    songs[0]
  );
}


function addAlbumToQueue(album) {

  const songs =
    getAlbumSongs(album);

  songs.forEach(song => {

    if (
      !queueSongs.some(
        s => s.id === song.id
      )
    ) {

      queueSongs.push(song);
    }

  });

  renderQueue();

  console.log(
    "Album added to queue:",
    album.title
  );
}


function playAlbumNext(album) {

  const songs =
    getAlbumSongs(album);

  if (!songs.length) return;


  let insertIndex =
    currentSong
      ? queueIndex + 1
      : 0;


  queueSongs.splice(
    insertIndex,
    0,
    ...songs.filter(
      song =>
        !queueSongs.some(
          q => q.id === song.id
        )
    )
  );


  renderQueue();
}

async function toggleAlbumFavorites(album) {

  const songs =
    getAlbumSongs(album);

  if (!songs.length) return;


  const allFavorite =
    songs.every(
      song =>
        isSongFavorite(song)
    );


  for (const song of songs) {

    const shouldFavorite =
      !allFavorite;

    if (
      isSongFavorite(song) !==
      shouldFavorite
    ) {

      await window.electronAPI.setSongFavorite(
        song.id,
        shouldFavorite
      );
    }
  }


  await loadLibrary();


  // Update player favorite icon
  if (currentSong) {

    const updatedSong =
      library.songs.find(
        song =>
          song.id ===
          currentSong.id
      );

    if (updatedSong) {

      currentSong =
        updatedSong;

      const favoriteIcon =
        document.querySelector(
          ".nowPlaying .songIsFavorite"
        );

      if (favoriteIcon) {

        favoriteIcon.src =
          isSongFavorite(
            updatedSong
          )
            ? "./icons/likefull.png"
            : "./icons/favorite.png";
      }
    }
  }

  console.log(
    allFavorite
      ? "Removed album from favorites"
      : "Added album to favorites"
  );
}

function getArtistSongs(artist) {

  return library.songs
    .filter(
      song =>
        Number(song.artist_id) ===
        Number(artist.id)
    )
    .sort((a, b) => {

      if (
        a.album_id !==
        b.album_id
      ) {

        return (
          a.album_id -
          b.album_id
        );
      }

      return (
        (a.track_number || 0) -
        (b.track_number || 0)
      );
    });
}

function goToAlbumArtist(album) {
    if (!album) return;

    selectedArtistId = Number(album.artist_id);

    activeTab = "artists";

    musicTabs.forEach(tab => {
        tab.classList.remove("active");
    });

    const artistsTab =
        document.getElementById("artists");

    artistsTab.classList.add("active");

    renderCurrentView();

    const artistMusicResults =
        document.getElementById("artistMusicResults");

    if (artistMusicResults) {
        artistMusicResults.innerHTML =
            renderArtistMusic();
    }

    updateActiveSong();
}


function playArtistContext(artist) {

  const songs =
    getArtistSongs(artist);

  if (!songs.length) return;

  queueSongs = [
    ...songs
  ];

  queueIndex = 0;

  renderQueue();

  playSong(
    songs[0]
  );
}


function addArtistToQueue(artist) {

  const songs =
    getArtistSongs(artist);

  songs.forEach(song => {

    if (
      !queueSongs.some(
        q => q.id === song.id
      )
    ) {

      queueSongs.push(song);
    }

  });

  renderQueue();
}

function getArtistSongs(artist) {

  return library.songs
    .filter(
      song =>
        Number(song.artist_id) ===
        Number(artist.id)
    )
    .sort((a, b) => {

      if (
        a.album_id !==
        b.album_id
      ) {

        return (
          a.album_id -
          b.album_id
        );
      }

      return (
        (a.track_number || 0) -
        (b.track_number || 0)
      );
    });
}


function playArtistContext(artist) {

  const songs =
    getArtistSongs(artist);

  if (!songs.length) return;

  queueSongs = [
    ...songs
  ];

  queueIndex = 0;

  renderQueue();

  playSong(
    songs[0]
  );
}


function addArtistToQueue(artist) {

  const songs =
    getArtistSongs(artist);

  songs.forEach(song => {

    if (
      !queueSongs.some(
        q => q.id === song.id
      )
    ) {

      queueSongs.push(song);
    }

  });

  renderQueue();
}

function goToAlbum(song) {

  const album =
    library.albums.find(
      album =>
        Number(album.id) ===
        Number(song.album_id)
    );

  if (!album) return;


  activeTab = "albums";

  document
    .querySelectorAll(".musicTabs")
    .forEach(tab => {

      tab.classList.remove(
        "active"
      );
    });


  document
    .getElementById("albums")
    ?.classList.add(
      "active"
    );

    // Open the navigation panel
  navigation.style.display = "block";


  renderCurrentView();


  setTimeout(() => {

    renderSelectedAlbum(
      album.id
    );

    const trackList =
      document.getElementById(
        "trackListContainer"
      );

    if (trackList) {

      trackList.style.display =
        "block";
    }

  }, 0);
}

function goToArtist(song) {

  const artist =
    library.artists.find(
      artist =>
        Number(artist.id) ===
        Number(song.artist_id)
    );

  if (!artist) return;


  activeTab = "artists";

  selectedArtistId =
    artist.id;


  document
    .querySelectorAll(".musicTabs")
    .forEach(tab => {

      tab.classList.remove(
        "active"
      );
    });


  document
    .getElementById("artists")
    ?.classList.add(
      "active"
    );

    // Open the navigation panel
  navigation.style.display = "block";


  renderCurrentView();
}

function getPlaylistSongs(playlist) {

  return playlist.song_ids
    .map(songId =>
      library.songs.find(
        song =>
          Number(song.id) ===
          Number(songId)
      )
    )
    .filter(Boolean);
}


function playPlaylistContext(playlist) {

  const songs =
    getPlaylistSongs(
      playlist
    );

  if (!songs.length) return;

  queueSongs = [
    ...songs
  ];

  queueIndex = 0;

  renderQueue();

  playSong(
    songs[0]
  );
}


function addPlaylistToQueue(playlist) {

  const songs =
    getPlaylistSongs(
      playlist
    );

  songs.forEach(song => {

    if (
      !queueSongs.some(
        q => q.id === song.id
      )
    ) {

      queueSongs.push(song);
    }

  });

  renderQueue();
}


function playPlaylistNext(playlist) {

  const songs =
    getPlaylistSongs(
      playlist
    );

  if (!songs.length) return;


  const newSongs =
    songs.filter(
      song =>
        !queueSongs.some(
          q => q.id === song.id
        )
    );


  const index =
    currentSong
      ? queueIndex + 1
      : 0;


  queueSongs.splice(
    index,
    0,
    ...newSongs
  );


  renderQueue();
}

async function removeSongFromPlaylist(
  song,
  playlistId
) {

  if (!playlistId) return;


  try {

    await window.electronAPI.removeSongFromPlaylist(
      playlistId,
      song.id
    );


    await loadLibrary();


    console.log(
      "Removed from playlist:",
      song.title
    );

  } catch (error) {

    console.error(
      "Failed to remove song from playlist:",
      error
    );
  }
}

const playlistPicker =
  document.getElementById(
    "playlistPicker"
  );

const playlistPickerList =
  document.getElementById(
    "playlistPickerList"
  );


async function showAddToPlaylistMenu(song) {

  playlistPickerList.innerHTML = "";


  const playlists =
    library.playlists.filter(
      playlist =>
        playlist.name !== "Favorites"
    );


  if (!playlists.length) {

    playlistPickerList.innerHTML = `
      <div style="
        padding:12px;
        color:#aaa;
        font-size:13px;
      ">
        No playlists
      </div>
    `;

  } else {

    playlists.forEach(
      playlist => {

        const button =
          document.createElement(
            "button"
          );

        button.className =
          "playlistPickerItem";

        button.textContent =
          playlist.name;


        button.addEventListener(
          "click",
          async () => {

            await addSongToPlaylist(
              song,
              playlist
            );

            playlistPicker.style.display =
              "none";
          }
        );


        playlistPickerList.appendChild(
          button
        );
      }
    );
  }


  playlistPicker.style.display =
    "block";


  const x =
    Math.min(
      window.innerWidth -
        playlistPicker.offsetWidth -
        10,
      window.innerWidth / 2
    );


  const y =
    Math.min(
      window.innerHeight -
        playlistPicker.offsetHeight -
        10,
      window.innerHeight / 2
    );


  playlistPicker.style.left =
    `${Math.max(5, x)}px`;

  playlistPicker.style.top =
    `${Math.max(5, y)}px`;
}

async function addSongToPlaylist(
  song,
  playlist
) {

  try {

    await window.electronAPI.addSongToPlaylist(
      playlist.id,
      song.id
    );


    await loadLibrary();


    console.log(
      `Added ${song.title} to ${playlist.name}`
    );

  } catch (error) {

    console.error(
      "Failed to add song to playlist:",
      error
    );
  }
}

async function deleteSong(song) {

  const confirmed =
    confirm(
      `Delete "${song.title}" from your library?`
    );

  if (!confirmed) return;


  try {

    await window.electronAPI.deleteSong(
      song.id
    );


    // Remove from queue
    queueSongs =
  queueSongs.filter(
    s =>
      String(s.id) !==
      String(song.id)
  );


    // If currently playing
    const wasPlaying =
  currentSong &&
  String(currentSong.id) ===
  String(song.id);


if (wasPlaying) {

  audio.pause();

  currentSong = null;

  audio.src = "";

  queueIndex = -1;

}

    await loadLibrary();

   if (wasPlaying) {

  if (queueSongs.length > 0) {

    // The queue has already had the
    // deleted song removed.

    queueIndex = 0;

    await playSong(
      queueSongs[0]
    );

  } else {

    renderQueue();

    updatePlayButton();

  }

} else {

  renderQueue();

}


  } catch (error) {

    console.error(
      "Failed to delete song:",
      error
    );
  }
}


async function deleteAlbum(album) {

  const songs =
    getAlbumSongs(album);


  const confirmed =
    confirm(
      `Delete album "${album.title}" and its ${songs.length} songs?`
    );


  if (!confirmed) return;


  try {

    await window.electronAPI.deleteAlbum(
      album.id
    );


    queueSongs =
      queueSongs.filter(
        song =>
          Number(song.album_id) !==
          Number(album.id)
      );


    if (
      currentSong &&
      Number(currentSong.album_id) ===
      Number(album.id)
    ) {

      audio.pause();

      currentSong = null;

      audio.src = "";

      updatePlayButton();
    }


    await loadLibrary();

    renderQueue();


  } catch (error) {

    console.error(
      "Failed to delete album:",
      error
    );
  }
}

async function deletePlaylist(
  playlist
) {

  if (
    playlist.name ===
    "Favorites"
  ) {

    alert(
      "The Favorites playlist cannot be deleted."
    );

    return;
  }


  const confirmed =
    confirm(
      `Delete playlist "${playlist.name}"?`
    );


  if (!confirmed) return;


  try {

    await window.electronAPI.deletePlaylist(
      playlist.id
    );


    if (
      Number(selectedPlaylistId) ===
      Number(playlist.id)
    ) {

      selectedPlaylistId =
        null;
    }


    await loadLibrary();

  } catch (error) {

    console.error(
      "Failed to delete playlist:",
      error
    );
  }
}

function openCreatePlaylistModal() {
  console.log("Opening create playlist modal");
  
  const modal = document.getElementById("createPlaylistModal");
  
  if (!modal) {
    console.error("Create playlist modal not found!");
    return;
  }
  
  const nameInput = document.getElementById("playlistNameInput");
  const descriptionInput = document.getElementById("playlistDescriptionInput");
  const error = document.getElementById("createPlaylistError");
  
  if (!nameInput || !descriptionInput || !error) {
    console.error("Modal elements not found!");
    return;
  }
  
  nameInput.value = "";
  descriptionInput.value = "";
  error.textContent = "";
  
  modal.classList.add("visible");
  
  console.log("Modal should be visible now");
  
  setTimeout(() => {
    nameInput.focus();
  }, 50);
}

function closeCreatePlaylistModal() {

  const modal =
    document.getElementById(
      "createPlaylistModal"
    );

  modal.classList.remove("visible");

}
function closePlaylistPicker() {

   playlistPicker.style.display = "none";

}

async function handleCreatePlaylist() {
  console.log("Creating playlist...");
  
  const nameInput = document.getElementById("playlistNameInput");
  const descriptionInput = document.getElementById("playlistDescriptionInput");
  const error = document.getElementById("createPlaylistError");
  
  if (!nameInput || !descriptionInput || !error) {
    console.error("Form elements not found!");
    return;
  }
  
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();
  
  error.textContent = "";
  
  if (!name) {
    error.textContent = "Please enter a playlist name.";
    nameInput.focus();
    return;
  }
  
  try {
    const playlist = await window.electronAPI.createPlaylist(
      name,
      description || null
    );
    
    console.log("Playlist created:", playlist);
    
    // Add it to our current library
    library.playlists.push({
      ...playlist,
      song_ids: []
    });
    
    // Select the new playlist
    selectedPlaylistId = playlist.id;
    
    // Close modal
    closeCreatePlaylistModal();
    
    // Render playlists again
    renderPlaylists();
    
  } catch (error) {
    console.error("Failed to create playlist:", error);
    error.textContent = error.message || "Failed to create playlist.";
  }
}

document
  .getElementById("closeCreatePlaylist")
  .addEventListener(
    "click", (event) => {
      event.stopPropagation();
      closeCreatePlaylistModal();
    }
  );

document
  .getElementById("closePlaylistPicker")
  .addEventListener("click", (event) => {
    event.stopPropagation();
    closePlaylistPicker();
  });

document
  .getElementById("cancelCreatePlaylist")
  .addEventListener(
    "click", (event) => {
      event.stopPropagation();
      closeCreatePlaylistModal();
    }
  );

document
  .getElementById("confirmCreatePlaylist")
  .addEventListener(
    "click", (event) => {
      event.stopPropagation();
      handleCreatePlaylist();
    }
  );

document
  .getElementById("playlistNameInput")
  .addEventListener(
    "keydown",
    (event) => {
      event.stopPropagation();
      if (event.key === "Enter") {

        event.preventDefault();

        handleCreatePlaylist();

      }
    }
  );


const musicTabs = document.querySelectorAll('.musicTabs'); 

musicTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activeTab = tab.id;

    musicTabs.forEach(tab => {
      tab.classList.remove('active');
    });

    tab.classList.add('active');
    
    renderCurrentView();
  });
});

const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {

  searchQuery = searchInput.value.trim().toLowerCase();

  renderCurrentView();

});




 // Albums is the default tab
  document
    .getElementById("albums")
    .classList.add("active");

    
    const results = document.getElementById('results');

    document
  .getElementById("queueList")
    
  document.addEventListener(
  "click",
  async (event) => {

    const createBtn = event.target.closest('#createPlaylistBtn');
  
  if (createBtn) {
    event.preventDefault();
    event.stopPropagation();
    console.log("Create playlist button clicked");
    openCreatePlaylistModal();
  }

    // =========================
    // ALBUM
    // =========================

    const musicClick =
      event.target.closest(".musicbox");

    if (musicClick) {

      const albumId =
        Number(
          musicClick.dataset.albumId
        );

      renderSelectedAlbum(albumId);

      updateActiveSong();

      const trackListBox =
        document.getElementById(
          "trackListContainer"
        );

      trackListBox.style.display =
        "block";

      return;
    }


    // =========================
    // ARTIST
    // =========================

    const artistClick =
      event.target.closest(".artistBox");

    if (artistClick) {

      selectedArtistId =
        Number(
          artistClick.dataset.artistId
        );

      document
        .querySelectorAll(".artistBox")
        .forEach(artist => {

          artist.classList.remove(
            "active"
          );

        });

      artistClick.classList.add(
        "active"
      );

      const artistMusicResults =
        document.getElementById(
          "artistMusicResults"
        );

      artistMusicResults.innerHTML =
        renderArtistMusic();

      updateActiveSong();

      return;
    }


    // =========================
    // GENRE
    // =========================

    const genreClick =
      event.target.closest(".genreBox");
if (genreClick) {

  selectedGenreId =
    Number(genreClick.dataset.genreId);

  document
    .querySelectorAll('.genreBox')
    .forEach(genre => {
      genre.classList.remove('active');
    });

  genreClick.classList.add('active');


  const genreMusicResults =
    document.getElementById('genreMusicResults');

  genreMusicResults.innerHTML =
    renderGenreMusic();

  updateActiveSong();

  return;
}


    // =========================
    // PLAYLIST
    // =========================

    const playlistClick =
      event.target.closest(
        ".playlistBox"
      );

   if (playlistClick) {

  selectedPlaylistId =
    Number(
      playlistClick.dataset.playlistId
    );

  document
    .querySelectorAll(".playlistBox")
    .forEach(playlist => {
      playlist.classList.remove("active");
    });

  playlistClick.classList.add("active");

  const playlistMusicResults =
    document.getElementById(
      "playlistMusicResults"
    );

  playlistMusicResults.innerHTML =
    renderPlaylistMusic();

  updateActiveSong();

  console.log(
    "Selected playlist:",
    selectedPlaylistId
  );

  return;
}

    // =========================
    // QUEUE SONG
    // =========================

    // const queueSong =
    //   event.target.closest(
    //     ".queueSong"
    //   );

    // if (queueSong) {

    //   const queueIndexClicked =
    //     Number(
    //       queueSong.dataset.queueIndex
    //     );

    //   if (
    //     queueIndexClicked < 0 ||
    //     queueIndexClicked >= queueSongs.length
    //   ) {
    //     return;
    //   }

    //   queueIndex =
    //     queueIndexClicked;

    //   renderQueue();

    //   await playSong(
    //     queueSongs[queueIndex]
    //   );

    //   return;
    // }


    // =========================
    // LIBRARY SONG
    // =========================

    const favoriteIcon =
  event.target.closest(
    ".songIsFavorite"
  );

if (favoriteIcon) {

  event.stopPropagation();

  const songElement =
    favoriteIcon.closest(
      ".songContainer, .songRow"
    );

  if (!songElement) return;

  const songId =
    songElement.dataset.songId;

  const song =
    library.songs.find(
      song =>
        String(song.id) ===
        String(songId)
    );

  if (!song) return;

  await toggleFavorite(song);

  return;
}

    const songElement =
      event.target.closest(
        ".songContainer, .songRow"
      );

    if (!songElement) return;


    const songId =
      songElement.dataset.songId;


    const song =
      library.songs.find(
        song =>
          String(song.id) ===
          String(songId)
      );


    if (!song) {

      console.error(
        "Song not found:",
        songId
      );

      return;
    }


    // =========================
    // CURRENT SONG
    // PLAY / PAUSE
    // =========================

    if (
      currentSong &&
      String(currentSong.id) ===
      String(song.id)
    ) {

      if (audio.paused) {

        await audio.play();

      } else {

        audio.pause();

      }

      updatePlayButton();
      updateActiveSong();

      return;
    }


    // =========================
    // CREATE ALBUM QUEUE
    // =========================

   // =========================
// CREATE QUEUE BASED ON TAB
// =========================

let songsForQueue = [];


if (activeTab === "albums") {

  // =========================
  // ALBUM
  // =========================

  songsForQueue =
    library.songs
      .filter(
        s =>
          s.album_id ===
          song.album_id
      )
      .sort(
        (a, b) =>
          (a.track_number || 0) -
          (b.track_number || 0)
      );

}


else if (activeTab === "artists") {

  // =========================
  // ARTIST
  // =========================

  songsForQueue =
    library.songs
      .filter(
        s =>
          s.artist_id ===
          song.artist_id
      )
      .sort((a, b) => {

        // Sort albums first
        if (a.album_id !== b.album_id) {
          return a.album_id - b.album_id;
        }

        // Then tracks
        return (
          (a.track_number || 0) -
          (b.track_number || 0)
        );

      });

}


else if (activeTab === "songs") {

  // =========================
  // ALL SONGS
  // =========================

  songsForQueue =
    [...library.songs];

}


else if (activeTab === "genres") {

  // =========================
  // GENRE → ALBUMS → SONGS
  // =========================

  // Find the selected genre
  const genre =
    library.genres.find(
      g =>
        Number(g.id) ===
        Number(selectedGenreId)
    );

  if (!genre) {

    console.error(
      "Genre not found:",
      selectedGenreId
    );

    return;
  }


  // Find albums belonging to this genre
  const genreAlbums =
    library.albums.filter(
      album =>
        Number(album.genre_id) ===
        Number(selectedGenreId)
    );


  // Get album IDs
  const genreAlbumIds =
    genreAlbums.map(
      album => album.id
    );


  // Get every song from those albums
  songsForQueue =
    library.songs
      .filter(
        song =>
          genreAlbumIds.includes(
            song.album_id
          )
      )
      .sort((a, b) => {

        // Sort by album
        if (a.album_id !== b.album_id) {
          return a.album_id - b.album_id;
        }

        // Sort tracks inside album
        return (
          (a.track_number || 0) -
          (b.track_number || 0)
        );

      });

      


  console.log(
    "Selected genre:",
    genre.name
  );

  console.log(
    "Genre albums:",
    genreAlbums
  );

  console.log(
    "Genre songs:",
    songsForQueue
  );

}

else if (activeTab === "playlist") {

    const playlist = library.playlists.find(
        playlist =>
            Number(playlist.id) ===
            Number(selectedPlaylistId)
    );

    if (!playlist) {
        console.error(
            "Playlist not found:",
            selectedPlaylistId
        );
        return;
    }

    songsForQueue = playlist.song_ids
        .map(songId =>
            library.songs.find(
                song =>
                    Number(song.id) ===
                    Number(songId)
            )
        )
        .filter(Boolean);

}


// =========================
// FIND CLICKED SONG
// =========================

const clickedIndex =
  songsForQueue.findIndex(
    s =>
      String(s.id) ===
      String(song.id)
  );


if (clickedIndex === -1) {

  console.error(
    "Song not found in playback context:",
    song.id
  );

  return;

}


// =========================
// CURRENT SONG + REMAINING
// =========================

queueSongs = [...songsForQueue]

queueIndex = clickedIndex;


console.log(
  "Playback context:",
  activeTab
);

console.log(
  "New queue:",
  queueSongs
);




renderQueue();

await playSong(song);

  }
);
  
  await loadLibrary();
  
});



const isFullscreen = document.getElementById('fullscreen');

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
};

isFullscreen.addEventListener('click', toggleFullscreen);

