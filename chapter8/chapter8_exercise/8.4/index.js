// 8.4 Virtual filesystem: Modify our LevelDB filesystem adapter example to write the file data in memory rather than in LevelDB. You can use an object or a Map instance to store the key-value pairs of filenames and the associated data.

import { resolve } from "path";

function createFSAdapter() {
  const cache = {};

  return {
    readFile(filename, callback) {
      if (!filename in cache) {
        const err = new Error(`ENOENT, open "${filename}"`);
        err.code = "ENOENT";
        err.errno = 34;
        err.path = filename;

        return callback && callback(err);
      }

      callback && callback(null, cache[filename]);
    },
    writeFile(filename, contents, callback) {
      cache[filename] = contents;
      callback(null, cache[filename]);
    },
  };
}
