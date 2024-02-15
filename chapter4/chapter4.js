import fs from "fs";
import path from "path";
import superagent from "superagent";
import mkdirp from "mkdirp";
import { urlToFilename } from "./utils.js";

function spider(url, cb) {
  const filename = urlToFilename(url);

  fs.access(filename, (err) => {
    if (!err || err.code !== "ENOENT") {
      return cb(null, filename, false); // principle 1: return early
    }
    download(url, filename, (err) => {
      if (err) return cb(err);
      cb(null, filename, true);
    });
  });
}
// principle 2: create named functions for callbacks
function saveFile(filename, contents, cb) {
  mkdirp(path.dirname(filename), (err) => {
    if (err) {
      return cb(err);
    }
    fs.writeFile(filename, contents, cb);
  });
}

function download(url, filename, cb) {
  console.log(`Downloading ${url}`);
  superagent.get(url).end((err, res) => {
    if (err) {
      return cb(err);
    }
    saveFile(filename, res.text, (err) => {
      // principle 3: modularize the code
      if (err) {
        return cb(err);
      }

      console.log(`Downloaded and saved: ${url}`);
      cb(null, res.text);
    });
  });
}
// sequential execution
function spiderV2(url, nesting, done) {
  const filename = urlToFilename(url);

  fs.readFile(filename, "utf-8", (err, fileContent) => {
    if (err) {
      if (err.code !== "ENOENT") {
        return done(err);
      }

      return download(url, filename, (err, requestContent) => {
        if (err) {
          return done(err);
        }

        spiderLinks(url, requestContent, nesting, done);
      });
    }

    spiderLinks(url, fileContent, nesting, done);
  });
}

function spiderLinks(currentUrl, body, nesting, done) {
  if (nesting === 0) {
    return process.nextTick(done);
  }

  const links = getPageLinks(currentUrl, body);

  if (links.length === 0) {
    return process.nextTick(done);
  }

  function iterate(index) {
    if (index === links.length) {
      return done();
    }

    spiderV2(links[index], nesting - 1, function (err) {
      if (err) {
        return done(err);
      }

      iterate(index + 1);
    });
  }

  iterate(0);
}

// sequential execution pattern
function iterate(index) {
  if (index === tasks.length) {
    return finish();
  }

  const task = tasks[index];
  task(() => iterate(index + 1));
}

function finish() {}

iterate(0);

function iterateSeries(collection, iteratorCb, finalCb) {
  function iterate(index) {
    if (index === collection.length) {
      return process.nextTick(finalCb);
    }

    const task = collection[index];
    task((err) => {
      if (err) {
        return finalCb(err);
      }
      iteratorCb();
      iterate(index + 1);
    });
  }

  iterate(0);
}

// parallel execution
function spiderLinksV2(currentUrl, body, nesting, done) {
  if (nesting === 0) {
    return process.nextTick(done);
  }

  const links = getPageLinks(currentUrl, body);

  if (links.length === 0) {
    return process.nextTick(done);
  }

  let completed = 0;
  let hasErrors = false;

  function done(err) {
    if (err) {
      hasErrors = true;
      return done(err);
    }

    if (++completed === links.length && !hasErrors) {
      return done();
    }
  }

  links.forEach((link) => spiderV2(link, nesting - 1, done));
}

// parallel execution pattern
const tasks = [];

let completed = 0;
tasks.forEach((task) => {
  task(() => {
    if (++completed === tasks.length) {
      finish();
    }
  });
});

// limiting concurrency
function next() {
  while (running < concurrency && index < tasks.length) {
    const task = task[index++];
    task(() => {
      if (++completed === tasks.length) {
        return finish();
      }
      running--;
      next();
    });
    running++;
  }
}
next();

// queue
import { EventEmitter } from "stream";

class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super();
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  pushTask(task) {
    this.queue.push(task);
    process.nextTick(this.next.bind(this));
    return this;
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit("empty");
    }
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      task((err) => {
        // this is the part for done in line 269
        if (err) {
          this.emit("error", err);
        }
        this.running--;
        process.nextTick(this.next.bind(this));
      });

      this.running++;
    }
  }
}

function spiderTask(url, nesting, queue, cb) {
  const filename = urlToFilename(url);

  fs.readFile(filename, "utf-8", (err, fileContent) => {
    if (err) {
      if (err.code !== "ENOENT") {
        return cb(err);
      }
      return download(url, filename, (err, requestContent) => {
        if (err) {
          return cb(err);
        }

        spiderLinksV3(url, requestContent, nesting, queue);
        return cb();
      });
    }

    spiderLinksV3(url, fileContent, nesting, queue);
    return cb();
  });
}

function spiderLinksV3(currentUrl, body, nesting, queue) {
  if (nesting === 0) {
    return;
  }

  const links = getPageLinks(currentUrl, body);

  if (links.length === 0) {
    return;
  }

  links.forEach((link) => spider(link, nesting - 1, queue));
}

const spidering = new Set();
// entry point
function spider(url, nesting, queue) {
  if (spidering.has(url)) {
    return;
  }

  spidering.add(url);
  queue.pushTask((done) => {
    spiderTask(url, nesting, queue, done);
  });
}
