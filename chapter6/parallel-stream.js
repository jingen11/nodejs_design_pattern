import { Transform, pipeline } from "stream";
import { createReadStream, createWriteStream } from "fs";
import split from "split";
import superagent from "superagent";

class ParallelStream extends Transform {
  constructor(userTransform, opts) {
    super({ objectMode: true, ...opts });
    this.userTransform = userTransform;
    this.running = 0;
    this.terminateCb = null;
  }

  _transform(chunk, enc, done) {
    this.running++;
    this.userTransform(
      chunk,
      enc,
      this.push.bind(this),
      this._onComplete.bind(this)
    );
    done();
  }

  _flush(done) {
    if (this.running > 0) {
      this.terminateCb = done;
    } else {
      done();
    }
  }

  _onComplete(err) {
    this.running--;

    if (err) {
      return this.emit("error", err);
    }

    if (this.running === 0) {
      this.terminateCb && this.terminateCb();
    }
  }
}
const startP = Date.now();
pipeline(
  createReadStream(process.argv[2]),
  split(),
  new ParallelStream(async (url, enc, push, done) => {
    if (!url) {
      return done();
    }

    try {
      await superagent.head(url, { timeout: 5 * 1000 });
      push(`${url} is up\n`);
    } catch (error) {
      push(`${url} is down\n`);
    }

    done();
  }),
  createWriteStream("resultP.txt"),
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("All urls have been checked");
    console.log(`FuntionP took ${Date.now() - startP}ms`);
  }
);
const startS = Date.now();
pipeline(
  createReadStream(process.argv[2]),
  split(),
  new Transform({
    objectMode: true,
    transform(url, enc, done) {
      if (!url) done();

      superagent
        .head(url, { timeout: 5 * 1000 })
        .then(
          () => {
            this.push(`${url} is up\n`);
          },
          () => {
            this.push(`${url} is down\n`);
          }
        )
        .finally(() => done());
    },
  }),

  createWriteStream("resultS.txt"),
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log("All urls have been checked");
    console.log(`FuntionS took ${Date.now() - startS}ms`);
  }
);
