const { ipcRenderer } = require('electron');
// const mainWindow = ipcRenderer.getCurrentWindow();

// console.log(dialog)

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
    const img = document.createElement('img');
    img.className = 'art';
    img.src = './b.jpg'; // Set the source of the image here, for example: img.src = 'path/to/image.jpg';
    resultsElement.appendChild(img);
    
    // Create audio element for each song
    const audio = document.createElement('audio');
    const source = document.createElement('source');
    audio.controls = false;
    source.src = filePath;
    audio.appendChild(source);
    resultsElement.appendChild(audio);

    // Play the audio file when the associated image is clicked
    let isPlaying = false;
    img.addEventListener('click', () => {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      isPlaying = !isPlaying; // Toggle the isPlaying flag
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

// Call the function to load saved file paths hen the app starts
loadSavedFilepaths();








// Listen for the 'selected-files' event from the main process
ipcRenderer.on('selected-files', (event, filePaths) => {
  updateResults(filePaths);
});

