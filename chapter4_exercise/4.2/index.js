import fs from "fs";

function listNestedFiles(dir, cb) {
  const stack = [dir];
  const res = [];

  function next(cb) {
    if (stack.length === 0) {
      return cb(null, res);
    }

    const path = stack.shift();

    lstat(path, cb);
  }

  function lstat(path, cb) {
    fs.lstat(path, (err, stats) => {
      if (err) {
        return cb(err);
      }

      if (stats.isDirectory()) {
        readdir(path, cb);
      } else if (stats.isFile()) {
        res.push(path);

        next(cb);
      }
    });
  }

  function readdir(path, cb) {
    fs.readdir(path, "utf-8", (err, files) => {
      if (err) {
        return cb(err);
      }

      for (const file of files) {
        stack.push(`${path}/${file}`);
      }
      next(cb);
    });
  }

  next(cb);
}

listNestedFiles("./grandparent", (err, res) => {
  console.log("series", res);
});

function listNestedFilesParallel(dir, cb) {
  let running = 0;
  const res = [];

  function lstat(path, cb) {
    running++;
    fs.lstat(path, (err, stats) => {
      if (err) {
        return cb(err);
      }

      if (stats.isDirectory()) {
        readdir(path, cb);
      } else if (stats.isFile()) {
        res.push(path);

        running--;
        if (running === 0) return cb(null, res);
      } else {
        return cb(new Error("sym link"));
      }
    });
  }

  function readdir(path, cb) {
    fs.readdir(path, "utf-8", (err, files) => {
      if (err) {
        return cb(err);
      }

      for (const file of files) {
        lstat(`${path}/${file}`, cb);
      }

      running--;
    });
  }

  lstat(dir, cb);
}

listNestedFilesParallel("./grandparent", (err, res) => {
  console.log("parallel", res);
});
