class ColorConsole {
  log(text) {
    console.log(text);
  }
}

class RedConsole extends ColorConsole {
  log(text) {
    console.log("\x1b[31m%s\x1b[0m", text);
  }
}

class BlueConsole extends ColorConsole {
  log(text) {
    console.log("\x1b[34m%s\x1b[0m", text);
  }
}

class GreenConsole extends ColorConsole {
  log(text) {
    console.log("\x1b[32m%s\x1b[0m", text);
  }
}

function createConsole(color) {
  if (color === "red") {
    return new RedConsole();
  }
  if (color === "blue") {
    return new BlueConsole();
  }
  if (color === "green") {
    return new GreenConsole();
  }

  return new ColorConsole();
}

const logger = createConsole("blue");
logger.log("hehe");
