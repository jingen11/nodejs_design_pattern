import { EventEmitter } from "events";

class DB extends EventEmitter {
  connected = false;
  commandsQueue = [];

  async query(queryString) {
    if (!this.connected) {
      console.log(`Request queued: ${queryString}`);

      return new Promise((resolve, reject) => {
        const command = () => {
          this.query(queryString).then(resolve, reject);
        };
        this.commandsQueue.push(command);
      });
    }

    console.log(`Query executed: ${queryString}`);
  }

  connect() {
    // simulate the delay of the connection
    setTimeout(() => {
      this.connected = true;
      this.emit("connected");
      this.commandsQueue.forEach((command) => command());
      this.commandsQueue = [];
    }, 500);
  }
}

export const db = new DB();

db.connect();

db.query("assasas1");
db.query("dasdasod22");

// with State Pattern

class InitializedState {
  constructor(db) {
    this.db = db;
  }
  async query(queryString) {
    console.log(`Query executed: ${queryString}`);
  }
}

const METHODS_REQUIRING_CONNECTION = ["query"];
const deactivate = Symbol("deactivate");

class QueuingState {
  constructor(db) {
    this.db = db;
    this.commandsQueue = [];

    METHODS_REQUIRING_CONNECTION.forEach((methodName) => {
      this[methodName] = function (...args) {
        console.log("Command queued:", methodName, args);
        return new Promise((resolve, reject) => {
          const command = () => {
            db[methodName](...args).then(resolve, reject);
          };

          this.commandsQueue.push(command);
        });
      };
    });
  }

  [deactivate]() {
    this.commandsQueue.forEach((command) => command());
    this.commandsQueue = [];
  }
}

class DB2 extends EventEmitter {
  constructor() {
    super();
    this.state = new QueuingState(this);
  }

  async query(queryString) {
    return this.state.query(queryString);
  }

  connect() {
    setTimeout(() => {
      this.connected = true;
      this.emit("connected");
      const oldState = this.state;
      this.state = new InitializedState(this);

      oldState[deactivate] && oldState[deactivate]();
    }, 500);
  }
}
