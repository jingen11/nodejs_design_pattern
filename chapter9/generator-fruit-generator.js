function* fruitGenerator() {
  yield "peach";
  yield "watermelon";
  return "summer";
}

const fruitGeneratorObj = fruitGenerator();
console.log(fruitGeneratorObj.next());
console.log(fruitGeneratorObj.next());
console.log(fruitGeneratorObj.next());

for (const fruit of fruitGenerator()) {
  console.log(fruit);
}

function* twoWayGenerator() {
  const what = yield null;
  yield "Hello " + what;
}

const twoWay = twoWayGenerator();
twoWay.next();
console.log(twoWay.next("world"));

function* throwGenerator() {
  try {
    const what = yield null;
    yield "Hello " + what;
  } catch (error) {
    yield "Hello error: " + error.message;
  }
}

console.log("Using throw():");
const twoWayException = throwGenerator();
twoWayException.next();
console.log(twoWayException.throw(new Error("Boom!")));
console.log("Using return():");
const twoWayReturn = throwGenerator();
console.log(twoWayReturn.return("myReturnValue"));
