import { createServer } from "http";
import { cpus } from "os";
import cluster from "cluster";
import { once } from "events";

if (cluster.isPrimary) {
  const availableCpus = cpus();
  console.log(`Clustering to ${availableCpus.length} processes`);
  availableCpus.forEach(() => cluster.fork());

  cluster.on("exit", (worker, code) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(
        `Worker ${worker.process.pid} crashed. ` + "Starting a new worker"
      );
      cluster.fork();
    }
  });

  process.on("SIGUSR2", async () => {
    const workers = Object.values(cluster.workers);

    for (const worker of workers) {
      console.log(`stopping worker: ${worker.process.pid}`);
      worker.disconnect();
      await once(worker, "exit");
      if (!worker.exitedAfterDisconnect) continue;
      const newWorker = cluster.fork();
      await once(newWorker, "listening");
    }
  });
} else {
  // setTimeout(() => {
  //   throw new Error("Ooops");
  // }, Math.ceil(Math.random() * 3) * 1000);
  const { pid } = process;
  const server = createServer((req, res) => {
    let i = 1e7;
    while (i > 0) {
      i--;
    }
    console.log(`Handling request from ${pid}`);
    res.end(`Hello from ${pid}\n`);
  });
  server.listen(8080, () => console.log(`Started at ${pid}`));
}
