'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const walkSync = require('walk-sync');

const Template = require('./model/template.js');

exports.list = function(templatesDir) {
  try {
    fs.accessSync(templatesDir);
  } catch (err) {
    // FIXME: should probably create it if does not exist
    return [];
  }

  let liveSets = walkSync(templatesDir, {globs: ['**/*.als'], directories: false});

  return _.map(liveSets, function(ls) {
    return new Template(path.join(templatesDir, ls)).toObject();
    // return {
    //   name: path.basename(ls, '.als'),
    //   path: path.join(templatesDir, ls),
    // };
  });
};
