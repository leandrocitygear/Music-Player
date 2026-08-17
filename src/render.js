
// const mm = require('music-metadata');

const addFiles = document.getElementById('settings');

addFiles.onclick = () => {
window.electronAPI.openFileDialog();
};

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
      artwork: "./Parachutes.png"
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
  playlist: []
};

let activeTab = 'artists';

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

    const testAlbums = library.albums.flatMap(album =>
    Array(60).fill(album)
  );

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
  ${library.artists.map(artist => `
    <div class="artistBox">
      <img class="artistImg" src="${artist.artwork}" />
      <p class="artistName">${artist.name}</p>
    </div>
    `).join("")}
    </div>
    `
};

function renderSongs() {
  const results = document.getElementById('results');

  results.innerHTML = library.songs.map(song => `
    <div class="songBox">
    <img class="songImg" src="${song.artwork}" />
    <p class="songTitle">${song.title}</p>
    <p class="songArtist">${song.artist}</p>
    <p class="songAlbum">${song.album}</p>
    </div>
    `).join("");
}

function renderGenres() {
  const results = document.getElementById('results');

  results.innerHTML = library.genres.map(genre => `
      <div class="genreBox">
        <p class="genreName">${genre.name}</p>
      </div>
    `).join("");
};

function renderPlaylists() {
  const results = document.getElementById('results');

  results.innerHTML = library.playlist.map(playlist => `
    <div class="playlistBox">
    <p class="playlistName"></p>
    </div>
    `).join("");
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
    .getElementById("artists")
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

// let allFilePaths = [];
// let currentlyPlayingAudio = null;
// // console.log(allFilePaths)

// function updateNowPlayingInfo(metadata) {
//   const nowPlayingArt = document.getElementsByClassName('albumArt')[0];
//   const artName = document.getElementsByClassName('artName')[0];
//   const albumName = document.getElementsByClassName('albumName')[0];
//   const songName = document.getElementsByClassName('songName')[0];
//   const background = document.getElementById('background');
  
//   // Update album art
//   if (metadata.common.picture && metadata.common.picture.length > 0) {
//     const base64String = Buffer.from(metadata.common.picture[0].data).toString('base64');
//     const imageUrl = `data:${metadata.common.picture[0].format};base64,${base64String}`;
//     nowPlayingArt.src = imageUrl;
//     background.style.backgroundImage = `url(${imageUrl})`;
//   } else {
//     nowPlayingArt.src = './b.jpg';
//     background.style.backgroundImage = `url(./b.jpg)`;
//   }
  
//   // Update song information
//   artName.textContent = metadata.common.artist || 'Unknown Artist';
//   albumName.textContent = metadata.common.album || 'Unknown Album';
//   songName.textContent = metadata.common.title || 'Unknown Title';
// }



// let currentMetadata;

// function updateResults(filePaths) {
//   // Filter out duplicate file paths
//   const uniqueFilePaths = filePaths.filter(filePath => !allFilePaths.includes(filePath));

//   // Add unique file paths to the allFilePaths array
//   allFilePaths = [...allFilePaths, ...uniqueFilePaths];


//   // Clear previous results
//   const resultsElement = document.getElementById('results');
//   resultsElement.innerHTML = '';

//   // Loop through all file paths and add them to the results
//   allFilePaths.forEach(filePath => {
//     const songContainer = document.createElement('div');

//     songContainer.addEventListener('click', () => {
//       const trackListBox = document.getElementById('trackListContainer');
//   if (trackListBox.style.display === 'block') {
//     trackListBox.style.display = 'none';
//   } else {
//     trackListBox.style.display = 'block'
//   }
//     });
//     songContainer.className = 'musicbox';
//      const img = document.createElement('img');
//     img.id = 'art';
//     // img.src = ''; // Set the source of the image here, for example: img.src = 'path/to/image.jpg';
//     const title = document.createElement('p');
//     title.id ='title';
//     const alb = document.createElement('p');
//     alb.id = 'alb';
//     const artistsName = document.createElement('p');
//     artistsName.id = 'artistsName';

//     songContainer.appendChild(img);
// songContainer.appendChild(title);
// songContainer.appendChild(alb);
// songContainer.appendChild(artistsName);

// // Append the div to the resultsElement
// resultsElement.appendChild(songContainer);


//     // Create audio element for each song
//     const audio = document.createElement('audio');
//     const source = document.createElement('source');
//     audio.controls = false;
//     source.src = filePath;
//     audio.appendChild(source);
//     resultsElement.appendChild(audio);
    
//     // Read metadata using music-metadata
//     mm.parseFile(filePath).then(metadata => {


//       // updateNowPlayingInfo(metadata);

//       currentMetadata = metadata;
//       // console.log(metadata)

//       if (metadata.common.picture && metadata.common.picture.length > 0) {
//           const base64String = Buffer.from(metadata.common.picture[0].data).toString('base64');
//           img.src = `data:${metadata.common.picture[0].format};base64,${base64String}`;
//       } else {
//         img.src = './b.jpg';
//       }
//       title.textContent = metadata.common.title || 'Unknown Title';
//       alb.textContent = metadata.common.album || 'Unknown Album';
//       artistsName.textContent = metadata.common.artist || 'Unknown Artist';
//     }).catch(error => {
//       console.error('Error reading metadata:', error);
//   });
    
//     // Play the audio file when the associated image is click
    
//     img.addEventListener('click', () => {
      
      


//       if (currentlyPlayingAudio === audio) {
//         // If the clicked audio is already playing, pause it
//         if (audio.paused) {
//           audio.play();
//           // img.src = ''; // Set the play ico
//         } else {
//           audio.pause();
//           // img.src = ''; // Set the pause i
          
//         }
//       } else {
//         // Stop currently playing audio
//         if (currentlyPlayingAudio) {
//           currentlyPlayingAudio.pause();
//           // currentlyPlayingAudio.previousElementSibling.src = './b.jpg'; // Reset the icon of the previously playing song
//         }
//         // Play the clicked audio from the beginning
//         audio.currentTime = 0;
//         audio.play();
//         currentlyPlayingAudio = audio;
//         mm.parseFile(filePath).then(metadata => {
//           updateNowPlayingInfo(metadata);
//       }).catch(error => {
//           console.error('Error reading metadata:', error);
//       });
//       }
//     });


//   });
  
//   // Save all file paths to localStorage
//   localStorage.setItem('musicFilePaths', JSON.stringify(allFilePaths));
// }

// // Load file paths from localStorage when the app starts
// function loadSavedFilepaths() {
//   const savedFilePaths = localStorage.getItem('musicFilePaths');
//   if (savedFilePaths) {
//     allFilePaths = JSON.parse(savedFilePaths);
//     updateResults(allFilePaths); // Update the results with the loaded file path
//   }
// }

// // Call the function to load saved ile paths hen the app star
// loadSavedFilepaths();

// localStorage.clear();








// // Listen for the 'selected-files' event from the main proces

// ipcRenderer.on('selected-files', (event, filePaths) => {
//   updateResults(filePaths);
// });


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