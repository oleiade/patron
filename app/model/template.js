'use strict';

const path = require('path');

/**
 *
 */
class Template {
  /**
   * Template constructor
   * @param {String} path_ - The path value.
   */
  constructor(path_) {
    this.path = path_;
    this.name = path.basename(path_, '.als');
    this.createdAt = Date.now();
    this.modifiedAt = -1;
  }

  /**
   * Checks if Template exists on FS
   * @return {Boolean}
   */
  exists() {
    try {
      fs.accessSync(templatesDir);
    } catch (err) {
      return false;
    }

    return true;
  };

  /**
   * @return {String}
   */
  projectDir() {
    return path.dirname(this.path);
  }

  /**
   * @return {String}
   */
  filename() {
    return path.basename(this.path);
  }

  /**
   * Converts the template to an object
   * @return {Object}
   */
  toObject() {
    return {
      name: this.name,
      path: this.path,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  };
};

module.exports = Template;
