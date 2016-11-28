'use strict';

const electron = require('electron');
const {ipcMain} = require('electron');
const os = require('os');
const path = require('path');
require('shelljs/global');
require('electron-debug')({showDevTools: true});

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 400, height: 600 });
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

function findLive(platform, arch) {
  var platform = platform || os.platform();
  var arch = arch || os.arch();

  if (platform == 'win32') {
    if (arch == 'x64')
      return 'C:\\Program\ Files\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe';
    else if (arch == 'x86')
      return 'C:\\Program\ Files\ (x86)\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe';
  else if (platform == 'darwin')
    return '/Applications/Ableton\\ Live\\ 9\\ Suite.app';
  }
}

function runLive(target) {
  var platform = os.platform()
  var arch = os.arch()

  var live_path = path.normalize(findLive(platform, arch))

  // FIXME: the case when running not handled platform has to be handled
  if (platform == 'win32') {
    console.log(`Running \"${live_path}\" \"${target}\"`)
    return exec(`\"${live_path}\" \"${target}\"`, {async: true})
  } else if (platform == 'darwin', {async: true}) {
    return exec(`open -a ${live_path} ${target}`)
  }
}

ipcMain.on('asynchronous-message', (event, arg) => {
  if (arg.action === 'ping') {
    event.sender.send('asynchronous-reply', {action: 'pong'})
  } else if (arg.action === 'open') {
      // FIXME: need to check the existence of the file!
      runLive(path.normalize(arg.args[0]))
      event.sender.send('asynchronous-reply', {status: 'OK'})
  }
})

ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = {action: 'pong'}
})
