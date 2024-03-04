// 8.3 Colored console output: Write a decorator for the console that adds the red(message), yellow(message), and green(message) methods. These methods will have to behave like console.log(message) except they will print the message in red, yellow, or green, respectively. In one of the exercises from the previous chapter, we already pointed you to some useful packages to to create colored console output. If you want to try something different this time, have a look at ansi-styles (nodejsdp.link/ansi-styles).

const decoratedConsole = new Proxy(console, {
  get(target, propKey, receiver) {
    if (propKey === "red") {
      return function (...args) {
        return target.log("\x1b[31m%s\x1b[0m", ...args);
      };
    }
    if (propKey === "yellow") {
      return function (...args) {
        return target.log("\x1b[33m%s\x1b[0m", ...args);
      };
    }
    if (propKey === "green") {
      return function (...args) {
        return target.log("\x1b[32m%s\x1b[0m", ...args);
      };
    }

    return target[propKey];
  },
});

decoratedConsole.yellow("dddddd");
