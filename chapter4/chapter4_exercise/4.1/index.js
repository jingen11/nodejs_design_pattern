import fs from "fs";

function concatFiles(...args) {
  const cb = args.pop();
  const dest = args.pop();

  function iterate() {
    if (args.length === 0) {
      return cb();
    }

    const src = args.shift();

    fs.readFile(src, "utf-8", (err, content) => {
      if (err) {
        return cb(err);
      }
      fs.appendFile(dest, content, (err) => {
        if (err) {
          return cb(err);
        }

        iterate();
      });
    });
  }

  iterate();
}

concatFiles("test1.txt", "test2.txt", "test3.txt", "res.txt", (err) => {
  console.log(err);
});
