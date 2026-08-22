





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

      
      const nowPlaying = document.querySelector('.nowPlaying');
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
              src="./icons/play.png" 
              alt=""
            >

            <p>${index + 1}</p>

            <p title="${song.title}">${song.title}</p>

          </div>

          <img class="songIsFavorite"
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
          src="./icons/play.png"
          alt=""
        >

        <p>${song.track_number || index + 1}</p>

        <p title="${song.title}">${song.title}</p>

      </div>

      <img
       class="songIsFavorite"
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
    updateActiveSong();
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
      `.songContainer[data-song-id="${currentSong.id}"],
       .songRow[data-song-id="${currentSong.id}"]`
    )
    .forEach(song => {

      song.classList.add("active");

      const icon =
        song.querySelector(".songStatusIcon");

      if (icon) {
        icon.src = "./icons/volume.png";
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


  console.log(
    "Playing:",
    song.title
  );


  // Update active UI immediately
  updateActiveSong();


  // Update player information

  document.querySelector(".songName").textContent =
    song.title || "";

  document.querySelector(".artName").textContent =
    song.artist || "";

  document.querySelector(".albumName").textContent =
    song.album || "";


  document.querySelector(".albumArt").src =
    song.artwork_path || "./icons/album.png";

const artworkPath =
  song.artwork_path || './icons/album.png';

if (artworkPath.startsWith('C:\\') || artworkPath.includes(':\\')) {

  document.getElementById('background').style.backgroundImage =
    `url("file:///${artworkPath.replace(/\\/g, '/')}")`;

} else {

  document.getElementById('background').style.backgroundImage =
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

document
  .getElementById("skip_previous")
  .addEventListener("click", () => {

    playPreviousSong();

  });

  function playPreviousSong() {

  if (!library.songs.length) return;


  let index;


  if (isShuffle) {

    index =
      Math.floor(
        Math.random() *
        library.songs.length
      );

  } else {

    index =
      currentSongIndex - 1;


    if (index < 0) {

      index =
        library.songs.length - 1;

    }

  }


  playSong(
    library.songs[index]
  );

}

document
  .getElementById("skip_next")
  .addEventListener("click", () => {

    playNextSong();

  });

  function playNextSong() {

  if (!library.songs.length) return;


  // Repeat ONE
  if (
    repeatMode === "one" &&
    currentSong
  ) {

    audio.currentTime = 0;

    audio.play();

    return;

  }


  let index;


  // Shuffle
  if (isShuffle) {

    index =
      Math.floor(
        Math.random() *
        library.songs.length
      );

  }

  // Normal
  else {

    index =
      currentSongIndex + 1;


    // Repeat ALL
    if (
      index >= library.songs.length
    ) {

      if (repeatMode === "all") {

        index = 0;

      } else {

        audio.pause();

        return;

      }

    }

  }


  playSong(
    library.songs[index]
  );

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

    
   document.addEventListener('click', async (event) => {

  // =========================
  // ALBUM CLICK
  // =========================

  const musicClick = event.target.closest('.musicbox');

  if (musicClick) {

    const albumId =
      Number(musicClick.dataset.albumId);

    renderSelectedAlbum(albumId);
    updateActiveSong();

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
      updateActiveSong();

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

const songElement =
    event.target.closest(".songContainer, .songRow");

 if (!songElement) return;


const songId =
  songElement.dataset.songId;


const song =
  library.songs.find(
    song => String(song.id) === String(songId)
  );


if (!song) {

  console.error(
    "Song not found:",
    songId
  );

  return;
}
songTitle.textContent = song.title;


await playSong(song);



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