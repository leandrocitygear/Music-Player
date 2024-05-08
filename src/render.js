const { ipcRenderer } = require('electron');
const mm = require('music-metadata');

const addFiles = document.getElementById('settings');

addFiles.onclick = () => {
ipcRenderer.send('open-file-dialog');
};

document.getElementById('menu').addEventListener('click', () => {
const nav = document.getElementById('navigation');
if (nav.style.display === "block") {
  nav.style.display = 'none';
} else {
  nav.style.display = 'block';
}
});


let allFilePaths = [];
let currentlyPlayingAudio = null;
// console.log(allFilePaths)

function updateNowPlayingInfo(metadata) {
  const nowPlayingArt = document.getElementsByClassName('albumArt')[0];
  const artName = document.getElementsByClassName('artName')[0];
  const albumName = document.getElementsByClassName('albumName')[0];
  const songName = document.getElementsByClassName('songName')[0];
  const background = document.getElementById('background');
  
  // Update album art
  if (metadata.common.picture && metadata.common.picture.length > 0) {
    const base64String = Buffer.from(metadata.common.picture[0].data).toString('base64');
    const imageUrl = `data:${metadata.common.picture[0].format};base64,${base64String}`;
    nowPlayingArt.src = imageUrl;
    background.style.backgroundImage = `url(${imageUrl})`;
  } else {
    nowPlayingArt.src = './b.jpg';
    background.style.backgroundImage = `url(./b.jpg)`;
  }
  
  // Update song information
  artName.textContent = metadata.common.artist || 'Unknown Artist';
  albumName.textContent = metadata.common.album || 'Unknown Album';
  songName.textContent = metadata.common.title || 'Unknown Title';
}



let currentMetadata;

function updateResults(filePaths) {
  // Filter out duplicate file paths
  const uniqueFilePaths = filePaths.filter(filePath => !allFilePaths.includes(filePath));

  // Add unique file paths to the allFilePaths array
  allFilePaths = [...allFilePaths, ...uniqueFilePaths];


  // Clear previous results
  const resultsElement = document.getElementById('results');
  resultsElement.innerHTML = '';

  // Loop through all file paths and add them to the results
  allFilePaths.forEach(filePath => {
    const songContainer = document.createElement('div');
    songContainer.className = 'songContainer';
     const img = document.createElement('img');
    img.id = 'art';
    // img.src = ''; // Set the source of the image here, for example: img.src = 'path/to/image.jpg';
    const title = document.createElement('p');
    title.id ='title';
    const alb = document.createElement('p');
    alb.id = 'alb';
    const artistsName = document.createElement('p');
    artistsName.id = 'artistsName';

    songContainer.appendChild(img);
songContainer.appendChild(title);
songContainer.appendChild(alb);
songContainer.appendChild(artistsName);

// Append the div to the resultsElement
resultsElement.appendChild(songContainer);


    // Create audio element for each song
    const audio = document.createElement('audio');
    const source = document.createElement('source');
    audio.controls = false;
    source.src = filePath;
    audio.appendChild(source);
    resultsElement.appendChild(audio);
    
    // Read metadata using music-metadata
    mm.parseFile(filePath).then(metadata => {


      // updateNowPlayingInfo(metadata);

      currentMetadata = metadata;
      // console.log(metadata)

      if (metadata.common.picture && metadata.common.picture.length > 0) {
          const base64String = Buffer.from(metadata.common.picture[0].data).toString('base64');
          img.src = `data:${metadata.common.picture[0].format};base64,${base64String}`;
      } else {
        img.src = './b.jpg';
      }
      title.textContent = metadata.common.title || 'Unknown Title';
      alb.textContent = metadata.common.album || 'Unknown Album';
      artistsName.textContent = metadata.common.artist || 'Unknown Artist';
    }).catch(error => {
      console.error('Error reading metadata:', error);
  });
    
    // Play the audio file when the associated image is click
    
    img.addEventListener('click', () => {
      
      


      if (currentlyPlayingAudio === audio) {
        // If the clicked audio is already playing, pause it
        if (audio.paused) {
          audio.play();
          // img.src = ''; // Set the play ico
        } else {
          audio.pause();
          // img.src = ''; // Set the pause i
          
        }
      } else {
        // Stop currently playing audio
        if (currentlyPlayingAudio) {
          currentlyPlayingAudio.pause();
          // currentlyPlayingAudio.previousElementSibling.src = './b.jpg'; // Reset the icon of the previously playing song
        }
        // Play the clicked audio from the beginning
        audio.currentTime = 0;
        audio.play();
        currentlyPlayingAudio = audio;
        mm.parseFile(filePath).then(metadata => {
          updateNowPlayingInfo(metadata);
      }).catch(error => {
          console.error('Error reading metadata:', error);
      });
      }
    });


  });
  
  // Save all file paths to localStorage
  localStorage.setItem('musicFilePaths', JSON.stringify(allFilePaths));
}

// Load file paths from localStorage when the app starts
function loadSavedFilepaths() {
  const savedFilePaths = localStorage.getItem('musicFilePaths');
  if (savedFilePaths) {
    allFilePaths = JSON.parse(savedFilePaths);
    updateResults(allFilePaths); // Update the results with the loaded file path
  }
}

// Call the function to load saved ile paths hen the app star
loadSavedFilepaths();

// localStorage.clear();








// Listen for the 'selected-files' event from the main proces

ipcRenderer.on('selected-files', (event, filePaths) => {
  updateResults(filePaths);
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