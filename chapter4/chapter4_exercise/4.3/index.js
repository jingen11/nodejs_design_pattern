import fs from "fs";

function recursiveFindParallel(dir, keyword, cb) {
  let running = 0;
  const res = [];

  function lstat(path, cb) {
    fs.lstat(path, (err, stats) => {
      if (err) {
        return cb(err);
      }

      if (stats.isDirectory()) {
        readdir(path, cb);
      } else if (stats.isFile()) {
        readFile(path, keyword, cb);
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
        running++;
      }

      running--;
    });
  }

  function readFile(path, keyword, cb) {
    fs.readFile(path, "utf-8", (err, content) => {
      if (err) {
        return cb(err);
      }
      if (content.includes(keyword)) {
        res.push(path);
      }

      running--;

      if (running === 0) {
        return cb(null, res);
      }
    });
  }

  lstat(dir, cb);
  running++;
}

recursiveFindParallel("./grandparent", "baba", (err, res) => {
  console.log("parallel", res);
});

function recursiveFindLimitedPar(dir, keyword, concurrency, cb) {
  let running = 0;
  const reserved = [];
  const res = [];

  function next() {
    if (reserved.length === 0 && running === 0) return cb(null, res);

    while (running < concurrency && reserved.length) {
      const task = reserved.shift();

      task((err) => {
        if (err) {
          return cb(err);
        }

        running--;
        next();
      });

      running++;
    }
  }

  function lstat(path, cb) {
    fs.lstat(path, (err, stats) => {
      if (err) {
        return cb(err);
      }

      if (stats.isDirectory()) {
        reserved.push((cb) => readdir(path, cb));
      } else if (stats.isFile()) {
        reserved.push((cb) => readFile(path, keyword, cb));
      } else {
        return cb(new Error("sym link"));
      }

      cb();
    });
  }

  function readdir(path, cb) {
    fs.readdir(path, "utf-8", (err, files) => {
      if (err) {
        return cb(err);
      }

      for (const file of files) {
        reserved.push((cb) => lstat(`${path}/${file}`, cb));
      }

      cb();
    });
  }

  function readFile(path, keyword, cb) {
    fs.readFile(path, "utf-8", (err, content) => {
      if (err) {
        return cb(err);
      }
      if (content.includes(keyword)) {
        res.push(path);
      }

      cb();
    });
  }

  reserved.push((cb) => lstat(dir, cb));
  next();
}

recursiveFindLimitedPar("./grandparent", "baba", 2, (err, res) => {
  console.log("limited", res);
});

recursiveFindLimitedPar("./grandparent", "baba", 1, (err, res) => {
  console.log("limited 10", res);
});
