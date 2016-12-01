'use strict';

// Electron libraries
const electron = require('electron');
const {ipcMain,dialog} = require('electron');
// require('electron-debug')({showDevTools: true});

// Node native libraries
const fs = require('fs');
const file = require('file');
const path = require('path');

// Third party libraries
const _ = require('lodash');
const walkSync = require('walk-sync');
const shell = require('shelljs');

const live = require('./app/live.js');
const patron = require('./app/patron.js');


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


ipcMain.on('list-request', (event, arg) => {
  console.log('[async] list-request received');
  var templates = []
  var templates_dir = patron.defaultTemplatesDir()

  try {
    fs.accessSync(templates_dir);
  } catch (err) {
    // FIXME: should probably create it if does not exist
    event.sender.send('list-reply', {
      status: 'KO',
      err: 'notfound',
      err_msg: `templates folder ${templates_dir} does not exist`
    })
  }

  var live_sets = walkSync(templates_dir, {globs: ["**/*.als"], directories: false});
  _.forEach(live_sets, function(ls) {
    templates.push({
      name: path.basename(ls, '.als'),
      path: path.join(templates_dir, ls)
    })
  });


  event.sender.send('list-reply', {
    status: 'OK',
    data: templates
  })
});

ipcMain.on('create-live-set-request', (event, arg) => {
  console.log('create-live-set-request received')

  var [new_live_set_name, new_live_set_path] = live.useTemplate(arg.args[0]);

  event.sender.send('create-live-set-reply', {status: 'OK'})
});


ipcMain.on('create-template-request', (event, arg) => {
  console.log('create-template-request received')

  var [new_live_set_name, new_live_set_path] = live.forkTemplate(arg.args[0]);

  // FIXME: We should eventually return the whole list of templates,
  // at the moment we only send back the created one and let the Elm
  // frontend append to its model by itself.
  event.sender.send('create-template-reply', {
    status: 'OK',
    data: [
      { name: new_live_set_name,
        path: new_live_set_path
      }
    ]
  });
});

ipcMain.on('open-request', (event, arg) => {
  console.log('[async] open-request sent')

  // FIXME: need to check the existence of the file!
  live.run(path.normalize(arg.args[0]))

  event.sender.send('open-reply', {status: 'OK'});
  console.log('[async] open-reply sent')
})
