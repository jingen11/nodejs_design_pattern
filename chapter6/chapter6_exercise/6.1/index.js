import { createReadStream, createWriteStream } from "fs";
import {
  createBrotliCompress,
  createBrotliDecompress,
  createDeflate,
  createInflate,
  createGzip,
  createGunzip,
} from "zlib";
import { PassThrough, pipeline } from "stream";
import { basename } from "path";

class MonitorStream extends PassThrough {
  constructor(options) {
    super(options);
    this.bytesRead = 0;
  }

  _transform(chunk, enc, cb) {
    this.bytesRead += chunk.length;
    this.push(chunk);
    cb();
  }
}
const filename = basename(process.argv[2]);

// Brotli
(() => {
  const start = Date.now();
  const inputMonitor = new MonitorStream();
  const outputMonitor = new MonitorStream();
  pipeline(
    createReadStream(process.argv[2]),
    inputMonitor,
    createBrotliCompress(),
    outputMonitor,
    createWriteStream(`${filename}.br`),
    (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.log(inputMonitor.bytesRead);
      console.log(outputMonitor.bytesRead);
      console.log(
        `Brotli: ${Date.now() - start}ms, ${
          outputMonitor.bytesRead / inputMonitor.bytesRead
        }%`
      );
    }
  );
})();

// Deflate
(() => {
  const start = Date.now();
  const inputMonitor = new MonitorStream();
  const outputMonitor = new MonitorStream();
  pipeline(
    createReadStream(process.argv[2]),
    inputMonitor,
    createDeflate(),
    outputMonitor,
    createWriteStream(`${filename}.zz`),
    (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.log(inputMonitor.bytesRead);
      console.log(outputMonitor.bytesRead);
      console.log(
        `Deflate: ${Date.now() - start}ms, ${
          outputMonitor.bytesRead / inputMonitor.bytesRead
        }%`
      );
    }
  );
})();

// Gzip
(() => {
  const start = Date.now();
  const inputMonitor = new MonitorStream();
  const outputMonitor = new MonitorStream();
  pipeline(
    createReadStream(process.argv[2]),
    inputMonitor,
    createGzip(),
    outputMonitor,
    createWriteStream(`${filename}.gzip`),
    (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      console.log(inputMonitor.bytesRead);
      console.log(outputMonitor.bytesRead);
      console.log(
        `Gzip: ${Date.now() - start}ms, ${
          outputMonitor.bytesRead / inputMonitor.bytesRead
        }%`
      );
    }
  );
})();

// Checker
// pipeline(
//   createReadStream("./video.mp4.br"),
//   createBrotliDecompress(),
//   createWriteStream("./video-br.mp4"),
//   (err) => {}
// );
// pipeline(
//   createReadStream("./video.mp4.zz"),
//   createInflate(),
//   createWriteStream("./video-zz.mp4"),
//   (err) => {}
// );
// pipeline(
//   createReadStream("./video.mp4.gzip"),
//   createGunzip(),
//   createWriteStream("./video-gzip.mp4"),
//   (err) => {}
// );
