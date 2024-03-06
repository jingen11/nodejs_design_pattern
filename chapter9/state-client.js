import { FailsafeSocket } from "./state-failsafeSocket.js";

const failsafeSocket = new FailsafeSocket({ port: 8000 });
setInterval(() => {
  // send current memory usage
  failsafeSocket.send(process.memoryUsage());
}, 1000);
