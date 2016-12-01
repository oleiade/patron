const os = require('os');
const path = require('path');

const {dialog} = require('electron');
const shell = require('shelljs');

const patron = require('./patron.js');
const helpers = require('./helpers.js');

exports.find = function(platform, arch) {
  var platform = platform || os.platform();
  var arch = arch || os.arch();
  var live_path = "";

  if (platform == 'win32') {
    if (arch == 'x64')
      live_path = 'C:\\Program\ Files\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe';
    else if (arch == 'x86')
      live_path = 'C:\\Program\ Files\ (x86)\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe';
  }
  else if (platform == 'darwin')
    live_path = '/Applications/Ableton Live 9 Suite.app';

  return path.normalize(live_path);
}


exports.run = function(target, platform, arch) {
  var platform = platform || os.platform();
  var arch = arch || os.arch();
  var target = target || "";

  var live_path = this.find(platform, arch);

  // FIXME: the case when running not handled platform has to be handled
  if (platform == 'win32') {
    return shell.exec(`\"${live_path}\" \"${target}\"`, {async: true});
  } else if (platform == 'darwin') {
    return shell.exec(`open -a \"${live_path}\" \"${target}\"`, {async: true});
  }
}

exports.openSet = function(liveSet) {
  var platform = os.platform();
  var arch = os.arch();

  return this.run(liveSet, platform, arch);
}

exports.useTemplate = function(template) {
  var template_project_dir = path.dirname(template);
  var template_live_set_name = path.basename(template);

  var destination = dialog.showSaveDialog({defaultPath: helpers.getUserHome()});
  if (typeof(destination) !== 'undefined') {
    shell.cp('-r', template_project_dir, destination);

    var new_live_set_name = path.basename(destination);
    var new_live_set_path = path.join(destination, new_live_set_name + '.als');
    shell.mv(path.join(destination, template_live_set_name), new_live_set_path);
  }

  return [new_live_set_name, new_live_set_path];
}

exports.forkTemplate = function(srcTemplate) {
  var template_project_dir = path.dirname(srcTemplate);
  var template_live_set_name = path.basename(srcTemplate);

  var new_list_set_name = "";
  var new_list_set_path = "";

  // FIXME: What if the user places the template somewhere else on the FS?
  // We should still keep track of it. Time to introduce a DB of some sort (file?)?
  var destination = dialog.showSaveDialog({defaultPath: patron.defaultTemplatesDir()});
  if (typeof(destination) !== 'undefined') {
    shell.cp('-r', template_project_dir, destination);

    var new_live_set_name = path.basename(destination);
    var new_live_set_path = path.join(destination, new_live_set_name + '.als');
    shell.mv(path.join(destination, template_live_set_name), new_live_set_path);
  }

  return [new_live_set_name, new_live_set_path];
}
