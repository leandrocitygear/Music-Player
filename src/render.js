
// const mm = require('music-metadata');

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
      <span></span>
      Add Music Files
    </button>

    <button id="addMusicFolder">
    <img src="./icons/folder.png" alt="">
      <span></span>
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


console.log("🔥 DISCOUT RENDERER LOADED");
document.addEventListener("DOMContentLoaded", () => {

const library = {
  albums: [{
      title: "Parachutes",
      artist: "Coldplay",
      artwork: "./Parachutes.png",
      year: "2000"
    }],
  artists: [{
      name: "Coldplay",
      artwork: "./coldplay.jfif"
    }],
  songs: [{
      title: "Shiver",
      artist: "Coldplay",
      album: "Parachutes",
      artwork: "./Parachutes.png",
      path: "./02 - Shiver.m4a"
    }],
  genres: [{
      name: "Alternative Rock"
    }],
  playlist: [{
    name: "Playlist for home"
  }]
};

let activeTab = 'albums';

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

function renderAlbums() {
  const results = document.getElementById('results');

  results.innerHTML = `
    <div id="albumWindow">
    ${library.albums.map(album => `
      <div class="musicbox">
     <img class="art" src="${album.artwork}" />
     <p class="alb">${album.title}</p>
     <p class="artistsName">${album.artist}</p>
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
    <div class="artistBox">
      <img class="artistImg" src="${artist.artwork}" />
      <p class="artistName">${artist.name}</p>
    </div>
    `).join("")}
    </div>
    <div id="artistMusicResults">
    ${library.albums.map(album => `
      <div class="artistAlbumBox">
      <img class="artistAlbumImg" src="${album.artwork}"/>
      <div class="artistAlbumInfo">
      <p>${album.title}</p>
      <p>${album.year}</p>
      </div>
      ${library.songs.map(song => `
        <div class="songContainer">
          <div id="leftSpan">
            <img src="./icons/volume.png" alt="">
            <p>1</p>
            <p>${song.title}</p>
          </div>
          <img src="./icons/favorite.png" alt="">
        </div>
        `).join("")}
      </div>
      `).join("")}
    </div>
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
    <div class="songRow">

            <div class="coverColumn">
              <img
                class="songImg"
                src="${song.artwork}"
              />
            </div>

            <div class="titleColumn">
              ${song.title}
            </div>

            <div class="artistColumn">
              ${song.artist}
            </div>

            <div class="albumColumn">
              ${song.album}
            </div>

          </div>
    `).join("")}

  </div>
    `
}

function renderGenres() {
  const results = document.getElementById('results');


  //    const testGenres = library.genres.flatMap(genre =>
  //   Array(5).fill(genre)
  // );

  results.innerHTML = `
  
  <div id="genreWindow">
  <div id=genreList>
  ${library.genres.map(genre => `
    <div class="genreBox">
      <p class="genreName">${genre.name}</p>
    </div>
    `).join("")}
    </div>
    <div id="genreMusicResults">
    ${library.albums.map(album => `
      <div class="artistAlbumBox">
      <img class="artistAlbumImg" src="${album.artwork}"/>
      <div class="artistAlbumInfo">
      <p>${album.title}</p>
      <p>${album.year}</p>
      </div>
      ${library.songs.map(song => `
        <div class="songContainer">
          <div id="leftSpan">
            <img src="./icons/volume.png" alt="">
            <p>1</p>
            <p>${song.title}</p>
          </div>
          <img src="./icons/favorite.png" alt="">
        </div>
        `).join("")}
      </div>
      `).join("")}
    </div>
    </div>
    
    `
};

function renderPlaylists() {
  const results = document.getElementById('results');

  results.innerHTML = `
  
  <div id="playlistWindow">
  <div id=playlistList>
  ${library.playlist.map(playlist => `
    <div class="genreBox">
      <p class="genreName">${playlist.name}</p>
    </div>
    `).join("")}
    </div>
    <div id="playlistMusicResults">
    ${library.albums.map(album => `
      <div class="artistAlbumBox">
      <img class="artistAlbumImg" src="${album.artwork}"/>
      <div class="artistAlbumInfo">
      <p>${album.title}</p>
      <p>${album.year}</p>
      </div>
      ${library.songs.map(song => `
        <div class="songContainer">
          <div id="leftSpan">
            <img src="./icons/volume.png" alt="">
            <p>1</p>
            <p>${song.title}</p>
          </div>
          <img src="./icons/favorite.png" alt="">
        </div>
        `).join("")}
      </div>
      `).join("")}
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


  // Load Albums immediately
  renderCurrentView();

  const results = document.getElementById('results');

  results.addEventListener('click', (event) => {

    const musicClick = event.target.closest('.musicbox')

    if (!musicClick) return;

    const trackListBox = document.getElementById('trackListContainer');
    if (trackListBox.style.display === 'block') {
      trackListBox.style.display = 'none';
    } else {
      trackListBox.style.display = 'block'
    }

  });


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