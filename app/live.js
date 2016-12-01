const os = require('os');
const path = require('path');

const {dialog} = require('electron');
const shell = require('shelljs');

const patron = require('./patron.js');
const helpers = require('./helpers.js');

exports.find = function(_platform, _arch) {
  const platform = _platform || os.platform();
  const arch = _arch || os.arch();

  if (platform == 'win32') {
    if (arch == 'x64') {
      return path.normalize('C:\\Program\ Files\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe');
    } else if (arch == 'x86') {
      return path.normalize('C:\\Program\ Files\ (x86)\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe');
    }
  } else if (platform == 'darwin') {
    return path.normalize('/Applications/Ableton Live 9 Suite.app');
  }
};


exports.run = function(_target, _platform, _arch) {
  const platform = _platform || os.platform();
  const arch = _arch || os.arch();
  const target = _target || '';
  const livePath = this.find(platform, arch);

  // FIXME: the case when running not handled platform has to be handled
  if (platform == 'win32') {
    return shell.exec(`\"${livePath}\" \"${target}\"`, {async: true});
  } else if (platform == 'darwin') {
    return shell.exec(`open -a \"${livePath}\" \"${target}\"`, {async: true});
  }
};

exports.openSet = function(liveSet) {
  const platform = os.platform();
  const arch = os.arch();

  return this.run(liveSet, platform, arch);
};

exports.useTemplate = function(template) {
  const templateProjectDir = path.dirname(template);
  const templateLiveSetName = path.basename(template);

  const destination = dialog.showSaveDialog({defaultPath: helpers.getUserHome()});
  if (typeof(destination) !== 'undefined') {
    shell.cp('-r', templateProjectDir, destination);

    const newLiveSetName = path.basename(destination);
    const newLiveSetPath = path.join(destination, newLiveSetName + '.als');
    shell.mv(path.join(destination, templateLiveSetName), newLiveSetPath);

    return [newLiveSetName, newLiveSetPath];
  }
};

exports.forkTemplate = function(srcTemplate) {
  let templateProjectDir = path.dirname(srcTemplate);
  let templateLiveSetName = path.basename(srcTemplate);

  // FIXME: What if the user places the template somewhere else on the FS?
  // We should still keep track of it. Time to introduce a DB of some sort (file?)?
  const destination = dialog.showSaveDialog({defaultPath: patron.defaultTemplatesDir()});
  if (typeof(destination) !== 'undefined') {
    shell.cp('-r', templateProjectDir, destination);

    const newLiveSetName = path.basename(destination);
    const newLiveSetPath = path.join(destination, newLiveSetName + '.als');
    shell.mv(path.join(destination, templateLiveSetName), newLiveSetPath);

    return [newLiveSetName, newLiveSetPath];
  }
};
