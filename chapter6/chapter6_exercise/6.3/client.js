import { connect } from "net";
import { createReadStream } from "fs";
import { randomBytes, createCipheriv, scryptSync } from "crypto";
import { Buffer } from "buffer";
import { basename } from "path";

const iv = randomBytes(16);
const password = "mypassword";

const key = scryptSync(password, "salt", 24);
const sources = process.argv.slice(2);

async function createNameStream(socket, source, channel) {
  await new Promise((resolve) => {
    const name = basename(source);
    const nameBuff = Buffer.from(name);

    const outBuff = Buffer.alloc(nameBuff.length + 4 + 1 + 1);
    outBuff.writeUInt8(channel, 0);
    outBuff.writeUInt8(1, 1);
    outBuff.writeUint32BE(nameBuff.length, 2);
    nameBuff.copy(outBuff, 6);

    socket.write(outBuff, () => resolve());
  });
}

const socket = connect(3000, async () => {
  let completed = 0;
  for (let i = 0; i < sources.length; i++) {
    const source = createReadStream(sources[i]);

    const name = basename(sources[i]);
    const nameBuff = Buffer.from(name);

    const outBuff = Buffer.alloc(nameBuff.length + 4 + 1 + 1);
    outBuff.writeUInt8(i, 0);
    outBuff.writeUInt8(1, 1);
    outBuff.writeUint32BE(nameBuff.length, 2);
    nameBuff.copy(outBuff, 6);

    socket.write(outBuff, () => {
      source
        .on("readable", function () {
          let chunk;

          while ((chunk = this.read()) !== null) {
            const cipher = createCipheriv("aes192", key, iv); // cipherkey must be 24 bytes as it is 192 bit

            chunk = cipher.update(chunk);
            chunk = Buffer.concat([chunk, cipher.final()]);

            const outBuff = Buffer.alloc(chunk.length + 4 + 16 + 1 + 1);
            outBuff.writeUInt8(i, 0);
            outBuff.writeUInt8(0, 1);
            iv.copy(outBuff, 2);
            outBuff.writeUint32BE(chunk.length, 18);
            chunk.copy(outBuff, 22);
            console.log(outBuff);
            socket.write(outBuff);
          }
        })
        .on("end", () => {
          if (++completed === sources.length) socket.end();
        });
    });
  }
});
