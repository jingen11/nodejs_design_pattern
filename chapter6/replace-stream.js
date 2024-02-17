import { Transform } from "stream";

class ReplaceStream extends Transform {
  constructor(searchStr, replaceStr, options) {
    super({ ...options });
    this.searchStr = searchStr;
    this.replaceStr = replaceStr;
    this.tail = "";
  }

  _transform(chunk, encoding, callback) {
    // I am a boy, a, am
    const pieces = (this.tail + chunk).split(this.searchStr); // ["I ", "m ", " boy"] ["I ", " a boy"]
    const lastPiece = pieces[pieces.length - 1]; // " boy" " a boy"
    const tailLen = this.searchStr.length - 1; // 0 1
    this.tail = lastPiece.slice(-tailLen); // "" "y"
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailLen); // " boy"
    this.push(pieces.join(this.replaceStr));
    callback();
  }

  _flush(callback) {
    this.push(this.tail);
    callback();
  }
}

const rs = new ReplaceStream("World", "Node.js");
rs.on("data", (chunk) => console.log(chunk.toString()));

rs.write("Hello W");
rs.write("orld!");
rs.end();

const searchStr = "World";
const replaceStr = "Node.js";
let tail = "";
const replaceStream = new Transform({
  defaultEncoding: "utf8",
  transform(chunk, encoding, cb) {
    const pieces = (tail + chunk).split(searchStr);
    const lastPiece = pieces[pieces.length - 1];
    const tailLen = searchStr.length - 1;
    tail = lastPiece.slice(-tailLen);
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailLen);
    this.push(pieces.join(replaceStr));
    cb();
  },
  flush(cb) {
    this.push(tail);
    cb();
  },
});
