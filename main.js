'use strict';

const electron = require('electron');
const {ipcMain,dialog} = require('electron');

const os = require('os');
const fs = require('fs');
const path = require('path');
const processl = require('process');
const file = require('file');
const _ = require('lodash');
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

function getUserHome() {
  return processl.env[(processl.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

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

function templatesDir() {
  var platform = os.platform()
  var arch = os.arch()

  if (platform == 'win32') {
    return 'C:\\Users\\oleia\\Documents\\Ableton\\User\ Templates';
  } else if (platform == 'darwin') {
    var user_home = getUserHome();
    return `${user_home}/Music/Ableton/Templates`;
  }
}

ipcMain.on('list-request', (event, arg) => {
  console.log('[async] list-request received');
  var templates = []
  var templates_dir = templatesDir()

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

  file.walkSync(templates_dir, function(dirPath, dirs, files) {
      var live_sets = _.dropWhile(files, function(f) { return path.extname(f) != '.als'});
      _.forEach(live_sets, function(ls) {
        templates.push({
          name: path.basename(ls, '.als'),
          path: path.join(dirPath, ls)
        })
      })
  });

  event.sender.send('list-reply', {
    status: 'OK',
    data: templates
  })
});

ipcMain.on('create-live-set-request', (event, arg) => {
  console.log('create-live-set-request received')
  console.log(arg)

  var template_path = arg.args[0];
  var template_project_dir = path.dirname(template_path);
  var template_live_set_name = path.basename(template_path);

  var destination = dialog.showSaveDialog({});
  if (typeof(destination) !== 'undefined') {
    cp('-r', template_project_dir, destination);

    var new_live_set_name = path.basename(destination)
    mv(path.join(destination, template_live_set_name), path.join(destination, new_live_set_name + '.als'))
  }

  event.sender.send('create-live-set-reply', {status: 'OK'})
});


ipcMain.on('create-template-request', (event, arg) => {
  console.log('create-template-request received')
  console.log(arg)

  var template_path = arg.args[0];
  var template_project_dir = path.dirname(template_path);
  var template_live_set_name = path.basename(template_path);

  // FIXME: What if the user places the template somewhere else on the FS?
  // We should still keep track of it. Time to introduce a DB of some sort (file?)?
  var destination = dialog.showSaveDialog({defaultPath: templatesDir()});
  if (typeof(destination) !== 'undefined') {
    cp('-r', template_project_dir, destination);

    var new_live_set_name = path.basename(destination);
    var new_live_set_path = path.join(destination, new_live_set_name + '.als');
    mv(path.join(destination, template_live_set_name), new_live_set_path)

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
  }
});

ipcMain.on('open-request', (event, arg) => {
  console.log('[async] open-request sent')
  // FIXME: need to check the existence of the file!
  runLive(path.normalize(arg.args[0]))

  event.sender.send('open-reply', {status: 'OK'});
  console.log('[async] open-reply sent')
})
