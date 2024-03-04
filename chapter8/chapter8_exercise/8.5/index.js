// 8.5 The lazy buffer: Can you implement createLazyBuffer(size), a factory function that generates a virtual proxy for a Buffer of the given size? The proxy instance should instantiate a Buffer object (effectively allocating the given amount of memory) only when write() is being invoked for the first time. If no attempt to write into the buffer is made, no Buffer instance should be created.

function createLazyBuffer(size) {
  let buf = null;
  return new Proxy(
    {},
    {
      get(target, propKey, receiver) {
        if (propKey === "write") {
          if (!buf) target = buf = Buffer.alloc(size);

          return function (...args) {
            return buf.write(...args);
          };
        } else {
          if (!buf) throw new Error("Please write to buffer first");

          return buf[propKey].bind(buf); // this will lost its implementation
        }
      },
    }
  );
}

const test = Buffer.alloc(1024);

console.log(test.toString());

test.write("asdfg");

console.log(test.toString());

const test2 = createLazyBuffer(1024);

// console.log(test2.toString());

test2.write("asdfg");

console.log(test2.toString());
