// stream1
//   .on("error", () => {})
//   .pipe(stream2)
//   .on("error", () => {});

// // Better error handling

// function handleError(err) {
//   console.error(err);
//   stream1.destroy();
//   stream2.destroy();
// }

// stream1.on("error", handleError).pipe(stream2).on("error", handleError);

// using pipeline
import { createGzip, createGunzip } from "zlib";
import { Transform, pipeline } from "stream";

const uppercasify = new Transform({
  transform(chunk, enc, cb) {
    this.push(chunk.toString().toUpperCase());
    cb();
  },
});

pipeline(
  process.stdin,
  createGunzip(),
  uppercasify,
  createGzip(),
  process.stdout,
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  }
);
