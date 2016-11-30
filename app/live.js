const os = require('os');
const path = require('path');

const shell = require('shelljs');


exports.find = function(platform, arch) {
  var platform = platform || os.platform();
  var arch = arch || os.arch();

  if (platform == 'win32') {
    if (arch == 'x64')
      return 'C:\\Program\ Files\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe';
    else if (arch == 'x86')
      return 'C:\\Program\ Files\ (x86)\\Ableton\\Ableton\ Live\ 9\ Suite\\Program\\Ableton\ Live\ 9\ Suite.exe';
  }
  else if (platform == 'darwin')
    return '/Applications/Ableton Live 9 Suite.app';
}


exports.run = function(target) {
  var platform = os.platform()
  var arch = os.arch()

  var live_path = path.normalize(this.find(platform, arch))

  // FIXME: the case when running not handled platform has to be handled
  if (platform == 'win32') {
    return shell.exec(`\"${live_path}\" \"${target}\"`, {async: true})
  } else if (platform == 'darwin', {async: true}) {
    return shell.exec(`open -a \"${live_path}\" \"${target}\"`)
  }
}
