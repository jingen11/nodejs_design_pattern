const A_CHAR_CODE = 65;
const Z_CHAR_CODE = 90;

function createAlphabetIterator() {
  let curCode = A_CHAR_CODE;

  return {
    next() {
      const currChar = String.fromCharCode(curCode);

      if (curCode > Z_CHAR_CODE) {
        return { done: true };
      }

      curCode++;
      return { value: currChar, done: false };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

const iterator = createAlphabetIterator();
let iteratorResult = iterator.next();

while (!iteratorResult.done) {
  console.log(iteratorResult.value);
  iteratorResult = iterator.next();
}

// iterator to iterable
for (const el of createAlphabetIterator()) {
  console.log(el);
}
