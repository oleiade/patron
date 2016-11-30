const process_ = require('process');


exports.getUserHome = function() {
  return process_.env[(process_.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
