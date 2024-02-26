import http from "http";

class Queue {
  constructor(executor) {
    this.queue = [];
    this.consumerQueue = [];

    function enqueue(task) {
      console.log("inside enqueue");
      console.log(task);
      this.queue.push(task);

      while (this.consumerQueue.length !== 0 && this.queue.length !== 0) {
        const consumer = this.consumerQueue.shift();
        const res = this.queue.shift();
        consumer(res);
      }
    }

    executor({ enqueue: enqueue.bind(this) });
  }
  dequeue() {
    return new Promise((resolve) => {
      if (this.queue.length !== 0) {
        return resolve(this.queue.shift());
      } else {
        this.consumerQueue.push(resolve);
      }
    });
  }
}

const q = new Queue(({ enqueue }) => {
  const server = http.createServer((req, res) => {
    console.log("client connnected");
    req.setEncoding("utf8");
    let body = "";
    req
      .on("data", (chunk) => {
        body += chunk;
      })
      .on("end", () => {
        enqueue(body);
        console.log("finish read");
        res.writeHead(201, { "Content-Type": "text/plain" });
        res.write("done\n");
        res.end("ok\n");
      });

    res.on("finish", () => console.log("response finish")); //Emitted when the response has been sent. More specifically, this event is emitted when the last segment of the response headers and body have been handed off to the operating system for transmission over the network. It does not imply that the client has received anything yet.
    res.on("close", () => console.log("response close")); // Indicates that the response is completed, or its underlying connection was terminated prematurely (before the response completion).
  });
  server.listen(3000, () => console.log("server listening on port 3000"));
});

console.log(await q.dequeue());
