export class FailsafeSocket {
  constructor(options) {
    this.options = options;
    this.queue = [];
    this.currentState = null;
    this.socket = null;
    this.states = {
      offline: new OfflineState(this),
      online: new OnlineState(this),
    };
    this.changeState("offline");
  }

  changeState(state) {
    console.log(`Activating state: ${state}`);
    this.currentState = this.states[state];
    this.currentState.activate();
  }

  send(data) {
    this.currentState.send(data);
  }
}

import jsonOverTcp from "json-over-tcp-2";

class OfflineState {
  constructor(failsafeSocket) {
    this.failsafeSocket = failsafeSocket;
  }

  send(data) {
    this.failsafeSocket.queue.push(data);
  }
  activate() {
    const retry = () => {
      setTimeout(() => this.activate, 1000);
    };

    console.log("Trying to connect...");
    this.failsafeSocket.socket = jsonOverTcp.connect(
      this.failsafeSocket.options,
      () => {
        console.log("Connection established");
        this.failsafeSocket.socket.removeListener("error", retry);
        this.failsafeSocket.changeState("online");
      }
    );
    this.failsafeSocket.socket.once("error", retry);
  }
}

class OnlineState {
  constructor(failsafeSocket) {
    this.failsafeSocket = failsafeSocket;
    this.hadDisconnected = false;
  }

  send(data) {
    this.failsafeSocket.queue.push(data);
    this._safeWrite(data);
  }

  _safeWrite(data) {
    this.failsafeSocket.socket.write(data, (err) => {
      if (!this.hadDisconnected && !err) {
        this.failsafeSocket.queue.shift();
      }
    });
  }

  activate() {
    this.hadDisconnected = false;
    for (const data of this.failsafeSocket.queue) {
      this._safeWrite(data);
    }

    this.failsafeSocket.socket.once("error", () => {
      this.hadDisconnected = true;
      this.failsafeSocket.changeState("offline");
    });
  }
}
