





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
      
      
      document.getElementById('menu').addEventListener('click', () => {
        const nav = document.getElementById('navigation');
        if (nav.style.display === "block") {
          nav.style.display = 'none';
        } else {
          nav.style.display = 'block';
        }
      });

      
      
      document.querySelector('.nowPlaying').addEventListener('click', () => {
        const queue = document.getElementById('queue');
        if (queue.style.display === 'block') {
          queue.style.display = 'none';
        } else {
          queue.style.display = 'block';
        }
      });
      
      
      
      
      
      
      
      
      
      
      
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
              src="./icons/volume.png" 
              alt=""
            >

            <p>${index + 1}</p>

            <p>${song.title}</p>

          </div>

          <img 
            src="./icons/favorite.png" 
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
          src="./icons/volume.png"
          alt=""
        >

        <p>${song.track_number || index + 1}</p>

        <p>${song.title}</p>

      </div>

      <img
        src="./icons/favorite.png"
        alt=""
      >

    </div>

  `).join('');
}



function renderAlbums() {
  const results = document.getElementById('results');

  results.innerHTML = `
    <div id="albumWindow">
    ${library.albums.map(album => `
      <div class="musicbox" data-album-id="${album.id}" >
     <img class="art" src="${album.artwork_path || "./b.jpg"}" />
     <p class="alb">${album.title}</p>
     <p class="artistsName">${album.artist || 'Unknown Artist'}</p>
    </div>
      `).join("")}
    </div>
    `
};

function renderArtists() {
  const results = document.getElementById('results');

  results.innerHTML = `
  <div id="artistWindow">
  <div id=artistList>
  ${library.artists.map(artist => `
    <div class="artistBox ${artist.id === selectedArtistId ? 'active' : ''}" data-artist-id="${artist.id}" >
      <img class="artistImg" src="${artist.artwork_path || "./b.jpg" }" />
      <p class="artistName">${artist.name}</p>
    </div>
    `).join("")}
    </div>
    <div id="artistMusicResults">
    ${renderArtistMusic()}
    </div>
    `
};

function renderSongs() {
  const results = document.getElementById('results');


  results.innerHTML = `
  <div id="songWindow">

      <div class="songHeader">
        <div class="coverColumn"></div>
        <div class="titleColumn">TITLE</div>
        <div class="artistColumn">ARTIST</div>
        <div class="albumColumn">ALBUM</div>
      </div>

      <div class="songBody">
  ${library.songs.map(song => `
    <div class="songRow" 
    data-song-id="${song.id}">

            <div class="coverColumn">
              <img
                class="songImg"
                src="${song.artwork_path || "./b.jpg"}"
              />
            </div>

            <div class="titleColumn">
              ${song.title}
            </div>

            <div class="artistColumn">
              ${song.artist || 'Unknown Artist'}
            </div>

            <div class="albumColumn">
              ${song.album || 'Unknown Album'}
            </div>

          </div>
    `).join("")}

  </div>
    `
}

function renderGenres() {
  const results = document.getElementById('results');


  results.innerHTML = `
  
  <div id="genreWindow">
  <div id=genreList>
  ${library.genres.map(genre => `
    <div class="genreBox"
    data-genre-id="${genre.id}">
      <p class="genreName">${genre.name}</p>
    </div>
    `).join("")}
    </div>
    <div id="genreMusicResults">
    
      <div class="artistAlbumBox">
      <img class="artistAlbumImg" src=""/>
      <div class="artistAlbumInfo">
      <p></p>
      <p></p>
      </div>
     
        <div class="songContainer">
          <div id="leftSpan">
            <img src="./icons/volume.png" alt="">
            <p>1</p>
            <p></p>
          </div>
          <img src="./icons/favorite.png" alt="">
        </div>
       
      </div>
      
    </div>
    </div>
    
    `
};

function renderPlaylists() {
  const results = document.getElementById('results');

  results.innerHTML = `
  
  <div id="playlistWindow">
  <div id=playlistList>
  ${library.playlists.map(playlist => `
    <div class="playlistBox"
    data-playlist-id="${playlist.id}">
      <p class="playlistName">${playlist.name}</p>
    </div>
    `).join("")}
    </div>
    <div id="playlistMusicResults">
    
      <div class="artistAlbumBox">
      <img class="artistAlbumImg" src=""/>
      <div class="artistAlbumInfo">
      <p></p>
      <p></p>
      </div>
      
        <div class="songContainer">
          <div id="leftSpan">
            <img src="./icons/volume.png" alt="">
            <p>1</p>
            <p></p>
          </div>
          <img src="./icons/favorite.png" alt="">
        </div>
        
      </div>
      
    </div>
    </div>
    `
}






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

 // Albums is the default tab
  document
    .getElementById("albums")
    .classList.add("active");

    
    const results = document.getElementById('results');
    
   results.addEventListener('click', (event) => {

  // =========================
  // ALBUM CLICK
  // =========================

  const musicClick = event.target.closest('.musicbox');

  if (musicClick) {

    const albumId =
      Number(musicClick.dataset.albumId);

    renderSelectedAlbum(albumId);

    const trackListBox =
      document.getElementById('trackListContainer');

    trackListBox.style.display = 'block';

    return;
  }


  // =========================
  // ARTIST CLICK
  // =========================

  const artistClick =
    event.target.closest('.artistBox');

  if (artistClick) {

    selectedArtistId =
      Number(artistClick.dataset.artistId);

    // Remove active from all artists
    document
      .querySelectorAll('.artistBox')
      .forEach(artist => {
        artist.classList.remove('active');
      });

    // Highlight selected artist
    artistClick.classList.add('active');

    // Only update the music section
    const artistMusicResults =
      document.getElementById('artistMusicResults');

    artistMusicResults.innerHTML =
      renderArtistMusic();

    return;
  }


  // =========================
  // GENRE CLICK
  // =========================

  const genreClick =
    event.target.closest('.genreBox');

  if (genreClick) {

    selectedGenreId =
      Number(genreClick.dataset.genreId);

    console.log(
      "Selected genre:",
      selectedGenreId
    );

    return;
  }


  // =========================
  // PLAYLIST CLICK
  // =========================

  const playlistClick =
    event.target.closest('.playlistBox');

  if (playlistClick) {

    selectedPlaylistId =
      Number(playlistClick.dataset.playlistId);

    console.log(
      "Selected playlist:",
      selectedPlaylistId
    );

    return;
  }

});
  
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