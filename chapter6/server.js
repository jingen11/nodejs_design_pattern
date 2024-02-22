import { createServer } from "net";
import { createWriteStream } from "fs";

function demultiplexChannel(source, destinations) {
  let currentChannel = null;
  let currentLength = null;

  source
    .on("readable", () => {
      // non flowing mode
      let chunk;
      if (currentChannel === null) {
        chunk = source.read(1);
        currentChannel = chunk && chunk.readUInt8(0);
      }

      if (currentLength === null) {
        chunk = source.read(4);
        currentLength = chunk && chunk.readUInt32BE(0);
        if (currentLength === null) {
          return null;
        }
      }

      chunk = source.read(currentLength);
      if (chunk === null) {
        return null;
      }

      console.log(`Recevied packet from: ${currentChannel}`);
      destinations[currentChannel].write(chunk);
      currentChannel = null;
      currentLength = null;
    })
    .on("end", () => {
      destinations.forEach((destination) => destination.end());
      console.log("Source channel closed");
    });
}

const server = createServer((socket) => {
  const stdoutStream = createWriteStream("stdout.log");
  const stderrStream = createWriteStream("stderr.log");
  demultiplexChannel(socket, [stdoutStream, stderrStream]);
});

server.listen(3000, () => console.log("Server started"));
