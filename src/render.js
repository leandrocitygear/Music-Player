const { ipcRenderer } = require('electron')

// Event listener to open setings window when 'settings' elemnt is cl
document.getElementById('settings').addEventListener('click', () => {
    console.log('Settings clicked');
  ipcRenderer.send('settings');
});

document.getElementById('menu').addEventListener('click', () => {
const nav = document.getElementById('navigation');
if (nav.style.display === "block") {
  nav.style.display = 'none';
} else {
  nav.style.display = 'block';
}
});