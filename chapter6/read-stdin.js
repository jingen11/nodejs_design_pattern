// non-flowing mode
// process.stdin
//   .on("readable", () => {
//     let chunk;
//     console.log("New data available");
//     while ((chunk = process.stdin.read()) !== null) {
//       console.log(chunk);
//       console.log(`Chunk read (${chunk.length} bytes): "${chunk.toString()}"`);
//     }
//   })
//   .on("end", () => console.log("End of stream"))
//   .setEncoding("utf8");

// flowing mode
process.stdin
  .on("data", (chunk) => {
    console.log("New data available");
    console.log(`Chunk read (${chunk.length} bytes): "${chunk.toString()}"`);
  })
  .on("end", () => console.log("End of stream"));
