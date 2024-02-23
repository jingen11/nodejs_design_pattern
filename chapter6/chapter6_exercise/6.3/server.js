import { createServer } from "net";
import { createWriteStream } from "fs";
import { createDecipheriv, scryptSync } from "crypto";

const password = "mypassword";

const key = scryptSync(password, "salt", 24);
const channels = {};

const server = createServer((socket) => {
  console.log("client connected");

  socket.on("readable", function () {
    consumeChunk(socket);
  });

  socket.on("end", () => {
    for (const channel in channels) {
      channels[channel].end();
    }
  });
});

server.listen(3000, () => console.log("server listening on port 3000"));

function consumeChunk(socket) {
  let chunk;

  chunk = socket.read(1);
  const channel = chunk && chunk.readUInt8(0);

  if (channel === null) return null;

  chunk = socket.read(1);
  const isReadStream = chunk && chunk.readUInt8(0);

  if (isReadStream === null) return null;

  if (isReadStream === 1) {
    chunk = socket.read(4);
    const nameLength = chunk && chunk.readUInt32BE(0);

    if (nameLength === null) {
      return null;
    }

    if (!(channel in channels)) {
      chunk = socket.read(nameLength);

      if (chunk === null) return null;
      const write = createWriteStream(`./received_files/${chunk.toString()}`);
      channels[channel] = write;
    }
  } else {
    const iv = socket.read(16);
    chunk = socket.read(4);
    const contentLength = chunk && chunk.readUInt32BE(0);

    if (contentLength === null) {
      return null;
    }

    chunk = socket.read(contentLength);
    if (chunk === null) return null;

    const decipher = createDecipheriv("aes192", key, iv);

    chunk = Buffer.concat([decipher.update(chunk), decipher.final()]);

    channels[channel].write(chunk);

    if (socket.readableLength > 0) {
      // as the socket might concatenate the stream from client when we are sending multiple files, the chunk is not emptied, we need to call this function recursively to consume all of the data in the chunk
      consumeChunk(socket);
    }
  }
}
