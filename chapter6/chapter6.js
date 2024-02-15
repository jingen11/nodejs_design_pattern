// import { promises as fs } from "fs";
// import { gzip } from "zlib";
// import { promisify } from "util";
// const gzipPromise = promisify(gzip);

// const filename = process.argv[2];

// // buffered api approach
// async function main() {
//   const start = Date.now();
//   const data = await fs.readFile(filename);
//   const gzippedData = await gzipPromise(data);
//   await fs.writeFile(`${filename}.gz`, gzippedData);
//   console.log("File successfully compressed", Date.now() - start);
// }

// main();

// // stream approach
// import { createReadStream, createWriteStream } from "fs";
// import { createGzip } from "zlib";

// const start = Date.now();
// createReadStream(filename)
//   .pipe(createGzip())
//   .pipe(createWriteStream(`${filename}.gz`))
//   .on("finish", () =>
//     console.log(`File successfully compressed`, Date.now() - start)
//   );

import { Readable } from "stream";

const mountains = [
  { name: "Everest", height: 8848 },
  { name: "K2", height: 8611 },
  { name: "Kangchenjunga", height: 8586 },
  { name: "Lhotse", height: 8516 },
  { name: "Makalu", height: 8481 },
];

const mountainsStream = Readable.from(mountains);

mountainsStream.on("data", (mountain) => {
  console.log(`${mountain.name.padStart(14)}\t${mountain.height}m`);
});
