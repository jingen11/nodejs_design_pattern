// chapter 3 callbacks and events
// === Start Zalgo ===
import { readFile } from "fs";

const cache = new Map();

function inconsistentRead(filename, cb) {
  if (cache.has(filename)) {
    cb(cache.get(filename));
  } else {
    readFile(filename, "utf-8", (err, data) => {
      cache.set(filename, data);
      cb(data);
    });
  }
}
// can be fix by using synchronous api
// add process.nextTick() to defer the execution

function consistentReadAsync(filename, cb) {
  if (cache.has(filename)) {
    process.nextTick(() => cb(cache.get(filename)));
  } else {
    readFile(filename, "utf-8", (err, data) => {
      cache.set(filename, data);
      cb(data);
    });
  }
}

function createFileReader(filename) {
  const listeners = [];
  // inconsistentRead(filename, (value) => {
  //   listeners.forEach((listener) => listener(value));
  // });
  consistentReadAsync(filename, (value) => {
    listeners.forEach((listener) => listener(value));
  });

  return {
    onDataReady: (listener) => listeners.push(listener),
  };
}

const reader1 = createFileReader("./nodejs_design_patterns.js");

reader1.onDataReady((value) => {
  console.log("first call data:");

  // sometime later, cache has the same file
  // unleasing Zalgo

  const reader2 = createFileReader("./nodejs_design_patterns.js");

  reader2.onDataReady((value) => {
    console.log("second call data:");
  });
});

// === End Zalgo ===

// === Start async CPS errors ===

function readJson(filename, callback) {
  readFile(filename, "utf-8", (err, data) => {
    let parsed;
    if (err) {
      return callback(err);
    }

    try {
      parsed = JSON.parse(data);
    } catch (error) {
      return callback(err);
    }
    // dont put callback in try block as the error throw by the callback will be caught
    callback(null, parsed);
  });
}

function readJsonThrows(filename, callback) {
  readFile(filename, "utf-8", (err, data) => {
    if (err) {
      return callback(err);
    }
    callback(null, JSON.parse(data));
  });
}
try {
  readJsonThrows("./nodejs_design_patterns.js", (err) => console.error(err));
} catch (error) {
  // will not work, callback call stack is the event loop, not the function triggering the async ops
}

// === End async CPS errors ===

// === Observer pattern ===

import { EventEmitter } from "events";

function findRegex(files, regex) {
  const emitter = new EventEmitter();
  for (const file of files) {
    readFile(file, "utf-8", (err, content) => {
      if (err) {
        return emitter.emit("error", err);
      }

      emitter.emit("fileread", file);

      const match = content.match(regex);
      if (match) {
        match.forEach((ele) => emitter.emit("found", file, ele));
      }
    });
  }
  return emitter;
}

findRegex(["fileA.txt", "fileB.json"], /hello \w+/g)
  .on("fileread", (file) => console.log(`${file} was read`))
  .on("found", (file, match) => console.log(`<atched "${match}" in ${file}`))
  .on("error", (err) => console.error(`Error emitted ${err.message}`));

// === End Observer pattern ===
import { EventEmitter } from "events";
import { readFile } from "fs";
// 3.1
class FindRegex extends EventEmitter {
  constructor(regex) {
    super();
    this.regex = regex;
    this.files = [];
  }

  addFile(file) {
    this.files.push(file);
    return this;
  }

  find() {
    process.nextTick(() => {
      this.emit("start", this.files);
    });

    for (const file of this.files) {
      readFile(file, "utf-8", (err, content) => {
        if (err) {
          return this.emit("error", err);
        }

        this.emit("fileread", file);

        const match = content.match(this.regex);

        if (match) {
          match.forEach((elem) => this.emit("found", file, elem));
        }
      });
    }

    return this;
  }
}

// 3.2
function ticker(num, cb) {
  let count = 0;
  const emitter = new EventEmitter();

  function tick() {
    if (count * 50 >= num) {
      return cb(null, count);
    }

    setTimeout(() => {
      const now = Date.now();

      // 3.4
      if (now % 5 === 0) {
        cb(new Error("now divisbile by 5"));
        return emitter.emit("error", new Error("now divisbile by 5"));
      }

      emitter.emit("tick");
      count++;
      tick();
    }, 50);
  }

  tick();
  // 3.3
  process.nextTick(() => {
    const now = Date.now();
    // 3.4
    if (now % 5 === 0) {
      cb(new Error("now divisbile by 5"));
      return emitter.emit("error", new Error("now divisbile by 5"));
    }
    emitter.emit("tick");
  });

  return emitter;
}

ticker(500, (err, count) => console.log(err, count))
  .on("tick", () => {
    console.log("tick");
  })
  .on("error", (err) => console.log(err));
