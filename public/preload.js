const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,

  // Menu actions (receive from main process)
  onMenuAction: (channel, callback) => {
    const validChannels = ['menu-export-data', 'menu-import-data', 'menu-about'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },

  // Remove menu action listener
  removeMenuAction: (channel) => {
    const validChannels = ['menu-export-data', 'menu-import-data', 'menu-about'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },

  // Check if running in Electron
  isElectron: true,

  // App version
  appVersion: require('electron').remote?.app?.getVersion() || '1.0.0'
});

// Log that preload script has loaded
console.log('Electron preload script loaded successfully');
