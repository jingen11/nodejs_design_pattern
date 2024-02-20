import { createGzip, createGunzip } from "zlib";
import {
  createCipheriv,
  createDecipheriv,
  scryptSync,
  randomBytes,
} from "crypto";
import pumpify from "pumpify";
import { pipeline } from "stream";
import { createReadStream, createWriteStream } from "fs";

function createKey(password) {
  return scryptSync(password, "salt", 24);
}

function createCompressAndEncrypt(password, iv) {
  const key = createKey(password);
  const combinedStream = pumpify(
    createGzip(),
    createCipheriv("aes192", key, iv)
  );
  combinedStream.iv = iv;

  return combinedStream;
}

function createDecryptAndDecompress(password, iv) {
  const key = createKey(password);
  return pumpify(createDecipheriv("aes192", key, iv), createGunzip());
}

const [, , password, source] = process.argv;
const iv = randomBytes(16);
const destination = `${source}.gz.enc`;

pipeline(
  createReadStream(source),
  createCompressAndEncrypt(password, iv),
  createWriteStream(destination),
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`${destination} created with iv: ${iv.toString("hex")}`);
  }
);
