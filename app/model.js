'use strict';

/**
 *
 */
export default class Template {
  /**
   * Template constructor
   * @param {String} name - The name value.
   * @param {String} path - The path value.
   */
  constructor(name, path) {
    this.name = name;
    this.path = path;
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
   * Converts the template to a JSON object
   * @return {Object}
   */
  toJSON() {
    return {
      name: this.name,
      path: this.path,
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  };
};
