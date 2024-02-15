import { Readable } from "stream";
import Chance from "chance";

const chance = new Chance();

class RandomStream extends Readable {
  constructor(options) {
    super(options);
    this.emittedBytes = 0;
  }

  _read(size) {
    const chunk = chance.string({ length: size });
    this.push(chunk, "utf8");
    this.emittedBytes += chunk.length;
    if (chance.bool({ likelihood: 5 })) {
      this.push(null);
    }
  }
}

const randomStream = new RandomStream();
randomStream
  .on("data", (chunk) => {
    console.log(`Chunk received (${chunk.length} bytes): ${chunk.toString()}`);
  })
  .on("end", () =>
    console.log(`Produced ${randomStream.emittedBytes} bytes of random data`)
  );

const randomStream2 = new Readable({
  read(size) {
    const chunk = chance.string({ length: size });
    this.push(chunk, "utf8");
    if (chance.bool({ likelihood: 4 })) {
      this.push(null);
    }
  },
});
