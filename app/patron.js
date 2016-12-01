const os = require('os');

const helpers = require('./helpers.js');

exports.defaultTemplatesDir = function() {
  var platform = os.platform()
  var arch = os.arch()
  var user_home = helpers.getUserHome();

  if (platform == 'win32') {
    return `${user_home}\\Documents\\Ableton\\User\ Templates`;
  } else if (platform == 'darwin') {
    var user_home = helpers.getUserHome();
    return `${user_home}/Music/Ableton/Templates`;
  }
}
