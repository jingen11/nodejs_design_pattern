import { createServer } from "http";
import Chance from "chance";

const chance = new Chance();
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  // while (chance.bool({ likelihood: 95 })) {
  //   res.write(`${chance.string()}\n`, () => console.log("every line"));
  // }

  //backpressure
  function generateMore() {
    while (chance.bool({ likelihood: 95 })) {
      const randomChunk = chance.string({ length: 16 * 1024 - 1 });
      const shouldContinue = res.write(`${randomChunk}\n`);
      if (!shouldContinue) {
        console.log("back-pressure");
        return res.once("drain", generateMore);
      }
    }
    res.end("\n\n", () => console.log("All data sent 1"));
  }
  generateMore();
  res.on("finish", () => console.log("All data sent 2"));
});

server.listen(8080, () => {
  console.log("listening on http://localhost:8080");
});
