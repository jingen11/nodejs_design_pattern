import { EventEmitter } from "events";

class DB extends EventEmitter {
  connected = false;

  connect() {
    // simulate the delay of the connection
    setTimeout(() => {
      this.connected = true;
      this.emit("connected");
    }, 500);
  }

  async query(queryString) {
    if (!this.connected) {
      throw new Error("Not connected yet");
    }

    console.log(`Query executed: ${queryString}`);
  }
}

export const db = new DB();

// Local initialization check

import { once } from "events";
db.connect();

async function updateLastAccess() {
  if (!db.connected) {
    await once(db, "connected");
  }

  await db.query(`INSERT (${Date.now()}) INTO "LastAccesses"`);
}

updateLastAccess();
setTimeout(() => {
  updateLastAccess();
}, 600);

// Delayed startup
async function initialize() {
  db.connect();
  await once(db, "connected");
}

async function updateLastAccess2() {
  await db.query(`INSERT (${Date.now()}) INTO "LastAccesses"`);
}

initialize().then(() => {
  updateLastAccess2();
  setTimeout(() => updateLastAccess2(), 600);
});
