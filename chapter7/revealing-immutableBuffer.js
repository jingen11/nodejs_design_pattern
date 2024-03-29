const MODIFIER_NAMES = ["swap", "write", "fill"];

class ImmutableBuffer {
  constructor(size, executor) {
    const buffer = Buffer.alloc(size);
    const modifiers = {};

    for (const prop in buffer) {
      if (typeof buffer[prop] !== "function") {
        continue;
      }

      if (MODIFIER_NAMES.some((m) => prop.startsWith(m))) {
        modifiers[prop] = buffer[prop].bind(buffer);
      } else {
        this[prop] = buffer[prop].bind(buffer);
      }
    }
    executor(modifiers);
  }
}

const hello = "Hello!";
const immutable = new ImmutableBuffer(hello.length, ({ write }) => {
  write(hello);
});
console.log(String.fromCharCode(immutable.readInt8(0)));
// the following line will throw
// "TypeError: immutable.write is not a function"
// immutable.write('Hello?')
