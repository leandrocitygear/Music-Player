const { ipcRenderer } = require('electron')

// Event listener to open settings window when 'settings' elemnt is clicef
document.getElementById('settings').addEventListener('click', () => {
    console.log('Settings clicked');
  ipcRenderer.send('settings');
});
