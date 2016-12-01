const os = require('os');

const helpers = require('./helpers.js');

exports.defaultTemplatesDir = function() {
  const platform = os.platform();
  const userHome = helpers.getUserHome();

  if (platform == 'win32') {
    return `${userHome}\\Documents\\Ableton\\User\ Templates`;
  } else if (platform == 'darwin') {
    const userHome = helpers.getUserHome();
    return `${userHome}/Music/Ableton/Templates`;
  }
};
