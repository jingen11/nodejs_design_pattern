const a = await new Promise((resolve) => {
  setTimeout(() => {
    resolve(12);
  }, 1000);
})
  .then((res) => {
    // val
    console.log(res);

    return 11;
  })
  .then((res) => {
    // promise
    console.log(res);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(10);
      }, 2000);
    });
  })
  .then((res) => {
    // reject
    console.log(res);
    throw new Error("uncaught1");
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(123);
      }, 1000);
    });
  })
  .then(null, (err) => {
    console.log(err);
  })
  .finally(() => {
    console.log("finally");
    throw new Error("uncaught");
  })
  .then(null, (err) => {
    console.log(err);

    console.log("caught");
  })
  .finally(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(9);
      }, 2000);
    });
  })
  .then(null, (err) => {
    console.log(err);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(8);
      }, 2000);
    });
  })
  .finally(() => {
    return 7;
  });

console.log(a); // return 8

//Promise returned by finally will settle with the sane fulfillment value or rejection reason of the current promise instance.
// Exception for returning rejected Promise and throwing error in onFinally

// Sequential Execution
import { promises as fsPromises } from "fs";
import { dirname } from "path";
import superagent from "superagent";
import mkdirp from "mkdirp";
import { urlToFilename } from "./utils.js";
import { promisify } from "util";

const mkdirpPromises = promisify(mkdirp);

function download(url, filename) {
  console.log(`Downloading ${url}`);
  let content;

  return superagent
    .get(url)
    .then((res) => {
      content = res.text;
      return mkdirpPromises(dirname(filename));
    })
    .then(() => fsPromises.writeFile(filename, content))
    .then(() => {
      console.log(`Downloaded and saved: ${url}`);
      return content;
    });
}

function spiderLinks(currentUrl, body, nesting) {
  let promise = Promise.resolve();

  if (nesting === 0) {
    return promise;
  }

  const links = getPageLinks(currentUrl, body);

  for (const link of links) {
    promise = promise.then(() => spider(link, nesting - 1));
  }

  return promise;
}

function spider(url, nesting) {
  const filename = urlToFilename(url);

  return fsPromises
    .readFile(filename, "utf-8")
    .catch((e) => {
      if (e.code !== "ENOENT") {
        throw e;
      }

      return download(url, filename);
    })
    .then((content) => {
      spiderLinks(url, content, nesting);
    });
}

// Parallel Execution
function spiderLinksV2(currentUrl, body, nesting) {
  if (nesting === 0) {
    return Promise.resolve();
  }

  const links = getPageLinks(currentUrl, body);

  const promises = links.map((link) => spider(link, nesting - 1));

  return Promise.all(promises);
}

// queue
import { EventEmitter } from "stream";

class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super();
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      this.queue.push(() => {
        return task().then(resolve, reject);
      });

      process.nextTick(this.next.bind(this));
    });
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit("empty");
    }
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      task().finally(() => {
        this.running--;
        this.next();
      });

      this.running++;
    }
  }
}

function spiderLinksV3(currentUrl, content, nesting, queue) {
  if (nesting === 0) return Promise.resolve();

  const links = getPageLinks(currentUrl, content);

  const promises = links.map((link) => spiderTask(link, nesting - 1, queue));

  return Promise.all(promises);
}

const spidering = new Set();

function spiderTask(url, nesting, queue) {
  if (spidering.has(url)) {
    return Promise.resolve();
  }

  spidering.add(url);

  const filename = urlToFilename(url);

  return queue.runTask(() => {
    return fsPromises
      .readFile(filename, "utf-8")
      .catch((err) => {
        if (err.code === "ENOENT") {
          throw err;
        }

        return download(url, filename);
      })
      .then((content) => spiderLinksV3(url, content, nesting, queue));
  });
}

function spiderV2(url, nesting, concurrency) {
  const queue = new TaskQueue(concurrency);

  return spiderTask(url, nesting, queue);
}

// async serial execution
async function download(url, filename) {
  console.log(`Downloading ${url}`);

  const { text: content } = await superagent.get(url);
  await mkdirpPromises(dirname(filename));
  await fsPromises.writeFile(filename, content);
  console.log(`Downloaded and saved: ${url}`);
  return content;
}

async function spiderLinks(currentUrl, body, nesting) {
  if (nesting === 0) {
    return;
  }

  const links = getPageLinks(currentUrl, body);

  for (const link of links) {
    await spider(link, nesting - 1);
  }
}

async function spider(url, nesting) {
  const filename = urlToFilename(url);

  let content;

  try {
    content = await fsPromises.readFile(filename, "utf-8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    content = await download(url, filename);
  }

  return spiderLinks(url, content, nesting);
}

// async parallel execution
async function spiderLinks(currentUrl, body, nesting) {
  if (nesting === 0) {
    return;
  }

  const links = getPageLinks(currentUrl, body);

  const promises = links.map((link) => spider(link, nesting - 1));

  // for (const promise of promises) {
  //   await promise;
  // }

  // optimal
  return Promise.all(promises);
}

// async limited parallel execution
class TaskQueuePC {
  constructor(concurrency) {
    this.taskQueue = [];
    this.consumerQueue = [];

    // spawn consumer
    for (let i = 0; i < concurrency; i++) {
      this.consumer();
    }
  }

  async consumer() {
    while (true) {
      try {
        const task = await this.getNextTask(); // put the loop to sleep as promise is not resolve without task

        await task(); // this will be the taskWrapper defined in runTask
      } catch (error) {
        console.log(error);
      }
    }
  }

  async getNextTask() {
    return new Promise((resolve) => {
      if (this.taskQueue.length !== 0) {
        return resolve(this.taskQueue.shift());
      }

      this.consumerQueue.push(resolve); // which is here, resolving line 324
    });
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      const taskWrapper = () => {
        const taskPromise = task();

        taskPromise.then(resolve, reject);

        return taskPromise;
      };

      if (this.consumerQueue.length !== 0) {
        const consumer = this.consumerQueue.shift();
        consumer(taskWrapper); // this will eventually wake the consumer. line 293
      } else {
        this.taskQueue.push(taskWrapper);
      }
    });
  }
}
