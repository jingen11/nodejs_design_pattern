//  8.2 Timestamped logs: Create a proxy for the console object that enhances every logging function (log(), error(), debug(), and info()) by prepending the current timestamp to the message you want to print in the logs. For instance, executing consoleProxy.log('hello') should print something like 2020-02-18T15:59:30.699Z hello in the console.

const modifiedConsole = new Proxy(console, {
  get(target, propKey, receiver) {
    console.log(propKey === "log");
    if (
      propKey === "log" ||
      propKey === "error" ||
      propKey === "debug" ||
      propKey === "info"
    ) {
      return function (...args) {
        return target[propKey](new Date().toISOString(), ...args);
      };
    } else {
      return target[propKey];
    }
  },
});

modifiedConsole.log("hehe");
